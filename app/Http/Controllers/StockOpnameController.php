<?php
namespace App\Http\Controllers;

use App\Models\Bahan;
use App\Models\Produk;
use App\Models\StockOpname;
use App\Models\StockOpnameDetail;
use App\Services\InventoryService; // <-- WAJIB DITAMBAHKAN
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class StockOpnameController extends Controller
{
    public function index()
    {
        // 1. Ambil data Riwayat SO beserta relasi detail bahan & produk untuk Halaman Utama
        $stockOpnames = StockOpname::with(['details.bahan', 'details.produk'])
            ->orderBy('tgl_so', 'desc')
            ->get();

        // 2. Ambil data Bahan Baku & Penolong beserta qty_sistem dari Kartu Persediaan terakhir
        $bahans = Bahan::orderBy('jenis_bahan')->orderBy('nama_bahan')->get()->map(function ($bahan) {
            $lastMutasi = DB::table('t_kartu_persediaan')
                ->where('id_bahan', $bahan->id_bahan)
                ->orderBy('tanggal_transaksi', 'desc')
                ->orderBy('id_kartu', 'desc')
                ->first();

            $bahan->qty_sistem = $lastMutasi ? (float) $lastMutasi->saldo_qty : 0;
            return $bahan;
        });

        // 3. Ambil data Produk Jadi beserta qty_sistem dari Kartu Persediaan terakhir
        $produks = Produk::orderBy('nama_produk')->get()->map(function ($produk) {
            $lastMutasi = DB::table('t_kartu_persediaan')
                ->where('id_produk', $produk->id_produk)
                ->orderBy('tanggal_transaksi', 'desc')
                ->orderBy('id_kartu', 'desc')
                ->first();

            $produk->qty_sistem = $lastMutasi ? (float) $lastMutasi->saldo_qty : 0;
            return $produk;
        });

        // 4. Generate no SO berikutnya untuk Form Input
        $last = StockOpname::orderBy('id_so', 'desc')->first();
        $lastNumber = $last ? (int) substr($last->no_so, 3) : 0;
        $nextNoSo = 'SO-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return Inertia::render('Persediaan/StockOpname', [
            'stockOpnames' => $stockOpnames,
            'bahans'       => $bahans,
            'produks'      => $produks,
            'nextNoSo'     => $nextNoSo,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tgl_so'                    => 'required|date',
            'details'                   => 'required|array|min:1',
            'details.*.id_bahan'        => 'nullable|exists:t_bahan,id_bahan',
            'details.*.id_produk'       => 'nullable|exists:t_produk,id_produk',
            'details.*.qty_sistem'      => 'required|numeric|min:0',
            'details.*.qty_fisik'       => 'required|numeric|min:0',
            'details.*.qty_kadaluarsa'  => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // 1. Buat header SO
            $so = StockOpname::create([
                'no_so'   => StockOpname::generateNoSo(),
                'tgl_so'  => $request->tgl_so,
            ]);

            // 2. Simpan detail SO & Proses Mutasi Kartu Persediaan
            foreach ($request->details as $detail) {
                // Simpan jejak dokumen Stock Opname
                StockOpnameDetail::create([
                    'id_so'           => $so->id_so,
                    'id_bahan'        => $detail['id_bahan'] ?? null,
                    'id_produk'       => $detail['id_produk'] ?? null,
                    'qty_sistem'      => $detail['qty_sistem'],
                    'qty_fisik'       => $detail['qty_fisik'],
                    'qty_kadaluarsa'  => $detail['qty_kadaluarsa'] ?? 0,
                ]);

                // Identifikasi Barang (Bahan Baku atau Produk Jadi)
                $id_item = $detail['id_bahan'] ?? $detail['id_produk'];
                $tipe = isset($detail['id_bahan']) ? 'bahan' : 'produk';
                $kolom_id = isset($detail['id_bahan']) ? 'id_bahan' : 'id_produk';

                // Ambil Nilai HPP (Moving Average) terakhir untuk menjaga kestabilan nilai uang
                $lastMutasi = DB::table('t_kartu_persediaan')
                    ->where($kolom_id, $id_item)
                    ->orderBy('tanggal_transaksi', 'desc')
                    ->orderBy('id_kartu', 'desc')
                    ->first();
                $harga_hpp = $lastMutasi ? (float) $lastMutasi->saldo_harga : 0;

                // Hitung Selisih
                $selisih = (float) $detail['qty_fisik'] - (float) $detail['qty_sistem'];
                $kadaluarsa = (float) ($detail['qty_kadaluarsa'] ?? 0);

                // LOGIKA A: MUTASI SELISIH FISIK VS SISTEM
                if ($selisih > 0) {
                    // FISIK LEBIH BANYAK (Surplus) -> MASUK
                    InventoryService::catatMutasi(
                        $id_item, $tipe, 'MASUK', 'stock_opname', $so->no_so,
                        $selisih, $harga_hpp, $request->tgl_so, 'Penyesuaian Surplus Stock Opname'
                    );
                } elseif ($selisih < 0) {
                    // FISIK LEBIH SEDIKIT (Defisit) -> KELUAR
                    InventoryService::catatMutasi(
                        $id_item, $tipe, 'KELUAR', 'stock_opname', $so->no_so,
                        abs($selisih), 0, $request->tgl_so, 'Penyesuaian Defisit Stock Opname'
                    );
                }

                // LOGIKA B: MUTASI BARANG KADALUARSA (Selalu Mengurangi Stok Fisik)
                if ($kadaluarsa > 0) {
                    InventoryService::catatMutasi(
                        $id_item, $tipe, 'KELUAR', 'stock_opname', $so->no_so,
                        $kadaluarsa, 0, $request->tgl_so, 'Pembuangan Barang Kadaluarsa'
                    );
                }
            }

            DB::commit();
            return redirect()->back();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan: ' . $e->getMessage()]);
        }
    }
}

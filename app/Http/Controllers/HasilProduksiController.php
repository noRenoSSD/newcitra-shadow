<?php

namespace App\Http\Controllers;

use App\Services\InventoryService;
use App\Models\HasilProduksi;
use App\Models\PemakaianBahan;
use App\Models\ApprovalPemakaianBahan; // <-- Import model approval
use App\Models\DetailJadwalProduksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HasilProduksiController extends Controller
{
    public function index()
    {
        // 1. Ambil semua hasil produksi yang sudah selesai untuk ditampilkan di tabel
        $hasilProduksi = HasilProduksi::with(['detailJadwal.produk', 'pemakaianBahan.bahan'])
            ->orderBy('created_at', 'desc')
            ->get();

        // 2. Ambil jadwal produksi yang sudah 'Approved' sebagai sumber form "Tambah Produksi"
        // Kita load kebutuhan_bahan agar data snapshot (standar) tersedia untuk dihitung selisihnya
        $jadwalProduksi = DetailJadwalProduksi::with(['produk', 'kebutuhanBahan.detailBom.bahan'])
            ->whereHas('jadwalProduksi', function($q) {
                $q->where('status_jadwal', 'Approved');
            })
            ->get();

        return Inertia::render('Produksi/HasilProduksi', [
            'hasilProduksi' => $hasilProduksi,
            'jadwalProduksi' => $jadwalProduksi
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_produksi'        => 'required|exists:t_detail_jadwal_produksi,id_produksi',
            'output_aktual'      => 'required|numeric|min:0',
            'tanggal_produksi'   => 'required|date',
            'tanggal_kadaluarsa' => 'required|date',
            'items'              => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            // 1. Simpan Header Hasil Produksi
            $hasil = HasilProduksi::create([
                'id_produksi'        => $request->id_produksi,
                'output_aktual'      => $request->output_aktual,
                'tanggal_produksi'   => $request->tanggal_produksi,
                'tanggal_kadaluarsa' => $request->tanggal_kadaluarsa,
                'status'             => 'Selesai',
            ]);

            $detailJadwal = DetailJadwalProduksi::findOrFail($request->id_produksi);
            $idProduk = $detailJadwal->id_produk;

            // 2. Simpan Detail Pemakaian Bahan & Kurangi Stok Bahan Baku
            foreach ($request->items as $item) {
                $selisih = $item['qty_aktual'] - $item['kalkulasi_standar'];

                $pemakaianBahan = PemakaianBahan::create([
                    'id_hasil_produksi' => $hasil->id_hasil_produksi,
                    'id_bahan'          => $item['id_bahan'],
                    'qty_aktual'        => $item['qty_aktual'],
                    'selisih'           => $selisih,
                ]);

                // ======== 3. INSERT OTOMATIS KE TABEL APPROVAL ========
                // Data ini akan muncul dengan status 'pending' di menu Approval
                ApprovalPemakaianBahan::create([
                    'id_pemakaian'          => $pemakaianBahan->id_pemakaian, // ID yg barusan dibuat

                    // Untuk saat ini di set 1 karena tidak ada field id_kartupers_bahan
                    // di frontend kamu. Sesuaikan jika relasinya berubah.
                    'id_kartupers_bahan'    => 1,

                    // Kita simpan standar dari tabel kebutuhan bahan / input react
                    'qty_standar'           => $item['kalkulasi_standar'],

                    // Harga dibiarkan 0 jika belum ada logika harga saat produksi
                    'harga_standar'         => 0,

                    'qty_aktual'            => $item['qty_aktual'],
                    'harga_ratarata_aktual' => 0,
                    'total_aktual'          => 0,
                    'status_approval'       => 'pending',
                ]);

                // ======== KODE KARTU PERSEDIAAN (BARANG KELUAR) ========
                InventoryService::catatMutasi(
                    $item['id_bahan'],              // Ubah $bahan jadi $item
                    'bahan',                        // Tipe: bahan
                    'KELUAR',                       // Transaksi KELUAR
                    'produksi_keluar',              // Sumbernya dari produksi
                    'PROD-' . $request->id_produksi,// Referensi dari ID produksi
                    $item['qty_aktual'],            // Ubah $bahan jadi $item
                    0,                              // HARGA ISI 0 SAJA!
                    $request->tanggal_produksi,     // Tanggal produksi
                    "Dipakai untuk produksi pabrik"
                );
            }

            DB::commit();
            return redirect()->back()->with('success', 'Data hasil produksi, approval & stok berhasil disimpan!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan: ' . $e->getMessage()]);
        }
    }
}

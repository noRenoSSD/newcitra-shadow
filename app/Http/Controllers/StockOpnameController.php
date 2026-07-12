<?php
namespace App\Http\Controllers;

use App\Models\Bahan;
use App\Models\Produk;
use App\Models\StockOpname;
use App\Models\StockOpnameDetail;
use App\Services\InventoryService; 
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

            // Persiapan Variabel Akumulasi Jurnal Akuntansi
            $idAkunBebanSelisih      = DB::table('t_akun')->where('kode_akun', '6001008')->value('id_akun');
            $idAkunPendapatanSelisih = DB::table('t_akun')->where('kode_akun', '8001000')->value('id_akun');
            $idAkunBahanBaku         = DB::table('t_akun')->where('kode_akun', '1001004')->value('id_akun');
            $idAkunBahanPenolong     = DB::table('t_akun')->where('kode_akun', '1001005')->value('id_akun');
            $idAkunBarangJadi        = DB::table('t_akun')->where('kode_akun', '1001006')->value('id_akun');

            $jurnalRekap = [
                'surplus_debit' => [
                    $idAkunBahanBaku => 0, $idAkunBahanPenolong => 0, $idAkunBarangJadi => 0
                ],
                'defisit_kredit' => [
                    $idAkunBahanBaku => 0, $idAkunBahanPenolong => 0, $idAkunBarangJadi => 0
                ],
                'total_pendapatan' => 0,
                'total_beban'      => 0
            ];

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

                // Identifikasi Barang (Bahan Baku, Bahan Penolong, atau Produk Jadi)
                $id_item = $detail['id_bahan'] ?? $detail['id_produk'];
                $tipe = isset($detail['id_bahan']) ? 'bahan' : 'produk';
                $kolom_id = isset($detail['id_bahan']) ? 'id_bahan' : 'id_produk';

                // Tentukan ID Akun Persediaan yang sesuai untuk Jurnal
                $idAkunPersediaanTarget = null;
                if ($tipe === 'bahan') {
                    $dataBahan = DB::table('t_bahan')->where('id_bahan', $id_item)->first();
                    if ($dataBahan && strtolower($dataBahan->jenis_bahan) === 'baku') {
                        $idAkunPersediaanTarget = $idAkunBahanBaku;
                    } else {
                        $idAkunPersediaanTarget = $idAkunBahanPenolong;
                    }
                } else {
                    $idAkunPersediaanTarget = $idAkunBarangJadi;
                }

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

                    // Akumulasi Jurnal (Debit: Persediaan | Kredit: Pendapatan Lain-lain)
                    $nilaiUang = $selisih * $harga_hpp;
                    $jurnalRekap['surplus_debit'][$idAkunPersediaanTarget] += $nilaiUang;
                    $jurnalRekap['total_pendapatan'] += $nilaiUang;

                } elseif ($selisih < 0) {
                    // FISIK LEBIH SEDIKIT (Defisit) -> KELUAR
                    InventoryService::catatMutasi(
                        $id_item, $tipe, 'KELUAR', 'stock_opname', $so->no_so,
                        abs($selisih), $harga_hpp, $request->tgl_so, 'Penyesuaian Defisit Stock Opname'
                    );

                    // Akumulasi Jurnal (Debit: Beban Selisih | Kredit: Persediaan)
                    $nilaiUang = abs($selisih) * $harga_hpp;
                    $jurnalRekap['defisit_kredit'][$idAkunPersediaanTarget] += $nilaiUang;
                    $jurnalRekap['total_beban'] += $nilaiUang;
                }

                // LOGIKA B: MUTASI BARANG KADALUARSA (Selalu Mengurangi Stok Fisik)
                if ($kadaluarsa > 0) {
                    InventoryService::catatMutasi(
                        $id_item, $tipe, 'KELUAR', 'stock_opname', $so->no_so,
                        $kadaluarsa, $harga_hpp, $request->tgl_so, 'Pembuangan Barang Kadaluarsa'
                    );

                    // Barang Kadaluarsa dihitung sebagai Defisit (Beban)
                    $nilaiUang = $kadaluarsa * $harga_hpp;
                    $jurnalRekap['defisit_kredit'][$idAkunPersediaanTarget] += $nilaiUang;
                    $jurnalRekap['total_beban'] += $nilaiUang;
                }
            }

            // =========================================================================
            // ===== 3. PENCATATAN JURNAL AKUNTANSI OTOMATIS (PENYESUAIAN) =====
            // =========================================================================
            
            // Generate Jurnal jika ada uang yang bergerak
            if ($jurnalRekap['total_pendapatan'] > 0 || $jurnalRekap['total_beban'] > 0) {
                
                $prefixJU = 'JU-' . date('Ym', strtotime($request->tgl_so)) . '-';
                $lastJurnal = DB::table('t_jurnal')
                    ->where('kode_jurnal', 'like', $prefixJU . '%')
                    ->orderBy('kode_jurnal', 'desc')
                    ->first();
                
                $nextNum = $lastJurnal ? (int) explode('-', $lastJurnal->kode_jurnal)[2] + 1 : 1;
                $kodeJurnal = $prefixJU . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

                // Insert Header Jurnal Penyesuaian
                $idJurnal = DB::table('t_jurnal')->insertGetId([
                    'kode_jurnal'    => $kodeJurnal,
                    'tanggal'        => $request->tgl_so,
                    'keterangan'     => "Penyesuaian Stock Opname: " . $so->no_so,
                    'jenis_jurnal'   => 'penyesuaian', // Sengaja dibuat 'penyesuaian' (adjustment)
                    'kode_referensi' => $so->no_so,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                // --- JURNAL SURPLUS ---
                if ($jurnalRekap['total_pendapatan'] > 0) {
                    // [DEBIT] Masing-masing akun Persediaan yang Surplus
                    foreach ($jurnalRekap['surplus_debit'] as $idAkun => $nominal) {
                        if ($nominal > 0) {
                            DB::table('t_jurnal_detail')->insert([
                                'id_jurnal' => $idJurnal, 'id_akun' => $idAkun, 'debit' => $nominal, 'kredit' => 0, 'created_at' => now(), 'updated_at' => now()
                            ]);
                        }
                    }
                    // [KREDIT] Pendapatan Selisih Persediaan
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal' => $idJurnal, 'id_akun' => $idAkunPendapatanSelisih, 'debit' => 0, 'kredit' => $jurnalRekap['total_pendapatan'], 'created_at' => now(), 'updated_at' => now()
                    ]);
                }

                // --- JURNAL DEFISIT / KADALUARSA ---
                if ($jurnalRekap['total_beban'] > 0) {
                    // [DEBIT] Beban Selisih Persediaan
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal' => $idJurnal, 'id_akun' => $idAkunBebanSelisih, 'debit' => $jurnalRekap['total_beban'], 'kredit' => 0, 'created_at' => now(), 'updated_at' => now()
                    ]);
                    // [KREDIT] Masing-masing akun Persediaan yang Defisit/Kadaluarsa
                    foreach ($jurnalRekap['defisit_kredit'] as $idAkun => $nominal) {
                        if ($nominal > 0) {
                            DB::table('t_jurnal_detail')->insert([
                                'id_jurnal' => $idJurnal, 'id_akun' => $idAkun, 'debit' => 0, 'kredit' => $nominal, 'created_at' => now(), 'updated_at' => now()
                            ]);
                        }
                    }
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Stock Opname dan Jurnal Penyesuaian berhasil dicatat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan: ' . $e->getMessage()]);
        }
    }
}
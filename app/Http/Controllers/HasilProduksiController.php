<?php

namespace App\Http\Controllers;

use App\Services\InventoryService;
use App\Models\HasilProduksi;
use App\Models\PemakaianBahan;
use App\Models\ApprovalPemakaianBahan;
use App\Models\DetailJadwalProduksi;
use App\Models\Bahan;
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

        // Gunakan Database Transaction agar jika Jurnal gagal, Stok juga batal terpotong (Konsistensi Data)
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

            // Variabel penampung total nominal untuk Jurnal Akuntansi
            $totalBahanBaku = 0;
            $totalBahanPenolong = 0;

            // 2. Proses per Item Bahan (Looping)
            foreach ($request->items as $item) {
                $selisih = $item['qty_aktual'] - $item['kalkulasi_standar'];

                $pemakaianBahan = PemakaianBahan::create([
                    'id_hasil_produksi' => $hasil->id_hasil_produksi,
                    'id_bahan'          => $item['id_bahan'],
                    'qty_aktual'        => $item['qty_aktual'],
                    'selisih'           => $selisih,
                ]);

                // ======== MENCARI HARGA MOVING AVERAGE TERAKHIR ========
                // Tarik data harga perolehan rata-rata dari mutasi kartu persediaan terakhir
                $kartuTerakhir = DB::table('t_kartu_persediaan')
                    ->where('id_bahan', $item['id_bahan'])
                    ->orderBy('tanggal_transaksi', 'desc')
                    ->orderBy('id_kartu', 'desc')
                    ->first();
                
                $hargaMovingAverage = $kartuTerakhir ? (float) $kartuTerakhir->saldo_harga : 0;
                $totalNilaiPemakaian = $item['qty_aktual'] * $hargaMovingAverage;

                // ======== MENGELOMPOKKAN NOMINAL UNTUK JURNAL ========
                $dataBahan = Bahan::find($item['id_bahan']);
                if ($dataBahan) {
                    if (strtolower($dataBahan->jenis_bahan) === 'baku') {
                        $totalBahanBaku += $totalNilaiPemakaian;
                    } elseif (strtolower($dataBahan->jenis_bahan) === 'penolong') {
                        $totalBahanPenolong += $totalNilaiPemakaian;
                    }
                }

                // ======== INSERT OTOMATIS KE TABEL APPROVAL ========
                ApprovalPemakaianBahan::create([
                    'id_pemakaian'          => $pemakaianBahan->id_pemakaian,
                    'id_kartupers_bahan'    => $kartuTerakhir ? $kartuTerakhir->id_kartu : 1, // Fallback ID jika histori kosong
                    'qty_standar'           => $item['kalkulasi_standar'],
                    'harga_standar'         => $hargaMovingAverage, 
                    'qty_aktual'            => $item['qty_aktual'],
                    'harga_ratarata_aktual' => $hargaMovingAverage, 
                    'total_aktual'          => $totalNilaiPemakaian,
                    'status_approval'       => 'pending',
                ]);

                // ======== CATAT KE KARTU PERSEDIAAN (BARANG KELUAR) ========
                InventoryService::catatMutasi(
                    $item['id_bahan'],              
                    'bahan',                        
                    'KELUAR',                       
                    'produksi_keluar',              
                    'PROD-' . $request->id_produksi,
                    $item['qty_aktual'],            
                    $hargaMovingAverage,            // Nominal Moving Average dimasukkan ke mutasi keluar
                    $request->tanggal_produksi,     
                    "Dipakai untuk produksi pabrik"
                );
            }

            // ======== 3. PEMBUATAN JURNAL AKUNTANSI OTOMATIS ========
            $totalBDP = $totalBahanBaku + $totalBahanPenolong;
            
            // Hanya *generate* jurnal jika ada nilai nominal pemakaian
            if ($totalBDP > 0) {
                // Generate Nomor Jurnal Otomatis (Contoh: JU-202607-001)
                $prefixJU = 'JU-' . date('Ym', strtotime($request->tanggal_produksi)) . '-';
                $lastJurnal = DB::table('t_jurnal')
                    ->where('kode_jurnal', 'like', $prefixJU . '%')
                    ->orderBy('kode_jurnal', 'desc')
                    ->first();
                
                $nextNum = 1;
                if ($lastJurnal) {
                    $parts = explode('-', $lastJurnal->kode_jurnal);
                    $nextNum = (int) end($parts) + 1;
                }
                $kodeJurnal = $prefixJU . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

                // Insert Header Jurnal
                $idJurnal = DB::table('t_jurnal')->insertGetId([
                    'kode_jurnal'    => $kodeJurnal,
                    'tanggal'        => $request->tanggal_produksi,
                    'keterangan'     => "Pemakaian Bahan untuk Produksi PROD-{$request->id_produksi}",
                    'jenis_jurnal'   => 'umum',
                    'kode_referensi' => 'PROD-' . $request->id_produksi,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                // Tarik relasi ID Akun dari Master Akun secara dinamis
                $idAkunBDP = DB::table('t_akun')->where('kode_akun', '1001008')->value('id_akun'); 
                $idAkunBB  = DB::table('t_akun')->where('kode_akun', '1001004')->value('id_akun'); 
                $idAkunBP  = DB::table('t_akun')->where('kode_akun', '1001005')->value('id_akun'); 

                // (A) DEBIT: Persediaan Barang Dalam Proses (BDP)
                DB::table('t_jurnal_detail')->insert([
                    'id_jurnal'  => $idJurnal,
                    'id_akun'    => $idAkunBDP,
                    'debit'      => $totalBDP,
                    'kredit'     => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // (B) KREDIT: Persediaan Bahan Baku (Hanya masuk jika total > 0)
                if ($totalBahanBaku > 0) {
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal'  => $idJurnal,
                        'id_akun'    => $idAkunBB,
                        'debit'      => 0,
                        'kredit'     => $totalBahanBaku,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // (C) KREDIT: Persediaan Bahan Penolong (Hanya masuk jika total > 0)
                if ($totalBahanPenolong > 0) {
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal'  => $idJurnal,
                        'id_akun'    => $idAkunBP,
                        'debit'      => 0,
                        'kredit'     => $totalBahanPenolong,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Jika semua langkah (Header, Approval, Mutasi, Jurnal) sukses, eksekusi penyimpanan ke MySQL
            DB::commit();
            return redirect()->back()->with('success', 'Data hasil produksi, persediaan, & jurnal berhasil dicatat!');

        } catch (\Exception $e) {
            // Batalkan semua eksekusi transaksi jika ada satu saja tabel yang gagal di-insert
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan: ' . $e->getMessage()]);
        }
    }
}
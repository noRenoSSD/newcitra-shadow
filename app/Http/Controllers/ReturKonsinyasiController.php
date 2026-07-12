<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\ReturKonsinyasi;
use App\Models\ReturKonsinyasiDetail;
use App\Models\Produk;
use App\Services\InventoryService;

class ReturKonsinyasiController extends Controller
{
    /**
     * 1. TAMPILAN UTAMA & PENGAMBILAN DATA
     */
    public function index()
    {
        // A. Ambil semua riwayat retur konsinyasi yang sudah pernah dibuat
        $dataRetur = ReturKonsinyasi::query()
            ->join('t_konsinyasi_keluar', 't_retur_konsinyasi.id_konsinyasi_keluar', '=', 't_konsinyasi_keluar.id_konsinyasi_keluar')
            ->join('t_mitra', 't_konsinyasi_keluar.id_mitra', '=', 't_mitra.id_mitra')
            ->select(
                't_retur_konsinyasi.*',
                't_mitra.nama_mitra as nama_toko',
                DB::raw('COALESCE(t_konsinyasi_keluar.no_konsinyasi, t_konsinyasi_keluar.id_konsinyasi_keluar) as no_konsinyasi_keluar')
            )
            ->with(['items.produk']) // Load detail items beserta nama produknya
            ->orderBy('t_retur_konsinyasi.id_retur_konsinyasi', 'desc')
            ->get();

        // B. Ambil data dropdown Dokumen Konsinyasi Keluar yang aktif (untuk form retur baru)
        $dataKonsinyasiKeluar = DB::table('t_konsinyasi_keluar')
            ->join('t_mitra', 't_konsinyasi_keluar.id_mitra', '=', 't_mitra.id_mitra')
            ->select(
                't_konsinyasi_keluar.id_konsinyasi_keluar',
                DB::raw('COALESCE(t_konsinyasi_keluar.no_konsinyasi, t_konsinyasi_keluar.id_konsinyasi_keluar) as no_dokumen'),
                't_mitra.nama_mitra as nama_toko'
            )
            ->get();

        // C. Ambil data list produk bawaan dari setiap dokumen konsinyasi keluar
        $dataProdukKonsinyasi = DB::table('t_konsinyasi_keluar_detail')
            ->join('t_produk', 't_konsinyasi_keluar_detail.id_produk', '=', 't_produk.id_produk')
            ->select(
                't_konsinyasi_keluar_detail.id_konsinyasi_keluar',
                't_produk.id_produk',
                't_produk.kode_produk',
                't_produk.nama_produk',
                't_konsinyasi_keluar_detail.harga_titip as harga',
                't_konsinyasi_keluar_detail.qty as qty_kirim'
            )
            ->get();

        // D. Generate Nomor Retur Otomatis Selanjutnya
        $nextNoRetur = 'RTC-' . date('Ymd') . '-' . sprintf('%04d', ($dataRetur->count() + 1));

        return Inertia::render('Konsinyasi/ReturKonsinyasi', [
            'dataRetur' => $dataRetur,
            'dataKonsinyasiKeluar' => $dataKonsinyasiKeluar,
            'dataProdukKonsinyasi' => $dataProdukKonsinyasi,
            'nextNoRetur' => $nextNoRetur
        ]);
    }

    /**
     * 2. PROSES SIMPAN DATA RETUR, ADJUSTMENT STOK, & PENJURNALAN AKUNTANSI
     */
    public function store(Request $request)
    {
        $request->validate([
            'no_retur_konsinyasi' => 'required|string',
            'tgl_retur_konsinyasi' => 'required|date',
            'id_konsinyasi_keluar' => 'required|integer',
            'items' => 'required|array|min:1',
            'items.*.id_produk' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.kondisi_barang' => 'required|in:Layak,Perlu Perbaikan,Rusak',
            'items.*.keterangan' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $retur = ReturKonsinyasi::create([
                'no_retur_konsinyasi'  => $request->no_retur_konsinyasi,
                'tgl_retur_konsinyasi' => $request->tgl_retur_konsinyasi,
                'id_konsinyasi_keluar' => $request->id_konsinyasi_keluar,
                'total_hpp_retur'      => 0,
                'total_perbaikan'      => 0,
                'total_kerugian'       => 0,
            ]);

            $accumulatedHppRetur   = 0;
            $accumulatedPerbaikan  = 0;
            $accumulatedKerugian   = 0;

            foreach ($request->items as $item) {
                $produk = Produk::findOrFail($item['id_produk']);
                $hppProduk = $produk->hpp ?? 0;

                $estBiayaPerbaikan = $produk->biaya_perbaikan ?? 0;

                // 1. Hitung total HPP masuk (semua kondisi barang)
                $accumulatedHppRetur += ($hppProduk * $item['qty']);

                // 2. Logika akumulasi nominal berdasarkan kondisi
                if ($item['kondisi_barang'] === 'Rusak') {
                    $accumulatedKerugian += ($hppProduk * $item['qty']);
                } elseif ($item['kondisi_barang'] === 'Perlu Perbaikan') {
                    $accumulatedPerbaikan += ($estBiayaPerbaikan * $item['qty']);
                }

                // Simpan detail retur
                ReturKonsinyasiDetail::create([
                    'id_retur_konsinyasi' => $retur->getKey(),
                    'id_produk'           => $item['id_produk'],
                    'qty'                 => $item['qty'],
                    'kondisi_barang'      => $item['kondisi_barang'],
                    'hpp_saat_ini'        => $hppProduk,
                    'biaya_perbaikan'     => $item['kondisi_barang'] === 'Perlu Perbaikan' ? $estBiayaPerbaikan : 0,
                    'nilai_kerugian'      => $item['kondisi_barang'] === 'Rusak' ? $hppProduk : 0,
                    'keterangan'          => $item['keterangan'] ?? null,
                ]);

                // 3. Kembalikan barang ke gudang (Mutasi Masuk) HANYA jika Layak / Perlu Perbaikan
                if (in_array($item['kondisi_barang'], ['Layak', 'Perlu Perbaikan'])) {
                    InventoryService::catatMutasi(
                        $item['id_produk'],                      
                        'produk',                                
                        'MASUK',                                 
                        'retur_konsinyasi',                      
                        $request->no_retur_konsinyasi,           
                        $item['qty'],                            
                        $hppProduk,                              
                        $request->tgl_retur_konsinyasi,          
                        'Retur Konsinyasi dari Mitra - Kondisi: ' . $item['kondisi_barang']
                    );
                }
            }

            // 4. Update total di data induk
            $retur->update([
                'total_hpp_retur' => $accumulatedHppRetur,
                'total_perbaikan' => $accumulatedPerbaikan,
                'total_kerugian'  => $accumulatedKerugian
            ]);

            // =========================================================================
            // ===== 5. PENCATATAN JURNAL AKUNTANSI OTOMATIS =====
            // =========================================================================
            
            // Jurnal dibuat jika ada barang yang diretur ATAU ada biaya perbaikan
            if ($accumulatedHppRetur > 0 || $accumulatedPerbaikan > 0) {
                
                // Generate Kode Jurnal
                $prefixJU = 'JU-' . date('Ym', strtotime($request->tgl_retur_konsinyasi)) . '-';
                $lastJurnal = DB::table('t_jurnal')
                    ->where('kode_jurnal', 'like', $prefixJU . '%')
                    ->orderBy('kode_jurnal', 'desc')
                    ->first();
                
                $nextNum = $lastJurnal ? (int) explode('-', $lastJurnal->kode_jurnal)[2] + 1 : 1;
                $kodeJurnal = $prefixJU . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

                // Insert Header Jurnal
                $idJurnal = DB::table('t_jurnal')->insertGetId([
                    'kode_jurnal'    => $kodeJurnal,
                    'tanggal'        => $request->tgl_retur_konsinyasi,
                    'keterangan'     => "Retur Konsinyasi & Perbaikan: " . $request->no_retur_konsinyasi,
                    'jenis_jurnal'   => 'umum',
                    'kode_referensi' => $request->no_retur_konsinyasi,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                // Identifikasi ID Akun dari Master sesuai Seeder
                $akunKas         = DB::table('t_akun')->where('kode_akun', '1001001')->value('id_akun'); // Kas
                $akunBarangJadi  = DB::table('t_akun')->where('kode_akun', '1001006')->value('id_akun'); // Persediaan Barang Jadi
                $akunKonsinyasi  = DB::table('t_akun')->where('kode_akun', '1001007')->value('id_akun'); // Persediaan Konsinyasi
                $akunKerusakan   = DB::table('t_akun')->where('kode_akun', '6001006')->value('id_akun'); // Beban Kerusakan Barang
                $akunPerbaikan   = DB::table('t_akun')->where('kode_akun', '6001007')->value('id_akun'); // Beban Perbaikan Produk

                $totalLayakDanPerbaikan = $accumulatedHppRetur - $accumulatedKerugian;

                // -------------------------------------------------------------
                // BAGIAN DEBIT
                // -------------------------------------------------------------
                
                // [DEBIT] Persediaan Barang Jadi (Untuk barang Layak & Perlu Perbaikan)
                if ($totalLayakDanPerbaikan > 0) {
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal' => $idJurnal, 'id_akun' => $akunBarangJadi, 'debit' => $totalLayakDanPerbaikan, 'kredit' => 0, 'created_at' => now(), 'updated_at' => now()
                    ]);
                }

                // [DEBIT] Beban Kerusakan Barang (Untuk barang Rusak / Tidak Layak)
                if ($accumulatedKerugian > 0) {
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal' => $idJurnal, 'id_akun' => $akunKerusakan, 'debit' => $accumulatedKerugian, 'kredit' => 0, 'created_at' => now(), 'updated_at' => now()
                    ]);
                }

                // [DEBIT] Beban Perbaikan Produk (Akumulasi biaya servis)
                if ($accumulatedPerbaikan > 0) {
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal' => $idJurnal, 'id_akun' => $akunPerbaikan, 'debit' => $accumulatedPerbaikan, 'kredit' => 0, 'created_at' => now(), 'updated_at' => now()
                    ]);
                }

                // -------------------------------------------------------------
                // BAGIAN KREDIT
                // -------------------------------------------------------------

                // [KREDIT] Persediaan Barang Konsinyasi (Keseluruhan HPP Barang Kembali)
                if ($accumulatedHppRetur > 0) {
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal' => $idJurnal, 'id_akun' => $akunKonsinyasi, 'debit' => 0, 'kredit' => $accumulatedHppRetur, 'created_at' => now(), 'updated_at' => now()
                    ]);
                }

                // [KREDIT] KAS (Langsung memotong uang kas untuk biaya perbaikan)
                if ($accumulatedPerbaikan > 0) {
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal' => $idJurnal, 'id_akun' => $akunKas, 'debit' => 0, 'kredit' => $accumulatedPerbaikan, 'created_at' => now(), 'updated_at' => now()
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('konsinyasi-retur.index')->with('success', 'Retur konsinyasi sukses diproses, stok gudang & jurnal akuntansi telah diperbarui secara otomatis!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal memproses data: ' . $e->getMessage());
        }
    }
}
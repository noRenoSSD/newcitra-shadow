<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\PenjualanKonsinyasi;
use App\Models\PenjualanKonsinyasiDetail;

class PenjualanKonsinyasiController extends Controller
{
    public function index()
    {
        // 1. AMBIL DATA UTAMA 
        $dataPenjualan = PenjualanKonsinyasi::query()
            ->leftJoin('t_mitra', 't_jual_konsinyasi.id_mitra', '=', 't_mitra.id_mitra')
            ->leftJoin('t_konsinyasi_keluar', 't_jual_konsinyasi.id_konsinyasi_keluar', '=', 't_konsinyasi_keluar.id_konsinyasi_keluar')
            ->select(
                't_jual_konsinyasi.*', 
                't_mitra.nama_mitra as nama_toko',
                't_mitra.alamat as alamat_toko', 
                DB::raw('COALESCE(t_konsinyasi_keluar.no_konsinyasi, t_konsinyasi_keluar.id_konsinyasi_keluar) as no_konsinyasi_keluar')
            )
            ->with(['items']) 
            ->orderBy('t_jual_konsinyasi.id_jual_konsinyasi', 'desc')
            ->get();

        // 2. Ambil data untuk dropdown Dokumen Konsinyasi Keluar
        $dataKonsinyasiKeluar = DB::table('t_konsinyasi_keluar')
            ->leftJoin('t_mitra', 't_konsinyasi_keluar.id_mitra', '=', 't_mitra.id_mitra')
            ->select(
                't_konsinyasi_keluar.id_konsinyasi_keluar',
                DB::raw('COALESCE(t_konsinyasi_keluar.no_konsinyasi, t_konsinyasi_keluar.id_konsinyasi_keluar) as no_dokumen'),
                't_konsinyasi_keluar.id_mitra',
                't_mitra.nama_mitra as nama_toko',
                't_mitra.alamat as alamat_toko'
            )
            ->get();

        // 3. Ambil data produk titipan (MENGGUNAKAN HARGA_TITIP)
        $dataProdukKonsinyasi = DB::table('t_konsinyasi_keluar_detail')
            ->join('t_produk', 't_konsinyasi_keluar_detail.id_produk', '=', 't_produk.id_produk')
            ->select(
                't_konsinyasi_keluar_detail.id_konsinyasi_keluar',
                't_produk.id_produk',
                't_produk.kode_produk',
                't_produk.nama_produk',
                't_konsinyasi_keluar_detail.harga_titip as harga_konsinyasi'
            )
            ->get();

        // 4. Generate nomor penjualan otomatis selanjutnya
        $nextNoPenjualan = 'INV-CSG-' . date('Ymd') . '-' . sprintf('%04d', ($dataPenjualan->count() + 1));

        return Inertia::render('Konsinyasi/PenjualanKonsinyasi', [
            'dataPenjualan' => $dataPenjualan,
            'dataKonsinyasiKeluar' => $dataKonsinyasiKeluar,
            'dataProdukKonsinyasi' => $dataProdukKonsinyasi,
            'nextNoPenjualan' => $nextNoPenjualan
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validasi Input Data
        $request->validate([
            'no_penjualan'          => 'required',
            'tgl_penjualan'         => 'required|date',
            'id_konsinyasi_keluar'  => 'required',
            'id_mitra'              => 'required',
            'jenis_pembayaran'      => 'required|in:Tunai,Kredit',
            'termin_hari'           => 'required_if:jenis_pembayaran,Kredit|nullable|integer|min:1',
            'jatuh_tempo_tanggal'   => 'required_if:jenis_pembayaran,Kredit|nullable|date',
            'items'                 => 'required|array|min:1',
        ]);

        // 2. Kalkulasi Tanggal Jatuh Tempo
        $jatuhTempo = null;
        if ($request->jenis_pembayaran === 'Kredit') {
            if ($request->filled('jatuh_tempo_tanggal')) {
                $jatuhTempo = $request->jatuh_tempo_tanggal;
            } else {
                $termin = $request->termin_hari ?? 30; 
                $jatuhTempo = \Carbon\Carbon::parse($request->tgl_penjualan)
                    ->addDays((int)$termin)
                    ->format('Y-m-d');
            }
        }

        DB::beginTransaction();
        try {
            // =================================================================
            // 3. INSERT KE TABEL INDUK PENJUALAN KONSINYASI
            // =================================================================
            $idJualKonsinyasi = DB::table('t_jual_konsinyasi')->insertGetId([
                'no_penjualan'          => $request->no_penjualan,
                'tgl_penjualan'         => $request->tgl_penjualan,
                'id_mitra'              => $request->id_mitra,
                'id_konsinyasi_keluar'  => $request->id_konsinyasi_keluar,
                'total_bayar'           => $request->total_bayar,
                'keterangan'            => $request->keterangan,
                'jenis_pembayaran'      => $request->jenis_pembayaran,
                'hpp_total'             => 0, // Diupdate setelah loop selesai
                'created_at'            => now(),
                'updated_at'            => now()
            ]);

            $totalHppKeseluruhan = 0;
            
            // Variabel Penampung Jurnal Pendapatan Penjualan Berdasarkan Kategori
            $akunPendapatan = [
                '4001001' => 0, // PENJUALAN - TAHU BAKSO
                '4001002' => 0, // PENJUALAN - BANDENG
                '4001003' => 0, // PENJUALAN - OTAK-OTAK
                '4001004' => 0, // PENJUALAN - PEPES
            ];

            // Cari Dokumen Asal untuk Lacak HPP Snapshot
            $konsinyasiKeluar = DB::table('t_konsinyasi_keluar')->where('id_konsinyasi_keluar', $request->id_konsinyasi_keluar)->first();
            $sj = DB::table('t_surat_jalan')->where('id_konsinyasi', $request->id_konsinyasi_keluar)->first();

            // =================================================================
            // 4. INSERT KE TABEL DETAIL & PENGUMPULAN DATA JURNAL
            // =================================================================
            foreach ($request->items as $item) {
                // A. Cari Nilai HPP Asli (Snapshot) Saat Barang Dikirim
                $hppSnapshot = 0;
                
                // Cek mutasi Kartu Persediaan berdasarkan nomor Surat Jalan
                if ($sj) {
                    $mutasiKeluar = DB::table('t_kartu_persediaan')
                        ->where('referensi', $sj->no_surat_jalan)
                        ->where('id_produk', $item['id_produk'])
                        ->first();
                        
                    if ($mutasiKeluar) {
                        $hppSnapshot = $mutasiKeluar->harga; // Nilai HPP yang tercatat saat SJ dibuat
                    }
                }
                
                // Fallback (Jaga-jaga jika mutasi via SJ tidak ditemukan): Ambil saldo HPP terakhir tepat di tanggal pengiriman
                if ($hppSnapshot == 0) {
                    $fallback = DB::table('t_kartu_persediaan')
                        ->where('id_produk', $item['id_produk'])
                        ->where('tanggal_transaksi', '<=', $konsinyasiKeluar->tgl_konsinyasi)
                        ->orderBy('tanggal_transaksi', 'desc')
                        ->orderBy('id_kartu', 'desc')
                        ->first();
                    $hppSnapshot = $fallback ? (float) $fallback->saldo_harga : 0;
                }

                $subtotalHpp = $hppSnapshot * $item['qty_terjual'];
                $totalHppKeseluruhan += $subtotalHpp;

                // B. Identifikasi Kategori Produk Untuk Penjualan
                $produk = DB::table('t_produk')->where('id_produk', $item['id_produk'])->first();
                $namaProd = strtolower($produk->nama_produk ?? '');
                $hargaPenjualan = $item['total_penjualan'];

                if (str_contains($namaProd, 'bandeng')) {
                    $akunPendapatan['4001002'] += $hargaPenjualan;
                } elseif (str_contains($namaProd, 'otak')) {
                    $akunPendapatan['4001003'] += $hargaPenjualan;
                } elseif (str_contains($namaProd, 'pepes')) {
                    $akunPendapatan['4001004'] += $hargaPenjualan;
                } else {
                    $akunPendapatan['4001001'] += $hargaPenjualan; // Default ke Tahu Bakso
                }

                // C. Simpan Detail
                DB::table('t_jual_konsinyasi_detail')->insert([
                    'id_jual_konsinyasi' => $idJualKonsinyasi,
                    'id_produk'          => $item['id_produk'],
                    'qty_terjual'        => $item['qty_terjual'],
                    'harga_jual'         => $item['harga_jual'],
                    'subtotal'           => $item['total_penjualan'],
                    'hpp_satuan'         => $hppSnapshot, // Disimpan untuk historis
                    'created_at'         => now(),
                    'updated_at'         => now()
                ]);
            }

            // Update Total HPP di Induk
            DB::table('t_jual_konsinyasi')
                ->where('id_jual_konsinyasi', $idJualKonsinyasi)
                ->update(['hpp_total' => $totalHppKeseluruhan]);

            // =================================================================
            // 5. GENERATE KARTU PIUTANG OTOMATIS JIKA KREDIT
            // =================================================================
            if ($request->jenis_pembayaran === 'Kredit') {
                $noPiutangOtomatis = 'PTK-' . date('Ymd') . '-' . $idJualKonsinyasi;

                DB::table('t_piutang')->insert([
                    'id_mitra'       => $request->id_mitra,
                    'no_piutang'     => $noPiutangOtomatis,
                    'id_jual'        => $idJualKonsinyasi, 
                    'tgl_piutang'    => $request->tgl_penjualan,
                    'total_piutang'  => $request->total_bayar,
                    'terbayar'       => 0,
                    'sisa_piutang'   => $request->total_bayar,
                    'jt_piutang'     => $jatuhTempo,
                    'status_piutang' => 'Belum Lunas', 
                    'keterangan'     => 'Piutang otomatis dari setoran konsinyasi ' . $request->no_penjualan,
                ]);
            }

            // =================================================================
            // 6. OTOMATISASI JURNAL PENJUALAN KONSINYASI & HPP
            // =================================================================
            
            // Pemetaan ID Akun dari DB
            $idAkunKas           = DB::table('t_akun')->where('kode_akun', '1001001')->value('id_akun'); // KAS
            $idAkunPiutang       = DB::table('t_akun')->where('kode_akun', '1001003')->value('id_akun'); // PIUTANG USAHA
            $idAkunHPP           = DB::table('t_akun')->where('kode_akun', '5001001')->value('id_akun'); // HPP
            $idAkunBdgKonsinyasi = DB::table('t_akun')->where('kode_akun', '1001007')->value('id_akun'); // PERSEDIAAN KONSINYASI

            // Penentuan Kas atau Piutang
            $isTunai = (strtolower($request->jenis_pembayaran) === 'tunai' || strtolower($request->jenis_pembayaran) === 'cash');
            $idAkunDebitUtama = $isTunai ? $idAkunKas : $idAkunPiutang;

            // Header Jurnal
            $idJurnal = DB::table('t_jurnal')->insertGetId([
                'kode_jurnal'    => 'JU-PJK' . date('ymd') . rand(100, 999),
                'tanggal'        => $request->tgl_penjualan,
                'keterangan'     => 'Penjualan Konsinyasi (' . $request->no_penjualan . ')',
                'jenis_jurnal'   => 'umum',
                'kode_referensi' => $request->no_penjualan,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            // --- JURNAL PENJUALAN ---
            if ($request->total_bayar > 0 && $idAkunDebitUtama) {
                // Debit: Kas/Piutang
                DB::table('t_jurnal_detail')->insert([
                    'id_jurnal'  => $idJurnal,
                    'id_akun'    => $idAkunDebitUtama,
                    'debit'      => $request->total_bayar,
                    'kredit'     => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                // Kredit: Pendapatan Penjualan (Tergantung jenis produk)
                foreach ($akunPendapatan as $kodeAkunPenjualan => $totalKreditPenjualan) {
                    if ($totalKreditPenjualan > 0) {
                        $idAkunPdpt = DB::table('t_akun')->where('kode_akun', $kodeAkunPenjualan)->value('id_akun');
                        if ($idAkunPdpt) {
                            DB::table('t_jurnal_detail')->insert([
                                'id_jurnal'  => $idJurnal,
                                'id_akun'    => $idAkunPdpt,
                                'debit'      => 0,
                                'kredit'     => $totalKreditPenjualan,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    }
                }
            }

            // --- JURNAL HPP ---
            if ($totalHppKeseluruhan > 0 && $idAkunHPP && $idAkunBdgKonsinyasi) {
                // Debit: Harga Pokok Penjualan
                DB::table('t_jurnal_detail')->insert([
                    'id_jurnal'  => $idJurnal,
                    'id_akun'    => $idAkunHPP,
                    'debit'      => $totalHppKeseluruhan,
                    'kredit'     => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Kredit: Persediaan Barang Konsinyasi (Pelepasan Aset)
                DB::table('t_jurnal_detail')->insert([
                    'id_jurnal'  => $idJurnal,
                    'id_akun'    => $idAkunBdgKonsinyasi,
                    'debit'      => 0,
                    'kredit'     => $totalHppKeseluruhan,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();
            return redirect()->route('konsinyasi-penjualan.index')->with('success', 'Laporan Penjualan Konsinyasi dan Jurnal Berhasil Disimpan!');

        } catch (\Exception $e) {
            DB::rollback();
            
            // Menampilkan error secara paksa jika terjadi masalah di background
            dd([
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'request' => $request->all()
            ]);

            return redirect()->back()->with('error', 'Gagal menyimpan setoran konsinyasi: ' . $e->getMessage());
        }
    }
}
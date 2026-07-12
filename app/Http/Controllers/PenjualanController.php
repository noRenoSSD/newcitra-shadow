<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Exception;
use App\Services\InventoryService;

class PenjualanController extends Controller
{
    /**
     * 1. Menampilkan Daftar Transaksi Penjualan
     */
    public function index()
    {
        $penjualan = DB::table('t_jual')
            ->join('t_pesanan', 't_jual.id_pesanan', '=', 't_pesanan.id_pesanan')
            ->join('t_mitra', 't_pesanan.id_mitra', '=', 't_mitra.id_mitra')
            ->select(
                't_jual.*',
                't_pesanan.no_pesanan',
                't_mitra.nama_mitra'
            )
            ->orderBy('t_jual.id_jual', 'desc')
            ->get();

        return Inertia::render('Penjualan/Penjualan', [
            'penjualan' => $penjualan
        ]);
    }

    /**
     * 2. Menyimpan Data Hasil Generate Invoice ke t_jual & t_jual_detail BESERTA JURNALNYA
     */
    public function storeInvoice(Request $request)
    {
        $idPesanan = $request->id_pesanan;

        $noInvoice = $request->no_invoice ?? ('INV-' . date('Ymd') . '-' . $idPesanan);
        $tglInvoice = $request->tgl_invoice ?? date('Y-m-d');
        $metodePembayaran = $request->metode_pembayaran ?? 'Tunai';

        DB::beginTransaction();
        try {
            // AMBIL DATA PESANAN UNTUK MENGETAHUI JENIS PENJUALANNYA
            $pesananAsli = DB::table('t_pesanan')->where('id_pesanan', $idPesanan)->first();
            $jenisPenjualan = $pesananAsli->jenis_transaksi ?? 'Grosir';

            // AMBIL DETAIL DARI t_pesanan_detail (Di-join dengan produk agar tahu nama produknya untuk Jurnal)
            $items = DB::table('t_pesanan_detail')
                ->join('t_produk', 't_pesanan_detail.id_produk', '=', 't_produk.id_produk')
                ->where('id_pesanan', $idPesanan)
                ->select('t_pesanan_detail.*', 't_produk.nama_produk')
                ->get();
            
            $akumulasiSubtotalKotor = 0;
            $akumulasiTotalDiskonRupiah = 0;

            // Wadah Rekap Jurnal Pendapatan Berdasarkan Kategori Produk
            $akunPendapatan = [
                '4001001' => 0, // PENJUALAN - TAHU BAKSO
                '4001002' => 0, // PENJUALAN - BANDENG
                '4001003' => 0, // PENJUALAN - OTAK-OTAK
                '4001004' => 0, // PENJUALAN - PEPES
            ];

            // Hitung subtotal kotor dan diskon rupiah per baris item
            foreach ($items as $item) {
                $itemArray = (array) $item;
                $qty = $itemArray['qty_pesanan'] ?? $itemArray['qty'] ?? 1;
                $qty = $qty > 0 ? $qty : 1;

                $hargaAsli = $itemArray['harga'] ?? $itemArray['harga_satuan'] ?? $itemArray['harga_jual'] ?? $itemArray['harga_pesanan'] ?? 0;
                
                // Cari total kotor per item sebelum diskon
                $hargaKotorBaris = $hargaAsli * $qty;
                
                // Hitung rupiah diskon dari persen yang ada di item
                $persenDiskon = $itemArray['diskon'] ?? 0;
                $diskonRupiahBaris = $hargaKotorBaris * ($persenDiskon / 100);

                $akumulasiSubtotalKotor += $hargaKotorBaris;
                $akumulasiTotalDiskonRupiah += $diskonRupiahBaris;

                // -----------------------------------------------------------
                // LOGIKA DETEKSI KODE AKUN PENJUALAN BERDASARKAN NAMA PRODUK
                // -----------------------------------------------------------
                $namaProd = strtolower($item->nama_produk);
                if (str_contains($namaProd, 'bandeng')) {
                    $akunPendapatan['4001002'] += $hargaKotorBaris;
                } elseif (str_contains($namaProd, 'otak')) {
                    $akunPendapatan['4001003'] += $hargaKotorBaris;
                } elseif (str_contains($namaProd, 'pepes')) {
                    $akunPendapatan['4001004'] += $hargaKotorBaris;
                } else {
                    // Default masuk ke Tahu Bakso jika tidak terdeteksi
                    $akunPendapatan['4001001'] += $hargaKotorBaris; 
                }
            }

            // Hitung Grand Total Bersih
            $calculatedGrandTotal = $akumulasiSubtotalKotor - $akumulasiTotalDiskonRupiah;

            // 1. INSERT KE TABEL INDUK (t_jual)
            $idJual = DB::table('t_jual')->insertGetId([
                'no_jual'           => $noInvoice,
                'tgl_jual'          => $tglInvoice,
                'id_pesanan'        => $idPesanan,
                'jenis_penjualan'   => $jenisPenjualan,
                'metode_pembayaran' => $metodePembayaran,
                'subtotal'          => $akumulasiSubtotalKotor,      // Subtotal SEBELUM diskon
                'total_diskon'      => $akumulasiTotalDiskonRupiah,  // Nilai Rupiah diskon
                'total_hpp'         => 0, // Akan diupdate di akhir loop
                'grand_total'       => $calculatedGrandTotal,        // Nilai bersih setelah diskon
                'created_at'        => now(),
                'updated_at'        => now()
            ]);

            $totalHppInvoice = 0;

            // 2. INSERT KE TABEL DETAIL & POTONG STOK
            foreach ($items as $item) {
                $itemArray = (array) $item;

                $qty = $itemArray['qty_pesanan'] ?? $itemArray['qty'] ?? 1;
                $qty = $qty > 0 ? $qty : 1;

                $hargaAsli = $itemArray['harga'] ?? $itemArray['harga_satuan'] ?? $itemArray['harga_jual'] ?? $itemArray['harga_pesanan'] ?? 0;
                $subtotal = $itemArray['subtotal'] ?? $itemArray['total_harga'] ?? ($hargaAsli * $qty);

                if ($hargaAsli == 0 && $subtotal > 0) {
                    $hargaAsli = $subtotal / $qty;
                }

                // A. Ambil saldo_harga (HPP) terakhir dari kartu persediaan
                $lastSaldo = DB::table('t_kartu_persediaan')
                    ->where('id_produk', $item->id_produk)
                    ->orderBy('tanggal_transaksi', 'desc')
                    ->orderBy('id_kartu', 'desc')
                    ->first();

                $hppSatuan = $lastSaldo ? (float) $lastSaldo->saldo_harga : 0;
                $subtotalHpp = $hppSatuan * $qty;
                $totalHppInvoice += $subtotalHpp;

                // B. Simpan ke t_jual_detail
                DB::table('t_jual_detail')->insert([
                    'id_jual'    => $idJual,
                    'id_produk'  => $item->id_produk,
                    'harga'      => $hargaAsli,
                    'qty_jual'   => $qty,
                    'hpp_satuan' => $hppSatuan,
                    'diskon'     => $itemArray['diskon'] ?? 0, 
                    'subtotal'   => $subtotal,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // C. Potong stok lewat InventoryService
                InventoryService::catatMutasi(
                    $item->id_produk,
                    'produk',
                    'KELUAR',
                    'penjualan',
                    $noInvoice,
                    $qty,
                    0,
                    $tglInvoice,
                    "Penjualan Produk (No. Invoice: {$noInvoice})"
                );
            }

            // 3. Update kolom total_hpp di tabel induk t_jual
            DB::table('t_jual')->where('id_jual', $idJual)->update([
                'total_hpp' => $totalHppInvoice
            ]);

            // 4. LOGIKA OTOMATIS GENERATE KARTU PIUTANG JIKA KREDIT
            if ($metodePembayaran === 'Kredit' && $pesananAsli) {
                $noPiutangOtomatis = 'PUT-' . date('Ymd') . '-' . $idJual;

                if ($request->has('termin_hari') && !empty($request->termin_hari)) {
                    $terminHari = (int) $request->termin_hari;
                    $calculatedJatuhTempo = date('Y-m-d', strtotime($tglInvoice . " + {$terminHari} days"));
                } else {
                    $calculatedJatuhTempo = $request->jatuh_tempo_tanggal ?? date('Y-m-d', strtotime($tglInvoice . ' + 30 days'));
                }

                DB::table('t_piutang')->insert([
                    'id_mitra'       => $pesananAsli->id_mitra,
                    'no_piutang'     => $noPiutangOtomatis,
                    'id_jual'        => $idJual,
                    'tgl_piutang'    => $tglInvoice,
                    'total_piutang'  => $calculatedGrandTotal, // Piutang dicatat sebesar Grand Total Bersih
                    'terbayar'       => 0,
                    'sisa_piutang'   => $calculatedGrandTotal,
                    'jt_piutang'     => $calculatedJatuhTempo,
                    'status_piutang' => 'Belum Lunas',
                    'keterangan'     => 'Piutang otomatis dari invoice ' . $noInvoice,
                ]);
            }

            // =================================================================
            // 5. OTOMATISASI JURNAL PENJUALAN & HPP
            // =================================================================
            
            // Kode Akun dari Seeder
            $kodeKas            = '1001001'; // KAS
            $kodePiutang        = '1001003'; // PIUTANG USAHA
            $kodeDiskonJual     = '4001006'; // DISKON PENJUALAN
            $kodeHPP            = '5001001'; // HARGA POKOK PENJUALAN (HPP)
            $kodePersediaanJadi = '1001006'; // PERSEDIAAN BARANG JADI

            // Ambil ID Akun Utama
            $idAkunKas      = DB::table('t_akun')->where('kode_akun', $kodeKas)->value('id_akun');
            $idAkunPiutang  = DB::table('t_akun')->where('kode_akun', $kodePiutang)->value('id_akun');
            $idAkunDiskon   = DB::table('t_akun')->where('kode_akun', $kodeDiskonJual)->value('id_akun');
            $idAkunHPP      = DB::table('t_akun')->where('kode_akun', $kodeHPP)->value('id_akun');
            $idAkunBdgJadi  = DB::table('t_akun')->where('kode_akun', $kodePersediaanJadi)->value('id_akun');

            // Tentukan apakah masuk ke KAS atau PIUTANG (berdasarkan metode)
            $isTunai = (strtolower($metodePembayaran) === 'tunai' || strtolower($metodePembayaran) === 'cash');
            $idAkunDebitUtama = $isTunai ? $idAkunKas : $idAkunPiutang;

            // A. BUAT HEADER JURNAL UMUM
            $idJurnal = DB::table('t_jurnal')->insertGetId([
                'kode_jurnal'    => 'JU-PJ' . date('ymd') . rand(100, 999),
                'tanggal'        => $tglInvoice,
                'keterangan'     => 'Penjualan Barang Jadi (' . $noInvoice . ')',
                'jenis_jurnal'   => 'umum',
                'kode_referensi' => $noInvoice,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            // --- BAGIAN 1: JURNAL PENJUALAN ---
            
            // B. DEBIT: Kas / Piutang Usaha (Sebesar Uang Bersih yg diterima/ditagih)
            if ($calculatedGrandTotal > 0 && $idAkunDebitUtama) {
                DB::table('t_jurnal_detail')->insert([
                    'id_jurnal' => $idJurnal,
                    'id_akun'   => $idAkunDebitUtama,
                    'debit'     => $calculatedGrandTotal,
                    'kredit'    => 0,
                    'created_at'=> now(),
                    'updated_at'=> now(),
                ]);
            }

            // C. DEBIT: Diskon Penjualan (Jika Ada Diskon)
            if ($akumulasiTotalDiskonRupiah > 0 && $idAkunDiskon) {
                DB::table('t_jurnal_detail')->insert([
                    'id_jurnal' => $idJurnal,
                    'id_akun'   => $idAkunDiskon,
                    'debit'     => $akumulasiTotalDiskonRupiah,
                    'kredit'    => 0,
                    'created_at'=> now(),
                    'updated_at'=> now(),
                ]);
            }

            // D. KREDIT: Pendapatan Penjualan (Di-loop sesuai akumulasi Kategori Produk tadi)
            foreach ($akunPendapatan as $kodeAkunPenjualan => $totalKreditPenjualan) {
                if ($totalKreditPenjualan > 0) {
                    $idAkunPdpt = DB::table('t_akun')->where('kode_akun', $kodeAkunPenjualan)->value('id_akun');
                    if ($idAkunPdpt) {
                        DB::table('t_jurnal_detail')->insert([
                            'id_jurnal' => $idJurnal,
                            'id_akun'   => $idAkunPdpt,
                            'debit'     => 0,
                            'kredit'    => $totalKreditPenjualan,
                            'created_at'=> now(),
                            'updated_at'=> now(),
                        ]);
                    }
                }
            }

            // --- BAGIAN 2: JURNAL HPP ---
            if ($totalHppInvoice > 0) {
                // E. DEBIT: Harga Pokok Penjualan (HPP)
                if ($idAkunHPP) {
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal' => $idJurnal,
                        'id_akun'   => $idAkunHPP,
                        'debit'     => $totalHppInvoice,
                        'kredit'    => 0,
                        'created_at'=> now(),
                        'updated_at'=> now(),
                    ]);
                }

                // F. KREDIT: Persediaan Barang Jadi Berkurang
                if ($idAkunBdgJadi) {
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal' => $idJurnal,
                        'id_akun'   => $idAkunBdgJadi,
                        'debit'     => 0,
                        'kredit'    => $totalHppInvoice,
                        'created_at'=> now(),
                        'updated_at'=> now(),
                    ]);
                }
            }

            DB::commit();
            return redirect('/transaksi-penjualan')->with('success', 'Transaksi Penjualan & Jurnal Otomatis Berhasil Disimpan!');

        } catch (Exception $e) {
            DB::rollback();
            dd('Waduh database crash lagi: ' . $e->getMessage());
        }
    }

    /**
     * 3. Menampilkan Detail Rincian Barang per Invoice
     */
    public function show($id)
    {
        $invoice = DB::table('t_jual')
            ->join('t_pesanan', 't_jual.id_pesanan', '=', 't_pesanan.id_pesanan')
            ->join('t_mitra', 't_pesanan.id_mitra', '=', 't_mitra.id_mitra')
            ->select('t_jual.*', 't_pesanan.no_pesanan', 't_mitra.nama_mitra', 't_mitra.alamat as alamat_mitra')
            ->where('t_jual.id_jual', $id)
            ->first();

        if (!$invoice) {
            abort(404, 'Invoice tidak ditemukan.');
        }

        $items = DB::table('t_jual_detail')
            ->join('t_produk', 't_jual_detail.id_produk', '=', 't_produk.id_produk')
            ->select(
                't_produk.nama_produk',
                't_jual_detail.id_produk',
                't_jual_detail.qty_jual',
                't_jual_detail.harga',
                't_jual_detail.harga as harga_jual_satuan',
                't_jual_detail.hpp_satuan',
                't_jual_detail.diskon',
                't_jual_detail.subtotal'
            )
            ->where('t_jual_detail.id_jual', $id)
            ->get();

        $invoice->items = $items;

        return Inertia::render('Penjualan/PenjualanDetail', [
            'invoice' => $invoice
        ]);
    }
}
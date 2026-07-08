<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Exception;

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
     * 2. Menyimpan Data Hasil Generate Invoice ke t_jual & t_jual_detail
     */
    public function storeInvoice(Request $request)
    {
        $idPesanan = $request->id_pesanan;
        
        $noInvoice = $request->no_invoice ?? ('INV-' . date('Ymd') . '-' . $idPesanan);
        $tglInvoice = $request->tgl_invoice ?? date('Y-m-d');
        $totalHarga = $request->total_harga ?? 0;
        $metodePembayaran = $request->metode_pembayaran ?? 'Tunai';

        DB::beginTransaction();
        try {
            // AMBIL DATA PESANAN TERLEBIH DAHULU UNTUK MENGETAHUI JENIS PENJUALANNYA
            $pesananAsli = DB::table('t_pesanan')->where('id_pesanan', $idPesanan)->first();
            
            // Fallback ke 'Grosir' jika karena suatu hal kolom jenis_penjualan di t_pesanan kosong
            $jenisPenjualan = $pesananAsli->jenis_transaksi ?? 'Grosir';

            // 1. INSERT KE TABEL INDUK (t_jual)
            $idJual = DB::table('t_jual')->insertGetId([
                'no_jual'           => $noInvoice,
                'tgl_jual'          => $tglInvoice,
                'id_pesanan'        => $idPesanan,
                'jenis_penjualan'   => $jenisPenjualan, // Sekarang dinamis mengambil dari t_pesanan
                'metode_pembayaran' => $metodePembayaran,       
                'subtotal'          => $totalHarga,
                'total_diskon'      => 0,
                'total_hpp'         => 0,
                'grand_total'       => $totalHarga,
                'created_at'        => now(),
                'updated_at'        => now()
            ]);

            // 2. AMBIL DETAIL DARI t_pesanan_detail
            $items = DB::table('t_pesanan_detail')->where('id_pesanan', $idPesanan)->get();
            
            foreach ($items as $item) {
                // Konversi objek ke array untuk mengantisipasi variasi pemanggilan data
                $itemArray = (array) $item;

                // Ambil qty pesanan (mencari field qty_pesanan atau qty)
                $qty = $itemArray['qty_pesanan'] ?? $itemArray['qty'] ?? 1;
                $qty = $qty > 0 ? $qty : 1;

                // Ambil harga murni langsung dari t_pesanan_detail 
                $hargaAsli = $itemArray['harga'] 
                    ?? $itemArray['harga_satuan'] 
                    ?? $itemArray['harga_jual'] 
                    ?? $itemArray['harga_pesanan'] 
                    ?? 0;

                // Ambil subtotal baris
                $subtotal = $itemArray['subtotal'] ?? $itemArray['total_harga'] ?? ($hargaAsli * $qty);

                // Jika hargaAsli masih 0 tapi subtotal ada, kita hitung manual
                if ($hargaAsli == 0 && $subtotal > 0) {
                    $hargaAsli = $subtotal / $qty;
                }

                DB::table('t_jual_detail')->insert([
                    'id_jual'    => $idJual,
                    'id_produk'  => $item->id_produk,
                    'harga'      => $hargaAsli, 
                    'qty_jual'   => $qty,
                    'hpp_satuan' => 0, 
                    'diskon'     => $itemArray['diskon'] ?? 0,
                    'subtotal'   => $subtotal,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            // ─── 3. LOGIKA OTOMATIS GENERATE KARTU PIUTANG JIKA KREDIT ───
            if ($metodePembayaran === 'Kredit') {
                if ($pesananAsli) {
                    // Generate nomor piutang otomatis
                    $noPiutangOtomatis = 'PUT-' . date('Ymd') . '-' . $idJual;

                    // HITUNG JATUH TEMPO DINAMIS BERDASARKAN HARI (Contoh: 20 hari dari tgl_jual)
                    // Jika frontend mengirim 'termin_hari' (misal: 20), pakai itu. Jika kosong, default 30 hari.
                    if ($request->has('termin_hari') && !empty($request->termin_hari)) {
                        $terminHari = (int) $request->termin_hari;
                        $calculatedJatuhTempo = date('Y-m-d', strtotime($tglInvoice . " + {$terminHari} days"));
                    } else {
                        // Backup fallback jika tidak pakai jumlah hari, melainkan langsung input tanggal mentah
                        $calculatedJatuhTempo = $request->jatuh_tempo_tanggal ?? date('Y-m-d', strtotime($tglInvoice . ' + 30 days'));
                    }

                    DB::table('t_piutang')->insert([
                        'id_mitra'       => $pesananAsli->id_mitra,
                        'no_piutang'     => $noPiutangOtomatis,
                        'id_jual'        => $idJual,
                        'tgl_piutang'    => $tglInvoice,
                        'total_piutang'  => $totalHarga,
                        'terbayar'       => 0,
                        'sisa_piutang'   => $totalHarga,
                        'jt_piutang' => $request->jatuh_tempo_tanggal ?? date('Y-m-d', strtotime($tglInvoice . ' + 30 days')),
                        'status_piutang' => 'Belum Lunas', 
                        'keterangan'     => 'Piutang otomatis dari invoice ' . $noInvoice,
                    ]);
                }
            }
            // ─────────────────────────────────────────────────────────────

            DB::commit();

            return redirect('/transaksi-penjualan')->with('success', 'Transaksi Penjualan Berhasil Disimpan!');

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
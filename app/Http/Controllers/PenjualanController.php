<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PenjualanController extends Controller
{
    /**
     * 1. Menampilkan Daftar Transaksi Penjualan
     */
    public function index()
    {
        // Mengambil data dari t_jual digabung dengan data pesanan dan mitra pelanggan
        $penjualan = DB::table('t_jual')
            ->join('t_pesanan', 't_jual.id_pesanan', '=', 't_pesanan.id_pesanan')
            ->join('t_mitra', 't_pesanan.id_mitra', '=', 't_mitra.id_mitra') // Sesuaikan jika nama tabel mitramu berbeda
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
     * 2. Menyimpan Data Hasil Generate Invoice ke t_jual & t_detail_jual
     */
public function storeInvoice(Request $request)
    {
        $idPesanan = $request->id_pesanan;
        
        $noInvoice = $request->no_invoice ?? ('INV-' . date('Ymd') . '-' . $idPesanan);
        $tglInvoice = $request->tgl_invoice ?? date('Y-m-d');
        $totalHarga = $request->total_harga ?? 0;

        DB::beginTransaction();
        try {
            // 1. INSERT KE TABEL INDUK (t_jual)
            $idJual = DB::table('t_jual')->insertGetId([
                'no_jual'           => $noInvoice,
                'tgl_jual'          => $tglInvoice,
                'id_pesanan'        => $idPesanan,
                'jenis_penjualan'   => 'Grosir',      
                'metode_pembayaran' => $request->metode_pembayaran ?? 'Tunai',       
                'subtotal'          => $totalHarga,
                'total_diskon'      => 0,
                'total_hpp'         => 0,
                'grand_total'       => $totalHarga,
                'created_at'        => now(),
                'updated_at'        => now()
            ]);

            // 2. AMBIL DETAIL DARI t_pesanan_detail (Pastikan kolom id_harga ikut ditarik)
            $items = DB::table('t_pesanan_detail')->where('id_pesanan', $idPesanan)->get();
            
            foreach ($items as $item) {
                DB::table('t_detail_jual')->insert([
                    'id_jual'     => $idJual,
                    'id_produk'   => $item->id_produk,
                    
                    // --- SEKARANG ID_HARGA SUDAH DIMASUKKAN ---
                    // Mengambil id_harga dari detail pesanan milikmu, jika tidak ada pakai $item->id_harga_produk
                    'id_harga'    => $item->id_harga ?? $item->id_harga_produk ?? 1, 
                    
                    'qty_jual'    => $item->qty ?? $item->qty_pesanan ?? 1,
                    'hpp_satuan'  => 0, 
                    'diskon'      => 0,
                    'subtotal'    => $item->subtotal ?? 0,
                    'created_at'  => now(),
                    'updated_at'  => now()
                ]);
            }

            DB::commit();

            // 3. SELESAI & LEMPAR KE HALAMAN TRANSAKSI
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
        // Ambil data utama t_jual
        $invoice = DB::table('t_jual')
            ->join('t_pesanan', 't_jual.id_pesanan', '=', 't_pesanan.id_pesanan')
            ->join('t_mitra', 't_pesanan.id_mitra', '=', 't_mitra.id_mitra')
            ->select('t_jual.*', 't_pesanan.no_pesanan', 't_mitra.nama_mitra', 't_mitra.alamat as alamat_mitra')
            ->where('t_jual.id_jual', $id)
            ->first();

        if (!$invoice) {
            abort(404, 'Invoice tidak ditemukan.');
        }

        // Ambil rincian item barang dari t_detail_jual gabung ke t_produk
        $items = DB::table('t_detail_jual')
            ->join('t_produk', 't_detail_jual.id_produk', '=', 't_produk.id_produk')
            ->select(
                't_produk.nama_produk',
                't_detail_jual.qty_jual',
                't_detail_jual.hpp_satuan',
                't_detail_jual.diskon',
                't_detail_jual.subtotal',
                DB::raw('(t_detail_jual.subtotal + t_detail_jual.diskon) / t_detail_jual.qty_jual as harga_jual_satuan')
            )
            ->where('t_detail_jual.id_jual', $id)
            ->get();

        // Masukkan array items ke dalam objek invoice utama agar sesuai interface React
        $invoice->items = $items;

        return Inertia::render('Penjualan/PenjualanDetail', [
            'invoice' => $invoice
        ]);
    }
}
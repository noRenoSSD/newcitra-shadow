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
        $request->validate([
            'id_pesanan' => 'required',
            'metode_pembayaran' => 'required',
        ]);

        $idPesanan = $request->id_pesanan;
        //  1. VALIDASI DUPLIKASI: Cek apakah id_pesanan ini sudah ada di tabel t_jual
        $sudahAdaInvoice = DB::table('t_jual')->where('id_pesanan', $idPesanan)->first();

        if ($sudahAdaInvoice) {
            // Jika sudah ada, kembalikan user ke halaman sebelumnya dengan membawa pesan error/gagal
            return redirect()->back()->with('error', "Pesanan ini sudah pernah dibuatkan Invoice sebelumnya dengan nomor {$sudahAdaInvoice->no_jual}!");
        }

        // Kode proses insert database kamu yang kemarin di bawah ini tetap utuh...
        DB::transaction(function () use ($request, $idPesanan) {
            $pesanan = DB::table('t_pesanan')->where('id_pesanan', $idPesanan)->first();
            if (!$pesanan) {
                abort(404, 'Data Pesanan tidak ditemukan.');
            }
        });

        return redirect()->route('transaksi-penjualan.index')->with('success', 'Transaksi Penjualan Berhasil Disimpan!');
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
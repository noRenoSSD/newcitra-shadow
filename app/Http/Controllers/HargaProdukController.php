<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Produk;
use App\Models\HargaProduk;
use Inertia\Inertia;

class HargaProdukController extends Controller
{
    /**
     * Menampilkan halaman utama
     */
    public function index()
    {
        return Inertia::render('NamaFileUIKamu', [
            // Eager loading menggunakan relasi 'harga_produk' dari model Produk Anda
            'produk' => Produk::with('harga_produk')->get()
        ]);
    }

    /**
     * Menangani Request dari Route::post('/harga-produk')
     */
    public function store(Request $request)
    {
        // 1. Ambil ID Harga dari UI (UI Anda mengirimnya dengan nama 'id_harga')
        $id_harga_dari_ui = $request->input('id_harga');

        // PERCABANGAN 1: Jika ada ID Harga, jalankan proses UPDATE
        if ($id_harga_dari_ui !== null && $id_harga_dari_ui !== '') {
            
            $validated = $request->validate([
                'kode_harga'      => 'required|string',
                'jenis_transaksi' => 'required|string',
                'harga'           => 'required|numeric|min:0',
            ]);

            // Cari di database menggunakan primary key asli Anda yaitu 'id_harga_produk'
            $hargaProduk = HargaProduk::where('id_harga_produk', $id_harga_dari_ui)->firstOrFail();
            
            $hargaProduk->update([
                'kode_harga'      => $validated['kode_harga'],
                'jenis_transaksi' => $validated['jenis_transaksi'],
                'harga'           => $validated['harga'],
            ]);

            return redirect()->back()->with('message', 'Varian harga berhasil diperbarui!');
        } 
        
        // PERCABANGAN 2: Jika tidak ada ID Harga, jalankan proses SIMPAN BARU
        else {
            
            $validated = $request->validate([
                'id_produk'       => 'required',
                'kode_harga'      => 'required|string',
                'jenis_transaksi' => 'required|string',
                'harga'           => 'required|numeric|min:0',
            ]);

            // Simpan sesuai dengan isi $fillable di Model t_harga_produk Anda
            // (id_harga_produk tidak perlu diisi karena auto-increment)
            HargaProduk::create([
                'id_produk'       => $validated['id_produk'],
                'kode_harga'      => $validated['kode_harga'],
                'jenis_transaksi' => $validated['jenis_transaksi'],
                'harga'           => $validated['harga'],
            ]);

            return redirect()->back()->with('message', 'Varian harga baru berhasil disimpan!');
        }
    }

    /**
     * Menangani Request dari Route::delete('/harga-produk/{id}')
     */
    public function destroy($id)
    {
        // Cari berdasarkan kolom primary key asli 'id_harga_produk' menggunakan parameter {id} dari route
        $harga = HargaProduk::where('id_harga_produk', $id)->firstOrFail();
        $harga->delete();

        return redirect()->back()->with('message', 'Varian harga berhasil dihapus!');
    }
}
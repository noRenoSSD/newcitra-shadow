<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdukController extends Controller
{
    /**
     * Menampilkan halaman utama master produk
     */
    public function index()
    {
        // Ambil produk beserta relasi harga_produk-nya (Eager Loading)
        $produk = Produk::with('harga_produk')->latest()->get();

        return Inertia::render('Master/Produk', [
            'produk' => $produk
        ]);
    }

    /**
     * Menyimpan produk baru (Otomatis menangkap kode_produk PRD-XXX)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_produk'   => 'required|string|unique:t_produk,kode_produk',
            'nama_produk'   => 'required|string|max:255',
            'satuan_produk' => 'required|string|max:50',
        ]);

        Produk::create($validated);

        // Redirect back otomatis merefresh props 'produk' di React secara real-time
        return redirect()->back()->with('success', 'Produk berhasil ditambahkan!');
    }

    /**
     * Mengupdate data produk
     */
    public function update(Request $request, $id)
    {
        $produk = Produk::findOrFail($id);

        $validated = $request->validate([
            'kode_produk'   => 'required|string|unique:t_produk,kode_produk,' . $id . ',id_produk',
            'nama_produk'   => 'required|string|max:255',
            'satuan_produk' => 'required|string|max:50',
        ]);

        $produk->update($validated);

        return redirect()->back()->with('success', 'Produk berhasil diperbarui!');
    }

    /**
     * Menghapus produk beserta seluruh varian harganya
     */
    public function destroy($id)
    {
        $produk = Produk::findOrFail($id);
        
        // Jika di database belum diset Cascade Delete, kita hapus manual relasi harganya
        if ($produk->harga_produk()) {
            $produk->harga_produk()->delete();
        }
        
        $produk->delete();

        return redirect()->back()->with('success', 'Produk dan data harga berhasil dihapus!');
    }
}
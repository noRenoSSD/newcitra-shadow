<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdukController extends Controller
{
    public function index()
    {
        $produks = Produk::orderBy('id_produk', 'desc')->get();
        return Inertia::render('Master/ProdukJadi', [
            'produks' => $produks
        ]);
    }

    public function store(Request $request)
    {
        Produk::create($request->validate([
            'kode_produk' => 'required|string|max:20',
            'nama_produk' => 'required|string|max:100',
            'satuan_produk' => 'required|string|max:20',
        ]));
        return redirect()->back();
    }

    public function update(Request $request, int $id)
    {
        $produk = Produk::findOrFail($id);
        $produk->update($request->validate([
            'kode_produk' => 'required|string|max:20',
            'nama_produk' => 'required|string|max:100',
            'satuan_produk' => 'required|string|max:20',
        ]));
        return redirect()->back();
    }

    public function destroy(int $id)
    {
        Produk::findOrFail($id)->delete();
        return redirect()->back();
    }
}

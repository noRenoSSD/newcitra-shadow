<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Inertia\Inertia;

class ProdukController extends Controller
{
    public function index()
    {
        $produk = Produk::with('hargaProduk.mitra')->get();

        return Inertia::render('Master/Produk', [
            'produk' => $produk
        ]);
    }
}
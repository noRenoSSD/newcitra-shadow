<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanCalkController extends Controller
{
    public function index(Request $request)
    {
        // Nantinya query database CALK yang asli ditaruh di sini.
        // Untuk sekarang, kita render saja halaman React-nya.
        return Inertia::render('Laporan/CALK');
    }
}
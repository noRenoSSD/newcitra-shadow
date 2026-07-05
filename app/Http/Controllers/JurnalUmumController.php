<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Jurnal;
use Inertia\Inertia;

class JurnalUmumController extends Controller
{
    public function index()
    {
        // Mengambil semua jurnal umum beserta detail dan akunnya
        $jurnals = Jurnal::with(['detail.akun'])
                    ->where('jenis_jurnal', 'umum')
                    ->orderBy('tanggal', 'desc')
                    ->get();

        return Inertia::render('Keuangan/JurnalUmum', [
            'jurnals' => $jurnals
        ]);
    }
}
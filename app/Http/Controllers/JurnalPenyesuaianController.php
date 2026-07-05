<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Jurnal;
use Inertia\Inertia;

class JurnalPenyesuaianController extends Controller
{
    public function index()
    {
        // Mengambil semua jurnal penyesuaian beserta detail dan akunnya
        $jurnals = Jurnal::with(['detail.akun'])
                    ->where('jenis_jurnal', 'penyesuaian')
                    ->orderBy('tanggal', 'desc')
                    ->get();

        return Inertia::render('Keuangan/JurnalPenyesuaian', [
            'jurnals' => $jurnals
        ]);
    }
}
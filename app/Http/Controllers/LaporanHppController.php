<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LaporanHppController extends Controller
{
    public function index(Request $request)
    {
        $bulan = $request->input('bulan', date('n'));
        $tahun = $request->input('tahun', date('Y'));

        // Menggunakan JOIN ke t_hasil_produksi agar memfilter berdasarkan tanggal barang selesai
        $dataHpp = DB::table('t_cogm as c')
            ->join('t_hasil_produksi as hp', 'c.id_produksi', '=', 'hp.id_produksi')
            ->whereMonth('hp.tanggal_produksi', $bulan)
            ->whereYear('hp.tanggal_produksi', $tahun)
            ->selectRaw('
                SUM(c.total_bbb) as total_bbb,
                SUM(c.total_btkl) as total_btkl,
                SUM(c.total_bop) as total_bop
            ')
            ->first();

        $laporanData = [
            'biayaBB' => (float) ($dataHpp->total_bbb ?? 0),
            'biayaTK' => (float) ($dataHpp->total_btkl ?? 0),
            'biayaOH' => (float) ($dataHpp->total_bop ?? 0),
        ];

        return Inertia::render('Laporan/LaporanHargaPokokProduksi', [
            'laporanData' => $laporanData,
            'filterBulan' => (int) $bulan,
            'filterTahun' => (int) $tahun,
        ]);
    }
}
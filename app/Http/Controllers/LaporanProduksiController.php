<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class LaporanProduksiController extends Controller
{
    public function index()
    {
        // Melakukan JOIN ke 4 tabel sesuai dengan struktur asli database-mu
        $dataRaw = DB::table('t_detail_jadwal_produksi as djp')
            ->join('t_produk as p', 'djp.id_produk', '=', 'p.id_produk')
            ->leftJoin('t_hasil_produksi as hp', 'djp.id_produksi', '=', 'hp.id_produksi')
            ->leftJoin('t_cogm as c', 'djp.id_produksi', '=', 'c.id_produksi')
            ->select(
                'djp.kode_produksi',
                'hp.tanggal_produksi',
                'djp.qty_rencana',
                'djp.catatan',
                'p.kode_produk',
                'p.nama_produk',
                'p.satuan_produk',    // Sesuai migration t_produk
                'hp.output_aktual',   // Sesuai migration t_hasil_produksi
                'c.total_bbb',
                'c.total_btkl',
                'c.total_bop'
            )
            ->orderBy('djp.tanggal_produksi', 'desc')
            ->get();

        // MAPPING DATA: Menyesuaikan dengan format yang ditangkap React (LaporanProduksi.tsx)
        $laporanData = $dataRaw->map(function ($item) {
            return [
                'noProduksi'    => $item->kode_produksi,
                'tanggalISO'    => $item->tanggal_produksi,
                'tanggalLabel'  => Carbon::parse($item->tanggal_produksi)->translatedFormat('d M Y'),
                'kodeProduk'    => $item->kode_produk,
                'namaProduk'    => $item->nama_produk,
                'qtyRencana'    => (int) $item->qty_rencana,
                // Mengambil nilai output_aktual, jika null (belum selesai) maka 0
                'qtyRealisasi'  => (int) ($item->output_aktual ?? 0), 
                // Mengambil satuan_produk
                'satuan'        => $item->satuan_produk ?? '-',
                'totalBiayaBB'  => (float) ($item->total_bbb ?? 0),
                'totalBiayaTK'  => (float) ($item->total_btkl ?? 0),
                'totalOverhead' => (float) ($item->total_bop ?? 0),
                'catatan'       => $item->catatan ?? '-',
            ];
        });

        return Inertia::render('Laporan/LaporanProduksi', [
            'laporanData' => $laporanData
        ]);
    }
}
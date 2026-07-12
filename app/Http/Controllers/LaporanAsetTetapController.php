<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class LaporanAsetTetapController extends Controller
{
    private array $bulanMap = [
        'Januari'   => 1,  'Februari'  => 2,  'Maret'     => 3,
        'April'     => 4,  'Mei'       => 5,  'Juni'      => 6,
        'Juli'      => 7,  'Agustus'   => 8,  'September' => 9,
        'Oktober'   => 10, 'November'  => 11, 'Desember'  => 12,
    ];

    public function index(Request $request)
    {
        // 1. Tentukan Bulan & Tahun dari filter (Default ke bulan & tahun saat ini)
        $bulanAngkaSekarang = date('n');
        $bulanNamaSekarang  = array_flip($this->bulanMap)[$bulanAngkaSekarang] ?? 'Januari';
        
        $bulan = $request->input('bulan', $bulanNamaSekarang);
        $tahun = $request->input('tahun', date('Y'));

        // 2. Format periode menjadi 'YYYY-MM-01' untuk dicocokkan ke database
        $bulanNum = $this->bulanMap[$bulan] ?? date('n');
        $periodeStr = Carbon::create($tahun, $bulanNum, 1)->startOfMonth()->toDateString();

        // 3. Ambil data asli dari database: JOIN t_aset & t_penyusutan_aset
        $dataAset = DB::table('t_aset as a')
            ->join('t_penyusutan_aset as pa', 'a.id_aset', '=', 'pa.id_aset')
            ->where('pa.periode', $periodeStr)
            ->select(
                'a.kode_aset',
                'a.nama_aset',
                'a.tipe_aset',
                'a.tanggal_beli',
                'a.harga_perolehan',
                'pa.nilai_penyusutan',
                'pa.akumulasi_penyusutan',
                'pa.nilai_buku'
            )
            ->orderBy('a.kode_aset', 'asc') // MENGURUTKAN KODE ASET (Terkecil ke Terbesar)
            ->get();

        // 4. Mapping data untuk React
        $mappedData = $dataAset->map(function ($item) {
            return [
                'kodeAset'            => $item->kode_aset,
                'namaAset'            => $item->nama_aset,
                'tipeAset'            => $item->tipe_aset,
                'tanggalBeli'         => $item->tanggal_beli,
                'hargaPerolehan'      => (float) $item->harga_perolehan,
                'penyusutanPerBulan'  => (float) $item->nilai_penyusutan,
                'akumulasiPenyusutan' => (float) $item->akumulasi_penyusutan,
                'nilaiBuku'           => (float) $item->nilai_buku,
            ];
        });

        return Inertia::render('Laporan/LaporanAsetTetap', [
            'asetData'    => $mappedData,
            'filterBulan' => $bulan,
            'filterTahun' => (string) $tahun,
        ]);
    }
}
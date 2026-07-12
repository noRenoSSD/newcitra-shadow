<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class LaporanPosisiKeuanganController extends Controller
{
    public function index(Request $request)
    {
        // 1. Tangkap parameter bulan & tahun (Default: Bulan/Tahun saat ini)
        $bulan = $request->input('bulan', date('n'));
        $tahun = $request->input('tahun', date('Y'));
        
        $lastDay = Carbon::create($tahun, $bulan)->endOfMonth()->toDateString();
        $firstDayOfYear = Carbon::create($tahun, 1, 1)->toDateString();

        // 2. Tarik semua data Akun & gabungkan dengan total mutasi Jurnal (Kumulatif)
        $akunBalances = DB::table('t_akun as a')
            ->leftJoin('t_jurnal_detail as jd', 'a.id_akun', '=', 'jd.id_akun')
            ->leftJoin('t_jurnal as j', 'jd.id_jurnal', '=', 'j.id_jurnal')
            ->select(
                'a.id_akun',
                'a.kode_akun',
                'a.nama_akun',
                'a.kategori',
                'a.saldo_normal',
                'a.saldo_awal',
                // Filter tanggal langsung di dalam SUM agar mutasi akurat
                DB::raw("COALESCE(SUM(CASE WHEN j.tanggal <= '$lastDay' THEN jd.debit ELSE 0 END), 0) as total_debit"),
                DB::raw("COALESCE(SUM(CASE WHEN j.tanggal <= '$lastDay' THEN jd.kredit ELSE 0 END), 0) as total_kredit")
            )
            ->groupBy('a.id_akun', 'a.kode_akun', 'a.nama_akun', 'a.kategori', 'a.saldo_normal', 'a.saldo_awal')
            ->orderBy('a.kode_akun', 'asc')
            ->get();

        $asetLancar = [];
        $asetTetap  = [];
        $liabilitas = [];
        $ekuitas    = [];

        // 3. Distribusikan ke Kategori Masing-masing
        foreach ($akunBalances as $akun) {
            // Hitung Mutasi Berdasarkan Saldo Normal
            $mutasi = $akun->saldo_normal === 'Debit' 
                ? ($akun->total_debit - $akun->total_kredit) 
                : ($akun->total_kredit - $akun->total_debit);
            
            $saldoAkhir = $akun->saldo_awal + $mutasi;

            $item = [
                'kode'  => $akun->kode_akun,
                'nama'  => $akun->nama_akun,
                'saldo' => (float) $saldoAkhir
            ];

            if ($akun->kategori === 'Aset Lancar') {
                $asetLancar[] = $item;
            } elseif ($akun->kategori === 'Aset Tetap') {
                $asetTetap[] = $item;
            } elseif ($akun->kategori === 'Liabilitas') {
                $liabilitas[] = $item;
            } elseif ($akun->kategori === 'Ekuitas') {
                $ekuitas[] = $item;
            }
        }

        // 4. Hitung Laba Periode Berjalan (Tahun berjalan hingga bulan terpilih)
        $labaBerjalanRaw = DB::table('t_akun as a')
            ->join('t_jurnal_detail as jd', 'a.id_akun', '=', 'jd.id_akun')
            ->join('t_jurnal as j', 'jd.id_jurnal', '=', 'j.id_jurnal')
            ->whereBetween('j.tanggal', [$firstDayOfYear, $lastDay])
            ->whereIn('a.kategori', ['Pendapatan', 'Penghasilan Lain-lain', 'Beban Pokok Penjualan', 'Beban Operasional', 'Beban Lain-lain'])
            ->select(
                'a.kategori',
                DB::raw('SUM(jd.debit) as debit'),
                DB::raw('SUM(jd.kredit) as kredit')
            )
            ->groupBy('a.kategori')
            ->get();

        $pendapatan = 0; $beban = 0;
        foreach ($labaBerjalanRaw as $row) {
            if (in_array($row->kategori, ['Pendapatan', 'Penghasilan Lain-lain'])) {
                $pendapatan += ($row->kredit - $row->debit);
            } else {
                $beban += ($row->debit - $row->kredit);
            }
        }
        $labaPeriodeBerjalan = $pendapatan - $beban;

        // Tambahkan Laba Berjalan ke Ekuitas
        $ekuitas[] = [
            'kode'  => '-',
            'nama'  => 'LABA PERIODE BERJALAN',
            'saldo' => (float) $labaPeriodeBerjalan
        ];

        // 5. Susun Response Data
        $dataPosisiKeuangan = [
            'periode'    => Carbon::create($tahun, $bulan)->translatedFormat('F Y'),
            'tanggal'    => Carbon::create($tahun, $bulan)->endOfMonth()->translatedFormat('d F Y'),
            'asetLancar' => $asetLancar,
            'asetTetap'  => $asetTetap,
            'liabilitas' => $liabilitas,
            'ekuitas'    => $ekuitas,
        ];

        return Inertia::render('Laporan/LaporanPosisiKeuangan', [
            'dataKeuangan' => $dataPosisiKeuangan,
            'filterBulan'  => (int)$bulan,
            'filterTahun'  => (int)$tahun,
        ]);
    }
}
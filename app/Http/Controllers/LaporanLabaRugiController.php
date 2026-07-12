<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LaporanLabaRugiController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Tangkap parameter bulan & tahun dari React, default ke bulan & tahun ini
            $bulan = $request->input('bulan', date('n'));
            $tahun = $request->input('tahun', date('Y'));

            // 1. Ambil SEMUA akun yang khusus masuk ke Laba Rugi saja (diurutkan berdasarkan kode akun)
            $akunLabaRugi = DB::table('t_akun')
                ->whereIn('kategori', [
                    'Pendapatan', 
                    'Beban Pokok Penjualan', 
                    'Beban Operasional', 
                    'Penghasilan Lain-lain', 
                    'Beban Lain-lain'
                ])
                ->orderBy('kode_akun', 'asc')
                ->get();

            // 2. Ambil mutasi jurnal hanya untuk bulan & tahun yang dipilih
            $mutasiJurnal = DB::table('t_jurnal_detail')
                ->join('t_jurnal', 't_jurnal_detail.id_jurnal', '=', 't_jurnal.id_jurnal')
                ->whereMonth('t_jurnal.tanggal', $bulan)
                ->whereYear('t_jurnal.tanggal', $tahun)
                ->select(
                    't_jurnal_detail.id_akun',
                    DB::raw('SUM(t_jurnal_detail.debit) as total_debit'),
                    DB::raw('SUM(t_jurnal_detail.kredit) as total_kredit')
                )
                ->groupBy('t_jurnal_detail.id_akun')
                ->get()
                ->keyBy('id_akun'); // Ubah jadi key-value array berdasarkan id_akun untuk mempermudah pencocokan

            // Siapkan keranjang kosong untuk masing-masing kategori
            $laporan = [
                'pendapatan'       => [],
                'hpp'              => [],
                'bebanOperasional' => [],
                'penghasilanLain'  => [],
                'bebanLain'        => [],
            ];

            // 3. Masukkan data ke masing-masing keranjang
            foreach ($akunLabaRugi as $akun) {
                // Cek apakah akun ini ada transaksinya di jurnal pada bulan ini
                $jurnal = $mutasiJurnal->get($akun->id_akun);
                
                $total_debit = $jurnal ? $jurnal->total_debit : 0;
                $total_kredit = $jurnal ? $jurnal->total_kredit : 0;

                // Hitung nilai akhir berdasarkan saldo normal
                if ($akun->saldo_normal === 'Debit') {
                    $nilai = $total_debit - $total_kredit;
                } else {
                    $nilai = $total_kredit - $total_debit;
                }

                // KITA HAPUS "if ($nilai == 0) continue;" agar akun bernilai 0 tetap masuk

                $format = [
                    'label' => $akun->nama_akun,
                    'nilai' => (float) $nilai
                ];

                $kategori = strtolower($akun->kategori);

                // Kelompokkan ke array berdasarkan kategori
                if (str_contains($kategori, 'pendapatan') && !str_contains($kategori, 'lain')) {
                    $laporan['pendapatan'][] = $format;
                } elseif (str_contains($kategori, 'beban pokok') || str_contains($kategori, 'hpp')) {
                    $laporan['hpp'][] = $format;
                } elseif (str_contains($kategori, 'beban operasional')) {
                    $laporan['bebanOperasional'][] = $format;
                } elseif (str_contains($kategori, 'penghasilan lain')) {
                    $laporan['penghasilanLain'][] = $format;
                } elseif (str_contains($kategori, 'beban lain')) {
                    $laporan['bebanLain'][] = $format;
                }
            }

            // Kirim data ke tampilan React
            return Inertia::render('Laporan/LaporanLabaRugi', [
                'dataLaporan' => $laporan,
                'filters'     => [
                    'bulan' => (int) $bulan,
                    'tahun' => (int) $tahun
                ],
                'error' => null
            ]);

        } catch (\Exception $e) {
            return Inertia::render('Laporan/LaporanLabaRugi', [
                'dataLaporan' => [
                    'pendapatan' => [], 'hpp' => [], 'bebanOperasional' => [], 'penghasilanLain' => [], 'bebanLain' => []
                ],
                'filters' => [
                    'bulan' => (int) $request->input('bulan', date('n')),
                    'tahun' => (int) $request->input('tahun', date('Y'))
                ],
                'error' => 'Gagal memuat data: ' . $e->getMessage()
            ]);
        }
    }
}
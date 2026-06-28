<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JadwalProduksiSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Tabel Jadwal Produksi
        $jadwal = DB::table('t_jadwal_produksi')->updateOrInsert(
            ['kode_jadwal' => 'JDW-2026-0001'], // Acuan cek duplikat
            [
                'periode'        => 'Februari 2026',
                'tanggal_dibuat' => '2026-01-28',
                'jumlah_produksi'=> 3,
                'status_jadwal'  => 'Approved',
                'komentar_owner' => 'Disetujui sesuai kapasitas produksi.',
                'created_at'     => '2026-06-28 10:19:35',
                'updated_at'     => '2026-06-28 14:13:30'
            ]
        );

        $idJadwal = DB::table('t_jadwal_produksi')->where('kode_jadwal', 'JDW-2026-0001')->value('id_jadwal');

        // 2. Seed Tabel Detail Jadwal Produksi
        $detailData = [
            ['kode' => 'PRD-2026-001', 'id_p' => 1, 'id_b' => 1, 'tgl' => '2026-02-02', 'qty' => 800, 'cat' => 'Tahu bakso nyoba doang'],
            ['kode' => 'PRD-2026-002', 'id_p' => 6, 'id_b' => 2, 'tgl' => '2026-02-03', 'qty' => 700, 'cat' => 'bandeng mantap'],
            ['kode' => 'PRD-2026-003', 'id_p' => 1, 'id_b' => 2, 'tgl' => '2026-02-15', 'qty' => 400, 'cat' => 'enak pol'],
        ];

        foreach ($detailData as $d) {
            DB::table('t_detail_jadwal_produksi')->updateOrInsert(
                ['kode_produksi' => $d['kode']], // Acuan cek duplikat
                [
                    'id_jadwal'        => $idJadwal,
                    'id_produk'        => $d['id_p'],
                    'id_bom'           => $d['id_b'],
                    'tanggal_produksi' => $d['tgl'],
                    'qty_rencana'      => $d['qty'],
                    'catatan'          => $d['cat'],
                    'created_at'       => '2026-06-28 14:13:10',
                    'updated_at'       => '2026-06-28 14:13:10'
                ]
            );

            // 3. Seed Tabel Kebutuhan Bahan (spesifik untuk PRD-2026-001)
            if ($d['kode'] === 'PRD-2026-001') {
                $idDetail = DB::table('t_detail_jadwal_produksi')->where('kode_produksi', 'PRD-2026-001')->value('id_produksi');
                
                $kebutuhan = [
                    ['id_detail_bom' => 1, 'qty_snapshot' => 5.0, 'qty_kebutuhan' => 10.0],
                    ['id_detail_bom' => 2, 'qty_snapshot' => 7.0, 'qty_kebutuhan' => 14.0],
                ];

                foreach ($kebutuhan as $k) {
                    DB::table('t_kebutuhan_bahan')->updateOrInsert(
                        ['id_produksi' => $idDetail, 'id_detail_bom' => $k['id_detail_bom']],
                        [
                            'qty_bahan_snapshot' => $k['qty_snapshot'],
                            'qty_kebutuhan'      => $k['qty_kebutuhan'],
                            'created_at'         => '2026-06-28 14:35:30',
                            'updated_at'         => '2026-06-28 14:35:30'
                        ]
                    );
                }
            }
        }
    }
}
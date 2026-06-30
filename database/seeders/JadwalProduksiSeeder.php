<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JadwalProduksiSeeder extends Seeder
{
    public function run(): void
    {
        // ══════════════════════════════════════════════════════════════════════
        // 1. t_jadwal_produksi  (2 baris)
        // ══════════════════════════════════════════════════════════════════════
        $jadwals = [
            [
                'kode_jadwal'     => 'JDW-2026-0001',
                'periode'         => 'Februari 2026',
                'tanggal_dibuat'  => '2026-01-28',
                'jumlah_produksi' => 3,
                'status_jadwal'   => 'Approved',
                'komentar_owner'  => 'Disetujui sesuai kapasitas produksi.',
                'created_at'      => '2026-06-28 10:19:35',
                'updated_at'      => '2026-06-28 14:13:30',
            ],
            [
                'kode_jadwal'     => 'JDW-2026-0002',
                'periode'         => 'Maret 2026',
                'tanggal_dibuat'  => '2026-02-25',
                'jumlah_produksi' => 4,
                'status_jadwal'   => 'Pending Approval',
                'komentar_owner'  => null,
                'created_at'      => '2026-06-30 12:11:52',
                'updated_at'      => '2026-06-30 12:11:52',
            ],
        ];

        foreach ($jadwals as $j) {
            DB::table('t_jadwal_produksi')->updateOrInsert(
                ['kode_jadwal' => $j['kode_jadwal']],
                $j
            );
        }

        // Ambil id_jadwal berdasarkan kode (aman terhadap auto-increment beda)
        $idJadwal1 = DB::table('t_jadwal_produksi')->where('kode_jadwal', 'JDW-2026-0001')->value('id_jadwal');
        $idJadwal2 = DB::table('t_jadwal_produksi')->where('kode_jadwal', 'JDW-2026-0002')->value('id_jadwal');

        // ══════════════════════════════════════════════════════════════════════
        // 2. t_detail_jadwal_produksi  (7 baris)
        // ══════════════════════════════════════════════════════════════════════
        $details = [
            // ── JDW-2026-0001 (Februari, Approved) ──
            [
                'kode_produksi'    => 'PRD-2026-001',
                'id_jadwal'        => $idJadwal1,
                'id_produk'        => 1,
                'id_bom'           => 1,
                'tanggal_produksi' => '2026-02-02',
                'qty_rencana'      => 800,
                'catatan'          => 'Tahu bakso nyoba doang',
                'created_at'       => '2026-06-28 14:13:10',
                'updated_at'       => '2026-06-28 14:13:10',
            ],
            [
                'kode_produksi'    => 'PRD-2026-002',
                'id_jadwal'        => $idJadwal1,
                'id_produk'        => 6,
                'id_bom'           => 2,
                'tanggal_produksi' => '2026-02-03',
                'qty_rencana'      => 700,
                'catatan'          => 'bandeng mantap',
                'created_at'       => '2026-06-28 14:13:10',
                'updated_at'       => '2026-06-28 14:13:10',
            ],
            [
                'kode_produksi'    => 'PRD-2026-003',
                'id_jadwal'        => $idJadwal1,
                'id_produk'        => 1,
                'id_bom'           => 2,
                'tanggal_produksi' => '2026-02-15',
                'qty_rencana'      => 400,
                'catatan'          => 'enak pol',
                'created_at'       => '2026-06-28 14:13:10',
                'updated_at'       => '2026-06-28 14:13:10',
            ],
            // ── JDW-2026-0002 (Maret, Pending Approval) ──
            [
                'kode_produksi'    => 'PRD-2026-004',
                'id_jadwal'        => $idJadwal2,
                'id_produk'        => 2,
                'id_bom'           => 1,
                'tanggal_produksi' => '2026-03-04',
                'qty_rencana'      => 500,
                'catatan'          => 'nyoba baru',
                'created_at'       => '2026-06-30 12:11:52',
                'updated_at'       => '2026-06-30 12:11:52',
            ],
            [
                'kode_produksi'    => 'PRD-2026-005',
                'id_jadwal'        => $idJadwal2,
                'id_produk'        => 1,
                'id_bom'           => 1,
                'tanggal_produksi' => '2026-03-10',
                'qty_rencana'      => 500,
                'catatan'          => 'Tahu bakso nyoba doang',
                'created_at'       => '2026-06-30 12:11:52',
                'updated_at'       => '2026-06-30 12:11:52',
            ],
            [
                'kode_produksi'    => 'PRD-2026-006',
                'id_jadwal'        => $idJadwal2,
                'id_produk'        => 6,
                'id_bom'           => 2,
                'tanggal_produksi' => '2026-03-18',
                'qty_rencana'      => 700,
                'catatan'          => 'bandeng mantap',
                'created_at'       => '2026-06-30 12:11:52',
                'updated_at'       => '2026-06-30 12:11:52',
            ],
            [
                'kode_produksi'    => 'PRD-2026-007',
                'id_jadwal'        => $idJadwal2,
                'id_produk'        => 1,
                'id_bom'           => 2,
                'tanggal_produksi' => '2026-03-25',
                'qty_rencana'      => 800,
                'catatan'          => 'enak pol',
                'created_at'       => '2026-06-30 12:11:52',
                'updated_at'       => '2026-06-30 12:11:52',
            ],
        ];

        foreach ($details as $d) {
            DB::table('t_detail_jadwal_produksi')->updateOrInsert(
                ['kode_produksi' => $d['kode_produksi']],
                $d
            );
        }

        // Ambil id_produksi berdasarkan kode (aman terhadap auto-increment beda)
        $idPrd001 = DB::table('t_detail_jadwal_produksi')->where('kode_produksi', 'PRD-2026-001')->value('id_produksi');
        $idPrd002 = DB::table('t_detail_jadwal_produksi')->where('kode_produksi', 'PRD-2026-002')->value('id_produksi');
        $idPrd003 = DB::table('t_detail_jadwal_produksi')->where('kode_produksi', 'PRD-2026-003')->value('id_produksi');
        // PRD-004 s/d 007 tidak punya kebutuhan bahan karena JDW-0002 masih Pending Approval

        // ══════════════════════════════════════════════════════════════════════
        // 3. t_kebutuhan_bahan  (8 baris — hanya untuk PRD-001, 002, 003)
        //    Catatan: id_detail_bom HARUS sama dengan yang ada di t_detail_bom
        //    database temanmu. Sesuaikan jika berbeda.
        // ══════════════════════════════════════════════════════════════════════
        $kebutuhanList = [
            // PRD-2026-001 (id_bom=1, qty_rencana=800) → 2 bahan
            ['id_produksi' => $idPrd001, 'id_detail_bom' => 1, 'qty_snapshot' => 5.00,  'qty_kebutuhan' => 10.00, 'tgl' => '2026-06-30', 'ts' => '2026-06-28 14:35:30'],
            ['id_produksi' => $idPrd001, 'id_detail_bom' => 2, 'qty_snapshot' => 7.00,  'qty_kebutuhan' => 14.00, 'tgl' => '2026-06-30', 'ts' => '2026-06-28 14:35:30'],

            // PRD-2026-002 (id_bom=2, qty_rencana=700) → 3 bahan
            ['id_produksi' => $idPrd002, 'id_detail_bom' => 3, 'qty_snapshot' => 10.00, 'qty_kebutuhan' => 11.67, 'tgl' => '2026-06-30', 'ts' => '2026-06-30 11:38:28'],
            ['id_produksi' => $idPrd002, 'id_detail_bom' => 4, 'qty_snapshot' => 8.00,  'qty_kebutuhan' => 9.33,  'tgl' => '2026-06-30', 'ts' => '2026-06-30 11:38:28'],
            ['id_produksi' => $idPrd002, 'id_detail_bom' => 5, 'qty_snapshot' => 10.00, 'qty_kebutuhan' => 11.67, 'tgl' => '2026-06-30', 'ts' => '2026-06-30 11:38:28'],

            // PRD-2026-003 (id_bom=2, qty_rencana=400) → 3 bahan (BOM sama dg PRD-002)
            ['id_produksi' => $idPrd003, 'id_detail_bom' => 3, 'qty_snapshot' => 10.00, 'qty_kebutuhan' => 6.67,  'tgl' => '2026-06-30', 'ts' => '2026-06-30 11:38:36'],
            ['id_produksi' => $idPrd003, 'id_detail_bom' => 4, 'qty_snapshot' => 8.00,  'qty_kebutuhan' => 5.33,  'tgl' => '2026-06-30', 'ts' => '2026-06-30 11:38:36'],
            ['id_produksi' => $idPrd003, 'id_detail_bom' => 5, 'qty_snapshot' => 10.00, 'qty_kebutuhan' => 6.67,  'tgl' => '2026-06-30', 'ts' => '2026-06-30 11:38:36'],
        ];

        foreach ($kebutuhanList as $k) {
            if (!$k['id_produksi']) continue; // skip jika detail tidak ditemukan

            DB::table('t_kebutuhan_bahan')->updateOrInsert(
                [
                    'id_produksi'   => $k['id_produksi'],
                    'id_detail_bom' => $k['id_detail_bom'],
                ],
                [
                    'qty_bahan_snapshot' => $k['qty_snapshot'],
                    'qty_kebutuhan'      => $k['qty_kebutuhan'],
                    'tanggal_generate'   => $k['tgl'],
                    'created_at'         => $k['ts'],
                    'updated_at'         => $k['ts'],
                ]
            );
        }

        $this->command->info('✅ JadwalProduksiSeeder selesai — 2 jadwal, 7 detail, 8 kebutuhan bahan.');
    }
}
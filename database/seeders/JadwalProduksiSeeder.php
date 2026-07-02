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

        $idJadwal1 = DB::table('t_jadwal_produksi')->where('kode_jadwal', 'JDW-2026-0001')->value('id_jadwal');
        $idJadwal2 = DB::table('t_jadwal_produksi')->where('kode_jadwal', 'JDW-2026-0002')->value('id_jadwal');

        // ══════════════════════════════════════════════════════════════════════
        // 2. t_detail_jadwal_produksi  (7 baris)
        // ══════════════════════════════════════════════════════════════════════
        $details = [
            // ── JDW-2026-0001 (Februari, Approved) ──
            ['kode_produksi' => 'PRD-2026-001', 'id_jadwal' => $idJadwal1, 'id_produk' => 1, 'id_bom' => 1, 'tanggal_produksi' => '2026-02-02', 'qty_rencana' => 800, 'catatan' => 'Tahu bakso nyoba doang', 'created_at' => '2026-06-28 14:13:10', 'updated_at' => '2026-06-28 14:13:10'],
            ['kode_produksi' => 'PRD-2026-002', 'id_jadwal' => $idJadwal1, 'id_produk' => 6, 'id_bom' => 2, 'tanggal_produksi' => '2026-02-03', 'qty_rencana' => 700, 'catatan' => 'bandeng mantap', 'created_at' => '2026-06-28 14:13:10', 'updated_at' => '2026-06-28 14:13:10'],
            ['kode_produksi' => 'PRD-2026-003', 'id_jadwal' => $idJadwal1, 'id_produk' => 1, 'id_bom' => 2, 'tanggal_produksi' => '2026-02-15', 'qty_rencana' => 400, 'catatan' => 'enak pol', 'created_at' => '2026-06-28 14:13:10', 'updated_at' => '2026-06-28 14:13:10'],
            
            // ── JDW-2026-0002 (Maret, Pending Approval) ──
            ['kode_produksi' => 'PRD-2026-004', 'id_jadwal' => $idJadwal2, 'id_produk' => 2, 'id_bom' => 1, 'tanggal_produksi' => '2026-03-04', 'qty_rencana' => 500, 'catatan' => 'nyoba baru', 'created_at' => '2026-06-30 12:11:52', 'updated_at' => '2026-06-30 12:11:52'],
            ['kode_produksi' => 'PRD-2026-005', 'id_jadwal' => $idJadwal2, 'id_produk' => 1, 'id_bom' => 1, 'tanggal_produksi' => '2026-03-10', 'qty_rencana' => 500, 'catatan' => 'Tahu bakso nyoba doang', 'created_at' => '2026-06-30 12:11:52', 'updated_at' => '2026-06-30 12:11:52'],
            ['kode_produksi' => 'PRD-2026-006', 'id_jadwal' => $idJadwal2, 'id_produk' => 6, 'id_bom' => 2, 'tanggal_produksi' => '2026-03-18', 'qty_rencana' => 700, 'catatan' => 'bandeng mantap', 'created_at' => '2026-06-30 12:11:52', 'updated_at' => '2026-06-30 12:11:52'],
            ['kode_produksi' => 'PRD-2026-007', 'id_jadwal' => $idJadwal2, 'id_produk' => 1, 'id_bom' => 2, 'tanggal_produksi' => '2026-03-25', 'qty_rencana' => 800, 'catatan' => 'enak pol', 'created_at' => '2026-06-30 12:11:52', 'updated_at' => '2026-06-30 12:11:52'],
        ];

        foreach ($details as $d) {
            DB::table('t_detail_jadwal_produksi')->updateOrInsert(
                ['kode_produksi' => $d['kode_produksi']],
                $d
            );
        }

        $idPrd001 = DB::table('t_detail_jadwal_produksi')->where('kode_produksi', 'PRD-2026-001')->value('id_produksi');
        $idPrd002 = DB::table('t_detail_jadwal_produksi')->where('kode_produksi', 'PRD-2026-002')->value('id_produksi');
        $idPrd003 = DB::table('t_detail_jadwal_produksi')->where('kode_produksi', 'PRD-2026-003')->value('id_produksi');

        // ══════════════════════════════════════════════════════════════════════
        // 3. t_kebutuhan_bahan 
        // ══════════════════════════════════════════════════════════════════════
        
        // Membersihkan data kebutuhan lama agar tidak error duplicate saat di-run ulang
        DB::table('t_kebutuhan_bahan')->whereIn('id_produksi', [$idPrd001, $idPrd002, $idPrd003])->delete();

        $kebutuhanList = [];

        // ── Kebutuhan Bahan untuk PRD-2026-001 (BOM-001) ──
        $detailBom1 = DB::table('t_detail_bom')->where('id_bom', 1)->get();
        // Asumsi BOM-001 punya qty_batch = 100
        $qtyBatch1 = 100;
        $qtyRencana1 = 800;
        $rasio1 = $qtyRencana1 / $qtyBatch1; // 8

        foreach ($detailBom1 as $db) {
            $kebutuhanList[] = [
                'id_produksi'        => $idPrd001,
                'id_detail_bom'      => $db->id_detail_bom,
                'qty_bahan_snapshot' => $db->jumlah_bahan,
                'qty_kebutuhan'      => $db->jumlah_bahan * $rasio1, // Skala proporsional
                'tanggal_generate'   => '2026-06-30',
                'created_at'         => '2026-06-28 14:35:30',
                'updated_at'         => '2026-06-28 14:35:30',
            ];
        }

        // ── Kebutuhan Bahan untuk PRD-2026-002 (BOM-002) ──
        $detailBom2 = DB::table('t_detail_bom')->where('id_bom', 2)->get();
        // Asumsi BOM-002 punya qty_batch = 70
        $qtyBatch2 = 70;
        
        $qtyRencana2 = 700;
        $rasio2 = $qtyRencana2 / $qtyBatch2; // 10

        foreach ($detailBom2 as $db) {
            $kebutuhanList[] = [
                'id_produksi'        => $idPrd002,
                'id_detail_bom'      => $db->id_detail_bom,
                'qty_bahan_snapshot' => $db->jumlah_bahan,
                'qty_kebutuhan'      => $db->jumlah_bahan * $rasio2,
                'tanggal_generate'   => '2026-06-30',
                'created_at'         => '2026-06-30 11:38:28',
                'updated_at'         => '2026-06-30 11:38:28',
            ];
        }

        // ── Kebutuhan Bahan untuk PRD-2026-003 (BOM-002) ──
        $qtyRencana3 = 400;
        $rasio3 = $qtyRencana3 / $qtyBatch2; // 400 / 70

        foreach ($detailBom2 as $db) {
            $kebutuhanList[] = [
                'id_produksi'        => $idPrd003,
                'id_detail_bom'      => $db->id_detail_bom,
                'qty_bahan_snapshot' => $db->jumlah_bahan,
                'qty_kebutuhan'      => $db->jumlah_bahan * $rasio3,
                'tanggal_generate'   => '2026-06-30',
                'created_at'         => '2026-06-30 11:38:36',
                'updated_at'         => '2026-06-30 11:38:36',
            ];
        }

        // Insert massal
        if (!empty($kebutuhanList)) {
            DB::table('t_kebutuhan_bahan')->insert($kebutuhanList);
        }

        $this->command->info('✅ JadwalProduksiSeeder selesai — 2 jadwal, 7 detail, dan Kebutuhan Bahan ter-generate secara logis.');
    }
}
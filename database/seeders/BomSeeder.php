<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BomSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // ── 1. SEEDING MASTER BOM (t_bom) ──────────────────────────────────
        $bomData = [
            [
                'id_bom'       => 1,
                'kode_bom'     => 'BOM-001',
                // Asumsi: id_produk 1 merepresentasikan "PRD-001 - Tahu Bakso Retort Isi 8"
                'id_produk'    => 1, 
                'nama_resep'   => 'Tahu Bakso 400 pcs',
                'qty_batch'    => 400,
                'satuan_batch' => 'Pcs',
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'id_bom'       => 2,
                'kode_bom'     => 'BOM-002',
                // Asumsi: id_produk 2 merepresentasikan "PRD-006 - Bandeng Retort"
                'id_produk'    => 2, 
                'nama_resep'   => 'Bandeng Presto 200 kg',
                'qty_batch'    => 600,
                'satuan_batch' => 'pcs',
                'created_at'   => $now,
                'updated_at'   => $now,
            ]
        ];

        // Menggunakan upsert untuk t_bom berdasarkan kode_bom
        DB::table('t_bom')->upsert(
            $bomData,
            ['kode_bom'], // Unique identifier
            ['id_produk', 'nama_resep', 'qty_batch', 'satuan_batch', 'updated_at'] 
        );


        // ── 2. SEEDING DETAIL BOM (t_detail_bom) ───────────────────────────
        
        // Membersihkan detail BOM lama untuk ID yang akan di-seed guna mencegah duplikasi.
        // Ini lebih aman daripada truncate karena tidak mengganggu BOM lain yang mungkin sudah ada.
        DB::table('t_detail_bom')->whereIn('id_bom', [1, 2])->delete();

        $detailBomData = [
            // Detail BOM-001 (Tahu Bakso)
            ['id_bom' => 1, 'id_bahan' => 3, 'jumlah_bahan' => 5, 'created_at' => $now, 'updated_at' => $now], // BB-003: Bawang Merah Goreng
            ['id_bom' => 1, 'id_bahan' => 4, 'jumlah_bahan' => 7, 'created_at' => $now, 'updated_at' => $now], // BB-004: Bawang Putih

            // Detail BOM-002 (Bandeng Presto)
            ['id_bom' => 2, 'id_bahan' => 3, 'jumlah_bahan' => 10, 'created_at' => $now, 'updated_at' => $now], // BB-003: Bawang Merah Goreng
            ['id_bom' => 2, 'id_bahan' => 5, 'jumlah_bahan' => 8,  'created_at' => $now, 'updated_at' => $now], // BB-005: Bumbu Dapur
            ['id_bom' => 2, 'id_bahan' => 2, 'jumlah_bahan' => 10, 'created_at' => $now, 'updated_at' => $now], // BB-002: Bawang Merah
        ];

        // Batch insert untuk efisiensi
        DB::table('t_detail_bom')->insert($detailBomData);
    }
}
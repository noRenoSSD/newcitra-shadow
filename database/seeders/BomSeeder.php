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
                'id_produk'    => 1, 
                'nama_resep'   => 'Tahu Bakso Isi 8',
                'qty_batch'    => 100,
                'satuan_batch' => 'Pack',
                'created_at'   => '2026-07-02 09:20:04',
                'updated_at'   => '2026-07-02 10:32:54',
            ],
            [
                'id_bom'       => 2,
                'kode_bom'     => 'BOM-002',
                'id_produk'    => 2, 
                'nama_resep'   => 'Tahu Bakso Isi 10',
                'qty_batch'    => 70,
                'satuan_batch' => 'Pack',
                'created_at'   => '2026-07-02 09:20:04',
                'updated_at'   => '2026-07-02 10:40:35',
            ]
        ];

        DB::table('t_bom')->upsert(
            $bomData,
            ['kode_bom'], // Unique identifier
            ['id_produk', 'nama_resep', 'qty_batch', 'satuan_batch', 'updated_at'] 
        );


        // ── 2. SEEDING DETAIL BOM (t_detail_bom) ───────────────────────────
        
        // Bersihkan detail lama untuk BOM 1 dan 2 agar tidak bentrok saat insert ulang
        DB::table('t_detail_bom')->whereIn('id_bom', [1, 2])->delete();

        // Data disamakan persis dengan baris di HeidiSQL (termasuk ID spesifiknya)
        $detailBomData = [
            // Detail BOM-001
            ['id_detail_bom' => 1,  'id_bom' => 1, 'id_bahan' => 10, 'jumlah_bahan' => 5000.0, 'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 2,  'id_bom' => 1, 'id_bahan' => 30, 'jumlah_bahan' => 800.0,  'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 8,  'id_bom' => 1, 'id_bahan' => 34, 'jumlah_bahan' => 4000.0, 'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 9,  'id_bom' => 1, 'id_bahan' => 32, 'jumlah_bahan' => 1000.0, 'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 10, 'id_bom' => 1, 'id_bahan' => 4,  'jumlah_bahan' => 125.0,  'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 11, 'id_bom' => 1, 'id_bahan' => 14, 'jumlah_bahan' => 1525.0, 'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 12, 'id_bom' => 1, 'id_bahan' => 16, 'jumlah_bahan' => 75.0,   'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 13, 'id_bom' => 1, 'id_bahan' => 27, 'jumlah_bahan' => 75.0,   'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 14, 'id_bom' => 1, 'id_bahan' => 26, 'jumlah_bahan' => 20.0,   'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 15, 'id_bom' => 1, 'id_bahan' => 24, 'jumlah_bahan' => 125.0,  'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 16, 'id_bom' => 1, 'id_bahan' => 23, 'jumlah_bahan' => 10.0,   'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 17, 'id_bom' => 1, 'id_bahan' => 19, 'jumlah_bahan' => 70.0,   'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 18, 'id_bom' => 1, 'id_bahan' => 43, 'jumlah_bahan' => 100.0,  'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 19, 'id_bom' => 1, 'id_bahan' => 45, 'jumlah_bahan' => 100.0,  'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 20, 'id_bom' => 1, 'id_bahan' => 39, 'jumlah_bahan' => 7.0,    'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 21, 'id_bom' => 1, 'id_bahan' => 46, 'jumlah_bahan' => 100.0,  'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 22, 'id_bom' => 1, 'id_bahan' => 35, 'jumlah_bahan' => 3.0,    'created_at' => $now, 'updated_at' => $now],

            // Detail BOM-002
            ['id_detail_bom' => 3,  'id_bom' => 2, 'id_bahan' => 10, 'jumlah_bahan' => 5000.0, 'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 4,  'id_bom' => 2, 'id_bahan' => 30, 'jumlah_bahan' => 700.0,  'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 5,  'id_bom' => 2, 'id_bahan' => 34, 'jumlah_bahan' => 3500.0, 'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 23, 'id_bom' => 2, 'id_bahan' => 32, 'jumlah_bahan' => 500.0,  'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 24, 'id_bom' => 2, 'id_bahan' => 4,  'jumlah_bahan' => 90.0,   'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 25, 'id_bom' => 2, 'id_bahan' => 14, 'jumlah_bahan' => 825.0,  'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 26, 'id_bom' => 2, 'id_bahan' => 16, 'jumlah_bahan' => 75.0,   'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 27, 'id_bom' => 2, 'id_bahan' => 27, 'jumlah_bahan' => 225.0,  'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 28, 'id_bom' => 2, 'id_bahan' => 26, 'jumlah_bahan' => 20.0,   'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 29, 'id_bom' => 2, 'id_bahan' => 24, 'jumlah_bahan' => 175.0,  'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 30, 'id_bom' => 2, 'id_bahan' => 23, 'jumlah_bahan' => 1.0,    'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 31, 'id_bom' => 2, 'id_bahan' => 19, 'jumlah_bahan' => 50.0,   'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 32, 'id_bom' => 2, 'id_bahan' => 29, 'jumlah_bahan' => 70.0,   'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 33, 'id_bom' => 2, 'id_bahan' => 35, 'jumlah_bahan' => 2.0,    'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 34, 'id_bom' => 2, 'id_bahan' => 43, 'jumlah_bahan' => 70.0,   'created_at' => $now, 'updated_at' => $now],
            ['id_detail_bom' => 35, 'id_bom' => 2, 'id_bahan' => 37, 'jumlah_bahan' => 70.0,   'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('t_detail_bom')->insert($detailBomData);
    }
}
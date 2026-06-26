<?php

namespace Database\Seeders;

use App\Models\Bahan; // Pastikan modelmu bernama Bahan
use Illuminate\Database\Seeder;

class BahanSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'jenis_bahan' => 'baku',
                'kode_bahan' => 'BB-001',
                'nama_bahan' => 'Asam Kawak',
                'satuan_bahan' => 'Kg',
                'stok_min' => 5.00
            ],
            [
                'jenis_bahan' => 'baku',
                'kode_bahan' => 'BB-002',
                'nama_bahan' => 'Bawang Merah',
                'satuan_bahan' => 'Kg',
                'stok_min' => 10.00
            ],
            [
                'jenis_bahan' => 'baku',
                'kode_bahan' => 'BB-003',
                'nama_bahan' => 'Bawang Merah Goreng',
                'satuan_bahan' => 'Kg',
                'stok_min' => 5.00
            ],
            [
                'jenis_bahan' => 'baku',
                'kode_bahan' => 'BB-004',
                'nama_bahan' => 'Bawang Putih',
                'satuan_bahan' => 'Kg',
                'stok_min' => 10.00
            ],
            [
                'jenis_bahan' => 'baku',
                'kode_bahan' => 'BB-005',
                'nama_bahan' => 'Bumbu Dapur',
                'satuan_bahan' => 'Kg',
                'stok_min' => 5.00
            ],
            [
                'jenis_bahan' => 'baku',
                'kode_bahan' => 'BB-006',
                'nama_bahan' => 'Bumbu Pepes',
                'satuan_bahan' => 'Kg',
                'stok_min' => 5.00
            ],
            [
                'jenis_bahan' => 'baku',
                'kode_bahan' => 'BB-007',
                'nama_bahan' => 'Cabe Merah',
                'satuan_bahan' => 'Kg',
                'stok_min' => 5.00
            ],
            [
                'jenis_bahan' => 'baku',
                'kode_bahan' => 'BB-008',
                'nama_bahan' => 'Cabe Rawit Merah',
                'satuan_bahan' => 'Kg',
                'stok_min' => 5.00
            ],
        ];

        foreach ($data as $item) {
            Bahan::updateOrCreate(
                ['kode_bahan' => $item['kode_bahan']], // Acuan untuk cek duplikat
                $item
            );
        }
    }
}
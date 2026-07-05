<?php

namespace Database\Seeders;

use App\Models\Overhead;
use Illuminate\Database\Seeder;

class OverheadSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['kode_overhead' => 'OVH-001', 'nama_overhead' => 'Listrik', 'keterangan' => 'Biaya listrik untuk produksi'],
            ['kode_overhead' => 'OVH-002', 'nama_overhead' => 'Air', 'keterangan' => 'Biaya air untuk produksi'],
        ];

        foreach ($data as $item) {
            Overhead::create($item);
        }
    }
}
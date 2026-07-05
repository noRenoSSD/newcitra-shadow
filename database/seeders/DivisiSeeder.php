<?php

namespace Database\Seeders;

use App\Models\Divisi;
use Illuminate\Database\Seeder;

class DivisiSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['kode_divisi' => 'DIV-001', 'nama_divisi' => 'Kepala Produksi'],
            ['kode_divisi' => 'DIV-002', 'nama_divisi' => 'Staff Produksi'],
            ['kode_divisi' => 'DIV-003', 'nama_divisi' => 'Packaging'],
        ];

        foreach ($data as $item) {
            Divisi::create($item);
        }
    }
}
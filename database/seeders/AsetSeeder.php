<?php

namespace Database\Seeders;

use App\Models\Aset;
use Illuminate\Database\Seeder;

class AsetSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['kode_aset' => 'AST-001', 'nama_aset' => 'Mesin Presto 200 kg', 'tipe_aset' => 'mesin', 'tanggal_beli' => '2024-01-01', 'harga_perolehan' => 20000000, 'umur_ekonomis' => 5, 'nilai_sisa' => 5000000],
            ['kode_aset' => 'AST-002', 'nama_aset' => 'Mesin Vakum', 'tipe_aset' => 'mesin', 'tanggal_beli' => '2023-07-25', 'harga_perolehan' => 15000000, 'umur_ekonomis' => 5, 'nilai_sisa' => 5000000],
            ['kode_aset' => 'AST-003', 'nama_aset' => 'Mobil', 'tipe_aset' => 'kendaraan', 'tanggal_beli' => '2024-12-25', 'harga_perolehan' => 200000000, 'umur_ekonomis' => 10, 'nilai_sisa' => 10000000],
        ];

        foreach ($data as $item) {
            Aset::updateOrCreate(
                ['kode_aset' => $item['kode_aset']],
                $item
            );
        }
    }
}
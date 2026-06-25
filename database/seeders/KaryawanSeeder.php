<?php

namespace Database\Seeders;

use App\Models\Karyawan;
use Illuminate\Database\Seeder;

class KaryawanSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['kode_karyawan' => 'KRY-001', 'nama' => 'Dita', 'jabatan' => 'Staff', 'departemen' => 'Distribusi'],
            ['kode_karyawan' => 'KRY-002', 'nama' => 'Siti', 'jabatan' => 'Staff', 'departemen' => 'Produksi'],
        ];

        foreach ($data as $item) {
            Karyawan::create($item);
        }
    }
}
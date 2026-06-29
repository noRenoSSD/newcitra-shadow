<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MitraSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Target ke table 't_mitra' sesuai file migration-mu
        DB::table('t_mitra')->insert([
            [
                'kode_mitra' => 'MIT-0001',
                'nama_mitra' => 'LIDULAPA',
                'pic_mitra'  => 'Budi Santoso',
                'alamat'     => 'Jl. Bawen - Ambarawa, Merakrejo, Harjosari, Kec. Bawen',
                'no_telp'    => '081234567890',
                'kota'       => 'Kabupaten Semarang',
                'status'     => 'Aktif',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'kode_mitra' => 'MIT-0002',
                'nama_mitra' => 'Dusun Semilir',
                'pic_mitra'  => 'Iwan Sulistyo',
                'alamat'     => 'Jl. Soekarno - Hatta No.49, Ngemple, Bawen',
                'no_telp'    => '081987654321',
                'kota'       => 'Kabupaten Semarang',
                'status'     => 'Aktif',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'kode_mitra' => 'MIT-0003',
                'nama_mitra' => 'KOETA TOEA',
                'pic_mitra'  => 'Siti Aminah',
                'alamat'     => 'Jl. Brigjen Sudiarto No.448b, Pedurungan Tengah',
                'no_telp'    => '085712345678',
                'kota'       => 'Kota Semarang',
                'status'     => 'Aktif',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ]);

        $this->command->info("Seeder t_mitra berhasil disuntikkan sesuai struktur tabel!");
    }
}
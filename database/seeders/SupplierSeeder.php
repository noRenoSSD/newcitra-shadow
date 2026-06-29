<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dataSupplier = [
            // Kategori: Bahan Baku
            ['nama' => 'Toko Daging Bu Vera', 'alamat' => 'Kota Semarang'],
            ['nama' => 'UD MNS', 'alamat' => 'Ps Kobong Semarang'],
            ['nama' => 'Bandeng Sigit', 'alamat' => 'Kota Semarang'],
            ['nama' => 'Bandeng Balap', 'alamat' => 'Kota Semarang'],
            ['nama' => 'Tahu Din', 'alamat' => 'Ungaran'],

            // Kategori: Packaging
            ['nama' => 'Bintang Fausta Cemerlag', 'alamat' => 'Semarang'],
            ['nama' => 'Cerah Indah Grafika', 'alamat' => 'Semarang'],
            ['nama' => 'Cv Karya Mahardika', 'alamat' => 'Semarang'],
            ['nama' => 'Trimulya Cipta Grafika', 'alamat' => 'Semarang'],
            ['nama' => 'Sambel Bu Lani', 'alamat' => 'Semarang'],
        ];

        foreach ($dataSupplier as $index => $supplier) {
            // Membuat kode urut otomatis: SUP-001, SUP-002, dst.
            $kodeSupplier = 'SUP-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT);

            DB::table('t_supplier')->insert([
                'kode_supplier'   => $kodeSupplier,
                'nama_supplier'   => $supplier['nama'],
                'kontak_supplier' => '-', // Dummy karena di Excel tidak ada data kontak
                'alamat_supplier' => $supplier['alamat'],
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }
    }
}

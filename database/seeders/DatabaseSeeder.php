<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Aset;
use App\Models\Overhead; // <--- 1. Pastikan model Overhead di-import
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Seed Admin User
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('12345678'),
            ]
        );

        // 2. Panggil Seed Data Aset
        $this->call([
        AsetSeeder::class,
        ]);

        // 3. Panggil OverheadSeeder
        $this->call([
            OverheadSeeder::class,
        ]);

        // 4. Panggil AkunSeeder
        $this->call([
            AkunSeeder::class,
        ]);

        // 5. Panggil ProdukSeeder
        $this->call([
            ProdukSeeder::class,
        ]);

        // 6. Panggil BahanSeeder
        $this->call([
            BahanSeeder::class,
        ]);

        // 7. Panggil BomSeeder
        $this->call([
            BomSeeder::class,
        ]);

        // 8. Panggil JadwalProduksiSeeder
        $this->call([
            JadwalProduksiSeeder::class,
        ]);

        // 9. Panggil HargaProdukSeeder
        $this->call([
            HargaProdukSeeder::class,
        ]);

        // 10. Panggil MitraSeeder
        $this->call([
            MitraSeeder::class,
        ]);

        // 11. Panggil PesananSeeder
        $this->call([
            PesananSeeder::class,
        ]);
        // 12. Panggil supplierseeder
        $this->call([
            SupplierSeeder::class,
        ]);

        // 13. Panggil DivisiSeeder
        $this->call([
            DivisiSeeder::class,
        ]);

    }

}

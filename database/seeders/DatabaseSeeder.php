<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 0. Disable Foreign Key Checks (Opsional tapi direkomendasikan untuk Seeding Massal)
        Schema::disableForeignKeyConstraints();

        // 1. Seed Users with Roles
        $users = [
            ['email' => 'admin@gmail.com', 'name' => 'Super Admin', 'role' => 'super_admin'],
            ['email' => 'akuntansi@newcitra.com', 'name' => 'Admin Akuntansi', 'role' => 'admin_akuntansi'],
            ['email' => 'produksi@newcitra.com', 'name' => 'Admin Produksi', 'role' => 'admin_produksi'],
            ['email' => 'pembelian@newcitra.com', 'name' => 'Admin Pembelian', 'role' => 'admin_pembelian'],
            ['email' => 'penjualan@newcitra.com', 'name' => 'Admin Penjualan', 'role' => 'admin_penjualan'],
            ['email' => 'manajer@newcitra.com', 'name' => 'Manajer', 'role' => 'manajer'],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['name'],
                    'password' => Hash::make('12345678'),
                    'role' => $u['role'],
                ]
            );
        }

        // 2. Eksekusi Seeder dalam 1 Array Berdasarkan Hierarki Dependensi
        try {
            $this->call([
                // --- TIER 1: CORE MASTER DATA (Tidak punya Foreign Key ke tabel lain) ---
                DivisiSeeder::class,      // Biasanya parent dari User/Aset
                AkunSeeder::class,        // Master Coa (Chart of Accounts)
                SupplierSeeder::class,    // Master Pemasok
                MitraSeeder::class,       // Master Pelanggan/Mitra

                // --- TIER 2: SECONDARY MASTER DATA (Bergantung pada Tier 1) ---
                BahanSeeder::class,       // Butuh Supplier
                ProdukSeeder::class,      // Barang jadi
                AsetSeeder::class,        // Butuh Akun/Divisi
                OverheadSeeder::class,    // Butuh Akun

                // --- TIER 3: RELATIONAL DATA (Menghubungkan Master Data) ---
                BomSeeder::class,         // Bill of Materials (Butuh Produk & Bahan)
                HargaProdukSeeder::class, // Butuh Produk

                // --- TIER 4: TRANSACTIONAL DATA (Operasional) ---
                PesananSeeder::class,         // Butuh Mitra & Produk
                JadwalProduksiSeeder::class,  // Butuh Pesanan/BOM/Produk
            ]);
        } catch (\Exception $e) {
            $this->command->info('Beberapa seeder diskip karena data sudah ada: ' . $e->getMessage());
        }

        // 3. Enable kembali Foreign Key Checks
        Schema::enableForeignKeyConstraints();
    }
}
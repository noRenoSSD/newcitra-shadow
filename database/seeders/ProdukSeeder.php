<?php

namespace Database\Seeders;

use App\Models\Produk; // Pastikan model Produk sudah dibuat
use Illuminate\Database\Seeder;

class ProdukSeeder extends Seeder
{
    public function run(): void
    {
        $dataProduk = [
            ['kode_produk' => 'PRD-001', 'nama_produk' => 'Tahu Bakso Retort Isi 8', 'satuan_produk' => 'pcs'],
            ['kode_produk' => 'PRD-002', 'nama_produk' => 'Tahu Bakso Retort Isi 10', 'satuan_produk' => 'pcs'],
            ['kode_produk' => 'PRD-003', 'nama_produk' => 'Tahu Bakso Premium Isi 5', 'satuan_produk' => 'pcs'],
            ['kode_produk' => 'PRD-004', 'nama_produk' => 'Bandeng Frozen Isi 1', 'satuan_produk' => 'pcs'],
            ['kode_produk' => 'PRD-005', 'nama_produk' => 'Bandeng Frozen Isi 2', 'satuan_produk' => 'pcs'],
            ['kode_produk' => 'PRD-006', 'nama_produk' => 'Bandeng Retort', 'satuan_produk' => 'pcs'],
            ['kode_produk' => 'PRD-007', 'nama_produk' => 'Otak-Otak Vaccum', 'satuan_produk' => 'pcs'],
            ['kode_produk' => 'PRD-008', 'nama_produk' => 'Otak-Otak Retort', 'satuan_produk' => 'pcs'],
            ['kode_produk' => 'PRD-009', 'nama_produk' => 'Pepes Retort', 'satuan_produk' => 'pcs'],
            ['kode_produk' => 'PRD-010', 'nama_produk' => 'Pepes Vaccum', 'satuan_produk' => 'pcs'],
        ];

        foreach ($dataProduk as $item) {
            // Menggunakan updateOrCreate agar aman dari duplikat jika di-seed berulang
            Produk::updateOrCreate(['kode_produk' => $item['kode_produk']], $item);
        }
    }
}
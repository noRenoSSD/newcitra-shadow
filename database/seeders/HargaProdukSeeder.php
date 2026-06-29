<?php

namespace Database\Seeders;

use App\Models\HargaProduk;
use App\Models\Produk;
use Illuminate\Database\Seeder;

class HargaProdukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dataHarga = [
            [
                'kode_produk' => 'PRD-001',
                'harga' => [
                    [
                        'kode_harga' => 'HG-001',
                        'jenis_transaksi' => 'Penjualan Langsung',
                        'harga' => 45000,
                    ],
                    [
                        'kode_harga' => 'HG-002',
                        'jenis_transaksi' => 'Konsinyasi',
                        'harga' => 42000,
                    ],
                ],
            ],
            [
                'kode_produk' => 'PRD-002',
                'harga' => [
                    [
                        'kode_harga' => 'HG-003',
                        'jenis_transaksi' => 'Penjualan Langsung',
                        'harga' => 50000,
                    ],
                ],
            ],
        ];

        foreach ($dataHarga as $item) {

            $produk = Produk::where('kode_produk', $item['kode_produk'])->first();

            if (!$produk) {
                continue;
            }

            foreach ($item['harga'] as $harga) {

                HargaProduk::updateOrCreate(
                    [
                        'kode_harga' => $harga['kode_harga'],
                    ],
                    [
                        'id_produk' => $produk->id_produk,
                        'jenis_transaksi' => $harga['jenis_transaksi'],
                        'harga' => $harga['harga'],
                    ]
                );
            }
        }
    }
}
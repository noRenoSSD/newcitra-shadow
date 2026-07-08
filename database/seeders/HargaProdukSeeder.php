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
            // ==================== TAMBAHAN 5 DATA PRODUK BARU ====================
            [
                'kode_produk' => 'PRD-003',
                'harga' => [
                    [
                        'kode_harga' => 'HG-004',
                        'jenis_transaksi' => 'Penjualan Langsung',
                        'harga' => 60000,
                    ],
                    [
                        'kode_harga' => 'HG-005',
                        'jenis_transaksi' => 'Maklon',
                        'harga' => 55000,
                    ],
                ],
            ],
            [
                'kode_produk' => 'PRD-004',
                'harga' => [
                    [
                        'kode_harga' => 'HG-006',
                        'jenis_transaksi' => 'Penjualan Langsung',
                        'harga' => 75000,
                    ],
                    [
                        'kode_harga' => 'HG-007',
                        'jenis_transaksi' => 'Konsinyasi',
                        'harga' => 70000,
                    ],
                ],
            ],
            [
                'kode_produk' => 'PRD-005',
                'harga' => [
                    [
                        'kode_harga' => 'HG-008',
                        'jenis_transaksi' => 'Maklon',
                        'harga' => 120000,
                    ],
                ],
            ],
            [
                'kode_produk' => 'PRD-006',
                'harga' => [
                    [
                        'kode_harga' => 'HG-009',
                        'jenis_transaksi' => 'Penjualan Langsung',
                        'harga' => 35000,
                    ],
                    [
                        'kode_harga' => 'HG-010',
                        'jenis_transaksi' => 'Konsinyasi',
                        'harga' => 32000,
                    ],
                    [
                        'kode_harga' => 'HG-011',
                        'jenis_transaksi' => 'Maklon',
                        'harga' => 30000,
                    ],
                ],
            ],
            [
                'kode_produk' => 'PRD-007',
                'harga' => [
                    [
                        'kode_harga' => 'HG-012',
                        'jenis_transaksi' => 'Penjualan Langsung',
                        'harga' => 95000,
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
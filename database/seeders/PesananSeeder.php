<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PesananSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            
            // 1. Ambil semua data produk dan beberapa data mitra untuk dimix
            $produk = DB::table('t_produk')->get()->keyBy('kode_produk');
            $mitraList = DB::table('t_mitra')->limit(5)->get(); // Ambil sampai 5 mitra jika ada
            
            // Proteksi jika master data masih kosong
            if ($mitraList->isEmpty() || $produk->isEmpty()) {
                $this->command->error("Gagal menjalankan Seeder! Pastikan seeder t_mitra dan t_produk/t_harga_produk sudah di-run.");
                return;
            }

            // Helper function untuk mengambil data mitra secara dinamis bergantian
            // Jika data mitra di DB kurang dari 5, dia akan berputar kembali ke mitra pertama (fallback)
            $getMitra = function($index) use ($mitraList) {
                $count = $mitraList->count();
                return $mitraList[$index % $count];
            };

            // Helper function untuk mengambil data harga snapshot dari t_harga_produk
            $getHarga = function($idProduk, $jenisTransaksi) {
                return DB::table('t_harga_produk')
                    ->where('id_produk', $idProduk)
                    ->where('jenis_transaksi', $jenisTransaksi)
                    ->first();
            };


            // ==================== PESANAN DATA 1 (Mitra 1 - Penjualan Langsung - PRD-001) ====================
            $m = $getMitra(0); // Mitra Pertama
            $p1 = $produk->get('PRD-001');
            if ($p1) {
                $harga = $getHarga($p1->id_produk, 'Penjualan Langsung');
                $qty = 5;
                $subtotal = $qty * ($harga ? $harga->harga : 45000);

                $idPesanan = DB::table('t_pesanan')->insertGetId([
                    'no_pesanan'      => 'SO-' . Carbon::now()->format('Ymd') . '-0001',
                    'tgl_pesanan'     => Carbon::now()->toDateString(),
                    'id_mitra'        => $m->id_mitra,
                    'jenis_transaksi' => 'Penjualan Langsung',
                    'alamat'          => $m->alamat, 
                    'total_harga'     => $subtotal,
                    'created_at'      => Carbon::now(),
                    'updated_at'      => Carbon::now(),
                ]);

                DB::table('t_pesanan_detail')->insert([
                    'id_pesanan' => $idPesanan,
                    'id_produk'  => $p1->id_produk,
                    'id_harga'   => $harga ? $harga->id_harga_produk : 1,
                    'qty'        => $qty,
                    'harga'      => $harga ? $harga->harga : 45000,
                    'subtotal'   => $subtotal,
                ]);
            }


            // ==================== PESANAN DATA 2 (Mitra 2 - Maklon/Konsinyasi - Multi Items PRD-001 & PRD-002) ====================
            $m = $getMitra(1); // Mitra Kedua
            $p1 = $produk->get('PRD-001');
            $p2 = $produk->get('PRD-002');
            
            if ($p1 && $p2) {
                // Catatan: Sesuai error sebelumnya, ganti 'Konsinyasi' ke 'Maklon' jika enum database belum di-update
                $jenisTx = 'Maklon'; 
                $h1 = $getHarga($p1->id_produk, $jenisTx);
                $h2 = $getHarga($p2->id_produk, $jenisTx) ?? $getHarga($p2->id_produk, 'Penjualan Langsung');

                $qty1 = 10; $price1 = $h1 ? $h1->harga : 42000; $sub1 = $qty1 * $price1;
                $qty2 = 20; $price2 = $h2 ? $h2->harga : 50000; $sub2 = $qty2 * $price2;
                $total = $sub1 + $sub2;

                $idPesanan = DB::table('t_pesanan')->insertGetId([
                    'no_pesanan'      => 'SO-' . Carbon::now()->format('Ymd') . '-0002',
                    'tgl_pesanan'     => Carbon::now()->toDateString(),
                    'id_mitra'        => $m->id_mitra,
                    'jenis_transaksi' => $jenisTx,
                    'alamat'          => $m->alamat, 
                    'total_harga'     => $total,
                    'created_at'      => Carbon::now(),
                    'updated_at'      => Carbon::now(),
                ]);

                DB::table('t_pesanan_detail')->insert([
                    [
                        'id_pesanan' => $idPesanan,
                        'id_produk'  => $p1->id_produk,
                        'id_harga'   => $h1 ? $h1->id_harga_produk : 2,
                        'qty'        => $qty1,
                        'harga'      => $price1,
                        'subtotal'   => $sub1,
                    ],
                    [
                        'id_pesanan' => $idPesanan,
                        'id_produk'  => $p2->id_produk,
                        'id_harga'   => $h2 ? $h2->id_harga_produk : 3,
                        'qty'        => $qty2,
                        'harga'      => $price2,
                        'subtotal'   => $sub2,
                    ]
                ]);
            }


            // ==================== PESANAN DATA 3 (Mitra 3 - Maklon - PRD-003) ====================
            $m = $getMitra(2); // Mitra Ketiga
            $p3 = $produk->get('PRD-003');
            if ($p3) {
                $harga = $getHarga($p3->id_produk, 'Maklon');
                $qty = 15;
                $subtotal = $qty * ($harga ? $harga->harga : 55000);

                $idPesanan = DB::table('t_pesanan')->insertGetId([
                    'no_pesanan'      => 'SO-' . Carbon::now()->format('Ymd') . '-0003',
                    'tgl_pesanan'     => Carbon::now()->toDateString(),
                    'id_mitra'        => $m->id_mitra,
                    'jenis_transaksi' => 'Maklon',
                    'alamat'          => $m->alamat, 
                    'total_harga'     => $subtotal,
                    'created_at'      => Carbon::now(),
                    'updated_at'      => Carbon::now(),
                ]);

                DB::table('t_pesanan_detail')->insert([
                    'id_pesanan' => $idPesanan,
                    'id_produk'  => $p3->id_produk,
                    'id_harga'   => $harga ? $harga->id_harga_produk : 5,
                    'qty'        => $qty,
                    'harga'      => $harga ? $harga->harga : 55000,
                    'subtotal'   => $subtotal,
                ]);
            }


            // ==================== PESANAN DATA 4 (Mitra 4 - Maklon - PRD-004) ====================
            $m = $getMitra(3); // Mitra Keempat
            $p4 = $produk->get('PRD-004');
            if ($p4) {
                $jenisTx = 'Maklon'; // Disamakan ke Maklon agar aman dari truncate error ENUM
                $harga = $getHarga($p4->id_produk, $jenisTx) ?? $getHarga($p4->id_produk, 'Penjualan Langsung');
                $qty = 25;
                $subtotal = $qty * ($harga ? $harga->harga : 70000);

                $idPesanan = DB::table('t_pesanan')->insertGetId([
                    'no_pesanan'      => 'SO-' . Carbon::now()->format('Ymd') . '-0004',
                    'tgl_pesanan'     => Carbon::now()->toDateString(),
                    'id_mitra'        => $m->id_mitra,
                    'jenis_transaksi' => $jenisTx,
                    'alamat'          => $m->alamat, 
                    'total_harga'     => $subtotal,
                    'created_at'      => Carbon::now(),
                    'updated_at'      => Carbon::now(),
                ]);

                DB::table('t_pesanan_detail')->insert([
                    'id_pesanan' => $idPesanan,
                    'id_produk'  => $p4->id_produk,
                    'id_harga'   => $harga ? $harga->id_harga_produk : 7,
                    'qty'        => $qty,
                    'harga'      => $harga ? $harga->harga : 70000,
                    'subtotal'   => $subtotal,
                ]);
            }


            // ==================== PESANAN DATA 5 (Mitra 5 - Maklon - PRD-005) ====================
            $m = $getMitra(4); // Mitra Kelima
            $p5 = $produk->get('PRD-005');
            if ($p5) {
                $harga = $getHarga($p5->id_produk, 'Maklon');
                $qty = 40;
                $subtotal = $qty * ($harga ? $harga->harga : 120000);

                $idPesanan = DB::table('t_pesanan')->insertGetId([
                    'no_pesanan'      => 'SO-' . Carbon::now()->format('Ymd') . '-0005',
                    'tgl_pesanan'     => Carbon::now()->toDateString(),
                    'id_mitra'        => $m->id_mitra,
                    'jenis_transaksi' => 'Maklon',
                    'alamat'          => $m->alamat, 
                    'total_harga'     => $subtotal,
                    'created_at'      => Carbon::now(),
                    'updated_at'      => Carbon::now(),
                ]);

                DB::table('t_pesanan_detail')->insert([
                    'id_pesanan' => $idPesanan,
                    'id_produk'  => $p5->id_produk,
                    'id_harga'   => $harga ? $harga->id_harga_produk : 8,
                    'qty'        => $qty,
                    'harga'      => $harga ? $harga->harga : 120000,
                    'subtotal'   => $subtotal,
                ]);
            }


            // ==================== PESANAN DATA 6 (Mitra 1 - Penjualan Langsung - Multi Items PRD-006 & PRD-007) ====================
            $m = $getMitra(0); // Kembali Berputar ke Mitra Pertama
            $p6 = $produk->get('PRD-006');
            $p7 = $produk->get('PRD-007');

            if ($p6 && $p7) {
                $h6 = $getHarga($p6->id_produk, 'Penjualan Langsung');
                $h7 = $getHarga($p7->id_produk, 'Penjualan Langsung');

                $qty6 = 8;  $price6 = $h6 ? $h6->harga : 35000; $sub6 = $qty6 * $price6;
                $qty7 = 12; $price7 = $h7 ? $h7->harga : 95000; $sub7 = $qty7 * $price7;
                $total = $sub6 + $sub7;

                $idPesanan = DB::table('t_pesanan')->insertGetId([
                    'no_pesanan'      => 'SO-' . Carbon::now()->format('Ymd') . '-0006',
                    'tgl_pesanan'     => Carbon::now()->toDateString(),
                    'id_mitra'        => $m->id_mitra,
                    'jenis_transaksi' => 'Penjualan Langsung',
                    'alamat'          => $m->alamat, 
                    'total_harga'     => $total,
                    'created_at'      => Carbon::now(),
                    'updated_at'      => Carbon::now(),
                ]);

                DB::table('t_pesanan_detail')->insert([
                    [
                        'id_pesanan' => $idPesanan,
                        'id_produk'  => $p6->id_produk,
                        'id_harga'   => $h6 ? $h6->id_harga_produk : 9,
                        'qty'        => $qty6,
                        'harga'      => $price6,
                        'subtotal'   => $sub6,
                    ],
                    [
                        'id_pesanan' => $idPesanan,
                        'id_produk'  => $p7->id_produk,
                        'id_harga'   => $h7 ? $h7->id_harga_produk : 12,
                        'qty'        => $qty7,
                        'harga'      => $price7,
                        'subtotal'   => $sub7,
                    ]
                ]);
            }


            // ==================== PESANAN DATA 7 (Mitra 2 - Penjualan Langsung - Bulk PRD-003) ====================
            $m = $getMitra(1); // Menggunakan Mitra Kedua
            $p3 = $produk->get('PRD-003');
            if ($p3) {
                $harga = $getHarga($p3->id_produk, 'Penjualan Langsung');
                $qty = 100;
                $subtotal = $qty * ($harga ? $harga->harga : 60000);

                $idPesanan = DB::table('t_pesanan')->insertGetId([
                    'no_pesanan'      => 'SO-' . Carbon::now()->format('Ymd') . '-0007',
                    'tgl_pesanan'     => Carbon::now()->toDateString(),
                    'id_mitra'        => $m->id_mitra,
                    'jenis_transaksi' => 'Penjualan Langsung',
                    'alamat'          => $m->alamat, 
                    'total_harga'     => $subtotal,
                    'created_at'      => Carbon::now(),
                    'updated_at'      => Carbon::now(),
                ]);

                DB::table('t_pesanan_detail')->insert([
                    'id_pesanan' => $idPesanan,
                    'id_produk'  => $p3->id_produk,
                    'id_harga'   => $harga ? $harga->id_harga_produk : 4,
                    'qty'        => $qty,
                    'harga'      => $harga ? $harga->harga : 60000,
                    'subtotal'   => $subtotal,
                ]);
            }

            $this->command->info("Seeder t_pesanan berhasil dimix berdasarkan mitra dan produk!");
        });
    }
}
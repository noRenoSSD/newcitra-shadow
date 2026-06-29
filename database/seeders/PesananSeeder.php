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
        // Gunakan DB::transaction agar proses insert aman dan sinkron
        DB::transaction(function () {
            
            // 1. Ambil data dari t_mitra dan t_produk
            $mitra = DB::table('t_mitra')->first();
            $produkList = DB::table('t_produk')->limit(2)->get();
            
            // Proteksi jika master data masih kosong
            if (!$mitra || $produkList->isEmpty()) {
                $this->command->error("Gagal menjalankan Seeder! Pastikan seeder t_mitra dan t_produk sudah di-run terlebih dahulu.");
                return;
            }

            // ==================== PESANAN DATA 1 (Penjualan Langsung) ====================
            // Ambil snapshot harga produk 1 untuk tipe 'Penjualan Langsung' dari t_harga_produk
            $hargaProd1 = DB::table('t_harga_produk')
                ->where('id_produk', $produkList[0]->id_produk)
                ->where('jenis_transaksi', 'Penjualan Langsung')
                ->first();

            $qty1 = 5;
            $subtotal1 = $qty1 * ($hargaProd1 ? $hargaProd1->harga : 50000);

            // Insert ke table utama t_pesanan
            $idPesanan1 = DB::table('t_pesanan')->insertGetId([
                'no_pesanan'      => 'SO-' . Carbon::now()->format('Ymd') . '-0001',
                'tgl_pesanan'     => Carbon::now()->toDateString(),
                'id_mitra'        => $mitra->id_mitra,
                'jenis_transaksi' => 'Penjualan Langsung',
                'alamat'          => $mitra->alamat, 
                'total_harga'     => $subtotal1,
                'created_at'      => Carbon::now(),
                'updated_at'      => Carbon::now(),
            ]);

            // Insert ke table relasi detail t_pesanan_detail
            DB::table('t_pesanan_detail')->insert([
                'id_pesanan' => $idPesanan1,
                'id_produk'  => $produkList[0]->id_produk,
                'id_harga'   => $hargaProd1 ? $hargaProd1->id_harga_produk : 1, // Menggunakan id_harga_produk
                'qty'        => $qty1,
                'harga'      => $hargaProd1 ? $hargaProd1->harga : 50000,
                'subtotal'   => $subtotal1,
            ]);


            // ==================== PESANAN DATA 2 (Konsinyasi - Multi Items) ====================
            if ($produkList->count() >= 2) {
                // Ambil snapshot harga untuk tipe 'Konsinyasi' dari t_harga_produk
                $hargaP1_konsinyasi = DB::table('t_harga_produk')
                    ->where('id_produk', $produkList[0]->id_produk)
                    ->where('jenis_transaksi', 'Konsinyasi')
                    ->first();

                $hargaP2_konsinyasi = DB::table('t_harga_produk')
                    ->where('id_produk', $produkList[1]->id_produk)
                    ->where('jenis_transaksi', 'Konsinyasi')
                    ->first();

                $p1_qty = 10;
                $p1_price = $hargaP1_konsinyasi ? $hargaP1_konsinyasi->harga : 45000;
                $p1_subtotal = $p1_qty * $p1_price;

                $p2_qty = 20;
                $p2_price = $hargaP2_konsinyasi ? $hargaP2_konsinyasi->harga : 75000;
                $p2_subtotal = $p2_qty * $p2_price;

                $totalHarga2 = $p1_subtotal + $p2_subtotal;

                // Insert t_pesanan kedua dengan jenis_transaksi 'Konsinyasi'
                $idPesanan2 = DB::table('t_pesanan')->insertGetId([
                    'no_pesanan'      => 'SO-' . Carbon::now()->format('Ymd') . '-0002',
                    'tgl_pesanan'     => Carbon::now()->toDateString(),
                    'id_mitra'        => $mitra->id_mitra,
                    'jenis_transaksi' => 'Konsinyasi',
                    'alamat'          => $mitra->alamat, 
                    'total_harga'     => $totalHarga2,
                    'created_at'      => Carbon::now(),
                    'updated_at'      => Carbon::now(),
                ]);

                // Insert Item Multi Detail ke t_pesanan_detail
                DB::table('t_pesanan_detail')->insert([
                    [
                        'id_pesanan' => $idPesanan2,
                        'id_produk'  => $produkList[0]->id_produk,
                        'id_harga'   => $hargaP1_konsinyasi ? $hargaP1_konsinyasi->id_harga_produk : 1,
                        'qty'        => $p1_qty,
                        'harga'      => $p1_price,
                        'subtotal'   => $p1_subtotal,
                    ],
                    [
                        'id_pesanan' => $idPesanan2,
                        'id_produk'  => $produkList[1]->id_produk,
                        'id_harga'   => $hargaP2_konsinyasi ? $hargaP2_konsinyasi->id_harga_produk : 2,
                        'qty'        => $p2_qty,
                        'harga'      => $p2_price,
                        'subtotal'   => $p2_subtotal,
                    ]
                ]);
            }

            $this->command->info("Seeder t_pesanan dan t_pesanan_detail berhasil disuntikkan!");
        });
    }
}
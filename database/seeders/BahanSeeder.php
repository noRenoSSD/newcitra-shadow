<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BahanSeeder extends Seeder
{
    public function run(): void
    {
        $dataBahan = [
            // === BAHAN POKOK (Kategori: baku -> Kode: BB) ===
            ['nama' => 'Bandeng Isi 3', 'tipe' => 'baku', 'satuan' => 'Kg', 'harga' => 11666.67],
            ['nama' => 'Asam Kawak', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 70.00],
            ['nama' => 'Bawang Merah', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 55.00],
            ['nama' => 'Bawang Merah Goreng', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 283.33],
            ['nama' => 'Bawang Putih', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 46.00],
            ['nama' => 'Bumbu Dapur', 'tipe' => 'baku', 'satuan' => 'Paket', 'harga' => 5000.00],
            ['nama' => 'Bumbu Pepes', 'tipe' => 'baku', 'satuan' => 'Paket', 'harga' => 15000.00],
            ['nama' => 'Cabe Merah', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 65.00],
            ['nama' => 'Cabe Rawit Merah', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 100.00],
            ['nama' => 'Daging Sapi', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 110.00],
            ['nama' => 'Daun Jeruk', 'tipe' => 'baku', 'satuan' => 'Paket', 'harga' => 5000.00],
            ['nama' => 'Daun Kemangi', 'tipe' => 'baku', 'satuan' => 'Paket', 'harga' => 40000.00],
            ['nama' => 'Daun Pisang', 'tipe' => 'baku', 'satuan' => 'Paket', 'harga' => 20000.00],
            ['nama' => 'Garam Bata', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 12.70],
            ['nama' => 'Garam Halus', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 8.00],
            ['nama' => 'Gula Pasir', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 12.50],
            ['nama' => 'Jahe', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 40.00],
            ['nama' => 'Jahe Bubuk', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 150.00],
            ['nama' => 'Kemiri', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 220.83],
            ['nama' => 'Kencur', 'tipe' => 'baku', 'satuan' => 'Sachet', 'harga' => 1000.00],
            ['nama' => 'Ketumbar', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 64.00],
            ['nama' => 'Kunyit', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 80.00],
            ['nama' => 'Ladaku', 'tipe' => 'baku', 'satuan' => 'Sachet', 'harga' => 100],
            ['nama' => 'Masako Sapi', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 36.67],
            ['nama' => 'Pala', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 27.50],
            ['nama' => 'Pengenyal', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 47.00],
            ['nama' => 'Penyedap Rasa', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 28.00],
            ['nama' => 'Sambal', 'tipe' => 'baku', 'satuan' => 'Sachet', 'harga' => 1000.00],
            ['nama' => 'Saos Sambal', 'tipe' => 'baku', 'satuan' => 'Sachet', 'harga' => 1000.00],
            ['nama' => 'Tahu Goreng', 'tipe' => 'baku', 'satuan' => 'Biji', 'harga' => 425.00],
            ['nama' => 'Telur', 'tipe' => 'baku', 'satuan' => 'Butir', 'harga' => 333.33],
            ['nama' => 'Tepung Aren', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 14.00],
            ['nama' => 'Tepung Panir', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 233.33],
            ['nama' => 'Tepung Tapioka', 'tipe' => 'baku', 'satuan' => 'Gr', 'harga' => 10.80],

            // === BAHAN PENOLONG & PACKAGING (Kategori: penolong -> Kode: BP) ===
            ['nama' => 'Gas', 'tipe' => 'penolong', 'satuan' => 'Tabung', 'harga' => 23000.00],
            ['nama' => 'Dus Bandeng Merah', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 2000.00],
            ['nama' => 'Boilpack 1725', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 1215.00],
            ['nama' => 'Bp Transparan 1330', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 775.00],
            ['nama' => 'Dus Coklat', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 1250.00],
            ['nama' => 'Dus Coklat Besar', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 1500.00],
            ['nama' => 'Dus Otak Otak', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 1250.00],
            ['nama' => 'Dus Pepes', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 1250.00],
            ['nama' => 'Dus Tahu Bakso', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 1500.00],
            ['nama' => 'Dus Tahu Isi 5', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 1250.00],
            ['nama' => 'Kemasan Retort', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 3000.00],
            ['nama' => 'Plastik Shrink Tahu Bakso Isi 8', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 350.00],
            ['nama' => 'Plastik Shrink Tahu Bakso Premium', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 350.00],
            ['nama' => 'Plastik Srink', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 350.00],
            ['nama' => 'Plastik Strink Bandeng', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 350.00],
            ['nama' => 'Retort Pack-1335', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 1050.00],
            ['nama' => 'Retort Pack-1335 Isi 1', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 975.00],
            ['nama' => 'Tas Bandeng', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 2000.00],
            ['nama' => 'Tas Plastik Bandeng', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 1000.00],
            ['nama' => 'Vacuum Pack-1335', 'tipe' => 'penolong', 'satuan' => 'Lembar', 'harga' => 700.00],
        ];

        $counterBaku = 1;
        $counterPenolong = 1;

        foreach ($dataBahan as $bahan) {
            if ($bahan['tipe'] === 'baku') {
                $kodeBahan = 'BB-' . str_pad($counterBaku, 3, '0', STR_PAD_LEFT);
                $counterBaku++;
            } else {
                $kodeBahan = 'BP-' . str_pad($counterPenolong, 3, '0', STR_PAD_LEFT);
                $counterPenolong++;
            }

            DB::table('t_bahan')->insert([
                'jenis_bahan'  => $bahan['tipe'],
                'kode_bahan'   => $kodeBahan,
                'nama_bahan'   => $bahan['nama'],
                'satuan_bahan' => $bahan['satuan'],
                'harga_beli'   => $bahan['harga'], // <--- Kolom harga_beli dimasukkan ke sini
                'stok_min'     => 10.00,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Akun;
use Illuminate\Database\Seeder;

class AkunSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            // Aset Lancar (Debit)
            ['kode_akun' => '1001001', 'nama_akun' => 'KAS', 'kategori' => 'Aset Lancar', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1001002', 'nama_akun' => 'BANK', 'kategori' => 'Aset Lancar', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1001003', 'nama_akun' => 'PIUTANG USAHA', 'kategori' => 'Aset Lancar', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1001004', 'nama_akun' => 'PERSEDIAAN BAHAN BAKU', 'kategori' => 'Aset Lancar', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1001005', 'nama_akun' => 'PERSEDIAAN BAHAN KEMASAN', 'kategori' => 'Aset Lancar', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1001006', 'nama_akun' => 'PERSEDIAAN BARANG JADI', 'kategori' => 'Aset Lancar', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1001007', 'nama_akun' => 'PERSEDIAAN BARANG KONSINYASI', 'kategori' => 'Aset Lancar', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],

            // Aset Tetap (Debit)
            ['kode_akun' => '1002001', 'nama_akun' => 'ASET TETAP - PERALATAN', 'kategori' => 'Aset Tetap', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1002002', 'nama_akun' => 'ASET TETAP - MESIN', 'kategori' => 'Aset Tetap', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1002003', 'nama_akun' => 'ASET TETAP - KENDARAAN', 'kategori' => 'Aset Tetap', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1002004', 'nama_akun' => 'ASET TETAP - BANGUNAN', 'kategori' => 'Aset Tetap', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1002005', 'nama_akun' => 'ASET TETAP - TANAH', 'kategori' => 'Aset Tetap', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1002006', 'nama_akun' => 'AKUMULASI DEPRESIASI - PERALATAN', 'kategori' => 'Aset Tetap', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1002007', 'nama_akun' => 'AKUMULASI DEPRESIASI - MESIN', 'kategori' => 'Aset Tetap', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1002008', 'nama_akun' => 'AKUMULASI DEPRESIASI - KENDARAAN', 'kategori' => 'Aset Tetap', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '1002009', 'nama_akun' => 'AKUMULASI DEPRESIASI - BANGUNAN', 'kategori' => 'Aset Tetap', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],

            // Liabilitas & Ekuitas (Kredit)
            ['kode_akun' => '2001001', 'nama_akun' => 'HUTANG USAHA', 'kategori' => 'Liabilitas', 'saldo_normal' => 'Kredit', 'saldo_awal' => 0],
            ['kode_akun' => '3001001', 'nama_akun' => 'MODAL PEMILIK', 'kategori' => 'Ekuitas', 'saldo_normal' => 'Kredit', 'saldo_awal' => 0],
            ['kode_akun' => '3002001', 'nama_akun' => 'LABA DITAHAN', 'kategori' => 'Ekuitas', 'saldo_normal' => 'Kredit', 'saldo_awal' => 0],

            // Pendapatan (Kredit)
            ['kode_akun' => '4001001', 'nama_akun' => 'PENJUALAN - TAHU BAKSO', 'kategori' => 'Pendapatan', 'saldo_normal' => 'Kredit', 'saldo_awal' => 0],
            ['kode_akun' => '4001002', 'nama_akun' => 'PENJUALAN - BANDENG', 'kategori' => 'Pendapatan', 'saldo_normal' => 'Kredit', 'saldo_awal' => 0],
            ['kode_akun' => '4001003', 'nama_akun' => 'PENJUALAN - OTAK-OTAK', 'kategori' => 'Pendapatan', 'saldo_normal' => 'Kredit', 'saldo_awal' => 0],
            ['kode_akun' => '4001004', 'nama_akun' => 'PENJUALAN - PEPES', 'kategori' => 'Pendapatan', 'saldo_normal' => 'Kredit', 'saldo_awal' => 0],
            ['kode_akun' => '4001005', 'nama_akun' => 'RETUR PENJUALAN', 'kategori' => 'Pendapatan', 'saldo_normal' => 'Kredit', 'saldo_awal' => 0],

            // Beban Pokok Penjualan (Debit)
            ['kode_akun' => '5001001', 'nama_akun' => 'HPP', 'kategori' => 'Beban Pokok Penjualan', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '5001002', 'nama_akun' => 'RETUR PEMBELIAN', 'kategori' => 'Beban Pokok Penjualan', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],

            // Beban Operasional (Debit)
            ['kode_akun' => '6001001', 'nama_akun' => 'BEBAN GAJI DISTRIBUSI', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6001002', 'nama_akun' => 'BEBAN CETAKAN BUKU, PO', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6001003', 'nama_akun' => 'BEBAN PENGIRIMAN', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6001004', 'nama_akun' => 'BEBAN BBM TOL PARKIR', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6001005', 'nama_akun' => 'BEBAN PEMELIHARAAN KENDARAAN', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6001006', 'nama_akun' => 'BEBAN KERUSAKAN BARANG', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6001007', 'nama_akun' => 'BEBAN SELISIH PERSEDIAAN', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6002001', 'nama_akun' => 'BEBAN GAJI MARKETING', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6002002', 'nama_akun' => 'BEBAN PROMOSI, SAMPEL', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6003001', 'nama_akun' => 'BEBAN GAJI DIREKSI', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6003002', 'nama_akun' => 'BEBAN GAJI KARYAWAN', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6003003', 'nama_akun' => 'BEBAN THR', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6003004', 'nama_akun' => 'BEBAN ATK', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6003005', 'nama_akun' => 'BEBAN FOTOCOPY & CETAKAN', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6006001', 'nama_akun' => 'BEBAN FASILITAS KANTOR', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6006002', 'nama_akun' => 'BEBAN FASILITAS KENDARAAN', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6006003', 'nama_akun' => 'BEBAN ENTERTAIN', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6006004', 'nama_akun' => 'BEBAN KOMUNIKASI', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6006005', 'nama_akun' => 'BEBAN PENYUSUTAN PERALATAN', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6006006', 'nama_akun' => 'BEBAN PENYUSUTAN MESIN', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6006007', 'nama_akun' => 'BEBAN PENYUSUTAN KENDARAAN', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6006008', 'nama_akun' => 'BEBAN PENYUSUTAN BANGUNAN', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '6006009', 'nama_akun' => 'BEBAN OPERASIONAL LAIN-LAIN', 'kategori' => 'Beban Operasional', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            
            // Penghasilan Lain-lain (Kredit)
            ['kode_akun' => '8001000', 'nama_akun' => 'BEBAN ADMINISTRASI BANK', 'kategori' => 'Penghasilan Lain-lain', 'saldo_normal' => 'Kredit', 'saldo_awal' => 0], // Catatan: Namanya 'Beban' tapi di kategori 'Penghasilan Lain-lain', tetap Kredit sesuai request
            
            // Beban Lain-lain (Debit)
            ['kode_akun' => '9001000', 'nama_akun' => 'BEBAN PAJAK BUMI DAN BANGUNAN', 'kategori' => 'Beban Lain-lain', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '9002000', 'nama_akun' => 'BEBAN PAJAK PPH 4 AYAT 2 FINAL', 'kategori' => 'Beban Lain-lain', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
            ['kode_akun' => '9003000', 'nama_akun' => 'BEBAN PAJAK PPH 23', 'kategori' => 'Beban Lain-lain', 'saldo_normal' => 'Debit', 'saldo_awal' => 0],
        ];

        foreach ($data as $item) {
            Akun::updateOrCreate(
                ['kode_akun' => $item['kode_akun']],
                $item
            );
        }
    }
}
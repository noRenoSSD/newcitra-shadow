<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class InventoryService
{
    public static function catatMutasi(
        $id_item,
        $tipe,          // 'bahan' atau 'produk'
        $jenis,         // 'MASUK', 'KELUAR', atau 'PENYESUAIAN'
        $sumber,        // 'penerimaan', 'produksi_keluar', 'penyesuaian_harga'
        $no_bukti,
        $qty,
        $harga_input = 0,
        $tanggal,
        $keterangan = null
    ) {
        $kolom_id = ($tipe === 'bahan') ? 'id_bahan' : 'id_produk';

        // 1. Ambil Saldo Terakhir
        $lastSaldo = DB::table('t_kartu_persediaan')
            ->where($kolom_id, $id_item)
            ->orderBy('tanggal_transaksi', 'desc')
            ->orderBy('id_kartu', 'desc')
            ->first();

        $lastQty = $lastSaldo ? $lastSaldo->saldo_qty : 0;
        $lastTotal = $lastSaldo ? $lastSaldo->saldo_total : 0;
        $lastHargaAverage = $lastSaldo ? $lastSaldo->saldo_harga : 0;

        $qty_masuk = 0; $harga_masuk = 0; $total_masuk = 0;
        $qty_keluar = 0; $harga_keluar = 0; $total_keluar = 0;

        // 2. LOGIKA BARU: Jika ini HANYA Penyesuaian Harga Nilai Uang (Kenaikan/Penurunan Harga Nota)
        if ($sumber === 'penyesuaian_harga') {
            $total_masuk = $harga_input; // Harga input diisi TOTAL NILAI SELISIHNYA

            $newQty = $lastQty; // Qty TETAP tidak berubah
            $newTotal = $lastTotal + $total_masuk; // Nilai uang di gudang disesuaikan
            $newHargaAverage = $newQty > 0 ? ($newTotal / $newQty) : 0; // Hitung ulang rata-rata harga baru

            $jenis = 'MASUK'; // Masuk ke kolom nilai uang masuk
        }
        // 3. Logika Normal Masuk Barang (Saat Penerimaan)
        elseif (strtoupper($jenis) === 'MASUK') {
            $qty_masuk = $qty;
            $harga_masuk = $harga_input;
            $total_masuk = $qty * $harga_input;

            $newQty = $lastQty + $qty_masuk;
            $newTotal = $lastTotal + $total_masuk;
            $newHargaAverage = $newQty > 0 ? ($newTotal / $newQty) : 0;
        }
        // 4. Logika Normal Keluar Barang (Saat Produksi)
        else {
            $qty_keluar = $qty;

            // --- KUNCI PERBAIKAN: Pisahkan Harga Retur dan Harga Produksi ---
            if ($sumber === 'retur_pembelian') {
                // Gunakan harga aktual spesifik dari Controller (Rp 25.250)
                $harga_keluar = $harga_input;
            } else {
                // Gunakan harga Rata-rata Bergerak (Moving Average) untuk produksi
                $harga_keluar = $lastHargaAverage;
            }

            $total_keluar = $qty * $harga_keluar;

            // Hitung sisa stok dan total nilai
            $newQty = $lastQty - $qty_keluar;
            $newTotal = $lastTotal - $total_keluar;

            // --- PENTING ---
            // Hitung ulang harga rata-rata secara dinamis.
            // Karena barang diretur dengan harga spesifik, rata-rata stok yang tersisa di gudang akan otomatis bergeser menyesuaikan.
            $newHargaAverage = $newQty > 0 ? ($newTotal / $newQty) : 0;
        }

        // 3. Simpan ke Database
        DB::table('t_kartu_persediaan')->insert([
            'tanggal_transaksi' => $tanggal,
            $kolom_id           => $id_item,
            'jenis_transaksi'   => $jenis,
            'sumber_transaksi'  => $sumber,
            'no_referensi'      => $no_bukti,
            'keterangan'        => $keterangan,
            'qty_masuk'         => $qty_masuk,
            'harga_masuk'       => $harga_masuk,
            'total_masuk'       => $total_masuk,
            'qty_keluar'        => $qty_keluar,
            'harga_keluar'      => $harga_keluar,
            'total_keluar'      => $total_keluar,
            'saldo_qty'         => $newQty,
            'saldo_harga'       => $newHargaAverage,
            'saldo_total'       => $newTotal,
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);
    }
}

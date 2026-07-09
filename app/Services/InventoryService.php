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
        $keterangan = null,
        $total_input = null // <--- TAMBAHAN PARAMETER BARU (Ke-10)
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

        // 2. LOGIKA BARU UNTUK BARANG MASUK
        if ($jenis === 'MASUK') {
            $qty_masuk = $qty;

            // KUNCI PERBAIKAN: Jika total_input dikirim dari controller, pakai itu!
            $total_masuk = $total_input !== null ? $total_input : ($qty * $harga_input);
            $harga_masuk = $qty > 0 ? ($total_masuk / $qty) : $harga_input; // Harga satuan menyesuaikan total

            $newQty = $lastQty + $qty_masuk;
            $newTotal = $lastTotal + $total_masuk;
            $newHargaAverage = $newQty > 0 ? ($newTotal / $newQty) : 0;
        }
        // 3. LOGIKA NORMAL KELUAR BARANG
        else {
            $qty_keluar = $qty;

            if ($sumber === 'retur_pembelian') {
                // KUNCI PERBAIKAN UNTUK RETUR:
                $total_keluar = $total_input !== null ? $total_input : ($qty * $harga_input);
                $harga_keluar = $qty > 0 ? ($total_keluar / $qty) : $harga_input;
            } else {
                $harga_keluar = $lastHargaAverage;
                $total_keluar = $qty * $harga_keluar;
            }

            $newQty = $lastQty - $qty_keluar;
            $newTotal = $lastTotal - $total_keluar;
            $newHargaAverage = $newQty > 0 ? ($newTotal / $newQty) : 0;
        }

        // 4. Simpan ke Database
        // ... (Kode insert DB::table('t_kartu_persediaan') ke bawah biarkan sama persis seperti aslinya)

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

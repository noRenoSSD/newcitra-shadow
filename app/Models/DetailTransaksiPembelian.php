<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailTransaksiPembelian extends Model
{
    protected $table = 't_detail_transaksi_pembelian';
    protected $primaryKey = 'id_detail_transaksi';
    protected $guarded = [];

    // Relasi ke Header
    public function transaksi()
    {
        return $this->belongsTo(TransaksiPembelian::class, 'id_transaksi', 'id_transaksi');
    }

    // Relasi ke Detail Penerimaan (untuk ambil nama bahan, dll)
    public function detailPenerimaan()
    {
        return $this->belongsTo(DetailPenerimaanBahan::class, 'id_detail_penerimaan', 'id_detail_penerimaan');
    }
}

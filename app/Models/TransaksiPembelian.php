<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransaksiPembelian extends Model
{
    protected $table = 't_transaksi_pembelian';
    protected $primaryKey = 'id_transaksi';
    protected $guarded = [];

    // Relasi ke detail (Header punya banyak Detail)
    public function details()
    {
        return $this->hasMany(DetailTransaksiPembelian::class, 'id_transaksi', 'id_transaksi');
    }

    // Relasi ke Penerimaan
    public function penerimaanBahan()
    {
        return $this->belongsTo(PenerimaanBahan::class, 'id_penerimaan', 'id_penerimaan');
    }

    //relasi ke hutang
    public function hutangUsaha()
{
    return $this->hasOne(HutangUsaha::class, 'id_transaksi', 'id_transaksi');
}
}

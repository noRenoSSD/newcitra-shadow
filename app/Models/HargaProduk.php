<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Produk;
use App\Models\Mitra;

class HargaProduk extends Model
{
    protected $table = 't_harga_produk';

    protected $primaryKey = 'id_harga_produk';

    protected $fillable = [
        'id_produk',
        'id_mitra',
        'jenis_transaksi',
        'harga'
    ];

    public function produk()
    {
        return $this->belongsTo(
            Produk::class,
            'id_produk',
            'id_produk'
        );
    }

    public function mitra()
    {
        return $this->belongsTo(
            Mitra::class,
            'id_mitra',
            'id_mitra'
        );
    }
}
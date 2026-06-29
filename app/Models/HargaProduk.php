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
        'kode_harga',
        'id_produk',
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
    public function pesananDetail()
    {
        return $this->hasMany(PesananDetail::class, 
        'id_harga', 'id_harga_produk');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PesananDetail extends Model
{
    protected $table = 't_pesanan_detail';

    protected $primaryKey = 'id_pesanan_detail';

    protected $fillable = [
        'id_pesanan',
        'id_produk',
        'id_harga',
        'harga',
        'qty',
        'subtotal',
    ];

    public function pesanan()
    {
        return $this->belongsTo(Pesanan::class, 'id_pesanan', 'id_pesanan');
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk', 'id_produk');
    }

    public function hargaProduk()
    {
        return $this->belongsTo(HargaProduk::class, 'id_harga', 'id_harga_produk');
    }
}
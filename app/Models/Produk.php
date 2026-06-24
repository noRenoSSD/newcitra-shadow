<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produk extends Model
{
    protected $table = 't_produk';
    protected $primaryKey = 'id_produk';
    protected $fillable = [
        'kode_produk',
        'nama_produk',
        'satuan_produk'
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\HargaProduk;

class Produk extends Model
{
    protected $table = 't_produk';
    protected $primaryKey = 'id_produk';

    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'kode_produk',
        'nama_produk',
        'satuan_produk',
    ];

    /**
     * DIUBAH: Menggunakan snake_case 'harga_produk' 
     * agar cocok dengan Eager Loading di Controller -> with('harga_produk')
     */
    public function harga_produk()
    {
        return $this->hasMany(
            \App\Models\HargaProduk::class,
            'id_produk',
            'id_produk'
        );
    }

    public function pesananDetail()
    {
        return $this->hasMany(PesananDetail::class,
            'id_produk', 
            'id_produk'
        );
    }
}
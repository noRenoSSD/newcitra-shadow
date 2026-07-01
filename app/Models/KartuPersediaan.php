<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KartuPersediaan extends Model
{
    // Menentukan tabel yang digunakan
    protected $table = 't_kartu_persediaan';

    // Menentukan primary key
    protected $primaryKey = 'id_kartu';

    // Agar bisa diisi data (Mass Assignment)
    protected $guarded = [];

    // Relasi opsional ke Bahan (Bisa digunakan untuk laporan nantinya)
    public function bahan()
    {
        return $this->belongsTo(Bahan::class, 'id_bahan', 'id_bahan');
    }

    // Relasi opsional ke Produk Jadi (Bisa digunakan untuk laporan nantinya)
    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk', 'id_produk');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\HargaProduk;


class Mitra extends Model
{
    protected $table = 't_mitra';

    protected $primaryKey = 'id_mitra';

    protected $fillable = [
        'kode_mitra',
        'nama_mitra',
        'pic_mitra',
        'alamat',
        'no_telp',
        'kota',
        'status',
    ];
    public function hargaProduk()
    {
        return $this->hasMany(HargaProduk::class, 'id_mitra', 'id_mitra');
    }
}

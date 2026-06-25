<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Akun extends Model
{
    protected $table = 't_akun';
    protected $primaryKey = 'id_akun';

    // Proteksi Mass Assignment Vunerability
    protected $fillable = [
        'kode_akun',
        'nama_akun',
        'kategori',
    ];
}
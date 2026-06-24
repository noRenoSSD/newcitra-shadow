<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengeluaran extends Model
{
    protected $table = 't_pengeluaran';
    protected $primaryKey = 'id_pengeluaran';
    protected $fillable = [
        'kode_pengeluaran',
        'nama_pengeluaran',
        'keterangan'
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KartuPersediaan extends Model
{
    use HasFactory;

    protected $table = 't_kartu_persediaan';
    protected $primaryKey = 'id_kartu';
    protected $guarded = [];

    protected $casts = [
        'tanggal_transaksi' => 'date',
    ];
}

<?php

namespace App\Models;

// TAMBAHKAN BARIS INI:
use Illuminate\Database\Eloquent\Model;

class ReturJualDetail extends Model
{
    protected $table = 't_retur_jual_detail';
    protected $primaryKey = 'id_retur_jual_detail';
    protected $guarded = [];
}

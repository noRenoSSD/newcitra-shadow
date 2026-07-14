<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerpanjanganPiutang extends Model
{
    use HasFactory;
    protected $table = 't_piutang_perpanjangan';
    protected $primaryKey = 'id_perpanjangan';

    protected $fillable = [
        'no_perpanjang',
        'tgl_perpanjang',
        'id_jual',
        'nilai_piutang',
        'jt_lama',
        'jt_baru',
        'alasan',
        'selisih_hari',
    ];

    public function penjualan()
    {
        return $this->belongsTo(Jual::class, 'id_jual', 'id_jual');
    }
}
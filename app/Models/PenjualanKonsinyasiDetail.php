<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenjualanKonsinyasiDetail extends Model
{
    protected $table = 't_jual_konsinyasi_detail'; // Tetap mengarah ke tabel asli kamu
    protected $primaryKey = 'id_jual_konsinyasi_detail';

    protected $fillable = [
        'id_jual_konsinyasi',
        'id_produk',
        'qty_terjual',
        'harga_jual',
        'subtotal',
        'hpp_satuan',
    ];

    public function header()
    {
        // Relasi mengarah ke model induk yang baru
        return $this->belongsTo(PenjualanKonsinyasi::class, 'id_jual_konsinyasi', 'id_jual_konsinyasi');
    }
}
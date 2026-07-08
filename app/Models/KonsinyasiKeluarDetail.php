<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KonsinyasiKeluarDetail extends Model
{
    // Mengunci ke nama tabel t_konsinyasi_keluar_detail
    protected $table = 't_konsinyasi_keluar_detail';
    protected $primaryKey = 'id_konsinyasi_detail';
    
    protected $fillable = [
        'id_konsinyasi', 
        'id_produk', 
        'qty', 
        'harga_titip', 
        'qty_terjual', 
        'qty_kembali'
    ];

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk', 'id_produk');
    }

    public function induk()
    {
        return $this->belongsTo(KonsinyasiKeluar::class, 'id_konsinyasi', 'id_konsinyasi');
    }
}
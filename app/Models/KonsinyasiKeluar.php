<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KonsinyasiKeluar extends Model
{
    // Mengunci ke nama tabel t_konsinyasi_keluar
    protected $table = 't_konsinyasi_keluar';
    protected $primaryKey = 'id_konsinyasi';
    
    protected $fillable = [
        'no_konsinyasi', 
        'tgl_konsinyasi', 
        'id_mitra', 
        'total_estimasi', 
        'status', 
        'keterangan'
    ];

    public function mitra()
    {
        return $this->belongsTo(MitraKonsinyasi::class, 'id_mitra', 'id_mitra');
    }

    public function details()
    {
        return $this->hasMany(KonsinyasiKeluarDetail::class, 'id_konsinyasi', 'id_konsinyasi');
    }
}
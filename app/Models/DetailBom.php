<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailBom extends Model
{
    use HasFactory;

    protected $table = 't_detail_bom';
    protected $primaryKey = 'id_detail_bom';

    protected $fillable = [
        'id_bom', 
        'id_bahan', 
        'jumlah_bahan'
    ];

    // Relasi Balik ke BOM Utama
    public function bom()
    {
        return $this->belongsTo(Bom::class, 'id_bom', 'id_bom');
    }

    // Relasi Belongs-To ke Bahan (Asumsi ada model Bahan)
    public function bahan()
    {
        return $this->belongsTo(Bahan::class, 'id_bahan', 'id_bahan');
    }
}
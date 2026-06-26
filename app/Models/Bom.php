<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bom extends Model
{
    use HasFactory;

    protected $table = 't_bom';
    protected $primaryKey = 'id_bom';
    
    protected $fillable = [
        'id_produk',
        'kode_bom', 
        'nama_resep', 
        'qty_batch', 
        'satuan_batch'
    ];

    // Relasi One-to-Many ke Detail Bom
    public function detailBoms()
    {
        return $this->hasMany(DetailBom::class, 'id_bom', 'id_bom');
    }

    // Relasi Belongs-To ke Produk (Asumsi ada model Produk)
    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk', 'id_produk');
    }
}
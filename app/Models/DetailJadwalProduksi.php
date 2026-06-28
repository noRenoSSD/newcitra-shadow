<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailJadwalProduksi extends Model
{
    protected $table = 't_detail_jadwal_produksi';
    protected $primaryKey = 'id_produksi';
    protected $guarded = [];

    public function jadwal()
    {
        return $this->belongsTo(JadwalProduksi::class, 'id_jadwal', 'id_jadwal');
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk', 'id_produk');
    }

    public function bom()
    {
        return $this->belongsTo(Bom::class, 'id_bom', 'id_bom');
    }

    public function kebutuhanBahan()
    {
        return $this->hasMany(KebutuhanBahan::class, 'id_produksi', 'id_produksi');
    }
    
    public function jadwalProduksi()
    {
        return $this->belongsTo(JadwalProduksi::class, 'id_jadwal', 'id_jadwal');
    }
}
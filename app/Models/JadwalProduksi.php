<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalProduksi extends Model
{
    protected $table = 't_jadwal_produksi';
    protected $primaryKey = 'id_jadwal';
    protected $guarded = [];

    public function detailProduksi()
    {
        return $this->hasMany(DetailJadwalProduksi::class, 'id_jadwal', 'id_jadwal');
    }
}
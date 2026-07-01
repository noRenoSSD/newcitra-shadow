<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HasilProduksi extends Model
{
    protected $table = 't_hasil_produksi';
    protected $primaryKey = 'id_hasil_produksi';
    protected $guarded = [];

    // Relasi ke detail jadwal (untuk ambil info produk & target)
    public function detailJadwal()
    {
        return $this->belongsTo(DetailJadwalProduksi::class, 'id_produksi', 'id_produksi');
    }

    // Relasi ke daftar pemakaian
    public function pemakaianBahan()
    {
        return $this->hasMany(PemakaianBahan::class, 'id_hasil_produksi', 'id_hasil_produksi');
    }
}

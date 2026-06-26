<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KebutuhanBahan extends Model
{
    protected $table = 't_kebutuhan_bahan';
    protected $primaryKey = 'id_kebutuhan_bahan';
    protected $guarded = [];

    public function detailProduksi()
    {
        return $this->belongsTo(DetailJadwalProduksi::class, 'id_produksi', 'id_produksi');
    }

    public function detailBom()
    {
        return $this->belongsTo(DetailBom::class, 'id_detail_bom', 'id_detail_bom');
    }
}
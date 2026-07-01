<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturPembelian extends Model
{
    protected $table = 't_retur_pembelian';
    protected $primaryKey = 'id_retur';
    protected $guarded = [];

    // Relasi ke penerimaan bahan
    public function penerimaan()
    {
        return $this->belongsTo(PenerimaanBahan::class, 'id_penerimaan', 'id_penerimaan');
    }

    // Relasi ke detail retur
    public function details()
    {
        return $this->hasMany(DetailReturPembelian::class, 'id_retur', 'id_retur');
    }
}

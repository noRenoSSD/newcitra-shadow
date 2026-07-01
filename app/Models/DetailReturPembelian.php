<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailReturPembelian extends Model
{
    protected $table = 't_detail_retur_pembelian';
    protected $primaryKey = 'id_detail_retur';
    protected $guarded = [];

    public function bahan()
    {
        return $this->belongsTo(Bahan::class, 'id_bahan', 'id_bahan');
    }
}

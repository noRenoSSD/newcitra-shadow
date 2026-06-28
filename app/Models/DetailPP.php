<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailPP extends Model
{
    use HasFactory;

    protected $table = 't_detail_pp';
    protected $primaryKey = 'id_detail_pp';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'id_pp',
        'id_bahan',
        'qty_kebutuhan',
        'qty_diminta',
    ];

    /**
     * Relasi ke PermintaanPembelian
     */
    public function permintaan()
    {
        return $this->belongsTo(PermintaanPembelian::class, 'id_pp', 'id_pp');
    }

    /**
     * Relasi ke Bahan
     */
    public function bahan()
    {
        return $this->belongsTo(Bahan::class, 'id_bahan', 'id_bahan');
    }
}

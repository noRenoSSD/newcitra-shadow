<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KebutuhanBahan extends Model
{
    protected $table      = 't_kebutuhan_bahan';
    protected $primaryKey = 'id_kebutuhan_bahan';

    protected $fillable = [
        'id_produksi',
        'id_detail_bom',
        'qty_bahan_snapshot',
        'qty_kebutuhan',
        'tanggal_generate',
    ];

    protected $casts = [
        'qty_bahan_snapshot' => 'decimal:2',
        'qty_kebutuhan'      => 'decimal:2',
        'tanggal_generate'   => 'date',
    ];

    // ─── Relasi ke DetailJadwalProduksi ──────────────────────────────────────
    public function detailProduksi()
    {
        return $this->belongsTo(DetailJadwalProduksi::class, 'id_produksi', 'id_produksi');
    }

    // ─── Relasi ke DetailBom ──────────────────────────────────────────────────
    public function detailBom()
    {
        return $this->belongsTo(DetailBom::class, 'id_detail_bom', 'id_detail_bom');
    }
}
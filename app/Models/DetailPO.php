<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailPO extends Model
{
    protected $table = 't_detail_po';
    protected $primaryKey = 'id_detail_po';
    protected $keyType = 'int';
    public $incrementing = true;

    // subtotal sengaja dikosongkan dari fillable karena MySQL Generated Column
    protected $fillable = [
        'id_po',
        'id_bahan',
        'id_detail_pp',
        'qty_po',
        'harga_satuan'
    ];

    /**
     * Relasi ke t_purchase_order (Belongs To)
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class, 'id_po', 'id_po');
    }

    /**
     * Relasi ke t_bahan (Belongs To)
     */
    public function bahan(): BelongsTo
    {
        return $this->belongsTo(Bahan::class, 'id_bahan', 'id_bahan');
    }

    /**
     * Relasi ke t_detail_pp (Belongs To)
     */
    public function detailPP(): BelongsTo
    {
        return $this->belongsTo(DetailPP::class, 'id_detail_pp', 'id_detail_pp');
    }
}

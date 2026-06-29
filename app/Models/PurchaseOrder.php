<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrder extends Model
{
    protected $table = 't_purchase_order';
    protected $primaryKey = 'id_po';
    protected $keyType = 'int';
    public $incrementing = true;

    protected $fillable = [
        'no_po',
        'tgl_po',
        'id_pp',
        'id_supplier',
        'metode_beli', // Menyesuaikan dengan perubahan 'termin' -> 'metode_beli'
        'catatan',
        'status',
        'catatan_finance'
    ];

    /**
     * Generate Nomor PO otomatis (Format: PO-0001, PO-0002, dst)
     */
    public static function generateNoPo(): string
    {
        $lastPo = self::orderBy('id_po', 'desc')->first();

        if (!$lastPo) {
            return 'PO-0001';
        }

        // Ambil 4 digit terakhir dari no_po, lalu naikkan 1 angka
        $lastNumber = intval(substr($lastPo->no_po, -4));
        $nextNumber = $lastNumber + 1;

        return 'PO-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Relasi ke t_detail_po (One to Many)
     */
    public function details(): HasMany
    {
        return $this->hasMany(DetailPO::class, 'id_po', 'id_po');
    }

    /**
     * Relasi ke t_permintaan_pembelian (Many to One / Belongs To)
     */
    public function permintaan(): BelongsTo
    {
        return $this->belongsTo(PermintaanPembelian::class, 'id_pp', 'id_pp');
    }

    /**
     * Relasi ke t_supplier (Many to One / Belongs To)
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'id_supplier', 'id');
    }
}

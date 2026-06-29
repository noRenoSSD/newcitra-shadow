<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PermintaanPembelian extends Model
{
    use HasFactory;

    protected $table = 't_permintaan_pembelian';
    protected $primaryKey = 'id_pp';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'no_pp',
        'tgl_pp',
        'id_produksi',
        'jenis_bahan',
        'status',
        'catatan',
    ];

    /**
     * Relasi ke t_purchase_order (One to One)
     */
    public function purchaseOrder(): HasOne
    {
        return $this->hasOne(PurchaseOrder::class, 'id_pp', 'id_pp');
    }

    /**
     * Relasi ke DetailPP
     */
    public function details(): HasMany
    {
        return $this->hasMany(DetailPP::class, 'id_pp', 'id_pp');
    }

    /**
     * Relasi ke DetailJadwalProduksi
     */
    public function detailJadwal()
    {
        return $this->belongsTo(DetailJadwalProduksi::class, 'id_produksi', 'id_produksi');
    }

    /**
     * Generate Nomor Permintaan Pembelian (PP)
     */
    public static function generateNoPp(string $jenis): string
    {
        $prefix = match ($jenis) {
            'baku' => 'PRB',
            'penolong' => 'PRP',
            'tambahan' => 'PRT',
            default => 'PRX',
        };

        $lastRecord = self::where('jenis_bahan', $jenis)
            ->orderBy('id_pp', 'desc')
            ->first();

        if (!$lastRecord) {
            return $prefix . '-0001';
        }

        // Mengambil nomor urut terakhir setelah tanda strip (misal PRB-0001 diambil 0001)
        $lastNumber = (int) substr($lastRecord->no_pp, 4);
        $newNumber = $lastNumber + 1;

        return $prefix . '-' . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}

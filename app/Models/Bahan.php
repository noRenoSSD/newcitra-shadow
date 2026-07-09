<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bahan extends Model
{
    protected $table = 't_bahan';
    protected $primaryKey = 'id_bahan';

    // Sudah ditambahkan 'harga_beli' sesuai instruksi migration sebelumnya
    protected $fillable = [
        'jenis_bahan',
        'kategori_simpan',
        'kode_bahan',
        'nama_bahan',
        'satuan_bahan',
        'harga_beli',
    ];

    /**
     * Relasi ke t_detail_po (One to Many)
     */
    public function detailPO(): HasMany
    {
        return $this->hasMany(DetailPO::class, 'id_bahan', 'id_bahan');
    }

    /**
     * Logika agar kodenya otomatis sesuai jenis bahan
     */
    public static function generateKode(string $jenis)
    {
        $prefix = $jenis === 'baku' ? 'BB-' : 'BP-';

        $lastData = self::where('jenis_bahan', $jenis)
            ->orderBy('id_bahan', 'desc')
            ->first();

        if (!$lastData) {
            return $prefix . '0001';
        }

        $lastNumber = (int) substr($lastData->kode_bahan, 3);
        $newNumber = $lastNumber + 1;

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}

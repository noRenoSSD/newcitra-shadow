<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bahan extends Model
{
    protected $table = 't_bahan';
    protected $primaryKey = 'id_bahan';

    protected $fillable = [
        'jenis_bahan',
        'kode_bahan',
        'nama_bahan',
        'satuan_bahan',
        'stok_min',
    ];

    // Logika agar kodenya otomatis sesuai jenis bahan
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

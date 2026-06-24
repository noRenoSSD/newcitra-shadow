<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $table = 't_supplier';

    protected $fillable = [
        'kode_supplier',
        'nama_supplier',
        'kontak_supplier',
        'alamat_supplier'
    ];

    // Fungsi pencipta kode otomatis
    public static function generateKode()
    {
        $terakhir = self::orderBy('id', 'desc')->first();

        if (!$terakhir) {
            return 'SPL-0001';
        }

        $angkaMurni = filter_var($terakhir->kode_supplier, FILTER_SANITIZE_NUMBER_INT);
        $angkaBaru = (int)$angkaMurni + 1;

        return 'SPL-' . str_pad($angkaBaru, 4, '0', STR_PAD_LEFT);
    }
}

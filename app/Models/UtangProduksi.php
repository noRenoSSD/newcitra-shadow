<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UtangProduksi extends Model
{
    use HasFactory;

    // 1. Beritahu Laravel nama tabel yang benar (bukan bawaan bahasa Inggris)
    protected $table = 't_utang_produksi';

    // 2. Beritahu Laravel nama Primary Key-nya
    protected $primaryKey = 'id_utang';

    // 3. Kolom yang diizinkan untuk diisi (Mass Assignment)
    protected $fillable = [
        'id_cogm',
        'jenis',
        'nominal_terbayar',
        'status',
    ];

    // 4. Relasi ke tabel COGM (Opsional, tapi sangat berguna nanti)
    public function cogm()
    {
        return $this->belongsTo(Cogm::class, 'id_cogm', 'id_cogm');
    }
}
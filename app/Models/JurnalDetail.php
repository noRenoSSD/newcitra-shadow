<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JurnalDetail extends Model
{
    use HasFactory;

    protected $table = 't_jurnal_detail';
    protected $primaryKey = 'id_jurnal_detail';

    protected $fillable = [
        'id_jurnal',
        'id_akun',
        'debit',
        'kredit',
    ];

    // Relasi balik ke Jurnal Induk
    public function jurnal()
    {
        return $this->belongsTo(Jurnal::class, 'id_jurnal', 'id_jurnal');
    }

    // Relasi ke tabel Akun (untuk mendapatkan nama akun dll)
    public function akun()
    {
        return $this->belongsTo(Akun::class, 'id_akun', 'id_akun');
    }
}
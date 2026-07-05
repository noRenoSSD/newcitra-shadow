<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jurnal extends Model
{
    use HasFactory;

    protected $table = 't_jurnal';
    protected $primaryKey = 'id_jurnal';

    protected $fillable = [
        'kode_jurnal',
        'tanggal',
        'keterangan',
        'jenis_jurnal',
        'kode_referensi',
    ];

    // Relasi ke Jurnal Detail (1 Jurnal punya Banyak Detail)
    public function detail()
    {
        return $this->hasMany(JurnalDetail::class, 'id_jurnal', 'id_jurnal');
    }
}
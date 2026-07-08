<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PelunasanPiutang extends Model
{
    use HasFactory;

    // Sesuaikan dengan nama tabel di database kamu
    protected $table = 't_piutang_pelunasan';

    // Sesuaikan dengan primary key tabel kamu
    protected $primaryKey = 'id_pelunasan';

    protected $fillable = [
        'no_pelunasan',
        'tgl_pelunasan',
        'id_piutang',
        'nominal_bayar',
        'metode_bayar',
        'keterangan'
    ];

    /**
     * Relasi balik ke tabel induk Piutang
     */
    public function piutang()
    {
        return $this->belongsTo(Piutang::class, 'id_piutang', 'id_piutang');
    }
}
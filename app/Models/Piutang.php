<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Piutang extends Model
{
    use HasFactory;

    // 1. Tentukan nama tabel jika tidak mengikuti standar plural plural bahasa inggris
    protected $table = 't_piutang';

    // 2. Tentukan primary key tabel kamu
    protected $primaryKey = 'id_piutang';
    
    // 3. Daftarkan kolom yang boleh diisi massal lewat Controller
    protected $fillable = [
        'no_piutang',
        'id_jual',
        'id_mitra',
        'tgl_piutang',
        'total_piutang',
        'terbayar',
        'sisa_piutang',
        'jt_piutang',
        'status_piutang',
        'keterangan'
    ];

    public function mitra()
    {
        // Sesuaikan 'Mitra::class' dengan nama model Mitra di aplikasimu (misal: mMitra / Mitra)
        return $this->belongsTo(Mitra::class, 'id_mitra', 'id_mitra');
    }

    public function penjualan()
    {
        // Sesuaikan 'Penjualan::class' dengan nama model Penjualan/Invoice di aplikasimu (misal: Jual / Penjualan)
        return $this->belongsTo(Penjualan::class, 'id_jual', 'id_jual');
    }

    public function pelunasanPiutang()
    {
        return $this->hasMany(PelunasanPiutang::class, 'id_piutang', 'id_piutang');
    }
}
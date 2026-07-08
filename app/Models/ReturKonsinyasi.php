<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReturKonsinyasi extends Model
{
    use HasFactory;

    // 1. Tentukan nama tabel kustom Anda
    protected $table = 't_retur_konsinyasi';

    // 2. Tentukan primary key kustom Anda
    protected $primaryKey = 'id_retur_konsinyasi';

    // 3. Daftarkan kolom yang boleh diisi massal (Mass Assignment)
    protected $fillable = [
        'no_retur_konsinyasi',
        'tgl_retur_konsinyasi',
        'id_konsinyasi_keluar',
        'total_perbaikan',
        'total_kerugian'
    ];

    /**
     * Relasi One-to-Many ke Tabel Detail Retur
     */
    public function items()
    {
        return $this->hasMany(ReturKonsinyasiDetail::class, 'id_retur_konsinyasi', 'id_retur_konsinyasi');
    }

    /**
     * Relasi BelongsTo ke Tabel Konsinyasi Keluar (Nota Titipan Awal)
     */
    public function konsinyasiKeluar()
    {
        return $this->belongsTo(DB::table('t_konsinyasi_keluar')->toRawSql(), 'id_konsinyasi_keluar', 'id_konsinyasi_keluar');
        // Catatan: Jika Anda punya Model KonsinyasiKeluar, ganti baris di atas dengan:
        // return $this->belongsTo(KonsinyasiKeluar::class, 'id_konsinyasi_keluar', 'id_konsinyasi_keluar');
    }
}
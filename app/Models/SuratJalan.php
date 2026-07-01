<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuratJalan extends Model
{
    use HasFactory;

    // Set nama tabel manual sesuai database kamu
    protected $table = 't_surat_jalan';

    // Set primary key manual
    protected $primaryKey = 'id_surat_jalan';

    // Kolom yang boleh diisi mass-assignment
    protected $fillable = [
        'no_surat_jalan',
        'tgl_surat_jalan',
        'id_pesanan',
        'id_konsinyasi',
        'nama_pengirim',
        'kendaraan',
        'no_plat',
        'status',
    ];

    // Hubungan ke tabel Pesanan (Asumsi nama Modelnya 'Pesanan' dan PK-nya 'id_pesanan')
    public function pesanan()
    {
        return $this->belongsTo(Pesanan::class, 'id_pesanan', 'id_pesanan');
    }

    // Hubungan ke tabel Konsinyasi (Asumsi nama Modelnya 'Konsinyasi' dan PK-nya 'id_konsinyasi')
    public function konsinyasi()
    {
        return $this->belongsTo(Konsinyasi::class, 'id_konsinyasi', 'id_konsinyasi');
    }
}
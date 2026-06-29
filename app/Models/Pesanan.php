<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pesanan extends Model
{
    use HasFactory;

    protected $table = 't_pesanan'; // <-- Sesuaikan dengan nama tabel pesanan Anda
    protected $primaryKey = 'id_pesanan';
    
    protected $fillable = [
        'no_pesanan',
        'tgl_pesanan',
        'id_mitra',
        'jenis_transaksi',
        'alamat',
        'total_harga'
    ];

    /**
     * Relasi ke Pelanggan / Mitra
              */
    public function mitra()
    {
        // Parameter kedua adalah foreign key di tabel pesanan, parameter ketiga adalah primary key di tabel mitra
        return $this->belongsTo(Mitra::class, 'id_mitra', 'id_mitra');
    }

    /**
     * Relasi ke Detail Pesanan (Ini yang bikin error tadi!)
     * Harus bernama 'items' agar dibaca oleh Controller & React
     */
    public function items()
    {
        // Parameter kedua adalah foreign key di tabel pesanan_detail yang mengarah ke tabel ini
        return $this->hasMany(PesananDetail::class, 'id_pesanan', 'id_pesanan');
    }
}
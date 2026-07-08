<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReturKonsinyasiDetail extends Model
{
    use HasFactory;

    // 1. Tentukan nama tabel kustom Anda
    protected $table = 't_retur_konsinyasi_detail';

    // 2. Tentukan primary key kustom Anda
    protected $primaryKey = 'id_retur_konsinyasi_detail';

    // 3. Daftarkan kolom yang boleh diisi massal
    protected $fillable = [
        'id_retur_konsinyasi',
        'id_produk',
        'harga',
        'qty',
        'subtotal',
        'kondisi_barang',
        'hpp_saat_ini',
        'biaya_perbaikan',
        'nilai_kerugian',
        'keterangan'
    ];

    /**
     * Relasi ke Model Induk (Inverse)
     */
    public function returKonsinyasi()
    {
        return $this->belongsTo(ReturKonsinyasi::class, 'id_retur_konsinyasi', 'id_retur_konsinyasi');
    }

    /**
     * Relasi ke Model Produk untuk mengambil Nama atau Kode Produk
     */
    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk', 'id_produk');
        // Pastikan nama model Produk Anda disesuaikan (misal: App\Models\Produk atau App\Models\t_produk)
    }
}
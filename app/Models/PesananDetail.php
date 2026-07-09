<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Pesanan;
use App\Models\Produk;
use App\Models\HargaProduk;

class PesananDetail extends Model
{
    protected $table = 't_pesanan_detail';

    protected $primaryKey = 'id_pesanan_detail';

    protected $fillable = [
        'id_pesanan',
        'id_produk',
        'id_harga',
        'harga',
        'qty',
        'subtotal',
        'diskon',
    ];

    // Otomatis update total diskon di tabel utama saat detail disimpan/dihapus
    protected static function booted()
    {
        static::saved(function ($detail) {
            $pesanan = $detail->pesanan;
            if ($pesanan) {
                // Menghitung total diskon dari semua detail pesanan ini
                $totalDiskon = $pesanan->details()->sum('diskon');
                
                // Update ke tabel utama
                $pesanan->update([
                    'total_diskon' => $totalDiskon
                ]);
            }
        });

        static::deleted(function ($detail) {
            $pesanan = $detail->pesanan;
            if ($pesanan) {
                $totalDiskon = $pesanan->details()->sum('diskon');
                $pesanan->update([
                    'total_diskon' => $totalDiskon
                ]);
            }
        });
    }

    public function pesanan()
    {
        return $this->belongsTo(Pesanan::class, 'id_pesanan', 'id_pesanan');
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk', 'id_produk');
    }

    public function hargaProduk()
    {
        return $this->belongsTo(HargaProduk::class, 'id_harga', 'id_harga_produk');
    }
}
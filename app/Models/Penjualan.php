<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penjualan extends Model
{
    use HasFactory;

    // 1. Beritahu Laravel kalau nama tabelnya adalah t_jual (bukan penjualans)
    protected $table = 't_jual';

    // 2. Beritahu Laravel kalau Primary Key-nya adalah id_jual (bukan id)
    protected $primaryKey = 'id_jual';

    // 3. Daftarkan field yang boleh diisi (Mass Assignment)
    protected $fillable = [
        'no_jual',
        'tgl_jual',
        'id_pesanan',
        'jenis_penjualan',
        'metode_pembayaran',
        'subtotal',
        'total_diskon',
        'total_hpp',
        'grand_total'
    ];
    /**
     * Relasi ke t_detail_jual (Satu penjualan punya banyak item detail)
     */
    public function details()
    {
        // Parameter: (Nama Model Target, Foreign Key di tabel target, Local Key di tabel ini)
        return $this->hasMany(PenjualanDetail::class, 'id_jual', 'id_jual');
    }

    /**
     * Relasi ke t_pesanan (Satu penjualan merujuk ke satu pesanan/SO)
     */
    public function pesanan()
    {
        // Jika kamu sudah punya model bernama 'Pesanan'
        // Parameter: (Nama Model Target, Foreign Key di tabel ini, Owner Key di tabel target)
        return $this->belongsTo(Pesanan::class, 'id_pesanan', 'id_pesanan');
    }
}
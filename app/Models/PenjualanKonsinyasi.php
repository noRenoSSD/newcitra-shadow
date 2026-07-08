<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenjualanKonsinyasi extends Model
{
    protected $table = 't_jual_konsinyasi'; // Tetap mengarah ke tabel asli kamu
    protected $primaryKey = 'id_jual_konsinyasi';
    
    protected $fillable = [
        'no_penjualan',
        'tgl_penjualan',
        'id_mitra',
        'id_konsinyasi_keluar',
        'total_bayar',
        'jenis_pembayaran',
        'keterangan',
        'status',
        'hpp_total',
    ];

    public function items()
    {
        // Parameter: ModelDetail, foreign_key_di_detail, local_key_di_header
        return $this->hasMany(PenjualanKonsinyasiDetail::class, 'id_jual_konsinyasi', 'id_jual_konsinyasi')
            ->join('t_produk', 't_jual_konsinyasi_detail.id_produk', '=', 't_produk.id_produk')
            ->select('t_jual_konsinyasi_detail.*', 't_produk.nama_produk', 't_produk.satuan_produk');
    }
}
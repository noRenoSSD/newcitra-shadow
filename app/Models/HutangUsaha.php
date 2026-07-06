<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HutangUsaha extends Model
{
    use HasFactory;

    protected $table = 't_hutang_usaha';
    protected $primaryKey = 'id_hutang';

    protected $fillable = [
        'id_transaksi',
        'no_hutang',
        'total_hutang',
        'terbayar',
        'kurang_bayar',
        'status',
    ];

    // Relasi ke Transaksi Pembelian Faktur
    public function transaksiPembelian()
    {
        return $this->belongsTo(TransaksiPembelian::class, 'id_transaksi', 'id_transaksi');
    }

    // Relasi ke banyak riwayat cicilan & retur pembayarannya
    public function riwayatPembayaran()
    {
        return $this->hasMany(PembayaranHutang::class, 'id_hutang', 'id_hutang')
                    ->orderBy('tanggal_pembayaran', 'asc')
                    ->orderBy('id_pembayaran', 'asc');
    }
}

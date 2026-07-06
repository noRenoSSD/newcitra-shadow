<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PembayaranHutang extends Model
{
    use HasFactory;

    protected $table = 't_pembayaran_hutang';
    protected $primaryKey = 'id_pembayaran';

    protected $fillable = [
        'id_hutang',
        'id_retur',
        'no_pembayaran',
        'tanggal_pembayaran',
        'jumlah_dibayar',
        'metode_pembayaran',
        'tipe',
        'catatan',
    ];

    // Relasi balik ke Master Hutang
    public function hutangUsaha()
    {
        return $this->belongsTo(HutangUsaha::class, 'id_hutang', 'id_hutang');
    }

    // Relasi ke Retur Pembelian jika tipenya adalah 'Retur'
    public function returPembelian()
    {
        return $this->belongsTo(ReturPembelian::class, 'id_retur', 'id_retur');
    }
}

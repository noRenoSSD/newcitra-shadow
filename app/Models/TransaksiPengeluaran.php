<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiPengeluaran extends Model
{
    use HasFactory;

    protected $table = 't_transaksi_pengeluaran';
    protected $primaryKey = 'id_transaksi';

    protected $fillable = [
        'id_akun',
        'id_cogm',
        'jenis_pengeluaran',
        'jenis_utang',
        'no_transaksi',
        'tgl_transaksi',
        'nominal_bayar',
        'metode_bayar',
        'catatan',
    ];

    public function akun()
    {
        return $this->belongsTo(Akun::class, 'id_akun', 'id_akun');
    }

    public function cogm()
    {
        return $this->belongsTo(Cogm::class, 'id_cogm', 'id_cogm');
    }
}
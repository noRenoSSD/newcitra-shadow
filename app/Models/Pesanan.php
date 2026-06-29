<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pesanan extends Model
{
    protected $table = 't_pesanan';

    protected $primaryKey = 'id_pesanan';

    protected $fillable = [
        'no_pesanan',
        'tgl_pesanan',
        'id_mitra',
        'jenis_transaksi',
        'alamat',
        'total_harga',
    ];

    public function mitra()
    {
        return $this->belongsTo(Mitra::class, 'id_mitra', 'id_mitra');
    }

    public function detail()
    {
        return $this->hasMany(PesananDetail::class, 'id_pesanan', 'id_pesanan');
    }
}
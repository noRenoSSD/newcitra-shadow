<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenyusutanAset extends Model
{
    protected $table = 't_penyusutan_aset';
    protected $primaryKey = 'id_penyusutan';
    protected $fillable = [
        'kode_penyusutan', 'id_aset', 'periode', 'nilai_penyusutan', 
        'akumulasi_penyusutan', 'nilai_buku'
    ];

    protected $casts = [
        'periode' => 'date',
        'nilai_penyusutan' => 'decimal:2',
        'akumulasi_penyusutan' => 'decimal:2',
        'nilai_buku' => 'decimal:2',
    ];

    public function aset()
    {
        return $this->belongsTo(Aset::class, 'id_aset', 'id_aset');
    }
}
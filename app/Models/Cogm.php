<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cogm extends Model
{
    use HasFactory;

    // 1. Beritahu Laravel nama tabel aslinya
    protected $table = 't_cogm';

    // 2. Tentukan Primary Key-nya
    protected $primaryKey = 'id_cogm';

    // 3. Kolom yang boleh diisi datanya
    protected $fillable = [
        'id_produksi',
        'total_bbb',
        'total_btkl',
        'total_bop',
        'total_cogm',
    ];

    // 4. Relasi ke tabel Utang Produksi (1 COGM bisa punya utang BTKL dan utang BOP)
    public function utangProduksi()
    {
        return $this->hasMany(UtangProduksi::class, 'id_cogm', 'id_cogm');
    }
}
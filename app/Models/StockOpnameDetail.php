<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockOpnameDetail extends Model
{
    protected $table = 't_so_detail';
    protected $primaryKey = 'id_so_detail';

    protected $fillable = [
        'id_so',
        'id_bahan',
        'id_produk', // <-- Tambahkan ini
        'qty_sistem',
        'qty_fisik',
        'qty_kadaluarsa',
    ];

    public function bahan()
    {
        return $this->belongsTo(Bahan::class, 'id_bahan', 'id_bahan');
    }

    // Tambahkan relasi ke model Produk
    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk', 'id_produk');
    }

    public function stockOpname()
    {
        return $this->belongsTo(StockOpname::class, 'id_so', 'id_so');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenjualanDetail extends Model
{
    use HasFactory;

    protected $table = 't_detail_jual';
    protected $primaryKey = 'id_detail_jual';

    protected $fillable = [
        'id_jual',
        'id_produk',
        'id_harga',
        'qty_jual',
        'hpp_satuan',
        'diskon',
        'subtotal'
    ];

    // --- MASUKKAN RELASI DI SINI (DI DALAM KURUNG KURAWAL CLASS) ---

    /**
     * Relasi balik ke t_jual
     */
    public function penjualan()
    {
        return $this->belongsTo(Penjualan::class, 'id_jual', 'id_jual');
    }

    /**
     * Relasi ke t_produk
     */
    public function produk()
    {
        // Sesuaikan dengan nama model Produk kamu (misal: Produk / MasterProduk)
        return $this->belongsTo(Produk::class, 'id_produk', 'id_produk');
    }

} // <--- PASTIKAN KURUNG KURAWAL INI ADA DI PALING BAWAH KODE
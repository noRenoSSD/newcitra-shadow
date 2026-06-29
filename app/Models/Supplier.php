<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $table = 't_supplier';
    protected $primaryKey = 'id';

    protected $fillable = [
        'kode_supplier',
        'nama_supplier',
        'kontak_supplier',
        'alamat_supplier'
    ];

    /**
     * Relasi ke t_purchase_order (One to Many)
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class, 'id_supplier', 'id');
    }

    /**
     * Fungsi pencipta kode otomatis
     */
    public static function generateKode()
    {
        // 1. Ambil data terakhir berdasarkan ID terbesar
        $terakhir = self::orderBy('id', 'desc')->first();

        // 2. Jika database masih kosong, langsung gas mulai dari nomor 1
        if (!$terakhir) {
            return 'SPL-0001';
        }

        // 3. Ambil kode_supplier terakhir (misal: "SPL-0001")
        $kodeTerakhir = $terakhir->kode_supplier;

        // 4. Pecah string menggunakan separator '-Logika'
        $pecah = explode('-', $kodeTerakhir);

        // Ambil bagian angkanya saja (indeks ke-1), lalu paksa ubah jadi integer dan tambah 1
        $angkaBaru = (int)($pecah[1] ?? 0) + 1;

        // 5. Kembalikan format gabungan dengan padding 4 digit angka
        return 'SPL-' . str_pad($angkaBaru, 4, '0', STR_PAD_LEFT);
    }
}

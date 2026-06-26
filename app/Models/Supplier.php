<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $table = 't_supplier';

    protected $fillable = [
        'kode_supplier',
        'nama_supplier',
        'kontak_supplier',
        'alamat_supplier'
    ];

    // Fungsi pencipta kode otomatis
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

    // 4. Pecah string menggunakan separator '-'
    // eksplode akan menghasilkan array: ['SPL', '0001']
    $pecah = explode('-', $kodeTerakhir);

    // Ambil bagian angkanya saja (indeks ke-1), lalu paksa ubah jadi integer dan tambah 1
    $angkaBaru = (int)($pecah[1] ?? 0) + 1;

    // 5. Kembalikan format gabungan dengan padding 4 digit angka
    return 'SPL-' . str_pad($angkaBaru, 4, '0', STR_PAD_LEFT);
}
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aset extends Model
{
    protected $table = 't_aset';
    protected $primaryKey = 'id_aset';

    protected $fillable = [
        'kode_aset',
        'nama_aset',
        'tipe_aset',
        'tanggal_beli',
        'harga_perolehan',
        'umur_ekonomis',
        'nilai_sisa',
    ];

    // FUNGSI BARU: Generate Kode Otomatis ala timmu
    public static function generateKode()
    {
        // Ambil data terakhir berdasarkan ID terbesar
        $lastAset = self::orderBy('id_aset', 'desc')->first();

        if (!$lastAset) {
            return 'AST-001';
        }

        // Ambil angkanya saja dari "AST-001" (hasilnya "001") lalu tambah 1
        $lastNumber = (int) substr($lastAset->kode_aset, 4);
        $nextNumber = $lastNumber + 1;

        // Gabungkan kembali dengan AST- dan format 3 digit (002, 003, dst)
        return 'AST-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiPengeluaran extends Model
{
    use HasFactory;

    // Kasih tau Laravel nama tabel aslinya
    protected $table = 't_transaksi_pengeluaran';

    // Kasih tau Laravel nama Primary Key-nya
    protected $primaryKey = 'id_transaksi';

    // Field apa saja yang boleh diisi (Mass Assignment)
    protected $fillable = [
        'id_pengeluaran',
        'no_transaksi',
        'tgl_transaksi',
        'total_transaksi',
        'metode_bayar',
        'catatan'
    ];

    // Relasi ke Master Pengeluaran (Kebalikannya)
    public function masterPengeluaran()
    {
        // Parameter: (NamaModelMaster::class, 'foreign_key', 'owner_key')
        return $this->belongsTo(Pengeluaran::class, 'id_pengeluaran', 'id_pengeluaran');
    }
}

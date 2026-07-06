<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenerimaanBahan extends Model
{
    protected $table = 't_penerimaan_bahan';
    protected $primaryKey = 'id_penerimaan';
    protected $guarded = [];

    // Relasi ke tabel detail
    public function detailPenerimaan()
    {
        return $this->hasMany(DetailPenerimaanBahan::class, 'id_penerimaan', 'id_penerimaan');
    }

    // Relasi ke PO (Sesuaikan nama Class Model PO kamu, misal PurchaseOrder)
    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'id_po', 'id_po');
    }
    // Tambahkan ini di Model PenerimaanBahan.php
public function transaksiPembelian()
{
    return $this->hasOne(TransaksiPembelian::class, 'id_penerimaan', 'id_penerimaan');
}

// relasi ke supplier
public function supplier()
{
    return $this->belongsTo(Supplier::class, 'id_supplier', 'id'); // Sesuaikan foreign key id_supplier kamu jika beda
}
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailPenerimaanBahan extends Model
{
    protected $table = 't_detail_penerimaan_bahan';
    protected $primaryKey = 'id_detail_penerimaan';
    protected $guarded = [];

    // Relasi balik ke Penerimaan Induk
    public function penerimaanBahan()
    {
        return $this->belongsTo(PenerimaanBahan::class, 'id_penerimaan', 'id_penerimaan');
    }

    // Relasi ke Master Bahan
    public function bahan()
    {
        return $this->belongsTo(Bahan::class, 'id_bahan', 'id_bahan');
    }
}

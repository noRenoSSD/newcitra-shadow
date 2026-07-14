<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturJual extends Model
{
    protected $table = 't_retur_jual';
    protected $primaryKey = 'id_retur_jual';
    public $incrementing = true;
    protected $guarded = []; 
    protected $fillable = [
        'no_retur_jual', 'tgl_retur_jual', 'id_jual', 'subtotal', 
        'total_perbaikan', 'total_kerugian', 'grand_total'
    ];
    public function returJual()
    {
        return $this->belongsTo(ReturJual::class, 'id_retur_jual', 'id_retur_jual');
    }
}
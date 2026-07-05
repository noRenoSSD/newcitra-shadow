<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApprovalPemakaianBahan extends Model
{
    use HasFactory;

    protected $table = 't_approval_pemakaian_bahan';
    protected $primaryKey = 'id_approval';

    protected $fillable = [
        'id_pemakaian',
        'id_kartupers_bahan',
        'qty_standar',
        'harga_standar',
        'qty_aktual',
        'harga_ratarata_aktual',
        'total_aktual',
        'status_approval',
        'komentar_admin',
        'tanggal_approval',
    ];
}
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PemakaianBahan extends Model
{
    protected $table = 't_pemakaian_bahan';
    protected $primaryKey = 'id_pemakaian';
    protected $guarded = [];

    public function bahan()
    {
        return $this->belongsTo(Bahan::class, 'id_bahan', 'id_bahan');
    }
}

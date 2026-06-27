<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockOpname extends Model
{
    protected $table = 't_so';
    protected $primaryKey = 'id_so';

    protected $fillable = ['no_so', 'tgl_so'];

    public function details()
    {
        return $this->hasMany(StockOpnameDetail::class, 'id_so', 'id_so');
    }

    public static function generateNoSo(): string
    {
        $last = self::orderBy('id_so', 'desc')->first();
        $lastNumber = $last ? (int) substr($last->no_so, 3) : 0;
        return 'SO-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
    }
}

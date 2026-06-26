<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Divisi extends Model
{
    protected $table = 't_divisi';
    protected $primaryKey = 'id_divisi';
    protected $fillable = ['kode_divisi', 'nama_divisi'];
}
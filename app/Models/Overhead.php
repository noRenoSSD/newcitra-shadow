<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Overhead extends Model
{
    protected $table = 't_overhead';
    protected $primaryKey = 'id_overhead';
    protected $fillable = ['kode_overhead', 'nama_overhead', 'keterangan'];
}
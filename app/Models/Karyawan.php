<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Karyawan extends Model
{
    protected $table = 't_karyawan';
    protected $primaryKey = 'id_karyawan';
    protected $fillable = ['kode_karyawan', 'nama_karyawan', 'jabatan', 'departemen'];
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturJual extends Model
{
    protected $table = 't_retur_jual';
    protected $primaryKey = 'id_retur_jual';
    public $incrementing = true;
    protected $guarded = []; 
}
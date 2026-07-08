<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_piutang', function (Blueprint $table) {
            $table->id('id_piutang'); 
            $table->string('no_piutang', 20)->unique();
            
            $table->integer('id_jual')->nullable(); 
            $table->integer('id_mitra'); 
            
            $table->date('tgl_piutang');
            $table->decimal('total_piutang', 20, 2);
            $table->decimal('terbayar', 20, 2)->default(0);
            $table->decimal('sisa_piutang', 20, 2);
            $table->date('jt_piutang');
            $table->enum('status_piutang', ['Belum Lunas', 'Lunas'])->default('Belum Lunas');
            $table->string('keterangan', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_piutang');
    }
};
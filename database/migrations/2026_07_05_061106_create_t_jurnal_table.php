<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_jurnal', function (Blueprint $table) {
            $table->id('id_jurnal');
            $table->string('kode_jurnal', 20);
            $table->date('tanggal');
            $table->string('keterangan', 255);
            $table->enum('jenis_jurnal', ['umum', 'penyesuaian']);
            $table->string('kode_referensi', 30)->nullable(); // Dibuat nullable karena tidak semua jurnal punya referensi
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_jurnal');
    }
};
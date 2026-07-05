<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_jurnal_detail', function (Blueprint $table) {
            $table->id('id_jurnal_detail');
            
            $table->unsignedBigInteger('id_jurnal');
            $table->unsignedBigInteger('id_akun');
            
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('kredit', 15, 2)->default(0);
            $table->timestamps();

            // Relasi ke tabel jurnal (kalau jurnal dihapus, detailnya ikut terhapus otomatis)
            $table->foreign('id_jurnal')->references('id_jurnal')->on('t_jurnal')->onDelete('cascade');
            
            // Relasi ke tabel akun (akun tidak bisa dihapus kalau sudah dipakai di jurnal)
            $table->foreign('id_akun')->references('id_akun')->on('t_akun')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_jurnal_detail');
    }
};
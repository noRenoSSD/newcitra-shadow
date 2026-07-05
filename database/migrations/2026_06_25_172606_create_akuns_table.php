<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_akun', function (Blueprint $table) {
            // Sesuai dengan spesifikasi gambar: int(12) auto_increment
            $table->id('id_akun'); 
            // varchar(10) dan di-set unique untuk mencegah duplikasi kode CoA
            $table->string('kode_akun', 10)->unique(); 
            $table->string('nama_akun', 100);
            $table->string('kategori', 255);
            $table->enum('saldo_normal', ['Debit', 'Kredit']);
            $table->decimal('saldo_awal', 15, 2)->default(0);
            $table->timestamps();

            // Expert Tip: Tambahkan index pada kolom yang sering digunakan untuk filter/pencarian
            $table->index('kategori');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_akun');
    }
};
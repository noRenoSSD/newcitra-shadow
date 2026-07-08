<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('t_konsinyasi_keluar', function (Blueprint $table) {
            $table->integer('id_konsinyasi_keluar')->autoIncrement(); // Primary Key (int 12)
            $table->string('no_konsinyasi', 20)->unique();
            $table->integer('id_mitra'); // Berelasi ke t_mitra
            $table->date('tgl_konsinyasi');
            $table->decimal('total_estimasi', 20, 0)->default(0);
            $table->string('keterangan')->nullable();
            $table->string('status', 20)->default('Draft'); // Contoh: Draft, Dikirim, Selesai
            $table->timestamps();
            
            // Indeks untuk optimasi query join
            $table->index('id_mitra');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_konsinyasi_keluar');
    }
};
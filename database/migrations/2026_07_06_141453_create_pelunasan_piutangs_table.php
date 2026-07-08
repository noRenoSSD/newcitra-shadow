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
        Schema::create('t_piutang_pelunasan', function (Blueprint $table) {
            $table->integer('id_pelunasan', true)->length(12); // Primary Key, Auto Increment
            $table->string('no_pelunasan', 20); // Kode kuitansi seperti BYR-YYYYMMDD-0001
            $table->date('tgl_pelunasan');
            $table->integer('id_piutang')->length(12); // Foreign key ke t_piutang
            $table->decimal('nominal_bayar', 20, 0)->default(0);
            $table->enum('metode_bayar', ['Tunai', 'Transfer'])->default('Tunai');
            $table->string('keterangan', 100)->nullable();
            
            $table->timestamps();

            // Foreign key ke tabel induk piutang
            // $table->foreign('id_piutang')->references('id_piutang')->on('t_piutang')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_piutang_pelunasan');
    }
};
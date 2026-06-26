<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_detail_jadwal_produksi', function (Blueprint $table) {
            $table->id('id_produksi');
            $table->string('kode_produksi', 30)->unique();
            
            $table->unsignedBigInteger('id_jadwal');
            $table->unsignedBigInteger('id_produk');
            $table->unsignedBigInteger('id_bom');
            
            $table->date('tanggal_produksi');
            $table->integer('qty_rencana');
            $table->string('catatan', 255)->nullable();
            $table->timestamps();

            // Relational Integrity
            $table->foreign('id_jadwal')->references('id_jadwal')->on('t_jadwal_produksi')->onDelete('cascade');
            $table->foreign('id_produk')->references('id_produk')->on('t_produk')->onDelete('restrict');
            $table->foreign('id_bom')->references('id_bom')->on('t_bom')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_detail_jadwal_produksi');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_bom', function (Blueprint $table) {
            $table->id('id_bom'); 
            $table->string('kode_bom', 50)->unique(); // <-- Tambahkan baris ini
            $table->unsignedBigInteger('id_produk'); 
            $table->string('nama_resep');
            $table->integer('qty_batch');
            $table->string('satuan_batch', 20);
            $table->timestamps();

            $table->foreign('id_produk')
                  ->references('id_produk')
                  ->on('t_produk')
                  ->onDelete('restrict'); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_bom');
    }
};
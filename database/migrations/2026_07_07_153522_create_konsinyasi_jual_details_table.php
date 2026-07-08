<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_jual_konsinyasi_detail', function (Blueprint $table) {
            $table->id('id_jual_konsinyasi_detail'); 
            $table->unsignedBigInteger('id_jual_konsinyasi');
            $table->unsignedBigInteger('id_produk');
            $table->integer('qty_terjual');
            $table->decimal('harga_jual', 15, 2); 
            $table->decimal('subtotal', 15, 2);
            $table->decimal('hpp_satuan', 15, 2);
            $table->timestamps();

            $table->foreign('id_jual_konsinyasi', 'fk_jual_konsinyasi_dtl')
                  ->references('id_jual_konsinyasi')->on('t_jual_konsinyasi')
                  ->onDelete('cascade');
                  
            $table->foreign('id_produk')->references('id_produk')->on('t_produk')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_jual_konsinyasi_detail');
    }
};
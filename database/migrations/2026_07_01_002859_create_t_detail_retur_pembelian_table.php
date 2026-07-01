<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('t_detail_retur_pembelian', function (Blueprint $table) {
        $table->id('id_detail_retur');
        $table->unsignedBigInteger('id_retur');
        $table->unsignedBigInteger('id_bahan');
        $table->integer('qty_retur');
        $table->integer('harga_satuan');
        $table->string('alasan', 255);
        $table->timestamps();

        $table->foreign('id_retur')->references('id_retur')->on('t_retur_pembelian')->onDelete('cascade');
        $table->foreign('id_bahan')->references('id_bahan')->on('t_bahan')->onDelete('restrict');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_detail_retur_pembelian');
    }
};

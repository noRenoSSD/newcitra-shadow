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
    Schema::create('t_detail_transaksi_pembelian', function (Blueprint $table) {
        $table->id('id_detail_transaksi');
        $table->unsignedBigInteger('id_transaksi');
        $table->unsignedBigInteger('id_detail_penerimaan'); // Referensi ke item fisik
        $table->decimal('harga_aktual', 15, 2);
        $table->decimal('subtotal', 15, 2);

        $table->timestamps();
        $table->foreign('id_transaksi')->references('id_transaksi')->on('t_transaksi_pembelian')->onDelete('cascade');
        $table->foreign('id_detail_penerimaan')->references('id_detail_penerimaan')->on('t_detail_penerimaan_bahan');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_detail_transaksi_pembelian');
    }
};

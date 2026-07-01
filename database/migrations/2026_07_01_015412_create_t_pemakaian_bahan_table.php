<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::create('t_pemakaian_bahan', function (Blueprint $table) {
        $table->id('id_pemakaian');
        $table->unsignedBigInteger('id_hasil_produksi');
        $table->unsignedBigInteger('id_bahan');
        $table->decimal('qty_aktual', 10, 2);
        $table->decimal('selisih', 10, 2); // Disimpan agar mudah untuk pelaporan
        $table->timestamps();

        $table->foreign('id_hasil_produksi')->references('id_hasil_produksi')->on('t_hasil_produksi')->onDelete('cascade');
        $table->foreign('id_bahan')->references('id_bahan')->on('t_bahan')->onDelete('restrict');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_pemakaian_bahan');
    }
};

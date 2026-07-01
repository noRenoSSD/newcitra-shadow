<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
{
    Schema::create('t_retur_pembelian', function (Blueprint $table) {
        $table->id('id_retur');
        $table->unsignedBigInteger('id_penerimaan');
        $table->string('no_retur', 50)->unique();
        $table->date('tanggal_retur');
        $table->integer('total_nilai')->default(0);
        $table->timestamps();

        $table->foreign('id_penerimaan')->references('id_penerimaan')->on('t_penerimaan_bahan')->onDelete('restrict');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_retur_pembelian');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('t_detail_penerimaan_bahan', function (Blueprint $table) {
            $table->id('id_detail_penerimaan');
            $table->unsignedBigInteger('id_penerimaan');
            $table->unsignedBigInteger('id_bahan');
            $table->decimal('qty_diterima', 10, 2);
            $table->decimal('qty_retur', 10, 2);
            $table->enum('kondisi', ['Baik', 'Retur'])->default('Baik');
            $table->string('catatan')->nullable();
            $table->timestamps();

            // Opsional: Foreign key constraint
            // $table->foreign('id_penerimaan')->references('id_penerimaan')->on('t_penerimaan_bahan')->onDelete('cascade');
            // $table->foreign('id_bahan')->references('id_bahan')->on('t_bahan')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('t_detail_penerimaan_bahan');
    }
};

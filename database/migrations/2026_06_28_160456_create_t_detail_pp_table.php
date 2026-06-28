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
        Schema::create('t_detail_pp', function (Blueprint $table) {
            $table->increments('id_detail_pp');
            $table->unsignedInteger('id_pp');
            $table->unsignedBigInteger('id_bahan');
            $table->decimal('qty_kebutuhan', 10, 2);
            $table->decimal('qty_diminta', 10, 2);
            $table->timestamps();

            // Foreign Key Constraints
            $table->foreign('id_pp')
                  ->references('id_pp')
                  ->on('t_permintaan_pembelian')
                  ->onDelete('cascade');

            $table->foreign('id_bahan')
                  ->references('id_bahan')
                  ->on('t_bahan')
                  ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_detail_pp');
    }
};

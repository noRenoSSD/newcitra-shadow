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
        Schema::create('t_pesanan_detail', function (Blueprint $table) {

            $table->increments('id_pesanan_detail');

            $table->unsignedInteger('id_pesanan');

            $table->unsignedInteger('id_produk');

            $table->unsignedInteger('id_harga');

            $table->decimal('harga', 20, 0);

            $table->integer('qty');

            $table->decimal('subtotal', 20, 0);

            $table->timestamps();

            $table->foreign('id_pesanan')
                ->references('id_pesanan')
                ->on('t_pesanan')
                ->onDelete('cascade');

            $table->foreign('id_produk')
                ->references('id_produk')
                ->on('t_produk')
                ->onDelete('cascade');

            $table->foreign('id_harga')
                ->references('id_harga_produk')
                ->on('t_harga_produk')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_pesanan_detail');
    }
};
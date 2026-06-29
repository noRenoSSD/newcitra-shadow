<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_harga_produk', function (Blueprint $table) {

            $table->increments('id_harga_produk');
            $table->string('kode_harga', 20)->unique();
            $table->unsignedBigInteger('id_produk');


            $table->enum('jenis_transaksi', [
                'Penjualan Langsung',
                'Konsinyasi'
            ]);

            $table->decimal('harga', 15, 2);

            $table->timestamps();

            $table->foreign('id_produk')
                ->references('id_produk')
                ->on('t_produk')
                ->onDelete('cascade');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_harga_produk');
    }
};
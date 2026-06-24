<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_harga_produk', function (Blueprint $table) {

            $table->id('id_harga_produk');

            // sama dengan t_produk
            $table->unsignedBigInteger('id_produk');

            // sama dengan t_mitra (increments)
            $table->unsignedInteger('id_mitra')->nullable();

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

            $table->foreign('id_mitra')
                ->references('id_mitra')
                ->on('t_mitra')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_harga_produk');
    }
};
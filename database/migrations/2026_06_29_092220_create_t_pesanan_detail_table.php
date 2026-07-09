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

            $table->increments('id_pesanan_detail'); // Menggunakan increments (unsignedInteger)

            // Karena t_pesanan menggunakan increments(), ini tetap unsignedInteger
            $table->unsignedInteger('id_pesanan');

            // --- UBAH DI SINI: ganti dari unsignedInteger menjadi unsignedBigInteger ---
            $table->unsignedBigInteger('id_produk');

            // --- JIKA id_harga_produk di tabel t_harga_produk juga bermasalah, ubah juga ke unsignedBigInteger ---
            $table->unsignedBigInteger('id_harga');

            $table->decimal('harga', 20, 0);

            $table->integer('qty');

            $table->decimal('subtotal', 20, 0);
            $table->decimal('diskon', 12, 0)->default(0);

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

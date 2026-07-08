<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_retur_konsinyasi_detail', function (Blueprint $table) {
            $table->id('id_retur_konsinyasi_detail');
            $table->unsignedBigInteger('id_retur_konsinyasi');
            $table->unsignedBigInteger('id_produk');
            $table->decimal('harga', 20, 0)->default(0);
            $table->integer('qty');
            $table->decimal('subtotal', 20, 0)->default(0);
            $table->enum('kondisi_barang', ['Layak', 'Rusak', 'Perbaikan'])->default('Layak');
            $table->decimal('hpp_saat_ini', 15, 2)->default(0);
            $table->decimal('biaya_perbaikan', 20, 0)->default(0);
            $table->decimal('nilai_kerugian', 20, 0)->default(0);
            $table->string('keterangan', 100)->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('id_retur_konsinyasi')->references('id_retur_konsinyasi')->on('t_retur_konsinyasi')->onDelete('cascade');
            // $table->foreign('id_produk')->references('id_produk')->on('t_produk')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_retur_konsinyasi_detail');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('t_hutang_usaha', function (Blueprint $table) {
            $table->id('id_hutang');
            $table->unsignedBigInteger('id_transaksi'); // Relasi ke t_transaksi_pembelian
            $table->string('no_hutang', 50)->unique(); // Contoh: HU-2026-001

            // Finansial Tracking
            $table->decimal('total_hutang', 15, 2); // Diambil dari total_tagihan di pembelian
            $table->decimal('terbayar', 15, 2)->default(0); // Akumulasi cicilan + retur
            $table->decimal('kurang_bayar', 15, 2); // Sisa hutang (total_hutang - terbayar)

            $table->string('status', 20)->default('Belum Lunas'); // Belum Lunas / Lunas
            $table->timestamps();

            // Foreign Key
            $table->foreign('id_transaksi')
                  ->references('id_transaksi')
                  ->on('t_transaksi_pembelian')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('t_hutang_usaha');
    }
};

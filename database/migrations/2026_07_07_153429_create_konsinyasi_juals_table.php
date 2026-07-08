<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_jual_konsinyasi', function (Blueprint $table) {
            $table->id('id_jual_konsinyasi'); 
            $table->string('no_penjualan', 50)->unique();
            $table->date('tgl_penjualan');
            $table->integer('id_konsinyasi_keluar');
            $table->unsignedInteger('id_mitra'); 
            $table->enum('jenis_pembayaran', ['Tunai', 'Kredit'])->default('Tunai');
            $table->decimal('total_bayar', 15, 2)->default(0); 
            $table->decimal('hpp_total', 15, 2);
            $table->text('keterangan')->nullable();
            $table->timestamps();

            // Deklarasi Foreign Key Manual
            $table->foreign('id_konsinyasi_keluar', 'fk_jual_id_konsinyasi_keluar')
                  ->references('id_konsinyasi_keluar')
                  ->on('t_konsinyasi_keluar')
                  ->onDelete('cascade');

            $table->foreign('id_mitra')
                  ->references('id_mitra')
                  ->on('t_mitra')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_jual_konsinyasi');
    }
};
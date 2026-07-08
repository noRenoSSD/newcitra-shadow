<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('t_surat_jalan', function (Blueprint $table) {
            $table->id('id_surat_jalan');
            $table->string('no_surat_jalan', 20)->unique();
            $table->date('tgl_surat_jalan');
            $table->integer('id_pesanan')->nullable();
            $table->integer('id_konsinyasi')->nullable();
            $table->string('alamat', 150)->nullable();
            $table->string('nama_pengirim', 50); // Menyesuaikan dengan form React
            $table->string('kendaraan', 30);     // Menyesuaikan dengan form React (Jenis armada)
            $table->string('no_plat', 15);  
            $table->enum('status', ['Diproses', 'Dikirim', 'Terkirim'])->default('Diproses');     // Menyesuaikan dengan form React
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('t_surat_jalan');
    }
};
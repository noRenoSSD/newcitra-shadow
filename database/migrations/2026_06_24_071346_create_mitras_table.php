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
        Schema::create('t_mitra', function (Blueprint $table) {
            $table->increments('id_mitra');
            $table->string('kode_mitra', 10);
            $table->string('nama_mitra', 100);
            $table->string('pic_mitra', 100);
            $table->string('alamat', 100);
            $table->string('no_telp', 20);
            $table->string('kota', 100);
            $table->enum('status', ['Aktif','Tidak Aktif'])->default('Aktif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_mitra');
    }
};

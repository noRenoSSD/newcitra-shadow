<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_bahan', function (Blueprint $table) {
            $table->id('id_bahan');
            $table->enum('jenis_bahan', ['baku', 'penolong']);
            $table->string('kode_bahan', 20)->unique();
            $table->string('nama_bahan', 100);
            $table->string('satuan_bahan', 20);
            $table->decimal('stok_min', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_bahan');
    }
};

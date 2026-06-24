<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('t_produk', function (Blueprint $table) {
        $table->id('id_produk'); // Auto Increment & Primary Key
        $table->string('kode_produk', 20);
        $table->string('nama_produk', 100);
        $table->string('satuan_produk', 20);
        $table->timestamps(); // Bawaan laravel untuk created_at & updated_at
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produks');
    }
};

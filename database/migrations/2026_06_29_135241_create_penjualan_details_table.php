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
        Schema::create('t_jual_detail', function (Blueprint $table) {
            $table->integer('id_jual_detail', true); // int(12) Primary Key & Auto Increment
            $table->integer('id_jual'); // int(12) - Relasi ke t_jual
            $table->integer('id_produk'); // int(12)
            $table->decimal('harga', 20, 0 )->default(0.00); // int(12)
            $table->integer('qty_jual'); // int(5)
            
            $table->decimal('hpp_satuan', 20, 0); // Kolom baru pencatat modal produk saat transaksi terjadi
            $table->decimal('diskon', 12, 0); // decimal(12,0)
            $table->decimal('subtotal', 20, 0); // decimal(20,0)
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_jual_detail');
    }
};

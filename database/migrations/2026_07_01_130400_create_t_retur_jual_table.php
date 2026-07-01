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
        Schema::create('t_retur_jual', function (Blueprint $table) {
            $table->integer('id_retur_jual')->autoIncrement(); // int(12) Primary Key
            $table->string('no_retur_jual', 20);
            $table->date('tgl_retur_jual');
            $table->integer('id_jual'); // Relasi ke tabel t_jual
            $table->decimal('subtotal', 20, 0)->default(0);
            // Kolom PPN sudah dihapus di sini
            $table->decimal('total_hpp', 20, 0)->default(0); // 🌟 Tambahan Total HPP
            $table->decimal('total_perbaikan', 20, 0)->default(0); 
            $table->decimal('total_kerugian', 20, 0)->default(0);
            $table->decimal('grand_total', 25, 0)->default(0);
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_retur_jual');
    }
};

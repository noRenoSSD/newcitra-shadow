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
        Schema::create('t_retur_jual_detail', function (Blueprint $table) {
            $table->integer('id_retur_jual_detail')->autoIncrement();
            $table->integer('id_retur_jual');
            $table->integer('id_produk');
            $table->integer('id_harga');
            $table->decimal('hpp', 20, 0)->default(0);
            $table->integer('qty'); // int(5)
            $table->decimal('subtotal', 20, 0)->default(0);
            $table->enum('kondisi_barang', ['Layak', 'Rusak', 'Perbaikan'])->default('Layak');
            $table->decimal('biaya_perbaikan', 20, 0)->default(0);
            $table->decimal('nilai_kerugian', 20, 0)->default(0);
            $table->string('keterangan', 100)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_retur_jual_detail');
    }
};

<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('t_so_detail', function (Blueprint $table) {
        $table->increments('id_so_detail');
        $table->unsignedInteger('id_so');

        // Dibuat nullable agar item detail bisa berupa BAHAN saja atau PRODUK saja
        $table->unsignedBigInteger('id_bahan')->nullable();
        $table->unsignedBigInteger('id_produk')->nullable();

        $table->decimal('qty_sistem', 10, 2);
        $table->decimal('qty_fisik', 10, 2);
        $table->decimal('qty_kadaluarsa', 10, 2)->default(0);
        $table->decimal('selisih', 10, 2)->virtualAs('qty_fisik - qty_sistem');
        $table->timestamps();

        // Relasi kunci asing
        $table->foreign('id_so')->references('id_so')->on('t_so')->onDelete('cascade');
        $table->foreign('id_bahan')->references('id_bahan')->on('t_bahan')->onDelete('restrict');
        $table->foreign('id_produk')->references('id_produk')->on('t_produk')->onDelete('restrict'); // Tambah ini
    });
}

    public function down(): void
    {
        Schema::dropIfExists('t_so_detail');
    }
};

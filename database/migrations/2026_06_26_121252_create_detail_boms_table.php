<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_detail_bom', function (Blueprint $table) {
            $table->id('id_detail_bom');
            $table->unsignedBigInteger('id_bom');   // fk ke t_bom
            $table->unsignedBigInteger('id_bahan'); // fk ke t_bahan
            $table->decimal('jumlah_bahan', 15, 2);
            $table->timestamps();

            // Mendefinisikan Relasi Foreign Key
            $table->foreign('id_bom')
                  ->references('id_bom')
                  ->on('t_bom')
                  ->onDelete('cascade'); // Jika BOM utama dihapus, detailnya otomatis terhapus

            $table->foreign('id_bahan')
                  ->references('id_bahan')
                  ->on('t_bahan')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_detail_bom');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // <-- Jangan lupa ini wajib ditambahkan

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_kebutuhan_bahan', function (Blueprint $table) {
            $table->id('id_kebutuhan_bahan');
            
            $table->unsignedBigInteger('id_produksi');
            $table->unsignedBigInteger('id_detail_bom');
            
            // Decimal 10,2 krusial untuk bahan baku seperti liter/kg untuk mencegah IEEE 754 precision logic error
            $table->decimal('qty_bahan_snapshot', 10, 2); 
            $table->decimal('qty_kebutuhan', 10, 2);
            
            // REVISI: Menggunakan default CURRENT_DATE agar otomatis terisi hari ini saat data masuk
            $table->date('tanggal_generate')->default(DB::raw('(CURRENT_DATE)'));
            
            $table->timestamps();

            // Relational Integrity
            $table->foreign('id_produksi')->references('id_produksi')->on('t_detail_jadwal_produksi')->onDelete('cascade');
            $table->foreign('id_detail_bom')->references('id_detail_bom')->on('t_detail_bom')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_kebutuhan_bahan');
    }
};
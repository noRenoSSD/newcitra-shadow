<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_approval_pemakaian_bahan', function (Blueprint $table) {
            $table->id('id_approval'); // Primary Key (int 12 otomatis jadi bigInteger di Laravel modern)
            
            $table->unsignedBigInteger('id_pemakaian');
            $table->unsignedBigInteger('id_kartupers_bahan');
            
            $table->decimal('qty_standar', 15, 2)->default(0);
            $table->decimal('harga_standar', 15, 2)->default(0);
            $table->decimal('qty_aktual', 15, 2)->default(0);
            $table->decimal('harga_ratarata_aktual', 15, 2)->default(0);
            $table->decimal('total_aktual', 15, 2)->default(0);
            
            $table->enum('status_approval', ['pending', 'approved'])->default('pending');
            $table->string('komentar_admin', 255)->nullable();
            $table->date('tanggal_approval')->nullable();
            
            $table->timestamps();

            // Opsional: Tambahkan relasi Foreign Key jika tabel referensinya sudah ada
            // $table->foreign('id_pakai_bahan')->references('id')->on('t_pakai_bahan')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_approval_pemakaian_bahan');
    }
};
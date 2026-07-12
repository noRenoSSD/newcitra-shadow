<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_utang_produksi', function (Blueprint $table) {
            $table->id('id_utang'); // Primary Key (BigInt)
            
            // Foreign Key ke tabel COGM
            $table->unsignedBigInteger('id_cogm'); 
            
            // Kolom Jenis (Hanya boleh diisi 'BTKL' atau 'BOP')
            $table->enum('jenis', ['BTKL', 'BOP']);
            
            // Kolom Nominal (Pakai decimal 15 digit, 2 angka di belakang koma)
            $table->decimal('nominal_terbayar', 15, 2)->default(0);
            
            // Kolom Status sesuai permintaan (Default-nya 'blm lunas' ketika data baru dibuat)
            $table->enum('status', ['lunas', 'blm lunas'])->default('blm lunas');
            
            $table->timestamps(); // create_at & updated_at

            // Relasi (Constraint): Kalau data di t_cogm dihapus, utangnya ikut terhapus
            $table->foreign('id_cogm')->references('id_cogm')->on('t_cogm')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_utang_produksi');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_penyusutan_aset', function (Blueprint $table) {
            $table->id('id_penyusutan');
            $table->string('kode_penyusutan', 20); // Diperlebar untuk mengakomodasi format PNY-YYYY-MM-XXX
            // Asumsi nama tabel master aset adalah 't_aset' dan foreign key 'id_aset'
            $table->foreignId('id_aset')->constrained('t_aset', 'id_aset')->cascadeOnDelete();
            
            $table->date('periode'); // Format konvensi: YYYY-MM-01
            $table->decimal('nilai_penyusutan', 15, 2);
            $table->decimal('akumulasi_penyusutan', 15, 2);
            $table->decimal('nilai_buku', 15, 2);
            $table->timestamps();

            // Optimasi Keamanan Data: Mencegah 1 aset disusutkan 2x di bulan yang sama
            $table->unique(['id_aset', 'periode'], 'idx_aset_periode_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_penyusutan_aset');
    }
};
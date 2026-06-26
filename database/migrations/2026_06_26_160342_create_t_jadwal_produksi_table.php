<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_jadwal_produksi', function (Blueprint $table) {
            $table->id('id_jadwal');
            $table->string('kode_jadwal', 30)->unique();
            $table->string('periode', 20);
            $table->date('tanggal_dibuat');
            $table->integer('jumlah_produksi');
            
            // Expert Tip: Enum di database bisa merepotkan saat ada penambahan status baru di masa depan.
            // Namun, untuk mematuhi spesifikasi desainmu, kita gunakan struktur ini.
            $table->enum('status_jadwal', ['Draft', 'Pending Approval', 'Revision Required', 'Approved'])->default('Draft');
            
            $table->string('komentar_owner', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_jadwal_produksi');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Sesuaikan nama tabel menjadi t_aset
        Schema::create('t_aset', function (Blueprint $table) {
            // id_aset sebagai Primary Key
            $table->id('id_aset'); 
            
            $table->string('kode_aset', 10)->unique(); // Ditambah unique agar kode tidak kembar
            $table->string('nama_aset', 100);
            $table->enum('tipe_aset', ['mesin', 'kendaraan', 'peralatan']);
            $table->date('tanggal_beli');
            $table->decimal('harga_perolehan', 15, 2);
            $table->integer('umur_ekonomis'); 
            $table->decimal('nilai_sisa', 15, 2);
            
            $table->timestamps(); // otomatis membuat created_at dan updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_aset');
    }
};
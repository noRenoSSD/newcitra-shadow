<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_retur_konsinyasi', function (Blueprint $table) {
            $table->id('id_retur_konsinyasi');
            $table->string('no_retur_konsinyasi', 20)->unique();
            $table->date('tgl_retur_konsinyasi');
            $table->unsignedBigInteger('id_konsinyasi_keluar'); // Relasi ke dokumen titipan barang
            $table->decimal('total_hpp_retur', 15, 2)->default(0);
            $table->decimal('total_perbaikan', 20, 0)->default(0);
            $table->decimal('total_kerugian', 20, 0)->default(0);
            $table->decimal('grand_total', 20, 0)->default(0);
            $table->timestamps();

            // Jalur aman foreign key (opsional, aktifkan jika tabel induknya sudah menggunakan engine InnoDB)
            // $table->foreign('id_konsinyasi_keluar')->references('id_konsinyasi_keluar')->on('t_konsinyasi_keluar')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_retur_konsinyasi');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_kartu_persediaan', function (Blueprint $table) {
            $table->id('id_kartu');

            // Relasi ke tabel master
            $table->unsignedBigInteger('id_bahan')->nullable(); // Untuk Baku & Penolong
            $table->unsignedBigInteger('id_produk')->nullable(); // Untuk Produk Jadi

            // Info Transaksi
            $table->string('no_referensi', 50); // Contoh: PRD-2026-001 atau PO-2026-001
            $table->string('jenis_transaksi', 20); // 'Masuk' atau 'Keluar'

            // Qty
            $table->decimal('qty_masuk', 10, 2)->default(0);
            $table->decimal('qty_keluar', 10, 2)->default(0);
            $table->decimal('saldo_akhir', 10, 2); // Saldo setelah transaksi ini

            $table->date('tanggal_transaksi');
            $table->timestamps();

            // Foreign keys
            $table->foreign('id_bahan')->references('id_bahan')->on('t_bahan')->onDelete('set null');
            $table->foreign('id_produk')->references('id_produk')->on('t_produk')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_kartu_persediaan');
    }
};

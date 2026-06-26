<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_transaksi_pengeluaran', function (Blueprint $table) {
            // Membuat primary key 'id_transaksi'
            $table->id('id_transaksi');

            // Kolom-kolom lainnya
            $table->unsignedBigInteger('id_pengeluaran');
            $table->string('no_transaksi', 20);
            $table->date('tgl_transaksi');
            $table->double('total_transaksi'); // bisa pakai integer/decimal sesuaikan kebutuhan
            $table->enum('metode_bayar', ['Cash', 'transfer']);
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        // Pastikan nama drop-nya sama dengan yang di create
        Schema::dropIfExists('t_transaksi_pengeluaran');
    }
};

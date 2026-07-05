<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Tabel Biaya Bahan Baku (BBB) ──────────────────────────────
        Schema::create('t_bbb', function (Blueprint $table) {
            $table->id('id_bbb');
            $table->unsignedBigInteger('id_produksi');
            $table->decimal('total_bbb', 15, 2)->default(0);
            $table->date('tanggal_hitung');
            $table->timestamps();
        });

        Schema::create('t_detail_bbb', function (Blueprint $table) {
            $table->id('id_detail_bbb');
            $table->unsignedBigInteger('id_bbb');
            $table->unsignedBigInteger('id_approval'); // FK ke t_approval_pemakaian_bahan
            $table->decimal('subtotal_bahan', 15, 2)->default(0);
            $table->timestamps();
            
            $table->foreign('id_bbb')->references('id_bbb')->on('t_bbb')->cascadeOnDelete();
        });

        // ── 2. Tabel Biaya Tenaga Kerja Langsung (BTKL) ──────────────────
        Schema::create('t_btkl', function (Blueprint $table) {
            $table->id('id_btkl');
            $table->unsignedBigInteger('id_produksi');
            $table->decimal('total_btkl', 15, 2)->default(0);
            $table->date('tanggal_hitung');
            $table->timestamps();
        });

        Schema::create('t_detail_btkl', function (Blueprint $table) {
            $table->id('id_detail_btkl');
            $table->unsignedBigInteger('id_btkl');
            $table->unsignedBigInteger('id_divisi'); // FK ke t_divisi
            $table->decimal('jumlah_orang', 5, 2)->default(0); // Bisa 5,2 jika ada hitungan setengah hari/borongan khusus
            $table->decimal('tarif_per_hari', 15, 2)->default(0);
            $table->decimal('subtotal_btkl', 15, 2)->default(0);
            $table->timestamps();

            $table->foreign('id_btkl')->references('id_btkl')->on('t_btkl')->cascadeOnDelete();
        });

        // ── 3. Tabel Biaya Overhead Pabrik (BOP) ─────────────────────────
        Schema::create('t_bop', function (Blueprint $table) {
            $table->id('id_bop');
            $table->unsignedBigInteger('id_produksi');
            $table->decimal('total_bop', 15, 2)->default(0);
            $table->date('tanggal_hitung');
            $table->timestamps();
        });

        Schema::create('t_detail_bop', function (Blueprint $table) {
            $table->id('id_detail_bop');
            $table->unsignedBigInteger('id_bop');
            $table->unsignedBigInteger('id_overhead'); // FK ke master overhead
            $table->decimal('biaya', 15, 2)->default(0);
            $table->timestamps();

            $table->foreign('id_bop')->references('id_bop')->on('t_bop')->cascadeOnDelete();
        });

        // ── 4. Tabel Rangkuman COGM ──────────────────────────────────────
        Schema::create('t_cogm', function (Blueprint $table) {
            $table->id('id_cogm');
            $table->unsignedBigInteger('id_produksi');
            $table->decimal('total_bbb', 15, 2)->default(0);
            $table->decimal('total_btkl', 15, 2)->default(0);
            $table->decimal('total_bop', 15, 2)->default(0);
            $table->decimal('total_cogm', 15, 2)->default(0); // Hasil penjumlahan ketiganya
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_cogm');
        Schema::dropIfExists('t_detail_bop');
        Schema::dropIfExists('t_bop');
        Schema::dropIfExists('t_detail_btkl');
        Schema::dropIfExists('t_btkl');
        Schema::dropIfExists('t_detail_bbb');
        Schema::dropIfExists('t_bbb');
    }
};
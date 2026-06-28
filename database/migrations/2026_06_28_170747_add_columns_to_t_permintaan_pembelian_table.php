<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Hapus dulu kolom 'id' bawaan yang bikin bentrok auto_increment
        Schema::table('t_permintaan_pembelian', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        // 2. Masukkan id_pp sebagai primary key baru beserta kolom lainnya
        Schema::table('t_permintaan_pembelian', function (Blueprint $table) {
            $table->increments('id_pp'); // Ini menjadi Primary Key utama tabel ini
            $table->string('no_pp', 20)->unique();
            $table->date('tgl_pp');
            $table->unsignedBigInteger('id_produksi')->nullable();
            $table->enum('jenis_bahan', ['baku', 'penolong', 'tambahan']);
            $table->enum('status', ['diajukan', 'disetujui'])->default('diajukan');
            $table->string('catatan', 255)->nullable();

            // Catatan: $table->timestamps() sengaja dihapus dari sini karena kolomnya sudah ada di database Anda

            // Setup Foreign Key
            $table->foreign('id_produksi')
                  ->references('id_produksi')
                  ->on('t_detail_jadwal_produksi')
                  ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_permintaan_pembelian', function (Blueprint $table) {
            $table->dropForeign(['id_produksi']);
            $table->dropColumn(['id_pp', 'no_pp', 'tgl_pp', 'id_produksi', 'jenis_bahan', 'status', 'catatan']);
            $table->bigIncrements('id'); // Mengembalikan kolom id bawaan jika di-rollback
        });
    }
};

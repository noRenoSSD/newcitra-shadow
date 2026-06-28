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
        // 1. Hapus kolom 'id' bawaan dulu agar tidak bentrok auto_increment
        Schema::table('t_detail_pp', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        // 2. Buat id_detail_pp sebagai Primary Key baru beserta kolom lainnya
        Schema::table('t_detail_pp', function (Blueprint $table) {
            $table->increments('id_detail_pp'); // Primary Key tabel detail

            $table->unsignedInteger('id_pp')->nullable(); // Foreign Key ke tabel induk
            $table->unsignedBigInteger('id_bahan')->nullable();
            $table->decimal('qty_kebutuhan', 10, 2)->nullable();
            $table->integer('qty_diminta')->nullable();

            // Relasi Foreign Key ke tabel t_permintaan_pembelian
            $table->foreign('id_pp')
                  ->references('id_pp')
                  ->on('t_permintaan_pembelian')
                  ->onDelete('cascade'); // cascade = kalau data induk dihapus, detail ikut terhapus
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_detail_pp', function (Blueprint $table) {
            $table->dropForeign(['id_pp']);
            $table->dropColumn(['id_detail_pp', 'id_pp', 'id_bahan', 'qty_kebutuhan', 'qty_diminta']);
            $table->bigIncrements('id'); // Kembalikan id lama jika di-rollback
        });
    }
};

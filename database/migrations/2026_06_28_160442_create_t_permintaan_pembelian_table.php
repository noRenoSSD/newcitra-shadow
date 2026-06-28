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
        Schema::create('t_permintaan_pembelian', function (Blueprint $table) {
            $table->increments('id_pp');
            $table->string('no_pp', 20)->unique();
            $table->date('tgl_pp');
            $table->unsignedBigInteger('id_produksi')->nullable();
            $table->enum('jenis_bahan', ['baku', 'penolong', 'tambahan']);
            $table->enum('status', ['diajukan', 'disetujui'])->default('diajukan');
            $table->string('catatan', 255)->nullable();
            $table->timestamps();

            // Foreign Key Constraint
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
        Schema::dropIfExists('t_permintaan_pembelian');
    }
};

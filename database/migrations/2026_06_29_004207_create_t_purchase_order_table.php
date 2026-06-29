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
        Schema::create('t_purchase_order', function (Blueprint $table) {
            // PK menggunakan increments sesuai request
            $table->increments('id_po');

            $table->string('no_po', 20)->unique();
            $table->date('tgl_po');

            // FK ke tabel t_permintaan_pembelian (Tipe INT Unsigned & Unique)
            $table->unsignedInteger('id_pp')->unique();

            // FK ke tabel t_supplier (Tipe BIGINT Unsigned)
            $table->unsignedBigInteger('id_supplier');

            $table->enum('termin', ['tunai', 'tempo_30']);
            $table->string('catatan', 255)->nullable();
            $table->enum('status', ['diajukan', 'perlu_revisi', 'disetujui'])->default('diajukan');
            $table->string('catatan_finance', 255)->nullable();
            $table->timestamps();

            // Deklarasi Relasi Foreign Key (onDelete restrict)
            $table->foreign('id_pp')
                  ->references('id_pp')
                  ->on('t_permintaan_pembelian')
                  ->onDelete('restrict');

            $table->foreign('id_supplier')
                  ->references('id')
                  ->on('t_supplier')
                  ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_purchase_order');
    }
};

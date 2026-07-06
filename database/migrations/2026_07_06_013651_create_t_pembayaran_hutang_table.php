<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('t_pembayaran_hutang', function (Blueprint $table) {
            $table->id('id_pembayaran');
            $table->unsignedBigInteger('id_hutang'); // Relasi ke master hutang diatas
            $table->unsignedBigInteger('id_retur')->nullable(); // Terisi HANYA jika pengurang hutang berasal dari Retur

            $table->string('no_pembayaran', 50)->unique(); // Contoh: PMB-HU-001 atau RET-HU-001
            $table->date('tanggal_pembayaran');
            $table->decimal('jumlah_dibayar', 15, 2); // Nominal cicilan atau nominal total retur
            $table->string('metode_pembayaran', 30)->default('Transfer Bank'); // Kas, Transfer, Potongan Retur, dll

            // Kolom krusial untuk mencocokkan tipe data di Mockup React kamu ('Bayar' | 'Retur')
            $table->enum('tipe', ['Bayar', 'Retur'])->default('Bayar');

            $table->string('catatan', 255)->nullable();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('id_hutang')
                  ->references('id_hutang')
                  ->on('t_hutang_usaha')
                  ->onDelete('cascade');

            $table->foreign('id_retur')
                  ->references('id_retur')
                  ->on('t_retur_pembelian')
                  ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('t_pembayaran_hutang');
    }
};

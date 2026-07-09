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
        Schema::create('t_pesanan', function (Blueprint $table) {

            $table->increments('id_pesanan');

            $table->string('no_pesanan', 20)->unique();

            $table->date('tgl_pesanan');

            $table->unsignedInteger('id_mitra');

            $table->enum('jenis_transaksi', [
                'Penjualan Langsung',
                'Maklon',
                'Konsinyasi'
            ]);

            $table->string('alamat', 100);

            $table->decimal('total_harga', 20, 0)->default(0);
            $table->text('catatan')->nullable();
            $table->decimal('total_diskon', 12, 0)->default(0);

            $table->timestamps();

            $table->foreign('id_mitra')
                ->references('id_mitra')
                ->on('t_mitra')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_pesanan');
    }
};
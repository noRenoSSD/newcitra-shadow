<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('t_hasil_produksi', function (Blueprint $table) {
        $table->id('id_hasil_produksi');
        $table->unsignedBigInteger('id_produksi');
        $table->decimal('output_aktual', 10, 2);
        $table->date('tanggal_produksi');
        $table->date('tanggal_kadaluarsa');
        $table->string('status', 20)->default('Draft'); // Draft atau Selesai
        $table->timestamps();

        $table->foreign('id_produksi')->references('id_produksi')->on('t_detail_jadwal_produksi')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_hasil_produksi');
    }
};

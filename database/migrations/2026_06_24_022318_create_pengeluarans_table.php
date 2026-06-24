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
    Schema::create('t_pengeluaran', function (Blueprint $table) {
        $table->id('id_pengeluaran');
        $table->string('kode_pengeluaran', 20);
        $table->string('nama_pengeluaran', 50);
        $table->string('keterangan', 200)->nullable(); // nullable agar boleh dikosongkan jika tidak ada keterangan
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengeluarans');
    }
};

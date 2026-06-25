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
    Schema::create('t_karyawan', function (Blueprint $table) {
        $table->id('id_karyawan'); // Primary Key
        $table->string('kode_karyawan', 10);
        $table->string('nama_karyawan', 100);
        $table->enum('jabatan', ['ceo', 'manajer', 'staff']);
        $table->enum('departemen', ['produksi', 'administrasi dan finance', 'distribusi']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_karyawan');
    }
};

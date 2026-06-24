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
    Schema::create('t_supplier', function (Blueprint $table) {
        $table->id(); // Primary key bernama 'id'
        $table->string('kode_supplier', 20)->unique();
        $table->string('nama_supplier', 50);
        $table->string('kontak_supplier', 50);
        $table->string('alamat_supplier', 100);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};

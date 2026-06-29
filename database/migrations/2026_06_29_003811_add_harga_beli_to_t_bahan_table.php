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
        Schema::table('t_bahan', function (Blueprint $table) {
            // Menambahkan kolom harga_beli (decimal 15,2) setelah stok_min dengan default 0
            $table->decimal('harga_beli', 15, 2)->default(0)->after('stok_min');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_bahan', function (Blueprint $table) {
            // Menghapus kembali kolom harga_beli jika dilakukan rollback
            $table->dropColumn('harga_beli');
        });
    }
};

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
            $table->enum('kategori_simpan', ['perishable', 'non_perishable'])
                  ->default('non_perishable')
                  ->after('jenis_bahan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_bahan', function (Blueprint $table) {
            $table->dropColumn('kategori_simpan');
        });
    }
};

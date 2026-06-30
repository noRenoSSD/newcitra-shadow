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
        Schema::table('t_permintaan_pembelian', function (Blueprint $table) {
            $table->date('tgl_mulai_periode')->nullable()->after('id_produksi');
            $table->date('tgl_akhir_periode')->nullable()->after('tgl_mulai_periode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_permintaan_pembelian', function (Blueprint $table) {
            $table->dropColumn(['tgl_mulai_periode', 'tgl_akhir_periode']);
        });
    }
};

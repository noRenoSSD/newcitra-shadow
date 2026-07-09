<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('t_surat_jalan', function (Blueprint $table) {
            $table->text('catatan')->nullable()->after('status');
        });

        Schema::table('t_jual', function (Blueprint $table) {
            $table->text('catatan')->nullable()->after('grand_total');
        });

        Schema::table('t_retur_jual', function (Blueprint $table) {
            $table->text('catatan')->nullable()->after('grand_total');
        });

        Schema::table('t_retur_konsinyasi', function (Blueprint $table) {
            $table->text('catatan')->nullable()->after('grand_total');
        });
    }

    public function down(): void
    {
        Schema::table('t_surat_jalan', function (Blueprint $table) {
            $table->dropColumn('catatan');
        });

        Schema::table('t_jual', function (Blueprint $table) {
            $table->dropColumn('catatan');
        });

        Schema::table('t_retur_jual', function (Blueprint $table) {
            $table->dropColumn('catatan');
        });

        Schema::table('t_retur_konsinyasi', function (Blueprint $table) {
            $table->dropColumn('catatan');
        });
    }
};
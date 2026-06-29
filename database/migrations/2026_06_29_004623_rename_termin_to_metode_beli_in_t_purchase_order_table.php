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
        Schema::table('t_purchase_order', function (Blueprint $table) {
            // Mengubah nama kolom dari 'termin' menjadi 'metode_beli' tanpa merusak tipe datanya
            $table->renameColumn('termin', 'metode_beli');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_purchase_order', function (Blueprint $table) {
            // Mengembalikan namanya jika dilakukan rollback di masa depan
            $table->renameColumn('metode_beli', 'termin');
        });
    }
};

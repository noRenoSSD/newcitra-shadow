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
        Schema::create('t_piutang_perpanjangan', function (Blueprint $table) {
            $table->id('id_perpanjangan');
            $table->unsignedBigInteger('id_piutang');
            $table->decimal('nominal', 15, 2);
            $table->date('jt_lama');
            $table->date('jt_baru');
            
            $table->text('alasan')->nullable();
            
            $table->timestamps();
            $table->foreign('id_piutang')
                  ->references('id_piutang')
                  ->on('t_piutang')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_piutang_perpanjangan');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('t_penerimaan_bahan', function (Blueprint $table) {
            $table->id('id_penerimaan');
            $table->string('no_penerimaan', 50)->unique();
            // Asumsi tabel PO kamu bernama 't_purchase_order' dan primary key-nya 'id_po'
            // Silakan sesuaikan jika namanya berbeda
            $table->unsignedBigInteger('id_po');
            $table->date('tanggal_penerimaan');
            $table->text('catatan')->nullable();
            $table->timestamps();

            // Opsional: Jika ingin mengaktifkan foreign key langsung di database
            // $table->foreign('id_po')->references('id_po')->on('t_purchase_order')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('t_penerimaan_bahan');
    }
};

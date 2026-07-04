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
    Schema::create('t_transaksi_pembelian', function (Blueprint $table) {
        $table->id('id_transaksi');
        $table->unsignedBigInteger('id_penerimaan');
        $table->string('no_faktur', 50);
        $table->date('tanggal_transaksi');
        $table->string('metode_pembayaran', 20); // Tunai / Kredit
        $table->string('status_pembayaran', 20); // Lunas / Belum Lunas
        $table->date('jatuh_tempo')->nullable(); // Hanya diisi jika Kredit

        // Data Keuangan
        $table->decimal('subtotal_barang', 15, 2);
        $table->decimal('diskon', 15, 2)->default(0);
        $table->decimal('ongkos_kirim', 15, 2)->default(0);
        $table->decimal('pajak', 15, 2)->default(0);
        $table->decimal('total_tagihan', 15, 2);

        $table->timestamps();
        $table->foreign('id_penerimaan')->references('id_penerimaan')->on('t_penerimaan_bahan');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_transaksi_pembelian');
    }
};

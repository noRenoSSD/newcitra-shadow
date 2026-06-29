<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up():void
    {
        Schema::create('t_jual', function (Blueprint $table) {
            $table->integer('id_jual', true); // int(12) Primary Key & Auto Increment
            $table->string('no_jual', 20)->unique(); // varchar(20)
            $table->date('tgl_jual'); // date
            $table->integer('id_pesanan'); // int(12)
            
            // Sesuaikan pilihan opsi enum di bawah ini dengan kebutuhan bisnismu
            $table->enum('jenis_penjualan', ['Grosir', 'Eceran']); 
            $table->enum('metode_pembayaran', ['Tunai', 'Kredit']); 
            
            $table->decimal('subtotal', 20, 0); // decimal(20,0)
            $table->decimal('total_diskon', 20, 0); // decimal(20,0)
            $table->decimal('total_hpp', 20, 0); // Kolom baru penampung akumulasi modal awal
            $table->decimal('grand_total', 25, 0); // decimal(25,0)
            
            $table->timestamps(); // Mengisi created_at dan updated_at
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penjualans');
    }
};

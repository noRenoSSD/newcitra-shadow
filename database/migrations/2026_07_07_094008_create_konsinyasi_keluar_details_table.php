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
        Schema::create('t_konsinyasi_keluar_detail', function (Blueprint $table) {
            $table->integer('id_konsinyasi_detail')->autoIncrement(); // PK Detail tetap integer
            
            // 1. Sesuaikan id_konsinyasi_keluar dengan tipe data tabel induknya (Integer standar)
            $table->integer('id_konsinyasi_keluar'); 
            
            // 2. Ubah id_produk & id_harga menjadi bigInteger unsigned agar cocok dengan master tabel default Laravel
            $table->bigInteger('id_produk')->unsigned();
            $table->bigInteger('id_harga')->unsigned();
            
            $table->integer('qty'); 
            $table->decimal('harga_titip', 20, 0); 
            $table->decimal('subtotal', 20, 0); 
            $table->timestamps();

            // 3. Pasang Kembali Foreign Key Constraints
            $table->foreign('id_konsinyasi_keluar', 'fk_tk_detail_id_tk')
                  ->references('id_konsinyasi_keluar')
                  ->on('t_konsinyasi_keluar')
                  ->onDelete('cascade');

            $table->foreign('id_produk', 'fk_tk_detail_id_produk')
                  ->references('id_produk')
                  ->on('t_produk');

            $table->foreign('id_harga', 'fk_tk_detail_id_harga')
                  ->references('id_harga_produk')
                  ->on('t_harga_produk'); // <--- GANTI 't_harga' jika nama tabel hargamu berbeda
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_konsinyasi_keluar_detail');
    }
};
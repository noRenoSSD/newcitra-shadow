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
        Schema::create('t_detail_po', function (Blueprint $table) {
            // PK menggunakan increments
            $table->increments('id_detail_po');

            // FK ke tabel t_purchase_order (Tipe INT Unsigned)
            $table->unsignedInteger('id_po');

            // FK ke tabel t_bahan (Tipe BIGINT Unsigned)
            $table->unsignedBigInteger('id_bahan');

            // FK ke tabel t_detail_pp (Tipe INT Unsigned)
            $table->unsignedInteger('id_detail_pp');

            $table->decimal('qty_po', 10, 2);
            $table->decimal('harga_satuan', 15, 2);

            // Generated Column menggunakan virtualAs (qty_po * harga_satuan)
            $table->decimal('subtotal', 15, 2)->virtualAs('qty_po * harga_satuan');

            $table->timestamps();

            // Deklarasi Relasi Foreign Key
            $table->foreign('id_po')
                  ->references('id_po')
                  ->on('t_purchase_order')
                  ->onDelete('cascade'); // Sesuai request: onDelete cascade

            $table->foreign('id_bahan')
                  ->references('id_bahan')
                  ->on('t_bahan')
                  ->onDelete('restrict'); // Sesuai request: onDelete restrict

            $table->foreign('id_detail_pp')
                  ->references('id_detail_pp')
                  ->on('t_detail_pp')
                  ->onDelete('restrict'); // Sesuai request: onDelete restrict
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_detail_po');
    }
};

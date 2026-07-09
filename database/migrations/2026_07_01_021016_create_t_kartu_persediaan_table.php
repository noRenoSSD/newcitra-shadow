<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('t_kartu_persediaan', function (Blueprint $table) {
        $table->id('id_kartu'); // Tetap pakai primary key lama kamu

        // Relasi ke tabel master
        $table->unsignedBigInteger('id_bahan')->nullable();
        $table->unsignedBigInteger('id_produk')->nullable();

        // Info Transaksi
        $table->string('no_referensi', 50);
        // Mengubah string biasa menjadi ENUM agar sesuai kesepakatan struktur database yang konsisten
        $table->enum('jenis_transaksi', ['MASUK', 'KELUAR']);
        $table->enum('sumber_transaksi', ['pembelian', 'produksi_masuk', 'produksi_keluar', 'retur_pembelian', 'retur_penjualan', 'penjualan','penyesuaian_harga','stock_opname','konsinyasi_keluar','retur_konsinyasi']);
        $table->string('keterangan')->nullable();

        // Blok MASUK (In) - Tambahan kolom Harga & Total
        $table->decimal('qty_masuk', 12, 2)->default(0);
        $table->decimal('harga_masuk', 14, 2)->default(0);
        $table->decimal('total_masuk', 14, 2)->default(0);

        // Blok KELUAR (Out) - Tambahan kolom Harga & Total
        $table->decimal('qty_keluar', 12, 2)->default(0);
        $table->decimal('harga_keluar', 14, 2)->default(0);
        $table->decimal('total_keluar', 14, 2)->default(0);

        // Blok SALDO JALAN - Lengkap untuk rumus Moving Average
        $table->decimal('saldo_qty', 12, 2)->default(0);     // Pengganti saldo_akhir lama kamu
        $table->decimal('saldo_harga', 14, 2)->default(0);   // Nilai rata-rata berjalan saat ini
        $table->decimal('saldo_total', 14, 2)->default(0);   // Total nilai uang di gudang

        $table->date('tanggal_transaksi');
        $table->timestamps();

        // Foreign keys tetap dipertahankan
        $table->foreign('id_bahan')->references('id_bahan')->on('t_bahan')->onDelete('set null');
        $table->foreign('id_produk')->references('id_produk')->on('t_produk')->onDelete('set null');

        // Index untuk mempercepat query report/laporan keuangan
        $table->index(['id_bahan', 'tanggal_transaksi']);
        $table->index(['id_produk', 'tanggal_transaksi']);
    });
}

    public function down(): void
    {
        Schema::dropIfExists('t_kartu_persediaan');
    }
};

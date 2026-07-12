<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_transaksi_pengeluaran', function (Blueprint $table) {
            // 1. Primary Key
            $table->id('id_transaksi');
            // 2. FK ke t_akun
            $table->unsignedBigInteger('id_akun');
            // 3. FK ke t_cogm (Nullable karena hanya diisi saat bayar utang)
            $table->unsignedBigInteger('id_cogm')->nullable();
            // 4. Jenis Pengeluaran
            $table->enum('jenis_pengeluaran', ['Operasional', 'Pembayaran Utang Produksi']);
            // 5. Jenis Utang (Nullable)
            $table->enum('jenis_utang', ['BTKL', 'BOP'])->nullable();
            // 6. Nomor Transaksi
            $table->string('no_transaksi', 20);
            // 7. Tanggal Transaksi
            $table->date('tgl_transaksi');
            // 8. Nominal Bayar (Menggunakan Decimal 15,2 untuk akurasi uang)
            $table->decimal('nominal_bayar', 15, 2);
            // 9. Metode Bayar ('Transfer' menggunakan huruf besar di awal sesuai gambar)
            $table->enum('metode_bayar', ['Cash', 'Transfer']);

            // 10. Catatan (Nullable)
            $table->text('catatan')->nullable();

            // Timestamps (created_at & updated_at)
            $table->timestamps();

            // ─── Setup Relasi Foreign Key ───
            // Asumsi primary key di t_akun adalah id_akun dan di t_cogm adalah id_cogm
            $table->foreign('id_akun')->references('id_akun')->on('t_akun')->restrictOnDelete();
            
            // Pakai nullOnDelete agar jika data COGM dihapus, transaksi tidak hilang tapi id_cogm-nya jadi NULL
            $table->foreign('id_cogm')->references('id_cogm')->on('t_cogm')->nullOnDelete(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_transaksi_pengeluaran');
    }
};
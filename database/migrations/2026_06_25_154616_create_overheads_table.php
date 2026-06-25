<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('t_overhead', function (Blueprint $table) {
            $table->id('id_overhead'); // Otomatis jadi Primary Key Auto Increment
            $table->string('kode_overhead', 10);
            $table->string('nama_overhead', 100);
            $table->string('keterangan', 255)->nullable(); // Nullable agar boleh kosong
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('t_overhead');
    }
};
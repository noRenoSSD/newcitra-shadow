<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('t_divisi', function (Blueprint $table) {
        $table->id('id_divisi');
        $table->string('kode_divisi', 10)->unique();
        $table->string('nama_divisi', 100);
        $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('t_divisi');
    }
};
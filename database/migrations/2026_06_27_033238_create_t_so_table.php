<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_so', function (Blueprint $table) {
            $table->increments('id_so');
            $table->string('no_so', 20)->unique();
            $table->date('tgl_so');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_so');
    }
};

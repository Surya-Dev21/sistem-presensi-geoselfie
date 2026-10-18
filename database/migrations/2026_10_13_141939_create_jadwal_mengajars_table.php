<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_mengajars', function (Blueprint $table) {
            $table->id();
            $table->string('nip'); // Terhubung ke NIP Pegawai
            $table->string('hari'); // Senin, Selasa, Rabu, Kamis, Jumat, Sabtu
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->string('mata_pelajaran');
            $table->string('kelas');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['nip', 'hari']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_mengajars');
    }
};
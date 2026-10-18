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
        Schema::create('absensi', function (Blueprint $table) {
            $table->id();
            $table->string('nip', 30);
            $table->date('tgl_absen');
            $table->time('jam_masuk')->nullable();
            $table->time('jam_keluar')->nullable();
            $table->enum('status', ['Hadir', 'Izin', 'Sakit', 'Alpa'])->default('Hadir');
            //geolokasi & swafoto masuk
            $table->string('location_in')->nullable();
            $table->text('foto_in')->nullable();
            //geolokasi & swafoto keluar
            $table->string('location_out')->nullable();
            $table->text('foto_out')->nullable();
            $table->timestamps();
            //foreign key ke nip pegawai (menggunakan nip sebagai referensi)
            $table->foreign('nip')->references('nip')->on('pegawai')->onDelete('cascade');
            //indexing untuk performa pencarian laporan dan dashboard
            $table->index(['nip', 'tgl_absen']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absensi');
    }
};

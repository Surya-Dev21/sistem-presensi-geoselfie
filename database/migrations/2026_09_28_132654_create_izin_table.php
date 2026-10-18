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
        Schema::create('izin', function (Blueprint $table) {
            $table->id();
            $table->string('nip', 30);
            $table->date('tgl_mulai');
            $table->date('tgl_selesai');
            $table->enum('status', ['izin', 'sakit']);
            $table->text('keterangan');
            $table->string('bukti_file')->nullable();
            $table->enum('status_approval', ['pending', 'approved', 'rejected']);
            $table->timestamps();
            //foreign key ke tabel pegawai
            $table->foreign('nip')->references('nip')->on('pegawai')->onDelete('cascade');
            //indexing untuk mempercepat pencarian data izin berdasarkan pegawai
            $table->index('nip');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('izin');
    }
};

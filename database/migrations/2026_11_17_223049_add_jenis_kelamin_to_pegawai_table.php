<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            // L = Laki-laki, P = Perempuan. Default L (paling umum untuk "Guru")
            $table->enum('jenis_kelamin', ['L', 'P'])->default('L')->after('jabatan');
        });
    }

    public function down(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            $table->dropColumn('jenis_kelamin');
        });
    }
};

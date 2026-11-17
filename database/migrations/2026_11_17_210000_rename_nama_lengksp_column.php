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
        Schema::table('pegawai', function (Blueprint $table) {
            // Perbaiki typo kolom lama `nama_lengksp` -> `nama_lengkap`.
            // Guard agar aman jika dijalankan ulang / lingkungan sudah bersih.
            if (Schema::hasColumn('pegawai', 'nama_lengksp') && !Schema::hasColumn('pegawai', 'nama_lengkap')) {
                $table->renameColumn('nama_lengksp', 'nama_lengkap');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            if (Schema::hasColumn('pegawai', 'nama_lengkap') && !Schema::hasColumn('pegawai', 'nama_lengksp')) {
                $table->renameColumn('nama_lengkap', 'nama_lengksp');
            }
        });
    }
};

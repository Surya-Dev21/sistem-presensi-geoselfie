<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            $table->unsignedInteger('jarak_in')->nullable()->after('location_in');
            $table->unsignedInteger('jarak_out')->nullable()->after('location_out');
        });
    }

    public function down(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            $table->dropColumn(['jarak_in', 'jarak_out']);
        });
    }
};

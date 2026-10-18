<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Absensi extends Model
{
    use HasFactory;

    // Menentukan nama tabel sesuai migration Anda
    protected $table = 'absensi';

    protected $fillable = [
        'nip',
        'tgl_absen',
        'jam_masuk',
        'jam_keluar',
        'status',
        'location_in',
        'foto_in',
        'location_out',
        'foto_out',
    ];

    // Relasi ke pegawai (menggunakan FK NIP)
    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'nip', 'nip');
    }
}
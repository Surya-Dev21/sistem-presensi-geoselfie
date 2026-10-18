<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JadwalMengajar extends Model
{
    use HasFactory;

    protected $fillable = [
        'nip',
        'hari',
        'jam_mulai',
        'jam_selesai',
        'mata_pelajaran',
        'kelas',
        'is_active',
    ];
}
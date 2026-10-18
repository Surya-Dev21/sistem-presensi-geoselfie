<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Izin extends Model
{
    use HasFactory;
    protected $table = 'izin';
    protected $fillable = [
        'nip',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
        'keterangan',
        'bukti_file',
        'status_approval',
    ];

}

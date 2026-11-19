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
        'tgl_mulai',
        'tgl_selesai',
        'status',
        'keterangan',
        'bukti_file',
        'status_approval',
    ];

    protected $casts = [
        'tgl_mulai'   => 'date:Y-m-d',
        'tgl_selesai' => 'date:Y-m-d',
    ];

}

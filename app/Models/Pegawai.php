<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;


class Pegawai extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'pegawai';
    protected $primaryKey = 'nip';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'nip',
        'nama_lengkap',
        'nama_lengksp',
        'jabatan',
        'no_hp',
        'email',
        'password',
    ];

    /**
     * Accessor untuk nama agar seragam bisa diakses via $pegawai->nama atau $pegawai->nama_lengkap
     */
    public function getNamaAttribute()
    {
        return $this->attributes['nama_lengkap'] ?? $this->attributes['nama_lengksp'] ?? null;
    }

    public function setNamaAttribute($value)
    {
        if (array_key_exists('nama_lengksp', $this->attributes)) {
            $this->attributes['nama_lengksp'] = $value;
        } else {
            $this->attributes['nama_lengkap'] = $value;
        }
    }
    protected $hidden = [
        'password',
        'remember_token',
    ];

    //relasi ke absensi
    public function absensi()
    {
        return $this->hasMany(Absensi::class, 'nip', 'nip');
    }
    //relasi ke izin
    public function izin()
    {
        return $this->hasMany(Izin::class, 'nip', 'nip');
    }
}


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
        'jabatan',
        'jenis_kelamin',
        'no_hp',
        'email',
        'password',
    ];

    /**
     * Alias agar kolom `nama_lengkap` bisa diakses via $pegawai->nama
     */
    public function getNamaAttribute(): ?string
    {
        return $this->attributes['nama_lengkap'] ?? null;
    }

    public function setNamaAttribute(string $value): void
    {
        $this->attributes['nama_lengkap'] = $value;
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

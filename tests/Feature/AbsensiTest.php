<?php

use App\Models\Absensi;
use App\Models\Pegawai;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

function buatPegawai(): Pegawai
{
    return Pegawai::create([
        'nip' => '199001012020011001',
        'nama_lengkap' => 'Budi Santoso',
        'jabatan' => 'Guru Mapel',
        'no_hp' => '08123456789',
        'email' => 'budi@example.test',
        'jenis_kelamin' => 'L',
        'password' => bcrypt('password'),
    ]);
}

test('halaman presensi dan riwayat bisa dirender', function () {
    $pegawai = buatPegawai();

    $this->actingAs($pegawai, 'pegawai')->get('/absensi')->assertOk();
    $this->actingAs($pegawai, 'pegawai')->get('/kalender')->assertOk();
});

test('presensi masuk dan pulang tersimpan serta muncul di riwayat', function () {
    Storage::fake('public');
    $pegawai = buatPegawai();
    $foto = 'data:image/jpeg;base64,' . base64_encode('dummy');

    $this->actingAs($pegawai, 'pegawai')->post('/absensi', [
        'tipe_absen' => 'masuk',
        'latitude' => -6.91,
        'longitude' => 107.33,
        'jarak' => 42,
        'foto' => $foto,
    ])->assertRedirect(route('pegawai.dashboard'));

    $absen = Absensi::where('nip', $pegawai->nip)->first();
    expect($absen)->not->toBeNull();
    expect($absen->jam_masuk)->not->toBeNull();
    expect($absen->jarak_in)->toBe(42);

    $this->actingAs($pegawai, 'pegawai')->post('/absensi', [
        'tipe_absen' => 'pulang',
        'latitude' => -6.91,
        'longitude' => 107.33,
        'jarak' => 50,
        'foto' => $foto,
    ])->assertRedirect(route('pegawai.dashboard'));

    $absen->refresh();
    expect($absen->jam_keluar)->not->toBeNull();
    expect($absen->jarak_out)->toBe(50);
});

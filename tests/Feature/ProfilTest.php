<?php

use App\Models\Absensi;
use App\Models\Izin;
use App\Models\JadwalMengajar;
use App\Models\Pegawai;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

function guruProfil(): Pegawai {
    return Pegawai::create([
        'nip' => '199002022020011002',
        'nama_lengkap' => 'Siti Aminah',
        'jabatan' => 'Guru Mapel',
        'jenis_kelamin' => 'P',
        'no_hp' => '081200000000',
        'email' => 'siti@example.test',
        'password' => bcrypt('password'),
    ]);
}

test('ubah nama saja tidak menyentuh field lain', function () {
    $guru = guruProfil();

    $this->actingAs($guru, 'pegawai')
        ->put('/profil', ['nama' => 'Siti Aminah Baru'])
        ->assertRedirect();

    $fresh = $guru->fresh();
    expect($fresh->nama)->toBe('Siti Aminah Baru');
    expect($fresh->email)->toBe('siti@example.test');
    expect($fresh->no_hp)->toBe('081200000000');
    expect($fresh->nip)->toBe('199002022020011002');
});

test('ubah NIP memindahkan seluruh riwayat dan menghapus baris lama', function () {
    $guru = guruProfil();
    $nipLama = $guru->nip;
    $nipBaru = '199002022020011999';

    Absensi::create(['nip' => $nipLama, 'tgl_absen' => now()->toDateString(), 'status' => 'Hadir']);
    Izin::create([
        'nip' => $nipLama,
        'tgl_mulai' => now()->toDateString(),
        'tgl_selesai' => now()->toDateString(),
        'status' => 'izin',
        'keterangan' => 'Urusan keluarga',
        'status_approval' => 'approved',
    ]);
    JadwalMengajar::create([
        'nip' => $nipLama,
        'hari' => 'Senin',
        'jam_mulai' => '07:00:00',
        'jam_selesai' => '08:30:00',
        'mata_pelajaran' => 'Matematika',
        'kelas' => 'X-1',
    ]);

    $this->actingAs($guru, 'pegawai')
        ->put('/profil', ['nip' => $nipBaru])
        ->assertRedirect();

    $this->assertDatabaseMissing('pegawai', ['nip' => $nipLama]);
    $this->assertDatabaseHas('pegawai', ['nip' => $nipBaru]);
    $this->assertDatabaseHas('absensi', ['nip' => $nipBaru]);
    $this->assertDatabaseHas('izin', ['nip' => $nipBaru]);
    $this->assertDatabaseHas('jadwal_mengajars', ['nip' => $nipBaru]);

    expect(auth('pegawai')->user()->nip)->toBe($nipBaru);
});

test('NIP duplikat ditolak', function () {
    $guru = guruProfil();

    Pegawai::create([
        'nip' => '198801012019011003',
        'nama_lengkap' => 'Budi Santoso',
        'jabatan' => 'Guru Mapel',
        'jenis_kelamin' => 'L',
        'no_hp' => '081200000001',
        'email' => 'budi@example.test',
        'password' => bcrypt('password'),
    ]);

    $this->actingAs($guru, 'pegawai')
        ->put('/profil', ['nip' => '198801012019011003'])
        ->assertSessionHasErrors('nip');

    expect($guru->fresh()->nip)->toBe('199002022020011002');
});

test('no hp divalidasi dan dinormalisasi ke format 08', function () {
    $guru = guruProfil();

    $this->actingAs($guru, 'pegawai')
        ->put('/profil', ['no_hp' => '12345'])
        ->assertSessionHasErrors('no_hp');

    $this->actingAs($guru, 'pegawai')
        ->put('/profil', ['no_hp' => '+6281234567890'])
        ->assertRedirect();

    expect($guru->fresh()->no_hp)->toBe('081234567890');
});

test('ganti password wajib password lama yang benar', function () {
    $guru = guruProfil();

    $this->actingAs($guru, 'pegawai')
        ->put('/profil', [
            'password_lama' => 'salah',
            'password_baru' => 'rahasia123',
            'password_baru_confirmation' => 'rahasia123',
        ])
        ->assertSessionHasErrors('password_lama');

    $this->actingAs($guru, 'pegawai')
        ->put('/profil', [
            'password_lama' => 'password',
            'password_baru' => 'rahasia123',
            'password_baru_confirmation' => 'rahasia123',
        ])
        ->assertRedirect();

    expect(Hash::check('rahasia123', $guru->fresh()->password))->toBeTrue();
});

test('tamu tidak bisa mengakses profil', function () {
    $this->get('/profil')->assertRedirect();
    $this->put('/profil', ['nama' => 'Tes'])->assertRedirect();
});

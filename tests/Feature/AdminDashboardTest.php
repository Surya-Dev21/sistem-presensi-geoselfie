<?php

use App\Models\Absensi;
use App\Models\Admin;
use App\Models\Izin;
use App\Models\Pegawai;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

// Nama fungsi sengaja unik agar tidak bentrok dengan helper di file tes lain.
function adminDashUji(): Admin
{
    return Admin::create([
        'name' => 'Admin Uji',
        'email' => 'admin-dash@example.test',
        'password' => bcrypt('password'),
    ]);
}

function guruDashUji(): Pegawai
{
    return Pegawai::create([
        'nip' => '199003032020011003',
        'nama_lengkap' => 'Budi Santoso',
        'jabatan' => 'Guru Mapel',
        'jenis_kelamin' => 'L',
        'no_hp' => '081200000123',
        'email' => 'budi-dash@example.test',
        'password' => bcrypt('password'),
    ]);
}

test('tamu dialihkan dari dashboard admin', function () {
    $this->get('/admin/dashboard')->assertRedirect('/login');
});

test('admin melihat statistik dan tren presensi 7 hari', function () {
    $admin = adminDashUji();
    $guru = guruDashUji();

    Absensi::create([
        'nip' => $guru->nip,
        'tgl_absen' => now('Asia/Jakarta')->toDateString(),
        'status' => 'Hadir',
    ]);

    $this->actingAs($admin, 'admin')
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->where('totalPegawai', 1)
            ->where('hadirHariIni', 1)
            ->has('trenPresensi', 7));
});

test('notifikasi admin berisi izin yang masih pending', function () {
    $admin = adminDashUji();
    $guru = guruDashUji();

    Izin::create([
        'nip' => $guru->nip,
        'tgl_mulai' => now('Asia/Jakarta')->toDateString(),
        'tgl_selesai' => now('Asia/Jakarta')->toDateString(),
        'status' => 'izin',
        'keterangan' => 'Urusan keluarga',
        'status_approval' => 'pending',
    ]);

    $this->actingAs($admin, 'admin')
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('jumlahIzinPending', 1)
            ->has('notifikasiAdmin', 1));
});

test('admin dapat membuka halaman profil', function () {
    $admin = adminDashUji();

    $this->actingAs($admin, 'admin')
        ->get('/admin/profil')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Profil')
            ->where('admin.email', 'admin-dash@example.test'));
});

test('admin dapat memperbarui nama dan email', function () {
    $admin = adminDashUji();

    $this->actingAs($admin, 'admin')
        ->put('/admin/profil', [
            'name' => 'Admin Sekolah Baru',
            'email' => 'admin-baru@example.test',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($admin->fresh()->name)->toBe('Admin Sekolah Baru');
    expect($admin->fresh()->email)->toBe('admin-baru@example.test');
});

test('email admin lain tidak boleh dipakai', function () {
    $admin = adminDashUji();

    Admin::create([
        'name' => 'Admin Lain',
        'email' => 'admin-lain@example.test',
        'password' => bcrypt('password'),
    ]);

    $this->actingAs($admin, 'admin')
        ->put('/admin/profil', [
            'name' => 'Admin Uji',
            'email' => 'admin-lain@example.test',
        ])
        ->assertSessionHasErrors('email');
});

test('ganti password admin wajib password lama yang benar', function () {
    $admin = adminDashUji();

    $this->actingAs($admin, 'admin')
        ->put('/admin/profil', [
            'name' => 'Admin Uji',
            'email' => 'admin-dash@example.test',
            'password_lama' => 'salah',
            'password_baru' => 'rahasia123',
            'password_baru_confirmation' => 'rahasia123',
        ])
        ->assertSessionHasErrors('password_lama');

    $this->actingAs($admin, 'admin')
        ->put('/admin/profil', [
            'name' => 'Admin Uji',
            'email' => 'admin-dash@example.test',
            'password_lama' => 'password',
            'password_baru' => 'rahasia123',
            'password_baru_confirmation' => 'rahasia123',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(Hash::check('rahasia123', $admin->fresh()->password))->toBeTrue();
});

test('statistik presensi bisa dilihat per bulan dan per tahun', function () {
    $admin = adminDashUji();

    $this->actingAs($admin, 'admin')
        ->get('/admin/dashboard?periode=bulanan')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('periode', 'bulanan')
            ->has('trenPresensi', now('Asia/Jakarta')->daysInMonth));

    $this->actingAs($admin, 'admin')
        ->get('/admin/dashboard?periode=tahunan')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('periode', 'tahunan')
            ->has('trenPresensi', 12));

    // Nilai periode tidak dikenal jatuh kembali ke mingguan (7 hari)
    $this->actingAs($admin, 'admin')
        ->get('/admin/dashboard?periode=ngawur')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('periode', 'mingguan')
            ->has('trenPresensi', 7));
});

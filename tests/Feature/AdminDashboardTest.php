<?php

use App\Models\Absensi;
use App\Models\Admin;
use App\Models\Izin;
use App\Models\JadwalMengajar;
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

test('halaman jadwal memuat relasi pegawai', function () {
    $admin = adminDashUji();
    $guru = guruDashUji();

    JadwalMengajar::create([
        'nip' => $guru->nip,
        'hari' => 'Senin',
        'jam_mulai' => '07:00',
        'jam_selesai' => '08:30',
        'mata_pelajaran' => 'Matematika',
        'kelas' => 'X IPA 1',
    ]);

    $this->actingAs($admin, 'admin')
        ->get('/admin/jadwal')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Jadwal')
            ->where('jadwal.data.0.pegawai.nama_lengkap', 'Budi Santoso'));
});

test('admin dapat mengubah jadwal pelajaran', function () {
    $admin = adminDashUji();
    $guru = guruDashUji();

    $jadwal = JadwalMengajar::create([
        'nip' => $guru->nip,
        'hari' => 'Senin',
        'jam_mulai' => '07:00',
        'jam_selesai' => '08:30',
        'mata_pelajaran' => 'Matematika',
        'kelas' => 'X IPA 1',
    ]);

    $this->actingAs($admin, 'admin')
        ->put("/admin/jadwal/{$jadwal->id}", [
            'nip' => $guru->nip,
            'hari' => 'Rabu',
            'jam_mulai' => '09:00',
            'jam_selesai' => '10:30',
            'mata_pelajaran' => 'Fisika',
            'kelas' => 'XI IPA 2',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $jadwal->refresh();
    expect($jadwal->hari)->toBe('Rabu');
    expect($jadwal->mata_pelajaran)->toBe('Fisika');
    expect($jadwal->kelas)->toBe('XI IPA 2');
    expect(substr($jadwal->jam_mulai, 0, 5))->toBe('09:00');
});

test('statistik presensi bisa dilihat per bulan dan per tahun', function () {    $admin = adminDashUji();

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

test('daftar guru bisa difilter jenis kelamin dan diurutkan nama', function () {
    $admin = adminDashUji();

    foreach ([
        ['199001010000000001', 'Budi Santoso', 'L'],
        ['199001010000000002', 'Ani Lestari', 'P'],
        ['199001010000000003', 'Citra Dewi', 'P'],
    ] as [$nip, $nama, $jk]) {
        Pegawai::create([
            'nip' => $nip,
            'nama_lengkap' => $nama,
            'jabatan' => 'Guru Mapel',
            'jenis_kelamin' => $jk,
            'no_hp' => '081200000000',
            'email' => "{$nip}@example.test",
            'password' => bcrypt('password'),
        ]);
    }

    // Default: semua guru, urut nama A-Z
    $this->actingAs($admin, 'admin')
        ->get('/admin/pegawai')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Pegawai')
            ->where('filter.sort', 'asc')
            ->where('daftarPegawai.data.0.nama_lengkap', 'Ani Lestari'));

    // Filter perempuan + urut Z-A
    $this->actingAs($admin, 'admin')
        ->get('/admin/pegawai?jk=P&sort=desc')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filter.jk', 'P')
            ->where('filter.sort', 'desc')
            ->has('daftarPegawai.data', 2)
            ->where('daftarPegawai.data.0.nama_lengkap', 'Citra Dewi')
            ->where('daftarPegawai.data.1.nama_lengkap', 'Ani Lestari'));
});

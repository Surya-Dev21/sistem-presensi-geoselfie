<?php

use App\Models\Admin;
use App\Models\Izin;
use App\Models\Pegawai;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function guruUji(): Pegawai
{
    return Pegawai::create([
        'nip' => '199002022020011002',
        'nama_lengkap' => 'Siti Aminah',
        'jabatan' => 'Guru Mapel',
        'no_hp' => '081200000000',
        'email' => 'siti@example.test',
        'jenis_kelamin' => 'P',
        'password' => bcrypt('password'),
    ]);
}

function adminUji(): Admin
{
    return Admin::create([
        'name' => 'Admin Uji',
        'email' => 'admin@example.test',
        'password' => bcrypt('password'),
    ]);
}

function izinUji(Pegawai $pegawai, string $statusApproval = 'pending'): Izin
{
    $hari = now('Asia/Jakarta')->startOfMonth()->addDays(9)->toDateString();

    return Izin::create([
        'nip' => $pegawai->nip,
        'tgl_mulai' => $hari,
        'tgl_selesai' => $hari,
        'status' => 'izin',
        'keterangan' => 'Urusan keluarga',
        'status_approval' => $statusApproval,
    ]);
}

test('admin bisa menyetujui pengajuan', function () {
    $izin = izinUji(guruUji());

    $this->actingAs(adminUji(), 'admin')
        ->patch("/admin/izin/{$izin->id}", ['status_approval' => 'approved'])
        ->assertRedirect();

    $fresh = $izin->fresh();
    expect($fresh->status_approval)->toBe('approved');
    expect($fresh->dibaca_at)->toBeNull();
});

test('penolakan wajib menyertakan catatan', function () {
    $izin = izinUji(guruUji());

    $this->actingAs(adminUji(), 'admin')
        ->patch("/admin/izin/{$izin->id}", ['status_approval' => 'rejected'])
        ->assertSessionHasErrors('catatan_admin');

    expect($izin->fresh()->status_approval)->toBe('pending');
});

test('penolakan dengan catatan tersimpan', function () {
    $izin = izinUji(guruUji());

    $this->actingAs(adminUji(), 'admin')
        ->patch("/admin/izin/{$izin->id}", [
            'status_approval' => 'rejected',
            'catatan_admin' => 'Bukti tidak jelas, silakan ajukan ulang.',
        ])
        ->assertRedirect();

    $fresh = $izin->fresh();
    expect($fresh->status_approval)->toBe('rejected');
    expect($fresh->catatan_admin)->toBe('Bukti tidak jelas, silakan ajukan ulang.');
});

test('guru tidak bisa mengakses validasi admin', function () {
    $guru = guruUji();

    $this->actingAs($guru, 'pegawai')
        ->get('/admin/izin')
        ->assertRedirect();
});

test('admin bisa membuka halaman validasi izin', function () {
    izinUji(guruUji());

    $this->actingAs(adminUji(), 'admin')
        ->get('/admin/izin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Izin')
            ->has('daftarIzin.data', 1)
            ->where('statistik.pending', 1)
        );
});

test('guru hanya bisa membatalkan pengajuan pending miliknya', function () {
    $guru = guruUji();
    $pending = izinUji($guru);
    $approved = izinUji($guru, 'approved');

    $this->actingAs($guru, 'pegawai')
        ->delete("/izin/{$pending->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('izin', ['id' => $pending->id]);

    $this->actingAs($guru, 'pegawai')
        ->delete("/izin/{$approved->id}")
        ->assertRedirect();

    $this->assertDatabaseHas('izin', ['id' => $approved->id]);
});

test('guru tidak bisa membatalkan pengajuan milik guru lain', function () {
    $guru = guruUji();
    $lain = Pegawai::create([
        'nip' => '198801012019011003',
        'nama_lengkap' => 'Budi Santoso',
        'jabatan' => 'Guru Mapel',
        'no_hp' => '081200000001',
        'email' => 'budi@example.test',
        'jenis_kelamin' => 'L',
        'password' => bcrypt('password'),
    ]);

    $izinLain = izinUji($lain);

    $this->actingAs($guru, 'pegawai')
        ->delete("/izin/{$izinLain->id}")
        ->assertForbidden();

    $this->assertDatabaseHas('izin', ['id' => $izinLain->id]);
});

test('izin pending tidak dihitung di riwayat presensi, approved dihitung', function () {
    $guru = guruUji();
    izinUji($guru, 'pending');

    $this->actingAs($guru, 'pegawai')
        ->get('/kalender')
        ->assertInertia(fn ($page) => $page->where('statistik.izin', 0));

    izinUji($guru, 'approved');

    $this->actingAs($guru, 'pegawai')
        ->get('/kalender')
        ->assertInertia(fn ($page) => $page->where('statistik.izin', 1));
});

test('notifikasi izin muncul sampai ditandai dibaca', function () {
    $guru = guruUji();
    izinUji($guru, 'approved');

    $this->actingAs($guru, 'pegawai')
        ->get('/izin')
        ->assertInertia(fn ($page) => $page->has('notifikasiIzin', 1));

    $this->actingAs($guru, 'pegawai')
        ->post('/izin/notifikasi-dibaca')
        ->assertRedirect();

    $this->actingAs($guru, 'pegawai')
        ->get('/izin')
        ->assertInertia(fn ($page) => $page->has('notifikasiIzin', 0));
});

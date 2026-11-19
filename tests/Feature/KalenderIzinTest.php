<?php

use App\Models\Absensi;
use App\Models\Izin;
use App\Models\Pegawai;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

function pegawaiUji(): Pegawai
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

// Tanggal tetap di tengah bulan berjalan agar test tidak jatuh ke bulan lain
function tanggalUji(int $offsetHari = 0): string
{
    return now('Asia/Jakarta')->startOfMonth()->addDays(9 + $offsetHari)->toDateString();
}

test('izin dan sakit muncul sebagai baris riwayat terpisah', function () {
    $pegawai = pegawaiUji();

    Izin::create([
        'nip' => $pegawai->nip,
        'tgl_mulai' => tanggalUji(0),
        'tgl_selesai' => tanggalUji(0),
        'status' => 'izin',
        'keterangan' => 'Urusan keluarga',
        'status_approval' => 'approved',
    ]);

    Izin::create([
        'nip' => $pegawai->nip,
        'tgl_mulai' => tanggalUji(1),
        'tgl_selesai' => tanggalUji(1),
        'status' => 'sakit',
        'keterangan' => 'Demam',
        'status_approval' => 'approved',
    ]);

    $this->actingAs($pegawai, 'pegawai')
        ->get('/kalender')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('statistik.izin', 1)
            ->where('statistik.sakit', 1)
            ->where('statistik.hadir', 0)
        );
});

test('absensi menang atas izin pada tanggal yang sama', function () {
    $pegawai = pegawaiUji();
    $tanggal = tanggalUji(0);

    Absensi::create([
        'nip' => $pegawai->nip,
        'tgl_absen' => $tanggal,
        'jam_masuk' => '07:00:00',
        'status' => 'Hadir',
    ]);

    Izin::create([
        'nip' => $pegawai->nip,
        'tgl_mulai' => $tanggal,
        'tgl_selesai' => $tanggal,
        'status' => 'izin',
        'keterangan' => 'Tes dobel',
        'status_approval' => 'approved',
    ]);

    $this->actingAs($pegawai, 'pegawai')
        ->get('/kalender')
        ->assertInertia(fn ($page) => $page
            ->where('statistik.hadir', 1)
            ->where('statistik.izin', 0)
            ->has('riwayat', 1)
        );
});

test('pengajuan izin tersimpan dan masuk riwayat pengajuan', function () {
    Storage::fake('public');
    $pegawai = pegawaiUji();
    $hari = now('Asia/Jakarta')->toDateString();

    $this->actingAs($pegawai, 'pegawai')->post('/izin', [
        'jenis_izin' => 'Sakit',
        'tgl_mulai' => $hari,
        'tgl_selesai' => $hari,
        'alasan' => 'Demam tinggi sejak pagi',
        'dokumen' => UploadedFile::fake()->create('surat-dokter.jpg', 100, 'image/jpeg'),
    ])->assertRedirect(route('izin.create'));

    $this->assertDatabaseHas('izin', [
        'nip' => $pegawai->nip,
        'status' => 'sakit',
        'status_approval' => 'pending',
    ]);

    $this->actingAs($pegawai, 'pegawai')
        ->get('/izin')
        ->assertInertia(fn ($page) => $page
            ->has('riwayatIzin', 1)
            ->where('riwayatIzin.0.jenis_izin', 'Sakit')
            ->where('riwayatIzin.0.status', 'Menunggu')
        );
});

test('izin yang ditolak tidak masuk riwayat', function () {
    $pegawai = pegawaiUji();

    Izin::create([
        'nip' => $pegawai->nip,
        'tgl_mulai' => tanggalUji(0),
        'tgl_selesai' => tanggalUji(0),
        'status' => 'izin',
        'keterangan' => 'Ditolak admin',
        'status_approval' => 'rejected',
    ]);

    $this->actingAs($pegawai, 'pegawai')
        ->get('/kalender')
        ->assertInertia(fn ($page) => $page->has('riwayat', 0));
});

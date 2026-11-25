<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\IzinController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\ProfilController;

// 1. Halaman Utama (Bisa diakses siapa saja)
Route::get('/', function () {
    return Inertia::render('Auth/Login');
})->name('Auth/Login');

// =============================================================
// 2. AREA TAMU (GUEST) - Hanya untuk yang BELUM LOGIN
// =============================================================

// Rute Login Pegawai / Guru
Route::middleware(['guest:pegawai'])->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/lupa-password', [AuthController::class, 'showLupaPassword'])->name('password.request');
    Route::post('/lupa-password', [AuthController::class, 'kirimLinkReset'])->name('password.email');
    Route::get('/reset-password/{token}', [ResetPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [ResetPasswordController::class, 'store'])->name('password.update');
});

// Rute Login Admin
Route::middleware(['guest:admin'])->prefix('admin')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('admin.login');
    Route::post('/login', [AuthController::class, 'login']);
});

// =============================================================
// 3. AREA TERAUTENTIKASI (AUTH) - Hanya untuk yang SUDAH LOGIN
// =============================================================

// Route Logout
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Rute Khusus Pegawai / Guru
Route::middleware(['auth:pegawai'])->group(function () {
    // 1. Dashboard Pegawai (Menggunakan AbsensiController@dashboard)
    Route::get('/dashboard', [AbsensiController::class, 'dashboard'])->name('pegawai.dashboard');

    // 2. Rute Absensi (Halaman Kamera & Maps)
    Route::get('/absensi', [AbsensiController::class, 'create'])->name('pegawai.absensi');
    Route::post('/absensi', [AbsensiController::class, 'store'])->name('pegawai.absensi.store');

    // 3. Rute Kalender Riwayat
    Route::get('/kalender', [AbsensiController::class, 'index'])->name('pegawai.kalender');

    // 4. Izin
    Route::get('/izin', [IzinController::class, 'create'])->name('izin.create');
    Route::post('/izin', [IzinController::class, 'store'])->name('izin.store');
    Route::post('/izin/notifikasi-dibaca', [IzinController::class, 'tandaiDibaca'])->name('izin.notifikasi.dibaca');
    Route::delete('/izin/{izin}', [IzinController::class, 'destroy'])->name('izin.destroy');

    // 5. Profil
    Route::get('/profil', [ProfilController::class, 'edit'])->name('profil.edit');
    Route::put('/profil', [ProfilController::class, 'update'])->name('profil.update');
});

// Rute Khusus Admin
Route::middleware(['auth:admin'])->prefix('admin')->group(function () { 
    Route::get('/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');

    // 1. Kelola Guru
    Route::get('/pegawai', [AdminController::class, 'pegawaiIndex'])->name('admin.pegawai.index');
    Route::post('/pegawai', [AdminController::class, 'pegawaiStore'])->name('admin.pegawai.store');
    Route::put('/pegawai/{pegawai}', [AdminController::class, 'pegawaiUpdate'])->name('admin.pegawai.update');
    Route::delete('/pegawai/{pegawai}', [AdminController::class, 'pegawaiDestroy'])->name('admin.pegawai.destroy');

    // 2. Kelola Izin
    Route::get('/izin', [AdminController::class, 'izinIndex'])->name('admin.izin.index');
    Route::patch('/izin/{izin}', [AdminController::class, 'izinUpdate'])->name('admin.izin.update');

    // 3. Kelola Laporan Absen
    Route::get('/laporan', [AdminController::class, 'laporanIndex'])->name('admin.laporan.index');

    // 4. Kelola Jadwal Pelajaran
    Route::get('/jadwal', [AdminController::class, 'jadwalIndex'])->name('admin.jadwal.index');
    Route::post('/jadwal', [AdminController::class, 'jadwalStore'])->name('admin.jadwal.store');
    Route::delete('/jadwal/{jadwal}', [AdminController::class, 'jadwalDestroy'])->name('admin.jadwal.destroy');

    // 5. Profil Admin
    Route::get('/profil', [AdminController::class, 'profilEdit'])->name('admin.profil.edit');
    Route::put('/profil', [AdminController::class, 'profilUpdate'])->name('admin.profil.update');
});
<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\IzinController;
use App\Http\Controllers\ProfilController;

// 1. Halaman Utama (Bisa diakses siapa saja)
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

// =============================================================
// 2. AREA TAMU (GUEST) - Hanya untuk yang BELUM LOGIN
// =============================================================

// Rute Login Pegawai / Guru
Route::middleware(['guest:pegawai'])->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginPegawai'])->name('login');
    Route::post('/login', [AuthController::class, 'loginPegawai']);
    Route::get('/lupa-password', [AuthController::class, 'showLupaPassword'])->name('password.request');
    Route::post('/lupa-password', [AuthController::class, 'kirimLinkReset'])->name('password.email');
});

// Rute Login Admin
Route::middleware(['guest:admin'])->prefix('admin')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginAdmin'])->name('admin.login');
    Route::post('/login', [AuthController::class, 'loginAdmin']);
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

    // 5. Profil
    Route::get('/profil', [ProfilController::class, 'edit'])->name('profil.edit');
    Route::put('/profil', [ProfilController::class, 'update'])->name('profil.update');
});

// Rute Khusus Admin
Route::middleware(['auth:admin'])->prefix('admin')->group(function () { 
    Route::get('/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
});
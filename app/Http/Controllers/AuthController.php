<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthController extends Controller
{
    // Login terpadu: NIP (pegawai) atau email (admin)
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'identity' => ['required'],
            'password' => ['required'],
        ], [
            'identity.required' => 'NIP atau email wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $throttleKey = Str::transliterate(Str::lower($request->input('identity')).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return back()->withErrors([
                'identity' => "Terlalu banyak percobaan login. Silakan coba lagi dalam {$seconds} detik.",
            ])->onlyInput('identity');
        }

        $isAdmin = str_contains($credentials['identity'], '@');
        $field = $isAdmin ? 'email' : 'nip';

        if (Auth::guard($isAdmin ? 'admin' : 'pegawai')->attempt([
            $field => $credentials['identity'],
            'password' => $credentials['password'],
        ], $request->boolean('remember'))) {
            RateLimiter::clear($throttleKey);
            $request->session()->regenerate();

            return redirect($isAdmin ? '/admin/dashboard' : '/dashboard');
        }

        RateLimiter::hit($throttleKey, 300); // lockout 5 menit (300 detik) setelah 5 kali gagal

        return back()->withErrors([
            'identity' => 'NIP/email atau password yang Anda masukkan salah.',
            'password' => 'NIP/email atau password yang Anda masukkan salah.',
        ])->onlyInput('identity');
    }
    // Skenario 3: Menampilkan halaman lupa password
    public function showLupaPassword()
    {
        return Inertia::render('Auth/LupaPassword');
    }
    // Skenario 4 & 5: Mengirim link reset password ke email
    public function kirimLinkReset(Request $request)
    {
        // Rate limiting: maksimal 3 percobaan per jam (3600 detik) berdasarkan IP dan email
        $throttleKey = 'forgot-password|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            $minutes = ceil($seconds / 60);

            return back()->withErrors([
                'email' => "Terlalu banyak permintaan reset password. Silakan coba lagi dalam {$minutes} menit.",
            ])->onlyInput('email');
        }

        RateLimiter::hit($throttleKey, 3600);

        // Validasi input email
        $request->validate([
            'email' => 'required|email|exists:pegawai,email', // Pastikan email ada di tabel pegawai
        ], [
            'email.exists' => 'Email tidak ditemukan di sistem kami.', // Pesan error Skenario 5
        ]);

        try {
            // Gunakan Password Broker Laravel untuk membuat token dan mengirim notifikasi email
            Password::broker('pegawai')->sendResetLink($request->only('email'));
        } catch (\Throwable $e) {
            // Jika SMTP / Mailer belum disetting di lingkungan lokal, tangkap agar tidak 500 error
        }

        // Berikan respon sukses yang ramah ke pengguna
        return back()->with('status', 'Kami telah mengirimkan tautan reset password ke email Anda!');
    }
    public function logout(Request $request)
    {
        // 1. Keluarkan pengguna dari sistem (baik dia Guru maupun Admin)
        Auth::guard('pegawai')->logout();
        Auth::guard('admin')->logout();

        // 2. Hapus seluruh riwayat sesi untuk keamanan (mencegah pencurian sesi)
        $request->session()->invalidate();

        // 3. Buat token keamanan baru
        $request->session()->regenerateToken();

        // 4. Arahkan kembali ke halaman awal dengan membawa "pesan sukses"
        return redirect('/')->with('success', 'Anda berhasil logout dari sistem.');
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;

class AuthController extends Controller
{
    //ADMIN AUTH
    public function showLoginAdmin()
    {
        return Inertia::render('Auth\LoginAdmin');
    }
    public function LoginAdmin(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['requied'],
        ]);

        if (Auth::guard('admin')->attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->intended('/admin/dashboard');
        }
        return back()-> withErrors([
            'email' => 'Email atau password admin salah.',
        ])->onlyInput('email');
    }

    //auth pegawai/guru
    public function showLoginPegawai()
    {
        return Inertia::render('Auth/LoginPegawai');
    }
    public function loginPegawai(Request $request)
{
    // 1. Tangani Skenario "Kosong" dengan Pesan Bahasa Indonesia
    $credentials = $request->validate([
        'nip' => ['required'],
        'password' => ['required'],
    ], [
        'nip.required' => 'NIP wajib diisi.',
        'password.required' => 'Password wajib diisi.',
    ]);

    // 2. Proses Percobaan Login
    if (Auth::guard('pegawai')->attempt($credentials)) {
        $request->session()->regenerate();
        return redirect('/dashboard');
    }

    // 3. Tangani Skenario "Salah" (Kirim pesan error ke KEDUA kotak input)
    return back()->withErrors([
        'nip' => 'NIP atau password yang Anda masukkan salah.',
        'password' => 'NIP atau password yang Anda masukkan salah.', // Tambahkan ini agar kotak password juga merah
    ])->onlyInput('nip'); // Mengembalikan ketikan NIP sebelumnya agar user tidak perlu mengetik ulang
}
    // Skenario 3: Menampilkan halaman lupa password
    public function showLupaPassword()
    {
        return Inertia::render('Auth/LupaPassword');
    }
    // Skenario 4 & 5: Mengirim link reset password ke email
    public function kirimLinkReset(Request $request)
    {
        // Validasi input email
        $request->validate([
            'email' => 'required|email|exists:pegawai,email', // Pastikan email ada di tabel pegawai
        ], [
            'email.exists' => 'Email tidak ditemukan di sistem kami.', // Pesan error Skenario 5
        ]);
        // Catatan: Logika asli pengiriman email biasanya menggunakan Password Broker Laravel.
        // Untuk saat ini, kita simulasikan respons sukses agar Frontend bisa menangkapnya.
        // Anda bisa menyambungkan Mail/SMTP Laravel nanti.

        // Skenario 4: Berhasil
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

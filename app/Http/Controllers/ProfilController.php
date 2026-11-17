<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfilController extends Controller
{
    public function edit()
    {
        $pegawai = Auth::guard('pegawai')->user();

        return Inertia::render('Pegawai/Profil', [
            'pegawai' => [
                'nama'  => $pegawai->nama,
                'nip'   => $pegawai->nip,
                'email' => $pegawai->email ?? '',
            ]
        ]);
    }

    public function update(Request $request)
    {
        $pegawai = Auth::guard('pegawai')->user();

        $validated = $request->validate([
            'nama'              => ['required', 'string', 'max:100'],
            'email'             => ['required', 'email', 'max:100', Rule::unique('pegawai', 'email')->ignore($pegawai->nip, 'nip')],
            'password_lama'     => ['nullable', 'string'],
            'password_baru'     => ['nullable', 'string', 'min:6', 'confirmed'],
        ], [
            'nama.required'          => 'Nama lengkap wajib diisi.',
            'email.required'         => 'Alamat email wajib diisi.',
            'email.email'            => 'Format email tidak valid.',
            'email.unique'           => 'Alamat email sudah digunakan oleh pegawai lain.',
            'password_baru.min'       => 'Password baru minimal 6 karakter.',
            'password_baru.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        // Validasi password lama jika pengguna hendak mengubah password
        if ($request->filled('password_baru')) {
            if (!$request->filled('password_lama') || !Hash::check($request->password_lama, $pegawai->password)) {
                return back()->withErrors(['password_lama' => 'Password saat ini yang Anda masukkan salah.']);
            }
            $pegawai->password = Hash::make($request->password_baru);
        }

        $pegawai->nama  = $validated['nama'];
        $pegawai->email = $validated['email'];
        $pegawai->save();

        return redirect()->route('pegawai.dashboard')->with('success', 'Profil dan informasi akun Anda berhasil diperbarui.');
    }
}
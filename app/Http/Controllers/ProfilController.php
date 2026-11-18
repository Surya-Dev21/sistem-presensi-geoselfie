<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
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
                'foto'  => $pegawai->foto ? Storage::disk('public')->url($pegawai->foto) : null,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $pegawai = Auth::guard('pegawai')->user();

        $validated = $request->validate([
            'nama'              => ['required', 'string', 'max:100'],
            'email'             => ['required', 'email', 'max:100', Rule::unique('pegawai', 'email')->ignore($pegawai->nip, 'nip')],
            'password_lama'     => ['nullable', 'required_with:password_baru', 'string'],
            'password_baru'     => ['nullable', 'string', Password::min(6), 'confirmed'],
            'foto'              => ['nullable', 'image', 'max:2048'],
        ], [
            'nama.required'          => 'Nama lengkap wajib diisi.',
            'email.required'         => 'Alamat email wajib diisi.',
            'email.email'            => 'Format email tidak valid.',
            'email.unique'           => 'Alamat email sudah digunakan oleh pegawai lain.',
            'password_lama.required_with' => 'Password saat ini wajib diisi sebelum mengganti password.',
            'password_baru.min'       => 'Password baru minimal 6 karakter.',
            'password_baru.confirmed' => 'Konfirmasi password baru tidak cocok.',
            'foto.image'             => 'Berkas foto harus berupa gambar (JPG, PNG, atau WEBP).',
            'foto.max'               => 'Ukuran foto maksimal 2 MB.',
        ]);

        // Ganti foto profil bila ada unggahan baru
        if ($request->hasFile('foto')) {
            if ($pegawai->foto) {
                Storage::disk('public')->delete($pegawai->foto);
            }
            $pegawai->foto = $request->file('foto')->store('foto-guru', 'public');
        }

        // Validasi password lama jika pengguna hendak mengubah password
        if ($request->filled('password_baru')) {
            if (!Hash::check($request->password_lama, $pegawai->password)) {
                return back()->withErrors(['password_lama' => 'Password saat ini yang Anda masukkan salah.']);
            }
            $pegawai->password = Hash::make($request->password_baru);
        }

        // Sanitasi input nama: buang tag HTML & spasi ganda sebelum disimpan
        $pegawai->nama  = trim(strip_tags($validated['nama']));
        $pegawai->email = $validated['email'];
        $pegawai->save();

        return redirect()->route('pegawai.dashboard')->with('success', 'Profil dan informasi akun Anda berhasil diperbarui.');
    }
}
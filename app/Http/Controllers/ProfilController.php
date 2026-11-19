<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Izin;
use App\Models\JadwalMengajar;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
                'nama'          => $pegawai->nama,
                'nip'           => $pegawai->nip,
                'email'         => $pegawai->email ?? '',
                'no_hp'         => $pegawai->no_hp ?? '',
                'jabatan'       => $pegawai->jabatan,
                'jenis_kelamin' => $pegawai->jenis_kelamin,
                'foto'          => $pegawai->foto ? Storage::disk('public')->url($pegawai->foto) : null,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $pegawai = Auth::guard('pegawai')->user();

        // Validasi PARSIAL: field yang tidak dikirim tidak divalidasi sama sekali.
        $validated = $request->validate([
            'nama'  => ['sometimes', 'required', 'string', 'max:100'],
            'nip'   => [
                'sometimes', 'required', 'string', 'max:30', 'regex:/^[0-9]{8,30}$/',
                Rule::unique('pegawai', 'nip')->ignore($pegawai->nip, 'nip'),
            ],
            'email' => [
                'sometimes', 'required', 'email', 'max:100',
                Rule::unique('pegawai', 'email')->ignore($pegawai->nip, 'nip'),
            ],
            'no_hp' => ['sometimes', 'nullable', 'string', 'max:20', 'regex:/^(\+62|62|0)8[1-9][0-9]{6,11}$/'],
            'foto'  => ['sometimes', 'nullable', 'image', 'max:2048'],
            'password_lama' => ['nullable', 'required_with:password_baru', 'string'],
            'password_baru' => ['nullable', 'string', Password::min(6), 'confirmed'],
        ], [
            'nama.required'          => 'Nama lengkap tidak boleh kosong.',
            'nip.required'           => 'NIP tidak boleh kosong.',
            'nip.regex'              => 'NIP hanya boleh angka (8–30 digit).',
            'nip.unique'             => 'NIP tersebut sudah dipakai pegawai lain.',
            'email.email'            => 'Format email tidak valid.',
            'email.unique'           => 'Alamat email sudah digunakan oleh pegawai lain.',
            'no_hp.regex'            => 'Nomor HP tidak valid. Contoh: 081234567890 atau +6281234567890.',
            'foto.image'             => 'Berkas foto harus berupa gambar (JPG, PNG, atau WEBP).',
            'foto.max'               => 'Ukuran foto maksimal 2 MB.',
            'password_lama.required_with' => 'Password saat ini wajib diisi sebelum mengganti password.',
            'password_baru.min'      => 'Password baru minimal 6 karakter.',
            'password_baru.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        // 1) Foto (opsional)
        if ($request->hasFile('foto')) {
            if ($pegawai->foto) {
                Storage::disk('public')->delete($pegawai->foto);
            }
            $pegawai->foto = $request->file('foto')->store('foto-guru', 'public');
        }

        // 2) Ganti NIP (primary key) — lihat "Fakta teknis penting" di atas
        if (isset($validated['nip']) && $validated['nip'] !== $pegawai->nip) {
            $nipLama = $pegawai->nip;
            $nipBaru = $validated['nip'];

            // Simpan dulu atribut lain yang ikut berubah agar tersalin ke baris baru
            if (isset($validated['nama'])) {
                $pegawai->nama = trim(strip_tags($validated['nama']));
            }
            if (array_key_exists('email', $validated)) {
                $pegawai->email = $validated['email'];
            }
            if (array_key_exists('no_hp', $validated)) {
                $pegawai->no_hp = $validated['no_hp']
                    ? preg_replace('/^(\+62|62)/', '0', $validated['no_hp'])
                    : null;
            }

            DB::transaction(function () use ($pegawai, $nipLama, $nipBaru) {
                // Buat salinan pegawai baru dengan NIP baru
                $emailAsli = $pegawai->email;

                // Lepas unique email sementara pada pegawai lama
                Pegawai::where('nip', $nipLama)->update([
                    'email' => null,
                ]);

                // Buat pegawai baru dengan data terupdate
                $baru = $pegawai->replicate(['nip']);
                $baru->nip = $nipBaru;
                $baru->email = $emailAsli;
                $baru->save();

                // Pindahkan anak (FK) ke NIP baru yang sudah ada
                Absensi::where('nip', $nipLama)->update(['nip' => $nipBaru]);
                Izin::where('nip', $nipLama)->update(['nip' => $nipBaru]);
                JadwalMengajar::where('nip', $nipLama)->update(['nip' => $nipBaru]);

                // Hapus pegawai lama
                Pegawai::where('nip', $nipLama)->delete();
            });

            $pegawai = Pegawai::where('nip', $nipBaru)->firstOrFail();
            Auth::guard('pegawai')->login($pegawai); // refresh session: id user ikut berubah
        } else {
            // 3) Field biasa
            if (isset($validated['nama'])) {
                $pegawai->nama = trim(strip_tags($validated['nama']));
            }
            if (array_key_exists('email', $validated)) {
                $pegawai->email = $validated['email'];
            }
            if (array_key_exists('no_hp', $validated)) {
                $pegawai->no_hp = $validated['no_hp']
                    ? preg_replace('/^(\+62|62)/', '0', $validated['no_hp'])
                    : null;
            }
        }

        // 4) Password (opsional)
        if ($request->filled('password_baru')) {
            if (!Hash::check($request->password_lama, $pegawai->password)) {
                return back()->withErrors(['password_lama' => 'Password saat ini yang Anda masukkan salah.']);
            }
            $pegawai->password = Hash::make($request->password_baru);
        }

        $pegawai->save();

        return back()->with('success', 'Profil berhasil diperbarui.');
    }
}

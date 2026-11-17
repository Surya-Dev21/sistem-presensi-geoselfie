<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = Auth::guard('pegawai')->user() 
            ?? Auth::guard('admin')->user() 
            ?? $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'nip'            => $user->nip ?? null,
                    'name'           => $user->nama ?? $user->name ?? $user->email ?? 'Pengguna',
                    'nama'           => $user->nama ?? $user->name ?? $user->email ?? 'Pengguna',
                    'email'          => $user->email ?? null,
                    'jabatan'        => $user->jabatan ?? ($user->role ?? null),
                    'jenis_kelamin'  => $user->jenis_kelamin ?? 'L',
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
            ],
            // Status presensi hari ini, dipakai GuruLayout untuk state tombol "Presensi Harian"
            'statusAbsen' => fn () => Auth::guard('pegawai')->check() ? (function () use ($request) {
                $pegawai = Auth::guard('pegawai')->user();
                $absen = \App\Models\Absensi::where('nip', $pegawai->nip)
                    ->where('tgl_absen', now('Asia/Jakarta')->format('Y-m-d'))
                    ->first();
                return [
                    'sudah_masuk'  => $absen && $absen->jam_masuk ? true : false,
                    'sudah_pulang' => $absen && $absen->jam_keluar ? true : false,
                ];
            })() : null,
        ];
    }
}

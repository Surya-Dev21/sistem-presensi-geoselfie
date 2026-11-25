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
                    'foto'           => !empty($user->foto) ? \Illuminate\Support\Facades\Storage::disk('public')->url($user->foto) : null,
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
            // Notifikasi keputusan izin yang belum dibaca guru
            'notifikasiIzin' => fn () => Auth::guard('pegawai')->check() ? (function () {
                $pegawai = Auth::guard('pegawai')->user();

                return \App\Models\Izin::where('nip', $pegawai->nip)
                    ->whereIn('status_approval', ['approved', 'rejected'])
                    ->whereNull('dibaca_at')
                    ->latest('updated_at')
                    ->limit(5)
                    ->get()
                    ->map(fn ($i) => [
                        'id'          => $i->id,
                        'status'      => $i->status_approval === 'approved' ? 'Disetujui' : 'Ditolak',
                        'jenis'       => $i->status === 'sakit' ? 'Sakit' : 'Izin',
                        'tgl_mulai'   => $i->tgl_mulai?->format('Y-m-d'),
                        'tgl_selesai' => $i->tgl_selesai?->format('Y-m-d'),
                        'catatan'     => $i->catatan_admin,
                        'waktu'       => $i->updated_at?->diffForHumans(),
                    ])
                    ->values();
            })() : [],

            // Notifikasi admin: pengajuan izin yang masih menunggu validasi
            'notifikasiAdmin' => fn () => Auth::guard('admin')->check()
                ? \App\Models\Izin::with('pegawai:nip,nama_lengkap')
                    ->where('status_approval', 'pending')
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(fn ($i) => [
                        'id'          => $i->id,
                        'nama'        => $i->pegawai?->nama_lengkap ?? $i->nip,
                        'jenis'       => $i->status === 'sakit' ? 'Sakit' : 'Izin',
                        'tgl_mulai'   => $i->tgl_mulai?->format('Y-m-d'),
                        'tgl_selesai' => $i->tgl_selesai?->format('Y-m-d'),
                        'waktu'       => $i->created_at?->diffForHumans(),
                    ])
                    ->values()
                : [],

            // Jumlah total (bukan hanya 5 teratas) untuk badge lonceng
            'jumlahIzinPending' => fn () => Auth::guard('admin')->check()
                ? \App\Models\Izin::where('status_approval', 'pending')->count()
                : 0,
        ];
    }
}

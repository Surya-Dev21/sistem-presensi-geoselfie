<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Izin;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $totalPegawai = Pegawai::count();
        $today = date('Y-m-d');

        $hadirHariIni = Absensi::where('tgl_absen', $today)->where('status', 'Hadir')->count();
        $izinHariIni = Absensi::where('tgl_absen', $today)->where('status', 'Izin')->count();

        return Inertia::render('Admin/Dashboard', [
            'totalPegawai' => $totalPegawai,
            'hadirHariIni' => $hadirHariIni,
            'izinHariIni' => $izinHariIni,
            'pendingIzin' => Izin::where('status_approval', 'pending')->count(),
        ]);
    }

    // Daftar pengajuan izin/sakit yang masuk dari guru
    public function izinIndex(Request $request)
    {
        $filter = [
            'status' => $request->input('status', 'pending'),
            'cari'   => $request->input('cari'),
        ];

        $daftarIzin = Izin::query()
            ->with('pegawai:nip,nama_lengkap,jabatan')
            ->when(
                in_array($filter['status'], ['pending', 'approved', 'rejected'], true),
                fn ($q) => $q->where('status_approval', $filter['status'])
            )
            ->when($filter['cari'], fn ($q) => $q->whereHas(
                'pegawai',
                fn ($p) => $p->where('nama_lengkap', 'like', '%' . $filter['cari'] . '%')
            ))
            ->latest('created_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Izin $i) => [
                'id'          => $i->id,
                'nip'         => $i->nip,
                'nama'        => $i->pegawai?->nama_lengkap ?? $i->nip,
                'jabatan'     => $i->pegawai?->jabatan,
                'jenis'       => $i->status === 'sakit' ? 'Sakit' : 'Izin',
                'tgl_mulai'   => $i->tgl_mulai?->format('Y-m-d'),
                'tgl_selesai' => $i->tgl_selesai?->format('Y-m-d'),
                'keterangan'  => $i->keterangan,
                'bukti_url'   => $i->bukti_file ? Storage::disk('public')->url($i->bukti_file) : null,
                'status'      => match ($i->status_approval) {
                    'approved' => 'Disetujui',
                    'rejected' => 'Ditolak',
                    default    => 'Menunggu',
                },
                'status_approval' => $i->status_approval,
                'catatan_admin'   => $i->catatan_admin,
                'diajukan'        => $i->created_at?->diffForHumans(),
            ]);

        $statistik = Izin::selectRaw('status_approval, count(*) as total')
            ->groupBy('status_approval')
            ->pluck('total', 'status_approval');

        return Inertia::render('Admin/Izin', [
            'daftarIzin' => $daftarIzin,
            'filter'     => $filter,
            'statistik'  => [
                'pending'  => (int) ($statistik['pending'] ?? 0),
                'approved' => (int) ($statistik['approved'] ?? 0),
                'rejected' => (int) ($statistik['rejected'] ?? 0),
            ],
        ]);
    }

    // Setujui / tolak pengajuan izin
    public function izinUpdate(Request $request, Izin $izin)
    {
        if ($izin->status_approval !== 'pending') {
            return back()->with('error', 'Pengajuan ini sudah diproses sebelumnya.');
        }

        $data = $request->validate([
            'status_approval' => ['required', Rule::in(['approved', 'rejected'])],
            'catatan_admin'   => ['nullable', 'string', 'max:500'],
        ], [
            'status_approval.required' => 'Status keputusan wajib dipilih.',
            'status_approval.in'       => 'Status keputusan tidak valid.',
            'catatan_admin.max'        => 'Catatan maksimal 500 karakter.',
        ]);

        if ($data['status_approval'] === 'rejected' && blank($data['catatan_admin'] ?? null)) {
            return back()->withErrors([
                'catatan_admin' => 'Alasan penolakan wajib diisi.',
            ])->withInput();
        }

        $izin->update([
            'status_approval' => $data['status_approval'],
            'catatan_admin'   => $data['catatan_admin'] ?? null,
            'dibaca_at'       => null,
        ]);

        return back()->with(
            'success',
            $data['status_approval'] === 'approved'
                ? 'Pengajuan izin disetujui.'
                : 'Pengajuan izin ditolak.'
        );
    }
}

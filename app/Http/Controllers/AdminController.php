<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Izin;
use App\Models\JadwalMengajar;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $totalPegawai = Pegawai::count();
        $today = date('Y-m-d');

        $hadirHariIni = Absensi::where('tgl_absen', $today)->where('status', 'Hadir')->count();
        $izinHariIni = Absensi::where('tgl_absen', $today)->where('status', 'Izin')->count();
        $pendingIzin = Izin::where('status_approval', 'pending')->count();

        $persentaseHadir = $totalPegawai > 0 ? round(($hadirHariIni / $totalPegawai) * 100, 1) : 0;

        $presensiHariIni = Absensi::with('pegawai:nip,nama_lengkap,jabatan')
            ->where('tgl_absen', $today)
            ->latest('jam_masuk')
            ->take(5)
            ->get()
            ->map(fn ($a) => [
                'id'         => $a->id,
                'nip'        => $a->nip,
                'nama'       => $a->pegawai?->nama_lengkap ?? $a->nip,
                'jabatan'    => $a->pegawai?->jabatan ?? 'Guru',
                'jam_masuk'  => $a->jam_masuk ? substr($a->jam_masuk, 0, 5) : null,
                'jam_keluar' => $a->jam_keluar ? substr($a->jam_keluar, 0, 5) : null,
                'status'     => $a->status,
            ]);

        $periode = $request->input('periode', 'mingguan');
        if (!in_array($periode, ['mingguan', 'bulanan', 'tahunan'], true)) {
            $periode = 'mingguan';
        }

        $trenPresensi = match ($periode) {
            'bulanan' => collect(range(1, now('Asia/Jakarta')->daysInMonth))->map(function (int $hari) {
                $tanggal = now('Asia/Jakarta')->startOfMonth()->addDays($hari - 1);
                $perStatus = Absensi::where('tgl_absen', $tanggal->toDateString())
                    ->selectRaw('status, count(*) as jumlah')
                    ->groupBy('status')
                    ->pluck('jumlah', 'status');

                return [
                    'tanggal' => $tanggal->toDateString(),
                    'label'   => (string) $hari,
                    'hadir'   => (int) ($perStatus['Hadir'] ?? 0),
                    'izin'    => (int) ($perStatus['Izin'] ?? 0),
                    'sakit'   => (int) ($perStatus['Sakit'] ?? 0),
                    'alpa'    => (int) ($perStatus['Alpa'] ?? 0),
                ];
            })->values(),

            'tahunan' => collect(range(1, 12))->map(function (int $bulan) {
                $tahun = now('Asia/Jakarta')->year;
                $perStatus = Absensi::whereYear('tgl_absen', $tahun)
                    ->whereMonth('tgl_absen', $bulan)
                    ->selectRaw('status, count(*) as jumlah')
                    ->groupBy('status')
                    ->pluck('jumlah', 'status');

                return [
                    'label' => ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][$bulan - 1],
                    'hadir' => (int) ($perStatus['Hadir'] ?? 0),
                    'izin'  => (int) ($perStatus['Izin'] ?? 0),
                    'sakit' => (int) ($perStatus['Sakit'] ?? 0),
                    'alpa'  => (int) ($perStatus['Alpa'] ?? 0),
                ];
            })->values(),

            default => collect(range(6, 0))->map(function (int $mundur) {
                $tanggal = now('Asia/Jakarta')->subDays($mundur);
                $perStatus = Absensi::where('tgl_absen', $tanggal->toDateString())
                    ->selectRaw('status, count(*) as jumlah')
                    ->groupBy('status')
                    ->pluck('jumlah', 'status');

                return [
                    'tanggal' => $tanggal->toDateString(),
                    'label'   => ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][$tanggal->dayOfWeek],
                    'hadir'   => (int) ($perStatus['Hadir'] ?? 0),
                    'izin'    => (int) ($perStatus['Izin'] ?? 0),
                    'sakit'   => (int) ($perStatus['Sakit'] ?? 0),
                    'alpa'    => (int) ($perStatus['Alpa'] ?? 0),
                ];
            })->values(),
        };

        return Inertia::render('Admin/Dashboard', [
            'totalPegawai'    => $totalPegawai,
            'hadirHariIni'    => $hadirHariIni,
            'izinHariIni'     => $izinHariIni,
            'pendingIzin'     => $pendingIzin,
            'persentaseHadir' => $persentaseHadir,
            'presensiHariIni' => $presensiHariIni,
            'trenPresensi'    => $trenPresensi,
            'periode'         => $periode,
        ]);
    }

    // ==========================================
    // KELOLA PEGAWAI / GURU
    // ==========================================
    public function pegawaiIndex(Request $request)
    {
        $cari = $request->input('cari');
        $jk   = $request->input('jk');
        $sort = $request->input('sort', 'asc');

        $daftarPegawai = Pegawai::query()
            ->when($cari, function ($q, $cari) {
                $q->where(function ($sub) use ($cari) {
                    $sub->where('nama_lengkap', 'like', "%{$cari}%")
                        ->orWhere('nip', 'like', "%{$cari}%")
                        ->orWhere('email', 'like', "%{$cari}%")
                        ->orWhere('jabatan', 'like', "%{$cari}%");
                });
            })
            ->when($jk, function ($q, $jk) {
                $q->where('jenis_kelamin', $jk);
            })
            ->orderBy('nama_lengkap', $sort === 'desc' ? 'desc' : 'asc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Pegawai', [
            'daftarPegawai' => $daftarPegawai,
            'filter'        => [
                'cari' => $cari ?? '',
                'jk'   => $jk ?? '',
                'sort' => $sort,
            ],
        ]);
    }

    public function pegawaiStore(Request $request)
    {
        $validated = $request->validate([
            'nip'           => ['required', 'string', 'max:30', 'unique:pegawai,nip'],
            'nama_lengkap'  => ['required', 'string', 'max:100'],
            'jabatan'       => ['required', 'string', 'max:50'],
            'jenis_kelamin' => ['required', Rule::in(['L', 'P'])],
            'no_hp'         => ['required', 'string', 'max:20'],
            'email'         => ['required', 'email', 'max:100', 'unique:pegawai,email'],
            'password'      => ['required', 'string', 'min:6'],
        ], [
            'nip.required'          => 'NIP wajib diisi.',
            'nip.unique'            => 'NIP sudah terdaftar.',
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'jabatan.required'      => 'Jabatan wajib diisi.',
            'jenis_kelamin.required'=> 'Jenis kelamin wajib dipilih.',
            'no_hp.required'        => 'No. HP wajib diisi.',
            'email.required'        => 'Email wajib diisi.',
            'email.email'           => 'Format email tidak valid.',
            'email.unique'          => 'Email sudah terdaftar.',
            'password.min'          => 'Password minimal 6 karakter.',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        Pegawai::create($validated);

        return back()->with('success', 'Data guru berhasil ditambahkan.');
    }

    public function pegawaiUpdate(Request $request, Pegawai $pegawai)
    {
        $validated = $request->validate([
            'nama_lengkap'  => ['required', 'string', 'max:100'],
            'jabatan'       => ['required', 'string', 'max:50'],
            'jenis_kelamin' => ['required', Rule::in(['L', 'P'])],
            'no_hp'         => ['required', 'string', 'max:20'],
            'email'         => ['required', 'email', 'max:100', Rule::unique('pegawai', 'email')->ignore($pegawai->nip, 'nip')],
            'password'      => ['nullable', 'string', 'min:6'],
        ], [
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'jabatan.required'      => 'Jabatan wajib diisi.',
            'jenis_kelamin.required'=> 'Jenis kelamin wajib dipilih.',
            'no_hp.required'        => 'No. HP wajib diisi.',
            'email.required'        => 'Email wajib diisi.',
            'email.unique'          => 'Email sudah digunakan.',
            'password.min'          => 'Password baru minimal 6 karakter.',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $pegawai->update($validated);

        return back()->with('success', 'Data guru berhasil diperbarui.');
    }

    public function pegawaiDestroy(Pegawai $pegawai)
    {
        $pegawai->delete();
        return back()->with('success', 'Data guru berhasil dihapus.');
    }

    // ==========================================
    // KELOLA LAPORAN ABSENSI
    // ==========================================
    public function laporanIndex(Request $request)
    {
        $bulan = $request->input('bulan', date('m'));
        $tahun = $request->input('tahun', date('Y'));
        $cari = $request->input('cari');

        $laporan = Absensi::with('pegawai:nip,nama_lengkap,jabatan')
            ->whereMonth('tgl_absen', $bulan)
            ->whereYear('tgl_absen', $tahun)
            ->when($cari, function ($q, $cari) {
                $q->whereHas('pegawai', function ($p) use ($cari) {
                    $p->where('nama_lengkap', 'like', "%{$cari}%")
                      ->orWhere('nip', 'like', "%{$cari}%");
                });
            })
            ->orderBy('tgl_absen', 'desc')
            ->paginate(15)
            ->withQueryString();

        $statistik = [
            'total_hadir' => Absensi::whereMonth('tgl_absen', $bulan)->whereYear('tgl_absen', $tahun)->where('status', 'Hadir')->count(),
            'total_izin'  => Absensi::whereMonth('tgl_absen', $bulan)->whereYear('tgl_absen', $tahun)->where('status', 'Izin')->count(),
            'total_sakit' => Absensi::whereMonth('tgl_absen', $bulan)->whereYear('tgl_absen', $tahun)->where('status', 'Sakit')->count(),
            'total_alpa'  => Absensi::whereMonth('tgl_absen', $bulan)->whereYear('tgl_absen', $tahun)->where('status', 'Alpa')->count(),
        ];

        return Inertia::render('Admin/Laporan', [
            'laporan'   => $laporan,
            'statistik' => $statistik,
            'filter'    => [
                'bulan' => (string) (int) $bulan,
                'tahun' => (string) $tahun,
                'cari'  => $cari,
            ],
        ]);
    }

    // ==========================================
    // KELOLA JADWAL MENGAJAR
    // ==========================================
    public function jadwalIndex(Request $request)
    {
        $hari = $request->input('hari');
        $cari = $request->input('cari');

        $jadwal = JadwalMengajar::with('pegawai:nip,nama_lengkap')
            ->when($hari, fn ($q, $hari) => $q->where('hari', $hari))
            ->when($cari, function ($q, $cari) {
                $q->where('mata_pelajaran', 'like', "%{$cari}%")
                  ->orWhere('kelas', 'like', "%{$cari}%")
                  ->orWhereHas('pegawai', fn ($p) => $p->where('nama_lengkap', 'like', "%{$cari}%"));
            })
            ->orderBy('hari')
            ->orderBy('jam_mulai')
            ->paginate(10)
            ->withQueryString();

        $daftarGuru = Pegawai::select('nip', 'nama_lengkap')->orderBy('nama_lengkap')->get();

        return Inertia::render('Admin/Jadwal', [
            'jadwal'     => $jadwal,
            'daftarGuru' => $daftarGuru,
            'filter'     => [
                'hari' => $hari,
                'cari' => $cari,
            ],
        ]);
    }

    public function jadwalStore(Request $request)
    {
        $validated = $request->validate([
            'nip'            => ['required', 'exists:pegawai,nip'],
            'hari'           => ['required', Rule::in(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])],
            'jam_mulai'      => ['required', 'date_format:H:i'],
            'jam_selesai'    => ['required', 'date_format:H:i', 'after:jam_mulai'],
            'mata_pelajaran' => ['required', 'string', 'max:100'],
            'kelas'          => ['required', 'string', 'max:50'],
        ], [
            'nip.required'            => 'Guru pengajar wajib dipilih.',
            'nip.exists'              => 'Guru tidak ditemukan.',
            'hari.required'           => 'Hari mengajar wajib dipilih.',
            'jam_mulai.required'      => 'Jam mulai wajib diisi.',
            'jam_selesai.required'    => 'Jam selesai wajib diisi.',
            'jam_selesai.after'       => 'Jam selesai harus lebih akhir dari jam mulai.',
            'mata_pelajaran.required' => 'Mata pelajaran wajib diisi.',
            'kelas.required'          => 'Kelas wajib diisi.',
        ]);

        $validated['is_active'] = true;
        JadwalMengajar::create($validated);

        return back()->with('success', 'Jadwal pelajaran berhasil ditambahkan.');
    }

    public function jadwalUpdate(Request $request, JadwalMengajar $jadwal)
    {
        $validated = $request->validate([
            'nip'            => ['required', 'exists:pegawai,nip'],
            'hari'           => ['required', Rule::in(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])],
            'jam_mulai'      => ['required', 'date_format:H:i'],
            'jam_selesai'    => ['required', 'date_format:H:i', 'after:jam_mulai'],
            'mata_pelajaran' => ['required', 'string', 'max:100'],
            'kelas'          => ['required', 'string', 'max:50'],
        ], [
            'nip.required'            => 'Guru pengajar wajib dipilih.',
            'nip.exists'              => 'Guru tidak ditemukan.',
            'hari.required'           => 'Hari mengajar wajib dipilih.',
            'jam_mulai.required'      => 'Jam mulai wajib diisi.',
            'jam_selesai.required'    => 'Jam selesai wajib diisi.',
            'jam_selesai.after'       => 'Jam selesai harus lebih akhir dari jam mulai.',
            'mata_pelajaran.required' => 'Mata pelajaran wajib diisi.',
            'kelas.required'          => 'Kelas wajib diisi.',
        ]);

        $jadwal->update($validated);

        return back();
    }

    public function jadwalDestroy(JadwalMengajar $jadwal)
    {
        $jadwal->delete();
        return back()->with('success', 'Jadwal pelajaran berhasil dihapus.');
    }

    // ==========================================
    // KELOLA IZIN (VALIDASI)
    // ==========================================
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

    // ==========================================
    // PROFIL ADMIN
    // ==========================================
    public function profilEdit()
    {
        $admin = Auth::guard('admin')->user();

        return Inertia::render('Admin/Profil', [
            'admin' => [
                'name'  => $admin->name,
                'email' => $admin->email,
            ],
        ]);
    }

    public function profilUpdate(Request $request)
    {
        $admin = Auth::guard('admin')->user();

        // `sometimes` agar form password (yang hanya mengirim field password)
        // tidak ikut memvalidasi name/email yang tidak dikirim.
        $validated = $request->validate([
            'name'  => ['sometimes', 'required', 'string', 'max:150'],
            'email' => [
                'sometimes', 'required', 'email', 'max:100',
                Rule::unique('admins', 'email')->ignore($admin->id),
            ],
            'password_lama' => ['nullable', 'required_with:password_baru', 'string'],
            'password_baru' => ['nullable', 'string', 'min:6', 'confirmed'],
        ], [
            'name.required'            => 'Nama tidak boleh kosong.',
            'email.required'           => 'Email tidak boleh kosong.',
            'email.email'              => 'Format email tidak valid.',
            'email.unique'             => 'Email tersebut sudah dipakai admin lain.',
            'password_lama.required_with' => 'Password saat ini wajib diisi sebelum mengganti password.',
            'password_baru.min'        => 'Password baru minimal 6 karakter.',
            'password_baru.confirmed'  => 'Konfirmasi password baru tidak cocok.',
        ]);

        if (isset($validated['name'])) {
            $admin->name = trim(strip_tags($validated['name']));
        }
        if (isset($validated['email'])) {
            $admin->email = $validated['email'];
        }

        if ($request->filled('password_baru')) {
            if (!Hash::check($request->password_lama, $admin->password)) {
                return back()->withErrors([
                    'password_lama' => 'Password saat ini yang Anda masukkan salah.',
                ]);
            }
            $admin->password = Hash::make($request->password_baru);
        }

        $admin->save();

        return back();
    }
}

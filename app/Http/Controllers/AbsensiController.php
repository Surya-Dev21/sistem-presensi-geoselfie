<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\JadwalMengajar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class AbsensiController extends Controller
{
    // Halaman Dashboard Pegawai / Guru
    public function dashboard()
    {
        $pegawai = Auth::guard('pegawai')->user();
        $today = Carbon::now('Asia/Jakarta')->format('Y-m-d');

        // Map nama hari ke Bahasa Indonesia
        $mapHari = [
            'Sunday'    => 'Minggu',
            'Monday'    => 'Senin',
            'Tuesday'   => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday'  => 'Kamis',
            'Friday'    => 'Jumat',
            'Saturday'  => 'Sabtu',
        ];
        $hariIni = $mapHari[Carbon::now('Asia/Jakarta')->format('l')];

        // 1. Ambil data presensi harian hari ini
        $absen = Absensi::where('nip', $pegawai->nip)
            ->where('tgl_absen', $today)
            ->first();

        // 2. Ambil jadwal mengajar guru hari ini (diurutkan berdasarkan jam mulai terkecil)
        $jadwalHariIni = JadwalMengajar::where('nip', $pegawai->nip)
            ->where('hari', $hariIni)
            ->where('is_active', true)
            ->orderBy('jam_mulai', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'id'             => $item->id,
                    'jam_mulai'      => substr($item->jam_mulai, 0, 5),
                    'jam_selesai'    => substr($item->jam_selesai, 0, 5),
                    'mata_pelajaran' => $item->mata_pelajaran,
                    'kelas'          => $item->kelas,
                ];
            });

        // 3. Tentukan Jam Acuan Masuk (Diambil dari jam_mulai sesi pertama hari ini)
        $jamAcuanMasuk = count($jadwalHariIni) > 0 
            ? $jadwalHariIni[0]['jam_mulai'] 
            : '07:00'; // Default jika tidak ada jadwal hari ini

        return Inertia::render('Pegawai/Dashboard', [
            'statusAbsen' => [
                'masuk'  => $absen && $absen->jam_masuk ? substr($absen->jam_masuk, 0, 5) : '-- : --',
                'pulang' => $absen && $absen->jam_keluar ? substr($absen->jam_keluar, 0, 5) : '-- : --',
            ],
            'jadwalHariIni'  => $jadwalHariIni,
            'jamAcuanMasuk'  => $jamAcuanMasuk,
        ]);
    }

    // Halaman Absen (Kamera & Maps)
    public function create()
    {
        $pegawai = Auth::guard('pegawai')->user();
        $today = Carbon::now('Asia/Jakarta')->format('Y-m-d');

        $absenHariIni = Absensi::where('nip', $pegawai->nip)
            ->where('tgl_absen', $today)
            ->first();

        return Inertia::render('Pegawai/Absensi', [
            'absenHariIni' => [
                'sudah_masuk'  => $absenHariIni && $absenHariIni->jam_masuk ? true : false,
                'sudah_pulang' => $absenHariIni && $absenHariIni->jam_keluar ? true : false,
                'jam_masuk'    => $absenHariIni ? substr($absenHariIni->jam_masuk, 0, 5) : null,
                'jam_keluar'   => $absenHariIni ? substr($absenHariIni->jam_keluar, 0, 5) : null,
            ]
        ]);
    }

    // Halaman Kalender / Riwayat Absensi
    public function index(Request $request)
    {
        $pegawai = Auth::guard('pegawai')->user();

        $bulan = $request->input('bulan', date('m'));
        $tahun = $request->input('tahun', date('Y'));

        $riwayat = Absensi::where('nip', $pegawai->nip)
            ->whereMonth('tgl_absen', $bulan)
            ->whereYear('tgl_absen', $tahun)
            ->orderBy('tgl_absen', 'desc')
            ->get();

        $totalHadir = $riwayat->where('status', 'Hadir')->count();
        $totalIzinSakit = $riwayat->whereIn('status', ['Izin', 'Sakit'])->count();
        $totalAlpa = $riwayat->where('status', 'Alpa')->count();

        return Inertia::render('Pegawai/Kalender', [
            'riwayat'   => $riwayat,
            'statistik' => [
                'hadir'      => $totalHadir,
                'izin_sakit' => $totalIzinSakit,
                'alpa'       => $totalAlpa,
            ],
            'filter'    => [
                'bulan' => $bulan,
                'tahun' => $tahun,
            ]
        ]);
    }

    // Proses Simpan Absensi (Masuk & Pulang)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipe_absen' => 'required|in:masuk,pulang',
            'latitude'   => 'required|numeric',
            'longitude'  => 'required|numeric',
            'foto'       => 'required|string',
        ]);

        $pegawai = Auth::guard('pegawai')->user();
        $today = Carbon::now('Asia/Jakarta')->format('Y-m-d');
        $timeNow = Carbon::now('Asia/Jakarta')->format('H:i:s');
        $coordinates = $validated['latitude'] . ',' . $validated['longitude'];

        $absensi = Absensi::where('nip', $pegawai->nip)
            ->where('tgl_absen', $today)
            ->first();

        // 1. VALIDASI ABSEN MASUK
        if ($validated['tipe_absen'] === 'masuk') {
            if ($absensi && $absensi->jam_masuk) {
                return redirect()->back()->with('error', 'Anda sudah melakukan Absen Masuk hari ini pada pukul ' . substr($absensi->jam_masuk, 0, 5) . ' WIB!');
            }

            $photoPath = $this->uploadFotoBase64($validated['foto'], $pegawai->nip, 'masuk');

            Absensi::updateOrCreate(
                ['nip' => $pegawai->nip, 'tgl_absen' => $today],
                [
                    'jam_masuk'   => $timeNow,
                    'location_in' => $coordinates,
                    'foto_in'     => $photoPath,
                    'status'      => 'Hadir',
                ]
            );

            return redirect()->route('pegawai.dashboard')->with('success', 'Absen MASUK berhasil dicatat pada pukul ' . substr($timeNow, 0, 5) . ' WIB.');
        }

        // 2. VALIDASI ABSEN PULANG
        if ($validated['tipe_absen'] === 'pulang') {
            if (!$absensi || !$absensi->jam_masuk) {
                return redirect()->back()->with('error', 'Gagal Absen Pulang! Anda belum melakukan Absen Masuk hari ini.');
            }

            if ($absensi->jam_keluar) {
                return redirect()->back()->with('error', 'Anda sudah melakukan Absen Pulang hari ini pada pukul ' . substr($absensi->jam_keluar, 0, 5) . ' WIB!');
            }

            $photoPath = $this->uploadFotoBase64($validated['foto'], $pegawai->nip, 'pulang');

            $absensi->update([
                'jam_keluar'   => $timeNow,
                'location_out' => $coordinates,
                'foto_out'     => $photoPath,
            ]);

            return redirect()->route('pegawai.dashboard')->with('success', 'Absen PULANG berhasil dicatat pada pukul ' . substr($timeNow, 0, 5) . ' WIB.');
        }
    }

    private function uploadFotoBase64($fotoBase64, $nip, $tipe)
    {
        if (str_contains($fotoBase64, ';base64,')) {
            [, $fotoData] = explode(';', $fotoBase64);
            [, $fotoData] = explode(',', $fotoData);
        } else {
            $fotoData = $fotoBase64;
        }

        $decodedPhoto = base64_decode($fotoData);
        $filename = $nip . '_' . time() . '_' . $tipe . '.jpg';
        
        Storage::disk('public')->put('absensi/' . $filename, $decodedPhoto);

        return 'absensi/' . $filename;
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Pegawai;
use App\Models\Absensi;
use Illuminate\Http\Request;
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
        ]);
    }
}

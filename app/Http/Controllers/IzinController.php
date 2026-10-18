<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class IzinController extends Controller
{
    // Halaman Form Pengajuan Izin
    public function create()
    {
        // Nanti kita buat file React-nya: resources/js/Pages/Pegawai/Izin.jsx
        return Inertia::render('Pegawai/Izin');
    }

    // Proses Simpan Izin
    public function store(Request $request)
    {
        // Logika simpan izin akan kita buat di sini nanti
    }
}
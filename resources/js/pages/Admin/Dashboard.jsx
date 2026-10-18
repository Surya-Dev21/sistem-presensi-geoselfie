import React from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function Dashboard({ totalPegawai, hadirHariIni, izinHariIni }) {
    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Head title="Dashboard Admin - E-Absen" />
            
            {/* Sidebar Sederhana */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                <div className="p-5 text-xl font-bold border-b border-slate-800">
                    E-Absen Admin
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin/dashboard" className="block px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium">
                        Dashboard
                    </a>
                    <a href="#" className="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition">
                        Data Guru
                    </a>
                    <a href="#" className="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition">
                        Rekap Absensi
                    </a>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full py-2 px-4 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition text-sm font-medium"
                    >
                        Keluar Sistem
                    </button>
                </div>
            </aside>

            {/* Konten Utama */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
                    <h1 className="text-lg font-semibold text-gray-800">Dashboard Utama</h1>
                    <span className="text-sm text-gray-500">Administrator</span>
                </header>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    {/* Kartu Statistik */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 font-medium">Total Pegawai / Guru</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalPegawai}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 font-medium">Hadir Hari Ini</p>
                            <h3 className="text-3xl font-bold text-emerald-600 mt-2">{hadirHariIni}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 font-medium">Izin / Sakit Hari Ini</p>
                            <h3 className="text-3xl font-bold text-amber-600 mt-2">{izinHariIni}</h3>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
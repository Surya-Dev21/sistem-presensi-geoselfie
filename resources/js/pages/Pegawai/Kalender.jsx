import React from 'react';
import { Head, router } from '@inertiajs/react';
import { FiCheckCircle, FiFileText, FiClock } from 'react-icons/fi';
import GuruLayout from '@/components/guru-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RiwayatPresensi({ riwayat = [], statistik = { hadir: 0, izin_sakit: 0, terlambat: 0 }, filter = {} }) {
    // Fungsi untuk handle perubahan filter bulan/tahun
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        router.get('/kalender', {
            ...filter,
            [name]: value
        }, { preserveState: true, replace: true });
    };

    return (
        <GuruLayout title="Riwayat Presensi">
            <Head title="Riwayat Presensi - Portal SIMAG" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Rekapitulasi Kehadiran
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Pantau riwayat presensi masuk, pulang, serta status kehadiran harian Anda.
                    </p>
                </div>

                {/* 1. STATISTIK CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-emerald-100 dark:border-emerald-900/60 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
                            <FiCheckCircle />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Hadir</p>
                            <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                                {statistik.hadir} <span className="text-sm font-medium text-emerald-600 dark:text-emerald-500">Hari</span>
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-amber-100 dark:border-amber-900/60 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl">
                            <FiFileText />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Izin / Sakit</p>
                            <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400">
                                {statistik.izin_sakit} <span className="text-sm font-medium text-amber-600 dark:text-amber-500">Hari</span>
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-rose-100 dark:border-rose-900/60 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl">
                            <FiClock />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Terlambat</p>
                            <h3 className="text-2xl font-black text-rose-700 dark:text-rose-400">
                                {statistik.terlambat} <span className="text-sm font-medium text-rose-600 dark:text-rose-500">Kali</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* 2. FILTER BULAN & TAHUN */}
                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                            Filter Periode
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Bulan
                                </label>
                                <select 
                                    name="bulan" 
                                    value={filter?.bulan || ''} 
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition"
                                >
                                    <option value="1">Januari</option>
                                    <option value="2">Februari</option>
                                    <option value="3">Maret</option>
                                    <option value="4">April</option>
                                    <option value="5">Mei</option>
                                    <option value="6">Juni</option>
                                    <option value="7">Juli</option>
                                    <option value="8">Agustus</option>
                                    <option value="9">September</option>
                                    <option value="10">Oktober</option>
                                    <option value="11">November</option>
                                    <option value="12">Desember</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Tahun
                                </label>
                                <select 
                                    name="tahun" 
                                    value={filter?.tahun || ''} 
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition"
                                >
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                    <option value="2027">2027</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. TABEL RIWAYAT */}
                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                            Daftar Presensi Harian
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Tanggal</th>
                                        <th className="py-3.5 px-6">Jam Masuk</th>
                                        <th className="py-3.5 px-6">Jam Pulang</th>
                                        <th className="py-3.5 px-6">Status Kehadiran</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                    {riwayat.length > 0 ? (
                                        riwayat.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                                                <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                                                    {item.tanggal}
                                                </td>
                                                <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-mono text-xs">
                                                    {item.jam_masuk ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-md">
                                                            {item.jam_masuk} WIB
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-mono text-xs">
                                                    {item.jam_pulang ? (
                                                        <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded-md">
                                                            {item.jam_pulang} WIB
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        item.status === 'Tepat Waktu' 
                                                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                                                            : item.status === 'Terlambat'
                                                            ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                                            : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                                                Belum ada data presensi pada periode yang dipilih.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </GuruLayout>
    );
}

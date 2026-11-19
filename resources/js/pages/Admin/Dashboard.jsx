import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { FiClock, FiFileText } from 'react-icons/fi';
import AdminLayout from '@/components/admin-layout';

export default function Dashboard({ totalPegawai, hadirHariIni, izinHariIni, pendingIzin = 0 }) {
    const kartu = [
        {
            label: 'Total Pegawai / Guru',
            value: totalPegawai,
            valueClass: 'text-slate-800 dark:text-white',
        },
        {
            label: 'Hadir Hari Ini',
            value: hadirHariIni,
            valueClass: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'Izin / Sakit Hari Ini',
            value: izinHariIni,
            valueClass: 'text-blue-800 dark:text-blue-300',
        },
    ];

    return (
        <AdminLayout title="Dashboard Admin">
            <Head title="Dashboard Admin - SIPRES Guru" />

            <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white">Dashboard Utama</h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ringkasan kehadiran dan pengajuan izin guru hari ini.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {kartu.map(({ label, value, valueClass }) => (
                    <div
                        key={label}
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"
                    >
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                            {label}
                        </p>
                        <p className={`text-2xl font-black mt-1.5 ${valueClass}`}>{value}</p>
                    </div>
                ))}

                <Link
                    href="/admin/izin"
                    className="bg-blue-900 hover:bg-blue-800 p-4 rounded-2xl border border-blue-800 shadow-xs transition-colors block"
                >
                    <p className="text-[10px] sm:text-xs text-blue-100 font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                        <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
                        Menunggu Validasi
                    </p>
                    <p className="text-2xl font-black mt-1.5 text-white">{pendingIzin}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-blue-100">
                        <FiFileText className="h-3 w-3" aria-hidden="true" />
                        Tinjau pengajuan izin
                    </span>
                </Link>
            </div>
        </AdminLayout>
    );
}

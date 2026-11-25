import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    FiUsers,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiFileText,
    FiCalendar,
    FiBarChart2,
    FiArrowRight
} from "react-icons/fi";
import AdminLayout from "@/components/admin-layout";

export default function Dashboard({
    totalPegawai = 0,
    hadirHariIni = 0,
    izinHariIni = 0,
    pendingIzin = 0,
    persentaseHadir = 0,
    presensiHariIni = [],
}) {
    const stats = [
        {
            label: "Total Guru",
            value: totalPegawai,
            icon: FiUsers,
            color: "text-blue-800 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950/50"
        },
        {
            label: "Hadir Hari Ini",
            value: `${hadirHariIni} (${persentaseHadir}%)`,
            icon: FiCheckCircle,
            color: "text-emerald-700 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/50"
        },
        {
            label: "Izin / Sakit",
            value: izinHariIni,
            icon: FiClock,
            color: "text-blue-700 dark:text-blue-300",
            bg: "bg-blue-50 dark:bg-blue-950/50"
        },
        {
            label: "Izin Menunggu",
            value: pendingIzin,
            icon: FiAlertCircle,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-950/50"
        },
    ];

    const quickActions = [
        {
            href: "/admin/pegawai",
            icon: FiUsers,
            label: "Kelola Data Guru",
            desc: "Tambah, edit, & hapus data guru/pegawai.",
        },
        {
            href: "/admin/izin",
            icon: FiFileText,
            label: "Validasi Izin",
            desc: "Persetujuan permohonan izin & sakit.",
        },
        {
            href: "/admin/laporan",
            icon: FiBarChart2,
            label: "Laporan Absensi",
            desc: "Rekapitulasi kehadiran bulanan guru.",
        },
        {
            href: "/admin/jadwal",
            icon: FiCalendar,
            label: "Jadwal Pelajaran",
            desc: "Pengaturan jadwal mata pelajaran kelas.",
        },
    ];

    const [waktu, setWaktu] = useState(null);
    useEffect(() => {
        setWaktu(new Date());
        const t = setInterval(() => setWaktu(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const formatTanggal = waktu
        ? waktu.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Jakarta",
          })
        : "Memuat tanggal...";

    return (
        <AdminLayout title="Dashboard Administrator">
            <Head title="Dashboard Admin - SIPRES Guru" />

            <div className="space-y-4">
                {/* Hero Banner Elegan */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-5 sm:p-6 shadow-sm border border-blue-800">
                    <div className="relative z-10 max-w-2xl space-y-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-blue-100 uppercase tracking-widest">
                            Panel Administrator &middot; {formatTanggal}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                            Selamat Datang di Portal Manajemen SIPRES
                        </h2>
                        <p className="text-xs text-blue-100 leading-relaxed">
                            Pantau tingkat kehadiran guru, validasi permohonan izin, dan kelola jadwal sekolah.
                        </p>
                    </div>
                </div>

                {/* Grid Statistik Kehadiran Guru */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                                <p className={`text-xl font-black mt-0.5 ${color}`}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Akses Cepat Kelola Admin */}
                <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Menu Pengelolaan Utama
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {quickActions.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:border-blue-500 hover:shadow-sm transition flex flex-col justify-between gap-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 rounded-xl flex items-center justify-center group-hover:bg-blue-800 group-hover:text-white transition">
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    <FiArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-700 transition">
                                        {item.label}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Tabel Ringkasan Presensi Hari Ini */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                Presensi Terkini Hari Ini
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                5 presensi guru yang terakhir masuk ke sistem hari ini.
                            </p>
                        </div>
                        <Link
                            href="/admin/laporan"
                            className="text-xs font-bold text-blue-800 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                            Lihat Semua Laporan <FiArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-2.5 px-4">Guru</th>
                                    <th className="py-2.5 px-4">Jabatan</th>
                                    <th className="py-2.5 px-4">Jam Masuk</th>
                                    <th className="py-2.5 px-4">Jam Pulang</th>
                                    <th className="py-2.5 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {presensiHariIni.length > 0 ? (
                                    presensiHariIni.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                                                {row.nama}
                                                <span className="block text-[10px] text-slate-400 font-mono font-normal">
                                                    NIP {row.nip}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{row.jabatan}</td>
                                            <td className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                                {row.jam_masuk ? `${row.jam_masuk} WIB` : "-"}
                                            </td>
                                            <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                                                {row.jam_keluar ? `${row.jam_keluar} WIB` : "-"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                                            Belum ada presensi yang tercatat untuk hari ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

import React from "react";
import { Head, Link } from "@inertiajs/react";
import {
    FiAlertCircle,
    FiArrowRight,
    FiBarChart2,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiFileText,
    FiUsers,
} from "react-icons/fi";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import AdminLayout from "@/components/admin-layout";

const WARNA_STATUS = {
    Hadir: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    Izin: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    Sakit: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    Alpa: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

function TooltipChart({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <p className="font-bold text-slate-700 dark:text-white">{label}</p>
            {payload.map((item) => (
                <p key={item.dataKey} className="text-slate-500 dark:text-slate-300">
                    <span
                        className="mr-1.5 inline-block h-2 w-2 rounded-full"
                        style={{ background: item.color }}
                    />
                    {item.name}: <span className="font-bold">{item.value}</span>
                </p>
            ))}
        </div>
    );
}

function LegendDot({ warna, label }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: warna }} />
            {label}
        </span>
    );
}

export default function Dashboard({
    totalPegawai = 0,
    hadirHariIni = 0,
    izinHariIni = 0,
    pendingIzin = 0,
    persentaseHadir = 0,
    presensiHariIni = [],
    trenPresensi = [],
}) {
    const tanggalHariIni = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
    });

    const stats = [
        { label: "Total Guru", value: totalPegawai, icon: FiUsers, color: "text-blue-800 dark:text-blue-300" },
        { label: "Hadir Hari Ini", value: `${hadirHariIni} (${persentaseHadir}%)`, icon: FiCheckCircle, color: "text-emerald-700 dark:text-emerald-400" },
        { label: "Izin / Sakit", value: izinHariIni, icon: FiClock, color: "text-blue-700 dark:text-blue-300" },
        { label: "Menunggu Validasi", value: pendingIzin, icon: FiAlertCircle, color: "text-rose-600 dark:text-rose-400" },
    ];

    const quickActions = [
        { href: "/admin/pegawai", icon: FiUsers, label: "Kelola Data Guru" },
        { href: "/admin/izin", icon: FiFileText, label: "Validasi Izin" },
        { href: "/admin/laporan", icon: FiBarChart2, label: "Laporan Absensi" },
        { href: "/admin/jadwal", icon: FiCalendar, label: "Jadwal Pelajaran" },
    ];

    const adaDataChart = trenPresensi.some(
        (d) => d.hadir + d.izin + d.sakit + d.alpa > 0
    );

    return (
        <AdminLayout title="Dashboard Admin">
            <Head title="Dashboard Admin - SIPRES Guru" />

            <div className="space-y-5">
                {/* Sapaan (tanpa kartu biru) */}
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {tanggalHariIni}
                    </p>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Selamat datang kembali, Admin Sekolah!
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ringkasan kehadiran guru dan aktivitas sekolah hari ini.
                    </p>
                </div>

                {/* Statistik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.map(({ label, value, icon: Icon, color }) => (
                        <div
                            key={label}
                            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3"
                        >
                            <span className={`h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${color}`}>
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {label}
                                </p>
                                <p className="text-xl font-black mt-0.5 text-slate-800 dark:text-white">
                                    {value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart presensi 7 hari */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                Tren Presensi 7 Hari Terakhir
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Jumlah catatan presensi guru per hari.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            <LegendDot warna="#1e40af" label="Hadir" />
                            <LegendDot warna="#60a5fa" label="Izin" />
                            <LegendDot warna="#f43f5e" label="Sakit" />
                        </div>
                    </div>

                    <div className="h-64 w-full mt-4 text-slate-400">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={trenPresensi}
                                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="currentColor"
                                    opacity={0.15}
                                />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "currentColor", fontSize: 10 }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tickLine={false}
                                    axisLine={false}
                                    width={30}
                                    tick={{ fill: "currentColor", fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{ fill: "currentColor", opacity: 0.06 }}
                                    content={<TooltipChart />}
                                />
                                <Bar dataKey="hadir" name="Hadir" fill="#1e40af" radius={[4, 4, 0, 0]} maxBarSize={18} />
                                <Bar dataKey="izin" name="Izin" fill="#60a5fa" radius={[4, 4, 0, 0]} maxBarSize={18} />
                                <Bar dataKey="sakit" name="Sakit" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {!adaDataChart && (
                        <p className="text-center text-[11px] text-slate-400 mt-2">
                            Belum ada data presensi pada 7 hari terakhir.
                        </p>
                    )}
                </section>

                {/* Menu pengelolaan */}
                <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Menu Pengelolaan
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {quickActions.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:border-blue-400 hover:shadow-sm transition flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-blue-800 group-hover:text-white transition">
                                            <Icon className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                            {item.label}
                                        </p>
                                    </div>
                                    <FiArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition flex-shrink-0" />
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Presensi hari ini */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                Presensi Terkini Hari Ini
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                5 presensi guru terakhir yang masuk.
                            </p>
                        </div>
                        <Link
                            href="/admin/laporan"
                            className="text-xs font-bold text-blue-800 dark:text-blue-300 hover:underline inline-flex items-center gap-1 flex-shrink-0"
                        >
                            Lihat Laporan <FiArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-2.5 px-4">Guru</th>
                                    <th className="py-2.5 px-4">Masuk</th>
                                    <th className="py-2.5 px-4">Pulang</th>
                                    <th className="py-2.5 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {presensiHariIni.length > 0 ? (
                                    presensiHariIni.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-slate-800 dark:text-white">
                                                    {row.nama}
                                                </p>
                                                <span className="block text-[10px] text-slate-400 font-mono font-normal">
                                                    NIP {row.nip}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                                                {row.jam_masuk ? `${row.jam_masuk} WIB` : "-"}
                                            </td>
                                            <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                                                {row.jam_keluar ? `${row.jam_keluar} WIB` : "-"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        WARNA_STATUS[row.status] ?? WARNA_STATUS.Alpa
                                                    }`}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                                            Belum ada presensi yang tercatat untuk hari ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}

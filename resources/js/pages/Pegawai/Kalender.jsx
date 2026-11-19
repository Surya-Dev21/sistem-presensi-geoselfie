import React from 'react';
import { Head, router } from '@inertiajs/react';
import {
    FiCheckCircle,
    FiFileText,
    FiThermometer,
    FiXCircle,
    FiCalendar,
    FiRefreshCw,
} from 'react-icons/fi';
import GuruLayout from '@/components/guru-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ============================================================
// Palet status (satu sumber kebenaran)
// Hadir = hijau · Izin = biru · Sakit = kuning · Alpa = merah
// ============================================================
const STATUS = {
    Hadir: {
        label: 'Hadir',
        card: 'border-emerald-200 dark:border-emerald-900',
        iconBg: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
        value: 'text-emerald-700 dark:text-emerald-400',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
        dot: 'bg-emerald-500',
    },
    Izin: {
        label: 'Izin',
        card: 'border-blue-200 dark:border-blue-900',
        iconBg: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
        value: 'text-blue-700 dark:text-blue-300',
        badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
        dot: 'bg-blue-500',
    },
    Sakit: {
        label: 'Sakit',
        card: 'border-yellow-200 dark:border-yellow-900',
        iconBg: 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300',
        value: 'text-yellow-700 dark:text-yellow-300',
        badge: 'bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-900',
        dot: 'bg-yellow-400',
    },
    Alpa: {
        label: 'Alpa',
        card: 'border-rose-200 dark:border-rose-900',
        iconBg: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
        value: 'text-rose-700 dark:text-rose-400',
        badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900',
        dot: 'bg-rose-500',
    },
};

const statusStyle = (status) => STATUS[status] ?? STATUS.Hadir;

const fmtTanggal = (nilai) => {
    if (!nilai) return '-';
    const d = new Date(`${nilai}`.substring(0, 10) + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return nilai;
    return d.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const fmtJam = (nilai) => (nilai ? `${`${nilai}`.substring(0, 5)} WIB` : null);

function StatusBadge({ status, withDot = false }) {
    const s = statusStyle(status);
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.badge}`}>
            {withDot && <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />}
            {s.label}
        </span>
    );
}

function EmptyState() {
    return (
        <div className="py-10 px-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <FiCalendar className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Belum ada data presensi pada periode ini.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Coba ganti bulan atau tahun.
            </p>
        </div>
    );
}

const BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const TAHUN = ['2025', '2026', '2027'];

export default function RiwayatPresensi({
    riwayat = [],
    statistik = { hadir: 0, izin: 0, sakit: 0, alpa: 0 },
    filter = {},
}) {
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        router.get('/kalender', { ...filter, [name]: value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        router.get('/kalender', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const kartu = [
        { key: 'hadir', status: 'Hadir', Icon: FiCheckCircle },
        { key: 'izin', status: 'Izin', Icon: FiFileText },
        { key: 'sakit', status: 'Sakit', Icon: FiThermometer },
        { key: 'alpa', status: 'Alpa', Icon: FiXCircle },
    ];

    const selectClass =
        'h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-800 dark:focus:border-blue-400 focus:ring-0 outline-none transition';

    return (
        <GuruLayout title="Riwayat Presensi">
            <Head title="Riwayat Presensi - Portal SIPRES Guru" />

            <div className="max-w-5xl mx-auto space-y-3.5">
                {/* HEADER + LEGENDA */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                    <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white">
                            Riwayat Presensi
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Rekap kehadiran, izin, dan sakit Anda per bulan.
                        </p>
                    </div>

                    <ul className="flex flex-wrap items-center gap-2.5" aria-label="Legenda status kehadiran">
                        {Object.values(STATUS).map((s) => (
                            <li key={s.label} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden="true" />
                                {s.label}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* KARTU STATISTIK: 4 status terpisah */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {kartu.map(({ key, status, Icon }) => {
                        const s = STATUS[status];
                        return (
                            <div
                                key={key}
                                className={`bg-white dark:bg-slate-900 rounded-2xl p-3.5 border ${s.card} shadow-xs flex items-center gap-3`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${s.iconBg}`}>
                                    <Icon aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                                        {s.label}
                                    </p>
                                    <p className={`text-lg font-black leading-tight ${s.value}`}>
                                        {statistik?.[key] ?? 0}{' '}
                                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Hari</span>
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* FILTER PERIODE */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2.5">
                        <div className="flex-1">
                            <label htmlFor="filter-bulan" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                Bulan
                            </label>
                            <select
                                id="filter-bulan"
                                name="bulan"
                                aria-label="Filter bulan"
                                value={filter?.bulan ?? ''}
                                onChange={handleFilterChange}
                                className={`${selectClass} w-full`}
                            >
                                {BULAN.map((nama, i) => (
                                    <option key={nama} value={String(i + 1)}>{nama}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1">
                            <label htmlFor="filter-tahun" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                Tahun
                            </label>
                            <select
                                id="filter-tahun"
                                name="tahun"
                                aria-label="Filter tahun"
                                value={filter?.tahun ?? ''}
                                onChange={handleFilterChange}
                                className={`${selectClass} w-full`}
                            >
                                {TAHUN.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={resetFilter}
                            className="h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition inline-flex items-center justify-center gap-1.5"
                        >
                            <FiRefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                            Reset
                        </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2" aria-live="polite">
                        Menampilkan {riwayat.length} baris pada periode ini.
                    </p>
                </div>

                {/* DAFTAR RIWAYAT */}
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                    <CardHeader className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                            Daftar Presensi Harian
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        {riwayat.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <>
                                {/* DESKTOP: tabel */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                <th scope="col" className="py-3 px-4">Tanggal</th>
                                                <th scope="col" className="py-3 px-4">Jam Masuk</th>
                                                <th scope="col" className="py-3 px-4">Jam Pulang</th>
                                                <th scope="col" className="py-3 px-4">Status</th>
                                                <th scope="col" className="py-3 px-4 hidden lg:table-cell">Keterangan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {riwayat.map((item) => {
                                                const jamMasuk = fmtJam(item.jam_masuk);
                                                const jamKeluar = fmtJam(item.jam_keluar ?? item.jam_pulang);

                                                return (
                                                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                                                        <td className="py-3 px-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                            {fmtTanggal(item.tgl_absen ?? item.tanggal)}
                                                        </td>
                                                        <td className="py-3 px-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                                                            {jamMasuk ?? <span className="text-slate-400">—</span>}
                                                        </td>
                                                        <td className="py-3 px-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                                                            {jamKeluar ?? <span className="text-slate-400">—</span>}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <StatusBadge status={item.status} />
                                                        </td>
                                                        <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-[220px] truncate hidden lg:table-cell">
                                                            {item.keterangan || <span className="text-slate-400">—</span>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* MOBILE: kartu */}
                                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                                    {riwayat.map((item) => (
                                        <div key={item.id} className="p-3.5 space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                                    {fmtTanggal(item.tgl_absen ?? item.tanggal)}
                                                </p>
                                                <StatusBadge status={item.status} withDot />
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300">
                                                <span className="inline-flex items-center gap-1">
                                                    <FiCalendar className="h-3 w-3 text-slate-400" aria-hidden="true" />
                                                    Masuk: {fmtJam(item.jam_masuk) ?? '—'}
                                                </span>
                                                <span>Pulang: {fmtJam(item.jam_keluar ?? item.jam_pulang) ?? '—'}</span>
                                            </div>
                                            {item.keterangan && (
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                                    {item.keterangan}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </GuruLayout>
    );
}

import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
    FiBarChart2,
    FiCheckCircle,
    FiClock,
    FiFileText,
    FiMapPin,
    FiSearch,
    FiXCircle,
} from "react-icons/fi";
import AdminLayout from "@/components/admin-layout";

export default function LaporanIndex({ laporan, statistik, filter = {} }) {
    const [bulan, setBulan] = useState(filter.bulan || String(new Date().getMonth() + 1));
    const [tahun, setTahun] = useState(filter.tahun || String(new Date().getFullYear()));
    const [cari, setCari] = useState(filter.cari || "");

    const terapkanFilter = (e) => {
        e?.preventDefault();
        router.get("/admin/laporan", { bulan, tahun, cari }, { preserveState: true, replace: true });
    };

    const namaBulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    return (
        <AdminLayout title="Laporan Absensi Guru">
            <Head title="Laporan Presensi - SIPRES Admin" />

            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <FiBarChart2 className="text-blue-800 dark:text-blue-400" />
                        Rekapitulasi Laporan Presensi Guru
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pantau riwayat kehadiran, waktu masuk &amp; pulang, serta titik GPS guru sekolah.
                    </p>
                </div>

                {/* Ringkasan Statistik Bulan Ini */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            <FiCheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hadir</p>
                            <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                                {statistik.total_hadir || 0}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                            <FiFileText className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Izin</p>
                            <p className="text-lg font-black text-blue-800 dark:text-blue-300 mt-0.5">
                                {statistik.total_izin || 0}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                            <FiClock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sakit</p>
                            <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5">
                                {statistik.total_sakit || 0}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                            <FiXCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alpa</p>
                            <p className="text-lg font-black text-rose-700 dark:text-rose-400 mt-0.5">
                                {statistik.total_alpa || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Periode & Guru */}
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <form onSubmit={terapkanFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                        <div className="sm:col-span-5 relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                type="text"
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                placeholder="Cari nama guru atau NIP..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-700"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                            >
                                {namaBulan.map((b, i) => (
                                    <option key={b} value={i + 1}>
                                        {b}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                            >
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                className="w-full py-2 px-3 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold transition"
                            >
                                Filter
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tabel Laporan Presensi */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">Tanggal</th>
                                    <th className="py-3 px-4">Guru</th>
                                    <th className="py-3 px-4">Jam Masuk</th>
                                    <th className="py-3 px-4">Jam Pulang</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Lokasi GPS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {laporan.data && laporan.data.length > 0 ? (
                                    laporan.data.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                                                {row.tgl_absen}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                                                {row.pegawai?.nama_lengkap || row.nip}
                                                <span className="block text-[10px] text-slate-400 font-mono font-normal">
                                                    NIP {row.nip}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                                {row.jam_masuk ? `${row.jam_masuk.substring(0, 5)} WIB` : "-"}
                                            </td>
                                            <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                                                {row.jam_keluar ? `${row.jam_keluar.substring(0, 5)} WIB` : "-"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    row.status === "Hadir"
                                                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                                        : row.status === "Izin"
                                                        ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                                        : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                                }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {row.location_in ? (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${row.location_in}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[11px] text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-mono"
                                                    >
                                                        <FiMapPin className="h-3 w-3 shrink-0" />
                                                        GPS Masuk
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400">
                                            Tidak ada catatan presensi pada periode yang dipilih.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {laporan.links && laporan.links.length > 3 && (
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Total {laporan.total} data</span>
                            <div className="flex gap-1">
                                {laporan.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                                            link.active
                                                ? "bg-blue-800 text-white"
                                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        } disabled:opacity-40`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

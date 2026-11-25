import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import {
    FiCalendar,
    FiClock,
    FiPlus,
    FiSearch,
    FiTrash2,
    FiX,
} from "react-icons/fi";
import AdminLayout from "@/components/admin-layout";
import { confirmAction, toastSuccess } from "@/lib/swal";

export default function JadwalIndex({ jadwal, daftarGuru = [], filter = {} }) {
    const [hari, setHari] = useState(filter.hari || "");
    const [cari, setCari] = useState(filter.cari || "");
    const [modalBuka, setModalBuka] = useState(false);

    const form = useForm({
        nip: "",
        hari: "Senin",
        jam_mulai: "07:00",
        jam_selesai: "08:30",
        mata_pelajaran: "",
        kelas: "",
    });

    const listHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get("/admin/jadwal", { hari, cari }, { preserveState: true, replace: true });
    };

    const simpan = (e) => {
        e.preventDefault();
        form.post("/admin/jadwal", {
            onSuccess: () => {
                setModalBuka(false);
                form.reset();
                toastSuccess("Jadwal pelajaran berhasil ditambahkan.");
            },
        });
    };

    const hapus = async (j) => {
        const ok = await confirmAction({
            title: "Hapus jadwal pelajaran?",
            text: `${j.mata_pelajaran} kelas ${j.kelas} pada hari ${j.hari} akan dihapus.`,
            confirmText: "Hapus Jadwal",
            danger: true,
        });
        if (!ok) return;

        router.delete(`/admin/jadwal/${j.id}`, {
            onSuccess: () => toastSuccess("Jadwal pelajaran berhasil dihapus."),
        });
    };

    return (
        <AdminLayout title="Kelola Jadwal Pelajaran">
            <Head title="Jadwal Pelajaran - SIPRES Admin" />

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <FiCalendar className="text-blue-800 dark:text-blue-400" />
                            Jadwal Pelajaran Sekolah
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Atur jam mengajar guru sebagai acuan batas jam presensi masuk guru setiap harinya.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            form.reset();
                            form.clearErrors();
                            setModalBuka(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition shadow-xs"
                    >
                        <FiPlus className="h-4 w-4" />
                        Tambah Jadwal Mengajar
                    </button>
                </div>

                {/* Filter Hari & Mapel */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-2 text-xs">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                type="text"
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                placeholder="Cari mata pelajaran, kelas, atau nama guru..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-700"
                            />
                        </div>

                        <select
                            value={hari}
                            onChange={(e) => setHari(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white sm:w-44"
                        >
                            <option value="">Semua Hari</option>
                            {listHari.map((h) => (
                                <option key={h} value={h}>
                                    {h}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition"
                        >
                            Terapkan
                        </button>
                    </form>
                </div>

                {/* Tabel Jadwal */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">Hari &amp; Jam</th>
                                    <th className="py-3 px-4">Mata Pelajaran</th>
                                    <th className="py-3 px-4">Kelas</th>
                                    <th className="py-3 px-4">Guru Pengajar</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {jadwal.data && jadwal.data.length > 0 ? (
                                    jadwal.data.map((j) => (
                                        <tr key={j.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-4">
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    {j.hari}
                                                </span>
                                                <span className="block text-[10px] text-blue-700 dark:text-blue-400 font-mono font-bold mt-0.5">
                                                    {j.jam_mulai.substring(0, 5)} - {j.jam_selesai.substring(0, 5)} WIB
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                                                {j.mata_pelajaran}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                                                {j.kelas}
                                            </td>
                                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                                                {j.pegawai?.nama_lengkap || j.nip}
                                                <span className="block text-[10px] text-slate-400 font-mono">
                                                    NIP {j.nip}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => hapus(j)}
                                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                                                    title="Hapus Jadwal"
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400">
                                            Belum ada jadwal pelajaran yang tercatat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {jadwal.links && jadwal.links.length > 3 && (
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Total {jadwal.total} jadwal</span>
                            <div className="flex gap-1">
                                {jadwal.links.map((link, idx) => (
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

            {/* Modal Tambah Jadwal */}
            {modalBuka && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <FiClock className="text-blue-800 dark:text-blue-400" />
                                Tambah Jadwal Mengajar
                            </h3>
                            <button
                                type="button"
                                onClick={() => setModalBuka(false)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={simpan} className="p-4 space-y-3 text-xs">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                    Guru Pengajar
                                </label>
                                <select
                                    value={form.data.nip}
                                    onChange={(e) => form.setData("nip", e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                >
                                    <option value="">-- Pilih Guru --</option>
                                    {daftarGuru.map((g) => (
                                        <option key={g.nip} value={g.nip}>
                                            {g.nama_lengkap} (NIP {g.nip})
                                        </option>
                                    ))}
                                </select>
                                {form.errors.nip && <p className="text-rose-500 text-[10px] mt-0.5">{form.errors.nip}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Hari Mengajar
                                    </label>
                                    <select
                                        value={form.data.hari}
                                        onChange={(e) => form.setData("hari", e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    >
                                        {listHari.map((h) => (
                                            <option key={h} value={h}>
                                                {h}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.hari && <p className="text-rose-500 text-[10px] mt-0.5">{form.errors.hari}</p>}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Kelas
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.kelas}
                                        onChange={(e) => form.setData("kelas", e.target.value)}
                                        placeholder="Contoh: XII TKJ 1"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    />
                                    {form.errors.kelas && <p className="text-rose-500 text-[10px] mt-0.5">{form.errors.kelas}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                    Mata Pelajaran
                                </label>
                                <input
                                    type="text"
                                    value={form.data.mata_pelajaran}
                                    onChange={(e) => form.setData("mata_pelajaran", e.target.value)}
                                    placeholder="Administrasi Infrastruktur Jaringan"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                />
                                {form.errors.mata_pelajaran && <p className="text-rose-500 text-[10px] mt-0.5">{form.errors.mata_pelajaran}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Jam Mulai (WIB)
                                    </label>
                                    <input
                                        type="time"
                                        value={form.data.jam_mulai}
                                        onChange={(e) => form.setData("jam_mulai", e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    />
                                    {form.errors.jam_mulai && <p className="text-rose-500 text-[10px] mt-0.5">{form.errors.jam_mulai}</p>}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Jam Selesai (WIB)
                                    </label>
                                    <input
                                        type="time"
                                        value={form.data.jam_selesai}
                                        onChange={(e) => form.setData("jam_selesai", e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    />
                                    {form.errors.jam_selesai && <p className="text-rose-500 text-[10px] mt-0.5">{form.errors.jam_selesai}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setModalBuka(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold disabled:opacity-60"
                                >
                                    {form.processing ? "Menyimpan..." : "Simpan Jadwal"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

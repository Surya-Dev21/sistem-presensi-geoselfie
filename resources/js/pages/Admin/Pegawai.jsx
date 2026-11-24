import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import {
    FiEdit2,
    FiPlus,
    FiSearch,
    FiTrash2,
    FiUserCheck,
    FiUsers,
    FiX,
} from "react-icons/fi";
import AdminLayout from "@/components/admin-layout";
import { confirmAction, toastSuccess } from "@/lib/swal";

export default function PegawaiIndex({ daftarPegawai, filter = {} }) {
    const [cari, setCari] = useState(filter.cari || "");
    const [modalBuka, setModalBuka] = useState(false);
    const [editData, setEditData] = useState(null);

    const form = useForm({
        nip: "",
        nama_lengkap: "",
        jabatan: "",
        jenis_kelamin: "L",
        no_hp: "",
        email: "",
        password: "",
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get("/admin/pegawai", { cari }, { preserveState: true, replace: true });
    };

    const bukaModalTambah = () => {
        setEditData(null);
        form.reset();
        form.clearErrors();
        setModalBuka(true);
    };

    const bukaModalEdit = (p) => {
        setEditData(p);
        form.setData({
            nip: p.nip,
            nama_lengkap: p.nama_lengkap || "",
            jabatan: p.jabatan || "",
            jenis_kelamin: p.jenis_kelamin || "L",
            no_hp: p.no_hp || "",
            email: p.email || "",
            password: "",
        });
        form.clearErrors();
        setModalBuka(true);
    };

    const simpan = (e) => {
        e.preventDefault();
        if (editData) {
            form.put(`/admin/pegawai/${editData.nip}`, {
                onSuccess: () => {
                    setModalBuka(false);
                    toastSuccess("Data guru berhasil diperbarui.");
                },
            });
        } else {
            form.post("/admin/pegawai", {
                onSuccess: () => {
                    setModalBuka(false);
                    toastSuccess("Guru baru berhasil ditambahkan.");
                },
            });
        }
    };

    const hapus = async (p) => {
        const ok = await confirmAction({
            title: `Hapus data ${p.nama_lengkap}?`,
            text: `Data guru dengan NIP ${p.nip} beserta seluruh riwayat presensi akan dihapus permanen.`,
            confirmText: "Hapus Guru",
            danger: true,
        });
        if (!ok) return;

        router.delete(`/admin/pegawai/${p.nip}`, {
            onSuccess: () => toastSuccess("Data guru berhasil dihapus."),
        });
    };

    return (
        <AdminLayout title="Kelola Data Guru">
            <Head title="Kelola Guru - SIPRES Admin" />

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <FiUsers className="text-blue-800 dark:text-blue-400" />
                            Data Guru &amp; Pegawai
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Kelola akun login dan profil seluruh staf pengajar sekolah.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={bukaModalTambah}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition shadow-xs"
                    >
                        <FiPlus className="h-4 w-4" />
                        Tambah Guru Baru
                    </button>
                </div>

                {/* Filter Cari */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                type="text"
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                placeholder="Cari berdasarkan nama, NIP, email, atau jabatan..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-700"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Tabel Guru */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">NIP &amp; Nama</th>
                                    <th className="py-3 px-4">Jabatan</th>
                                    <th className="py-3 px-4">Kontak</th>
                                    <th className="py-3 px-4">Gender</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {daftarPegawai.data && daftarPegawai.data.length > 0 ? (
                                    daftarPegawai.data.map((p) => (
                                        <tr key={p.nip} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                                                {p.nama_lengkap}
                                                <span className="block text-[10px] text-slate-400 font-mono font-normal">
                                                    NIP {p.nip}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                                                {p.jabatan}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                                <span>{p.email}</span>
                                                <span className="block text-[10px] text-slate-400 font-mono">
                                                    {p.no_hp || "-"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                    {p.jenis_kelamin === "P" ? "Perempuan" : "Laki-laki"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-1">
                                                <button
                                                    type="button"
                                                    onClick={() => bukaModalEdit(p)}
                                                    className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 transition"
                                                    title="Edit Guru"
                                                >
                                                    <FiEdit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => hapus(p)}
                                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                                                    title="Hapus Guru"
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400">
                                            Belum ada data guru yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {daftarPegawai.links && daftarPegawai.links.length > 3 && (
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                                Total {daftarPegawai.total} guru
                            </span>
                            <div className="flex gap-1">
                                {daftarPegawai.links.map((link, idx) => (
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

            {/* Modal Tambah / Edit Guru */}
            {modalBuka && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <FiUserCheck className="text-blue-800 dark:text-blue-400" />
                                {editData ? "Edit Data Guru" : "Tambah Guru Baru"}
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
                                    NIP (Nomor Induk Pegawai)
                                </label>
                                <input
                                    type="text"
                                    disabled={!!editData}
                                    value={form.data.nip}
                                    onChange={(e) => form.setData("nip", e.target.value.replace(/\D/g, ""))}
                                    placeholder="Contoh: 199002022020011002"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                                />
                                {form.errors.nip && <p className="text-rose-500 text-[10px] mt-0.5">{form.errors.nip}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                    Nama Lengkap Beserta Gelar
                                </label>
                                <input
                                    type="text"
                                    value={form.data.nama_lengkap}
                                    onChange={(e) => form.setData("nama_lengkap", e.target.value)}
                                    placeholder="Contoh: Drs. Surya Sugiri, M.Pd"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                />
                                {form.errors.nama_lengkap && <p className="text-rose-500 text-[10px] mt-0.5">{form.errors.nama_lengkap}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Jabatan / Peran
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.jabatan}
                                        onChange={(e) => form.setData("jabatan", e.target.value)}
                                        placeholder="Guru Produktif TKJ"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    />
                                    {form.errors.jabatan && <p className="text-rose-500 text-[10px] mt-0.5">{form.errors.jabatan}</p>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Jenis Kelamin
                                    </label>
                                    <select
                                        value={form.data.jenis_kelamin}
                                        onChange={(e) => form.setData("jenis_kelamin", e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    >
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Alamat Email
                                    </label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData("email", e.target.value)}
                                        placeholder="guru@smkpbb.sch.id"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    />
                                    {form.errors.email && <p className="text-rose-500 text-[10px] mt-0.5">{form.errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        No. WhatsApp / HP
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.no_hp}
                                        onChange={(e) => form.setData("no_hp", e.target.value)}
                                        placeholder="081234567890"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    />
                                    {form.errors.no_hp && <p className="text-rose-500 text-[10px] mt-0.5">{form.errors.no_hp}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                    {editData ? "Password Baru (Kosongkan bila tidak diubah)" : "Password Akun"}
                                </label>
                                <input
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData("password", e.target.value)}
                                    placeholder={editData ? "Minimal 6 karakter" : "Minimal 6 karakter"}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                />
                                {form.errors.password && <p className="text-rose-500 text-[10px] mt-0.5">{form.errors.password}</p>}
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
                                    {form.processing ? "Menyimpan..." : "Simpan Data"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

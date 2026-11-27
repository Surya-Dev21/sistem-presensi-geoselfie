import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import {
    FiChevronLeft,
    FiChevronRight,
    FiEdit2,
    FiMail,
    FiPlus,
    FiPhone,
    FiRotateCcw,
    FiSearch,
    FiTrash2,
    FiUserCheck,
    FiUsers,
    FiX,
} from "react-icons/fi";
import AdminLayout from "@/components/admin-layout";
import { confirmAction, toastSuccess } from "@/lib/swal";

const INPUT_CLASS =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700/30 focus:border-blue-700";

const LABEL_CLASS =
    "block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5";

function JenisKelaminBadge({ nilai }) {
    const perempuan = nilai === "P";
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                perempuan
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
            }`}
        >
            {perempuan ? "Perempuan" : "Laki-laki"}
        </span>
    );
}

export default function PegawaiIndex({ daftarPegawai, filter = {} }) {
    const [cari, setCari] = useState(filter.cari || "");
    const [jk, setJk] = useState(filter.jk || "");
    const [sort, setSort] = useState(filter.sort || "asc");
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

    const adaFilter = Boolean(cari || jk || sort !== "asc");

    const applyFilter = (next = {}) => {
        router.get(
            "/admin/pegawai",
            { cari, jk, sort, ...next },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilter();
    };

    const resetFilter = () => {
        setCari("");
        setJk("");
        setSort("asc");
        router.get("/admin/pegawai", {}, { preserveState: true, replace: true });
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

    const rows = daftarPegawai.data ?? [];
    const jumlahTampil = rows.length;

    return (
        <AdminLayout title="Kelola Data Guru">
            <Head title="Kelola Guru - SIPRES Admin" />

            <div className="space-y-4">
                {/* Judul + aksi utama */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <FiUsers className="h-5 w-5 text-blue-800 dark:text-blue-400" aria-hidden="true" />
                            Data Guru &amp; Pegawai
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Kelola akun dan profil seluruh staf pengajar sekolah.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={bukaModalTambah}
                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold transition shadow-sm"
                    >
                        <FiPlus className="h-4 w-4" aria-hidden="true" />
                        Tambah Guru
                    </button>
                </div>

                {/* Pencarian + filter */}
                <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                            <FiSearch
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                placeholder="Cari nama, NIP, email, atau jabatan..."
                                aria-label="Kata kunci pencarian guru"
                                className={`${INPUT_CLASS} pl-9`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                            <select
                                value={jk}
                                onChange={(e) => {
                                    setJk(e.target.value);
                                    applyFilter({ jk: e.target.value });
                                }}
                                aria-label="Filter jenis kelamin"
                                className={`${INPUT_CLASS} sm:w-40`}
                            >
                                <option value="">Semua Jenis Kelamin</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>

                            <select
                                value={sort}
                                onChange={(e) => {
                                    setSort(e.target.value);
                                    applyFilter({ sort: e.target.value });
                                }}
                                aria-label="Urutkan nama"
                                className={`${INPUT_CLASS} sm:w-36`}
                            >
                                <option value="asc">Nama A-Z</option>
                                <option value="desc">Nama Z-A</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition"
                            >
                                Cari
                            </button>
                            {adaFilter && (
                                <button
                                    type="button"
                                    onClick={resetFilter}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                    aria-label="Reset filter"
                                    title="Reset filter"
                                >
                                    <FiRotateCcw className="h-4 w-4" aria-hidden="true" />
                                    <span className="sm:hidden">Reset</span>
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Daftar guru: kartu di HP, tabel di tablet/laptop */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {/* ── Mobile: kartu ── */}
                    <ul className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {rows.length > 0 ? (
                            rows.map((p) => (
                                <li key={p.nip} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-snug">
                                                {p.nama_lengkap}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                                NIP {p.nip}
                                            </p>
                                        </div>
                                        <JenisKelaminBadge nilai={p.jenis_kelamin} />
                                    </div>

                                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                        <p className="font-semibold">{p.jabatan || "-"}</p>
                                        <p className="flex items-center gap-1.5 truncate">
                                            <FiMail className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                                            {p.email || "-"}
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                            <FiPhone className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                                            {p.no_hp || "-"}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => bukaModalEdit(p)}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-11 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-sm font-semibold active:bg-blue-50 dark:active:bg-blue-950 transition"
                                        >
                                            <FiEdit2 className="h-4 w-4" aria-hidden="true" />
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => hapus(p)}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-11 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm font-semibold active:bg-rose-50 dark:active:bg-rose-950 transition"
                                        >
                                            <FiTrash2 className="h-4 w-4" aria-hidden="true" />
                                            Hapus
                                        </button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="py-12 px-4 text-center text-sm text-slate-400">
                                Belum ada data guru yang ditemukan.
                            </li>
                        )}
                    </ul>

                    {/* ── Tablet/Laptop: tabel ── */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    <th className="py-3 px-4">Nama Lengkap</th>
                                    <th className="py-3 px-4">NIP</th>
                                    <th className="py-3 px-4">Jabatan</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">No. Telepon</th>
                                    <th className="py-3 px-4">Jenis Kelamin</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rows.length > 0 ? (
                                    rows.map((p) => (
                                        <tr
                                            key={p.nip}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                        >
                                            <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-white">
                                                {p.nama_lengkap}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {p.nip}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                                {p.jabatan || "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 break-all">
                                                {p.email || "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs whitespace-nowrap">
                                                {p.no_hp || "-"}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <JenisKelaminBadge nilai={p.jenis_kelamin} />
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => bukaModalEdit(p)}
                                                        className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 transition"
                                                        aria-label={`Edit data ${p.nama_lengkap}`}
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => hapus(p)}
                                                        className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                                                        aria-label={`Hapus data ${p.nama_lengkap}`}
                                                        title="Hapus"
                                                    >
                                                        <FiTrash2 className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                                            Belum ada data guru yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {daftarPegawai.links && daftarPegawai.links.length > 3 && (
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                                Menampilkan {jumlahTampil} dari {daftarPegawai.total} guru
                            </p>

                            <nav className="flex items-center justify-center gap-1" aria-label="Navigasi halaman">
                                {daftarPegawai.links.map((link, idx) => {
                                    const pertama = idx === 0;
                                    const terakhir = idx === daftarPegawai.links.length - 1;
                                    const label = link.label
                                        .replace("&laquo;", "")
                                        .replace("&raquo;", "")
                                        .trim();

                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url &&
                                                router.get(link.url, {}, { preserveState: true, replace: true })
                                            }
                                            aria-label={
                                                pertama ? "Halaman sebelumnya" : terakhir ? "Halaman berikutnya" : `Halaman ${label}`
                                            }
                                            aria-current={link.active ? "page" : undefined}
                                            className={`inline-flex items-center justify-center min-h-10 min-w-10 px-3 rounded-xl text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${
                                                link.active
                                                    ? "bg-blue-800 text-white"
                                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            }`}
                                        >
                                            {pertama ? (
                                                <FiChevronLeft className="h-4 w-4" aria-hidden="true" />
                                            ) : terakhir ? (
                                                <FiChevronRight className="h-4 w-4" aria-hidden="true" />
                                            ) : (
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah / Edit Guru */}
            {modalBuka && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <FiUserCheck className="text-blue-800 dark:text-blue-400" aria-hidden="true" />
                                {editData ? "Edit Data Guru" : "Tambah Guru Baru"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setModalBuka(false)}
                                className="p-2 -mr-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                aria-label="Tutup formulir"
                            >
                                <FiX className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>

                        <form onSubmit={simpan} className="p-4 space-y-3">
                            <div>
                                <label htmlFor="nip" className={LABEL_CLASS}>
                                    NIP (Nomor Induk Pegawai)
                                </label>
                                <input
                                    id="nip"
                                    type="text"
                                    inputMode="numeric"
                                    disabled={!!editData}
                                    value={form.data.nip}
                                    onChange={(e) => form.setData("nip", e.target.value.replace(/\D/g, ""))}
                                    placeholder="Contoh: 199002022020011002"
                                    className={`${INPUT_CLASS} disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-500`}
                                />
                                {form.errors.nip && (
                                    <p className="text-rose-500 text-xs mt-1">{form.errors.nip}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="nama_lengkap" className={LABEL_CLASS}>
                                    Nama Lengkap Beserta Gelar
                                </label>
                                <input
                                    id="nama_lengkap"
                                    type="text"
                                    value={form.data.nama_lengkap}
                                    onChange={(e) => form.setData("nama_lengkap", e.target.value)}
                                    placeholder="Contoh: Drs. Surya Sugiri, M.Pd"
                                    className={INPUT_CLASS}
                                />
                                {form.errors.nama_lengkap && (
                                    <p className="text-rose-500 text-xs mt-1">{form.errors.nama_lengkap}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="jabatan" className={LABEL_CLASS}>
                                        Jabatan / Peran
                                    </label>
                                    <input
                                        id="jabatan"
                                        type="text"
                                        value={form.data.jabatan}
                                        onChange={(e) => form.setData("jabatan", e.target.value)}
                                        placeholder="Guru Produktif TKJ"
                                        className={INPUT_CLASS}
                                    />
                                    {form.errors.jabatan && (
                                        <p className="text-rose-500 text-xs mt-1">{form.errors.jabatan}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="jenis_kelamin" className={LABEL_CLASS}>
                                        Jenis Kelamin
                                    </label>
                                    <select
                                        id="jenis_kelamin"
                                        value={form.data.jenis_kelamin}
                                        onChange={(e) => form.setData("jenis_kelamin", e.target.value)}
                                        className={INPUT_CLASS}
                                    >
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                    {form.errors.jenis_kelamin && (
                                        <p className="text-rose-500 text-xs mt-1">{form.errors.jenis_kelamin}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="email" className={LABEL_CLASS}>
                                        Alamat Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData("email", e.target.value)}
                                        placeholder="guru@smkpbb.sch.id"
                                        className={INPUT_CLASS}
                                    />
                                    {form.errors.email && (
                                        <p className="text-rose-500 text-xs mt-1">{form.errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="no_hp" className={LABEL_CLASS}>
                                        No. WhatsApp / HP
                                    </label>
                                    <input
                                        id="no_hp"
                                        type="tel"
                                        inputMode="numeric"
                                        value={form.data.no_hp}
                                        onChange={(e) => form.setData("no_hp", e.target.value.replace(/\D/g, ""))}
                                        placeholder="081234567890"
                                        className={INPUT_CLASS}
                                    />
                                    {form.errors.no_hp && (
                                        <p className="text-rose-500 text-xs mt-1">{form.errors.no_hp}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className={LABEL_CLASS}>
                                    {editData ? "Password Baru (Kosongkan bila tidak diubah)" : "Password Akun"}
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData("password", e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    className={INPUT_CLASS}
                                />
                                {form.errors.password && (
                                    <p className="text-rose-500 text-xs mt-1">{form.errors.password}</p>
                                )}
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setModalBuka(false)}
                                    className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold transition disabled:opacity-60"
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

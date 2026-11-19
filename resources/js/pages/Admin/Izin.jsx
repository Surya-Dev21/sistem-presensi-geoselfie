import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    FiCheckCircle,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiFileText,
    FiInbox,
    FiPaperclip,
    FiSearch,
    FiXCircle,
} from 'react-icons/fi';
import AdminLayout from '@/components/admin-layout';
import { confirmAction, swalBase, toastSuccess } from '@/lib/swal';
import Swal from 'sweetalert2';

const STATUS_BADGE = {
    Menunggu:
        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    Disetujui:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
    Ditolak:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900',
};

const TABS = [
    { key: 'pending', label: 'Menunggu' },
    { key: 'approved', label: 'Disetujui' },
    { key: 'rejected', label: 'Ditolak' },
    { key: 'all', label: 'Semua' },
];

const fmtTanggal = (nilai) => {
    if (!nilai) return '-';
    const d = new Date(`${nilai}`.substring(0, 10) + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return nilai;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const labelHalaman = (label) =>
    label.replace('&laquo;', '«').replace('&raquo;', '»');

export default function IzinAdmin({ daftarIzin, filter = {}, statistik = {} }) {
    const [cari, setCari] = useState(filter?.cari ?? '');

    const gantiFilter = (status) => {
        router.get(
            '/admin/izin',
            { status, cari: filter?.cari ?? '' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const submitCari = (e) => {
        e.preventDefault();
        router.get(
            '/admin/izin',
            { status: filter?.status ?? 'pending', cari },
            { preserveState: true, preserveScroll: true }
        );
    };

    const setujui = async (item) => {
        const ok = await confirmAction({
            title: 'Setujui pengajuan?',
            text: `${item.nama} · ${item.jenis} · ${item.tgl_mulai} s/d ${item.tgl_selesai}`,
            confirmText: 'Setujui',
        });
        if (!ok) return;

        router.patch(
            `/admin/izin/${item.id}`,
            { status_approval: 'approved' },
            {
                preserveScroll: true,
                onSuccess: () => toastSuccess('Pengajuan disetujui'),
            }
        );
    };

    const tolak = async (item) => {
        const { value, isConfirmed } = await Swal.fire({
            ...swalBase(),
            title: 'Tolak pengajuan?',
            input: 'textarea',
            inputLabel: 'Alasan penolakan (wajib, min. 5 karakter)',
            inputPlaceholder:
                'Contoh: bukti tidak jelas, tanggal bentrok dengan jadwal mengajar...',
            showCancelButton: true,
            confirmButtonText: 'Tolak pengajuan',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#e11d48',
            reverseButtons: true,
            inputValidator: (v) =>
                !v || v.trim().length < 5 ? 'Alasan minimal 5 karakter.' : undefined,
        });
        if (!isConfirmed) return;

        router.patch(
            `/admin/izin/${item.id}`,
            { status_approval: 'rejected', catatan_admin: value.trim() },
            {
                preserveScroll: true,
                onSuccess: () => toastSuccess('Pengajuan ditolak'),
            }
        );
    };

    const kartu = [
        { key: 'pending', label: 'Menunggu', value: statistik?.pending ?? 0, Icon: FiClock, warna: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
        { key: 'approved', label: 'Disetujui', value: statistik?.approved ?? 0, Icon: FiCheckCircle, warna: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950' },
        { key: 'rejected', label: 'Ditolak', value: statistik?.rejected ?? 0, Icon: FiXCircle, warna: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950' },
    ];

    const data = daftarIzin?.data ?? [];

    return (
        <AdminLayout title="Validasi Pengajuan Izin">
            <Head title="Validasi Izin - SIPRES Guru Admin" />

            <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white">
                    Validasi Pengajuan Izin
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tinjau pengajuan izin/sakit guru, lalu setujui atau tolak dengan alasan yang jelas.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {kartu.map(({ key, label, value, Icon, warna, bg }) => (
                    <div
                        key={key}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3"
                    >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${bg} ${warna}`}>
                            <Icon aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {label}
                            </p>
                            <p className={`text-lg font-black leading-tight ${warna}`}>
                                {value} <span className="text-[10px] font-medium text-slate-500">Pengajuan</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter status pengajuan">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            role="tab"
                            aria-selected={(filter?.status ?? 'pending') === t.key}
                            onClick={() => gantiFilter(t.key)}
                            className={`px-3 h-8 rounded-xl text-[11px] font-bold border transition ${
                                (filter?.status ?? 'pending') === t.key
                                    ? 'bg-blue-800 text-white border-blue-800'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={submitCari} className="flex gap-2">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                        <input
                            type="search"
                            value={cari}
                            onChange={(e) => setCari(e.target.value)}
                            placeholder="Cari nama guru..."
                            aria-label="Cari nama guru"
                            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-800 dark:focus:border-blue-400 focus:ring-0 outline-none transition"
                        />
                    </div>
                    <button
                        type="submit"
                        className="h-10 px-3.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition"
                    >
                        Cari
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                {data.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                        <FiInbox className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Tidak ada pengajuan pada filter ini.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* DESKTOP */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <th scope="col" className="py-3 px-4">Guru</th>
                                        <th scope="col" className="py-3 px-4">Jenis</th>
                                        <th scope="col" className="py-3 px-4">Tanggal</th>
                                        <th scope="col" className="py-3 px-4">Diajukan</th>
                                        <th scope="col" className="py-3 px-4">Status</th>
                                        <th scope="col" className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition align-top">
                                            <td className="py-3 px-4">
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.nama}</p>
                                                <p className="text-[10px] text-slate-400">{item.jabatan ?? item.nip}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[260px] line-clamp-2">
                                                    {item.keterangan}
                                                </p>
                                                {item.bukti_url && (
                                                    <a
                                                        href={item.bukti_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:underline"
                                                    >
                                                        <FiPaperclip className="h-3 w-3" aria-hidden="true" />
                                                        Lihat bukti
                                                    </a>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                {item.jenis}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                                                {fmtTanggal(item.tgl_mulai)}
                                                <span className="block text-[10px] text-slate-400">
                                                    s/d {fmtTanggal(item.tgl_selesai)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-[11px] text-slate-500 dark:text-slate-400">
                                                {item.diajukan ?? '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE[item.status] ?? STATUS_BADGE.Menunggu}`}>
                                                    {item.status}
                                                </span>
                                                {item.catatan_admin && (
                                                    <p className="mt-1 text-[10px] text-rose-600 dark:text-rose-300 max-w-[180px]">
                                                        {item.catatan_admin}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {item.status_approval === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setujui(item)}
                                                            className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => tolak(item)}
                                                            className="h-8 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-[10px] font-bold transition"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-right text-[10px] text-slate-400">Sudah diproses</p>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE */}
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                            {data.map((item) => (
                                <div key={item.id} className="p-3.5 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.nama}</p>
                                            <p className="text-[10px] text-slate-400">{item.jabatan ?? item.nip}</p>
                                        </div>
                                        <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE[item.status] ?? STATUS_BADGE.Menunggu}`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 inline-flex items-center gap-1.5">
                                        <FiFileText className="h-3 w-3 text-blue-700 dark:text-blue-300" aria-hidden="true" />
                                        {item.jenis} · {fmtTanggal(item.tgl_mulai)} – {fmtTanggal(item.tgl_selesai)}
                                    </p>

                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{item.keterangan}</p>

                                    {item.catatan_admin && (
                                        <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-2.5">
                                            <p className="text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-300">Catatan admin</p>
                                            <p className="text-[11px] text-rose-700 dark:text-rose-200">{item.catatan_admin}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between gap-2 pt-0.5">
                                        <span className="text-[10px] text-slate-400">{item.diajukan ?? ''}</span>
                                        <div className="flex items-center gap-2">
                                            {item.bukti_url && (
                                                <a
                                                    href={item.bukti_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:underline"
                                                >
                                                    Lihat bukti
                                                </a>
                                            )}
                                            {item.status_approval === 'pending' && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setujui(item)}
                                                        className="h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition"
                                                    >
                                                        Setujui
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => tolak(item)}
                                                        className="h-9 px-3 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-[11px] font-bold transition"
                                                    >
                                                        Tolak
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* PAGINASI */}
            {daftarIzin?.links && daftarIzin.links.length > 3 && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Menampilkan {daftarIzin.from ?? 0}–{daftarIzin.to ?? 0} dari {daftarIzin.total ?? 0} pengajuan
                    </p>
                    <div className="flex items-center gap-1">
                        {daftarIzin.links.map((link, i) => {
                            const label = labelHalaman(link.label);
                            const isPrev = label.includes('«');
                            const isNext = label.includes('»');

                            if (!link.url) {
                                return (
                                    <span
                                        key={i}
                                        className="h-8 min-w-8 px-2 rounded-lg flex items-center justify-center text-[11px] font-bold text-slate-300 dark:text-slate-600"
                                        aria-disabled="true"
                                    >
                                        {isPrev ? <FiChevronLeft className="h-4 w-4" /> : isNext ? <FiChevronRight className="h-4 w-4" /> : label}
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={i}
                                    href={link.url}
                                    preserveScroll
                                    className={`h-8 min-w-8 px-2 rounded-lg flex items-center justify-center text-[11px] font-bold border transition ${
                                        link.active
                                            ? 'bg-blue-800 text-white border-blue-800'
                                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {isPrev ? <FiChevronLeft className="h-4 w-4" /> : isNext ? <FiChevronRight className="h-4 w-4" /> : label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

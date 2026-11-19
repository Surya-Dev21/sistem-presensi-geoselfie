import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    FiAlertTriangle,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiFileText,
    FiPaperclip,
    FiSend,
    FiUploadCloud,
    FiX,
    FiXCircle,
} from 'react-icons/fi';
import GuruLayout from '@/components/guru-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { confirmAction, toastError, toastSuccess } from '@/lib/swal';

const STATUS = {
    Menunggu:
        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    Disetujui:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
    Ditolak:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900',
};

const STATUS_ICON = {
    Menunggu: FiClock,
    Disetujui: FiCheckCircle,
    Ditolak: FiXCircle,
};

const fmtTanggal = (nilai) => {
    if (!nilai) return '-';
    const d = new Date(`${nilai}`.substring(0, 10) + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return nilai;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const hitungDurasi = (mulai, selesai) => {
    if (!mulai || !selesai) return 0;
    const a = new Date(`${mulai}T00:00:00`);
    const b = new Date(`${selesai}T00:00:00`);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
    return Math.max(1, Math.round((b - a) / 86400000) + 1);
};

const MAX_FILE = 2048; // KB
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'pdf'];

export default function Izin({ riwayatIzin = [] }) {
    const { notifikasiIzin = [] } = usePage().props;
    const [namaFile, setNamaFile] = useState('');
    const errorRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        jenis_izin: 'Izin',
        tgl_mulai: '',
        tgl_selesai: '',
        alasan: '',
        dokumen: null,
    });

    const minDate = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
            now.getDate(),
        ).padStart(2, '0')}`;
    }, []);

    const durasi = hitungDurasi(data.tgl_mulai, data.tgl_selesai);
    const jumlahMenunggu = riwayatIzin.filter((i) => i.status === 'Menunggu').length;
    const adaError = Object.keys(errors).length > 0;

    // Fokuskan ringkasan error saat validasi server gagal
    useEffect(() => {
        if (adaError) errorRef.current?.focus();
    }, [adaError]);

    // Toast sekali per keputusan (dedupe pakai sessionStorage)
    useEffect(() => {
        notifikasiIzin.forEach((n) => {
            const key = `izin-notif-${n.id}`;
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, '1');

            if (n.status === 'Disetujui') {
                toastSuccess(`Pengajuan ${n.jenis} disetujui`);
            } else {
                toastError(`Pengajuan ${n.jenis} ditolak${n.catatan ? ': ' + n.catatan : ''}`);
            }
        });
    }, [notifikasiIzin]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ALLOWED_EXT.includes(ext)) {
            toastError('Format file harus JPG, PNG, atau PDF.');
            e.target.value = '';
            return;
        }

        if (file.size > MAX_FILE * 1024) {
            toastError('Ukuran file maksimal 2 MB.');
            e.target.value = '';
            return;
        }

        setNamaFile(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        setData('dokumen', file);
    };

    const hapusFile = () => {
        setNamaFile('');
        setData('dokumen', null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const ok = await confirmAction({
            title: 'Kirim pengajuan?',
            text: `Pengajuan ${data.jenis_izin} akan dikirim ke admin untuk divalidasi.`,
            confirmText: 'Kirim sekarang',
        });
        if (!ok) return;

        post('/izin', {
            preserveScroll: true,
            onSuccess: () => {
                toastSuccess('Pengajuan berhasil dikirim');
                reset();
                setNamaFile('');
            },
        });
    };

    const handleBatal = async (item) => {
        const ok = await confirmAction({
            title: 'Batalkan pengajuan?',
            text: 'Pengajuan yang dibatalkan tidak dapat dikembalikan.',
            confirmText: 'Ya, batalkan',
            danger: true,
        });
        if (!ok) return;

        router.delete(`/izin/${item.id}`, {
            preserveScroll: true,
            onSuccess: () => toastSuccess('Pengajuan dibatalkan'),
        });
    };

    const inputClass =
        'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium py-2.5 px-3 text-slate-900 dark:text-slate-100 transition focus:border-blue-800 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none';
    const labelClass =
        'block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5';

    return (
        <GuruLayout title="Pengajuan Izin">
            <Head title="Pengajuan Izin - Portal SIPRES Guru" />

            <div className="max-w-6xl mx-auto space-y-3.5">
                {/* HERO */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4.5 sm:p-5 shadow-sm border border-blue-800">
                    <div className="relative z-10 space-y-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/15 text-blue-100">
                            Pengajuan Izin &amp; Sakit
                        </span>
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                            Ajukan Izin &amp; Pantau Validasi
                        </h2>
                        <p className="text-[11px] sm:text-xs text-blue-100 max-w-xl">
                            Kirim permohonan izin/sakit beserta bukti, lalu pantau keputusan admin di sini.
                        </p>
                    </div>
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white">
                        <FiClock className="h-3 w-3" aria-hidden="true" />
                        {jumlahMenunggu} menunggu validasi
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                    {/* ================= FORM ================= */}
                    <div className="lg:col-span-7">
                        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <FiFileText className="text-blue-700 dark:text-blue-300" aria-hidden="true" />
                                    Formulir Permohonan
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-4 pt-2">
                                {adaError && (
                                    <div
                                        role="alert"
                                        tabIndex={-1}
                                        ref={errorRef}
                                        className="mb-3 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/50 dark:border-rose-900 p-3 outline-none"
                                    >
                                        <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                                            Periksa kembali isian Anda
                                        </p>
                                        <ul className="mt-1 list-disc list-inside text-[11px] text-rose-600 dark:text-rose-300 space-y-0.5">
                                            {Object.values(errors).map((msg, i) => (
                                                <li key={i}>{msg}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-3.5">
                                    {/* Jenis */}
                                    <div>
                                        <span className={labelClass}>Jenis Permohonan</span>
                                        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Jenis permohonan">
                                            {['Izin', 'Sakit'].map((j) => (
                                                <label
                                                    key={j}
                                                    className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition ${
                                                        data.jenis_izin === j
                                                            ? 'border-blue-800 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-700'
                                                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="jenis_izin"
                                                        value={j}
                                                        checked={data.jenis_izin === j}
                                                        onChange={() => setData('jenis_izin', j)}
                                                        className="accent-blue-800"
                                                    />
                                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                        {j}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.jenis_izin && (
                                            <p id="err-jenis_izin" className="text-xs text-rose-500 mt-1">
                                                {errors.jenis_izin}
                                            </p>
                                        )}
                                    </div>

                                    {/* Tanggal */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor="tgl_mulai" className={labelClass}>
                                                Tanggal Mulai
                                            </label>
                                            <input
                                                id="tgl_mulai"
                                                type="date"
                                                value={data.tgl_mulai}
                                                min={minDate}
                                                onChange={(e) => setData('tgl_mulai', e.target.value)}
                                                required
                                                aria-invalid={!!errors.tgl_mulai}
                                                aria-describedby={errors.tgl_mulai ? 'err-tgl_mulai' : undefined}
                                                className={inputClass}
                                            />
                                            {errors.tgl_mulai && (
                                                <p id="err-tgl_mulai" className="text-xs text-rose-500 mt-1">
                                                    {errors.tgl_mulai}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="tgl_selesai" className={labelClass}>
                                                Tanggal Selesai
                                            </label>
                                            <input
                                                id="tgl_selesai"
                                                type="date"
                                                value={data.tgl_selesai}
                                                min={data.tgl_mulai || minDate}
                                                onChange={(e) => setData('tgl_selesai', e.target.value)}
                                                required
                                                aria-invalid={!!errors.tgl_selesai}
                                                aria-describedby={errors.tgl_selesai ? 'err-tgl_selesai' : undefined}
                                                className={inputClass}
                                            />
                                            {errors.tgl_selesai && (
                                                <p id="err-tgl_selesai" className="text-xs text-rose-500 mt-1">
                                                    {errors.tgl_selesai}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {durasi > 0 && (
                                        <p className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 inline-flex items-center gap-1">
                                            <FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                                            Durasi: {durasi} hari
                                        </p>
                                    )}

                                    {/* Alasan */}
                                    <div>
                                        <label htmlFor="alasan" className={labelClass}>
                                            Keterangan / Alasan
                                        </label>
                                        <textarea
                                            id="alasan"
                                            rows="3"
                                            maxLength={500}
                                            value={data.alasan}
                                            onChange={(e) => setData('alasan', e.target.value)}
                                            placeholder="Jelaskan alasan izin Anda secara singkat dan jelas..."
                                            required
                                            aria-invalid={!!errors.alasan}
                                            aria-describedby={errors.alasan ? 'err-alasan' : undefined}
                                            className={inputClass}
                                        />
                                        <div className="flex justify-between mt-1">
                                            {errors.alasan ? (
                                                <p id="err-alasan" className="text-xs text-rose-500">
                                                    {errors.alasan}
                                                </p>
                                            ) : (
                                                <span />
                                            )}
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                                                {data.alasan.length}/500
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bukti */}
                                    <div>
                                        <span className={labelClass}>Bukti Dokumen (Opsional)</span>
                                        {namaFile ? (
                                            <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
                                                <span className="min-w-0 flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                                                    <FiPaperclip className="h-4 w-4 text-blue-700 dark:text-blue-300 shrink-0" aria-hidden="true" />
                                                    <span className="truncate">{namaFile}</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={hapusFile}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                                                    aria-label="Hapus file bukti"
                                                >
                                                    <FiX className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                                <FiUploadCloud className="text-slate-400 text-2xl mb-1" aria-hidden="true" />
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center">
                                                    Pilih foto surat atau PDF (maks. 2 MB)
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,application/pdf"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                        {errors.dokumen && (
                                            <p id="err-dokumen" className="text-xs text-rose-500 mt-1">
                                                {errors.dokumen}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full h-11 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl text-sm shadow-xs transition flex justify-center items-center gap-2 disabled:opacity-60"
                                    >
                                        <FiSend className="h-4 w-4" aria-hidden="true" />
                                        <span>{processing ? 'Mengirim...' : 'Kirim Permohonan'}</span>
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ================= RIWAYAT ================= */}
                    <div className="lg:col-span-5">
                        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col h-full">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <FiClock className="text-blue-700 dark:text-blue-300" aria-hidden="true" />
                                    Riwayat Pengajuan
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-4 pt-2 flex-1">
                                {riwayatIzin.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {riwayatIzin.map((item) => {
                                            const Icon = STATUS_ICON[item.status] ?? FiClock;
                                            const durasiItem = hitungDurasi(item.tgl_mulai, item.tgl_selesai);

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3 space-y-2"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                                                            <FiFileText className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" aria-hidden="true" />
                                                            {item.jenis_izin}
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                                STATUS[item.status] ?? STATUS.Menunggu
                                                            }`}
                                                        >
                                                            <Icon className="h-3 w-3" aria-hidden="true" />
                                                            {item.status}
                                                        </span>
                                                    </div>

                                                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 inline-flex items-center gap-1.5">
                                                        <FiCalendar className="h-3 w-3 text-slate-400" aria-hidden="true" />
                                                        {fmtTanggal(item.tgl_mulai)} &ndash; {fmtTanggal(item.tgl_selesai)}
                                                        {durasiItem > 0 && (
                                                            <span className="text-slate-400">({durasiItem} hari)</span>
                                                        )}
                                                    </p>

                                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                                                        {item.alasan}
                                                    </p>

                                                    {item.catatan_admin && (
                                                        <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-2.5">
                                                            <p className="text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-300">
                                                                Catatan admin
                                                            </p>
                                                            <p className="text-[11px] text-rose-700 dark:text-rose-200">
                                                                {item.catatan_admin}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between gap-2 pt-0.5">
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                                            {item.diajukan ? `Diajukan ${item.diajukan}` : ''}
                                                        </span>

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
                                                            {item.status === 'Menunggu' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleBatal(item)}
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900 px-2 py-1 text-[10px] font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                                                                >
                                                                    <FiXCircle className="h-3 w-3" aria-hidden="true" />
                                                                    Batalkan
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-2">
                                        <FiAlertTriangle className="h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            Belum ada pengajuan.
                                        </p>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                            Ajukan izin atau sakit lewat formulir.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </GuruLayout>
    );
}

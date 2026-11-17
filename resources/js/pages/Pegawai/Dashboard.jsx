import React, { useState, useEffect } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    FiClock,
    FiCheckCircle,
    FiCamera,
    FiCalendar,
    FiFileText,
    FiUser,
    FiBookOpen,
    FiLogOut,
    FiArrowRight,
} from "react-icons/fi";

import GuruLayout from "@/components/guru-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dashboard({
    statusAbsen = { masuk: null, pulang: null },
    jadwalHariIni = [],
    jamAcuanMasuk = null,
}) {
    const { auth } = usePage().props;

    const user = auth?.user || {
        nama: "Guru / Pegawai",
        nip: "-",
    };

    const namaGuru = user.nama || user.name || "Guru";

    // Hindari perbedaan waktu saat SSR dan render awal di browser
    const [waktu, setWaktu] = useState(null);

    useEffect(() => {
        const updateWaktu = () => setWaktu(new Date());
        updateWaktu();
        const timer = setInterval(updateWaktu, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatJam = waktu
        ? waktu.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Jakarta",
        })
        : "--:--:--";

    const formatTanggal = waktu
        ? waktu.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
        })
        : "Memuat tanggal...";

    // Normalisasi data status absen
    const waktuMasuk = statusAbsen?.masuk || null;
    const waktuPulang = statusAbsen?.pulang || null;

    const adaWaktuMasuk =
        waktuMasuk !== null && waktuMasuk !== "" && waktuMasuk !== "-- : --";

    const adaWaktuPulang =
        waktuPulang !== null && waktuPulang !== "" && waktuPulang !== "-- : --";

    const belumMasuk = !adaWaktuMasuk;
    const sudahMasuk = adaWaktuMasuk && !adaWaktuPulang;
    const sudahSelesai = adaWaktuMasuk && adaWaktuPulang;

    const statusTeks = belumMasuk
        ? "Belum Presensi Masuk"
        : sudahMasuk
        ? "Sudah Presensi Masuk"
        : "Presensi Selesai";

    const statusWarna = belumMasuk
        ? "text-slate-800 dark:text-slate-100"
        : sudahMasuk
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400";

    const kartuWarna = belumMasuk
        ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        : sudahMasuk
        ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
        : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60";

    return (
        <GuruLayout title="Dashboard Guru">
            <Head title="Dashboard Guru - Portal SIMAG" />

            <div className="space-y-6">
                {/* HERO WELCOME BANNER */}
                <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-lg shadow-blue-600/15">
                    <div className="relative z-10 max-w-2xl space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-xs text-blue-100">
                            <span>Sistem Informasi Manajemen Guru</span>
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Selamat Datang, {namaGuru}!
                        </h2>
                        <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                            Pastikan Anda melakukan presensi geoselfie tepat waktu sesuai jadwal mengajar hari ini.
                        </p>
                    </div>
                    {/* Decorative Background Element */}
                    <div className="absolute -bottom-8 -right-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                </div>

                {/* GRID DUA KOLOM */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* KOLOM KIRI (JAM & STATUS ABSEN) */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* KARTU WAKTU */}
                        <Card className="rounded-3xl bg-linear-to-br from-blue-700 to-indigo-800 text-white shadow-md border-none overflow-hidden relative">
                            <CardContent className="p-6 relative z-10">
                                <FiClock className="absolute -bottom-2 -right-2 w-28 h-28 opacity-10 text-white" />

                                <p className="text-blue-200 text-xs font-medium mb-1 uppercase tracking-wider">
                                    Waktu Saat Ini (WIB)
                                </p>

                                <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-1 text-white">
                                    {formatJam}
                                </h3>

                                <p className="text-blue-200 text-xs font-medium pb-4 border-b border-white/20">
                                    {formatTanggal}
                                </p>

                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <span className="text-xs text-blue-100 font-medium">
                                        Acuan Masuk Hari Ini:
                                    </span>

                                    <Badge
                                        variant="secondary"
                                        className="bg-white/20 text-white border-none font-bold"
                                    >
                                        {jamAcuanMasuk || "07:00"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* KARTU STATUS PRESENSI */}
                        <Card className={`rounded-3xl border shadow-sm ${kartuWarna}`}>
                            <CardContent className="p-6 text-center space-y-5">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Status Presensi Anda
                                    </p>

                                    <h4 className={`text-xl font-black ${statusWarna}`}>
                                        {statusTeks}
                                    </h4>
                                </div>

                                {/* AKSI PRESENSI */}
                                {belumMasuk && (
                                    <Link
                                        href="/absensi?tipe=masuk"
                                        className="w-full h-12 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 text-base active:scale-95 transition-all"
                                    >
                                        <FiCamera className="w-5 h-5 mr-2" />
                                        Presensi Masuk
                                    </Link>
                                )}

                                {sudahMasuk && (
                                    <Link
                                        href="/absensi?tipe=pulang"
                                        className="w-full h-12 inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25 text-base active:scale-95 transition-all"
                                    >
                                        <FiLogOut className="w-5 h-5 mr-2" />
                                        Presensi Pulang
                                    </Link>
                                )}

                                {sudahSelesai && (
                                    <Button
                                        type="button"
                                        disabled
                                        className="w-full h-12 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded-2xl text-base opacity-100 cursor-not-allowed"
                                    >
                                        <FiCheckCircle className="mr-2 h-5 w-5" />
                                        Presensi Selesai
                                    </Button>
                                )}

                                {/* RINCIAN WAKTU MASUK / PULANG */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">
                                            Waktu Masuk
                                        </span>
                                        <span
                                            className={`text-sm font-black ${
                                                adaWaktuMasuk
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            {waktuMasuk || "-- : --"}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">
                                            Waktu Pulang
                                        </span>
                                        <span
                                            className={`text-sm font-black ${
                                                adaWaktuPulang
                                                    ? "text-amber-600 dark:text-amber-400"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            {waktuPulang || "-- : --"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* KOLOM KANAN (JADWAL MENGAJAR & QUICK ACTIONS) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* JADWAL MENGAJAR */}
                        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <FiBookOpen className="text-blue-600 dark:text-blue-400" />
                                    Jadwal Mengajar Hari Ini
                                </CardTitle>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Jadwal mengajar resmi guru yang telah ditentukan oleh pihak sekolah.
                                </p>
                            </CardHeader>

                            <CardContent className="p-6 pt-4">
                                {jadwalHariIni && jadwalHariIni.length > 0 ? (
                                    <div className="space-y-3">
                                        {jadwalHariIni.map((sesi, index) => (
                                            <div
                                                key={
                                                    sesi.id ??
                                                    `${sesi.jam_mulai}-${sesi.kelas}-${index}`
                                                }
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-blue-50/50 dark:hover:bg-slate-800 transition"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center min-w-[76px] shadow-2xs">
                                                        <span className="block text-sm font-black">
                                                            {sesi.jam_mulai || "--:--"}
                                                        </span>
                                                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                            s/d {sesi.jam_selesai || "--:--"}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                            {sesi.mata_pelajaran || "Mata Pelajaran"}
                                                        </h5>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                            Kelas {sesi.kelas || "-"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {index === 0 && (
                                                    <Badge className="self-start sm:self-auto bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-none font-bold shadow-none text-[10px]">
                                                        Sesi Pertama
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                        <FiCalendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            Tidak Ada Jadwal Mengajar Hari Ini
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                            Anda tidak memiliki jadwal mengajar terdaftar pada hari ini.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* MENU LAYANAN SINGKAT */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Link
                                href="/kalender"
                                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <FiCalendar className="h-5 w-5" />
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                                        Riwayat Presensi
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Lihat rekapan kalender kehadiran harian.
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                                    <span>Buka Kalender</span>
                                    <FiArrowRight className="ml-1 h-3.5 w-3.5" />
                                </div>
                            </Link>

                            <Link
                                href="/izin"
                                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                        <FiFileText className="h-5 w-5" />
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                                        Pengajuan Izin
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Form permohonan izin atau sakit.
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                                    <span>Ajukan Izin</span>
                                    <FiArrowRight className="ml-1 h-3.5 w-3.5" />
                                </div>
                            </Link>

                            <Link
                                href="/profil"
                                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <FiUser className="h-5 w-5" />
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                                        Profil Akun
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Kelola email & ganti password akun.
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                                    <span>Edit Profil</span>
                                    <FiArrowRight className="ml-1 h-3.5 w-3.5" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </GuruLayout>
    );
}

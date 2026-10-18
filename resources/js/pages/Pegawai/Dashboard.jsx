// TES-123-AJKA
import React, { useState, useEffect } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import {
    FiLogOut,
    FiClock,
    FiCheckCircle,
    FiCamera,
    FiCalendar,
    FiFileText,
    FiUser,
    FiBookOpen,
} from "react-icons/fi";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dashboard({
    statusAbsen = { masuk: null, pulang: null },
    jadwalHariIni = [],
    jamAcuanMasuk = null,
}) {
    const { flash, auth } = usePage().props;

    const user = auth?.user || {
        nama: "Guru / Pegawai",
        nip: "NIP Tidak Tersedia",
    };

    // Hindari perbedaan waktu saat SSR dan browser melakukan render.
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

    // Normalisasi data waktu dari backend.
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
        ? "text-slate-800"
        : sudahMasuk
        ? "text-amber-700"
        : "text-emerald-700";

    const kartuWarna = belumMasuk
        ? "bg-white border-slate-200"
        : sudahMasuk
        ? "bg-amber-50/50 border-amber-200"
        : "bg-emerald-50/50 border-emerald-200";

    const handleLogout = () => {
        router.post("/logout");
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <Head title="Dashboard Guru" />

            {/* HEADER */}
            <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                                🏫
                            </div>

                            <div>
                                <span className="font-extrabold text-lg text-slate-800 tracking-tight block leading-none">
                                    SIMAGGGG
                                </span>
                                <div style={{ color: "red", fontSize: "24px" }}> TES-SIMAG-98765</div>
                                <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                                    SMK Pembangunan Bandung Barat
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-800">
                                    {user.nama || user.name || "Guru / Pegawai"}
                                </p>

                                <p className="text-xs text-slate-500">
                                    NIP. {user.nip || "-"}
                                </p>
                            </div>

                            {/* Satu tombol saja, tidak ada nested button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold rounded-xl"
                            >
                                <FiLogOut className="w-4 h-4 mr-1.5" />
                                Keluar
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                {/* NOTIFIKASI */}
                {flash?.success && (
                    <div
                        role="status"
                        className="mb-6 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3 text-sm font-semibold"
                    >
                        <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* KOLOM KIRI */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* KARTU WAKTU */}
                        <Card className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg border-none overflow-hidden relative">
                            <CardContent className="p-6 relative z-10">
                                <FiClock className="absolute -bottom-2 -right-2 w-24 h-24 opacity-10" />

                                <p className="text-blue-100 text-xs font-medium mb-1">
                                    Waktu Saat Ini (WIB)
                                </p>

                                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-1">
                                    {formatJam}
                                </h2>

                                <p className="text-blue-200 text-xs font-medium pb-4 border-b border-blue-400/30">
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
                                        {jamAcuanMasuk || "Belum ditentukan"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* KARTU STATUS PRESENSI */}
                        <Card
                            className={`rounded-3xl border shadow-sm ${kartuWarna}`}
                        >
                            <CardContent className="p-6 text-center space-y-5">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Status Presensi Anda
                                    </p>

                                    <h3
                                        className={`text-xl font-black ${statusWarna}`}
                                    >
                                        {statusTeks}
                                    </h3>
                                </div>

                                {/* AKSI PRESENSI */}
                                {belumMasuk && (
                                    <Link
                                        href="/absensi?tipe=masuk"
                                        className="w-full h-12 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg text-base active:scale-95 transition-transform"
                                    >
                                        <FiCamera className="w-5 h-5 mr-2" />
                                        Presensi Masuk
                                    </Link>
                                )}

                                {sudahMasuk && (
                                    <Link
                                        href="/absensi?tipe=pulang"
                                        className="w-full h-12 inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg text-base active:scale-95 transition-transform"
                                    >
                                        <FiLogOut className="w-5 h-5 mr-2" />
                                        Presensi Pulang
                                    </Link>
                                )}

                                {sudahSelesai && (
                                    <Button
                                        type="button"
                                        disabled
                                        className="w-full h-12 bg-emerald-100 text-emerald-700 font-bold rounded-2xl text-base opacity-100 cursor-not-allowed"
                                    >
                                        <FiCheckCircle className="mr-2" />
                                        Presensi Selesai
                                    </Button>
                                )}

                                {/* RINCIAN WAKTU */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">
                                            Waktu Masuk
                                        </span>

                                        <span
                                            className={`text-sm font-black ${
                                                adaWaktuMasuk
                                                    ? "text-emerald-600"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            {waktuMasuk || "-- : --"}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">
                                            Waktu Pulang
                                        </span>

                                        <span
                                            className={`text-sm font-black ${
                                                adaWaktuPulang
                                                    ? "text-amber-600"
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

                    {/* KOLOM KANAN */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* JADWAL MENGAJAR */}
                        <Card className="rounded-3xl border-slate-200 shadow-sm">
                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <FiBookOpen className="text-blue-600" />
                                    Jadwal Mengajar Hari Ini
                                </CardTitle>

                                <p className="text-xs text-slate-500 font-medium">
                                    Jadwal mengajar menjadi acuan kehadiran
                                    sesuai kebijakan sekolah.
                                </p>
                            </CardHeader>

                            <CardContent className="p-6 pt-4">
                                {jadwalHariIni.length > 0 ? (
                                    <div className="space-y-3">
                                        {jadwalHariIni.map((sesi, index) => (
                                            <div
                                                key={
                                                    sesi.id ??
                                                    `${sesi.jam_mulai}-${sesi.kelas}-${index}`
                                                }
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-blue-50/50 transition"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-white text-slate-700 p-2 rounded-xl border border-slate-200 text-center min-w-[70px]">
                                                        <span className="block text-sm font-black">
                                                            {sesi.jam_mulai ||
                                                                "--:--"}
                                                        </span>

                                                        <span className="block text-[10px] text-slate-500 mt-0.5">
                                                            s/d{" "}
                                                            {sesi.jam_selesai ||
                                                                "--:--"}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-800">
                                                            {sesi.mata_pelajaran ||
                                                                "Mata pelajaran"}
                                                        </h4>

                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            Kelas{" "}
                                                            {sesi.kelas || "-"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {index === 0 && (
                                                    <Badge className="self-start sm:self-auto bg-blue-100 text-blue-700 border-none font-bold hover:bg-blue-100 shadow-none text-[10px]">
                                                        Sesi Pertama
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <FiCalendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />

                                        <p className="text-sm font-bold text-slate-700">
                                            Tidak Ada Jadwal
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                            Anda tidak memiliki jadwal mengajar
                                            hari ini. Silakan ikuti kebijakan
                                            kehadiran yang berlaku di sekolah.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* MENU LAYANAN */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Link
                                href="/kalender"
                                className="group bg-white border border-slate-200 p-4 rounded-3xl hover:border-blue-300 hover:shadow-md transition"
                            >
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FiCalendar />
                                </div>

                                <h4 className="font-bold text-sm text-slate-800">
                                    Riwayat Presensi
                                </h4>

                                <p className="text-[10px] text-slate-500 mt-1">
                                    Pantau rekap kehadiran.
                                </p>
                            </Link>

                            <Link
                                href="/izin"
                                className="group bg-white border border-slate-200 p-4 rounded-3xl hover:border-amber-300 hover:shadow-md transition"
                            >
                                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                    <FiFileText />
                                </div>

                                <h4 className="font-bold text-sm text-slate-800">
                                    Pengajuan Izin
                                </h4>

                                <p className="text-[10px] text-slate-500 mt-1">
                                    Izin atau sakit.
                                </p>
                            </Link>

                            <Link
                                href="/profil"
                                className="group bg-white border border-slate-200 p-4 rounded-3xl hover:border-purple-300 hover:shadow-md transition"
                            >
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <FiUser />
                                </div>

                                <h4 className="font-bold text-sm text-slate-800">
                                    Profil Pegawai
                                </h4>

                                <p className="text-[10px] text-slate-500 mt-1">
                                    Ubah sandi dan data diri.
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

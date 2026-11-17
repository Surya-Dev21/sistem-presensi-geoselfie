import React, { useState, useEffect } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    FiClock,
    FiCheckCircle,
    FiCamera,
    FiCalendar,
    FiFileText,
    FiUser,
    FiArrowRight,
    FiAlertCircle,
    FiBookOpen,
    FiXCircle,
} from "react-icons/fi";
import GuruLayout from "@/components/guru-layout";

// ===== Helper =====
function sapaanGuru(nama, jk = "L") {
    if (!nama) return "Bapak/Ibu Guru";
    return `${jk === "P" ? "Ibu" : "Bapak"} ${nama}`;
}

export default function Dashboard({
    statusAbsen = { masuk: null, pulang: null },
    jadwalHariIni = [],
    jamAcuanMasuk = null,
}) {
    const { auth } = usePage().props;

    const user = auth?.user || { nama: "Guru / Pegawai", nip: "-", jabatan: "Guru", jenis_kelamin: "L" };
    const namaGuru = user.nama || user.name || "Guru";
    const jk = user.jenis_kelamin || "L";
    const sapaan = sapaanGuru(namaGuru, jk);

    // Jam real-time (hanya di client)
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

    // Status absen
    const waktuMasuk = statusAbsen?.masuk ?? null;
    const waktuPulang = statusAbsen?.pulang ?? null;
    const adaMasuk = waktuMasuk !== null && waktuMasuk !== "" && waktuMasuk !== "-- : --";
    const adaPulang = waktuPulang !== null && waktuPulang !== "" && waktuPulang !== "-- : --";
    const belumMasuk = !adaMasuk;
    const sudahMasuk = adaMasuk && !adaPulang;
    const sudahSelesai = adaMasuk && adaPulang;

    const statusTeks = belumMasuk
        ? "Belum Presensi Masuk"
        : sudahMasuk
        ? "Sudah Presensi Masuk"
        : "Presensi Selesai";

    // Quick actions
    const quickActions = [
        {
            href: "/absensi",
            icon: FiCamera,
            label: "Presensi Harian",
            desc: "Lakukan geoselfie masuk/pulang.",
            cta: "Buka Kamera",
        },
        {
            href: "/kalender",
            icon: FiCalendar,
            label: "Riwayat Presensi",
            desc: "Lihat rekapan kalender kehadiran.",
            cta: "Buka Kalender",
        },
        {
            href: "/izin",
            icon: FiFileText,
            label: "Pengajuan Izin",
            desc: "Form permohonan izin atau sakit.",
            cta: "Ajukan Izin",
        },
        {
            href: "/profil",
            icon: FiUser,
            label: "Profil Akun",
            desc: "Kelola email & ganti password.",
            cta: "Edit Profil",
        },
    ];

    return (
        <GuruLayout title="Dashboard Guru">
            <Head title="Dashboard Guru - Portal SIMAG" />

            <div className="space-y-4">
                {/* ===== HERO BANNER ===== */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8B1A1A] via-[#A52020] to-[#6B1414] text-white p-5 sm:p-6 shadow-lg">
                    <div className="relative z-10 max-w-2xl space-y-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/15 text-red-100">
                            Sistem Informasi Manajemen Guru
                        </span>
                        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
                            Selamat Datang, {sapaan}!
                        </h2>
                        <p className="text-xs text-red-100 leading-relaxed max-w-lg">
                            Pastikan presensi geoselfie dilakukan tepat waktu sesuai jadwal mengajar hari ini.
                        </p>
                    </div>
                    {/* Decorative */}
                    <div className="absolute -bottom-6 -right-6 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="absolute top-2 right-8 w-16 h-16 rounded-full bg-[#C8A951]/20 blur-xl pointer-events-none" />
                </div>

                {/* ===== GRID UTAMA ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* KOLOM KIRI: Jam & Status */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Kartu Jam */}
                        <div className="rounded-2xl bg-gradient-to-br from-[#8B1A1A] to-[#6B1414] text-white p-5 shadow-md">
                            <p className="text-[10px] font-semibold text-red-200 uppercase tracking-wider mb-1">
                                Waktu Sekarang
                            </p>
                            <p className="text-3xl font-black tracking-tight tabular-nums leading-none">
                                {formatJam}
                            </p>
                            <p className="text-xs text-red-200 mt-1.5 capitalize">{formatTanggal}</p>
                        </div>

                        {/* Acuan Masuk */}
                        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Acuan Jam Masuk Hari Ini
                            </p>
                            <div className="flex items-center gap-2">
                                <FiClock className="h-5 w-5 text-[#8B1A1A] flex-shrink-0" />
                                <p className="text-xl font-black text-[#8B1A1A] tabular-nums">
                                    {jamAcuanMasuk ?? "--:--"}
                                </p>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                                {jamAcuanMasuk
                                    ? "Berdasarkan jadwal mengajar pertama hari ini."
                                    : "Tidak ada jadwal mengajar hari ini."}
                            </p>
                        </div>

                        {/* Status Absen */}
                        <div
                            className={`rounded-2xl border p-4 shadow-sm ${
                                belumMasuk
                                    ? "bg-white border-slate-200"
                                    : sudahMasuk
                                    ? "bg-amber-50 border-amber-200"
                                    : "bg-green-50 border-green-200"
                            }`}
                        >
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Status Presensi
                            </p>
                            <div className="flex items-center gap-2">
                                {belumMasuk ? (
                                    <FiAlertCircle className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                ) : sudahMasuk ? (
                                    <FiCheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                ) : (
                                    <FiCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                )}
                                <span
                                    className={`text-sm font-bold ${
                                        belumMasuk
                                            ? "text-slate-600"
                                            : sudahMasuk
                                            ? "text-amber-700"
                                            : "text-green-700"
                                    }`}
                                >
                                    {statusTeks}
                                </span>
                            </div>
                            {adaMasuk && (
                                <div className="mt-3 space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Masuk</span>
                                        <span className="font-bold text-slate-800">{waktuMasuk}</span>
                                    </div>
                                    {adaPulang && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Pulang</span>
                                            <span className="font-bold text-slate-800">{waktuPulang}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CTA Presensi */}
                            {!sudahSelesai && (
                                <Link
                                    href="/absensi"
                                    className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold bg-[#8B1A1A] text-white hover:bg-[#6B1414] transition-colors"
                                >
                                    <FiCamera className="h-3.5 w-3.5" />
                                    {belumMasuk ? "Presensi Masuk" : "Presensi Pulang"}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* KOLOM KANAN: Jadwal + Quick Actions */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Jadwal Hari Ini */}
                        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <FiBookOpen className="h-4 w-4 text-[#8B1A1A]" />
                                <h3 className="text-sm font-bold text-slate-800">Jadwal Mengajar Hari Ini</h3>
                            </div>

                            {jadwalHariIni.length > 0 ? (
                                <div className="space-y-2">
                                    {jadwalHariIni.map((jadwal, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                                        >
                                            <div className="w-1.5 h-10 rounded-full bg-[#8B1A1A] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate">
                                                    {jadwal.mata_pelajaran}
                                                </p>
                                                <p className="text-[10px] text-slate-500 truncate">
                                                    Kelas {jadwal.kelas}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs font-bold text-[#8B1A1A] tabular-nums">
                                                    {jadwal.jam_mulai}
                                                </p>
                                                <p className="text-[10px] text-slate-400 tabular-nums">
                                                    s.d. {jadwal.jam_selesai}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <FiXCircle className="h-8 w-8 text-slate-300 mb-2" />
                                    <p className="text-xs font-semibold text-slate-500">
                                        Tidak ada jadwal mengajar hari ini
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Selamat menikmati hari libur!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 px-0.5">
                                Akses Cepat
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {quickActions.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="group bg-white border border-slate-200 p-3.5 rounded-2xl hover:border-[#8B1A1A] hover:shadow-md transition-all flex flex-col gap-2"
                                    >
                                        <div className="w-8 h-8 bg-red-50 text-[#8B1A1A] rounded-xl flex items-center justify-center group-hover:bg-[#8B1A1A] group-hover:text-white transition-colors">
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 leading-tight">
                                                {item.label}
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                                                {item.desc}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-semibold text-[#8B1A1A] group-hover:translate-x-0.5 transition-transform mt-auto">
                                            <span>{item.cta}</span>
                                            <FiArrowRight className="h-3 w-3" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuruLayout>
    );
}

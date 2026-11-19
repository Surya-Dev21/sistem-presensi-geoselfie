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

function sapaanGuru(nama, jk) {
    if (!nama) return "Bapak/Ibu Guru";
    if (jk === "P") return `Ibu ${nama}`;
    if (jk === "L" && !/(?:ibu|bu |nia|leni|wati|fitri|tri)/i.test(nama)) return `Bapak ${nama}`;
    const isPerempuan = /(?:ibu|bu |nia|leni|wati|fitri|tri|siti|ayu|nur|dewi|rahma|putri|mega)/i.test(nama)
        || /(?:a|i|ni|wi|tri|ty|tya|na|ma|lia|fia|zia|syah)$/i.test(nama.trim());
    return `${isPerempuan ? "Ibu" : "Bapak"} ${nama}`;
}

export default function Dashboard({
    statusAbsen = { masuk: null, pulang: null },
    jadwalHariIni = [],
    jamAcuanMasuk = null,
}) {
    const { auth } = usePage().props;

    const user = auth?.user || { nama: "Guru / Pegawai", nip: "-", jabatan: "Guru", jenis_kelamin: "L" };
    const namaGuru = user.nama || user.name || "Guru";
    const sapaan = sapaanGuru(namaGuru, user.jenis_kelamin);

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

    // Quick actions (palet putih & biru)
    const quickActions = [
        {
            href: "/absensi",
            icon: FiCamera,
            label: "Presensi Harian",
            desc: "Lakukan geoselfie masuk/pulang.",
        },
        {
            href: "/kalender",
            icon: FiCalendar,
            label: "Riwayat Presensi",
            desc: "Lihat rekapan kehadiran.",
        },
        {
            href: "/izin",
            icon: FiFileText,
            label: "Pengajuan Izin",
            desc: "Form permohonan izin/cuti.",
        },
        {
            href: "/profil",
            icon: FiUser,
            label: "Profil Akun",
            desc: "Kelola email & ganti password.",
        },
    ];

    return (
        <GuruLayout title="Dashboard Guru">
            <Head title="Dashboard Guru - Portal SIPRES Guru" />

            <div className="space-y-3.5">
                {/* ===== HERO BANNER: Biru tua elegan + Aksen Putih ===== */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4.5 sm:p-5 shadow-sm border border-blue-800">
                    <div className="relative z-10 max-w-2xl space-y-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/15 text-blue-100">
                            Sistem Informasi Presensi Guru
                        </span>
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                            Selamat Datang, {sapaan}!
                        </h2>
                        <p className="text-[11px] text-blue-100 leading-relaxed max-w-lg">
                            Pastikan presensi geoselfie dilakukan tepat waktu sesuai jadwal mengajar hari ini.
                        </p>
                    </div>
                    {/* Decorative glow putih transparan */}
                    <div className="absolute -bottom-6 -right-6 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                </div>

                {/* ===== GRID UTAMA ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                    {/* KOLOM KIRI: Jam & Status */}
                    <div className="lg:col-span-1 space-y-3">
                        {/* Kartu Jam (Biru Tua + Teks Putih) */}
                        <div className="rounded-2xl bg-blue-900 text-white p-4 shadow-xs">
                            <p className="text-[9px] font-semibold text-blue-200 uppercase tracking-wider mb-1">
                                Waktu Sekarang (WIB)
                            </p>
                            <p className="text-2xl sm:text-3xl font-black tracking-tight tabular-nums leading-none">
                                {formatJam}
                            </p>
                            <p className="text-[11px] text-blue-100 mt-1 capitalize">{formatTanggal}</p>
                        </div>

                        {/* Acuan Masuk */}
                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Acuan Jam Masuk Hari Ini
                            </p>
                            <div className="flex items-center gap-2">
                                <FiClock className="h-4 w-4 text-blue-800 flex-shrink-0" />
                                <p className="text-lg font-black text-blue-900 tabular-nums">
                                    {jamAcuanMasuk ?? "--:--"}
                                </p>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                                {jamAcuanMasuk
                                    ? "Berdasarkan sesi pertama jadwal hari ini."
                                    : "Tidak ada jadwal mengajar terdaftar hari ini."}
                            </p>
                        </div>

                        {/* Status Presensi: Putih & Biru (Bebas Kuning/Amber) */}
                        <div
                            className={`rounded-2xl border p-3.5 shadow-xs ${
                                belumMasuk
                                    ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                    : sudahMasuk
                                    ? "bg-blue-50 dark:bg-slate-900 border-blue-200 dark:border-blue-800"
                                    : "bg-slate-50 dark:bg-slate-900 border-blue-200 dark:border-blue-800"
                            }`}
                        >
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Status Presensi
                            </p>
                            <div className="flex items-center gap-2">
                                {belumMasuk ? (
                                    <FiAlertCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                ) : (
                                    <FiCheckCircle className="h-4 w-4 text-blue-700 flex-shrink-0" />
                                )}
                                <span
                                    className={`text-xs font-bold ${
                                        belumMasuk ? "text-slate-600" : "text-blue-900"
                                    }`}
                                >
                                    {statusTeks}
                                </span>
                            </div>

                            {adaMasuk && (
                                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700 space-y-1">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500">Masuk</span>
                                        <span className="font-bold text-blue-900">{waktuMasuk}</span>
                                    </div>
                                    {adaPulang && (
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Pulang</span>
                                            <span className="font-bold text-blue-900">{waktuPulang}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tombol CTA Presensi */}
                            {!sudahSelesai && (
                                <Link
                                    href="/absensi"
                                    className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold bg-blue-800 text-white hover:bg-blue-900 transition-colors shadow-xs"
                                >
                                    <FiCamera className="h-3.5 w-3.5" />
                                    <span>{belumMasuk ? "Presensi Masuk" : "Presensi Pulang"}</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* KOLOM KANAN: Jadwal + Quick Actions */}
                    <div className="lg:col-span-2 space-y-3">
                        {/* Jadwal Hari Ini */}
                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs">
                            <div className="flex items-center gap-2 mb-2.5">
                                <FiBookOpen className="h-4 w-4 text-blue-800" />
                                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                                    Jadwal Mengajar Hari Ini
                                </h3>
                            </div>

                            {jadwalHariIni.length > 0 ? (
                                <div className="space-y-1.5">
                                    {jadwalHariIni.map((jadwal, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-blue-50/60 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <div className="w-1.5 h-8 rounded-full bg-blue-800 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                                    {jadwal.mata_pelajaran}
                                                </p>
                                                <p className="text-[10px] text-slate-500 truncate">
                                                    Kelas {jadwal.kelas}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs font-bold text-blue-900 tabular-nums">
                                                    {jadwal.jam_mulai}
                                                </p>
                                                <p className="text-[9px] text-slate-400 tabular-nums">
                                                    s.d. {jadwal.jam_selesai}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-5 text-center">
                                    <FiXCircle className="h-7 w-7 text-slate-300 mb-1.5" />
                                    <p className="text-xs font-semibold text-slate-500">
                                        Tidak ada jadwal mengajar hari ini
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Selamat beristirahat atau persiapan mengajar berikutnya!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Akses Cepat */}
                        <div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-0.5">
                                Akses Cepat
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {quickActions.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl hover:border-blue-400 hover:shadow-sm transition-all flex flex-col gap-1.5"
                                    >
                                        <div className="w-7 h-7 bg-blue-50 text-blue-800 rounded-xl flex items-center justify-center group-hover:bg-blue-800 group-hover:text-white transition-colors">
                                            <item.icon className="h-3.5 w-3.5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-blue-800 transition-colors">
                                                {item.label}
                                            </p>
                                            <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight mt-0.5">
                                                {item.desc}
                                            </p>
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

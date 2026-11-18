import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import {
    FiHome,
    FiClock,
    FiCalendar,
    FiFileText,
    FiUser,
    FiLogOut,
    FiMenu,
    FiChevronDown,
    FiBell,
    FiSettings,
    FiCheckCircle,
    FiInfo,
} from "react-icons/fi";
import { FlashAlert } from "@/components/flash-alert";
import { ThemeToggle } from "@/components/theme-toggle";

const SCHOOL_LOGO = "/images/smkpbb.png";
const SCHOOL_ABBR = "SIMAG";
const SCHOOL_FULL = "SMK Pembangunan Bandung Barat";

interface GuruLayoutProps {
    children: React.ReactNode;
    title?: string;
}

type JK = "L" | "P";

function sapaan(nama?: string, jk?: JK): string {
    if (!nama) return "Bapak/Ibu Guru";
    // Jika jenis kelamin eksplisit ada, gunakan itu
    if (jk === "P") return `Ibu ${nama}`;
    if (jk === "L" && !/(?:ibu|bu |nia|leni|wati|fitri|tri)/i.test(nama)) return `Bapak ${nama}`;
    
    // Heuristik nama perempuan Indonesia (contoh: "Nina Leniawati", "Siti", "Tri", dsb.)
    // ponytail: heuristik sapaan nama; upgrade: simpan kolom jenis_kelamin di tabel pegawai
    const isPerempuan = /(?:ibu|bu |nia|leni|wati|fitri|tri|siti|ayu|nur|dewi|rahma|putri|mega)/i.test(nama)
        || /(?:a|i|ni|wi|tri|ty|tya|na|ma|lia|fia|zia|syah)$/i.test(nama.trim());
    return `${isPerempuan ? "Ibu" : "Bapak"} ${nama}`;
}

function initials(nama?: string): string {
    if (!nama) return "G";
    return nama
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
}

export default function GuruLayout({ children, title }: GuruLayoutProps) {
    const { auth, url, statusAbsen } = usePage().props as {
        auth?: {
            user?: {
                nama?: string;
                name?: string;
                nip?: string;
                email?: string;
                jabatan?: string;
                jenis_kelamin?: JK;
                foto?: string | null;
            };
        };
        url?: string;
        statusAbsen?: { sudah_masuk?: boolean; sudah_pulang?: boolean } | null;
    };

    // State buka/tutup sidebar — di mobile (overlay drawer) & di desktop (collapse/expand)
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    // Deteksi ukuran layar untuk auto-adjust default sidebar
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false); // default tutup di layar kecil
            } else {
                setSidebarOpen(true);  // default terbuka di layar desktop
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const user = auth?.user ?? { nama: "Guru", nip: "-", jabatan: "Guru", jenis_kelamin: "L" as JK };
    const nama = user.nama || user.name || "Guru";
    const sapa = sapaan(nama, user.jenis_kelamin);
    const jabatan = user.jabatan || "Guru Mapel";
    const inits = initials(nama);

    const path =
        typeof window !== "undefined"
            ? window.location.pathname
            : (url ?? "/dashboard");

    const navItems = [
        { label: "Dashboard",        href: "/dashboard",  Icon: FiHome,     active: path === "/dashboard" },
        { label: "Presensi Harian",  href: "/absensi",    Icon: FiClock,    active: path.startsWith("/absensi") },
        { label: "Riwayat Presensi", href: "/kalender",   Icon: FiCalendar, active: path.startsWith("/kalender") },
        { label: "Pengajuan Izin",   href: "/izin",       Icon: FiFileText, active: path.startsWith("/izin") },
        { label: "Profil Saya",      href: "/profil",     Icon: FiUser,     active: path.startsWith("/profil") },
    ];

    // Data notifikasi fungsional (status absen hari ini + pengingat sistem)
    const notifications = [
        {
            id: 1,
            title: statusAbsen?.sudah_masuk
                ? (statusAbsen?.sudah_pulang ? "Presensi Lengkap" : "Sudah Absen Masuk")
                : "Belum Melakukan Absen Masuk",
            desc: statusAbsen?.sudah_masuk
                ? (statusAbsen?.sudah_pulang ? "Kehadiran Anda hari ini telah tercatat lengkap." : "Jangan lupa presensi pulang saat sesi selesai.")
                : "Segera lakukan presensi geoselfie tepat waktu sesuai jadwal.",
            time: "Hari ini",
            type: statusAbsen?.sudah_masuk ? "success" : "info",
        },
        {
            id: 2,
            title: "Pengingat Jadwal",
            desc: "Pastikan perangkat mengaktifkan izin GPS akurat untuk validasi presensi.",
            time: "Sistem",
            type: "info",
        },
    ];

    const logout = () => {
        setDropdownOpen(false);
        router.post("/logout");
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col lg:flex-row text-slate-800 dark:text-slate-100">

            {/* ── BACKDROP MOBILE saat sidebar terbuka ── */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ════════════════════════════════════
                SIDEBAR (Bisa Dibuka/Tutup)
            ════════════════════════════════════ */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 flex flex-col
                    border-r border-slate-200 dark:border-slate-800 shadow-md
                    transition-all duration-300 ease-in-out
                    lg:static
                    ${isMobile
                        ? (sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64")
                        : (sidebarOpen ? "w-64" : "w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-r-0")
                    }
                `}
            >
                {/* ── LOGO AREA (Logo asli tanpa background) ── */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 bg-blue-900 text-white min-w-[256px]">
                    <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
                        {/* Logo sekolah asli transparan TANPA background tambahan */}
                        <img
                            src={SCHOOL_LOGO}
                            alt={SCHOOL_FULL}
                            className="w-9 h-9 object-contain flex-shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-black text-white tracking-widest leading-none">
                                {SCHOOL_ABBR}
                            </p>
                            <p className="text-[9px] text-blue-100 font-medium leading-tight truncate mt-0.5">
                                {SCHOOL_FULL}
                            </p>
                        </div>
                    </Link>
                </div>

                {/* ── NAVIGASI ── */}
                <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 min-w-[256px]">
                    <p className="mb-1.5 px-2.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        Menu Utama
                    </p>
                    {navItems.map(({ label, href, Icon, active }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => { if (isMobile) setSidebarOpen(false); }}
                            className={`
                                flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                                ${active
                                    ? "bg-blue-800 text-white shadow-xs"
                                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                }
                            `}
                        >
                            <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                            <span className="truncate">{label}</span>
                        </Link>
                    ))}
                </nav>

                {/* ── FOOTER SIDEBAR: info user ── */}
                <div className="border-t border-slate-200 dark:border-slate-800 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 min-w-[256px]">
                    <p className="text-[10px] text-slate-400 font-mono">NIP. {user.nip || "-"}</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{nama}</p>
                    <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 truncate">{jabatan}</p>
                </div>
            </aside>

            {/* ════════════════════════════════════
                AREA UTAMA
            ════════════════════════════════════ */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* ── HEADER ── */}
                <header className="sticky top-0 z-30 h-13 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs flex items-center px-3 sm:px-5 gap-2.5 sm:gap-3">

                    {/* Tombol Buka/Tutup Sidebar (aktif di mobile & desktop) */}
                    <button
                        onClick={() => setSidebarOpen((v) => !v)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-800 transition-colors flex-shrink-0"
                        aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
                        title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
                    >
                        <FiMenu className="h-5 w-5" />
                    </button>

                    {/* Judul halaman */}
                    <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-white truncate">
                        {title ?? "Portal Guru"}
                    </span>

                    <div className="flex-1" />

                    {/* Tema terang/gelap */}
                    <ThemeToggle className="h-8 w-8 p-0 flex items-center justify-center" />

                    {/* Lonceng Notifikasi Fungsional */}
                    <div className="relative">
                        <button
                            onClick={() => setNotifOpen((v) => !v)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-800 transition-colors relative"
                            title="Notifikasi"
                            aria-expanded={notifOpen}
                        >
                            <FiBell className="h-4.5 w-4.5" />
                            {/* Titik indikator notifikasi aktif */}
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                        </button>

                        {/* Dropdown Notifikasi */}
                        {notifOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} aria-hidden="true" />
                                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-20 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <p className="text-xs font-bold text-slate-800 dark:text-white">Notifikasi</p>
                                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                                            {notifications.length} Info
                                        </span>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto">
                                        {notifications.map((n) => (
                                            <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <div className="flex items-start gap-2">
                                                    {n.type === "success" ? (
                                                        <FiCheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                    ) : (
                                                        <FiInfo className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                                                            {n.title}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                                            {n.desc}
                                                        </p>
                                                        <span className="text-[9px] text-slate-400 mt-1 block">
                                                            {n.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Foto Bulat + Nama Guru + Mapel + Dropdown Keluar */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen((v) => !v)}
                            className="flex items-center gap-2 pl-1 pr-1.5 sm:pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
                            aria-expanded={dropdownOpen}
                        >
                            {/* Avatar bulat guru: foto jika ada, inisial jika belum */}
                            {user.foto ? (
                                <img
                                    src={user.foto}
                                    alt={sapa}
                                    className="h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-full object-cover ring-2 ring-blue-100 flex-shrink-0"
                                />
                            ) : (
                                <span className="h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-full bg-blue-800 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-100 flex-shrink-0">
                                    {inits}
                                </span>
                            )}
                            <span className="hidden sm:flex flex-col text-left leading-tight">
                                <span className="text-xs font-bold text-slate-800 dark:text-white max-w-[160px] truncate">
                                    {sapa}
                                </span>
                                <span className="text-[10px] text-slate-500 max-w-[160px] truncate">
                                    {jabatan}
                                </span>
                            </span>
                            <FiChevronDown
                                className={`h-3.5 w-3.5 text-slate-400 flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* Menu Dropdown Profil / Keluar */}
                        {dropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} aria-hidden="true" />
                                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-700">
                                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{sapa}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{jabatan}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">NIP. {user.nip || "-"}</p>
                                    </div>
                                    <Link
                                        href="/profil"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-800 dark:hover:text-white transition-colors"
                                    >
                                        <FiSettings className="h-3.5 w-3.5 text-slate-400" />
                                        Profil Saya
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <FiLogOut className="h-3.5 w-3.5" />
                                        Keluar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* ── KONTEN HALAMAN ── */}
                <main className="flex-1 p-3 sm:p-4.5 max-w-7xl w-full mx-auto">
                    <FlashAlert />
                    {children}
                </main>
            </div>
        </div>
    );
}

import React, { useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import {
    FiHome,
    FiBookOpen,
    FiClock,
    FiCalendar,
    FiFileText,
    FiUser,
    FiLogOut,
    FiMenu,
    FiX,
    FiChevronRight,
} from "react-icons/fi";
import { ThemeToggle } from "@/components/theme-toggle";
import { FlashAlert } from "@/components/flash-alert";
import { AbsensiStatusBadge } from "@/components/absensi-status-badge";

const SCHOOL_LOGO = "/images/smkpbb.png";
const SCHOOL_NAME = "SMK Pembangunan Bandung Barat";

interface GuruLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function GuruLayout({ children, title }: GuruLayoutProps) {
    const { auth, url } = usePage().props as {
        auth?: {
            user?: {
                nama?: string;
                name?: string;
                nip?: string;
                email?: string;
                jabatan?: string;
            };
        };
        url?: string;
        statusAbsen?: { sudah_masuk?: boolean; sudah_pulang?: boolean } | null;
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const user = auth?.user || {
        nama: "Guru / Pegawai",
        nip: "-",
        email: "-",
        jabatan: "Guru",
    };

    const currentPath = typeof window !== "undefined" ? window.location.pathname : (url || "/dashboard");

    const navigation = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: FiHome,
            active: currentPath === "/dashboard",
        },
        {
            name: "Presensi Harian",
            href: "/absensi",
            icon: FiClock,
            active: currentPath.startsWith("/absensi"),
        },
        {
            name: "Riwayat Presensi",
            href: "/kalender",
            icon: FiCalendar,
            active: currentPath.startsWith("/kalender"),
        },
        {
            name: "Pengajuan Izin",
            href: "/izin",
            icon: FiFileText,
            active: currentPath.startsWith("/izin"),
        },
        {
            name: "Profil Saya",
            href: "/profil",
            icon: FiUser,
            active: currentPath.startsWith("/profil"),
        },
    ];

    const handleLogout = () => {
        router.post("/logout");
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col lg:flex-row transition-colors">
            {/* BACKDROP MOBILE */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
                    isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                }`}
            >
                {/* TOP BRANDING */}
                <div>
                    <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <img
                                src={SCHOOL_LOGO}
                                alt={`Logo ${SCHOOL_NAME}`}
                                className="h-11 w-11 object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105"
                            />
                            <div>
                                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight block leading-tight">
                                    SIMAG
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase line-clamp-1">
                                    SMK PBB
                                </span>
                            </div>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-label="Tutup menu"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    {/* USER CARD MINI */}
                    <div className="p-4 m-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Masuk sebagai:</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                            {user.nama || user.name || "Guru"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                NIP. {user.nip || "-"}
                            </span>
                        </div>
                    </div>

                    {/* NAV LINKS */}
                    <nav className="px-4 space-y-1.5 mt-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                        item.active
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`h-5 w-5 ${item.active ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-400"}`} />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.active && <FiChevronRight className="h-4 w-4 text-white/70" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* STATUS PRESENSI HARI INI - Link Presensi Harian diberi state jelas */}
                    <AbsensiStatusBadge />

                </div>

                {/* BOTTOM ACTIONS */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Tampilan
                        </span>
                        <ThemeToggle />
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                        <FiLogOut className="h-4 w-4" />
                        <span>Keluar Akun</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* TOPBAR MOBILE & DESKTOP */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                            aria-label="Buka menu navigasi"
                        >
                            <FiMenu className="h-6 w-6" />
                        </button>
                        <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                            {title || "Portal Presensi Guru"}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {user.nama || user.name || "Guru"}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {SCHOOL_NAME}
                            </span>
                        </div>
                        <ThemeToggle className="sm:hidden" />
                    </div>
                </header>

                {/* CONTENT CONTAINER */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    <FlashAlert />
                    {children}
                </main>
            </div>
        </div>
    );
}

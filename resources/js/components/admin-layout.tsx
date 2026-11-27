import React, { useEffect, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    FiBarChart2,
    FiBell,
    FiCalendar,
    FiChevronDown,
    FiFileText,
    FiGrid,
    FiLogOut,
    FiMenu,
    FiSettings,
    FiUsers,
    FiX,
} from "react-icons/fi";
import { FlashAlert } from "@/components/flash-alert";
import { ThemeToggle } from "@/components/theme-toggle";
import { confirmAction } from "@/lib/swal";

const SCHOOL_LOGO = "/images/smkpbb.png";
const SCHOOL_ABBR = "SIPRES";
const SCHOOL_FULL = "SMK Pembangunan Bandung Barat";

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

type NotifikasiAdmin = {
    id: number;
    nama: string;
    jenis: string;
    tgl_mulai: string | null;
    tgl_selesai: string | null;
    waktu: string;
};

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const page = usePage();
    const { auth, notifikasiAdmin, jumlahIzinPending } = page.props as {
        auth?: { user?: { nama?: string; name?: string; email?: string } };
        notifikasiAdmin?: NotifikasiAdmin[];
        jumlahIzinPending?: number;
    };

    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("admin_sidebar_open");
            if (saved !== null) {
                return JSON.parse(saved);
            }
            return window.innerWidth >= 1024;
        }
        return true;
    });
    const [notifOpen, setNotifOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen((prev) => {
            const nextState = !prev;
            if (typeof window !== "undefined") {
                localStorage.setItem("admin_sidebar_open", JSON.stringify(nextState));
            }
            return nextState;
        });
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
        if (typeof window !== "undefined") {
            localStorage.setItem("admin_sidebar_open", "false");
        }
    };

    // Sinkronkan perilaku sidebar dengan ukuran layar
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 1023px)");
        const handleResize = () => {
            setIsMobile(mq.matches);
        };
        handleResize();
        mq.addEventListener("change", handleResize);
        return () => mq.removeEventListener("change", handleResize);
    }, []);

    const nama = auth?.user?.nama || auth?.user?.name || auth?.user?.email || "Admin";
    const inisial =
        nama
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((kata) => kata[0]?.toUpperCase())
            .join("") || "A";
    const path = page.url ?? "/admin/dashboard";
    const notifCount = jumlahIzinPending ?? 0;
    const daftarNotif = notifikasiAdmin ?? [];

    const navItems = [
        { label: "Dashboard", href: "/admin/dashboard", Icon: FiGrid, active: path.startsWith("/admin/dashboard") },
        { label: "Data Guru", href: "/admin/pegawai", Icon: FiUsers, active: path.startsWith("/admin/pegawai") },
        { label: "Validasi Izin", href: "/admin/izin", Icon: FiFileText, active: path.startsWith("/admin/izin") },
        { label: "Laporan Absen", href: "/admin/laporan", Icon: FiBarChart2, active: path.startsWith("/admin/laporan") },
        { label: "Jadwal Pelajaran", href: "/admin/jadwal", Icon: FiCalendar, active: path.startsWith("/admin/jadwal") },
    ];

    const logout = async () => {
        const ok = await confirmAction({
            title: "Keluar dari sistem?",
            text: "Anda akan keluar dari panel admin.",
            confirmText: "Keluar",
            danger: true,
        });
        if (!ok) return;

        router.post("/logout");
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col lg:flex-row text-slate-800 dark:text-slate-100">
            {/* Backdrop mobile */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* ── SIDEBAR ── */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 bg-blue-900 text-white flex flex-col
                    transition-all duration-300 ease-in-out lg:static
                    ${isMobile
                        ? (sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64")
                        : (sidebarOpen ? "w-64" : "w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-r-0")
                    }
                `}
            >
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-blue-800 min-w-[256px]">
                    <Link href="/admin/dashboard" className="flex items-center gap-2.5 min-w-0">
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
                    <button
                        type="button"
                        onClick={closeSidebar}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition text-blue-100 hover:text-white"
                        aria-label="Tutup menu"
                    >
                        <FiX className="h-4 w-4" />
                    </button>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-w-[256px]">
                    <p className="px-2 py-1 text-[10px] font-bold tracking-widest text-blue-200 uppercase">
                        Administrasi
                    </p>
                    {navItems.map(({ label, href, Icon, active }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => {
                                if (isMobile) closeSidebar();
                            }}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                                active
                                    ? "bg-white/15 text-white"
                                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            {label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* ── AREA UTAMA ── */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 px-3 sm:px-4">
                    {/* Hamburger: mobile + desktop */}
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors flex-shrink-0"
                        aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
                        title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
                    >
                        <FiMenu className="h-5 w-5" />
                    </button>

                    <h1 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white truncate">
                        {title ?? "Panel Admin"}
                    </h1>

                    <div className="flex-1" />

                    {/* Tema terang/gelap */}
                    <ThemeToggle className="h-8 w-8 p-0 flex items-center justify-center" />

                    {/* Lonceng notifikasi (di samping tombol tema) */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setNotifOpen((v) => !v);
                                setMenuOpen(false);
                            }}
                            className="relative p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                            aria-label="Notifikasi izin menunggu validasi"
                            aria-expanded={notifOpen}
                        >
                            <FiBell className="h-5 w-5" />
                            {notifCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                                    {notifCount > 9 ? "9+" : notifCount}
                                </span>
                            )}
                        </button>

                        {notifOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setNotifOpen(false)}
                                    aria-hidden="true"
                                />
                                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-20">
                                    <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                                        <p className="text-xs font-bold text-slate-800 dark:text-white">
                                            Notifikasi
                                        </p>
                                        <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                                            {notifCount} izin menunggu
                                        </span>
                                    </div>

                                    <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto">
                                        {daftarNotif.length === 0 ? (
                                            <p className="px-3.5 py-6 text-center text-[11px] text-slate-400">
                                                Tidak ada izin yang menunggu validasi.
                                            </p>
                                        ) : (
                                            daftarNotif.map((n) => (
                                                 <button
                                                    key={n.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setNotifOpen(false);
                                                        router.visit("/admin/izin");
                                                    }}
                                                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                                >
                                                    <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                                                        {n.nama}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        {n.jenis} · {n.tgl_mulai ?? "-"} s/d {n.tgl_selesai ?? "-"}
                                                    </p>
                                                    <span className="text-[9px] text-slate-400 mt-1 block">
                                                        {n.waktu}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    <div className="px-3.5 pt-2 pb-1 border-t border-slate-100 dark:border-slate-700">
                                        <Link
                                            href="/admin/izin"
                                            onClick={() => setNotifOpen(false)}
                                            className="text-[11px] font-bold text-blue-800 dark:text-blue-300 hover:underline"
                                        >
                                            Buka Validasi Izin
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Dropdown profil admin */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen((v) => !v);
                                setNotifOpen(false);
                            }}
                            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-expanded={menuOpen}
                        >
                            <span className="h-8 w-8 rounded-full bg-blue-800 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-900 flex-shrink-0">
                                {inisial}
                            </span>
                            <span className="hidden sm:flex flex-col text-left leading-tight">
                                <span className="text-xs font-bold text-slate-800 dark:text-white max-w-[160px] truncate">
                                    {nama}
                                </span>
                                <span className="text-[10px] text-slate-500 max-w-[160px] truncate">
                                    Admin
                                </span>
                            </span>
                            <FiChevronDown
                                className={`h-3.5 w-3.5 text-slate-400 flex-shrink-0 transition-transform ${
                                    menuOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuOpen(false)}
                                    aria-hidden="true"
                                />
                                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-20">
                                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-700">
                                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                            {nama}
                                        </p>
                                        <p className="text-[10px] text-slate-500 truncate">
                                            {auth?.user?.email || "Admin Sekolah"}
                                        </p>
                                    </div>
                                    <Link
                                        href="/admin/profil"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-800 dark:hover:text-white transition-colors"
                                    >
                                        <FiSettings className="h-3.5 w-3.5 text-slate-400" />
                                        Profil Admin
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={logout}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                    >
                                        <FiLogOut className="h-3.5 w-3.5" />
                                        Keluar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 space-y-4 max-w-7xl w-full mx-auto">
                    <FlashAlert />
                    {children}
                </main>
            </div>
        </div>
    );
}

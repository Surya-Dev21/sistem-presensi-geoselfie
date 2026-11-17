import React, { useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import {
    FiHome,
    FiClock,
    FiCalendar,
    FiFileText,
    FiUser,
    FiLogOut,
    FiMenu,
    FiX,
    FiChevronDown,
    FiBell,
    FiSettings,
} from "react-icons/fi";
import { FlashAlert } from "@/components/flash-alert";

const SCHOOL_LOGO = "/images/smkpbb.png";
const SCHOOL_NAME = "SMK Pembangunan Bandung Barat";
const SCHOOL_SHORT = "SIMAG";

// === SMK PBB Brand Colors ===
// Primary: Biru (#0c4ea2 / #1e40af) | Accent: Kuning / Emas (#f59e0b / #eab308)

interface GuruLayoutProps {
    children: React.ReactNode;
    title?: string;
}

type JenisKelamin = "L" | "P";

function sapaanGuru(nama: string | undefined, jk: JenisKelamin = "L"): string {
    if (!nama) return "Bapak/Ibu Guru";
    return `${jk === "P" ? "Ibu" : "Bapak"} ${nama}`;
}

function getInitials(nama: string | undefined): string {
    if (!nama) return "G";
    return nama
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
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
                jenis_kelamin?: JenisKelamin;
            };
        };
        url?: string;
        statusAbsen?: { sudah_masuk?: boolean; sudah_pulang?: boolean } | null;
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const user = auth?.user ?? {
        nama: "Guru / Pegawai",
        nip: "-",
        email: "-",
        jabatan: "Guru",
        jenis_kelamin: "L" as JenisKelamin,
    };

    const jk: JenisKelamin = (user.jenis_kelamin as JenisKelamin) ?? "L";
    const namaLengkap = user.nama || user.name || "Guru";
    const sapaan = sapaanGuru(namaLengkap, jk);
    const jabatan = user.jabatan || "Pegawai";
    const initials = getInitials(namaLengkap);

    const currentPath =
        typeof window !== "undefined"
            ? window.location.pathname
            : (url || "/dashboard");

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
        setIsDropdownOpen(false);
        router.post("/logout");
    };

    // Style navigasi aktif (Biru dan aksen Kuning)
    const activeClass =
        "bg-blue-50 text-blue-700 font-semibold border-r-4 border-amber-500";
    const inactiveClass =
        "text-slate-600 hover:bg-slate-100 hover:text-blue-700 transition-colors";

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
            {/* ============ BACKDROP MOBILE ============ */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ============ SIDEBAR ============ */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
                    isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                }`}
            >
                {/* Sidebar Header: Logo SMK + Brand Biru */}
                <div className="h-14 px-4 flex items-center justify-between border-b border-blue-900 bg-blue-800">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <img
                            src={SCHOOL_LOGO}
                            alt={`Logo ${SCHOOL_NAME}`}
                            className="h-8 w-8 object-contain rounded bg-white/10 p-0.5"
                        />
                        <span className="text-sm font-black text-amber-400 tracking-wide">
                            {SCHOOL_SHORT}
                        </span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
                        aria-label="Tutup sidebar"
                    >
                        <FiX className="h-4 w-4" />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                    <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Menu Utama
                    </p>
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                                item.active ? activeClass : inactiveClass
                            }`}
                        >
                            <item.icon
                                className={`h-4 w-4 flex-shrink-0 ${
                                    item.active
                                        ? "text-blue-700"
                                        : "text-slate-400"
                                }`}
                            />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer: Info Pengguna */}
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium">
                        NIP. {user.nip || "-"}
                    </p>
                    <p className="text-xs text-slate-700 font-semibold truncate">
                        {namaLengkap}
                    </p>
                    <p className="text-[10px] text-blue-600 font-medium">{jabatan}</p>
                </div>
            </aside>

            {/* ============ MAIN AREA ============ */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* ============ HEADER ============ */}
                <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shadow-xs">
                    {/* Hamburger (mobile) */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-700 transition-colors flex-shrink-0"
                        aria-label="Buka sidebar"
                    >
                        <FiMenu className="h-5 w-5" />
                    </button>

                    {/* Page Title */}
                    <div className="hidden lg:block">
                        <span className="text-sm font-semibold text-slate-700">
                            {title ?? "Portal Guru"}
                        </span>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Bell Notification */}
                    <button
                        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-700 transition-colors"
                        aria-label="Notifikasi"
                        title="Notifikasi"
                    >
                        <FiBell className="h-5 w-5" />
                    </button>

                    {/* User Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen((v) => !v)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors max-w-[220px]"
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="true"
                        >
                            {/* Avatar Biru dengan Aksen Kuning */}
                            <span className="h-8 w-8 rounded-full flex-shrink-0 bg-blue-700 text-white flex items-center justify-center text-xs font-bold ring-2 ring-amber-400">
                                {initials}
                            </span>

                            {/* Nama + Jabatan */}
                            <span className="hidden sm:flex flex-col text-left leading-tight min-w-0">
                                <span className="text-xs font-bold text-slate-800 truncate">
                                    {sapaan}
                                </span>
                                <span className="text-[10px] text-slate-500 truncate">
                                    {jabatan}
                                </span>
                            </span>

                            <FiChevronDown
                                className={`h-3.5 w-3.5 text-slate-400 flex-shrink-0 transition-transform ${
                                    isDropdownOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsDropdownOpen(false)}
                                    aria-hidden="true"
                                />
                                <div
                                    role="menu"
                                    className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-xl border border-slate-200 py-1.5 z-20"
                                >
                                    {/* Info user */}
                                    <div className="px-4 py-2.5 border-b border-slate-100">
                                        <p className="text-xs font-bold text-slate-800 truncate">
                                            {sapaan}
                                        </p>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                            NIP. {user.nip || "-"}
                                        </p>
                                    </div>

                                    {/* Profil */}
                                    <Link
                                        href="/profil"
                                        role="menuitem"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <FiSettings className="h-4 w-4 text-slate-400" />
                                        Edit Profil
                                    </Link>

                                    {/* Keluar */}
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <FiLogOut className="h-4 w-4" />
                                        Keluar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* ============ PAGE CONTENT ============ */}
                <main className="flex-1 p-3 sm:p-4 lg:p-6 max-w-7xl w-full mx-auto">
                    <FlashAlert />
                    {children}
                </main>
            </div>
        </div>
    );
}

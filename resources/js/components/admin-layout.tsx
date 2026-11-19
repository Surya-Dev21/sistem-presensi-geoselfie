import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { FiFileText, FiGrid, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { FlashAlert } from "@/components/flash-alert";
import { ThemeToggle } from "@/components/theme-toggle";
import { confirmAction } from "@/lib/swal";

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const { auth, url } = usePage().props as {
        auth?: { user?: { nama?: string; name?: string; email?: string } };
        url?: string;
    };

    const [open, setOpen] = useState(false);
    const nama = auth?.user?.nama || auth?.user?.name || auth?.user?.email || "Administrator";
    const path = url ?? "/admin/dashboard";

    const navItems = [
        { label: "Dashboard", href: "/admin/dashboard", Icon: FiGrid, active: path.startsWith("/admin/dashboard") },
        { label: "Validasi Izin", href: "/admin/izin", Icon: FiFileText, active: path.startsWith("/admin/izin") },
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
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-100">
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white flex flex-col
                    transition-transform duration-300 md:static md:translate-x-0
                    ${open ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="flex items-center justify-between px-4 py-4 border-b border-blue-800">
                    <div className="min-w-0">
                        <p className="text-sm font-black tracking-widest leading-none">SIPRES</p>
                        <p className="text-[9px] text-blue-100 font-medium leading-tight truncate mt-0.5">
                            SMK Pembangunan Bandung Barat
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="md:hidden p-1.5 rounded-lg hover:bg-white/10 transition"
                        aria-label="Tutup menu"
                    >
                        <FiX className="h-4 w-4" />
                    </button>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    <p className="px-2 py-1 text-[10px] font-bold tracking-widest text-blue-200 uppercase">
                        Administrasi
                    </p>
                    {navItems.map(({ label, href, Icon, active }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
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

                <div className="p-3 border-t border-blue-800">
                    <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/10 hover:bg-rose-600 text-xs font-bold transition"
                    >
                        <FiLogOut className="h-4 w-4" aria-hidden="true" />
                        Keluar Sistem
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 px-3 sm:px-5 sticky top-0 z-30">
                    <div className="flex items-center gap-2 min-w-0">
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            aria-label="Buka menu"
                        >
                            <FiMenu className="h-4.5 w-4.5" />
                        </button>
                        <h1 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate">
                            {title ?? "Dashboard Admin"}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle className="h-8 w-8 p-0 flex items-center justify-center" />
                        <span className="hidden sm:block text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-[160px] truncate">
                            {nama}
                        </span>
                        <span className="h-8 w-8 rounded-full bg-blue-800 text-white text-xs font-bold flex items-center justify-center">
                            {nama.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </header>

                <div className="flex-1 p-3 sm:p-5 overflow-y-auto">
                    <FlashAlert />
                    <div className="max-w-5xl mx-auto space-y-3.5">{children}</div>
                </div>
            </main>
        </div>
    );
}

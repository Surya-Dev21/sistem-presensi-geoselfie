import React from "react";
import { Link } from "@inertiajs/react";
import { FiClock } from "react-icons/fi";
import { usePage } from "@inertiajs/react";

/**
 * Badge status presensi hari ini di sidebar.
 * Sumber data: prop `statusAbsen` yang di-share oleh HandleInertiaRequests.
 */
export function AbsensiStatusBadge() {
    const { statusAbsen, url } = usePage().props as {
        statusAbsen?: { sudah_masuk?: boolean; sudah_pulang?: boolean } | null;
        url?: string;
    };

    const sudahPulang = Boolean(statusAbsen?.sudah_pulang);
    const sudahMasuk = Boolean(statusAbsen?.sudah_masuk);

    // Jangan tampilkan badge saat user sedang di halaman absensi itu sendiri
    const currentPath = typeof window !== "undefined" ? window.location.pathname : (url || "");
    if (sudahPulang || currentPath.startsWith("/absensi")) return null;

    const label = !sudahMasuk
        ? "Belum Absen Masuk"
        : "Belum Absen Pulang";

    return (
        <div className="px-4 mt-3">
            <Link
                href="/absensi"
                className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-150"
            >
                <div className="flex items-center gap-3">
                    <FiClock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>{label}</span>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">→</span>
            </Link>
        </div>
    );
}

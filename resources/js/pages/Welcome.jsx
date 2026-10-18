import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { FiUserCheck, FiShield, FiCheckCircle } from "react-icons/fi";

// Import Komponen Shadcn/UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Welcome() {
    const { flash } = usePage().props;

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
            <Head title="Selamat Datang - SIMAG SMK Pembangunan Bandung Barat" />

            {/* NOTIFIKASI FLASH (SHADCN BADGE) */}
            {flash?.success && (
                // PERBAIKAN: Mengubah top-6 menjadi top-3, dan sm:top-8 menjadi sm:top-4
                <div className="absolute top-3 sm:top-4 z-50 animate-bounce max-w-md w-full px-5">
                    <Badge
                        variant="outline"
                        className="bg-emerald-500/90 text-white border-emerald-400/50 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold w-full"
                    >
                        <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{flash.success}</span>
                    </Badge>
                </div>
            )}

            {/* LATAR BELAKANG FOTO SEKOLAH */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url('/images/bg.jpeg')` }}
            >
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />
            </div>

            {/* KARTU UTAMA MENGGUNAKAN SHADCN CARD */}
            <Card className="relative z-10 max-w-lg w-full bg-slate-900/70 backdrop-blur-md border-white/15 rounded-3xl shadow-2xl my-auto text-center text-slate-100 overflow-hidden">
                <CardContent className="p-6 sm:p-10">
                    {/* LOGO SEKOLAH */}
                    <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6 overflow-hidden transform hover:scale-105 transition-transform duration-300">
                        <img
                            src="/images/smkpbb.png"
                            alt="Logo SMK Pembangunan Bandung Barat"
                            className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                            onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentNode.innerHTML =
                                    '<div class="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">SMK</div>';
                            }}
                        />
                    </div>

                    {/* TEKS SAMBUTAN */}
                    <div className="mb-8 space-y-1.5">
                        <p className="text-blue-400 font-bold text-xs sm:text-sm tracking-widest uppercase">
                            Selamat Datang di
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                            Sistem Presensi Digital
                        </h1>
                        <h2 className="text-base sm:text-lg font-bold text-slate-300">
                            SMK Pembangunan Bandung Barat
                        </h2>

                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto pt-3 font-normal">
                            Silakan pilih portal masuk sesuai dengan hak akses
                            Anda untuk memulai sesi presensi hari ini.
                        </p>
                    </div>

                    {/* TOMBOL MENGGUNAKAN SHADCN BUTTON */}
                    {/* TOMBOL MENGGUNAKAN SHADCN BUTTON */}
                    <div className="space-y-3.5 max-w-md mx-auto">
                        <Button
                            asChild
                            size="lg"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 text-sm h-12 p-0 overflow-hidden"
                        >
                            {/* PERBAIKAN: Menambahkan flex, items-center, justify-center, dan gap langsung di sini */}
                            <Link
                                href="/login"
                                className="w-full h-full flex items-center justify-center gap-2.5 px-6"
                            >
                                <FiUserCheck className="w-5 h-5 text-blue-100 flex-shrink-0" />
                                <span>Login Guru / Pegawai</span>
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700 hover:border-slate-500 font-bold rounded-2xl text-sm h-12 p-0 overflow-hidden"
                        >
                            {/* PERBAIKAN: Menambahkan flex, items-center, justify-center, dan gap langsung di sini */}
                            <Link
                                href="/admin/login"
                                className="w-full h-full flex items-center justify-center gap-2.5 px-6"
                            >
                                <FiShield className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                <span>Login Administrator</span>
                            </Link>
                        </Button>
                    </div>

                    {/* FOOTER INFORMASI */}
                    <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
                        <p>&copy; {new Date().getFullYear()} SIMAG SMK PBB</p>
                        <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-400 border-none font-semibold flex items-center gap-1.5"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Sistem Presensi Online
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

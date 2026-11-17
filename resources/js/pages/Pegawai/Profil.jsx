import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    FiUser, 
    FiSave, 
    FiAlertTriangle, 
    FiEye, 
    FiEyeOff, 
    FiLock, 
    FiMail,
    FiKey,
    FiCheck
} from 'react-icons/fi';
import GuruLayout from '@/components/guru-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Profil({ pegawai }) {
    const [showModal, setShowModal] = useState(false);
    const [showPassLama, setShowPassLama] = useState(false);
    const [showPassBaru, setShowPassBaru] = useState(false);
    const [showPassKonfirmasi, setShowPassKonfirmasi] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        nama: pegawai?.nama || '',
        email: pegawai?.email || '',
        password_lama: '',
        password_baru: '',
        password_baru_confirmation: '',
    });

    const triggerConfirm = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const handleConfirmSave = () => {
        setShowModal(false);
        put('/profil');
    };

    return (
        <GuruLayout title="Profil Pegawai">
            <Head title="Profil Akun - Portal SIMAG" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Pengaturan Profil & Akun
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Perbarui data pribadi, email terdaftar, dan kata sandi akun SIMAG Anda.
                    </p>
                </div>

                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <FiUser className="text-blue-600 dark:text-blue-400" />
                            Informasi Akun Pegawai
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6 sm:p-8">
                        <form onSubmit={triggerConfirm} className="space-y-6">
                            {/* READ-ONLY FIELD (NIP) */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        NIP (Nomor Induk Pegawai)
                                    </label>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-bold uppercase">
                                        Read-Only
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={pegawai?.nip || ''}
                                        disabled
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-sm font-semibold cursor-not-allowed pl-10 py-2.5"
                                    />
                                    <FiLock className="absolute left-3.5 top-3.5 text-slate-400" />
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                                    NIP dikelola secara terpusat oleh administrator sekolah.
                                </p>
                            </div>

                            {/* EDITABLE FIELD (NAMA & EMAIL) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Nama Lengkap
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.nama}
                                            onChange={(e) => setData('nama', e.target.value)}
                                            placeholder="Masukkan nama lengkap"
                                            required
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-0 text-sm font-medium py-2.5 pl-10 pr-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                                        />
                                        <FiUser className="absolute left-3.5 top-3.5 text-slate-400" />
                                    </div>
                                    {errors.nama && (
                                        <p className="text-xs text-rose-500 mt-1 font-medium">{errors.nama}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Alamat Email
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="nama@email.com"
                                            required
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-0 text-sm font-medium py-2.5 pl-10 pr-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                                        />
                                        <FiMail className="absolute left-3.5 top-3.5 text-slate-400" />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <hr className="my-6 border-slate-100 dark:border-slate-800" />

                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <FiKey className="text-blue-600 dark:text-blue-400" />
                                    Ubah Kata Sandi
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Biarkan kolom di bawah kosong jika Anda tidak ingin mengganti password.
                                </p>
                            </div>

                            {/* PASSWORD SAAT INI */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Password Saat Ini
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassLama ? 'text' : 'password'}
                                        value={data.password_lama}
                                        onChange={(e) => setData('password_lama', e.target.value)}
                                        placeholder="Masukkan password saat ini untuk konfirmasi"
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-0 text-sm font-medium py-2.5 pl-3.5 pr-11 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassLama(!showPassLama)}
                                        className="absolute right-3.5 top-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition p-1"
                                        aria-label={showPassLama ? "Sembunyikan password" : "Tampilkan password"}
                                    >
                                        {showPassLama ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password_lama && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password_lama}</p>
                                )}
                            </div>

                            {/* PASSWORD BARU & KONFIRMASI */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Password Baru (Min. 6 Karakter)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassBaru ? 'text' : 'password'}
                                            value={data.password_baru}
                                            onChange={(e) => setData('password_baru', e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-0 text-sm font-medium py-2.5 pl-3.5 pr-11 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassBaru(!showPassBaru)}
                                            className="absolute right-3.5 top-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition p-1"
                                            aria-label={showPassBaru ? "Sembunyikan password" : "Tampilkan password"}
                                        >
                                            {showPassBaru ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password_baru && (
                                        <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password_baru}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Konfirmasi Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassKonfirmasi ? 'text' : 'password'}
                                            value={data.password_baru_confirmation}
                                            onChange={(e) => setData('password_baru_confirmation', e.target.value)}
                                            placeholder="Ulangi password baru"
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-0 text-sm font-medium py-2.5 pl-3.5 pr-11 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassKonfirmasi(!showPassKonfirmasi)}
                                            className="absolute right-3.5 top-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition p-1"
                                            aria-label={showPassKonfirmasi ? "Sembunyikan password" : "Tampilkan password"}
                                        >
                                            {showPassKonfirmasi ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition flex justify-center items-center gap-2 active:scale-98 disabled:opacity-60"
                            >
                                <FiSave className="w-4 h-4" />
                                <span>Simpan Perubahan Profil</span>
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* MODAL KONFIRMASI */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/60 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                            <FiAlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                            Konfirmasi Pembaruan
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            Apakah Anda yakin data profil dan informasi akun sudah benar?
                        </p>

                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSave}
                                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-600/20"
                            >
                                Ya, Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GuruLayout>
    );
}

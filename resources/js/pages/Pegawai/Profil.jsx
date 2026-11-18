import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    FiUser,
    FiSave,
    FiEye,
    FiEyeOff,
    FiLock,
    FiMail,
    FiKey,
    FiShield,
    FiCamera,
} from 'react-icons/fi';
import GuruLayout from '@/components/guru-layout';

// ============================================================
// Komponen input teks dengan icon opsional
// ============================================================
function Field({ label, hint, error, icon: Icon, children }) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                )}
                {children}
            </div>
            {hint && !error && (
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{hint}</p>
            )}
            {error && (
                <p className="text-[10px] text-rose-600 mt-1 font-medium">{error}</p>
            )}
        </div>
    );
}

function PasswordInput({ value, onChange, placeholder, show, onToggle, error }) {
    return (
        <>
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete="new-password"
                className={`w-full rounded-lg border ${
                    error ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                } focus:border-blue-600 focus:ring-0 outline-none text-sm py-2 pl-3 pr-10 text-slate-900 dark:text-white bg-transparent dark:bg-slate-800 transition-colors`}
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-700 transition p-0.5"
                aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
            >
                {show ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
        </>
    );
}

// ============================================================
// Page Utama
// ============================================================
export default function Profil({ pegawai }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};

    const [showModal, setShowModal]           = useState(false);
    const [showPassLama, setShowPassLama]     = useState(false);
    const [showPassBaru, setShowPassBaru]     = useState(false);
    const [showPassKonfirm, setShowPassKonfirm] = useState(false);
    const [fotoPreview, setFotoPreview]           = useState(pegawai?.foto || null);

    const { data, setData, put, processing, errors } = useForm({
        nama:                       pegawai?.nama || '',
        email:                      pegawai?.email || '',
        password_lama:              '',
        password_baru:              '',
        password_baru_confirmation: '',
        foto:                       null,
    });

    const inisial = (pegawai?.nama || 'G')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('');

    const pilihFoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('foto', file);
        setFotoPreview(URL.createObjectURL(file));
    };

    const triggerConfirm = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const handleSave = () => {
        setShowModal(false);
        put('/profil', { forceFormData: true, preserveScroll: true });
    };

    const inFieldClass = (err) =>
        `w-full rounded-lg border ${
            err ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
        } focus:border-blue-600 focus:ring-0 outline-none text-sm py-2 pl-9 pr-3 text-slate-900 dark:text-white bg-transparent dark:bg-slate-800 transition-colors`;

    return (
        <GuruLayout title="Profil Saya">
            <Head title="Profil Akun – Portal SIMAG" />

            <div className="max-w-2xl mx-auto space-y-4">
                {/* PAGE HEADER */}
                <div>
                    <h2 className="text-base font-black text-slate-800 dark:text-white">
                        Pengaturan Profil &amp; Akun
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Perbarui data pribadi, email, dan kata sandi akun SIMAG Anda.
                    </p>
                </div>

                {/* ===== FORM ===== */}
                <form onSubmit={triggerConfirm}>
                    {/* Kartu: Foto Profil */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 mb-4 flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden bg-blue-800 text-white flex items-center justify-center font-black text-lg ring-2 ring-blue-100">
                            {fotoPreview ? (
                                <img src={fotoPreview} alt="Foto profil" className="h-full w-full object-cover" />
                            ) : (
                                inisial
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Foto Profil</p>
                            <label className="mt-1.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-800 hover:bg-blue-100 transition">
                                <FiCamera className="h-3.5 w-3.5" />
                                Pilih Foto
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={pilihFoto}
                                    className="sr-only"
                                />
                            </label>
                            <p className="text-[10px] text-slate-400 mt-1">
                                JPG, PNG, atau WEBP. Maksimal 2 MB.
                            </p>
                            {errors.foto && (
                                <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.foto}</p>
                            )}
                        </div>
                    </div>

                    {/* Kartu: Info Dasar */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden mb-4">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <FiUser className="h-4 w-4 text-blue-700" />
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Informasi Pegawai</h3>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* NIP (read-only) */}
                            <Field
                                label="NIP"
                                hint="NIP dikelola oleh administrator sekolah dan tidak dapat diubah."
                                icon={FiLock}
                            >
                                <input
                                    type="text"
                                    value={pegawai?.nip || '-'}
                                    disabled
                                    className="w-full rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-sm font-semibold cursor-not-allowed py-2 pl-9 pr-3"
                                />
                            </Field>

                            {/* Grid Nama + Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Nama Lengkap" error={errors.nama} icon={FiUser}>
                                    <input
                                        type="text"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        placeholder="Nama lengkap"
                                        required
                                        className={inFieldClass(errors.nama)}
                                    />
                                </Field>
                                <Field label="Alamat Email" error={errors.email} icon={FiMail}>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@email.com"
                                        required
                                        className={inFieldClass(errors.email)}
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Kartu: Ubah Password */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden mb-4">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <FiKey className="h-4 w-4 text-blue-700" />
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Ubah Kata Sandi</h3>
                                <p className="text-[10px] text-slate-400">Biarkan kosong jika tidak ingin mengganti password.</p>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Password Lama */}
                            <Field label="Password Saat Ini" error={errors.password_lama}>
                                <PasswordInput
                                    value={data.password_lama}
                                    onChange={(e) => setData('password_lama', e.target.value)}
                                    placeholder="Masukkan password saat ini"
                                    show={showPassLama}
                                    onToggle={() => setShowPassLama((v) => !v)}
                                    error={errors.password_lama}
                                />
                            </Field>

                            {/* Password Baru + Konfirmasi */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="Password Baru (Min. 6 Karakter)"
                                    error={errors.password_baru}
                                >
                                    <PasswordInput
                                        value={data.password_baru}
                                        onChange={(e) => setData('password_baru', e.target.value)}
                                        placeholder="Minimal 6 karakter"
                                        show={showPassBaru}
                                        onToggle={() => setShowPassBaru((v) => !v)}
                                        error={errors.password_baru}
                                    />
                                </Field>
                                <Field label="Konfirmasi Password Baru">
                                    <PasswordInput
                                        value={data.password_baru_confirmation}
                                        onChange={(e) => setData('password_baru_confirmation', e.target.value)}
                                        placeholder="Ulangi password baru"
                                        show={showPassKonfirm}
                                        onToggle={() => setShowPassKonfirm((v) => !v)}
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Tombol Submit Biru Utama */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-xs transition flex justify-center items-center gap-2 disabled:opacity-60"
                    >
                        <FiSave className="h-4 w-4" />
                        <span>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                    </button>
                </form>
            </div>

            {/* ===== MODAL KONFIRMASI ===== */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
                        <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-700">
                            <FiShield className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Konfirmasi Pembaruan</h3>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            Apakah Anda yakin data profil dan informasi akun sudah benar?
                        </p>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition"
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

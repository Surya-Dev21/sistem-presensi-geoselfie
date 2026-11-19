import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    FiCamera,
    FiCheckCircle,
    FiCreditCard,
    FiEye,
    FiEyeOff,
    FiInfo,
    FiKey,
    FiMail,
    FiPhone,
    FiSave,
    FiUser,
} from 'react-icons/fi';
import GuruLayout from '@/components/guru-layout';
import { confirmAction, toastError, toastSuccess } from '@/lib/swal';

const KELAS_INPUT =
    'w-full rounded-xl border bg-white dark:bg-slate-800 text-sm py-2.5 pl-10 pr-3 text-slate-900 dark:text-slate-100 ' +
    'transition focus:border-blue-800 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none';

const kelasBorder = (err) =>
    err ? 'border-rose-400 dark:border-rose-600' : 'border-slate-300 dark:border-slate-700';

function Field({ id, label, hint, error, icon: Icon, children, optional = false }) {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
                {label}
                {optional && (
                    <span className="ml-1 font-medium normal-case tracking-normal text-slate-400">
                        (opsional)
                    </span>
                )}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
                        aria-hidden="true"
                    />
                )}
                {children}
            </div>
            {hint && !error && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{hint}</p>
            )}
            {error && (
                <p id={`${id}-error`} role="alert" className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}

function PasswordInput({ id, value, onChange, placeholder, show, onToggle, error }) {
    return (
        <>
            <input
                id={id}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete="new-password"
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`${KELAS_INPUT} pr-10 ${kelasBorder(error)}`}
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-800 dark:hover:text-blue-300 transition p-1 rounded-md"
                aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
            >
                {show ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
        </>
    );
}

function Kartu({ icon: Icon, judul, deskripsi, children }) {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <header className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <span className="mt-0.5 h-8 w-8 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{judul}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{deskripsi}</p>
                </div>
            </header>
            <div className="p-4">{children}</div>
        </section>
    );
}

const inisialDari = (nama) =>
    (nama || 'G')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('');

export default function Profil({ pegawai }) {
    const awal = {
        nama: pegawai?.nama ?? '',
        nip: pegawai?.nip ?? '',
        email: pegawai?.email ?? '',
        no_hp: pegawai?.no_hp ?? '',
    };

    const info = useForm(awal);
    const sandi = useForm({
        password_lama: '',
        password_baru: '',
        password_baru_confirmation: '',
    });
    const foto = useForm({ foto: null });

    const [fotoPreview, setFotoPreview] = useState(null);
    const [kunciInputFoto, setKunciInputFoto] = useState(0);
    const [showPassLama, setShowPassLama] = useState(false);
    const [showPassBaru, setShowPassBaru] = useState(false);
    const [showPassKonfirm, setShowPassKonfirm] = useState(false);

    const tampilFoto = fotoPreview || pegawai?.foto || null;
    const namaTampil = info.data.nama || pegawai?.nama || 'Guru';

    const adaPerubahanInfo = ['nama', 'nip', 'email', 'no_hp'].some(
        (k) => (info.data[k] ?? '') !== (awal[k] ?? '')
    );
    const adaIsiSandi = !!sandi.data.password_baru || !!sandi.data.password_lama;

    const simpanInfo = async (e) => {
        e.preventDefault();

        // Kirim HANYA field yang berubah → tidak ada validasi field lain
        const payload = Object.fromEntries(
            Object.entries(info.data).filter(([k, v]) => (v ?? '') !== (awal[k] ?? ''))
        );
        if (Object.keys(payload).length === 0) {
            toastSuccess('Tidak ada perubahan untuk disimpan.');
            return;
        }

        if (payload.nip && payload.nip !== awal.nip) {
            const ok = await confirmAction({
                title: 'Ubah NIP?',
                text: 'Seluruh riwayat presensi, izin, dan jadwal mengajar akan dipindahkan ke NIP baru. Pastikan NIP baru sudah benar.',
                confirmText: 'Ya, ubah NIP',
                danger: true,
            });
            if (!ok) return;
        }

        info.transform(() => payload).put('/profil', {
            preserveScroll: true,
            onSuccess: () => toastSuccess('Data pribadi berhasil diperbarui'),
        });
    };

    const simpanSandi = (e) => {
        e.preventDefault();
        sandi.put('/profil', {
            preserveScroll: true,
            onSuccess: () => {
                sandi.reset();
                toastSuccess('Kata sandi berhasil diperbarui');
            },
        });
    };

    const pilihFoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toastError('Format foto harus JPG, PNG, atau WEBP.');
            e.target.value = '';
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toastError('Ukuran foto maksimal 2 MB.');
            e.target.value = '';
            return;
        }

        foto.setData('foto', file);
        setFotoPreview(URL.createObjectURL(file));
    };

    const batalFoto = () => {
        foto.reset();
        setFotoPreview(null);
        setKunciInputFoto((k) => k + 1);
    };

    const simpanFoto = (e) => {
        e.preventDefault();
        if (!foto.data.foto) {
            toastError('Pilih foto terlebih dahulu.');
            return;
        }
        foto.put('/profil', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                foto.reset();
                setFotoPreview(null);
                setKunciInputFoto((k) => k + 1);
                toastSuccess('Foto profil berhasil diperbarui');
            },
        });
    };

    return (
        <GuruLayout title="Profil Saya">
            <Head title="Profil Saya - SIPRES Guru" />

            <div className="max-w-5xl mx-auto space-y-4">
                {/* HEADER */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 sm:p-5 border border-blue-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full overflow-hidden bg-white/15 ring-2 ring-white/30 flex items-center justify-center font-black text-base">
                            {tampilFoto ? (
                                <img src={tampilFoto} alt="Foto profil" className="h-full w-full object-cover" />
                            ) : (
                                inisialDari(namaTampil)
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-blue-200">
                                Profil Pegawai
                            </p>
                            <h2 className="text-base sm:text-lg font-black leading-tight truncate">{namaTampil}</h2>
                            <p className="text-[11px] text-blue-100 truncate">
                                {pegawai?.jabatan || 'Pegawai'} &middot; NIP {info.data.nip || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* KOLOM KIRI */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* FOTO */}
                        <Kartu
                            icon={FiCamera}
                            judul="Foto Profil"
                            deskripsi="Tampil di header dan daftar pegawai."
                        >
                            <form onSubmit={simpanFoto} className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden bg-blue-800 text-white flex items-center justify-center font-black text-lg ring-2 ring-blue-100 dark:ring-blue-900">
                                        {tampilFoto ? (
                                            <img src={tampilFoto} alt="Pratinjau foto profil" className="h-full w-full object-cover" />
                                        ) : (
                                            inisialDari(namaTampil)
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 px-2.5 py-2 text-[11px] font-bold text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition">
                                            <FiCamera className="h-3.5 w-3.5" aria-hidden="true" />
                                            Pilih Foto
                                            <input
                                                key={kunciInputFoto}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={pilihFoto}
                                                className="sr-only"
                                            />
                                        </label>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                            JPG, PNG, WEBP. Maks 2 MB.
                                        </p>
                                    </div>
                                </div>

                                {foto.errors.foto && (
                                    <p role="alert" className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                                        {foto.errors.foto}
                                    </p>
                                )}

                                {foto.data.foto && (
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={foto.processing}
                                            className="flex-1 h-9 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-[11px] font-bold transition disabled:opacity-60"
                                        >
                                            {foto.processing ? 'Mengunggah...' : 'Simpan Foto'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={batalFoto}
                                            className="h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                )}
                            </form>
                        </Kartu>

                        {/* RINGKASAN (read-only) */}
                        <Kartu
                            icon={FiInfo}
                            judul="Informasi Kepegawaian"
                            deskripsi="Data ini dikelola administrator."
                        >
                            <dl className="space-y-2.5 text-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-slate-500 dark:text-slate-400">Jabatan</dt>
                                    <dd className="font-bold text-slate-800 dark:text-slate-100 text-right">
                                        {pegawai?.jabatan || '-'}
                                    </dd>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-slate-500 dark:text-slate-400">Jenis Kelamin</dt>
                                    <dd className="font-bold text-slate-800 dark:text-slate-100">
                                        {pegawai?.jenis_kelamin === 'L'
                                            ? 'Laki-laki'
                                            : pegawai?.jenis_kelamin === 'P'
                                              ? 'Perempuan'
                                              : '-'}
                                    </dd>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-slate-500 dark:text-slate-400">Email</dt>
                                    <dd className="font-bold text-slate-800 dark:text-slate-100 text-right break-all">
                                        {pegawai?.email || '-'}
                                    </dd>
                                </div>
                            </dl>
                        </Kartu>
                    </div>

                    {/* KOLOM KANAN */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* DATA PRIBADI */}
                        <Kartu
                            icon={FiUser}
                            judul="Data Pribadi"
                            deskripsi="Ubah hanya field yang perlu diubah, lalu simpan."
                        >
                            <form onSubmit={simpanInfo} className="space-y-4" noValidate>
                                <Field
                                    id="nip"
                                    label="NIP"
                                    icon={FiCreditCard}
                                    error={info.errors.nip}
                                    hint="Bisa diubah sendiri. Seluruh riwayat presensi & izin akan ikut pindah ke NIP baru."
                                >
                                    <input
                                        id="nip"
                                        type="text"
                                        inputMode="numeric"
                                        value={info.data.nip}
                                        onChange={(e) => info.setData('nip', e.target.value.replace(/\D/g, ''))}
                                        aria-invalid={!!info.errors.nip}
                                        aria-describedby={info.errors.nip ? 'nip-error' : undefined}
                                        className={`${KELAS_INPUT} ${kelasBorder(info.errors.nip)}`}
                                        placeholder="18 digit NIP"
                                    />
                                </Field>

                                <Field id="nama" label="Nama Lengkap" icon={FiUser} error={info.errors.nama}>
                                    <input
                                        id="nama"
                                        type="text"
                                        value={info.data.nama}
                                        onChange={(e) => info.setData('nama', e.target.value)}
                                        aria-invalid={!!info.errors.nama}
                                        aria-describedby={info.errors.nama ? 'nama-error' : undefined}
                                        className={`${KELAS_INPUT} ${kelasBorder(info.errors.nama)}`}
                                        placeholder="Nama lengkap"
                                    />
                                </Field>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field
                                        id="no_hp"
                                        label="No. HP / WhatsApp"
                                        icon={FiPhone}
                                        error={info.errors.no_hp}
                                        optional
                                        hint="Contoh: 081234567890"
                                    >
                                        <input
                                            id="no_hp"
                                            type="tel"
                                            inputMode="tel"
                                            value={info.data.no_hp}
                                            onChange={(e) => info.setData('no_hp', e.target.value)}
                                            aria-invalid={!!info.errors.no_hp}
                                            aria-describedby={info.errors.no_hp ? 'no_hp-error' : undefined}
                                            className={`${KELAS_INPUT} ${kelasBorder(info.errors.no_hp)}`}
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </Field>

                                    <Field id="email" label="Alamat Email" icon={FiMail} error={info.errors.email}>
                                        <input
                                            id="email"
                                            type="email"
                                            value={info.data.email}
                                            onChange={(e) => info.setData('email', e.target.value)}
                                            aria-invalid={!!info.errors.email}
                                            aria-describedby={info.errors.email ? 'email-error' : undefined}
                                            className={`${KELAS_INPUT} ${kelasBorder(info.errors.email)}`}
                                            placeholder="nama@email.com"
                                        />
                                    </Field>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 inline-flex items-center gap-1">
                                        <FiInfo className="h-3 w-3" aria-hidden="true" />
                                        {adaPerubahanInfo
                                            ? 'Perubahan belum disimpan.'
                                            : 'Tidak ada perubahan.'}
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={!adaPerubahanInfo || info.processing}
                                        className="h-10 px-4 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                    >
                                        <FiSave className="h-4 w-4" aria-hidden="true" />
                                        {info.processing ? 'Menyimpan...' : 'Simpan Data Pribadi'}
                                    </button>
                                </div>
                            </form>
                        </Kartu>

                        {/* PASSWORD */}
                        <Kartu
                            icon={FiKey}
                            judul="Keamanan Akun"
                            deskripsi="Biarkan kosong bila tidak ingin mengganti kata sandi."
                        >
                            <form onSubmit={simpanSandi} className="space-y-4" noValidate>
                                <Field
                                    id="password_lama"
                                    label="Password Saat Ini"
                                    error={sandi.errors.password_lama}
                                >
                                    <PasswordInput
                                        id="password_lama"
                                        value={sandi.data.password_lama}
                                        onChange={(e) => sandi.setData('password_lama', e.target.value)}
                                        placeholder="Masukkan password saat ini"
                                        show={showPassLama}
                                        onToggle={() => setShowPassLama((v) => !v)}
                                        error={sandi.errors.password_lama}
                                    />
                                </Field>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field
                                        id="password_baru"
                                        label="Password Baru"
                                        error={sandi.errors.password_baru}
                                        hint="Minimal 6 karakter."
                                    >
                                        <PasswordInput
                                            id="password_baru"
                                            value={sandi.data.password_baru}
                                            onChange={(e) => sandi.setData('password_baru', e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            show={showPassBaru}
                                            onToggle={() => setShowPassBaru((v) => !v)}
                                            error={sandi.errors.password_baru}
                                        />
                                    </Field>
                                    <Field
                                        id="password_baru_confirmation"
                                        label="Konfirmasi Password"
                                        error={sandi.errors.password_baru_confirmation}
                                    >
                                        <PasswordInput
                                            id="password_baru_confirmation"
                                            value={sandi.data.password_baru_confirmation}
                                            onChange={(e) =>
                                                sandi.setData('password_baru_confirmation', e.target.value)
                                            }
                                            placeholder="Ulangi password baru"
                                            show={showPassKonfirm}
                                            onToggle={() => setShowPassKonfirm((v) => !v)}
                                            error={sandi.errors.password_baru_confirmation}
                                        />
                                    </Field>
                                </div>

                                <div className="flex justify-end pt-1">
                                    <button
                                        type="submit"
                                        disabled={!adaIsiSandi || sandi.processing}
                                        className="h-10 px-4 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                    >
                                        <FiCheckCircle className="h-4 w-4" aria-hidden="true" />
                                        {sandi.processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                                    </button>
                                </div>
                            </form>
                        </Kartu>
                    </div>
                </div>
            </div>
        </GuruLayout>
    );
}

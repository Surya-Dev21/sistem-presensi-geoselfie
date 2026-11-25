import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { FiCheckCircle, FiKey, FiMail, FiSave, FiUser } from "react-icons/fi";
import AdminLayout from "@/components/admin-layout";
import { toastSuccess } from "@/lib/swal";

const KELAS_INPUT =
    "w-full rounded-xl border bg-white dark:bg-slate-800 text-sm py-2.5 px-3 text-slate-900 dark:text-slate-100 " +
    "transition focus:border-blue-800 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none";

const kelasBorder = (err) =>
    err ? "border-rose-400 dark:border-rose-600" : "border-slate-300 dark:border-slate-700";

function Field({ id, label, hint, error, children }) {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
                {label}
            </label>
            {children}
            {hint && !error && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{hint}</p>
            )}
            {error && (
                <p id={`${id}-error`} role="alert" className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function Profil({ admin }) {
    const akun = useForm({
        name: admin?.name ?? "",
        email: admin?.email ?? "",
    });
    const sandi = useForm({
        password_lama: "",
        password_baru: "",
        password_baru_confirmation: "",
    });
    const [showSandi, setShowSandi] = useState(false);

    const adaPerubahanAkun =
        akun.data.name !== (admin?.name ?? "") || akun.data.email !== (admin?.email ?? "");
    const adaIsiSandi = !!sandi.data.password_baru || !!sandi.data.password_lama;

    const simpanAkun = (e) => {
        e.preventDefault();
        akun.put("/admin/profil", {
            preserveScroll: true,
            onSuccess: () => toastSuccess("Profil admin berhasil diperbarui"),
        });
    };

    const simpanSandi = (e) => {
        e.preventDefault();
        sandi.put("/admin/profil", {
            preserveScroll: true,
            onSuccess: () => {
                sandi.reset();
                toastSuccess("Kata sandi berhasil diperbarui");
            },
        });
    };

    return (
        <AdminLayout title="Profil Admin">
            <Head title="Profil Admin - SIPRES Guru" />

            <div className="max-w-2xl space-y-4">
                <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                        Profil Admin
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Kelola nama, email, dan kata sandi akun admin sekolah.
                    </p>
                </div>

                <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <header className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                        <span className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                            <FiUser className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Data Akun</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Nama tampil di header panel admin.
                            </p>
                        </div>
                    </header>

                    <form onSubmit={simpanAkun} className="p-4 space-y-4" noValidate>
                        <Field id="name" label="Nama" error={akun.errors.name}>
                            <input
                                id="name"
                                type="text"
                                value={akun.data.name}
                                onChange={(e) => akun.setData("name", e.target.value)}
                                aria-invalid={!!akun.errors.name}
                                aria-describedby={akun.errors.name ? "name-error" : undefined}
                                className={`${KELAS_INPUT} ${kelasBorder(akun.errors.name)}`}
                                placeholder="Nama admin"
                            />
                        </Field>

                        <Field
                            id="email"
                            label="Email"
                            error={akun.errors.email}
                            hint="Dipakai untuk login admin."
                        >
                            <input
                                id="email"
                                type="email"
                                value={akun.data.email}
                                onChange={(e) => akun.setData("email", e.target.value)}
                                aria-invalid={!!akun.errors.email}
                                aria-describedby={akun.errors.email ? "email-error" : undefined}
                                className={`${KELAS_INPUT} ${kelasBorder(akun.errors.email)}`}
                                placeholder="admin@sekolah.sch.id"
                            />
                        </Field>

                        <div className="flex justify-end pt-1">
                            <button
                                type="submit"
                                disabled={!adaPerubahanAkun || akun.processing}
                                className="h-10 px-4 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                            >
                                <FiSave className="h-4 w-4" aria-hidden="true" />
                                {akun.processing ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <header className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                        <span className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                            <FiKey className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Keamanan Akun</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Biarkan kosong bila tidak mengganti kata sandi.
                            </p>
                        </div>
                    </header>

                    <form onSubmit={simpanSandi} className="p-4 space-y-4" noValidate>
                        <Field id="password_lama" label="Password Saat Ini" error={sandi.errors.password_lama}>
                            <input
                                id="password_lama"
                                type={showSandi ? "text" : "password"}
                                value={sandi.data.password_lama}
                                onChange={(e) => sandi.setData("password_lama", e.target.value)}
                                autoComplete="current-password"
                                className={`${KELAS_INPUT} ${kelasBorder(sandi.errors.password_lama)}`}
                                placeholder="Masukkan password saat ini"
                            />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                id="password_baru"
                                label="Password Baru"
                                error={sandi.errors.password_baru}
                                hint="Minimal 6 karakter."
                            >
                                <input
                                    id="password_baru"
                                    type={showSandi ? "text" : "password"}
                                    value={sandi.data.password_baru}
                                    onChange={(e) => sandi.setData("password_baru", e.target.value)}
                                    autoComplete="new-password"
                                    className={`${KELAS_INPUT} ${kelasBorder(sandi.errors.password_baru)}`}
                                    placeholder="Minimal 6 karakter"
                                />
                            </Field>

                            <Field
                                id="password_baru_confirmation"
                                label="Konfirmasi Password"
                                error={sandi.errors.password_baru_confirmation}
                            >
                                <input
                                    id="password_baru_confirmation"
                                    type={showSandi ? "text" : "password"}
                                    value={sandi.data.password_baru_confirmation}
                                    onChange={(e) => sandi.setData("password_baru_confirmation", e.target.value)}
                                    autoComplete="new-password"
                                    className={`${KELAS_INPUT} ${kelasBorder(sandi.errors.password_baru_confirmation)}`}
                                    placeholder="Ulangi password baru"
                                />
                            </Field>
                        </div>

                        <label className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            <input
                                type="checkbox"
                                checked={showSandi}
                                onChange={(e) => setShowSandi(e.target.checked)}
                                className="rounded border-slate-300"
                            />
                            Tampilkan kata sandi
                        </label>

                        <div className="flex justify-end pt-1">
                            <button
                                type="submit"
                                disabled={!adaIsiSandi || sandi.processing}
                                className="h-10 px-4 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                            >
                                <FiCheckCircle className="h-4 w-4" aria-hidden="true" />
                                {sandi.processing ? "Menyimpan..." : "Perbarui Kata Sandi"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </AdminLayout>
    );
}

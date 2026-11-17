import React, { useEffect, useRef, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    FiAlertCircle,
    FiCheckCircle,
    FiEye,
    FiEyeOff,
    FiLock,
} from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SCHOOL_LOGO = "/images/smkpbb.png";
const SCHOOL_NAME = "SMK Pembangunan Bandung Barat";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token || "",
        email: email || "",
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const passwordInputRef = useRef(null);

    useEffect(() => {
        passwordInputRef.current?.focus();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/reset-password");
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white px-4 py-12 sm:px-6 lg:px-8">
            <Head title="Reset Password - Portal SIPRES Guru" />

            <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                {/* Header Logo & Title */}
                <div className="flex flex-col items-center text-center space-y-3">
                    <img
                        src={SCHOOL_LOGO}
                        alt={`Logo ${SCHOOL_NAME}`}
                        width="64"
                        height="64"
                        className="h-16 w-16 object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
                    />
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Buat Password Baru
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600 max-w-xs">
                        Password baru minimal 6 karakter dan harus sama dengan konfirmasi password.
                    </p>
                </div>

                {/* Form Utama */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <input type="hidden" name="token" value={data.token} />

                    <div className="space-y-2">
                        <Label
                            htmlFor="email"
                            className="text-xs font-bold uppercase tracking-wide text-slate-700"
                        >
                            Alamat Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="nama@email.com"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={
                                errors.email ? "email-error" : undefined
                            }
                            className={`h-12 rounded-xl bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-all focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                                errors.email
                                    ? "border-red-500 focus-visible:border-red-500"
                                    : "border-slate-300 focus-visible:border-blue-600"
                            }`}
                        />
                        {errors.email && (
                            <p
                                id="email-error"
                                role="alert"
                                className="flex items-start gap-1.5 text-xs font-medium text-rose-600 mt-1"
                            >
                                <FiAlertCircle
                                    aria-hidden="true"
                                    className="mt-0.5 h-4 w-4 shrink-0"
                                />
                                <span>{errors.email}</span>
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="password"
                            className="text-xs font-bold uppercase tracking-wide text-slate-700"
                        >
                            Password Baru
                        </Label>
                        <div className="relative">
                            <FiLock
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                                ref={passwordInputRef}
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                placeholder="Minimal 6 karakter"
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={
                                    errors.password ? "password-error" : undefined
                                }
                                className={`h-12 rounded-xl bg-white pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                                    errors.password
                                        ? "border-red-500 focus-visible:border-red-500"
                                        : "border-slate-300 focus-visible:border-blue-600"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                                }
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? (
                                    <FiEyeOff className="h-5 w-5" />
                                ) : (
                                    <FiEye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p
                                id="password-error"
                                role="alert"
                                className="flex items-start gap-1.5 text-xs font-medium text-rose-600 mt-1"
                            >
                                <FiAlertCircle
                                    aria-hidden="true"
                                    className="mt-0.5 h-4 w-4 shrink-0"
                                />
                                <span>{errors.password}</span>
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="password_confirmation"
                            className="text-xs font-bold uppercase tracking-wide text-slate-700"
                        >
                            Konfirmasi Password Baru
                        </Label>
                        <div className="relative">
                            <FiLock
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                value={data.password_confirmation}
                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                placeholder="Ulangi password baru"
                                className="h-12 rounded-xl bg-white pl-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-slate-300 focus-visible:border-blue-600"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        aria-busy={processing}
                        className="h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm sm:text-base font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? (
                            <>
                                <span
                                    aria-hidden="true"
                                    className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                                />
                                <span>Menyimpan Password...</span>
                            </>
                        ) : (
                            <>
                                <span>Simpan Password Baru</span>
                                <FiCheckCircle aria-hidden="true" className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}

import { useEffect, useRef } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import {
    FiAlertCircle,
    FiArrowLeft,
    FiCheckCircle,
    FiMail,
    FiSend,
} from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SCHOOL_LOGO = "/images/smkpbb.png";
const SCHOOL_NAME = "SMK Pembangunan Bandung Barat";

export default function LupaPassword() {
    const pageProps = usePage().props;
    const status = pageProps.flash?.status || pageProps.status;

    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const emailInputRef = useRef(null);

    useEffect(() => {
        emailInputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (errors.email) {
            emailInputRef.current?.focus();
        }
    }, [errors.email]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/lupa-password");
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white px-4 py-12 sm:px-6 lg:px-8">
            <Head title="Lupa Password - Portal SIPRES Guru" />

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
                            Lupa Password?
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600 max-w-xs">
                        Masukkan email terdaftar Anda. Tautan untuk mengatur ulang kata sandi akan dikirimkan ke email tersebut.
                    </p>
                </div>

                {/* Status Success Alert */}
                {status && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm font-medium text-emerald-800"
                    >
                        <FiCheckCircle
                            aria-hidden="true"
                            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                        />
                        <span>{status}</span>
                    </div>
                )}

                {/* Form Utama */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label
                            htmlFor="email"
                            className="text-xs font-bold uppercase tracking-wide text-slate-700"
                        >
                            Alamat Email
                        </Label>

                        <div className="relative">
                            <FiMail
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                                ref={emailInputRef}
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
                                className={`h-12 rounded-xl bg-white pl-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                                    errors.email
                                        ? "border-red-500 focus-visible:border-red-500"
                                        : "border-slate-300 focus-visible:border-blue-600"
                                }`}
                            />
                        </div>

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
                                <span>Mengirim Tautan...</span>
                            </>
                        ) : (
                            <>
                                <span>Kirim Link Reset</span>
                                <FiSend aria-hidden="true" className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>

                {/* Back to Login */}
                <div className="border-t border-slate-100 pt-5 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md py-1 px-2"
                    >
                        <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
                        <span>Kembali ke halaman Login</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

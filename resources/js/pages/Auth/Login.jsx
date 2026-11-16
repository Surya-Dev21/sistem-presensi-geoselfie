import { useEffect, useRef, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    FiAlertCircle,
    FiArrowRight,
    FiCheckCircle,
    FiEye,
    FiEyeOff,
    FiLock,
    FiUser,
} from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SCHOOL_LOGO = "/images/smkpbb.png";
const LOGIN_URL = "/login";
const SCHOOL_NAME = "SMK Pembangunan Bandung Barat";

const EASE_OUT = [0.16, 1, 0.3, 1];

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset, transform } =
        useForm({
            identity: "",
            password: "",
            remember: false,
        });

    const [showPassword, setShowPassword] = useState(false);
    const identityInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.08,
                delayChildren: shouldReduceMotion ? 0 : 0.05,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: shouldReduceMotion ? 0 : 0.4,
                ease: EASE_OUT,
            },
        },
    };

    const formVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.06,
            },
        },
    };

    const errorVariants = {
        hidden: { opacity: 0, height: 0, marginTop: 0 },
        show: { opacity: 1, height: "auto", marginTop: 8 },
        exit: { opacity: 0, height: 0, marginTop: 0 },
    };

    // Fokus otomatis ke input pertama jika ada error validasi
    useEffect(() => {
        if (errors.identity && identityInputRef.current) {
            identityInputRef.current.focus();
        } else if (errors.password && passwordInputRef.current) {
            passwordInputRef.current.focus();
        }
    }, [errors]);

    // Hanya untuk membantu pengguna mengenali format input, bukan menentukan role.
    const identity = data.identity.trim();
    const looksLikeEmail = identity.includes("@");
    const looksLikeNip = /^\d+$/.test(identity) && identity.length > 0;

    const handleSubmit = (event) => {
        event.preventDefault();

        // Transform dipasang tepat sebelum submit agar tidak dipanggil saat render.
        transform((formData) => ({
            ...formData,
            identity: formData.identity.trim(),
            remember: formData.remember === true,
        }));

        post(LOGIN_URL, {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white lg:grid lg:grid-cols-2">
            <Head title="Masuk - Portal SIPRES Guru" />

            {/* Panel branding desktop */}
            <motion.section
                aria-label="Informasi SIPRES Guru"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-slate-900 bg-cover bg-center p-12 lg:flex"
                style={{
                    backgroundImage:
                        "url('https://media.istockphoto.com/id/2162363879/id/foto/kembali-ke-sekolah.jpg?s=612x612&w=0&k=20&c=9Vj13xWO-zwynejrCKDAyYd6EVcQq7jnsUiL-KK1ktg=')",
                }}
            >
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-t from-blue-950/95 via-blue-900/60 to-slate-950/20"
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-blue-950/15 mix-blend-multiply"
                />

                <motion.div
                    variants={itemVariants}
                    className="relative z-10 flex items-center gap-3"
                >
                    <img
                        src={SCHOOL_LOGO}
                        alt={`Logo ${SCHOOL_NAME}`}
                        width="64"
                        height="64"
                        className="h-14 w-14 object-contain drop-shadow-md transition-transform duration-300 hover:scale-105 sm:h-16 sm:w-16"
                    />
                    <div>
                        <p className="text-lg font-bold tracking-wide text-white drop-shadow-md">
                            SIPRES GURU
                        </p>
                        <p className="text-xs font-medium text-blue-100 drop-shadow-md">
                            {SCHOOL_NAME}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="relative z-10 my-auto max-w-xl space-y-6 py-16"
                >
                    <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg xl:text-5xl">
                        Membangun Disiplin,
                        <span className="block text-blue-300">
                            Mencerdaskan Bangsa.
                        </span>
                    </h2>
                    <p className="max-w-lg text-sm font-medium leading-relaxed text-blue-50 drop-shadow-md xl:text-base">
                        Sistem manajemen kehadiran guru terpadu untuk mendukung
                        produktivitas dan kualitas pendidikan di <br />
                        {SCHOOL_NAME}.
                    </p>
                </motion.div>
            </motion.section>

            {/* Panel form login */}
            <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 py-10 sm:px-12 lg:px-10 xl:px-16">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="w-full max-w-md space-y-8"
                >
                    {/* Branding mobile */}
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center gap-3 lg:hidden"
                    >
                        <img
                            src={SCHOOL_LOGO}
                            alt={`Logo ${SCHOOL_NAME}`}
                            width="44"
                            height="44"
                            className="h-11 w-11 object-contain drop-shadow-sm"
                        />
                        <div>
                            <p className="text-base font-bold text-slate-900">
                                SIPRES Guru
                            </p>
                            <p className="text-[11px] text-slate-500">
                                {SCHOOL_NAME}
                            </p>
                        </div>
                    </motion.div>

                    <motion.header
                        variants={itemVariants}
                        className="space-y-2"
                    >
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Selamat Datang Kembali
                        </h1>
                        <p className="text-sm leading-relaxed text-slate-500">
                            Silakan masuk menggunakan NIP atau email yang sudah
                            terdaftar.
                        </p>
                    </motion.header>

                    <AnimatePresence initial={false}>
                        {status && (
                            <motion.div
                                key="login-status"
                                role="status"
                                aria-live="polite"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700"
                            >
                                <FiCheckCircle
                                    aria-hidden="true"
                                    className="mt-0.5 h-5 w-5 shrink-0"
                                />
                                <span>{status}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.form
                        variants={formVariants}
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* NIP / Email */}
                        <motion.div
                            variants={itemVariants}
                            className="space-y-2"
                        >
                            <div className="flex min-h-5 items-center justify-between gap-2">
                                <Label
                                    htmlFor="identity"
                                    className="text-xs font-bold uppercase tracking-wide text-slate-700"
                                >
                                    NIP / Email
                                </Label>

                                {looksLikeEmail && (
                                    <Badge className="border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700 shadow-none">
                                        Login Admin
                                    </Badge>
                                )}
                                {looksLikeNip && (
                                    <Badge className="border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 shadow-none">
                                        Login Guru
                                    </Badge>
                                )}
                            </div>

                            <div className="relative">
                                <FiUser
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                                />
                                <Input
                                    ref={identityInputRef}
                                    id="identity"
                                    name="identity"
                                    type="text"
                                    autoComplete="username"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    required
                                    value={data.identity}
                                    onChange={(event) =>
                                        setData("identity", event.target.value)
                                    }
                                    placeholder="Masukkan NIP atau email..."
                                    aria-invalid={Boolean(errors.identity)}
                                    aria-describedby={
                                        errors.identity
                                            ? "identity-error"
                                            : undefined
                                    }
                                    className={`h-12 rounded-xl border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                                        errors.identity
                                            ? "border-red-500 focus-visible:border-red-50"
                                            : "focus-visible:border-blue-600 border-slate-300"
                                    }`}
                                />
                            </div>

                            <AnimatePresence initial={false}>
                                {errors.identity && (
                                    <motion.p
                                        key="identity-error"
                                        id="identity-error"
                                        role="alert"
                                        variants={errorVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                        className="flex items-start gap-1.5 overflow-hidden text-xs font-medium text-rose-600"
                                    >
                                        <FiAlertCircle
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0"
                                        />
                                        <span>{errors.identity}</span>
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Password */}
                        <motion.div
                            variants={itemVariants}
                            className="space-y-2"
                        >
                            <Label
                                htmlFor="password"
                                className="text-xs font-bold uppercase tracking-wide text-slate-700"
                            >
                                Kata Sandi
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
                                    autoComplete="current-password"
                                    required
                                    value={data.password}
                                    onChange={(event) =>
                                        setData("password", event.target.value)
                                    }
                                    placeholder="Masukkan kata sandi..."
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={
                                        errors.password
                                            ? "password-error"
                                            : undefined
                                    }
                                    className={`h-12 rounded-xl border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                                        errors.password
                                            ? "border-red-500 focus-visible:border-red-50"
                                            : "focus-visible:border-blue-600 border-slate-300"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((current) => !current)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Sembunyikan kata sandi"
                                            : "Tampilkan kata sandi"
                                    }
                                    aria-pressed={showPassword}
                                    className="absolute right-0 top-0 flex h-12 items-center rounded-r-xl px-3.5 text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                                >
                                    <AnimatePresence
                                        mode="wait"
                                        initial={false}
                                    >
                                        <motion.span
                                            key={
                                                showPassword ? "hide" : "reveal"
                                            }
                                            initial={{
                                                opacity: 0,
                                                scale: 0.8,
                                                rotate: shouldReduceMotion
                                                    ? 0
                                                    : -15,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                rotate: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                scale: 0.8,
                                                rotate: shouldReduceMotion
                                                    ? 0
                                                    : 15,
                                            }}
                                            transition={{ duration: 0.15 }}
                                            className="flex"
                                        >
                                            {showPassword ? (
                                                <FiEyeOff
                                                    aria-hidden="true"
                                                    className="h-5 w-5"
                                                />
                                            ) : (
                                                <FiEye
                                                    aria-hidden="true"
                                                    className="h-5 w-5"
                                                />
                                            )}
                                        </motion.span>
                                    </AnimatePresence>
                                </button>
                            </div>

                            <AnimatePresence initial={false}>
                                {errors.password && (
                                    <motion.p
                                        key="password-error"
                                        id="password-error"
                                        role="alert"
                                        variants={errorVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                        className="flex items-start gap-1.5 overflow-hidden text-xs font-medium text-rose-600"
                                    >
                                        <FiAlertCircle
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0"
                                        />
                                        <span>{errors.password}</span>
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Remember me & Lupa Password */}
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center justify-between pt-1"
                        >
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) =>
                                        setData("remember", checked === true)
                                    }
                                    className="rounded border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer select-none text-sm font-medium text-slate-600"
                                >
                                    Ingat Saya
                                </Label>
                            </div>

                            <Link
                                href="/lupa-password"
                                className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded"
                            >
                                Lupa password?
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            whileHover={
                                shouldReduceMotion ? undefined : { scale: 1.01 }
                            }
                            whileTap={
                                shouldReduceMotion
                                    ? undefined
                                    : { scale: 0.985 }
                            }
                            className="mt-2"
                        >
                            <Button
                                type="submit"
                                disabled={processing}
                                aria-busy={processing}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={processing ? "processing" : "idle"}
                                        initial={{
                                            opacity: 0,
                                            y: shouldReduceMotion ? 0 : 6,
                                        }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{
                                            opacity: 0,
                                            y: shouldReduceMotion ? 0 : -6,
                                        }}
                                        transition={{ duration: 0.15 }}
                                        className="flex items-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <span
                                                    aria-hidden="true"
                                                    className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                                                />
                                                <span>Memverifikasi...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Masuk</span>
                                                <FiArrowRight
                                                    aria-hidden="true"
                                                    className="h-5 w-5"
                                                />
                                            </>
                                        )}
                                    </motion.span>
                                </AnimatePresence>
                            </Button>
                        </motion.div>
                    </motion.form>

                    <motion.footer
                        variants={itemVariants}
                        className="flex flex-col gap-3 border-t border-slate-100 pt-6 text-center"
                    >
                        <p className="text-xs leading-relaxed text-slate-500">
                            Kendala akun atau lupa password? Hubungi{" "}
                            <span className="font-semibold text-blue-700">
                                Tim IT Sekolah
                            </span>
                            .
                        </p>
                        <p className="text-[10px] text-slate-400">
                            © {new Date().getFullYear()} {SCHOOL_NAME}. All
                            rights reserved.
                        </p>
                    </motion.footer>
                </motion.div>
            </main>
        </div>
    );
}

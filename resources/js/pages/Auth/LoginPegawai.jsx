import React from "react";
import { Head, useForm, Link } from "@inertiajs/react"; // 1. PERBAIKAN: Import Link dari Inertia

export default function LoginPegawai() {
    const { data, setData, post, processing, errors } = useForm({
        nip: "",
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <Head title="Login Guru - SIMAG" />

            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="text-center mb-6">
                    <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                        Portal Guru
                    </span>
                    <h1 className="text-2xl font-bold text-gray-800 mt-3">
                        Masuk ke Sistem
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Silakan masukkan NIP/NUPTK dan Password Anda
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Input NIP */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            NIP/NUPTK
                        </label>
                        <input
                            type="text"
                            value={data.nip}
                            onChange={(e) => setData("nip", e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                                errors.nip
                                    ? "border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder="Contoh: 195808181984042001"
                        />
                        {errors.nip && (
                            <div className="text-red-500 text-xs mt-1">
                                {errors.nip}
                            </div>
                        )}
                    </div>

                    {/* Input Password & Link Lupa Password */}
                    <div>
                        {/* 2. PERBAIKAN: Tata letak Flexbox antara Label dan Link Lupa Password */}
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Password
                            </label>

                            {/* SKENARIO 3: Link menuju rute Lupa Password */}
                            <Link
                                href="/lupa-password"
                                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                Lupa Password?
                            </Link>
                        </div>

                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                                errors.password
                                    ? "border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder="••••••••••"
                        />
                        {errors.password && (
                            <div className="text-red-500 text-xs mt-1">
                                {errors.password}
                            </div>
                        )}
                    </div>

                    {/* Tombol Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 shadow-sm disabled:opacity-50 mt-2"
                    >
                        {processing ? "Memproses..." : "Masuk"}
                    </button>
                </form>

                {/* Tombol Kembali ke Halaman Utama (Opsional, tapi bagus untuk UX) */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="text-sm text-gray-500 hover:text-gray-700 transition"
                    >
                        &larr; Kembali ke Halaman Utama
                    </Link>
                </div>
            </div>
        </div>
    );
}

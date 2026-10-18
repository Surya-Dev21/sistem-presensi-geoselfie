import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function LupaPassword() {
    // Mengambil flash message 'status' dari Controller (Skenario 4)
    const { status } = usePage().props.flash || {}; 

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/lupa-password');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Head title="Lupa Password" />

            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Lupa Password?</h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang password Anda.
                </p>

                {/* Skenario 4: Menampilkan pesan sukses pengiriman email */}
                {status && (
                    <div className="mb-4 p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                        {status}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alamat Email
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border ${
                                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            } focus:outline-none focus:ring-2`}
                            placeholder="nama@email.com"
                            required
                        />
                        {/* Skenario 5: Menampilkan pesan error jika email salah/tidak ada */}
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition duration-200"
                    >
                        {processing ? 'Mengirim...' : 'Kirim Link Reset'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm text-blue-600 hover:underline font-medium">
                        &larr; Kembali ke halaman Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function LoginAdmin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
            <Head title="Login Admin - E-Absen" />
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-6">
                    <span className="bg-purple-50 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full">
                        Portal Administrator
                    </span>
                    <h1 className="text-2xl font-bold text-gray-800 mt-3">Admin Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Masuk menggunakan akun pengelola</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Administrator</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                            placeholder="admin@sekolah.sch.id"
                        />
                        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                            placeholder="••••••••"
                        />
                        {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200 shadow-sm disabled:opacity-50"
                    >
                        {processing ? 'Memproses...' : 'Masuk sebagai Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}
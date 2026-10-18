import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { FiArrowLeft, FiUser, FiSave, FiAlertTriangle, FiEye, FiEyeOff, FiLock } from 'react-icons/fi';

export default function Profil({ pegawai }) {
    const [showModal, setShowModal] = useState(false);
    const [showPassLama, setShowPassLama] = useState(false);
    const [showPassBaru, setShowPassBaru] = useState(false);
    const [showPassKonfirmasi, setShowPassKonfirmasi] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        nama: pegawai.nama || '',
        email: pegawai.email || '',
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
        <div className="min-h-screen bg-slate-50 pb-12 font-sans">
            <Head title="Profil Pegawai" />

            <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center mb-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiUser className="text-purple-500" /> Profil Pegawai
                </h1>
                <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-semibold hover:underline text-sm">
                    <FiArrowLeft /> Kembali ke Dashboard
                </Link>
            </div>

            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <form onSubmit={triggerConfirm} className="space-y-5">
                        
                        {/* READ-ONLY FIELD (NIP) */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">NIP (Nomor Induk Pegawai)</label>
                                <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-bold uppercase">Read-Only</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={pegawai.nip}
                                    disabled
                                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-600 text-sm font-semibold cursor-not-allowed pl-10 py-2.5"
                                />
                                <FiLock className="absolute left-3.5 top-3.5 text-gray-400" />
                            </div>
                        </div>

                        {/* EDITABLE FIELD (NAMA & EMAIL) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                            <input
                                type="text"
                                value={data.nama}
                                onChange={e => setData('nama', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-0 text-sm font-medium py-2.5 px-3.5 bg-white"
                            />
                            {errors.nama && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.nama}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Alamat Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-0 text-sm font-medium py-2.5 px-3.5 bg-white"
                            />
                            {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>}
                        </div>

                        <hr className="my-6 border-gray-200" />
                        
                        <div className="mb-2">
                            <p className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Ubah Kata Sandi</p>
                            <p className="text-[11px] text-gray-500 font-medium">Biarkan kosong jika tidak ingin memperbarui password.</p>
                        </div>

                        {/* PASSWORD SAAT INI */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Password Saat Ini</label>
                            <div className="relative">
                                <input
                                    type={showPassLama ? 'text' : 'password'}
                                    value={data.password_lama}
                                    onChange={e => setData('password_lama', e.target.value)}
                                    placeholder="Masukkan password lama"
                                    className="w-full rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-0 text-sm font-medium py-2.5 pl-3.5 pr-11 bg-white"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassLama(!showPassLama)}
                                    className="absolute right-3.5 top-3 text-gray-500 hover:text-blue-600 transition p-1"
                                >
                                    {showPassLama ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password_lama && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password_lama}</p>}
                        </div>

                        {/* PASSWORD BARU & KONFIRMASI */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Password Baru (Min. 6 Karakter)</label>
                                <div className="relative">
                                    <input
                                        type={showPassBaru ? 'text' : 'password'}
                                        value={data.password_baru}
                                        onChange={e => setData('password_baru', e.target.value)}
                                        placeholder="Min. 6 karakter"
                                        className="w-full rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-0 text-sm font-medium py-2.5 pl-3.5 pr-11 bg-white"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassBaru(!showPassBaru)}
                                        className="absolute right-3.5 top-3 text-gray-500 hover:text-blue-600 transition p-1"
                                    >
                                        {showPassBaru ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password_baru && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password_baru}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Konfirmasi Password Baru</label>
                                <div className="relative">
                                    <input
                                        type={showPassKonfirmasi ? 'text' : 'password'}
                                        value={data.password_baru_confirmation}
                                        onChange={e => setData('password_baru_confirmation', e.target.value)}
                                        placeholder="Ulangi password baru"
                                        className="w-full rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-0 text-sm font-medium py-2.5 pl-3.5 pr-11 bg-white"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassKonfirmasi(!showPassKonfirmasi)}
                                        className="absolute right-3.5 top-3 text-gray-500 hover:text-blue-600 transition p-1"
                                    >
                                        {showPassKonfirmasi ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm rounded-xl shadow-md transition flex justify-center items-center gap-2 active:scale-98 disabled:bg-gray-300"
                        >
                            <FiSave /> Simpan Perubahan Profil
                        </button>
                    </form>
                </div>
            </div>

            {/* MODAL KONFIRMASI */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center animate-fade-in">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <FiAlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800">Konfirmasi Pembaruan</h3>
                        <p className="text-xs text-gray-500 mt-2">
                            Apakah Anda yakin ingin menyimpan perubahan pada profil ini?
                        </p>

                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmSave}
                                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md"
                            >
                                Ya, Perbarui
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
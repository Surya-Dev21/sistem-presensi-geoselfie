import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { FiArrowLeft, FiFileText, FiSend, FiClock, FiUploadCloud, FiLoader } from 'react-icons/fi';

export default function Izin({ riwayatIzin }) {
    const [namaFile, setNamaFile] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        jenis_izin: 'Izin',
        tgl_mulai: '',
        tgl_selesai: '',
        alasan: '',
        dokumen: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNamaFile(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
            setData('dokumen', file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/izin');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12 font-sans">
            <Head title="Pengajuan Izin" />

            <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center mb-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiFileText className="text-amber-500" /> Pengajuan Izin
                </h1>
                <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-semibold hover:underline text-sm">
                    <FiArrowLeft /> Kembali ke Dashboard
                </Link>
            </div>

            <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* FORM PENGAJUAN */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                    <h2 className="font-bold text-gray-800 text-sm mb-4">Isi Permohonan Izin / Cuti</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Jenis Permohonan</label>
                            <select
                                value={data.jenis_izin}
                                onChange={e => setData('jenis_izin', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-0 text-sm font-medium py-2.5 px-3 bg-white"
                            >
                                <option value="Izin">Izin Keperluan Halangan</option>
                                <option value="Sakit">Sakit</option>
                                <option value="Cuti">Cuti Tahunan</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Mulai Tanggal</label>
                                <input
                                    type="date"
                                    value={data.tgl_mulai}
                                    onChange={e => setData('tgl_mulai', e.target.value)}
                                    className="w-full rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-0 text-sm font-medium py-2 px-3 bg-white"
                                />
                                {errors.tgl_mulai && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.tgl_mulai}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Sampai Tanggal</label>
                                <input
                                    type="date"
                                    value={data.tgl_selesai}
                                    onChange={e => setData('tgl_selesai', e.target.value)}
                                    className="w-full rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-0 text-sm font-medium py-2 px-3 bg-white"
                                />
                                {errors.tgl_selesai && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.tgl_selesai}</p>}
                            </div>
                        </div>

                        {/* TEXTAREA ALASAN DENGAN BORDER TEGAS */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Alasan Permohonan</label>
                            <textarea
                                name="alasan"
                                rows={5}
                                value={data.alasan}
                                onChange={e => setData('alasan', e.target.value)}
                                placeholder="Jelaskan secara rinci alasan permohonan Anda..."
                                className="w-full rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-0 text-sm p-3.5 font-medium leading-relaxed resize-none bg-white"
                            ></textarea>
                            {errors.alasan && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.alasan}</p>}
                        </div>

                        {/* UPLOAD DOKUMEN */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Dokumen Pendukung (Lampiran)</label>
                            <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-4 text-center transition bg-slate-50 relative cursor-pointer">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <FiUploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                                <p className="text-xs font-bold text-gray-700">
                                    {namaFile ? namaFile : 'Pilih file atau seret ke sini'}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Format pendukung: PDF, JPG, PNG (Maks. 2MB)</p>
                            </div>
                            {errors.dokumen && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.dokumen}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md transition flex justify-center items-center gap-2 active:scale-98 disabled:bg-gray-300"
                        >
                            {processing ? (
                                <><FiLoader className="animate-spin w-4 h-4" /> Mengirimkan Data...</>
                            ) : (
                                <><FiSend /> Kirim Permohonan Izin</>
                            )}
                        </button>
                    </form>
                </div>

                {/* RIWAYAT PENGAJUAN */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                    <h2 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                        <FiClock className="text-blue-600" /> Riwayat Permohonan Saya
                    </h2>

                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                        {riwayatIzin && riwayatIzin.length > 0 ? (
                            riwayatIzin.map((item) => (
                                <div key={item.id} className="p-4 rounded-2xl border border-gray-200 bg-slate-50 flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                            {item.jenis_izin}
                                        </span>
                                        <p className="text-xs font-bold text-gray-800 mt-2">
                                            {item.tgl_mulai} s/d {item.tgl_selesai}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.alasan}</p>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full font-black border ${
                                        item.status === 'Disetujui' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' :
                                        item.status === 'Ditolak' ? 'bg-rose-100 border-rose-300 text-rose-800' : 'bg-amber-100 border-amber-300 text-amber-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <FiFileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-400">Belum ada riwayat pengajuan izin.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
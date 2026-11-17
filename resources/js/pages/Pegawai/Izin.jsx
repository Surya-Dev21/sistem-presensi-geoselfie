import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { FiFileText, FiSend, FiClock, FiUploadCloud, FiCalendar } from 'react-icons/fi';
import GuruLayout from '@/components/guru-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Izin({ riwayatIzin = [] }) {
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
        <GuruLayout title="Pengajuan Izin">
            <Head title="Pengajuan Izin - Portal SIMAG" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Permohonan Izin & Cuti
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Kirimkan permohonan izin tidak masuk atau cuti kerja beserta dokumen pendukung.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FORM PENGAJUAN */}
                    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <FiFileText className="text-amber-500" />
                                Formulir Permohonan Izin
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 pt-2">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Jenis Permohonan
                                    </label>
                                    <select
                                        value={data.jenis_izin}
                                        onChange={e => setData('jenis_izin', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-0 text-sm font-semibold py-2.5 px-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition"
                                    >
                                        <option value="Izin">Izin (Urusan Mendesak)</option>
                                        <option value="Sakit">Sakit</option>
                                        <option value="Cuti">Cuti Tahunan / Melahirkan</option>
                                    </select>
                                    {errors.jenis_izin && <p className="text-xs text-rose-500 mt-1">{errors.jenis_izin}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Tanggal Mulai
                                        </label>
                                        <input
                                            type="date"
                                            value={data.tgl_mulai}
                                            onChange={e => setData('tgl_mulai', e.target.value)}
                                            required
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-0 text-sm font-medium py-2.5 px-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition"
                                        />
                                        {errors.tgl_mulai && <p className="text-xs text-rose-500 mt-1">{errors.tgl_mulai}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Tanggal Selesai
                                        </label>
                                        <input
                                            type="date"
                                            value={data.tgl_selesai}
                                            onChange={e => setData('tgl_selesai', e.target.value)}
                                            required
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-0 text-sm font-medium py-2.5 px-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition"
                                        />
                                        {errors.tgl_selesai && <p className="text-xs text-rose-500 mt-1">{errors.tgl_selesai}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Keterangan / Alasan
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={data.alasan}
                                        onChange={e => setData('alasan', e.target.value)}
                                        placeholder="Jelaskan alasan izin Anda secara singkat dan jelas..."
                                        required
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-0 text-sm font-medium p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition"
                                    ></textarea>
                                    {errors.alasan && <p className="text-xs text-rose-500 mt-1">{errors.alasan}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Bukti Dokumen / Surat Dokter (Opsional)
                                    </label>
                                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                        <FiUploadCloud className="text-slate-400 text-2xl mb-1" />
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center">
                                            {namaFile || "Pilih foto surat atau berkas PDF (Maks. 2MB)"}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {errors.dokumen && <p className="text-xs text-rose-500 mt-1">{errors.dokumen}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 transition flex justify-center items-center gap-2 active:scale-98 disabled:opacity-60"
                                >
                                    <FiSend className="h-4 w-4" />
                                    <span>Kirim Permohonan Izin</span>
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* RIWAYAT PENGAJUAN */}
                    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <FiClock className="text-blue-600 dark:text-blue-400" />
                                Riwayat Permohonan Terakhir
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 pt-2 flex-1">
                            {riwayatIzin && riwayatIzin.length > 0 ? (
                                <div className="space-y-3">
                                    {riwayatIzin.map((item, index) => (
                                        <div key={index} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{item.jenis_izin}</span>
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                                    item.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                                    item.status === 'Ditolak' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                                                <FiCalendar className="text-slate-400" /> {item.tgl_mulai} s/d {item.tgl_selesai}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                                                "{item.alasan}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
                                    <FiFileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                    <p className="text-xs">Belum ada riwayat permohonan izin yang diajukan.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </GuruLayout>
    );
}

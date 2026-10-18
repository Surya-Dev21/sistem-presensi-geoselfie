import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiClock, FiFileText, FiAlertTriangle, FiSearch } from 'react-icons/fi';

export default function RiwayatPresensi({ riwayat, statistik, filter }) {
    
    // Fungsi untuk handle perubahan filter bulan/tahun
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        router.get('/kalender', {
            ...filter,
            [name]: value
        }, { preserveState: true, replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12 font-sans">
            <Head title="Riwayat Presensi" />

            {/* HEADER */}
            <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center mb-6 border-b border-gray-200 sticky top-0 z-30">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiCalendar className="text-blue-600" /> Riwayat Presensi
                </h1>
                <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-semibold hover:underline text-sm">
                    <FiArrowLeft /> Kembali ke Dashboard
                </Link>
            </div>

            <div className="max-w-6xl mx-auto px-4 space-y-6">
                
                {/* 1. STATISTIK CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
                            <FiCheckCircle />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Hadir</p>
                            <h3 className="text-2xl font-black text-emerald-700">{statistik.hadir} <span className="text-sm font-medium text-emerald-600">Hari</span></h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl">
                            <FiFileText />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Izin / Sakit</p>
                            <h3 className="text-2xl font-black text-amber-700">{statistik.izin_sakit} <span className="text-sm font-medium text-amber-600">Hari</span></h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl">
                            <FiAlertTriangle />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tanpa Keterangan (Alpa)</p>
                            <h3 className="text-2xl font-black text-rose-700">{statistik.alpa} <span className="text-sm font-medium text-rose-600">Hari</span></h3>
                        </div>
                    </div>
                </div>

                {/* 2. FILTER & TABLE SECTION */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    
                    {/* Filter Bar */}
                    <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <FiClock className="text-blue-500" /> Aktivitas Presensi
                        </h2>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <FiSearch className="text-gray-400 hidden sm:block" />
                            <select 
                                name="bulan"
                                value={filter.bulan}
                                onChange={handleFilterChange}
                                className="w-full sm:w-auto rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-sm font-semibold py-2 px-3 text-gray-700"
                            >
                                <option value="01">Januari</option>
                                <option value="02">Februari</option>
                                <option value="03">Maret</option>
                                <option value="04">April</option>
                                <option value="05">Mei</option>
                                <option value="06">Juni</option>
                                <option value="07">Juli</option>
                                <option value="08">Agustus</option>
                                <option value="09">September</option>
                                <option value="10">Oktober</option>
                                <option value="11">November</option>
                                <option value="12">Desember</option>
                            </select>

                            <select 
                                name="tahun"
                                value={filter.tahun}
                                onChange={handleFilterChange}
                                className="w-full sm:w-auto rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-sm font-semibold py-2 px-3 text-gray-700"
                            >
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                            </select>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 border-b border-gray-100">Tanggal</th>
                                    <th className="px-6 py-4 border-b border-gray-100">Status</th>
                                    <th className="px-6 py-4 border-b border-gray-100 text-center">Jam Masuk</th>
                                    <th className="px-6 py-4 border-b border-gray-100 text-center">Jam Pulang</th>
                                    <th className="px-6 py-4 border-b border-gray-100">Catatan Sistem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {riwayat && riwayat.length > 0 ? (
                                    riwayat.map((item, index) => {
                                        // Format string tanggal
                                        const tglFormatted = new Date(item.tgl_absen).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                                        
                                        // Penentuan Badge Status
                                        let statusBadge = '';
                                        if (item.status === 'Hadir') statusBadge = 'bg-emerald-100 border-emerald-200 text-emerald-700';
                                        else if (item.status === 'Izin' || item.status === 'Sakit') statusBadge = 'bg-amber-100 border-amber-200 text-amber-700';
                                        else statusBadge = 'bg-rose-100 border-rose-200 text-rose-700';

                                        return (
                                            <tr key={item.id || index} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-gray-800">
                                                    {tglFormatted}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border ${statusBadge}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`font-bold ${item.jam_masuk ? 'text-gray-800' : 'text-gray-400'}`}>
                                                        {item.jam_masuk ? item.jam_masuk.substring(0, 5) : '--:--'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`font-bold ${item.jam_keluar ? 'text-gray-800' : 'text-gray-400'}`}>
                                                        {item.jam_keluar ? item.jam_keluar.substring(0, 5) : '--:--'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {/* Nanti bisa disesuaikan dengan logika Telat/Tepat Waktu dari Jadwal */}
                                                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-lg">
                                                        {item.status === 'Hadir' ? 'Terekam Sistem' : 'Berdasarkan Pengajuan'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <FiCalendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">Belum ada data presensi pada bulan ini.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
}
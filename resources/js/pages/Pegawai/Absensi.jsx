import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Webcam from 'react-webcam';
import {
    FiCamera,
    FiRefreshCw,
    FiCheckCircle,
    FiMapPin,
    FiExternalLink,
    FiInfo,
    FiClock,
} from 'react-icons/fi';
import GuruLayout from '@/components/guru-layout';

// Koordinat sekolah hanya dipakai untuk info jarak (radius TIDAK mengunci presensi)
const SEKOLAH_LAT = -6.911144528139905;
const SEKOLAH_LNG = 107.33306286656926;
const RADIUS_INFO = 100; // meter

// Haversine: jarak dua koordinat dalam meter
function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
}

export default function Absensi({ absenHariIni = {} }) {
    const webcamRef = useRef(null);

    const sudahMasuk = Boolean(absenHariIni?.sudah_masuk);
    const sudahPulang = Boolean(absenHariIni?.sudah_pulang);
    const presensiLengkap = sudahMasuk && sudahPulang;
    const tipeOtomatis = sudahMasuk && !sudahPulang ? 'pulang' : 'masuk';

    const { data, setData, post, processing, errors } = useForm({
        tipe_absen: tipeOtomatis,
        latitude: '',
        longitude: '',
        jarak: '',
        foto: '',
    });

    const [jarak, setJarak] = useState(null);
    const [pesanLokasi, setPesanLokasi] = useState('Mencari titik GPS perangkat...');
    const [gpsSiap, setGpsSiap] = useState(false);
    const [fotoUri, setFotoUri] = useState(null);

    // Live tracking lokasi: radius bebas, jarak hanya dicatat sebagai rekam jejak
    useEffect(() => {
        if (!navigator.geolocation) {
            setPesanLokasi('Browser tidak mendukung GPS');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const d = hitungJarak(lat, lng, SEKOLAH_LAT, SEKOLAH_LNG);

                setJarak(d);
                setGpsSiap(true);
                setPesanLokasi(
                    d <= RADIUS_INFO
                        ? `Titik GPS terkunci (dalam radius, ${d} m dari sekolah)`
                        : `Titik GPS terkunci (luar radius, ${d} m dari sekolah)`,
                );
                setData((prev) => ({ ...prev, latitude: lat, longitude: lng, jarak: d }));
            },
            () => {
                setGpsSiap(false);
                setPesanLokasi('Gagal mengambil titik GPS. Pastikan izin lokasi aktif.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Tipe absen dari query string (?tipe=pulang) bila masih valid
    useEffect(() => {
        const tipe = new URLSearchParams(window.location.search).get('tipe');
        if (tipe === 'pulang' && sudahMasuk && !sudahPulang) setData('tipe_absen', 'pulang');
        if (tipe === 'masuk' && !sudahMasuk) setData('tipe_absen', 'masuk');
    }, []);

    const pilihTipe = (tipe) => {
        if (tipe === 'masuk' && sudahMasuk) return;
        if (tipe === 'pulang' && (!sudahMasuk || sudahPulang)) return;
        setData('tipe_absen', tipe);
    };

    const ambilFoto = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;
        setFotoUri(imageSrc);
        setData('foto', imageSrc);
    };

    const ulangFoto = () => {
        setFotoUri(null);
        setData('foto', '');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/absensi');
    };

    const koordinatSiap = Boolean(data.latitude && data.longitude);
    const bisaKirim = koordinatSiap && Boolean(fotoUri) && !processing;

    return (
        <GuruLayout title="Presensi Harian">
            <Head title="Presensi Geoselfie - Portal SIMAG" />

            <div className="max-w-5xl mx-auto space-y-3.5">
                {/* HERO BANNER (selaras Dashboard) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white p-4.5 sm:p-5 shadow-sm border border-blue-800">
                    <div className="relative z-10 max-w-xl space-y-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/15 text-blue-100">
                            Presensi Geoselfie
                        </span>
                        <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                            Presensi Harian Geoselfie
                        </h2>
                        <p className="text-[11px] text-blue-100 leading-relaxed">
                            Ambil swafoto dan pastikan titik GPS aktif sebelum mengirim data kehadiran.
                        </p>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                </div>

                {/* STATUS LENGKAP */}
                {presensiLengkap ? (
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 p-4 shadow-xs">
                        <div className="flex items-center gap-2">
                            <FiCheckCircle className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    Presensi Hari Ini Lengkap
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Kehadiran Anda sudah tercatat masuk dan pulang.
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Masuk</p>
                                <p className="text-sm font-black text-blue-900 dark:text-blue-200 tabular-nums">
                                    {absenHariIni?.jam_masuk ?? '--:--'} WIB
                                </p>
                            </div>
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pulang</p>
                                <p className="text-sm font-black text-blue-900 dark:text-blue-200 tabular-nums">
                                    {absenHariIni?.jam_keluar ?? '--:--'} WIB
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/kalender"
                            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold bg-blue-800 text-white hover:bg-blue-900 transition-colors"
                        >
                            Lihat Riwayat Presensi
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                        {/* KOLOM KIRI: KAMERA */}
                        <div className="lg:col-span-7">
                            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs h-full">
                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                    <div className="flex items-center gap-2">
                                        <FiCamera className="h-4 w-4 text-blue-800 dark:text-blue-300" />
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                                            Kamera Swafoto
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                                        Presensi {data.tipe_absen}
                                    </span>
                                </div>

                                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                                    {fotoUri ? (
                                        <img src={fotoUri} alt="Swafoto presensi" className="w-full h-full object-cover" />
                                    ) : (
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            videoConstraints={{ facingMode: 'user' }}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                <div className="mt-3">
                                    {!fotoUri ? (
                                        <button
                                            type="button"
                                            onClick={ambilFoto}
                                            className="w-full h-10 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                                        >
                                            <FiCamera className="h-4 w-4" /> Ambil Swafoto
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={ulangFoto}
                                            className="w-full h-10 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <FiRefreshCw className="h-4 w-4" /> Ambil Ulang Swafoto
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* KOLOM KANAN: PETA & FORM */}
                        <div className="lg:col-span-5 space-y-3.5">
                            {/* PETA OPENSTREETMAP */}
                            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs">
                                <div className="flex items-center gap-2 mb-2.5">
                                    <FiMapPin className="h-4 w-4 text-blue-800 dark:text-blue-300" />
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                                        Titik Lokasi Anda
                                    </h3>
                                </div>

                                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 relative h-44 sm:h-48">
                                    {koordinatSiap ? (
                                        <iframe
                                            title="Peta Lokasi Presensi"
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight="0"
                                            marginWidth="0"
                                            loading="lazy"
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(data.longitude) - 0.005}%2C${Number(data.latitude) - 0.005}%2C${Number(data.longitude) + 0.005}%2C${Number(data.latitude) + 0.005}&layer=mapnik&marker=${data.latitude}%2C${data.longitude}`}
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                                            <FiMapPin className="h-7 w-7 mb-1.5 animate-bounce text-blue-600" />
                                            <p className="text-[11px] font-semibold">Sedang mencari sinyal GPS perangkat Anda...</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                Pastikan izin akses lokasi diizinkan pada browser.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] mt-2 px-0.5">
                                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                                        {koordinatSiap
                                            ? `${Number(data.latitude).toFixed(6)}, ${Number(data.longitude).toFixed(6)}`
                                            : '--, --'}
                                    </span>
                                    {koordinatSiap && (
                                        <a
                                            href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-700 dark:text-blue-300 hover:text-blue-900 font-semibold inline-flex items-center gap-1"
                                        >
                                            Buka di Google Maps
                                            <FiExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>

                                {/* INFO STATUS GPS (bukan error, radius bebas) */}
                                <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 flex items-start gap-2">
                                    <FiInfo className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-wider">
                                            Titik GPS Terkunci (Radius Bebas / Mode Uji Coba)
                                        </p>
                                        <p className="text-[11px] leading-snug">{pesanLokasi}</p>
                                        {jarak !== null && (
                                            <p className="text-[10px] text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                                                Jarak ke sekolah ± {jarak} m (tidak membatasi pengiriman).
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* FORM KIRIM */}
                            <form
                                onSubmit={handleSubmit}
                                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs"
                            >
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Tipe Presensi
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => pilihTipe('masuk')}
                                        disabled={sudahMasuk}
                                        className={`h-9 rounded-xl text-xs font-bold border transition-colors ${
                                            data.tipe_absen === 'masuk'
                                                ? 'bg-blue-800 text-white border-blue-800'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        Masuk
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => pilihTipe('pulang')}
                                        disabled={!sudahMasuk || sudahPulang}
                                        className={`h-9 rounded-xl text-xs font-bold border transition-colors ${
                                            data.tipe_absen === 'pulang'
                                                ? 'bg-blue-800 text-white border-blue-800'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        Pulang
                                    </button>
                                </div>

                                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                                    <span className="inline-flex items-center gap-1">
                                        <FiClock className="h-3 w-3" />
                                        Masuk: {absenHariIni?.jam_masuk ?? '--:--'}
                                    </span>
                                    <span>Pulang: {absenHariIni?.jam_keluar ?? '--:--'}</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!bisaKirim}
                                    className={`mt-2.5 w-full h-11 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors ${
                                        bisaKirim
                                            ? 'bg-blue-800 hover:bg-blue-900 text-white'
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-70'
                                    }`}
                                >
                                    <FiCheckCircle className="h-4 w-4" />
                                    {processing ? 'Menyimpan Presensi...' : `Kirim Presensi ${data.tipe_absen.toUpperCase()}`}
                                </button>

                                {!bisaKirim && !processing && (
                                    <p className="text-center text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                        {!koordinatSiap && 'Menunggu titik GPS. '}
                                        {!fotoUri && 'Ambil swafoto terlebih dahulu. '}
                                    </p>
                                )}
                                {(errors.foto || errors.latitude || errors.longitude) && (
                                    <p className="text-center text-[10px] text-rose-600 mt-1.5 font-medium">
                                        {errors.foto || errors.latitude || errors.longitude}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </GuruLayout>
    );
}

import React, { useRef, useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Webcam from 'react-webcam';
import { 
    FiArrowLeft, FiMapPin, FiCamera, FiRefreshCw, 
    FiCheckCircle, FiLogOut, FiLock, FiAlertTriangle 
} from 'react-icons/fi';
import GuruLayout from '@/components/guru-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Absensi({ absenHariIni }) {
    const webcamRef = useRef(null);
    
    // KOORDINAT SEKOLAH & RADIUS
    const SEKOLAH_LAT = -6.911144528139905;
    const SEKOLAH_LNG = 107.33306286656926;
    const RADIUS_MAKSIMAL = 100; // Meter

    const [lokasi, setLokasi] = useState({ lat: null, lng: null });
    const [jarak, setJarak] = useState(null);
    const [lokasiAkurat, setLokasiAkurat] = useState(false);
    const [pesanLokasi, setPesanLokasi] = useState("Mencari titik GPS...");
    const [fotoUri, setFotoUri] = useState(null);

    const { data, setData, post, processing } = useForm({
        tipe_absen: 'masuk',
        latitude: '',
        longitude: '',
        foto: '',
    });

    // Rumus Haversine untuk menghitung jarak presisi
    const hitungJarak = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))); 
    };

    // Live Tracking Lokasi
    useEffect(() => {
        if (!navigator.geolocation) {
            setPesanLokasi("Browser tidak mendukung GPS");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setLokasi({ lat, lng });

                const d = hitungJarak(lat, lng, SEKOLAH_LAT, SEKOLAH_LNG);
                setJarak(d);

                setData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                }));

                if (d <= RADIUS_MAKSIMAL) {
                    setLokasiAkurat(true);
                    setPesanLokasi(`Dalam Radius (${d} meter)`);
                } else {
                    setLokasiAkurat(false);
                    setPesanLokasi(`Di Luar Radius (${d} meter)`);
                }
            },
            (err) => {
                setPesanLokasi("Gagal mengambil titik GPS. Pastikan izin lokasi aktif.");
                setLokasiAkurat(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Tentukan Tipe Presensi (Masuk atau Pulang)
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const tipe = queryParams.get('tipe');
        if (tipe === 'pulang') {
            setData('tipe_absen', 'pulang');
        } else {
            setData('tipe_absen', 'masuk');
        }
    }, []);

    // Ambil Foto Webcam
    const ambilFoto = () => {
        const imageSrc = webcamRef.current.getScreenshot();
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

    return (
        <GuruLayout title="Presensi Harian">
            <Head title="Presensi Geoselfie - Portal SIMAG" />

            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Presensi Geoselfie
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Verifikasi kehadiran Anda menggunakan kamera swafoto dan validasi radius GPS sekolah.
                    </p>
                </div>

                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                    <CardHeader className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <FiCamera className="text-blue-600 dark:text-blue-400" />
                            Kamera Swafoto & Titik Lokasi
                        </CardTitle>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            data.tipe_absen === 'masuk' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                            Presensi {data.tipe_absen}
                        </span>
                    </CardHeader>

                    <CardContent className="p-6 space-y-5">
                        {/* 1. STATUS LOKASI GPS */}
                        <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                            lokasiAkurat 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
                                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <FiMapPin className="text-xl shrink-0" />
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider font-bold">Status Titik Lokasi</p>
                                    <p className="text-sm font-black">{pesanLokasi}</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-white/70 dark:bg-slate-900/70 rounded-lg">
                                Maks. {RADIUS_MAKSIMAL}m
                            </span>
                        </div>

                        {/* 2. WEBCAM / HASIL FOTO */}
                        <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                            {fotoUri ? (
                                <img src={fotoUri} alt="Selfie" className="w-full h-full object-cover" />
                            ) : (
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ facingMode: "user" }}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        {/* TOMBOL AMBIL FOTO */}
                        <div>
                            {!fotoUri ? (
                                <Button
                                    type="button"
                                    onClick={ambilFoto}
                                    className="w-full py-3 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-98"
                                >
                                    <FiCamera className="h-5 w-5" /> Ambil Swafoto
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={ulangFoto}
                                    variant="outline"
                                    className="w-full py-3 h-12 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <FiRefreshCw className="h-4 w-4" /> Ambil Ulang Swafoto
                                </Button>
                            )}
                        </div>

                        {/* 3. TOMBOL SUBMIT */}
                        <form onSubmit={handleSubmit}>
                            <Button
                                type="submit"
                                disabled={!lokasiAkurat || !fotoUri || processing}
                                className={`w-full py-3.5 h-12 font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-98 ${
                                    lokasiAkurat && fotoUri
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-70'
                                }`}
                            >
                                <FiCheckCircle className="h-5 w-5" />
                                {processing ? 'Menyimpan Presensi...' : `Kirim Presensi ${data.tipe_absen.toUpperCase()}`}
                            </Button>
                        </form>

                        {!lokasiAkurat && (
                            <p className="text-center text-xs text-rose-500 font-medium flex items-center justify-center gap-1.5">
                                <FiAlertTriangle /> Anda harus berada dalam radius sekolah untuk dapat mengirim presensi.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </GuruLayout>
    );
}

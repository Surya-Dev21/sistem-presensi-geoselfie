import React, { useRef, useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Webcam from 'react-webcam';
import { 
    FiArrowLeft, FiMapPin, FiCamera, FiRefreshCw, 
    FiCheckCircle, FiLogOut, FiLock, FiAlertTriangle 
} from 'react-icons/fi';

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
                setData(d => ({ ...d, latitude: lat, longitude: lng }));

                const jarakAktual = hitungJarak(SEKOLAH_LAT, SEKOLAH_LNG, lat, lng);
                setJarak(jarakAktual);
                
                if (jarakAktual <= RADIUS_MAKSIMAL) {
                    setLokasiAkurat(true);
                    setPesanLokasi("Lokasi Valid");
                } else {
                    setLokasiAkurat(false);
                    setPesanLokasi("Di Luar Area Sekolah");
                }
            },
            (error) => {
                setLokasiAkurat(false);
                setPesanLokasi("Gagal membaca GPS (Pastikan Izin Aktif)");
            },
            { enableHighAccuracy: true, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    const ambilFoto = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setFotoUri(imageSrc);
            setData('foto', imageSrc);
        }
    };

    const submitAbsen = (tipe) => {
        data.tipe_absen = tipe;
        post('/absensi');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12 font-sans text-slate-800">
            <Head title="Verifikasi Kehadiran" />
            
            {/* HEADER */}
            <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center mb-6 sticky top-0 z-50">
                <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FiCamera className="w-5 h-5" />
                    </div>
                    Portal Absensi
                </h1>
                <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors bg-slate-100 hover:bg-blue-50 px-4 py-2 rounded-xl">
                    <FiArrowLeft /> <span className="hidden sm:inline">Kembali</span>
                </Link>
            </div>

            {/* MAIN GRID LAYOUT */}
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* ========================================== */}
                {/* KIRI: PANEL GOOGLE MAPS & LOKASI */}
                {/* ========================================== */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <FiMapPin className="text-red-500" /> Lokasi GPS Anda
                        </h2>
                        
                        {/* Status Jarak Geofencing */}
                        {jarak !== null && (
                            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                                lokasiAkurat ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${lokasiAkurat ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                {jarak} Meter
                            </div>
                        )}
                    </div>
                    
                    <p className={`text-sm mb-4 font-medium ${lokasiAkurat ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {pesanLokasi} (Maks {RADIUS_MAKSIMAL}m)
                    </p>

                    <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden min-h-[300px] border border-slate-200 relative shadow-inner">
                        {lokasi.lat ? (
                            <>
                                <iframe 
                                    title="Peta Lokasi"
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    loading="lazy" 
                                    className="grayscale-[20%] contrast-125"
                                    src={`https://maps.google.com/maps?q=${lokasi.lat},${lokasi.lng}&z=18&output=embed`}
                                ></iframe>
                                {/* Overlay Target Map (Titik Tengah Sekolah) */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-xl text-xs font-bold shadow border border-slate-200 text-slate-600">
                                    Target: SMK Pembangunan Bandung Barat
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3">
                                <FiMapPin className="w-8 h-8 animate-bounce text-blue-500" />
                                <p className="font-medium text-sm">Menunggu Izin Lokasi GPS...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================== */}
                {/* KANAN: PANEL KAMERA & TOMBOL AKSI */}
                {/* ========================================== */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 flex flex-col">
                    <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <FiCamera className="text-blue-600" /> Swafoto Kehadiran
                    </h2>
                    
                    {/* Area Kamera */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] mb-6 flex justify-center items-center shadow-inner border border-slate-300">
                        {!fotoUri ? (
                            <Webcam 
                                audio={false} 
                                ref={webcamRef} 
                                screenshotFormat="image/jpeg" 
                                mirrored={false} /* <-- INI MENCEGAH KAMERA MIRROR */
                                className="w-full h-full object-cover" 
                                videoConstraints={{ facingMode: "user" }} 
                            />
                        ) : (
                            <img src={fotoUri} className="w-full h-full object-cover" alt="Hasil Swafoto" />
                        )}
                        
                        <div className="absolute bottom-4 flex justify-center w-full">
                            <button 
                                onClick={fotoUri ? () => { setFotoUri(null); setData('foto', ''); } : ambilFoto} 
                                disabled={!lokasiAkurat}
                                className={`backdrop-blur px-6 py-3 rounded-full font-bold shadow-lg text-sm transition flex items-center gap-2 ${
                                    !lokasiAkurat 
                                        ? 'bg-slate-800/80 text-slate-400 cursor-not-allowed' 
                                        : 'bg-white/90 text-blue-700 hover:bg-white hover:scale-105 active:scale-95'
                                }`}
                            >
                                {fotoUri ? <><FiRefreshCw /> Ulangi Foto</> : <><FiCamera /> Foto Sekarang</>}
                            </button>
                        </div>

                        {/* Peringatan Jika Luar Radius (Tampil di atas kamera) */}
                        {!lokasiAkurat && jarak !== null && !fotoUri && (
                            <div className="absolute top-4 inset-x-0 mx-auto w-max px-4 py-1.5 bg-rose-500/90 text-white rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur">
                                <FiAlertTriangle /> Anda di Luar Radius
                            </div>
                        )}
                    </div>

                    {/* Tombol Aksi */}
                    <div className="grid grid-cols-2 gap-4 mt-auto">
                        {/* Tombol Absen Masuk */}
                        <button 
                            onClick={() => submitAbsen('masuk')} 
                            disabled={processing || !lokasiAkurat || !fotoUri || absenHariIni?.sudah_masuk} 
                            className="flex flex-col justify-center items-center gap-1.5 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/30 disabled:shadow-none"
                        >
                            {absenHariIni?.sudah_masuk ? (
                                <>
                                    <FiLock className="w-5 h-5 mb-1" />
                                    <span className="text-sm">Sudah Masuk</span>
                                    <span className="text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full">{absenHariIni.jam_masuk}</span>
                                </>
                            ) : (
                                <>
                                    <FiCheckCircle className="w-6 h-6 mb-1" />
                                    <span className="text-sm">Absen Masuk</span>
                                </>
                            )}
                        </button>

                        {/* Tombol Absen Pulang */}
                        <button 
                            onClick={() => submitAbsen('pulang')} 
                            disabled={processing || !lokasiAkurat || !fotoUri || !absenHariIni?.sudah_masuk || absenHariIni?.sudah_pulang} 
                            className="flex flex-col justify-center items-center gap-1.5 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-orange-500/30 disabled:shadow-none"
                        >
                            {absenHariIni?.sudah_pulang ? (
                                <>
                                    <FiLock className="w-5 h-5 mb-1" />
                                    <span className="text-sm">Sudah Pulang</span>
                                    <span className="text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full">{absenHariIni.jam_keluar}</span>
                                </>
                            ) : (
                                <>
                                    <FiLogOut className="w-6 h-6 mb-1" />
                                    <span className="text-sm">Absen Pulang</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
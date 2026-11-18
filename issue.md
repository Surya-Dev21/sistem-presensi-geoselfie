# Rencana Implementasi: Peningkatan Menu Presensi Harian (Geoselfie, Peta Visual & Riwayat)

Dokumen ini adalah panduan teknis langkah-demi-langkah yang dirancang secara detail, terstruktur, dan presisi agar dapat dieksekusi dengan mudah dan aman oleh **Junior Programmer** maupun **AI Model**.

---

## 🎯 Sasaran & Kebutuhan Fitur (Requirements)

1. **Bebaskan Kunci Radius (Un-lock Radius):**
   - Saat ini presensi terkunci jika jarak > 100 meter dari sekolah (`disabled={!lokasiAkurat}`).
   - **Kebutuhan:** Hilangkan batasan pemblokiran radius. Guru dapat mengirim presensi dari mana saja (mode radius bebas/pengujian), namun data koordinat GPS dan jarak tetap dicatat ke database sebagai data rekam jejak.
2. **Sematkan Gambar/Tampilan Peta Interaktif (Maps View):**
   - Tampilkan peta visual lokasi koordinat guru secara *real-time* tepat di halaman presensi (bukan sekadar angka latitude & longitude).
   - Menggunakan OpenStreetMap (OSM) Embed via `iframe` (100% gratis, tanpa API Key Google yang rumit, bebas biaya kuota, dan langsung berfungsi).
   - Sertakan tombol pintasan *"Buka di Google Maps"* untuk mempermudah pengecekan titik di aplikasi peta eksternal.
3. **Selaraskan Tampilan dengan Halaman Dashboard:**
   - Gunakan palet warna resmi SIMAG: **Biru Tua (`#1e3a8a` / `blue-900`)**, aksen putih bersih, border slate yang rapi, dan hindari warna kuning mencolok.
   - Desain kartu, header hero, typography, serta tombol mengikuti standar komponen di `Dashboard.jsx`.
4. **Sinkronisasi Data ke Riwayat Presensi (Untuk Laporan):**
   - Setiap presensi (Masuk & Pulang) yang berhasil dikirim **wajib langsung muncul** di halaman Riwayat Presensi (`/kalender`).
   - Perbaiki ketidakcocokan (mismatch) penamaan kolom antara database (`tgl_absen`, `jam_masuk`, `jam_keluar`) dan tabel tampilan di `Kalender.jsx`.
5. **Tampilan Responsif & Ramah Pengguna (User-Friendly & Mobile-First):**
   - Tampilan adaptif:
     - **Layar Smartphone / HP (< 768px):** Tata letak satu kolom vertikal yang ergonomis.
     - **Layar Desktop / Laptop (≥ 768px):** Tata letak dua kolom seimbang (Kamera Swafoto di sisi kiri, Peta Lokasi & Form Submit di sisi kanan).
   - Pilihan tipe absen (Masuk / Pulang) yang cerdas dan otomatis mendeteksi status presensi hari ini.

---

## 📂 Berkas yang Dimodifikasi (File Overview)

| File | Tipe | Peran & Tanggung Jawab |
|---|---|---|
| `resources/js/pages/Pegawai/Absensi.jsx` | Frontend (React/Inertia) | Halaman utama presensi harian: Kamera webcam, integrasi OpenStreetMap, logika radius bebas, dan tombol submit. |
| `resources/js/pages/Pegawai/Kalender.jsx` | Frontend (React/Inertia) | Halaman riwayat presensi: Memperbaiki mapping data field tabel agar data absen langsung tampil tanpa bug. |
| `app/Http/Controllers/AbsensiController.php` | Backend (Laravel) | Mengelola logika penyimpanan foto & koordinat (`store`), serta penyediaan data riwayat presensi (`index`). |

---

## 🛠️ Langkah-Langkah Pengerjaan Teknis (Step-by-Step)

### TAHAP 1: Bebaskan Kunci Radius di `Absensi.jsx`

#### 1.1 Masalah Saat Ini
Pada berkas `resources/js/pages/Pegawai/Absensi.jsx`, tombol submit presensi terkunci dengan kondisi:
```javascript
disabled={!lokasiAkurat || !fotoUri || processing}
```
Variabel `lokasiAkurat` bernilai `false` jika jarak melebihi 100 meter, sehingga memunculkan peringatan merah dan tombol tidak bisa diklik.

#### 1.2 Solusi Perubahan
1. **Ubah Status Validasi Radius:**
   - Jangan jadikan `lokasiAkurat` sebagai syarat mutlak untuk mendisable tombol submit.
   - Syarat tombol submit aktif cukup:
     1. Koordinat GPS berhasil terbaca (`data.latitude && data.longitude`).
     2. Swafoto/selfie sudah diambil (`fotoUri`).
     3. Form tidak sedang dalam proses kirim (`!processing`).
2. **Ubah Teks Indikator Lokasi:**
   - Ubah kotak status lokasi dari peringatan kesalahan (*error red*) menjadi informasi informatif (*info badge*).
   - Tampilkan pesan: *"Titik GPS Terkunci (Radius Bebas / Mode Uji Coba)"* beserta jarak estimasi dari sekolah.

---

### TAHAP 2: Implementasi Peta Visual (OpenStreetMap Embed)

#### 2.1 Mengapa Memilih OpenStreetMap Iframe?
- **Zero Configuration:** Tidak membutuhkan Google Maps API Key atau setup billing kartu kredit.
- **Ringan & Cepat:** Menggunakan standard iframe resmi OpenStreetMap.
- **Marker Otomatis:** Menampilkan pin penanda tepat di posisi latitude dan longitude guru.

#### 2.2 Spesifikasi Komponen Peta
Letakkan elemen peta di samping atau di bawah kamera swafoto:

```jsx
{/* Komponen Preview Peta Interaktif */}
<div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative h-48 sm:h-56">
    {data.latitude && data.longitude ? (
        <iframe
            title="Peta Lokasi Presensi"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(data.longitude) - 0.005}%2C${Number(data.latitude) - 0.005}%2C${Number(data.longitude) + 0.005}%2C${Number(data.latitude) + 0.005}&layer=mapnik&marker=${data.latitude}%2C${data.longitude}`}
            className="w-full h-full"
        />
    ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <FiMapPin className="h-8 w-8 mb-2 animate-bounce text-blue-600" />
            <p className="text-xs font-semibold">Sedang mencari sinyal GPS perangkat Anda...</p>
            <p className="text-[10px] text-slate-400 mt-1">Pastikan izin akses lokasi diizinkan pada browser.</p>
        </div>
    )}
</div>

{/* Pintasan Buka di Google Maps */}
{data.latitude && data.longitude && (
    <div className="flex justify-between items-center text-xs mt-1.5 px-1">
        <span className="text-slate-500 font-mono text-[11px]">
            {Number(data.latitude).toFixed(6)}, {Number(data.longitude).toFixed(6)}
        </span>
        <a
            href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-800 font-semibold inline-flex items-center gap-1 text-[11px]"
        >
            <span>Buka di Google Maps</span>
            <FiExternalLink className="h-3 w-3" />
        </a>
    </div>
)}
```

---

### TAHAP 3: Selaraskan Desain Visual dengan Dashboard

Gunakan identitas visual yang serasi dengan `resources/js/pages/Pegawai/Dashboard.jsx`:

1. **Hero Banner di Bagian Atas:**
   - Gunakan gradien biru tua elegan:
     `bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#1e3a8a] text-white`
   - Berikan informasi ringkas:
     - Judul: *"Presensi Harian Geoselfie"*
     - Subtitle: *"Ambil swafoto dan pastikan titik GPS Anda aktif sebelum mengirim data kehadiran."*
2. **Pilihan Otomatis & Cerdas Tipe Absen:**
   - Ambil props `absenHariIni` dari controller:
     - Jika `!absenHariIni.sudah_masuk` 👉 Otomatis pilih tipe **Masuk**.
     - Jika `absenHariIni.sudah_masuk && !absenHariIni.sudah_pulang` 👉 Otomatis pilih tipe **Pulang**.
     - Jika `absenHariIni.sudah_masuk && absenHariIni.sudah_pulang` 👉 Tampilkan kartu status *"Presensi Hari Ini Lengkap / Selesai"* dengan waktu presensi masuk dan pulang.
3. **Penyelarasan Tombol:**
   - Tombol Ambil Swafoto: Biru elegan (`bg-blue-700 hover:bg-blue-800 text-white`).
   - Tombol Ulangi Foto: Outline netral (`border-slate-300 text-slate-700 hover:bg-slate-100`).
   - Tombol Kirim Presensi: Biru solid atau Emerald (`bg-blue-700 hover:bg-blue-800 text-white font-bold`).

---

### TAHAP 4: Perbaiki & Hubungkan Data ke Riwayat Presensi (`Kalender.jsx`)

#### 4.1 Bug yang Ditemukan di `Kalender.jsx`
Di dalam tabel riwayat pada `resources/js/pages/Pegawai/Kalender.jsx`, kode saat ini membaca properti objek:
- `item.tanggal` ❌ (Padahal nama kolom database adalah `tgl_absen`)
- `item.jam_pulang` ❌ (Padahal nama kolom database adalah `jam_keluar`)

Akibatnya, data yang baru saja diabsen tidak muncul tanggal atau jam pulangnya (kosong/strip).

#### 4.2 Solusi Perbaikan di `Kalender.jsx`
Perbarui baris mapping tabel riwayat menjadi:

```jsx
<td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
    {/* Fallback membaca tgl_absen atau tanggal */}
    {item.tgl_absen || item.tanggal}
</td>
<td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
    {item.jam_masuk ? (
        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {item.jam_masuk.substring(0, 5)} WIB
        </span>
    ) : (
        <span className="text-slate-400">-</span>
    )}
</td>
<td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
    {/* Fallback membaca jam_keluar atau jam_pulang */}
    {(item.jam_keluar || item.jam_pulang) ? (
        <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            {(item.jam_keluar || item.jam_pulang).substring(0, 5)} WIB
        </span>
    ) : (
        <span className="text-slate-400">-</span>
    )}
</td>
<td className="py-3.5 px-4">
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
        item.status === 'Hadir' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : item.status === 'Izin' || item.status === 'Sakit'
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
    }`}>
        {item.status || 'Hadir'}
    </span>
</td>
```

#### 4.3 Penyempurnaan di `AbsensiController.php` (Method `index`)
Pastikan pada query `index` data diformat dengan baik dan dikirim lengkap:
```php
public function index(Request $request)
{
    $pegawai = Auth::guard('pegawai')->user();

    $bulan = $request->input('bulan', date('m'));
    $tahun = $request->input('tahun', date('Y'));

    $riwayat = Absensi::where('nip', $pegawai->nip)
        ->whereMonth('tgl_absen', $bulan)
        ->whereYear('tgl_absen', $tahun)
        ->orderBy('tgl_absen', 'desc')
        ->get();

    $totalHadir = $riwayat->where('status', 'Hadir')->count();
    $totalIzinSakit = $riwayat->whereIn('status', ['Izin', 'Sakit'])->count();
    $totalAlpa = $riwayat->where('status', 'Alpa')->count();

    return Inertia::render('Pegawai/Kalender', [
        'riwayat'   => $riwayat,
        'statistik' => [
            'hadir'      => $totalHadir,
            'izin_sakit' => $totalIzinSakit,
            'alpa'       => $totalAlpa,
        ],
        'filter'    => [
            'bulan' => (string) (int) $bulan,
            'tahun' => (string) $tahun,
        ]
    ]);
}
```

---

### TAHAP 5: Susunan Tata Letak Responsif (Mobile & Desktop)

Pada berkas `Absensi.jsx`, gunakan struktur grid berikut agar responsif di semua ukuran layar:

```jsx
<div className="space-y-4 max-w-5xl mx-auto">
    {/* 1. HERO BANNER PERSIS SEPERTI DASHBOARD */}
    <div className="rounded-2xl bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#1e3a8a] text-white p-5 sm:p-6 shadow-md border-b-4 border-blue-400">
        <h2 className="text-lg sm:text-xl font-black">Presensi Harian Geoselfie</h2>
        <p className="text-xs text-blue-100 mt-1">
            Silakan verifikasi kehadiran Anda dengan swafoto dan pastikan GPS dalam keadaan aktif.
        </p>
    </div>

    {/* 2. KONTEN GRID: 1 Kolom di Mobile, 2 Kolom di Layar Lebar */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* KOLOM KIRI (7 Kolom Desktop): Kamera Webcam & Foto Preview */}
        <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                {/* Kamera Webcam / Gambar Preview */}
                ...
                {/* Tombol Ambil / Ulangi Foto */}
                ...
            </div>
        </div>

        {/* KOLOM KANAN (5 Kolom Desktop): Peta OpenStreetMap & Formulir Kirim */}
        <div className="lg:col-span-5 space-y-4">
            {/* Kartu Peta */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                {/* OpenStreetMap iframe */}
                ...
                {/* Info Koordinat & Status GPS */}
                ...
            </div>

            {/* Kartu Konfirmasi & Tombol Kirim */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                {/* Switcher Tipe Absen: Masuk vs Pulang */}
                ...
                {/* Tombol Kirim Presensi */}
                ...
            </div>
        </div>

    </div>
</div>
```

---

## 🧪 Panduan Pengujian & Verifikasi (Testing Checklist)

Lakukan pengujian berikut setelah kode selesai ditulis:

- [ ] **1. Uji GPS di Luar Sekolah:**
  - Buka halaman `/absensi`.
  - Pastikan titik GPS terdeteksi. Meskipun lokasi berada > 100m dari sekolah, tombol **"Kirim Presensi"** tetap aktif dan TIDAK diblokir.
- [ ] **2. Uji Tampilan Peta:**
  - Pastikan `iframe` OpenStreetMap muncul dengan jelas dan penanda (marker) berada di posisi koordinat pengguna saat ini.
  - Klik link *"Buka di Google Maps"*, pastikan titik yang terbuka di Google Maps sesuai dengan koordinat.
- [ ] **3. Uji Absen Masuk:**
  - Ambil swafoto menggunakan webcam.
  - Klik **"Kirim Presensi MASUK"**.
  - Pastikan sistem berhasil redirect ke `/dashboard` dengan flash message sukses.
- [ ] **4. Uji Verifikasi Riwayat Presensi:**
  - Buka menu **"Riwayat Presensi"** (`/kalender`).
  - Pastikan baris tanggal hari ini **muncul** di tabel, kolom Tanggal terisi, jam masuk terisi dengan format jam yang benar (contoh: `07:15 WIB`), dan status menunjukkan `Hadir`.
- [ ] **5. Uji Absen Pulang:**
  - Buka kembali menu `/absensi`.
  - Sistem otomatis menyarankan atau memilih tipe **PULANG**.
  - Ambil swafoto dan kirim presensi pulang.
  - Cek kembali di menu `/kalender`, pastikan kolom Jam Pulang sudah terisi.
- [ ] **6. Uji Responsifitas Layar:**
  - Periksa melalui Inspect Element pada ukuran HP (375px atau 412px). Seluruh teks, kamera, peta, dan tombol tidak boleh terpotong atau menimbulkan horizontal scrollbar.
  - Periksa pada ukuran Desktop (1280px+), tampilan 2 kolom tersusun rapi.
- [ ] **7. Verifikasi Kompilasi & Syntax:**
  - Jalankan build frontend: `cmd.exe /c "npm run build"`. Pastikan build berhasil tanpa error sintaks Vite/React.
  - Periksa syntax PHP: `php -l app/Http/Controllers/AbsensiController.php`.

---

## 📌 Catatan Tambahan untuk Junior Programmer / AI
1. **Tidak Perlu Install Package NPM Baru:** Cukup gunakan dependensi yang sudah ada di proyek (`react-webcam`, `react-icons`, `@inertiajs/react`). Peta dibuat menggunakan standard HTML `iframe` OpenStreetMap.
2. **Keamanan Data Base64:** Method `uploadFotoBase64` pada `AbsensiController` sudah menangani konversi string Base64 ke berkas `.jpg` di direktori `storage/app/public/absensi/`. Pastikan direktori storage sudah di-*link* (`php artisan storage:link`).
3. **Komitmen Git:** Selalu kerjakan di branch fitur (jangan langsung di `main`), lakukan commit dengan pesan yang deskriptif, dan lakukan test build sebelum membuat pull request.

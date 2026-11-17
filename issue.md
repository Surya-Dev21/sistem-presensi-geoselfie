# Perencanaan & Instruksi Kerja: Peningkatan Halaman Guru & Perbaikan Sistem (SIMAG)

Dokumen ini berisi panduan teknis langkah-demi-langkah yang dirancang agar dapat dieksekusi dengan mudah oleh *junior programmer* atau *AI model* dengan kapabilitas standar/ekonomis. Ikuti setiap tahapan secara berurutan untuk menghindari regresi.

---

## 📋 Daftar Tugas (Task Breakdown)

### 1. Perbaikan Bug (Hotfix) Input Email di Profil Pegawai
* **Masalah:** Terjadi error/exception ketika user memasukkan atau memperbarui alamat email di halaman profil pegawai.
* **Langkah Implementasi:**
  1. Periksa `ProfilController` (pada method `update` atau validasi terkait).
  2. Cek skema database tabel `pegawai` atau `users` pada migrasi terkait kolom `email`. Pastikan validasi form menggunakan `unique:users,email,...` atau `unique:pegawai,email,...` mengecualikan ID user yang sedang login (`->ignore(Auth::id())`).
  3. Tangani exception jika terjadi pelanggaran unique constraint atau format email tidak valid, lalu kembalikan pesan error yang ramah pengguna via Inertia flash messages.

### 2. Peningkatan UI/UX & Desain Dashboard Guru
* **Kriteria Desain:** Bersih, minimalis, profesional (hindari *AI slop* berlebihan). Palet warna dominan: Putih, abu-abu netral, dan Biru (`primary`).
* **Langkah Implementasi:**
  1. Sesuaikan layout utama dashboard guru (`resources/js/Pages/Guru/...` atau komponen terkait).
  2. Terapkan warna konsisten (Gunakan kelas Tailwind CSS seperti `bg-white`, `text-slate-800`, `bg-blue-600`, `text-blue-600`).
  3. Ganti logo sekolah di area header/sidebar agar sama persis dengan logo yang digunakan pada halaman login (`/public/images/...` atau asset yang sesuai).

### 3. Implementasi Sidebar & Halaman Utama Dashboard Guru
* **Komponen & Menu:**
  * Sidebar navigasi sisi kiri yang konsisten (Menu: Dashboard, Jadwal Pelajaran, Absensi, Profil).
  * Halaman Utama Dashboard menampilkan:
    * Ucapan selamat datang dinamis: `"Selamat Datang, [Nama Guru]!"` (ambil dari data `Auth::user()->name` atau relasi pegawai).
    * Widget/Card Jadwal Pelajaran hari ini (diambil dari tabel `jadwal_mengajars` yang di-input oleh admin).
    * Widget informasi/pengumuman lainnya.
* **Langkah Implementasi:**
  1. Buat/perbarui komponen Sidebar React (`resources/js/Components/Sidebar.tsx` atau serupa).
  2. Perbarui Controller dashboard guru (`AbsensiController` atau `DashboardController` khusus guru) untuk mengirim data jadwal pelajaran berdasarkan `user_id` atau `pegawai_id` yang aktif ke frontend Inertia.
  3. Render data jadwal ke dalam tabel atau card yang rapi di halaman utama.

### 4. Sistem Notifikasi (Alerts / Flash Messages)
* **Cakupan:** Notifikasi sukses/gagal saat Login, Logout, serta seluruh proses CRUD (Tambah, Edit, Hapus data).
* **Langkah Implementasi:**
  1. Pastikan backend Laravel mengirimkan flash message (misal: `session()->flash('success', 'Data berhasil disimpan')`).
  2. Buat komponen alert global di Frontend (menggunakan pustaka UI seperti Shadcn `Alert` atau Toast ringan) untuk menangkap flash props dari Inertia `usePage().props.flash`.

### 5. Fitur Mode Gelap (Dark Mode) & Mode Terang (Light Mode)
* **Langkah Implementasi:**
  1. Tambahkan state atau toggle theme (menggunakan kelas `dark` pada tag `<html>` atau `<body>` tailwind).
  2. Simpan preferensi theme di `localStorage` atau session user.
  3. Pastikan komponen menggunakan modifier kelas Tailwind dark mode (contoh: `bg-white dark:bg-slate-900 text-slate-900 dark:text-white`).

### 6. Fitur Lupa Password via Email & Ganti Password
* **Fitur 1: Kirim Tautan Reset Password ke Email Profil**
  * Manfaatkan kolom email yang tersimpan di profil pegawai/user.
  * Gunakan fitur bawaan Laravel Password Reset (`Password::sendResetLink(...)`) yang mengarah ke alamat email tersebut.
* **Fitur 2: Ganti Password**
  * Sediakan form ubah password di halaman profil (memerlukan password lama & konfirmasi password baru).
  * Validasi menggunakan `Hash::check` pada password lama sebelum memperbarui ke password baru yang di-hash (`Hash::make`).

---

## 🛠 Panduan Eksekusi untuk Junior/AI Model
1. **Kerjakan bertahap:** Mulai dari perbaikan bug nomor 1 (Email), dilanjutkan dengan perbaikan UI/Sidebar, hingga fitur lanjutan (Dark mode & Password).
2. **Uji Coba Mandiri:** Jalankan tes unit atau uji manual pada aplikasi lokal setelah setiap modul selesai diubah.
3. **Patuhi Standar Kode:** Jaga konsistensi penulisan kode sesuai struktur proyek Laravel 12 + Inertia.js + React + Tailwind CSS yang sudah ada di repository ini.

# [PLANNING] Redesain Halaman Data Pegawai (Guru), Fitur Filter & Urutan, serta Perbaikan Bug Sidebar Admin

Panduan perencanaan dan implementasi ini disusun untuk memudahkan Junior Programmer atau AI Model eksekusi tugas pengembangan pada proyek **SIPRES Guru (SMK Pembangunan Bandung Barat)**.

---

## 1. Ringkasan & Tujuan Tugas

1. **Perbaikan Bug Sidebar Navigation (`resources/js/components/admin-layout.tsx`)**:
   - Memperbaiki perilaku toggle sidebar yang ter-reset sendiri saat klik pagination (tombol `2`, `Next`, dll) atau berpindah halaman.
2. **Redesain Halaman Pegawai (`resources/js/pages/Admin/Pegawai.jsx`)**:
   - Tampilan bersih (clean), minimalis, modern, dan 100% responsif di semua perangkat (HP, Tablet, Laptop).
   - Sangat ramah pengguna (*user-friendly*) untuk semua kalangan Bapak/Ibu Guru (ukuran teks proporsional, kontras warna yang nyaman, tombol aksi jelas).
   - Pemisahan kolom **NIP** dan **Nama Lengkap** pada tabel.
   - Mengubah istilah label **Gender** menjadi **Jenis Kelamin**.
   - Penambahan fitur filter berdasarkan **Jenis Kelamin** (`Semua`, `Laki-laki`, `Perempuan`).
   - Penambahan fitur pengurutan abjad (**Sorting A-Z** dan **Z-A**, default: `A-Z`).

---

## 2. Penjelasan Bug Sidebar & Cara Memperbaikinya

### 💡 Mengapa Bug Sidebar Terjadi? (Penjelasan Sederhana)
Saat ini di file `resources/js/components/admin-layout.tsx`, terdapat `useEffect` yang bertugas mendeteksi lebar layar komputer/HP:
```tsx
useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
        setIsMobile(mq.matches);
        setSidebarOpen(!mq.matches); // <-- PENYEBAB UTAMA BUG
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
}, []);
```
**Masalahnya:**
* Setiap kali admin mengklik angka pagination (misal halaman 2 atau tombol *Next*), halaman melakukan navigasi Inertia yang memicu re-render ulang `AdminLayout`.
* Perintah `setSidebarOpen(!mq.matches)` akan dipanggil kembali.
* Di **Laptop/Desktop** (`!mq.matches` adalah `true`), jika admin sebelumnya **menutup sidebar**, begitu klik pagination, sidebar **dipaksa terbuka kembali** secara otomatis.
* Di **HP/Mobile**, perubahan status saat navigasi menyebabkan efek *flicker* (sidebar sempat terbuka lalu menutup kembali).

### 🔧 Solusi Perbaikan Sidebar
1. Simpan status toggle sidebar pengguna di memori peramban (`localStorage`) dengan kunci `admin_sidebar_open`.
2. Saat pertama kali halaman dimuat, periksa `localStorage`:
   - Jika pengguna pernah secara manual menutup/membuka sidebar, gunakan nilai dari `localStorage`.
   - Jika belum ada di `localStorage`, baru gunakan default berdasarkan lebar layar (`window.innerWidth >= 1024`).
3. Saat tombol toggle hamburger diklik, update state sekaligus simpan ke `localStorage`.

---

## 3. Tahapan Langkah-Langkah Implementasi

---

### TAHAP 1: Perbarui Controller Backend (`app/Http/Controllers/AdminController.php`)

Ubah method `pegawaiIndex` agar dapat menerima dan memproses parameter `cari`, `jk` (jenis kelamin), dan `sort` (urutan nama):

```php
public function pegawaiIndex(Request $request)
{
    $cari = $request->input('cari');
    $jk   = $request->input('jk'); // L, P, atau null
    $sort = $request->input('sort', 'asc'); // asc (A-Z) atau desc (Z-A)

    $daftarPegawai = Pegawai::query()
        // Filter pencarian teks
        ->when($cari, function ($q, $cari) {
            $q->where(function ($sub) use ($cari) {
                $sub->where('nama_lengkap', 'like', "%{$cari}%")
                    ->orWhere('nip', 'like', "%{$cari}%")
                    ->orWhere('email', 'like', "%{$cari}%")
                    ->orWhere('jabatan', 'like', "%{$cari}%");
            });
        })
        // Filter Jenis Kelamin (Laki-laki / Perempuan)
        ->when($jk, function ($q, $jk) {
            $q->where('jenis_kelamin', $jk);
        })
        // Pengurutan berdasarkan Nama Lengkap (A-Z / Z-A)
        ->orderBy('nama_lengkap', $sort === 'desc' ? 'desc' : 'asc')
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('Admin/Pegawai', [
        'daftarPegawai' => $daftarPegawai,
        'filter'        => [
            'cari' => $cari ?? '',
            'jk'   => $jk ?? '',
            'sort' => $sort,
        ],
    ]);
}
```

---

### TAHAP 2: Perbaiki Bug Sidebar pada `resources/js/components/admin-layout.tsx`

Perbarui logika inisialisasi `sidebarOpen` di `AdminLayout`:

```tsx
// 1. Inisialisasi state awal dengan membaca localStorage
const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("admin_sidebar_open");
        if (saved !== null) {
            return JSON.parse(saved);
        }
        return window.innerWidth >= 1024; // Default terbuka di desktop, tertutup di mobile
    }
    return true;
});

// 2. Fungsi toggle yang menyimpan perubahan ke localStorage
const toggleSidebar = () => {
    setSidebarOpen((prev) => {
        const nextState = !prev;
        if (typeof window !== "undefined") {
            localStorage.setItem("admin_sidebar_open", JSON.stringify(nextState));
        }
        return nextState;
    });
};

// 3. Update useEffect pembacaan ukuran media agar tidak mereset nilai pengguna
useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handleResize = () => {
        setIsMobile(mq.matches);
    };
    handleResize();
    mq.addEventListener("change", handleResize);
    return () => mq.removeEventListener("change", handleResize);
}, []);
```

---

### TAHAP 3: Redesain Halaman `resources/js/pages/Admin/Pegawai.jsx`

#### A. Tambahkan Controls Filter & Sorting
Tambahkan dropdown/select untuk **Jenis Kelamin** (`Semua`, `Laki-laki`, `Perempuan`) dan **Urutan Nama** (`A-Z`, `Z-A`) di samping kolom pencarian.

```jsx
const [cari, setCari] = useState(filter.cari || "");
const [jk, setJk] = useState(filter.jk || "");
const [sort, setSort] = useState(filter.sort || "asc");

// Kirim filter ke backend saat pengguna merubah opsi
const applyFilter = (newCari = cari, newJk = jk, newSort = sort) => {
    router.get(
        "/admin/pegawai",
        { cari: newCari, jk: newJk, sort: newSort },
        { preserveState: true, replace: true }
    );
};
```

#### B. Pemisahan Kolom Tabel & Pengubahan Label
Ubah struktur tabel pada desktop dan card pada mobile:
1. Kolom Header:
   - **NIP** (Kolom terpisah)
   - **Nama Lengkap** (Kolom terpisah)
   - **Jabatan**
   - **Kontak** (Email & No. HP)
   - **Jenis Kelamin** (Ganti kata "Gender")
   - **Aksi** (Tombol Edit & Hapus)

2. Tampilan Responsif (Mobile-First):
   - **Desktop / Tablet (sm ke atas)**: Tampilkan tabel lengkap yang rapi dengan jarak antar sel yang nyaman (padding `py-3.5 px-4`).
   - **Mobile (Layar HP)**: Tampilkan bentuk *Card List* minimalis per guru agar informasi NIP, Nama, Jabatan, dan Jenis Kelamin tidak berhimpitan atau terpotong horizontal.

#### C. Standar Desain UI/UX (Aturan @ui-styling & @ui-ux-pro-max)
* **Warna & Kontras**: Gunakan warna Netral/Slate (`slate-800` untuk teks utama, `slate-500` untuk sub-teks) dan warna Brand Blue (`blue-800`) untuk tombol utama.
* **Tipografi**: Gunakan ukuran font minimal `12px` (text-xs) hingga `14px` (text-sm) agar Bapak/Ibu Guru mudah membaca informasi tanpa mata lelah.
* **Ukuran Area Klik (Touch Target)**: Pastikan tombol aksi (Edit/Hapus/Pagination) memiliki padding minimal `44x44px` area sentuh pada layar HP.

---

### TAHAP 4: Pengujian / Testing

Setelah selesai diimplementasikan, jalankan langkah-langkah verifikasi berikut:

1. **Uji Otomatis Backend**:
   Jalankan pengujian unit Pest / PHPUnit:
   ```bash
   php artisan test
   ```
   *Pastikan seluruh test passed tanpa error.*

2. **Uji Build Frontend**:
   Jalankan kompilasi aset React/Vite:
   ```bash
   npm run build
   ```
   *Pastikan tidak ada sintaks JSX atau TypeScript error.*

3. **Uji Manual Perilaku Sidebar**:
   - Di Desktop: Tutup sidebar -> Klik pagination Halaman 2 -> **Sidebar harus tetap tertutup**.
   - Di Mobile: Buka sidebar -> Klik Halaman 2 -> **Sidebar menutup dengan halus tanpa flicker**.

4. **Uji Manual Filter & Sort**:
   - Pilih Filter Jenis Kelamin "Laki-laki" -> Data yang muncul hanya Laki-laki.
   - Ubah Sort ke "Z-A" -> Urutan nama guru dimulai dari huruf Z ke A.
   - Ketik Pencarian -> Filter tetap bertahan bersama query pencarian.

---

## 4. Ringkasan File yang Diubah

1. `app/Http/Controllers/AdminController.php` (Menangani query filter `jk` dan sorting `sort`)
2. `resources/js/components/admin-layout.tsx` (Memperbaiki state persistence `sidebarOpen`)
3. `resources/js/pages/Admin/Pegawai.jsx` (Redesain UI, pemisahan NIP & Nama, ganti label Jenis Kelamin, kontrol filter & sorting)
4. `tests/Feature/AdminDashboardTest.php` (Opsional: Tambahkan unit test untuk filter & sorting pegawai)

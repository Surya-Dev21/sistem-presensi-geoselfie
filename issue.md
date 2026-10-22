# Issue: [Refactor] Unifikasi Sistem Login & Redesign Antarmuka (Split-Screen)

## 📌 Deskripsi Singkat
Saat ini sistem login masih menggunakan fitur pemilihan *role* (peran) yang memperlambat alur pengguna, dan antarmuka (UI) masih terlalu standar. 
Tujuan dari *issue* ini adalah menghapus pemilihan *role*, menyatukan jalur login untuk Guru dan Admin di satu halaman, serta merombak tampilan UI menjadi desain *split-screen* bertema sekolah yang modern dan elegan.

## 🎯 Kriteria Penerimaan (Acceptance Criteria)

### 1. Perombakan Logika Login (Backend & Frontend Form)
- [ ] **Hapus Fitur Pilih Role:** Hapus *dropdown*, *radio button*, atau *tab* pemilihan role (Admin/Guru) pada halaman login.
- [ ] **Unifikasi Input Kredensial:** Ubah label input *username* menjadi **"NIP / Email"**. 
- [ ] **Smart Authentication:** Sistem (Controller Laravel) harus bisa mendeteksi secara otomatis:
  - Jika inputan berupa **angka/kombinasi angka (NIP)**, arahkan autentikasi ke *guard/table* `Pegawai` (Guru).
  - Jika inputan berformat **email (mengandung `@`)**, arahkan autentikasi ke *guard/table* `Admin`.
- [ ] **Validasi:** Tetap pertahankan validasi error dari sisi server dan tampilkan di UI jika kredensial salah.

### 2. Redesign UI Login (Split-Screen Concept)
- [ ] **Layouting:** Gunakan grid/flexbox Tailwind CSS untuk membagi layar menjadi dua bagian (50:50 atau 40:60) khusus untuk tampilan *desktop*. Di tampilan *mobile*, gambar disembunyikan atau dijadikan latar belakang transparan.
- [ ] **Sisi Kiri (Ilustrasi):** Tampilkan gambar/ilustrasi berkualitas tinggi yang bertema sekolah/pendidikan. Berikan efek *overlay* atau teks penyambutan (misal: "Selamat Datang di SIMAG SMK Pembangunan Bandung Barat").
- [ ] **Sisi Kanan (Form):** Letakkan form login di area ini dengan desain yang bersih, minimalis, dan *centered*.
- [ ] **Shadcn UI Integration:** Gunakan komponen Shadcn UI secara maksimal:
  - `Card` atau wadah minimalis untuk form.
  - `Input` untuk field NIP/Email dan Password.
  - `Label` untuk teks input.
  - `Button` untuk tombol submit dengan state `disabled` saat *loading/processing*.

## 🛠️ Panduan Teknis & Best Practices (MANDATORY)

Bagi Developer / AI yang mengerjakan *issue* ini, perhatikan aturan berikut secara ketat:

1. **Clean Code & Modular:** 
   - Jangan tumpuk semua kode di satu file raksasa jika bisa dipisah. 
   - Hapus *state* atau *import* yang sudah tidak digunakan paska penghapusan fitur "pilih role".
2. **Tailwind CSS Mastery:** 
   - Hindari CSS kustom/inline. Gunakan kelas bawaan Tailwind.
   - Perhatikan *Dark Mode* (opsional tapi disarankan, gunakan *class* `dark:` dari Tailwind).
3. **No "AI Slop":** 
   - Hasilkan kode yang fungsional, tepat sasaran, dan ringkas.
   - Hindari komentar kode yang berlebihan dan tidak berguna (misal: `// ini adalah tombol`).
   - Gunakan nama variabel yang semantik (contoh: `credential` alih-alih `dataLogin2`).
4. **Inertia.js Form Handling:**
   - Gunakan `useForm` dari `@inertiajs/react` untuk menangani state form, progress, dan error handling dengan elegan.

## 📄 Referensi Desain
- Tema: Sekolah, Akademik, Modern, Clean.
- Palet Warna: Mengikuti warna identitas UI yang sudah ada (misalnya Slate/Blue/Emerald).
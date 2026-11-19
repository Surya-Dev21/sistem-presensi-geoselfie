# Rencana Implementasi: Peningkatan UI/UX Riwayat Presensi + Izin/Sakit Masuk Riwayat

Dokumen ini adalah panduan teknis langkah-demi-langkah untuk **junior programmer** atau **AI model** yang mengeksekusi. Ikuti urutannya, jangan melompati tahap verifikasi.

---

## 🎯 Sasaran

1. **Perbaiki UI/UX halaman Riwayat Presensi (`/kalender`)**: responsif (mobile-first), rapi, enak dibaca, konsisten dengan Dashboard.
2. **Warna status**: **Hadir = hijau**, **Izin = biru**, **Sakit = kuning**, **Alpa = merah**.
3. **Izin dan Sakit dipisah** — jangan digabung jadi satu kartu "Izin / Sakit".
4. **Pengajuan Izin/Sakit guru ikut tampil di Riwayat Presensi** per tanggal (bukan hanya di halaman `/izin`).

---

## 🧭 Kondisi Kode Saat Ini (hasil audit — jangan diabaikan)

| Berkas | Kondisi nyata |
|---|---|
| `resources/js/pages/Pegawai/Kalender.jsx` | Hanya tabel desktop (`overflow-x-auto`), belum ada layout kartu mobile. 3 kartu statistik: Hadir (biru), **Izin / Sakit (digabung, slate)**, Alpa (rose). Warna Hadir masih biru, belum hijau. |
| `app/Http/Controllers/AbsensiController.php@index` | Hanya mengambil tabel `absensi`. Tabel `izin` **tidak** ikut dibaca. Statistik hanya `hadir`, `izin_sakit`, `alpa`. |
| `app/Models/Izin.php` | `$fillable` **SALAH**: memakai `tanggal_mulai`, `tanggal_selesai`, `status`, `keterangan`, `bukti_file`, `status_approval` — padahal kolom DB: `tgl_mulai`, `tgl_selesai`, `status`, `keterangan`, `bukti_file`, `status_approval`. Yang salah hanya dua nama tanggal. |
| `app/Http/Controllers/IzinController.php@store` | **KOSONG** (tidak menyimpan apa pun). `create()` juga tidak mengirim `riwayatIzin`, jadi kartu riwayat di `/izin` selalu kosong. |
| `resources/js/pages/Pegawai/Izin.jsx` | Form mengirim `jenis_izin`, `tgl_mulai`, `tgl_selesai`, `alasan`, `dokumen`. Enum DB `status` = `['izin','sakit']`, `status_approval` = `['pending','approved','rejected']`. |

**Kesimpulan:** fitur "izin/sakit masuk riwayat" **tidak bisa** dikerjakan hanya di frontend. `IzinController@store` wajib diisi dulu, kalau tidak akan selalu kosong.

---

## ⚠️ Aturan Main (wajib dipatuhi junior/AI)

- Kerjakan di branch baru: `git checkout -b feature/riwayat-presensi-ux`.
- **Jangan** menambah package NPM/composer baru.
- **Jangan** mengubah skema database (tidak perlu migration baru). Kalau terpaksa, jelaskan alasannya di PR.
- **Jangan** menyentuh halaman lain selain yang disebut di dokumen ini.
- Semua teks UI berbahasa Indonesia, konsisten dengan halaman lain.
- Angka/format tanggal pakai lokal Indonesia (`id-ID`), zona waktu `Asia/Jakarta`.
- Jalankan `npm run build` + `php artisan test` sebelum commit.

---

## TAHAP 1 — Backend: benahi model & simpan pengajuan izin

### 1.1 `app/Models/Izin.php`

Ganti `$fillable` menjadi sesuai kolom DB:

```php
protected $fillable = [
    'nip',
    'tgl_mulai',
    'tgl_selesai',
    'status',            // enum: 'izin' | 'sakit'
    'keterangan',
    'bukti_file',
    'status_approval',   // enum: 'pending' | 'approved' | 'rejected'
];
```

Tambahkan cast agar tanggal konsisten:

```php
protected $casts = [
    'tgl_mulai'   => 'date:Y-m-d',
    'tgl_selesai' => 'date:Y-m-d',
];
```

### 1.2 `app/Http/Controllers/IzinController.php`

`create()` — kirim riwayat milik guru yang login, **dengan nama field yang dipakai `Izin.jsx`** (`jenis_izin`, `status`, `tgl_mulai`, `tgl_selesai`, `alasan`):

```php
use App\Models\Izin;
use Illuminate\Support\Facades\Auth;

public function create()
{
    $pegawai = Auth::guard('pegawai')->user();

    $riwayatIzin = Izin::where('nip', $pegawai->nip)
        ->orderByDesc('tgl_mulai')
        ->limit(10)
        ->get()
        ->map(fn ($i) => [
            'jenis_izin' => ucfirst($i->status),                       // Izin / Sakit
            'tgl_mulai'  => $i->tgl_mulai?->format('Y-m-d'),
            'tgl_selesai'=> $i->tgl_selesai?->format('Y-m-d'),
            'alasan'     => $i->keterangan,
            'status'     => match ($i->status_approval) {               // label untuk badge
                'approved' => 'Disetujui',
                'rejected' => 'Ditolak',
                default    => 'Menunggu',
            },
        ]);

    return Inertia::render('Pegawai/Izin', ['riwayatIzin' => $riwayatIzin]);
}
```

`store()` — validasi, simpan file, simpan record:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

public function store(Request $request)
{
    $pegawai = Auth::guard('pegawai')->user();
    $today = now('Asia/Jakarta')->toDateString();

    $validated = $request->validate([
        'jenis_izin' => ['required', Rule::in(['Izin', 'Sakit'])],
        'tgl_mulai'  => ['required', 'date', 'after_or_equal:' . $today],
        'tgl_selesai'=> ['required', 'date', 'after_or_equal:tgl_mulai'],
        'alasan'     => ['required', 'string', 'min:5', 'max:500'],
        'dokumen'    => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
    ], [
        'jenis_izin.required'   => 'Jenis permohonan wajib dipilih.',
        'tgl_mulai.after_or_equal' => 'Tanggal mulai tidak boleh di masa lalu.',
        'tgl_selesai.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
        'alasan.required'       => 'Keterangan/alasan wajib diisi.',
        'alasan.min'            => 'Alasan minimal 5 karakter.',
        'dokumen.mimes'         => 'Bukti harus berupa JPG, PNG, atau PDF.',
        'dokumen.max'           => 'Ukuran bukti maksimal 2 MB.',
    ]);

    $bukti = $request->hasFile('dokumen')
        ? $request->file('dokumen')->store('izin', 'public')
        : null;

    Izin::create([
        'nip'             => $pegawai->nip,
        'tgl_mulai'       => $validated['tgl_mulai'],
        'tgl_selesai'     => $validated['tgl_selesai'],
        'status'          => strtolower($validated['jenis_izin']), // 'izin' | 'sakit'
        'keterangan'      => trim(strip_tags($validated['alasan'])),
        'bukti_file'      => $bukti,
        'status_approval' => 'pending',
    ]);

    return redirect()->route('izin.create')
        ->with('success', 'Permohonan ' . $validated['jenis_izin'] . ' berhasil dikirim dan menunggu persetujuan.');
}
```

### 1.3 `resources/js/pages/Pegawai/Izin.jsx`

- Hapus `<option value="Cuti">` dari dropdown **Jenis Permohonan** (enum DB hanya `izin`/`sakit`; opsi Cuti akan error saat disimpan).
- Ubah label "Permohonan Izin & Cuti" → "Permohonan Izin & Sakit".
- Tombol submit: `bg-blue-800 hover:bg-blue-900` (samakan dengan halaman lain; hilangkan `shadow-blue-600/20`).
- Ikon judul form masih `text-amber-500` → ganti `text-blue-700 dark:text-blue-300`.

### ✅ Verifikasi Tahap 1

- [ ] Submit form izin → muncul flash sukses, record masuk tabel `izin`.
- [ ] `/izin` menampilkan riwayat yang baru dibuat.
- [ ] Submit dengan tanggal lampau / alasan kosong → muncul error validasi di field terkait.
- [ ] Submit tanpa dokumen tetap berhasil.

---

## TAHAP 2 — Backend: gabungkan izin/sakit ke Riwayat Presensi

Edit `app/Http/Controllers/AbsensiController.php`, method `index()`.

**Aturan penggabungan (tulis apa adanya, jangan improvisasi):**

1. Satu baris = satu tanggal.
2. Jika pada tanggal itu ada data `absensi` → **absensi menang** (status `Hadir`).
3. Jika tidak ada absensi tapi ada izin/sakit yang mencakup tanggal tersebut → baris `Izin` / `Sakit`.
4. Izin dengan `status_approval = 'rejected'` **tidak** ditampilkan.
5. Rentang izin multi-hari dipecah menjadi satu baris per tanggal, hanya yang berada di bulan filter.
6. Urutan: tanggal terbaru di atas.

Kode acuan:

```php
use App\Models\Izin;

public function index(Request $request)
{
    $pegawai = Auth::guard('pegawai')->user();

    $bulan = (int) $request->input('bulan', now('Asia/Jakarta')->month);
    $tahun = (int) $request->input('tahun', now('Asia/Jakarta')->year);
    $awal  = Carbon::create($tahun, $bulan, 1)->startOfMonth();
    $akhir = $awal->copy()->endOfMonth();

    $absensi = Absensi::where('nip', $pegawai->nip)
        ->whereBetween('tgl_absen', [$awal->toDateString(), $akhir->toDateString()])
        ->get();

    $izin = Izin::where('nip', $pegawai->nip)
        ->where('status_approval', '!=', 'rejected')
        ->whereDate('tgl_mulai', '<=', $akhir->toDateString())
        ->whereDate('tgl_selesai', '>=', $awal->toDateString())
        ->get();

    $baris = [];

    // 1) Absensi menang atas izin pada tanggal yang sama
    foreach ($absensi as $a) {
        $baris[$a->tgl_absen] = [
            'id'         => $a->id,
            'tgl_absen'  => $a->tgl_absen,
            'jam_masuk'  => $a->jam_masuk,
            'jam_keluar' => $a->jam_keluar,
            'status'     => $a->status ?: 'Hadir',
            'keterangan' => null,
            'sumber'     => 'absensi',
        ];
    }

    // 2) Sebar rentang izin/sakit jadi per tanggal
    foreach ($izin as $i) {
        $tgl = Carbon::parse($i->tgl_mulai)->startOfDay();
        $selesai = Carbon::parse($i->tgl_selesai)->startOfDay();

        while ($tgl->lte($selesai)) {
            $kunci = $tgl->toDateString();

            if ($tgl->betweenIncluded($awal, $akhir) && !isset($baris[$kunci])) {
                $baris[$kunci] = [
                    'id'         => 'izin-' . $i->id . '-' . $kunci,
                    'tgl_absen'  => $kunci,
                    'jam_masuk'  => null,
                    'jam_keluar' => null,
                    'status'     => $i->status === 'sakit' ? 'Sakit' : 'Izin',
                    'keterangan' => $i->keterangan,
                    'sumber'     => 'izin',
                ];
            }

            $tgl->addDay();
        }
    }

    krsort($baris);
    $riwayat = collect(array_values($baris));

    return Inertia::render('Pegawai/Kalender', [
        'riwayat'   => $riwayat,
        'statistik' => [
            'hadir' => $riwayat->where('status', 'Hadir')->count(),
            'izin'  => $riwayat->where('status', 'Izin')->count(),
            'sakit' => $riwayat->where('status', 'Sakit')->count(),
            'alpa'  => $riwayat->where('status', 'Alpa')->count(),
        ],
        'filter'    => ['bulan' => (string) $bulan, 'tahun' => (string) $tahun],
    ]);
}
```

**Catatan jujur untuk junior:** `Alpa` hanya menghitung baris berstatus `Alpa` di tabel `absensi`. Saat ini tidak ada proses yang otomatis menandai guru alpa, jadi angka Alpa akan tetap 0 sampai admin menambahkan data tersebut. **Jangan** mengarang logika "hari kerja kosong = alpa" — itu butuh kalender hari efektif sekolah (di luar scope).

### ✅ Verifikasi Tahap 2

- [ ] Buat 1 izin 2 hari di bulan berjalan → `/kalender` menampilkan 2 baris `Izin`.
- [ ] Buat 1 sakit 1 hari → tampil baris `Sakit` (bukan `Izin`).
- [ ] Tanggal yang punya absensi + izin → tampil `Hadir` (bukan dobel).
- [ ] Izin `rejected` → tidak muncul.
- [ ] Ganti filter bulan → hanya baris bulan itu yang tampil.

---

## TAHAP 3 — Frontend: rombak `Kalender.jsx`

Target file: `resources/js/pages/Pegawai/Kalender.jsx` (tulis ulang bagian render; logika filter tetap).

### 3.1 Palet status (satu sumber kebenaran)

Buat konstanta di atas komponen, lalu pakai di badge, kartu statistik, dan legenda:

```jsx
const STATUS = {
    Hadir: {
        label: 'Hadir',
        card: 'border-emerald-200 dark:border-emerald-900',
        iconBg: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
        value: 'text-emerald-700 dark:text-emerald-400',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
        dot: 'bg-emerald-500',
    },
    Izin: {
        label: 'Izin',
        card: 'border-blue-200 dark:border-blue-900',
        iconBg: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
        value: 'text-blue-700 dark:text-blue-300',
        badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
        dot: 'bg-blue-500',
    },
    Sakit: {
        label: 'Sakit',
        card: 'border-yellow-200 dark:border-yellow-900',
        iconBg: 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300',
        value: 'text-yellow-700 dark:text-yellow-300',
        badge: 'bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-900',
        dot: 'bg-yellow-400',
    },
    Alpa: {
        label: 'Alpa',
        card: 'border-rose-200 dark:border-rose-900',
        iconBg: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
        value: 'text-rose-700 dark:text-rose-400',
        badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900',
        dot: 'bg-rose-500',
    },
};

const statusStyle = (status) => STATUS[status] ?? STATUS.Hadir;
```

**Aturan warna (dari issue, jangan diubah):** `Hadir` hijau, `Izin` biru, `Sakit` kuning, `Alpa` merah. Jangan pakai kuning untuk status lain dan jangan pakai biru untuk Hadir lagi.

### 3.2 Header halaman

- Judul: "Riwayat Presensi" (`text-lg sm:text-xl font-black`).
- Subjudul: "Rekap kehadiran, izin, dan sakit Anda per bulan."
- Tambahkan **legenda** chip kecil di kanan/bawah judul (Hadir / Izin / Sakit / Alpa) memakai `dot` + `label` dari `STATUS`. Di mobile legenda boleh membungkus (`flex-wrap`).

### 3.3 Kartu statistik → **4 kartu terpisah**

```jsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {[
        { key: 'hadir', status: 'Hadir', icon: FiCheckCircle },
        { key: 'izin',  status: 'Izin',  icon: FiFileText },
        { key: 'sakit', status: 'Sakit', icon: FiThermometer },
        { key: 'alpa',  status: 'Alpa',  icon: FiXCircle },
    ].map(({ key, status, icon: Icon }) => {
        const s = STATUS[status];
        return (
            <div key={key} className={`bg-white dark:bg-slate-900 rounded-2xl p-3.5 border ${s.card} shadow-xs flex items-center gap-3`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${s.iconBg}`}>
                    <Icon />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                        {s.label}
                    </p>
                    <p className={`text-lg font-black leading-tight ${s.value}`}>
                        {statistik[key] ?? 0} <span className="text-[10px] font-medium text-slate-500">Hari</span>
                    </p>
                </div>
            </div>
        );
    })}
</div>
```

- Hapus kartu gabungan "Izin / Sakit".
- Default prop: `statistik = { hadir: 0, izin: 0, sakit: 0, alpa: 0 }`.
- Import ikon yang dipakai saja: `FiCheckCircle, FiFileText, FiThermometer, FiXCircle, FiCalendar, FiFilter`.

### 3.4 Toolbar filter (ringkas, satu baris di desktop)

Gabungkan filter Bulan + Tahun + tombol reset ke **satu** card:

- Wrapper: `bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs`.
- Layout: `flex flex-col sm:flex-row sm:items-end gap-2.5`.
- Dua `<select>` (`aria-label="Filter bulan"` / `"Filter tahun"`) dengan class ringkas:
  `h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-800 focus:ring-0`.
- Tombol "Reset" (outline): `h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800`.
- `router.get('/kalender', params, { preserveState: true, preserveScroll: true, replace: true })`.
- Tampilkan jumlah baris: `Menampilkan {riwayat.length} baris` (`text-[11px] text-slate-500`) dengan `aria-live="polite"`.

### 3.5 Tabel desktop + kartu mobile (wajib dua-duanya)

**Desktop (`hidden md:block`)**: tabel dengan header `scope="col"`, kolom:

| Kolom | Isi |
|---|---|
| Tanggal | `fmtTanggal(item.tgl_absen)` |
| Jam Masuk | `fmtJam(item.jam_masuk)` atau `—` |
| Jam Pulang | `fmtJam(item.jam_keluar)` atau `—` |
| Status | badge `statusStyle(item.status).badge` |
| Keterangan | `item.keterangan` (truncate, `hidden lg:table-cell`) atau `—` untuk absensi |

Detail visual: `thead` background `bg-slate-50 dark:bg-slate-800/60`, `text-[10px] uppercase tracking-wider text-slate-500`, baris `hover:bg-slate-50/80 dark:hover:bg-slate-800/40`, padding `py-3 px-4`, pemisah `divide-y divide-slate-100 dark:divide-slate-800`.

**Mobile (`md:hidden`)**: satu kartu per baris.

```jsx
<div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
    {riwayat.map((item) => {
        const s = statusStyle(item.status);
        return (
            <div key={item.id} className="p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {fmtTanggal(item.tgl_absen)}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
                        {s.label}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1">
                        <FiCalendar className="h-3 w-3 text-slate-400" aria-hidden="true" />
                        Masuk: {fmtJam(item.jam_masuk) ?? '—'}
                    </span>
                    <span>Pulang: {fmtJam(item.jam_keluar) ?? '—'}</span>
                </div>
                {item.keterangan && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.keterangan}
                    </p>
                )}
            </div>
        );
    })}
</div>
```

- Empty state (dipakai di dua-duanya): ikon + "Belum ada data presensi pada periode ini." + subteks "Coba ganti bulan atau tahun."
- Baris izin/sakit **tidak** menampilkan jam (pakai `—`), cukup status + keterangan.

### 3.6 Kepadatan & responsif

- Container: `space-y-3.5 max-w-5xl` (bukan `space-y-6`).
- Semua teks tabel `text-xs`, header `text-[10px]`.
- Uji di 360px, 414px, 768px, 1280px — **tidak boleh ada horizontal scroll di body**.
- Kartu statistik mobile `grid-cols-2` (bukan 1 kolom panjang).
- Pastikan dark mode tetap terbaca (semua class punya pasangan `dark:`).

### 3.7 Aksesibilitas

- Status **tidak boleh** dibedakan hanya dengan warna: teks label selalu ada di dalam badge.
- Tabel: `<th scope="col">`; badge dot `aria-hidden="true"`.
- Select filter punya `aria-label`.
- Jumlah baris dibungkus `aria-live="polite"`.

### ✅ Verifikasi Tahap 3

- [ ] Warna sesuai: Hadir hijau, Izin biru, Sakit kuning, Alpa merah (cek light & dark).
- [ ] Ada 4 kartu statistik, tidak ada lagi kartu gabungan Izin/Sakit.
- [ ] Di 375px: tampil kartu mobile, tanpa scroll horizontal.
- [ ] Di ≥768px: tampil tabel.
- [ ] Filter bulan/tahun + Reset berfungsi tanpa reload penuh.
- [ ] Data izin/sakit dari Tahap 2 tampil di kedua layout.

---

## TAHAP 4 — Test otomatis (wajib, kecil saja)

Buat `tests/Feature/KalenderIzinTest.php` (pola sama seperti `tests/Feature/AbsensiTest.php` yang sudah ada):

```php
<?php

use App\Models\Absensi;
use App\Models\Izin;
use App\Models\Pegawai;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function pegawaiUji(): Pegawai
{
    return Pegawai::create([
        'nip' => '199002022020011002',
        'nama_lengkap' => 'Siti Aminah',
        'jabatan' => 'Guru Mapel',
        'no_hp' => '081200000000',
        'email' => 'siti@example.test',
        'jenis_kelamin' => 'P',
        'password' => bcrypt('password'),
    ]);
}

// Tanggal tetap di tengah bulan berjalan agar test tidak jatuh ke bulan lain
function tanggalUji(int $offsetHari = 0): string
{
    return now('Asia/Jakarta')->startOfMonth()->addDays(9 + $offsetHari)->toDateString();
}

test('izin dan sakit muncul sebagai baris riwayat terpisah', function () {
    $pegawai = pegawaiUji();

    Izin::create([
        'nip' => $pegawai->nip,
        'tgl_mulai' => tanggalUji(0),
        'tgl_selesai' => tanggalUji(0),
        'status' => 'izin',
        'keterangan' => 'Urusan keluarga',
        'status_approval' => 'pending',
    ]);

    Izin::create([
        'nip' => $pegawai->nip,
        'tgl_mulai' => tanggalUji(1),
        'tgl_selesai' => tanggalUji(1),
        'status' => 'sakit',
        'keterangan' => 'Demam',
        'status_approval' => 'approved',
    ]);

    $this->actingAs($pegawai, 'pegawai')
        ->get('/kalender')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('statistik.izin', 1)
            ->where('statistik.sakit', 1)
            ->where('statistik.hadir', 0)
        );
});

test('absensi menang atas izin pada tanggal yang sama', function () {
    $pegawai = pegawaiUji();
    $tanggal = tanggalUji(0);

    Absensi::create([
        'nip' => $pegawai->nip,
        'tgl_absen' => $tanggal,
        'jam_masuk' => '07:00:00',
        'status' => 'Hadir',
    ]);

    Izin::create([
        'nip' => $pegawai->nip,
        'tgl_mulai' => $tanggal,
        'tgl_selesai' => $tanggal,
        'status' => 'izin',
        'keterangan' => 'Tes dobel',
        'status_approval' => 'approved',
    ]);

    $this->actingAs($pegawai, 'pegawai')
        ->get('/kalender')
        ->assertInertia(fn ($page) => $page
            ->where('statistik.hadir', 1)
            ->where('statistik.izin', 0)
            ->has('riwayat', 1)
        );
});
```

> Jika `assertInertia` tidak dikenali, pastikan package `inertiajs/inertia-laravel` sudah terpasang (biasanya sudah, karena dipakai semua halaman).

---

## TAHAP 5 — Verifikasi akhir & commit

Jalankan berurutan:

```bash
php -l app/Http/Controllers/IzinController.php
php -l app/Http/Controllers/AbsensiController.php
php -l app/Models/Izin.php
php artisan test
npm run build
```

Checklist manual:

- [ ] `/izin` → kirim izin 2 hari + upload JPG → sukses, muncul di riwayat kanan.
- [ ] `/kalender` → baris Izin tampil 2 hari, badge biru, tanpa jam.
- [ ] Kirim sakit 1 hari → badge kuning, kartu statistik Sakit bertambah.
- [ ] Absen masuk di hari yang sama dengan izin → status jadi Hadir (tidak dobel).
- [ ] Filter bulan lain → data hilang/muncul sesuai periode.
- [ ] Mobile 375px: kartu mobile rapi, tombol/select bisa disentuh (tinggi ≥ 36px).
- [ ] Dark mode: badge, kartu, dan teks tetap kontras.
- [ ] Tidak ada error di console browser.

Commit (pesan deskriptif, satu commit boleh digabung):

```bash
git add app/Models/Izin.php app/Http/Controllers/IzinController.php \
        app/Http/Controllers/AbsensiController.php \
        resources/js/pages/Pegawai/Kalender.jsx \
        resources/js/pages/Pegawai/Izin.jsx \
        tests/Feature/KalenderIzinTest.php
git commit -m "feat(riwayat): UI/UX riwayat presensi responsif + izin/sakit tampil terpisah"
git push -u origin feature/riwayat-presensi-ux
```

Lalu buka PR ke `main` dan tulis di deskripsi: apa yang diubah, screenshot mobile + desktop, dan hasil `php artisan test`.

---

## 📌 Definition of Done

- [ ] Riwayat presensi punya layout kartu di mobile dan tabel di desktop.
- [ ] 4 status dengan warna baku: Hadir hijau, Izin biru, Sakit kuning, Alpa merah.
- [ ] Izin dan Sakit **tidak** lagi digabung di statistik maupun badge.
- [ ] Pengajuan izin/sakit benar-benar tersimpan (bukan form kosong) dan tampil di `/kalender` per tanggal.
- [ ] Tidak ada horizontal scroll di 375px; dark mode tetap rapi.
- [ ] `php artisan test` dan `npm run build` lulus.

---

## 🚫 Di Luar Scope (jangan dikerjakan di PR ini)

- Halaman approval izin untuk admin (tabel `status_approval` tetap `pending` sampai fitur itu dibuat).
- Perhitungan Alpa otomatis dari hari efektif sekolah.
- Jenis "Cuti" (butuh perubahan enum + migration).
- Export PDF/Excel riwayat presensi.
- Notifikasi WhatsApp/email saat izin disetujui.

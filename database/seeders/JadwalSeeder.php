<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class JadwalSeeder extends Seeder
{
    /**
     * Mapping: nama_guru_dari_csv => nip_di_database
     * Dibuat otomatis: guru yang namanya cocok dengan PegawaiSeeder pakai NIP dummy,
     * guru baru ditambahkan ke pegawai terlebih dahulu.
     */
    private function getNipByNama(string $nama): ?string
    {
        // Normalisasi nama: lowercase, hapus spasi berlebih
        $norm = strtolower(trim(preg_replace('/\s+/', ' ', $nama)));

        // Cari di database berdasarkan nama (partial match)
        $pegawai = DB::table('pegawai')
            ->whereRaw('LOWER(TRIM(nama_lengkap)) = ?', [$norm])
            ->value('nip');

        return $pegawai;
    }

    /**
     * Tambahkan guru baru ke tabel pegawai jika belum ada.
     */
    private function tambahGuruBaru(string $kodeGuru, string $namaGuru): string
    {
        // Buat NIP dummy dari kode guru (format: 1990020100XX)
        $nip = '1990020100' . str_pad($kodeGuru, 2, '0', STR_PAD_LEFT);

        $exists = DB::table('pegawai')->where('nip', $nip)->exists();
        if (!$exists) {
            // Deteksi jenis kelamin dari nama
            $namaLower = strtolower($namaGuru);
            $jk = 'L';
            $namaPerempuan = ['siti', 'ai ', 'sri ', 'ida ', 'novi ', 'yeyen', 'wafa', 'siti'];
            foreach ($namaPerempuan as $p) {
                if (str_contains($namaLower, $p)) {
                    $jk = 'P';
                    break;
                }
            }

            DB::table('pegawai')->insert([
                'nip'           => $nip,
                'nama_lengkap'  => $namaGuru,
                'jabatan'       => 'Guru',
                'jenis_kelamin' => $jk,
                'no_hp'         => '-',
                'email'         => null,
                'password'      => Hash::make('smkpbb2024'),
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            $this->command->line("  → Guru baru ditambahkan: {$namaGuru} (NIP: {$nip})");
        }

        return $nip;
    }

    /**
     * Parse waktu "07.00 – 07.35" menjadi ["07:00", "07:35"]
     */
    private function parseWaktu(string $waktu): array
    {
        // Bersihkan karakter khusus (dash, spasi, dsb)
        $waktu = preg_replace('/[^\d\.\–\-]/', ' ', $waktu);
        $parts  = preg_split('/[\s\–\-]+/', trim($waktu));
        $parts  = array_values(array_filter($parts));

        $mulai   = isset($parts[0]) ? str_replace('.', ':', trim($parts[0])) . ':00' : '00:00:00';
        $selesai = isset($parts[1]) ? str_replace('.', ':', trim($parts[1])) . ':00' : '00:00:00';

        // Pastikan format HH:MM:SS
        $fix = function ($t) {
            $t = trim($t);
            if (preg_match('/^\d{1,2}:\d{2}$/', $t)) {
                return $t . ':00';
            }
            return $t;
        };

        return [$fix($mulai), $fix($selesai)];
    }

    public function run(): void
    {
        // Kosongkan jadwal lama agar tidak duplikat
        DB::table('jadwal_mengajars')->truncate();

        // Mapping kode guru => nama guru (dari mata_pelajaran.csv)
        // Dipakai untuk mencari / membuat NIP
        $kodeGuruMap = [
            1  => 'Aam Kurnia S.Pd',
            2  => 'Adnan S.H',
            3  => 'Ahmad Gojali S.Pd',
            4  => 'Ahmad Royani S.Pd',
            5  => 'Ai Fitriana',
            6  => 'Ai Lina S.Pd',
            7  => 'Deden Somantri S.Pd',
            8  => 'Egis Saputra B.B.A',
            9  => 'Endi Suhendi S.Kom',
            10 => 'Halid S.E',
            11 => 'H. Ahman Saepul Banan S.Pd',
            12 => 'H. Zaenal Muttaqin',
            13 => 'H. Nunu S.Pd',
            14 => 'H. Yayat S.Pd',
            15 => 'Harun S.Pd',
            16 => 'Hermansyah S.Pd',
            17 => 'Ida Farida S.Pd',
            18 => 'Jejen S.Pd',
            19 => 'Kamil Faisal S.Pd.I',
            20 => 'Misbah S.Pd',
            21 => 'Muhammad Yuga Wira Praja A., S.Pd., M.Sos',
            22 => 'Novi Rahmawati S.Pd',
            23 => 'Saepudin S.Pd',
            24 => 'Sahrul Sidiq S.Pd',
            25 => 'Septian Nurfajar S.Pd',
            26 => 'Siti Nur Azizah S.Pd',
            27 => 'Siti Nurlela S.Pd',
            28 => 'Siti Raniah S.E',
            29 => 'Siti Rubaiyah S.Pd',
            30 => 'Sri Pelitawati S.Pd',
            31 => 'Suhendro Joyo S.Pd',
            32 => 'Tantan Rustandi S.Pd',
            33 => 'Wafa Nisa Audry S.Pd',
            34 => 'Yeyen Nuraeni S.Pd',
            35 => 'Yudi Somantri S.T',
        ];

        // Cache NIP per kode guru agar tidak query berulang
        $nipCache = [];

        // Data jadwal (Hari, Waktu Mulai, Waktu Selesai, Kelas, Mapel, Kode_Guru)
        // Dikelompokkan: satu slot (Hari + Jam mulai + Kelas + Guru) = 1 record
        // Format: [Hari, WaktuRange, Kelas, Kode_Mapel, Kode_Guru]
        $rawJadwal = [
            // ── SENIN ──
            ['Senin','07.00 – 07.35','X MPLB','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Senin','07.00 – 08.10','X DKV','Informatika',21],
            ['Senin','07.00 – 07.35','X PPLG','Bahasa Inggris',29],
            ['Senin','07.00 – 07.35','X TO','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Senin','07.00 – 08.45','XI MPLB','Matematika',18],
            ['Senin','07.00 – 07.35','XI DKV','Kajian Kitab Kuning',12],
            ['Senin','07.00 – 08.45','XI PPLG','Basis Data',32],
            ['Senin','07.00 – 08.45','XI TO','Sistem Pemindah Tenaga Kendaraan Ringan',7],
            ['Senin','07.00 – 09.20','XII MPLB','Otomatisasi Tata Kelola Keuangan',28],
            ['Senin','07.00 – 08.45','XII DKV','Bahasa Sunda',30],
            ['Senin','07.00 – 07.35','XII PPLG','Pemrograman Aplikasi Mobile',35],
            ['Senin','07.00 – 08.45','XII TO','Matematika',34],
            ['Senin','08.10 – 08.45','X DKV','Bahasa Inggris',29],
            ['Senin','08.10 – 09.20','X PPLG','Pendidikan Pancasila',25],
            ['Senin','08.10 – 09.20','X TO','Informatika',21],
            ['Senin','08.10 – 08.45','XI DKV','Produk Kreatif dan Kewirausahaan',26],
            ['Senin','08.45 – 09.20','X MPLB','Pendidikan Jasmani, Olahraga dan Kesehatan',24],
            ['Senin','08.45 – 09.20','XI MPLB','Otomatisasi Tata Kelola Sarana dan Prasarana',33],
            ['Senin','08.45 – 09.20','XI DKV','Produk Kreatif dan Kewirausahaan',26],
            ['Senin','08.45 – 09.20','XII DKV','Desain Media Interaktif',35],
            ['Senin','09.40 – 10.50','X MPLB','Pendidikan Jasmani, Olahraga dan Kesehatan',24],
            ['Senin','09.40 – 10.15','X DKV','Pendidikan Pancasila',25],
            ['Senin','09.40 – 10.50','X PPLG','Informatika',21],
            ['Senin','09.40 – 10.50','X TO','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Senin','09.40 – 10.50','XI MPLB','Otomatisasi Tata Kelola Sarana dan Prasarana',33],
            ['Senin','09.40 – 10.15','XI DKV','Teknik Animasi 2D dan 3D',11],
            ['Senin','09.40 – 10.50','XI PPLG','Bahasa Arab',26],
            ['Senin','09.40 – 10.50','XI TO','Matematika',18],
            ['Senin','09.40 – 10.50','XII MPLB','Pendidikan Pancasila dan Kewarganegaraan',4],
            ['Senin','09.40 – 10.50','XII DKV','Desain Media Interaktif',35],
            ['Senin','09.40 – 10.50','XII PPLG','Matematika',34],
            ['Senin','09.40 – 10.50','XII TO','Pemeliharaan Kelistrikan Kendaraan Ringan',7],
            ['Senin','10.15 – 10.50','X DKV','Pendidikan Pancasila',25],
            ['Senin','10.15 – 10.50','XI DKV','Teknik Animasi 2D dan 3D',11],
            ['Senin','10.50 – 11.25','X MPLB','Dasar-Dasar Manajemen Perkantoran dan Layanan Bisnis',28],
            ['Senin','10.50 – 11.25','X DKV','Kajian Kitab Kuning',12],
            ['Senin','10.50 – 12.00','X PPLG','Matematika',34],
            ['Senin','10.50 – 11.25','X TO','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Senin','10.50 – 12.00','XI MPLB','Bahasa Inggris',29],
            ['Senin','10.50 – 12.00','XI DKV','Desain Grafis Percetakan',31],
            ['Senin','10.50 – 12.00','XI PPLG','Pemrograman Web',4],
            ['Senin','10.50 – 11.25','XI TO','Pendidikan Pancasila',25],
            ['Senin','10.50 – 12.00','XII MPLB','Otomatisasi Tata Kelola Sarana dan Prasarana',30],
            ['Senin','10.50 – 12.00','XII DKV','Bahasa Inggris',19],
            ['Senin','10.50 – 12.00','XII PPLG','Pemrograman Web',32],
            ['Senin','10.50 – 12.00','XII TO','Pemeliharaan Kelistrikan Kendaraan Ringan',7],
            ['Senin','11.25 – 12.00','X MPLB','Dasar-Dasar Manajemen Perkantoran dan Layanan Bisnis',28],
            ['Senin','11.25 – 12.00','X DKV','Kajian Kitab Kuning',12],
            ['Senin','11.25 – 12.00','X TO','Pendidikan Jasmani, Olahraga dan Kesehatan',24],
            ['Senin','11.25 – 12.00','XI TO','Pendidikan Pancasila',25],
            ['Senin','12.30 – 13.30','X MPLB','Bahasa Indonesia',22],
            ['Senin','12.30 – 13.30','X DKV','Bahasa Inggris',29],
            ['Senin','12.30 – 13.30','X PPLG','Matematika',34],
            ['Senin','12.30 – 13.30','X TO','Pendidikan Jasmani, Olahraga dan Kesehatan',24],
            ['Senin','12.30 – 13.30','XI MPLB','Pendidikan Pancasila dan Kewarganegaraan',25],
            ['Senin','12.30 – 13.30','XI DKV','Desain Grafis Percetakan',31],
            ['Senin','12.30 – 13.30','XI PPLG','Pemrograman Web',4],
            ['Senin','12.30 – 13.30','XI TO','Bahasa Arab',26],
            ['Senin','12.30 – 13.30','XII MPLB','Bahasa Inggris',19],
            ['Senin','12.30 – 13.30','XII DKV','Desain Media Interaktif',35],
            ['Senin','12.30 – 13.30','XII PPLG','Pemrograman Web',32],
            ['Senin','12.30 – 13.30','XII TO','Pemeliharaan Kelistrikan Kendaraan Ringan',7],

            // ── SELASA ──
            ['Selasa','07.00 – 07.35','X MPLB','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Selasa','07.00 – 08.45','X DKV','Dasar-Dasar Desain Komunikasi Visual',10],
            ['Selasa','07.00 – 08.45','X PPLG','Informatika',21],
            ['Selasa','07.00 – 09.20','X TO','Dasar-Dasar Teknik Otomotif',15],
            ['Selasa','07.00 – 08.45','XI MPLB','Otomatisasi Tata Kelola Keuangan',28],
            ['Selasa','07.00 – 08.10','XI DKV','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Selasa','07.00 – 08.45','XI PPLG','Bahasa Indonesia',22],
            ['Selasa','07.00 – 08.45','XI TO','Sistem Sasis Kendaraan Ringan',7],
            ['Selasa','07.00 – 08.45','XII MPLB','Pendidikan Agama Islam dan Budi Pekerti',23],
            ['Selasa','07.00 – 08.45','XII DKV','Teknologi Pengolahan Audio dan Video',9],
            ['Selasa','07.00 – 09.20','XII PPLG','Pemrograman Web',32],
            ['Selasa','07.00 – 07.35','XII TO','Bahasa Indonesia',27],
            ['Selasa','07.35 – 08.10','X MPLB','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Selasa','07.35 – 08.10','XI DKV','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Selasa','07.35 – 08.10','XII TO','Bahasa Indonesia',27],
            ['Selasa','08.10 – 08.45','X MPLB','Dasar-Dasar Manajemen Perkantoran dan Layanan Bisnis',28],
            ['Selasa','08.10 – 08.45','X PPLG','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Selasa','08.10 – 08.45','XI MPLB','Otomatisasi Tata Kelola Kepegawaian',8],
            ['Selasa','08.10 – 08.45','XI DKV','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Selasa','08.10 – 08.45','XII MPLB','Pendidikan Agama Islam dan Budi Pekerti',23],
            ['Selasa','08.10 – 08.45','XII TO','Pemeliharaan Mesin Kendaraan Ringan',16],
            ['Selasa','08.45 – 09.20','X MPLB','Dasar-Dasar Manajemen Perkantoran dan Layanan Bisnis',28],
            ['Selasa','08.45 – 09.20','X PPLG','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Selasa','08.45 – 09.20','XI MPLB','Otomatisasi Tata Kelola Kepegawaian',8],
            ['Selasa','08.45 – 09.20','XI DKV','Bahasa Indonesia',22],
            ['Selasa','08.45 – 09.20','XI PPLG','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Selasa','08.45 – 09.20','XII MPLB','Produk Kreatif dan Kewirausahaan',26],
            ['Selasa','08.45 – 09.20','XII TO','Pemeliharaan Mesin Kendaraan Ringan',16],
            ['Selasa','09.40 – 10.15','X MPLB','Informatika',21],
            ['Selasa','09.40 – 10.50','X DKV','Dasar-Dasar Desain Komunikasi Visual',10],
            ['Selasa','09.40 – 10.50','X PPLG','Dasar-Dasar Pengembangan Perangkat Lunak dan Gim',32],
            ['Selasa','09.40 – 10.50','X TO','Dasar-Dasar Teknik Otomotif',15],
            ['Selasa','09.40 – 10.50','XI MPLB','Otomatisasi Tata Kelola Sarana dan Prasarana',33],
            ['Selasa','09.40 – 10.50','XI DKV','Bahasa Indonesia',22],
            ['Selasa','09.40 – 10.50','XI PPLG','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Selasa','09.40 – 10.50','XI TO','Sistem Pemindah Tenaga Kendaraan Ringan',7],
            ['Selasa','09.40 – 10.50','XII MPLB','Produk Kreatif dan Kewirausahaan',26],
            ['Selasa','09.40 – 10.50','XII DKV','Teknologi Pengolahan Audio dan Video',9],
            ['Selasa','09.40 – 10.50','XII PPLG','Bahasa Indonesia',27],
            ['Selasa','09.40 – 10.50','XII TO','Pemeliharaan Mesin Kendaraan Ringan',16],
            ['Selasa','10.15 – 10.50','X MPLB','Informatika',21],
            ['Selasa','10.50 – 12.00','X MPLB','Informatika',21],
            ['Selasa','10.50 – 12.00','X DKV','Bahasa Indonesia',22],
            ['Selasa','10.50 – 12.00','X PPLG','Dasar-Dasar Pengembangan Perangkat Lunak dan Gim',32],
            ['Selasa','10.50 – 12.00','X TO','Dasar-Dasar Teknik Otomotif',15],
            ['Selasa','10.50 – 12.00','XI MPLB','Otomatisasi Tata Kelola Sarana dan Prasarana',33],
            ['Selasa','10.50 – 12.00','XI DKV','Teknik Animasi 2D dan 3D',11],
            ['Selasa','10.50 – 12.00','XI PPLG','Bahasa Inggris',13],
            ['Selasa','10.50 – 12.00','XI TO','Projek Kreatif dan Kewirausahaan',5],
            ['Selasa','10.50 – 12.00','XII MPLB','Bahasa Indonesia',27],
            ['Selasa','10.50 – 12.00','XII DKV','Desain Media Interaktif',35],
            ['Selasa','10.50 – 12.00','XII PPLG','Bahasa Inggris',19],
            ['Selasa','10.50 – 12.00','XII TO','Pemeliharaan Sasis & Pemindah TKR',7],
            ['Selasa','12.30 – 13.30','X MPLB','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Selasa','12.30 – 13.30','X DKV','Bahasa Indonesia',22],
            ['Selasa','12.30 – 13.30','X PPLG','Dasar-Dasar Pengembangan Perangkat Lunak dan Gim',32],
            ['Selasa','12.30 – 13.30','X TO','Informatika',21],
            ['Selasa','12.30 – 13.30','XI MPLB','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Selasa','12.30 – 13.30','XI DKV','Teknik Animasi 2D dan 3D',11],
            ['Selasa','12.30 – 13.30','XI PPLG','Projek Kreatif dan Kewirausahaan',5],
            ['Selasa','12.30 – 13.30','XI TO','Bahasa Inggris',13],
            ['Selasa','12.30 – 13.30','XII MPLB','Otomatisasi Tata Kelola Humas dan Keprotokolan',15],
            ['Selasa','12.30 – 13.30','XII DKV','Bahasa Indonesia',27],
            ['Selasa','12.30 – 13.30','XII PPLG','Bahasa Inggris',19],
            ['Selasa','12.30 – 13.30','XII TO','Pemeliharaan Sasis & Pemindah TKR',7],

            // ── RABU ──
            ['Rabu','07.00 – 09.20','X MPLB','Dasar-Dasar Manajemen Perkantoran dan Layanan Bisnis',28],
            ['Rabu','07.00 – 08.45','X DKV','Matematika',34],
            ['Rabu','07.00 – 08.45','X PPLG','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Rabu','07.00 – 07.35','X TO','Bahasa Inggris',29],
            ['Rabu','07.00 – 08.45','XI MPLB','Produk Kreatif dan Kewirausahaan',5],
            ['Rabu','07.00 – 08.10','XI DKV','Teknik Animasi 2D dan 3D',11],
            ['Rabu','07.00 – 07.35','XI PPLG','Kajian Kitab Kuning',12],
            ['Rabu','07.00 – 08.45','XI TO','Bahasa Indonesia',22],
            ['Rabu','07.00 – 07.35','XII MPLB','Bahasa Arab',26],
            ['Rabu','07.00 – 09.20','XII DKV','Teknologi Pengolahan Audio dan Video',9],
            ['Rabu','07.00 – 09.20','XII PPLG','Pemrograman Web',32],
            ['Rabu','07.00 – 09.20','XII TO','Pemeliharaan Mesin Kendaraan Ringan',16],
            ['Rabu','07.35 – 08.10','X TO','Bahasa Inggris',29],
            ['Rabu','07.35 – 08.10','XI DKV','Teknik Animasi 2D dan 3D',11],
            ['Rabu','07.35 – 08.10','XI PPLG','Kajian Kitab Kuning',12],
            ['Rabu','07.35 – 08.10','XII MPLB','Bahasa Arab',26],
            ['Rabu','08.10 – 08.45','X DKV','Matematika',34],
            ['Rabu','08.10 – 09.20','X TO','Kajian Kitab Kuning',12],
            ['Rabu','08.10 – 09.20','XI DKV','Bahasa Inggris',29],
            ['Rabu','08.10 – 09.20','XI PPLG','Pendidikan Pancasila',25],
            ['Rabu','08.10 – 08.45','XI TO','Bahasa Indonesia',22],
            ['Rabu','08.10 – 09.20','XII MPLB','Produk Kreatif dan Kewirausahaan',26],
            ['Rabu','08.45 – 09.20','X DKV','Matematika',34],
            ['Rabu','08.45 – 09.20','X PPLG','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Rabu','08.45 – 09.20','XI MPLB','Otomatisasi Tata Kelola Kepegawaian',8],
            ['Rabu','08.45 – 09.20','XI TO','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Rabu','09.40 – 10.50','X MPLB','Dasar-Dasar Manajemen Perkantoran dan Layanan Bisnis',28],
            ['Rabu','09.40 – 10.15','X DKV','Pendidikan Jasmani, Olahraga dan Kesehatan',24],
            ['Rabu','09.40 – 10.50','X PPLG','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Rabu','09.40 – 10.50','X TO','Bahasa Indonesia',22],
            ['Rabu','09.40 – 10.50','XI MPLB','Otomatisasi Tata Kelola Kepegawaian',8],
            ['Rabu','09.40 – 10.15','XI DKV','Pendidikan Pancasila dan Kewarganegaraan',25],
            ['Rabu','09.40 – 10.50','XI PPLG','Bahasa Arab',26],
            ['Rabu','09.40 – 10.50','XI TO','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Rabu','09.40 – 10.50','XII MPLB','Bahasa Inggris',19],
            ['Rabu','09.40 – 10.50','XII DKV','Teknologi Pengolahan Audio dan Video',9],
            ['Rabu','09.40 – 10.50','XII PPLG','Pendidikan Pancasila',4],
            ['Rabu','09.40 – 10.50','XII TO','Pemeliharaan Kelistrikan Kendaraan Ringan',7],
            ['Rabu','10.15 – 10.50','X DKV','Pendidikan Jasmani, Olahraga dan Kesehatan',24],
            ['Rabu','10.15 – 10.50','XI DKV','Pendidikan Pancasila dan Kewarganegaraan',25],
            ['Rabu','10.50 – 12.00','X MPLB','Bahasa Inggris',29],
            ['Rabu','10.50 – 12.00','X DKV','Pendidikan Jasmani, Olahraga dan Kesehatan',24],
            ['Rabu','10.50 – 12.00','X PPLG','Kajian Kitab Kuning',12],
            ['Rabu','10.50 – 12.00','X TO','Pendidikan Pancasila',25],
            ['Rabu','10.50 – 12.00','XI MPLB','Bahasa Indonesia',22],
            ['Rabu','10.50 – 12.00','XI DKV','Desain Grafis Percetakan',31],
            ['Rabu','10.50 – 12.00','XI PPLG','Pemrograman Web',4],
            ['Rabu','10.50 – 12.00','XI TO','Sejarah',3],
            ['Rabu','10.50 – 12.00','XII MPLB','Matematika',34],
            ['Rabu','10.50 – 12.00','XII DKV','Bahasa Arab',26],
            ['Rabu','10.50 – 12.00','XII PPLG','Basis Data',2],
            ['Rabu','10.50 – 12.00','XII TO','Bahasa Inggris',19],
            ['Rabu','12.30 – 13.30','X MPLB','Pendidikan Pancasila',25],
            ['Rabu','12.30 – 13.30','X DKV','Pendidikan Agama Islam dan Budi Pekerti',17],
            ['Rabu','12.30 – 13.30','X PPLG','Pendidikan Jasmani, Olahraga dan Kesehatan',24],
            ['Rabu','12.30 – 13.30','X TO','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Rabu','12.30 – 13.30','XI MPLB','Bahasa Indonesia',22],
            ['Rabu','12.30 – 13.30','XI DKV','Desain Grafis Percetakan',31],
            ['Rabu','12.30 – 13.30','XI PPLG','Sejarah',3],
            ['Rabu','12.30 – 13.30','XI TO','Bahasa Arab',26],
            ['Rabu','12.30 – 13.30','XII MPLB','Otomatisasi Tata Kelola Keuangan',28],
            ['Rabu','12.30 – 13.30','XII DKV','Pendidikan Pancasila dan Kewarganegaraan',4],
            ['Rabu','12.30 – 13.30','XII PPLG','Basis Data',2],
            ['Rabu','12.30 – 13.30','XII TO','Bahasa Inggris',19],

            // ── KAMIS ──
            ['Kamis','07.00 – 09.20','X MPLB','Matematika',34],
            ['Kamis','07.00 – 09.20','X DKV','Dasar-Dasar Desain Komunikasi Visual',10],
            ['Kamis','07.00 – 07.35','X PPLG','Bahasa Inggris',29],
            ['Kamis','07.00 – 08.45','X TO','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Kamis','07.00 – 07.35','XI MPLB','Pendidikan Jasmani, Olahraga dan Kesehatan',1],
            ['Kamis','07.00 – 08.45','XI DKV','Matematika',18],
            ['Kamis','07.00 – 08.45','XI PPLG','Pemrograman Web',4],
            ['Kamis','07.00 – 08.45','XI TO','Prosedur Penggunaan Kendaraan Ringan',14],
            ['Kamis','07.00 – 08.45','XII MPLB','Otomatisasi Tata Kelola Sarana dan Prasarana',30],
            ['Kamis','07.00 – 08.45','XII DKV','Produk Kreatif dan Kewirausahaan',6],
            ['Kamis','07.00 – 08.45','XII PPLG','Pemrograman Aplikasi Mobile',35],
            ['Kamis','07.00 – 08.45','XII TO','Pendidikan Agama Islam dan Budi Pekerti',23],
            ['Kamis','07.35 – 08.10','XI MPLB','Pendidikan Jasmani, Olahraga dan Kesehatan',1],
            ['Kamis','07.35 – 08.10','X PPLG','Bahasa Inggris',29],
            ['Kamis','08.10 – 09.20','X PPLG','Sejarah',4],
            ['Kamis','08.10 – 08.45','X TO','Bahasa Inggris',29],
            ['Kamis','08.10 – 08.45','X DKV','Seni Budaya',17],
            ['Kamis','08.10 – 09.20','XI MPLB','Otomatisasi Tata Kelola Humas dan Keprotokolan',20],
            ['Kamis','08.45 – 09.20','X DKV','Seni Budaya',17],
            ['Kamis','08.45 – 09.20','X TO','Bahasa Inggris',29],
            ['Kamis','08.45 – 09.20','XI DKV','Teknik Animasi 2D dan 3D',11],
            ['Kamis','08.45 – 09.20','XI TO','Konversi Energi Kendaraan Ringan',14],
            ['Kamis','09.40 – 10.50','X MPLB','Seni Budaya',17],
            ['Kamis','09.40 – 10.50','X DKV','Dasar-Dasar Desain Komunikasi Visual',10],
            ['Kamis','09.40 – 10.50','X PPLG','Dasar-Dasar Pengembangan Perangkat Lunak dan Gim',32],
            ['Kamis','09.40 – 10.50','X TO','Matematika',34],
            ['Kamis','09.40 – 10.50','XI MPLB','Bahasa Inggris',29],
            ['Kamis','09.40 – 10.15','XI DKV','Pendidikan Jasmani, Olahraga dan Kesehatan',1],
            ['Kamis','09.40 – 10.50','XI PPLG','Pemrograman Web',4],
            ['Kamis','09.40 – 10.50','XI TO','Konversi Energi Kendaraan Ringan',14],
            ['Kamis','09.40 – 10.50','XII MPLB','Otomatisasi Tata Kelola Humas dan Keprotokolan',15],
            ['Kamis','09.40 – 10.50','XII DKV','Produk Kreatif dan Kewirausahaan',6],
            ['Kamis','09.40 – 10.50','XII PPLG','Bahasa Sunda',30],
            ['Kamis','09.40 – 10.50','XII TO','Bahasa Arab',26],
            ['Kamis','10.15 – 10.50','XI DKV','Pendidikan Jasmani, Olahraga dan Kesehatan',1],
            ['Kamis','10.15 – 10.50','XI PPLG','Matematika',18],
            ['Kamis','10.15 – 10.50','XII DKV','Pendidikan Agama Islam dan Budi Pekerti',23],
            ['Kamis','10.15 – 10.50','XII TO','Projek Kreatif dan Kewirausahaan',6],
            ['Kamis','10.50 – 12.00','X MPLB','Sejarah',4],
            ['Kamis','10.50 – 12.00','X DKV','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Kamis','10.50 – 12.00','X PPLG','Dasar-Dasar Pengembangan Perangkat Lunak dan Gim',32],
            ['Kamis','10.50 – 12.00','X TO','Matematika',34],
            ['Kamis','10.50 – 12.00','XI MPLB','Otomatisasi Tata Kelola Humas dan Keprotokolan',20],
            ['Kamis','10.50 – 12.00','XI DKV','Bahasa Inggris',29],
            ['Kamis','10.50 – 12.00','XI PPLG','Matematika',18],
            ['Kamis','10.50 – 12.00','XI TO','Pendidikan Jasmani, Olahraga dan Kesehatan',1],
            ['Kamis','10.50 – 12.00','XII MPLB','Otomatisasi Tata Kelola Humas dan Keprotokolan',15],
            ['Kamis','10.50 – 12.00','XII DKV','Pendidikan Agama Islam dan Budi Pekerti',23],
            ['Kamis','10.50 – 12.00','XII PPLG','Pemrograman Aplikasi Mobile',35],
            ['Kamis','10.50 – 12.00','XII TO','Projek Kreatif dan Kewirausahaan',6],
            ['Kamis','12.30 – 13.30','X MPLB','Bahasa Inggris',29],
            ['Kamis','12.30 – 13.30','X DKV','Sejarah',4],
            ['Kamis','12.30 – 13.30','X PPLG','Dasar-Dasar Pengembangan Perangkat Lunak dan Gim',32],
            ['Kamis','12.30 – 13.30','X TO','Dasar-Dasar Teknik Otomotif',15],
            ['Kamis','12.30 – 13.30','XI MPLB','Otomatisasi Tata Kelola Humas dan Keprotokolan',20],
            ['Kamis','12.30 – 13.30','XI DKV','Desain Grafis Percetakan',31],
            ['Kamis','12.30 – 13.30','XI PPLG','Pendidikan Jasmani, Olahraga dan Kesehatan',1],
            ['Kamis','12.30 – 13.30','XI TO','Sistem Engine Kendaraan Ringan',19],
            ['Kamis','12.30 – 13.30','XII MPLB','Bahasa Sunda',30],
            ['Kamis','12.30 – 13.30','XII DKV','Desain Media Interaktif',35],
            ['Kamis','12.30 – 13.30','XII PPLG','Bahasa Arab',26],
            ['Kamis','12.30 – 13.30','XII TO','Projek Kreatif dan Kewirausahaan',6],

            // ── JUMAT ──
            ['Jumat','07.00 – 07.30','X MPLB','Kajian Kitab Kuning',12],
            ['Jumat','07.00 – 07.30','X DKV','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Jumat','07.00 – 08.00','X PPLG','Bahasa Indonesia',22],
            ['Jumat','07.00 – 07.30','X TO','Seni Budaya',17],
            ['Jumat','07.00 – 08.30','XI MPLB','Otomatisasi Tata Kelola Keuangan',28],
            ['Jumat','07.00 – 07.30','XI DKV','Produk Kreatif dan Kewirausahaan',26],
            ['Jumat','07.00 – 08.30','XI PPLG','Pemrograman Web',4],
            ['Jumat','07.00 – 07.30','XI TO','Projek Kreatif dan Kewirausahaan',5],
            ['Jumat','07.00 – 08.30','XII MPLB','Otomatisasi Tata Kelola Kepegawaian',31],
            ['Jumat','07.00 – 08.00','XII DKV','Bahasa Inggris',19],
            ['Jumat','07.00 – 08.30','XII PPLG','Pendidikan Agama Islam dan Budi Pekerti',23],
            ['Jumat','07.00 – 07.30','XII TO','Matematika',34],
            ['Jumat','07.30 – 08.00','X MPLB','Kajian Kitab Kuning',12],
            ['Jumat','07.30 – 08.00','X DKV','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Jumat','07.30 – 08.00','X TO','Seni Budaya',17],
            ['Jumat','07.30 – 08.00','XI DKV','Produk Kreatif dan Kewirausahaan',26],
            ['Jumat','07.30 – 08.00','XI TO','Projek Kreatif dan Kewirausahaan',5],
            ['Jumat','07.30 – 08.00','XII DKV','Bahasa Inggris',19],
            ['Jumat','07.30 – 08.00','XII TO','Matematika',34],
            ['Jumat','08.00 – 08.30','X MPLB','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Jumat','08.00 – 09.00','X DKV','Dasar-Dasar Desain Komunikasi Visual',10],
            ['Jumat','08.00 – 08.30','X PPLG','Seni Budaya',17],
            ['Jumat','08.00 – 09.00','X TO','Bahasa Indonesia',22],
            ['Jumat','08.00 – 08.30','XI MPLB','Otomatisasi Tata Kelola Keuangan',28],
            ['Jumat','08.00 – 08.30','XI DKV','Produk Kreatif dan Kewirausahaan',26],
            ['Jumat','08.00 – 08.30','XI PPLG','Pemrograman Web',4],
            ['Jumat','08.00 – 08.30','XI TO','Sistem Engine Kendaraan Ringan',19],
            ['Jumat','08.00 – 08.30','XII MPLB','Otomatisasi Tata Kelola Kepegawaian',31],
            ['Jumat','08.00 – 08.30','XII DKV','Matematika',34],
            ['Jumat','08.00 – 08.30','XII PPLG','Pendidikan Agama Islam dan Budi Pekerti',23],
            ['Jumat','08.00 – 08.30','XII TO','Pemeliharaan Sasis & Pemindah TKR',7],
            ['Jumat','08.30 – 09.00','X MPLB','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Jumat','08.30 – 09.00','X PPLG','Seni Budaya',17],
            ['Jumat','08.30 – 09.00','XI MPLB','Otomatisasi Tata Kelola Keuangan',28],
            ['Jumat','08.30 – 09.00','XI DKV','Teknik Animasi 2D dan 3D',11],
            ['Jumat','08.30 – 09.00','XI PPLG','Projek Kreatif dan Kewirausahaan',5],
            ['Jumat','08.30 – 09.00','XI TO','Sistem Engine Kendaraan Ringan',19],
            ['Jumat','08.30 – 09.00','XII MPLB','Otomatisasi Tata Kelola Kepegawaian',31],
            ['Jumat','08.30 – 09.00','XII DKV','Matematika',34],
            ['Jumat','08.30 – 09.00','XII PPLG','Projek Kreatif dan Kewirausahaan',26],
            ['Jumat','08.30 – 09.00','XII TO','Pemeliharaan Sasis & Pemindah TKR',7],
            ['Jumat','09.15 – 10.15','X MPLB','Dasar-Dasar Manajemen Perkantoran dan Layanan Bisnis',28],
            ['Jumat','09.15 – 10.15','X DKV','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Jumat','09.15 – 10.15','X PPLG','Bahasa Indonesia',22],
            ['Jumat','09.15 – 09.45','X TO','Sejarah',4],
            ['Jumat','09.15 – 09.45','XI MPLB','Kajian Kitab Kuning',12],
            ['Jumat','09.15 – 10.15','XI DKV','Teknik Animasi 2D dan 3D',11],
            ['Jumat','09.15 – 10.15','XI PPLG','Projek Kreatif dan Kewirausahaan',5],
            ['Jumat','09.15 – 10.15','XI TO','Bahasa Inggris',13],
            ['Jumat','09.15 – 10.15','XII MPLB','Otomatisasi Tata Kelola Kepegawaian',31],
            ['Jumat','09.15 – 10.15','XII DKV','Matematika',34],
            ['Jumat','09.15 – 10.15','XII PPLG','Projek Kreatif dan Kewirausahaan',26],
            ['Jumat','09.15 – 10.15','XII TO','Pemeliharaan Sasis & Pemindah TKR',7],
            ['Jumat','09.45 – 10.15','X TO','Sejarah',4],
            ['Jumat','09.45 – 10.15','XI MPLB','Kajian Kitab Kuning',12],
            ['Jumat','10.15 – 11.15','X MPLB','Bahasa Indonesia',22],
            ['Jumat','10.15 – 11.15','X DKV','Dasar-Dasar Desain Komunikasi Visual',10],
            ['Jumat','10.15 – 11.15','X PPLG','Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)',33],
            ['Jumat','10.15 – 10.45','X TO','Dasar-Dasar Teknik Otomotif',15],
            ['Jumat','10.15 – 10.45','XI MPLB','Produk Kreatif dan Kewirausahaan',5],
            ['Jumat','10.15 – 11.15','XI DKV','Desain Grafis Percetakan',31],
            ['Jumat','10.15 – 11.15','XI PPLG','Bahasa Inggris',13],
            ['Jumat','10.15 – 10.45','XI TO','Kajian Kitab Kuning',12],
            ['Jumat','10.15 – 11.15','XII MPLB','Matematika',34],
            ['Jumat','10.15 – 11.15','XII DKV','Desain Media Interaktif',35],
            ['Jumat','10.15 – 11.15','XII PPLG','Projek Kreatif dan Kewirausahaan',26],
            ['Jumat','10.15 – 11.15','XII TO','Pendidikan Pancasila',4],
            ['Jumat','10.45 – 11.15','X TO','Dasar-Dasar Teknik Otomotif',15],
            ['Jumat','10.45 – 11.15','XI MPLB','Produk Kreatif dan Kewirausahaan',5],
            ['Jumat','10.45 – 11.15','XI TO','Kajian Kitab Kuning',12],
        ];

        $inserted  = 0;
        $skipped   = 0;
        $seen      = []; // untuk deduplikasi

        foreach ($rawJadwal as $row) {
            [$hari, $waktuRange, $kelas, $mapel, $kodeGuru] = $row;

            // Dapatkan NIP guru
            if (!isset($nipCache[$kodeGuru])) {
                $namaGuru = $kodeGuruMap[$kodeGuru] ?? 'Guru ' . $kodeGuru;

                // Coba cari di DB dulu (cocokkan nama)
                $nip = DB::table('pegawai')
                    ->whereRaw('LOWER(REPLACE(REPLACE(nama_lengkap, ".", ""), "  ", " ")) LIKE ?',
                        ['%' . strtolower(explode(' ', $namaGuru)[0]) . '%'])
                    ->value('nip');

                // Kalau tidak ketemu, tambahkan sebagai guru baru
                if (!$nip) {
                    $nip = $this->tambahGuruBaru($kodeGuru, $namaGuru);
                }

                $nipCache[$kodeGuru] = $nip;
            }

            $nip = $nipCache[$kodeGuru];

            // Parse waktu
            [$jamMulai, $jamSelesai] = $this->parseWaktu($waktuRange);

            // Deduplikasi: satu record per (nip + hari + jam_mulai + kelas + mapel)
            $key = "{$nip}|{$hari}|{$jamMulai}|{$kelas}|{$mapel}";
            if (isset($seen[$key])) {
                $skipped++;
                continue;
            }
            $seen[$key] = true;

            DB::table('jadwal_mengajars')->insert([
                'nip'           => $nip,
                'hari'          => $hari,
                'jam_mulai'     => $jamMulai,
                'jam_selesai'   => $jamSelesai,
                'mata_pelajaran'=> $mapel,
                'kelas'         => $kelas,
                'is_active'     => true,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            $inserted++;
        }

        $this->command->info("✓ {$inserted} jadwal mengajar berhasil di-seed. ({$skipped} duplikat dilewati)");
    }
}

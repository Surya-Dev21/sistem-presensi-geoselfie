<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PegawaiSeeder extends Seeder
{
    public function run(): void
    {
        // Data nama guru SMK Pembangunan Bandung Barat
        // NIP dummy: format 10 digit urut (199001010001 - 199001010033)
        // No. HP, email kosong/dummy — bisa diupdate nanti via panel admin
        $guru = [
            ['nip' => '199001010001', 'nama' => 'Mokhamad Husen S.Pd.I',   'jk' => 'L'],
            ['nip' => '199001010002', 'nama' => 'Tantan Rustandi S.Pd',     'jk' => 'L'],
            ['nip' => '199001010003', 'nama' => 'H.Ahmad Saepul B. S.Pd',  'jk' => 'L'],
            ['nip' => '199001010004', 'nama' => 'Siti Nurazizah S.Pd',      'jk' => 'P'],
            ['nip' => '199001010005', 'nama' => 'Ahmad Royani S.Pd',        'jk' => 'L'],
            ['nip' => '199001010006', 'nama' => 'Deden Somantri S.Pd',      'jk' => 'L'],
            ['nip' => '199001010007', 'nama' => 'Endi Suhendi S.Kom',       'jk' => 'L'],
            ['nip' => '199001010008', 'nama' => 'Siti Raniah S.E',          'jk' => 'P'],
            ['nip' => '199001010009', 'nama' => 'Yudi Somantri S.T',        'jk' => 'L'],
            ['nip' => '199001010010', 'nama' => 'Ujang Suhara S.Pd',        'jk' => 'L'],
            ['nip' => '199001010011', 'nama' => 'H.Nunu S.Pd',              'jk' => 'L'],
            ['nip' => '199001010012', 'nama' => 'Siti Rubaiyah S.Pd',       'jk' => 'P'],
            ['nip' => '199001010013', 'nama' => 'Ida Farida S.Pd',          'jk' => 'P'],
            ['nip' => '199001010014', 'nama' => 'Siti Nurela S.Pd',         'jk' => 'P'],
            ['nip' => '199001010015', 'nama' => 'Saepudin S.Pd',            'jk' => 'L'],
            ['nip' => '199001010016', 'nama' => 'Kamil Faisal S.Pd.I',      'jk' => 'L'],
            ['nip' => '199001010017', 'nama' => 'Ahmad Gozali S.Pd',        'jk' => 'L'],
            ['nip' => '199001010018', 'nama' => 'Ai Lina S.Pd',             'jk' => 'P'],
            ['nip' => '199001010019', 'nama' => 'Adnan S.H',                'jk' => 'L'],
            ['nip' => '199001010020', 'nama' => 'Agis Saputra B.B.A',       'jk' => 'L'],
            ['nip' => '199001010021', 'nama' => 'H.Yayat S.Pd',             'jk' => 'L'],
            ['nip' => '199001010022', 'nama' => 'Yeyen Nuraeni S.Pd',       'jk' => 'P'],
            ['nip' => '199001010023', 'nama' => 'Harun S.Pd',               'jk' => 'L'],
            ['nip' => '199001010024', 'nama' => 'Hermansyah S.Pd',          'jk' => 'L'],
            ['nip' => '199001010025', 'nama' => 'Misbah S.Pd',              'jk' => 'L'],
            ['nip' => '199001010026', 'nama' => 'M.Yuga S.Pd, M.Sos',       'jk' => 'L'],
            ['nip' => '199001010027', 'nama' => 'Novi Rahmawati S.Pd',      'jk' => 'P'],
            ['nip' => '199001010028', 'nama' => 'Septian Nurfajar S.Pd',    'jk' => 'L'],
            ['nip' => '199001010029', 'nama' => 'Sri Pelitawati S.Pd',      'jk' => 'P'],
            ['nip' => '199001010030', 'nama' => 'Suhendro Joyo S.Pd',       'jk' => 'L'],
            ['nip' => '199001010031', 'nama' => 'Wafa Nisa Aundry S.Pd',    'jk' => 'P'],
            ['nip' => '199001010032', 'nama' => 'H.Zaenal Muttaqin',        'jk' => 'L'],
            ['nip' => '199001010033', 'nama' => 'Ai Fitriana',              'jk' => 'P'],
        ];

        $defaultPassword = Hash::make('smkpbb2024');

        foreach ($guru as $g) {
            DB::table('pegawai')->updateOrInsert(
                ['nip' => $g['nip']],
                [
                    'nama_lengkap'  => $g['nama'],
                    'jabatan'       => 'Guru',
                    'jenis_kelamin' => $g['jk'],
                    'no_hp'         => '-',       // kosong, diisi nanti
                    'email'         => null,       // nullable, diisi nanti
                    'password'      => $defaultPassword,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]
            );
        }

        $this->command->info('✓ 33 data guru berhasil di-seed.');
    }
}

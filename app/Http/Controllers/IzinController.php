<?php

namespace App\Http\Controllers;

use App\Models\Izin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class IzinController extends Controller
{
    // Halaman Form Pengajuan Izin
    public function create()
    {
        $pegawai = Auth::guard('pegawai')->user();

        $riwayatIzin = Izin::where('nip', $pegawai->nip)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($i) => [
                'id'            => $i->id,
                'jenis_izin'    => ucfirst($i->status),  // Izin / Sakit
                'tgl_mulai'     => $i->tgl_mulai?->format('Y-m-d'),
                'tgl_selesai'   => $i->tgl_selesai?->format('Y-m-d'),
                'alasan'        => $i->keterangan,
                'catatan_admin' => $i->catatan_admin,
                'bukti_url'     => $i->bukti_file ? Storage::disk('public')->url($i->bukti_file) : null,
                'diajukan'      => $i->created_at?->diffForHumans(),
                'status'        => match ($i->status_approval) {
                    'approved' => 'Disetujui',
                    'rejected' => 'Ditolak',
                    default    => 'Menunggu',
                },
            ]);

        return Inertia::render('Pegawai/Izin', [
            'riwayatIzin' => $riwayatIzin,
        ]);
    }

    // Proses Simpan Izin
    public function store(Request $request)
    {
        $pegawai = Auth::guard('pegawai')->user();
        $today = now('Asia/Jakarta')->toDateString();

        $validated = $request->validate([
            'jenis_izin'  => ['required', Rule::in(['Izin', 'Sakit'])],
            'tgl_mulai'   => ['required', 'date', 'after_or_equal:' . $today],
            'tgl_selesai' => ['required', 'date', 'after_or_equal:tgl_mulai'],
            'alasan'      => ['required', 'string', 'min:5', 'max:500'],
            'dokumen'     => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ], [
            'jenis_izin.required'        => 'Jenis permohonan wajib dipilih.',
            'tgl_mulai.after_or_equal'   => 'Tanggal mulai tidak boleh di masa lalu.',
            'tgl_selesai.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
            'alasan.required'            => 'Keterangan/alasan wajib diisi.',
            'alasan.min'                 => 'Alasan minimal 5 karakter.',
            'dokumen.mimes'              => 'Bukti harus berupa JPG, PNG, atau PDF.',
            'dokumen.max'                => 'Ukuran bukti maksimal 2 MB.',
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

    // Batalkan pengajuan yang masih menunggu validasi (milik sendiri)
    public function destroy(Izin $izin)
    {
        $pegawai = Auth::guard('pegawai')->user();

        if ($izin->nip !== $pegawai->nip) {
            abort(403, 'Pengajuan ini bukan milik Anda.');
        }

        if ($izin->status_approval !== 'pending') {
            return back()->with('error', 'Pengajuan yang sudah diproses tidak dapat dibatalkan.');
        }

        if ($izin->bukti_file) {
            Storage::disk('public')->delete($izin->bukti_file);
        }

        $izin->delete();

        return back()->with('success', 'Pengajuan izin berhasil dibatalkan.');
    }

    // Tandai semua notifikasi keputusan izin sudah dibaca
    public function tandaiDibaca()
    {
        $pegawai = Auth::guard('pegawai')->user();

        Izin::where('nip', $pegawai->nip)
            ->whereIn('status_approval', ['approved', 'rejected'])
            ->whereNull('dibaca_at')
            ->update(['dibaca_at' => now('Asia/Jakarta')]);

        return back();
    }
}

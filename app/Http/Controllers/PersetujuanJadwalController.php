<?php

namespace App\Http\Controllers;

use App\Models\JadwalProduksi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PersetujuanJadwalController extends Controller
{
    public function index()
    {
        // Tarik data jadwal yang membutuhkan tindakan atau sudah diproses oleh owner
        $jadwal = JadwalProduksi::with(['detailProduksi.produk', 'detailProduksi.bom'])
            ->where('status_jadwal', '!=', 'Draft') // Sembunyikan draf milik operator
            ->orderByRaw("FIELD(status_jadwal, 'Pending Approval', 'Revision Required', 'Approved')")
            ->get();

        return Inertia::render('Produksi/PersetujuanJadwalProduksi', [
            'jadwals' => $jadwal
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status_jadwal' => 'required|in:Approved,Revision Required',
            'komentar_owner' => 'nullable|string'
        ]);

        $jadwal = JadwalProduksi::findOrFail($id);
        
        $jadwal->update([
            'status_jadwal' => $request->status_jadwal,
            'komentar_owner' => $request->komentar_owner
        ]);

        return redirect('/persetujuan-jadwal');
    }
}
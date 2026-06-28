<?php

namespace App\Http\Controllers;

use App\Models\JadwalProduksi;
use App\Models\Produk;
use App\Models\Bom;
use App\Models\DetailJadwalProduksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JadwalProduksiController extends Controller
{
    // ─── INDEX ────────────────────────────────────────────────────────────────
    public function index()
    {
        $jadwal = JadwalProduksi::with([
            'detailProduksi.produk',
            'detailProduksi.bom',
            'detailProduksi.kebutuhanBahan.detailBom.bahan', // ← load data generate yg sudah tersimpan
        ])
            ->orderBy('tanggal_dibuat', 'desc')
            ->get();

        $produk = Produk::select('id_produk', 'kode_produk', 'nama_produk')->get();
        $bahan  = \App\Models\Bahan::all();

        $bom = Bom::with('detailBoms')->get()->map(function ($bom) {
            return [
                'id_bom'       => $bom->id_bom,
                'kode_bom'     => $bom->kode_bom,
                'nama_resep'   => $bom->nama_resep,
                'qty_batch'    => $bom->qty_batch,
                'satuan_batch' => $bom->satuan_batch,
                'details'      => $bom->detailBoms->map(function ($detail) {
                    return [
                        'id_detail_bom' => $detail->id_detail_bom,
                        'kodeMaterial'  => $detail->id_bahan,
                        'jumlahBahan'   => $detail->jumlah_bahan,
                        'namaMaterial'  => $detail->bahan->nama_bahan ?? 'Unknown',
                        'satuan'        => $detail->bahan->satuan_bahan ?? '-',
                    ];
                }),
            ];
        });

        $currentYear = date('Y');

        // Auto-generate kode jadwal berikutnya
        $lastJadwal        = JadwalProduksi::where('kode_jadwal', 'like', "JDW-$currentYear-%")
                                ->orderBy('kode_jadwal', 'desc')->first();
        $nextJadwalNumber  = $lastJadwal ? intval(substr($lastJadwal->kode_jadwal, -4)) + 1 : 1;
        $nextKodeJadwal    = "JDW-$currentYear-" . str_pad($nextJadwalNumber, 4, '0', STR_PAD_LEFT);

        // Auto-generate nomor produksi berikutnya
        $lastDetail          = DetailJadwalProduksi::where('kode_produksi', 'like', "PRD-$currentYear-%")
                                ->orderBy('kode_produksi', 'desc')->first();
        $nextProduksiNumber  = $lastDetail ? intval(substr($lastDetail->kode_produksi, -3)) + 1 : 1;

        return Inertia::render('Produksi/JadwalProduksi', [
            'jadwals'            => $jadwal,
            'masterProduk'       => $produk,
            'masterBom'          => $bom,
            'masterBahan'        => $bahan,
            'nextKodeJadwal'     => $nextKodeJadwal,
            'nextProduksiNumber' => $nextProduksiNumber,
            'currentYear'        => $currentYear,
        ]);
    }

    // ─── STORE (CREATE BARU) ──────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'kode_jadwal'                        => 'required|string|unique:jadwal_produksi,kode_jadwal',
            'periode'                            => 'required|string',
            'tanggal_dibuat'                     => 'required|date',
            'status_jadwal'                      => 'required|in:Draft,Pending Approval,Revision Required,Approved',
            'detail_produksi'                    => 'nullable|array',
            'detail_produksi.*.kode_produksi'    => 'required|string',
            'detail_produksi.*.tanggal_produksi' => 'required|date',
            'detail_produksi.*.id_produk'        => 'required|integer',
            'detail_produksi.*.id_bom'           => 'required|integer',
            'detail_produksi.*.qty_rencana'      => 'required|numeric|min:1',
            'detail_produksi.*.catatan'          => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $jadwal = JadwalProduksi::create([
                'kode_jadwal'      => $request->kode_jadwal,
                'periode'          => $request->periode,
                'tanggal_dibuat'   => $request->tanggal_dibuat,
                'jumlah_produksi'  => count($request->detail_produksi ?? []),
                'status_jadwal'    => $request->status_jadwal,
                'komentar_owner'   => null,
            ]);

            foreach ($request->detail_produksi ?? [] as $detail) {
                $jadwal->detailProduksi()->create([
                    'kode_produksi'    => $detail['kode_produksi'],
                    'tanggal_produksi' => $detail['tanggal_produksi'],
                    'id_produk'        => $detail['id_produk'],
                    'id_bom'           => $detail['id_bom'],
                    'qty_rencana'      => $detail['qty_rencana'],
                    'catatan'          => $detail['catatan'] ?? null,
                ]);
            }

            DB::commit();
            return redirect('/jadwal-produksi');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan data: ' . $e->getMessage()]);
        }
    }

    // ─── UPDATE (EDIT / MINTA PERSETUJUAN / SIMPAN DRAFT) ─────────────────────
    public function update(Request $request, $id)
    {
        $request->validate([
            'kode_jadwal'                        => 'required|string',
            'periode'                            => 'required|string',
            'tanggal_dibuat'                     => 'required|date',
            'status_jadwal'                      => 'required|in:Draft,Pending Approval,Revision Required,Approved',
            'detail_produksi'                    => 'nullable|array',
            'detail_produksi.*.kode_produksi'    => 'required|string',
            'detail_produksi.*.tanggal_produksi' => 'required|date',
            'detail_produksi.*.id_produk'        => 'required|integer',
            'detail_produksi.*.id_bom'           => 'required|integer',
            'detail_produksi.*.qty_rencana'      => 'required|numeric|min:1',
            'detail_produksi.*.catatan'          => 'nullable|string',
        ]);

        $jadwal = JadwalProduksi::findOrFail($id);

        DB::beginTransaction();
        try {
            // 1. Update header jadwal
            $jadwal->update([
                'periode'          => $request->periode,
                'tanggal_dibuat'   => $request->tanggal_dibuat,
                'status_jadwal'    => $request->status_jadwal,
                'jumlah_produksi'  => count($request->detail_produksi ?? []),
            ]);

            // 2. Hapus detail lama, insert baru (sync)
            $jadwal->detailProduksi()->delete();

            foreach ($request->detail_produksi ?? [] as $detail) {
                $jadwal->detailProduksi()->create([
                    'kode_produksi'    => $detail['kode_produksi'],
                    'tanggal_produksi' => $detail['tanggal_produksi'],
                    'id_produk'        => $detail['id_produk'],
                    'id_bom'           => $detail['id_bom'],
                    'qty_rencana'      => $detail['qty_rencana'],
                    'catatan'          => $detail['catatan'] ?? null,
                ]);
            }

            DB::commit();
            return redirect('/jadwal-produksi');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memperbarui data: ' . $e->getMessage()]);
        }
    }

    // ─── DESTROY (HAPUS) ──────────────────────────────────────────────────────
    public function destroy($id)
    {
        $jadwal = JadwalProduksi::findOrFail($id);

        // Hanya boleh hapus jika masih Draft
        if ($jadwal->status_jadwal !== 'Draft') {
            return back()->withErrors(['error' => 'Hanya jadwal berstatus Draft yang dapat dihapus.']);
        }

        DB::beginTransaction();
        try {
            $jadwal->detailProduksi()->delete();
            $jadwal->delete();

            DB::commit();
            return redirect('/jadwal-produksi');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menghapus data: ' . $e->getMessage()]);
        }
    }
}
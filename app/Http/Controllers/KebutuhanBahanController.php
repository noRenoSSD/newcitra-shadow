<?php

namespace App\Http\Controllers;

use App\Models\KebutuhanBahan;
use App\Models\DetailJadwalProduksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KebutuhanBahanController extends Controller
{
    /**
     * Simpan hasil generate kebutuhan bahan ke database.
     * Hanya boleh sekali per id_produksi (idempotent guard).
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_produksi'               => 'required|integer|exists:t_detail_jadwal_produksi,id_produksi',
            'tanggal_generate'          => 'required|date',
            'items'                     => 'required|array|min:1',
            'items.*.id_detail_bom'     => 'required|integer|exists:t_detail_bom,id_detail_bom',
            'items.*.qty_bahan_snapshot'=> 'required|numeric|min:0',
            'items.*.qty_kebutuhan'     => 'required|numeric|min:0',
        ]);

        // ── Guard: jika sudah ada data, redirect back() saja (bukan error)
        //    Tombol di frontend seharusnya sudah disabled setelah relasi model diperbaiki.
        //    Jika entah bagaimana masuk ke sini, cukup redirect balik — data sudah aman di DB.
        $sudahAda = KebutuhanBahan::where('id_produksi', $request->id_produksi)->exists();
        if ($sudahAda) {
            return back(); // silent redirect — data sudah ada, tidak perlu error
        }

        // ── Guard: jadwal harus berstatus Approved ────────────────────────────
        $detailProduksi = DetailJadwalProduksi::with('jadwalProduksi')
            ->find($request->id_produksi);

        if (!$detailProduksi || $detailProduksi->jadwalProduksi?->status_jadwal !== 'Approved') {
            return back()->withErrors([
                'error' => 'Generate kebutuhan hanya diperbolehkan untuk jadwal yang sudah Disetujui.'
            ]);
        }

        // ── Simpan semua item dalam satu transaksi ────────────────────────────
        DB::beginTransaction();
        try {
            foreach ($request->items as $item) {
                KebutuhanBahan::create([
                    'id_produksi'        => $request->id_produksi,
                    'id_detail_bom'      => $item['id_detail_bom'],
                    'qty_bahan_snapshot' => $item['qty_bahan_snapshot'],
                    'qty_kebutuhan'      => $item['qty_kebutuhan'],
                    'tanggal_generate'   => $request->tanggal_generate,
                ]);
            }

            DB::commit();
            return back();  // Inertia: refresh halaman yang sama (preserveScroll: true)

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Gagal menyimpan kebutuhan bahan: ' . $e->getMessage()
            ]);
        }
    }
}
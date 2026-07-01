<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PenerimaanBahan;
use App\Models\DetailPenerimaanBahan;
use App\Models\PurchaseOrder; // Sesuaikan dengan nama model PO kamu
use Illuminate\Support\Facades\DB;

class PenerimaanBahanController extends Controller
{
    public function index()
    {
        // 1. Ambil semua id_po yang sudah pernah melakukan penerimaan
        $poTerpakai = PenerimaanBahan::pluck('id_po')->toArray();

        // 2. Ambil data PO dengan status 'Disetujui' DAN belum pernah dipakai
        // Relasi yang dipanggil: details (untuk item PO), bahan, dan supplier
        $pesananPO = PurchaseOrder::with(['details.bahan', 'supplier'])
            ->where('status', 'Disetujui')
            ->whereNotIn('id_po', $poTerpakai)
            ->get();

        // 3. Ambil data riwayat penerimaan beserta relasinya (Purchase Order & Detail Penerimaan)
        $riwayatPenerimaan = PenerimaanBahan::with(['purchaseOrder.supplier','purchaseOrder.details', 'detailPenerimaan.bahan'])
            ->orderBy('tanggal_penerimaan', 'desc')
            ->get();

        // 4. Lempar ke frontend React yang ada di folder Pembelian
        return Inertia::render('Pembelian/PenerimaanBahan', [
            'pesananPO' => $pesananPO,
            'riwayatPenerimaan' => $riwayatPenerimaan
        ]);
    }

    public function store(Request $request)
    {
        // Validasi input form
        $request->validate([
            'id_po' => 'required',
            'no_penerimaan' => 'required|unique:t_penerimaan_bahan,no_penerimaan',
            'tanggal_penerimaan' => 'required|date',
            'items' => 'required|array',
            'items.*.id_bahan' => 'required',
            'items.*.qty_diterima' => 'required|numeric|min:0',
            'items.*.qty_retur' => 'required|numeric|min:0',
            'items.*.kondisi' => 'required|in:Baik,Retur',
        ]);

        // Gunakan Database Transaction agar aman
        DB::transaction(function () use ($request) {

            // 1. Simpan data induk ke t_penerimaan_bahan
            $penerimaan = PenerimaanBahan::create([
                'id_po' => $request->id_po,
                'no_penerimaan' => $request->no_penerimaan,
                'tanggal_penerimaan' => $request->tanggal_penerimaan,
                'catatan' => $request->catatan,
            ]);

            // 2. Loop & simpan tiap item ke t_detail_penerimaan_bahan
            foreach ($request->items as $item) {
                DetailPenerimaanBahan::create([
                    'id_penerimaan' => $penerimaan->id_penerimaan,
                    'id_bahan' => $item['id_bahan'],
                    'qty_diterima' => $item['qty_diterima'],
                    'qty_retur' => $item['qty_retur'],
                    'kondisi' => $item['kondisi'],
                    'catatan' => $item['catatan'] ?? null,
                ]);
            }

            // BARIS UPDATE STATUS PO SUDAH DIHAPUS SESUAI REKUES KAMU 👍
        });

        // Redirect kembali ke halaman dengan membawa status sukses
        return redirect()->back()->with('success', 'Data penerimaan bahan berhasil disimpan!');
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ReturPembelian;
use App\Models\DetailReturPembelian;
use App\Models\PenerimaanBahan;
use Illuminate\Support\Facades\DB;

class ReturPembelianController extends Controller
{
    public function index()
    {
        // 1. Ambil ID Penerimaan yang sudah pernah dibuatkan returnya (agar tidak dobel)
        $returTerpakai = ReturPembelian::pluck('id_penerimaan')->toArray();

        // 2. Ambil data Penerimaan yang memiliki qty_retur > 0 di detailnya
        $pesananPenerimaan = PenerimaanBahan::with([
                'purchaseOrder.supplier',
                'purchaseOrder.details', // Untuk mengambil harga PO
                'detailPenerimaan.bahan'
            ])
            ->whereHas('detailPenerimaan', function ($q) {
                $q->where('qty_retur', '>', 0); // Kunci utamanya di sini
            })
            ->whereNotIn('id_penerimaan', $returTerpakai)
            ->get();

        // 3. Ambil data riwayat retur yang sudah selesai
        $riwayatRetur = ReturPembelian::with([
                'penerimaan.purchaseOrder.supplier',
                'details.bahan'
            ])
            ->orderBy('tanggal_retur', 'desc')
            ->get();

        return Inertia::render('Pembelian/ReturPembelian', [
            'pesananPenerimaan' => $pesananPenerimaan,
            'riwayatRetur' => $riwayatRetur
        ]);
    }

    public function store(Request $request)
    {
        // Validasi data dari React
        $request->validate([
            'id_penerimaan' => 'required',
            'no_retur' => 'required|unique:t_retur_pembelian,no_retur',
            'tanggal_retur' => 'required|date',
            'items' => 'required|array',
        ]);

        DB::transaction(function () use ($request) {
            $totalNilai = 0;

            // 1. Simpan Header Retur
            $retur = ReturPembelian::create([
                'id_penerimaan' => $request->id_penerimaan,
                'no_retur' => $request->no_retur,
                'tanggal_retur' => $request->tanggal_retur,
                'total_nilai' => 0, // Set 0 dulu, nanti di-update
            ]);

            // 2. Simpan Detail Retur
            foreach ($request->items as $item) {
                // Pastikan hanya memproses barang yang benar-benar diretur
                if (isset($item['qtyRetur']) && $item['qtyRetur'] > 0) {
                    $subtotal = $item['qtyRetur'] * $item['harga'];
                    $totalNilai += $subtotal;

                    DetailReturPembelian::create([
                        'id_retur' => $retur->id_retur,
                        'id_bahan' => $item['idBahan'],
                        'qty_retur' => $item['qtyRetur'],
                        'harga_satuan' => $item['harga'],
                        'alasan' => $item['alasan'] ?? '-',
                    ]);
                }
            }

            // 3. Update total nilai dari perhitungan detail
            $retur->update(['total_nilai' => $totalNilai]);
        });

        return redirect()->back()->with('success', 'Nota Retur berhasil disimpan!');
    }
}

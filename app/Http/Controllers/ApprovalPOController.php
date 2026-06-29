<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApprovalPOController extends Controller
{
    /**
     * Menampilkan semua daftar Purchase Order untuk proses verifikasi Finance
     */
    public function index()
    {
        $purchaseOrders = PurchaseOrder::with(['details.bahan', 'permintaan', 'supplier'])
            ->orderBy('tgl_po', 'desc')
            ->get();

        return Inertia::render('Keuangan/ApprovalPO', [
            'purchaseOrders' => $purchaseOrders
        ]);
    }

    /**
     * Mengubah status Purchase Order menjadi Disetujui
     */
    public function setujui(int $id)
    {
        $po = PurchaseOrder::findOrFail($id);

        // Pastikan hanya PO berstatus 'diajukan' atau 'perlu_revisi' yang bisa di-approve
        if (!in_array($po->status, ['diajukan', 'perlu_revisi'])) {
            return redirect()->back()->with('error', 'Status PO saat ini tidak valid untuk disetujui.');
        }

        $po->update([
            'status' => 'disetujui'
        ]);

        return redirect()->back()->with('success', 'PO berhasil disetujui!');
    }

    /**
     * Mengembalikan Purchase Order ke Purchasing untuk dilakukan revisi
     */
    public function revisi(int $id, Request $request)
    {
        // Validasi alasan penolakan/revisi wajib diisi oleh Finance
        $request->validate([
            'catatan_finance' => 'required|string|max:255',
        ], [
            'catatan_finance.required' => 'Catatan alasan revisi wajib diisi.',
        ]);

        $po = PurchaseOrder::findOrFail($id);

        $po->with('status');

        $po->update([
            'status'          => 'perlu_revisi',
            'catatan_finance' => $request->catatan_finance
        ]);

        return redirect()->back()->with('success', 'PO dikembalikan untuk revisi!');
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PermintaanPembelian;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    /**
     * Menampilkan daftar Purchase Order dan form pembuatan PO
     */
    public function index()
    {
        // 1. Ambil semua data PO dengan relasi lengkap
        $purchaseOrders = PurchaseOrder::with(['details.bahan', 'permintaan', 'supplier'])
            ->orderBy('tgl_po', 'desc')
            ->get();

        // 2. Ambil PP yang belum memiliki PO dan statusnya masih 'diajukan'
        $permintaans = PermintaanPembelian::with(['details.bahan', 'detailJadwal.produk'])
            ->whereDoesntHave('purchaseOrder')
            ->where('status', 'diajukan')
            ->get();

        // 3. Ambil semua data supplier untuk pilihan dropdown
        $suppliers = Supplier::orderBy('nama_supplier')->get();

        // 4. Generate nomor PO berikutnya secara otomatis
        $nextNoPo = PurchaseOrder::generateNoPo();

        return Inertia::render('Pembelian/PesananPembelian', compact(
            'purchaseOrders',
            'permintaans',
            'suppliers',
            'nextNoPo'
        ));
    }

    /**
     * Menyimpan data Purchase Order baru (CREATE)
     * Qty dan Harga otomatis mengunci dari database (Aman dari manipulasi/edit)
     */
    public function store(Request $request)
    {
        // Validasi menggunakan metode_beli
        $request->validate([
            'id_pp' => 'required|exists:t_permintaan_pembelian,id_pp',
            'tgl_po' => 'required|date',
            'id_supplier' => 'required|exists:t_supplier,id',
            'metode_beli' => 'required|in:tunai,tempo_30', // SUDAH BENAR: menggunakan metode_beli
            'catatan' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            // 1. Ambil data Permintaan Pembelian (PR) beserta detail aslinya dari DB
            $pp = PermintaanPembelian::with('details.bahan')->findOrFail($request->id_pp);

            // 2. Buat header PO
            $po = PurchaseOrder::create([
                'id_pp' => $request->id_pp,
                'no_po' => PurchaseOrder::generateNoPo(),
                'tgl_po' => $request->tgl_po,
                'id_supplier' => $request->id_supplier,
                'metode_beli' => $request->metode_beli, // SUDAH BENAR: menggunakan metode_beli
                'status' => 'diajukan',
                'catatan' => $request->catatan,
            ]);

            // 3. Kunci Qty dari PR dan Harga dari Master Bahan (Tidak bisa diedit saat baru)
            foreach ($pp->details as $detail) {
                $po->details()->create([
                    'id_bahan' => $detail->id_bahan,
                    'id_detail_pp' => $detail->id_detail_pp,
                    'qty_po' => $detail->qty_diminta,
                    'harga_satuan' => $detail->bahan->harga_beli ?? 0,
                ]);
            }

            // 4. Update status dokumen PP menjadi 'disetujui'
            $pp->update(['status' => 'disetujui']);
        });

        return redirect()->back()->with('success', 'Purchase Order berhasil dibuat!');
    }

   /**
     * Memperbarui data Purchase Order (Revisi & Ajukan Ulang)
     */
    public function update(Request $request, $id)
    {
        // 1. Validasi input yang dikirim dari Frontend
        $request->validate([
            'tgl_po'        => 'required|date',
            'id_supplier'   => 'required',
            'metode_beli'   => 'required|string',
            'catatan'       => 'nullable|string',
            'items'         => 'required|array',
            'items.*.id_bahan' => 'required',
            'items.*.qty'   => 'required|numeric|min:1',
            'items.*.harga' => 'required|numeric|min:0',
        ]);

        // 2. Gunakan Database Transaction agar aman
        DB::transaction(function () use ($request, $id) {

            $po = PurchaseOrder::findOrFail($id);

            // 3. Update data Header PO
            $po->update([
                'tgl_po'      => $request->tgl_po,
                'id_supplier' => $request->id_supplier,
                'metode_beli' => $request->metode_beli,
                'catatan'     => $request->catatan,
                'status'      => 'diajukan', // Set status kembali ke diajukan
            ]);

            // 4. Looping untuk update Qty dan Harga Satuan per item bahan
            foreach ($request->items as $item) {
                // Tembak langsung ke relasi details milik PO tersebut
                $po->details()->where('id_bahan', $item['id_bahan'])->update([
                    'qty_po'       => (int) $item['qty'],
                    'harga_satuan' => (float) $item['harga'],
                    // JANGAN masukkan field 'subtotal' di sini karena dihitung otomatis oleh MySQL!
                ]);
            }
        });

        // 5. Kembalikan ke halaman index dengan notifikasi sukses
        return redirect()->back()->with('success', 'Revisi PO berhasil disimpan & diajukan ulang!');
    }
    /**
     * Menghapus data Purchase Order (Hanya jika belum disetujui Finance)
     */
    public function destroy(int $id)
    {
        $po = PurchaseOrder::findOrFail($id);

        // Validasi perlindungan agar PO yang sudah disetujui tidak bisa dihapus sembarangan
        if ($po->status === 'disetujui') {
            return redirect()->back()->with('error', 'PO yang sudah disetujui tidak bisa dihapus!');
        }

        DB::transaction(function () use ($po) {
            // Kembalikan status dokumen PP asal ke 'diajukan' agar bisa di-PO ulang nanti
            PermintaanPembelian::where('id_pp', $po->id_pp)->update(['status' => 'diajukan']);

            // Hapus data PO (Detail PO otomatis terhapus oleh aturan OnDelete Cascade database)
            $po->delete();
        });

        return redirect()->back()->with('success', 'Purchase Order berhasil dihapus!');
    }
}

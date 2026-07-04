<?php

namespace App\Http\Controllers;
use App\Services\InventoryService;
use App\Models\TransaksiPembelian;
use App\Models\DetailTransaksiPembelian;
use App\Models\DetailPenerimaanBahan;
use App\Models\PenerimaanBahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransaksiPembelianController extends Controller
{
    /**
     * Menampilkan daftar penerimaan yang siap ditagihkan
     * dan riwayat transaksi yang sudah dibuat.
     */
    public function index()
    {
        // SESUDAHNYA (Tambahkan purchaseOrder.details)
$penerimaanPending = PenerimaanBahan::with([
        'purchaseOrder.supplier',
        'purchaseOrder.details', // <-- Ini kunci untuk mengambil harga PO
        'detailPenerimaan.bahan'
    ])
    ->whereDoesntHave('transaksiPembelian')
    ->get();
        // Ambil Riwayat Transaksi
        $riwayatTransaksi = TransaksiPembelian::with('penerimaan.purchaseOrder.supplier')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Pembelian/TransaksiPembelian', [
            'penerimaanPending' => $penerimaanPending,
            'riwayatTransaksi' => $riwayatTransaksi
        ]);
    }

    /**
     * Menyimpan transaksi pembelian dan detailnya ke database.
     */
    public function store(Request $request)
    {
        // Validasi data
        $request->validate([
            'id_penerimaan'     => 'required|exists:t_penerimaan_bahan,id_penerimaan',
            'no_faktur'         => 'required|string|max:50',
            'tanggal_transaksi' => 'required|date',
            'metode_pembayaran' => 'required|in:Tunai,Kredit',
            'jatuh_tempo'       => 'required_if:metode_pembayaran,Kredit|nullable|date',
            'subtotal_barang'   => 'required|numeric',
            'total_tagihan'     => 'required|numeric',
            'items'             => 'required|array', // Data detail per item
        ]);

        DB::beginTransaction();
        try {
            // 1. Simpan Header (Faktur)
            $transaksi = TransaksiPembelian::create([
                'id_penerimaan'     => $request->id_penerimaan,
                'no_faktur'         => $request->no_faktur,
                'tanggal_transaksi' => $request->tanggal_transaksi,
                'metode_pembayaran' => $request->metode_pembayaran,
                'status_pembayaran' => $request->status_pembayaran ?? 'Belum Lunas',
                'jatuh_tempo'       => $request->metode_pembayaran === 'Kredit' ? $request->jatuh_tempo : null,
                'subtotal_barang'   => $request->subtotal_barang,
                'diskon'            => $request->diskon ?? 0,
                'ongkos_kirim'      => $request->ongkos_kirim ?? 0,
                'pajak'             => $request->pajak ?? 0,
                'total_tagihan'     => $request->total_tagihan,
            ]);

            // 2. Simpan Detail & Catat Kartu Persediaan Secara Penuh
            foreach ($request->items as $item) {
                // Simpan ke detail transaksi pembelian
                DetailTransaksiPembelian::create([
                    'id_transaksi'         => $transaksi->id_transaksi,
                    'id_detail_penerimaan' => $item['id_detail_penerimaan'],
                    'harga_aktual'         => $item['harga_aktual'],
                    'subtotal'             => $item['subtotal'],
                ]);

                // ===== HUBUNGKAN KE KARTU PERSEDIAAN (BAHAN BAKU MASUK) =====

           // Hubungkan ke form penerimaan untuk mengambil Qty yang benar-benar diterima
                $detailPenerimaan = DetailPenerimaanBahan::find($item['id_detail_penerimaan']);

                if ($detailPenerimaan) {
                    // LANGSUNG CATAT STOK MASUK SECARA UTUH (Tidak ada lagi penyesuaian selisih)
                    InventoryService::catatMutasi(
                        $detailPenerimaan->id_bahan,
                        'bahan',
                        'MASUK',                     // Jenis Transaksi
                        'pembelian',                 // Sumber Transaksi
                        $request->no_faktur,         // Nomor Referensi
                        $detailPenerimaan->qty_diterima, // Qty utuh sesuai fisik gudang
                        $item['harga_aktual'],       // Harga final dari faktur
                        $request->tanggal_transaksi,
                        "Pembelian bahan baku berdasarkan faktur: " . $request->no_faktur
                    );
        }
    }


        DB::commit();
        return redirect()->back()->with('success', 'Transaksi Pembelian berhasil disimpan!');

    } catch (\Exception $e) {
        DB::rollBack();
        return back()->withErrors(['error' => 'Gagal menyimpan transaksi: ' . $e->getMessage()]);
    }
}
}

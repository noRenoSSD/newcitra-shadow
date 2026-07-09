<?php

namespace App\Http\Controllers;
use App\Services\InventoryService;
use App\Models\TransaksiPembelian;
use App\Models\DetailTransaksiPembelian;
use App\Models\DetailPenerimaanBahan;
use App\Models\PenerimaanBahan;
use App\Models\HutangUsaha;
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
        // 1. Ambil data PO & Penerimaan yang belum ditagihkan (Tidak diubah)
        $penerimaanPending = PenerimaanBahan::with([
            'purchaseOrder.supplier',
            'purchaseOrder.details',
            'detailPenerimaan.bahan'
        ])
        ->whereDoesntHave('transaksiPembelian')
        ->get();

        // 2. Ambil Riwayat Transaksi (Sekarang kita LOAD semua relasi termasuk detail item barangnya)
        $riwayatTransaksiRaw = TransaksiPembelian::with([
            'penerimaanBahan.purchaseOrder.supplier',
            'details.detailPenerimaan.bahan' // <-- Wajib dipanggil agar tabel item tidak kosong!
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        // 3. Mapping data agar STRUKTURNYA COCOK 100% dengan kebutuhan variabel di React
        $riwayatTransaksi = $riwayatTransaksiRaw->map(function($t) {
            $penerimaan = $t->penerimaanBahan;
            $po = $penerimaan ? $penerimaan->purchaseOrder : null;
            $supplier = $po ? $po->supplier : null;

            // Merapikan data detail barang
            $mappedDetails = $t->details->map(function($d) {
                $detPenerimaan = $d->detailPenerimaan;
                $bahan = $detPenerimaan ? $detPenerimaan->bahan : null;

                return [
                    'qty'          => $detPenerimaan ? (int) $detPenerimaan->qty_diterima : 0,
                    'harga_aktual' => (float) $d->harga_aktual,
                    'subtotal'     => (float) $d->subtotal,
                    'bahan'        => $bahan ? [
                        'kode_bahan'   => $bahan->kode_bahan,
                        'nama_bahan'   => $bahan->nama_bahan,
                        'satuan_bahan' => $bahan->satuan_bahan ?? $bahan->satuan ?? '-'
                    ] : null
                ];
            });

            // Mengembalikan struktur yang ditangkap oleh React (t.penerimaan.purchase_order...)
            return [
                'id_transaksi'      => $t->id_transaksi,
                'no_faktur'         => $t->no_faktur,
                'tanggal_transaksi' => $t->tanggal_transaksi,
                'metode_pembayaran' => $t->metode_pembayaran,
                'jatuh_tempo'       => $t->jatuh_tempo,
                'subtotal_barang'   => $t->subtotal_barang,
                'diskon'            => $t->diskon,
                'ongkos_kirim'      => $t->ongkos_kirim,
                'pajak'             => $t->pajak,
                'total_tagihan'     => $t->total_tagihan,
                'penerimaan'        => $penerimaan ? [
                    'no_penerimaan'  => $penerimaan->no_penerimaan,
                    'purchase_order' => $po ? [
                        'no_po'    => $po->no_po,
                        'supplier' => $supplier ? [
                            'nama_supplier' => $supplier->nama_supplier
                        ] : null
                    ] : null
                ] : null,
                'details' => $mappedDetails // Menyuplai data item untuk modal dan print
            ];
        });

        return Inertia::render('Pembelian/TransaksiPembelian', [
            'penerimaanPending' => $penerimaanPending,
            'riwayatTransaksi'  => $riwayatTransaksi
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

           // =================================================================
// 2. SIMPAN DETAIL TRANSAKSI & CATAT MUTASI MASUK PERSEDIAAN
// =================================================================
// Hitung faktor penyesuaian di luar perulangan agar performa cepat
$subtotalBarang = $request->subtotal_barang;
$totalTagihan = $request->total_tagihan;

// Rumus faktor: Total Tagihan / Subtotal Kotor
$faktorPenyesuaian = $subtotalBarang > 0 ? ($totalTagihan / $subtotalBarang) : 1;

foreach ($request->items as $item) {
    $detailPenerimaan = DetailPenerimaanBahan::find($item['id_detail_penerimaan']);

    if ($detailPenerimaan) {
        // 1. Simpan detail transaksi pembelian (Tetap simpan harga asli faktur agar cocok dengan fisik nota supplier)
        DetailTransaksiPembelian::create([
            'id_transaksi'         => $transaksi->id_transaksi,
            'id_detail_penerimaan' => $item['id_detail_penerimaan'],
            'harga_aktual'         => $item['harga_aktual'],
            'subtotal'             => $item['subtotal'],
        ]);

        // 2. HITUNG HARGA BERSIH UNTUK KARTU PERSEDIAAN (Landed Cost)
        // Harga Bersih = Harga Faktur x Faktor Penyesuaian (Sudah include proporsi ongkir & diskon)
        $hargaBersih = round($item['harga_aktual'] * $faktorPenyesuaian);

        // 3. CATAT MUTASI KE KARTU PERSEDIAAN MENGGUNAKAN HARGA BERSIH
        InventoryService::catatMutasi(
            $item['id_bahan'],
            'bahan',
            'MASUK',                     // Tipe Mutasi
            'pembelian',                 // Sumber Transaksi
            $request->no_faktur,         // Nomor Referensi
            $detailPenerimaan->qty_diterima,
            $hargaBersih,                // <--- KUNCI PERBAIKAN: Menggunakan harga bersih yang sudah proporsional
            $request->tanggal_transaksi,
            "Pembelian bahan baku berdasarkan faktur: " . $request->no_faktur
        );
    }
}
// =================================================================
        // 3. OTOMATIS CATAT HUTANG JIKA METODE PEMBAYARAN "KREDIT"
        // =================================================================
        if ($request->metode_pembayaran === 'Kredit') {
            HutangUsaha::create([
                'id_transaksi' => $transaksi->id_transaksi,
                'no_hutang'    => 'HU-' . date('Ymd') . '-' . str_pad($transaksi->id_transaksi, 3, '0', STR_PAD_LEFT),
                'total_hutang' => $transaksi->total_tagihan,
                'terbayar'     => 0,
                'kurang_bayar' => $transaksi->total_tagihan,
                'status'       => 'Belum Lunas'
            ]);
        }

        DB::commit();
        return redirect()->back()->with('success', 'Transaksi Pembelian berhasil disimpan!');

    } catch (\Exception $e) {
        DB::rollBack();
        return back()->withErrors(['error' => 'Gagal menyimpan transaksi: ' . $e->getMessage()]);
    }
}
}

<?php

namespace App\Http\Controllers;

use App\Models\HutangUsaha;
use App\Models\PembayaranHutang;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HutangUsahaController extends Controller
{
    public function index()
    {
        // Ambil data hutang dengan relasi yang BENAR sesuai file Model-mu:
        // Hutang -> Transaksi Pembelian -> Details (Item) & PenerimaanBahan -> Supplier
        $hutangRaw = HutangUsaha::with([
    'transaksiPembelian.details.detailPenerimaan.bahan',
    // UBAH BARIS INI: Ambil supplier melalui purchaseOrder
    'transaksiPembelian.penerimaanBahan.purchaseOrder.supplier',
    'riwayatPembayaran'
])->get();

$listHutang = $hutangRaw->map(function ($h) {
    $pembelian = $h->transaksiPembelian;
    $penerimaan = $pembelian ? $pembelian->penerimaanBahan : null;

    // CARI SUPPLIER LEWAT PO:
    $po = $penerimaan ? $penerimaan->purchaseOrder : null;

    // Jika ada PO, ambil supplier dari PO. Kalau tidak, coba ambil langsung dari penerimaan (jaga-jaga)
    $supplier = $po ? $po->supplier : ($penerimaan ? $penerimaan->supplier : null);

    $namaSupplier = $supplier ? $supplier->nama_supplier : 'Supplier Tidak Diketahui';

    // ... (kode mapping items dan return sisanya biarkan sama seperti sebelumnya) ...

            // 1. Mengambil list item barang yang dibeli dari detail transaksi pembelian
            $items = [];
            if ($pembelian && $pembelian->details) {
                foreach ($pembelian->details as $detail) {
                    // Ambil info bahan fisik via detail penerimaan
                    $detailPenerimaan = $detail->detailPenerimaan;
                    $bahan = $detailPenerimaan ? $detailPenerimaan->bahan : null;

                    $items[] = [
                        'kodeBahan' => $bahan->kode_bahan ?? '-',
                        'namaBahan' => $bahan->nama_bahan ?? 'Item Pembelian',
                        'qty'       => $detailPenerimaan ? (int) $detailPenerimaan->qty_diterima : 0,
                        'satuan'    => $bahan->satuan_bahan ?? 'Unit',
                        'harga'     => (float) $detail->harga_aktual,
                        'subtotal'  => (float) $detail->subtotal,
                    ];
                }
            }

            // 2. Mengambil riwayat pembayaran (Tunai maupun Potongan Retur)
            $riwayat = $h->riwayatPembayaran->map(function ($p) {
                return [
                    'id'               => (string) $p->id_pembayaran,
                    'noBayar'          => $p->no_pembayaran,
                    'tanggal'          => \Carbon\Carbon::parse($p->tanggal_pembayaran)->format('Y-m-d'),
                    'jumlahOriginal'   => (float) $p->jumlah_dibayar,
                    'jumlahDibayar'    => (float) $p->jumlah_dibayar,
                    'metodePembayaran' => $p->metode_pembayaran,
                    'tipe'             => $p->tipe, // 'Bayar' | 'Retur'
                ];
            });

            return [
                'id'                => (string) $h->id_hutang,
                'noHutang'          => $h->no_hutang,
                'noTransaksi'       => $pembelian->no_faktur ?? '-',
                'supplier'          => $supplier->nama_supplier ?? 'Supplier Tidak Diketahui',
                'totalHutang'       => (float) $h->total_hutang,
                'terbayar'          => (float) $h->terbayar,
                'kurangBayar'       => (float) $h->kurang_bayar,

                // === DI SINI TANGGAL JATUH TEMPO DIKIRIMKAN KE REACT ===
                'tanggalJatuhTempo' => $pembelian && $pembelian->jatuh_tempo ? \Carbon\Carbon::parse($pembelian->jatuh_tempo)->format('Y-m-d') : '-',

                'status'            => $h->status === 'Lunas' ? 'Lunas' : 'Belum Lunas',
                'items'             => $items,
                'riwayatPembayaran' => $riwayat,
            ];
        });

        return Inertia::render('Keuangan/HutangUsaha', [
            'dbHutang' => $listHutang
        ]);
    }

    public function bayar(Request $request, $id_hutang)
    {
        $request->validate([
            'jumlah_dibayar'    => 'required|numeric|min:1',
            'tanggal_pembayaran'=> 'required|date',
            'metode_pembayaran' => 'required|string',
            'catatan'           => 'nullable|string'
        ]);

        DB::transaction(function () use ($request, $id_hutang) {
            $hutang = HutangUsaha::findOrFail($id_hutang);

            $count = PembayaranHutang::where('tipe', 'Bayar')->count() + 1;
            $noBayar = 'PMB-HU-' . date('Ymd') . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);

            PembayaranHutang::create([
                'id_hutang'          => $hutang->id_hutang,
                'no_pembayaran'      => $noBayar,
                'tanggal_pembayaran' => $request->tanggal_pembayaran,
                'jumlah_dibayar'     => $request->jumlah_dibayar,
                'metode_pembayaran'  => $request->metode_pembayaran,
                'tipe'               => 'Bayar',
                'catatan'            => $request->catatan,
            ]);

            $newTerbayar = $hutang->terbayar + $request->jumlah_dibayar;
            $newKurangBayar = $hutang->total_hutang - $newTerbayar;

            $hutang->update([
                'terbayar'     => $newTerbayar,
                'kurang_bayar' => $newKurangBayar,
                'status'       => $newKurangBayar <= 0 ? 'Lunas' : 'Belum Lunas'
            ]);
        });

        return redirect()->back()->with('success', 'Pembayaran hutang berhasil dicatat.');
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ReturPembelian;
use App\Models\DetailReturPembelian;
use App\Models\PenerimaanBahan;
use App\Models\HutangUsaha;
use App\Models\PembayaranHutang;
use App\Models\TransaksiPembelian;
use App\Services\InventoryService;
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
                'detailPenerimaan.bahan' // Hapus purchaseOrder.details karena memicu harga PO lama
            ])
            ->whereHas('detailPenerimaan', function ($q) {
                $q->where('qty_retur', '>', 0);
            })
            ->whereNotIn('id_penerimaan', $returTerpakai)
            ->get()
            ->map(function ($penerimaan) {
                // KUNCI PERBAIKAN 1: Hitung Harga Bersih (Landed Cost) untuk dilempar ke React
                $penerimaan->detailPenerimaan->map(function ($detail) {
                    $transaksiData = DB::table('t_detail_transaksi_pembelian as dt')
                        ->join('t_transaksi_pembelian as t', 'dt.id_transaksi', '=', 't.id_transaksi')
                        ->where('dt.id_detail_penerimaan', $detail->id_detail_penerimaan)
                        ->select('dt.harga_aktual', 't.subtotal_barang', 't.total_tagihan')
                        ->first();

                    $hargaBersih = 0;

                    if ($transaksiData && $transaksiData->subtotal_barang > 0) {
                        // Rumus Proporsi: Total Tagihan dibagi Subtotal Barang
                        $faktor = $transaksiData->total_tagihan / $transaksiData->subtotal_barang;
                        $hargaBersih = $transaksiData->harga_aktual * $faktor;
                    } else {
                        // Fallback jika belum ditagihkan (ambil dari PO)
                        $hargaBersih = DB::table('t_detail_po')
                            ->where('id_po', DB::table('t_penerimaan_bahan')->where('id_penerimaan', $detail->id_penerimaan)->value('id_po'))
                            ->where('id_bahan', $detail->id_bahan)
                            ->value('harga_satuan');
                    }

                    // Tampilkan ke frontend sebagai harga_aktual, bulatkan menjadi integer agar rapi
                    $detail->harga_aktual = round($hargaBersih ?? 0);
                    return $detail;
                });
                return $penerimaan;
            });

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
            'no_retur'      => 'required|unique:t_retur_pembelian,no_retur',
            'tanggal_retur' => 'required|date',
            'items'         => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            $totalNilai = 0;

            // 1. Simpan Header Retur
            $retur = ReturPembelian::create([
                'id_penerimaan' => $request->id_penerimaan,
                'no_retur'      => $request->no_retur,
                'tanggal_retur' => $request->tanggal_retur,
                'total_nilai'   => 0, // Ditotal belakangan
            ]);

            // 2. Simpan Detail Retur & POTONG STOK
            foreach ($request->items as $item) {
                if (isset($item['qtyRetur']) && $item['qtyRetur'] > 0) {

                    // KUNCI PERBAIKAN 2: Hitung Ulang Harga Bersih secara proporsional dari Transaksi Pembelian
                    $transaksiData = DB::table('t_detail_penerimaan_bahan as dp')
                        ->join('t_detail_transaksi_pembelian as dt', 'dp.id_detail_penerimaan', '=', 'dt.id_detail_penerimaan')
                        ->join('t_transaksi_pembelian as t', 'dt.id_transaksi', '=', 't.id_transaksi')
                        ->where('dp.id_penerimaan', $request->id_penerimaan)
                        ->where('dp.id_bahan', $item['idBahan'])
                        ->select('dt.harga_aktual', 't.subtotal_barang', 't.total_tagihan')
                        ->first();

                    $hargaPake = $item['harga'] ?? 0; // Fallback lemparan dari React

                    if ($transaksiData && $transaksiData->subtotal_barang > 0) {
                        $faktor = $transaksiData->total_tagihan / $transaksiData->subtotal_barang;
                        $hargaPake = round($transaksiData->harga_aktual * $faktor);
                    } elseif ($transaksiData) {
                        $hargaPake = round($transaksiData->harga_aktual);
                    }

                    $subtotal = $item['qtyRetur'] * $hargaPake;
                    $totalNilai += $subtotal;

                    // Simpan jejak barang yang diretur dengan HARGA BERSIH
                    DetailReturPembelian::create([
                        'id_retur'     => $retur->id_retur,
                        'id_bahan'     => $item['idBahan'],
                        'qty_retur'    => $item['qtyRetur'],
                        'harga_satuan' => $hargaPake,
                        'alasan'       => $item['alasan'] ?? '-',
                    ]);

                    // ========================================================
                    // 3. POTONG KARTU PERSEDIAAN MENGGUNAKAN HARGA BERSIH
                    // ========================================================
                    InventoryService::catatMutasi(
                        $item['idBahan'],
                        'bahan',
                        'KELUAR',
                        'retur_pembelian',
                        $request->no_retur,
                        $item['qtyRetur'],
                        $hargaPake, // <--- Sudah menggunakan harga aktual proporsional
                        $request->tanggal_retur,
                        "Retur pembelian ke supplier. Alasan: " . ($item['alasan'] ?? '-')
                    );
                }
            }

            // Update total nilai asli di header retur setelah loop selesai
            $retur->update(['total_nilai' => $totalNilai]);

            // 5. Integrasi Keuangan: Potong Saldo Hutang Usaha
            $transaksi = TransaksiPembelian::where('id_penerimaan', $retur->id_penerimaan)->first();

            if ($transaksi) {
                $hutang = HutangUsaha::where('id_transaksi', $transaksi->id_transaksi)->first();

                if ($hutang) {
                    $hutang->terbayar += $totalNilai;
                    $hutang->kurang_bayar -= $totalNilai;

                    if ($hutang->kurang_bayar <= 0) {
                        $hutang->status = 'Lunas';
                        $hutang->kurang_bayar = 0;
                    }
                    $hutang->save();

                    PembayaranHutang::create([
                        'id_hutang'          => $hutang->id_hutang,
                        'id_retur'           => $retur->id_retur,
                        'no_pembayaran'      => 'RET-' . $retur->no_retur,
                        'tanggal_pembayaran' => $request->tanggal_retur,
                        'jumlah_dibayar'     => $totalNilai,
                        'metode_pembayaran'  => 'Potongan Retur',
                        'tipe'               => 'Retur',
                        'catatan'            => 'Retur atas transaksi ' . $transaksi->no_transaksi,
                    ]);
                }
            }
            DB::commit();
            return redirect()->back()->with('success', 'Nota Retur berhasil disimpan dan stok telah dikurangi dengan harga aktual!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan retur: ' . $e->getMessage()]);
        }
    }
}

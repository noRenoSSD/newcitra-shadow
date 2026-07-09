<?php

namespace App\Http\Controllers;

use App\Models\KartuPersediaan;
use App\Models\Bahan; // Model Bahan dari BahanController.php
use App\Models\Produk; // Un-comment jika model produk jadi sudah ada
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // <-- INI DIA YANG KURANG!
use Inertia\Inertia;

class KartuPersediaanController extends Controller
{
    // ==========================================
    // 1. KARTU PERSEDIAAN BAHAN BAKU
    // ==========================================
    public function indexBahanBaku(Request $request)
    {
        $selectedId = $request->input('id_bahan');

        $mutasi = [];
        if ($selectedId) {
            $mutasi = KartuPersediaan::where('id_bahan', $selectedId)
                ->orderBy('tanggal_transaksi', 'asc')
                ->orderBy('id_kartu', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'id'          => $item->id_kartu,
                        'tanggal'     => \Carbon\Carbon::parse($item->tanggal_transaksi)->format('Y-m-d'),
                        'noRef'       => $item->no_referensi,
                        'masukUnit'   => $item->qty_masuk,
                        'masukHarga'  => $item->harga_masuk ?? 0,
                        'masukTotal'  => $item->total_masuk ?? 0,
                        'keluarUnit'  => $item->qty_keluar,
                        'keluarHarga' => $item->harga_keluar ?? 0,
                        'keluarTotal' => $item->total_keluar ?? 0,
                        'saldoUnit'   => $item->saldo_qty,
                        'saldoHarga'  => $item->saldo_harga,
                        'saldoTotal'  => $item->saldo_total,
                    ];
                });
        }

        // Filter hanya yang jenis_bahan-nya 'baku'
        $listBahan = Bahan::where('jenis_bahan', 'baku')
            ->orderBy('nama_bahan', 'asc')
            ->get();

        return Inertia::render('Persediaan/KartuPersediaanBahanBaku', [
            'listBahan'  => $listBahan,
            'mutasiData' => $mutasi,
            'selectedId' => $selectedId
        ]);
    }

    // ==========================================
    // 2. KARTU PERSEDIAAN BAHAN PENOLONG
    // ==========================================
    public function indexBahanPenolong(Request $request)
    {
        $selectedId = $request->input('id_bahan');

        $mutasi = [];
        if ($selectedId) {
            $mutasi = KartuPersediaan::where('id_bahan', $selectedId)
                ->orderBy('tanggal_transaksi', 'asc')
                ->orderBy('id_kartu', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'id'          => $item->id_kartu,
                        'tanggal'     => \Carbon\Carbon::parse($item->tanggal_transaksi)->format('Y-m-d'),
                        'noRef'       => $item->no_referensi,
                        'masukUnit'   => $item->qty_masuk,
                        'masukHarga'  => $item->harga_masuk ?? 0,
                        'masukTotal'  => $item->total_masuk ?? 0,
                        'keluarUnit'  => $item->qty_keluar,
                        'keluarHarga' => $item->harga_keluar ?? 0,
                        'keluarTotal' => $item->total_keluar ?? 0,
                        'saldoUnit'   => $item->saldo_qty,
                        'saldoHarga'  => $item->saldo_harga,
                        'saldoTotal'  => $item->saldo_total,
                    ];
                });
        }

        // Filter hanya yang jenis_bahan-nya 'penolong'
        $listBahan = Bahan::where('jenis_bahan', 'penolong')
            ->orderBy('nama_bahan', 'asc')
            ->get();

        return Inertia::render('Persediaan/KartuPersediaanBahanPenolong', [
            'listBahan'  => $listBahan,
            'mutasiData' => $mutasi,
            'selectedId' => $selectedId
        ]);
    }

    // ==========================================
    // 3. KARTU PERSEDIAAN PRODUK JADI
    // ==========================================
    public function indexProdukJadi(Request $request)
    {
        // 1. Ambil daftar master Produk Jadi untuk dropdown
        $listProduk = DB::table('t_produk')
            ->select('id_produk', 'kode_produk', 'nama_produk', 'satuan_produk')
            ->get();

        // 2. Tangkap ID Produk dari URL jika User memilih sesuatu di dropdown
        $selectedId = $request->id_produk;

        // 3. Tarik data mutasi jika ada produk yang dipilih
        $mutasiData = [];

        if ($selectedId) {
            // Ambil histori dari kartu persediaan khusus produk ini
            $mutasiRaw = DB::table('t_kartu_persediaan')
                ->where('id_produk', $selectedId)
                ->orderBy('tanggal_transaksi', 'asc')
                ->orderBy('id_kartu', 'asc')
                ->get();

            $saldoUnit = 0;
            $saldoTotal = 0;

            foreach ($mutasiRaw as $m) {
                // Perhitungan Running Balance (Saldo Berjalan)
                $saldoUnit += ($m->qty_masuk - $m->qty_keluar);
                $saldoTotal += ($m->total_masuk - $m->total_keluar);

                // Hindari pembagian nol (0) jika stok kosong
                $saldoHarga = $saldoUnit > 0 ? ($saldoTotal / $saldoUnit) : 0;

                // Mapping format agar sesuai dengan yang diminta React (camelCase)
                $mutasiData[] = [
                    'id'          => $m->id_kartu,
                    'tanggal'     => date('d/m/Y', strtotime($m->tanggal_transaksi)),
                    'noRef'       => $m->no_referensi ?? '-',
                    'masukUnit'   => (float) $m->qty_masuk,
                    'masukHarga'  => (float) $m->harga_masuk,
                    'masukTotal'  => (float) $m->total_masuk,
                    'keluarUnit'  => (float) $m->qty_keluar,
                    'keluarHarga' => (float) $m->harga_keluar,
                    'keluarTotal' => (float) $m->total_keluar,
                    'saldoUnit'   => $saldoUnit,
                    'saldoHarga'  => $saldoHarga,
                    'saldoTotal'  => $saldoTotal,
                ];
            }
        }

        // 4. Lempar data ke halaman React (Inertia)
        return Inertia::render('Persediaan/KartuPersediaanProdukJadi', [
            'listProduk' => $listProduk,
            'mutasiData' => $mutasiData,
            'selectedId' => $selectedId
        ]);
    }
}

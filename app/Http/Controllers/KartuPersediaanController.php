<?php

namespace App\Http\Controllers;

use App\Models\KartuPersediaan;
use App\Models\Bahan; // Model Bahan dari BahanController.php
// use App\Models\Produk; // Un-comment jika model produk jadi sudah ada
use Illuminate\Http\Request;
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
        $selectedId = $request->input('id_produk');

        $mutasi = [];
        if ($selectedId) {
            $mutasi = KartuPersediaan::where('id_produk', $selectedId)
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

        // Mengambil list Produk Jadi (sesuaikan dengan nama Model Produkmu nanti)
        // $listProduk = \App\Models\Produk::orderBy('nama_produk', 'asc')->get();
        $listProduk = []; // Sementara kosong jika model belum siap

        return Inertia::render('Persediaan/PersediaanProdukJadi', [
            'listProduk' => $listProduk,
            'mutasiData' => $mutasi,
            'selectedId' => $selectedId
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Services\InventoryService;

class PersediaanKonsinyasiController extends Controller
{
    public function index()
    {
        // 1. Ambil data master mitra
        $mitraRaw = DB::table('t_mitra')->get();

        $listMitra = [];

        foreach ($mitraRaw as $mitra) {

            // =======================================================
            // A. PERHITUNGAN STOK PER PRODUK DI MITRA INI
            // =======================================================

            // 1. Total Masuk (Dari Pengiriman Konsinyasi)
            $pengiriman = DB::table('t_konsinyasi_keluar_detail as d')
                ->join('t_konsinyasi_keluar as h', 'd.id_konsinyasi_keluar', '=', 'h.id_konsinyasi_keluar')
                ->join('t_produk as p', 'd.id_produk', '=', 'p.id_produk')
                ->where('h.id_mitra', $mitra->id_mitra)
                ->select('d.id_produk', 'p.nama_produk', 'p.satuan_produk', DB::raw('SUM(d.qty) as total_masuk'))
                ->groupBy('d.id_produk', 'p.nama_produk', 'p.satuan_produk')
                ->get()
                ->keyBy('id_produk');

            // 2. Total Keluar (Dari Penjualan Konsinyasi)
            $penjualan = DB::table('t_jual_konsinyasi_detail as d')
                ->join('t_jual_konsinyasi as h', 'd.id_jual_konsinyasi', '=', 'h.id_jual_konsinyasi')
                ->where('h.id_mitra', $mitra->id_mitra)
                ->select('d.id_produk', DB::raw('SUM(d.qty_terjual) as total_jual'))
                ->groupBy('d.id_produk')
                ->pluck('total_jual', 'id_produk');

            // 3. Total Keluar (Dari Retur Konsinyasi)
            // Relasi ditarik melalui t_konsinyasi_keluar untuk mendapatkan mitra-nya
            $retur = DB::table('t_retur_konsinyasi_detail as d')
                ->join('t_retur_konsinyasi as h', 'd.id_retur_konsinyasi', '=', 'h.id_retur_konsinyasi')
                ->join('t_konsinyasi_keluar as k', 'h.id_konsinyasi_keluar', '=', 'k.id_konsinyasi_keluar')
                ->where('k.id_mitra', $mitra->id_mitra)
                ->select('d.id_produk', DB::raw('SUM(d.qty) as total_retur'))
                ->groupBy('d.id_produk')
                ->pluck('total_retur', 'id_produk');

            $stokProduk = [];
            foreach ($pengiriman as $id_produk => $data) {
                $masuk = $data->total_masuk;
                $keluar = ($penjualan[$id_produk] ?? 0) + ($retur[$id_produk] ?? 0);
                $stok = $masuk - $keluar;

                // Hanya tampilkan jika produk tersebut pernah dikirim ke mitra ini
                if ($masuk > 0 || $keluar > 0) {
                    $stokProduk[] = [
                        'produk' => $data->nama_produk,
                        'masuk'  => (int) $masuk,
                        'keluar' => (int) $keluar,
                        'stok'   => (int) $stok,
                    ];
                }
            }

            // =======================================================
            // B. KOMPILASI RIWAYAT MUTASI UNTUK KARTU PERSEDIAAN
            // =======================================================
            $mutasi = [];

            // 1. Riwayat Pengiriman
            $dataPengiriman = DB::table('t_konsinyasi_keluar')->where('id_mitra', $mitra->id_mitra)->get();
            foreach ($dataPengiriman as $h) {
                $items = DB::table('t_konsinyasi_keluar_detail as d')
                    ->join('t_produk as p', 'd.id_produk', '=', 'p.id_produk')
                    ->where('d.id_konsinyasi_keluar', $h->id_konsinyasi_keluar)
                    ->select('p.nama_produk as produk', 'd.qty as qty', 'p.satuan_produk as satuan')
                    ->get();
                if($items->count() > 0) {
                    $mutasi[] = [
                        'id' => 'KIRIM-'.$h->id_konsinyasi_keluar, 'tanggal' => $h->tgl_konsinyasi, 'noRef' => $h->no_konsinyasi,
                        'jenis' => 'Pengiriman ke Mitra', 'tipe' => 'Masuk', 'items' => $items, 'totalQty' => $items->sum('qty')
                    ];
                }
            }

            // 2. Riwayat Penjualan
            $dataPenjualan = DB::table('t_jual_konsinyasi')->where('id_mitra', $mitra->id_mitra)->get();
            foreach ($dataPenjualan as $h) {
                $items = DB::table('t_jual_konsinyasi_detail as d')
                    ->join('t_produk as p', 'd.id_produk', '=', 'p.id_produk')
                    ->where('d.id_jual_konsinyasi', $h->id_jual_konsinyasi)
                    ->select('p.nama_produk as produk', 'd.qty_terjual as qty', 'p.satuan_produk as satuan')
                    ->get();
                if($items->count() > 0) {
                    $mutasi[] = [
                        'id' => 'JUAL-'.$h->id_jual_konsinyasi, 'tanggal' => $h->tgl_penjualan, 'noRef' => $h->no_penjualan,
                        'jenis' => 'Penjualan Konsinyasi', 'tipe' => 'Keluar', 'items' => $items, 'totalQty' => $items->sum('qty')
                    ];
                }
            }

            // 3. Riwayat Retur
            // Tarik data retur berdasarkan id_konsinyasi_keluar yang dimiliki oleh mitra ini
            $idKonsinyasiMitra = $dataPengiriman->pluck('id_konsinyasi_keluar');
            $dataRetur = DB::table('t_retur_konsinyasi')->whereIn('id_konsinyasi_keluar', $idKonsinyasiMitra)->get();

            foreach ($dataRetur as $h) {
                $items = DB::table('t_retur_konsinyasi_detail as d')
                    ->join('t_produk as p', 'd.id_produk', '=', 'p.id_produk')
                    ->where('d.id_retur_konsinyasi', $h->id_retur_konsinyasi)
                    ->select('p.nama_produk as produk', 'd.qty as qty', 'p.satuan_produk as satuan')
                    ->get();
                if($items->count() > 0) {
                    $mutasi[] = [
                        'id' => 'RET-'.$h->id_retur_konsinyasi, 'tanggal' => $h->tgl_retur_konsinyasi, 'noRef' => $h->no_retur_konsinyasi,
                        'jenis' => 'Retur Konsinyasi', 'tipe' => 'Keluar', 'items' => $items, 'totalQty' => $items->sum('qty')
                    ];
                }
            }

            // Urutkan riwayat mutasi berdasarkan tanggal paling lama ke terbaru
            usort($mutasi, function($a, $b) { return strtotime($a['tanggal']) - strtotime($b['tanggal']); });

            // =======================================================
            // C. BUNGKUS DATA SESUAI FORMAT REACT
            // =======================================================
            if (count($stokProduk) > 0) {
                $listMitra[] = [
                    'id'         => (string) $mitra->id_mitra,
                    'kodeMitra'  => $mitra->kode_mitra ?? '-',
                    'namaMitra'  => $mitra->nama_mitra,
                    'kota'       => $mitra->kota ?? '-',
                    'stokProduk' => $stokProduk,
                    'mutasi'     => $mutasi
                ];
            }
        }

        return Inertia::render('Persediaan/PersediaanKonsinyasi', [
            'listMitra' => $listMitra
        ]);
    }
}

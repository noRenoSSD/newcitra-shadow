<?php

namespace App\Http\Controllers;

use App\Models\Mitra;
use App\Models\Produk;
use App\Models\Pesanan;
use App\Models\PesananDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PesananController extends Controller
{
    public function index()
    {
        // Data mitra aktif
        $mitras = Mitra::where('status', 'Aktif')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id_mitra,
                    'kode_mitra' => $item->kode_mitra,
                    'nama_mitra' => $item->nama_mitra,
                    'alamat' => $item->alamat,
                ];
            });

        // Data produk beserta daftar harganya
        $produks = Produk::with('hargaProduk')->get();

        // Data daftar pesanan
        $pesanan = Pesanan::with('mitra')
            ->orderBy('tgl_pesanan', 'desc')
            ->get();

        // Generate nomor pesanan
        $tahunBulan = date('Ym');

        $lastPesanan = Pesanan::where('no_pesanan', 'like', "SO-$tahunBulan-%")
            ->orderBy('id_pesanan', 'desc')
            ->first();

        if (!$lastPesanan) {
            $nextNomorSO = "SO-$tahunBulan-001";
        } else {
            $lastNumber = (int) substr($lastPesanan->no_pesanan, -3);
            $nextNomorSO = "SO-$tahunBulan-" . str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        }

        return Inertia::render('Penjualan/Pesanan', [
            'pesanan' => $pesanan,
            'mitras' => $mitras,
            'produks' => $produks,
            'nextNomorSO' => $nextNomorSO,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nomorSO' => 'required|string|max:20',
            'tanggalSO' => 'required|date',
            'idMitra' => 'required|integer|exists:t_mitra,id_mitra',
            'jenisTransaksi' => 'required|in:Penjualan Langsung,Konsinyasi',
            'alamat' => 'required|string|max:100',

            'items' => 'required|array|min:1',

            'items.*.id_produk' => 'required|integer|exists:t_produk,id_produk',
            'items.*.id_harga' => 'required|integer|exists:t_harga_produk,id_harga_produk',
            'items.*.harga' => 'required|numeric|min:0',
            'items.*.jumlah' => 'required|integer|min:1',
        ]);

        $totalHarga = collect($request->items)->sum(function ($item) {
            return $item['jumlah'] * $item['harga'];
        });

        DB::transaction(function () use ($request, $totalHarga) {

            $pesanan = Pesanan::create([
                'no_pesanan' => $request->nomorSO,
                'tgl_pesanan' => $request->tanggalSO,
                'id_mitra' => $request->idMitra,
                'jenis_transaksi' => $request->jenisTransaksi,
                'alamat' => $request->alamat,
                'total_harga' => $totalHarga,
            ]);

            foreach ($request->items as $item) {

                PesananDetail::create([
                    'id_pesanan' => $pesanan->id_pesanan,
                    'id_produk' => $item['id_produk'],
                    'id_harga' => $item['id_harga'],
                    'harga' => $item['harga'],
                    'qty' => $item['jumlah'],
                    'subtotal' => $item['jumlah'] * $item['harga'],
                ]);
            }
        });

        return redirect()
            ->route('pesanan.index')
            ->with('success', 'Pesanan berhasil disimpan.');
    }
}
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
        // 1. Ambil data mitra dengan filter PHP yang aman dari SQL error
        $allMitra = Mitra::all();
        
        $mitraList = $allMitra->filter(function ($item) {
            return empty($item->status) || strtolower($item->status) === 'aktif' || strtolower($item->status) === 'active';
        })->map(function ($item) {
            return [
                'id_mitra' => $item->id_mitra,
                'kode_mitra' => $item->kode_mitra,
                'nama_mitra' => $item->nama_mitra,
                'alamat' => $item->alamat,
            ];
        })->values();

        // Fallback jika hasil filter kosong, ambil semua tanpa pandang status
        if ($mitraList->isEmpty()) {
            $mitraList = $allMitra->map(function ($item) {
                return [
                    'id_mitra' => $item->id_mitra,
                    'kode_mitra' => $item->kode_mitra,
                    'nama_mitra' => $item->nama_mitra,
                    'alamat' => $item->alamat,
                ];
            });
        }

        // 2. Data produk beserta daftar harganya
        $produkList = Produk::with(['hargaProduk' => function($query) {
                $query->select('id_harga_produk as id_harga', 'id_produk', 'jenis_transaksi', 'harga');
            }])
            ->get()
            ->map(function ($prod) {
                return [
                    'id_produk' => $prod->id_produk,
                    'nama_produk' => $prod->nama_produk,
                    'harga_produk' => $prod->hargaProduk
                ];
            });

        // 3. Data daftar pesanan beserta relasi mitra & detail items
        $pesanan = Pesanan::with(['mitra', 'items.produk'])
            ->orderBy('tgl_pesanan', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id_pesanan' => $order->id_pesanan,
                    'no_pesanan' => $order->no_pesanan,
                    'tgl_pesanan' => $order->tgl_pesanan,
                    'id_mitra' => $order->id_mitra,
                    'nama_mitra' => $order->mitra ? $order->mitra->nama_mitra : 'Tidak Diketahui',
                    'jenis_transaksi' => $order->jenis_transaksi,
                    'alamat' => $order->alamat,
                    'total_harga' => (float) $order->total_harga,
                    'items' => $order->items->map(function ($detail) {
                        return [
                            'id_pesanan_detail' => $detail->id_pesanan_detail,
                            'id_produk' => $detail->id_produk,
                            'id_harga' => $detail->id_harga,
                            'nama_produk' => $detail->produk ? $detail->produk->nama_produk : 'Produk Terhapus',
                            'harga' => (float) $detail->harga,
                            'qty' => $detail->qty,
                            'subtotal' => (float) $detail->subtotal,
                        ];
                    }),
                ];
            });

        // Generate nomor pesanan otomatis (SO-YYYYMM-XXX)
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
            'mitraList' => $mitraList,
            'produkList' => $produkList,
            'nextNoPesanan' => $nextNomorSO,
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
    public function update(Request $request, $id)
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

        DB::transaction(function () use ($request, $id, $totalHarga) {
            // 1. Update data pesanan utama
            $pesanan = Pesanan::findOrFail($id);
            $pesanan->update([
                'no_pesanan' => $request->nomorSO,
                'tgl_pesanan' => $request->tanggalSO,
                'id_mitra' => $request->idMitra,
                'jenis_transaksi' => $request->jenisTransaksi,
                'alamat' => $request->alamat,
                'total_harga' => $totalHarga,
            ]);

            // 2. Hapus detail item lama, lalu masukkan yang baru (Cara paling aman untuk update detail)
            PesananDetail::where('id_pesanan', $id)->delete();

            foreach ($request->items as $item) {
                PesananDetail::create([
                    'id_pesanan' => $id,
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
            ->with('success', 'Pesanan berhasil diperbarui.');
    }
    public function createInvoice(Request $request)
    {
        // Tangkap ID Pesanan dari URL (?so_id=...)
        $idPesanan = $request->query('so_id');
        
        // Ambil data pesanan beserta relasi item & produknya sebagai draft invoice
        $pesanan = Pesanan::with(['mitra', 'items.produk'])->findOrFail($idPesanan);

        // Oper data pesanan ke halaman form pembuatan Invoice (sesuaikan nama file Vue/React kamu)
        return Inertia::render('Penjualan/InvoiceForm', [
            'pesanan' => [
                'id_pesanan' => $pesanan->id_pesanan,
                'no_pesanan' => $pesanan->no_pesanan,
                'nama_mitra' => $pesanan->mitra ? $pesanan->mitra->nama_mitra : 'Tidak Diketahui',
                'alamat' => $pesanan->alamat,
                'total_harga' => $pesanan->total_harga,
                'items' => $pesanan->items->map(function ($detail) {
                    return [
                        'nama_produk' => $detail->produk ? $detail->produk->nama_produk : 'Produk Terhapus',
                        'qty' => $detail->qty,
                        'harga' => $detail->harga,
                        'subtotal' => $detail->subtotal,
                    ];
                }),
            ]
        ]);
    }

    public function createSuratJalan(Request $request)
    {
        // Tangkap ID Pesanan dari URL (?so_id=...)
        $idPesanan = $request->query('so_id');
        
        // Ambil data pesanan untuk draft Surat Jalan
        $pesanan = Pesanan::with(['mitra', 'items.produk'])->findOrFail($idPesanan);

        // Oper data pesanan ke halaman form pembuatan Surat Jalan (sesuaikan nama file Vue/React kamu)
        return Inertia::render('Penjualan/SuratJalanForm', [
            'pesanan' => [
                'id_pesanan' => $pesanan->id_pesanan,
                'no_pesanan' => $pesanan->no_pesanan,
                'nama_mitra' => $pesanan->mitra ? $pesanan->mitra->nama_mitra : 'Tidak Diketahui',
                'alamat' => $pesanan->alamat,
                'items' => $pesanan->items->map(function ($detail) {
                    return [
                        'nama_produk' => $detail->produk ? $detail->produk->nama_produk : 'Produk Terhapus',
                        'qty' => $detail->qty,
                    ];
                }),
            ]
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Mitra;
use App\Models\Produk; 
use App\Models\Pesanan;       // Pastikan model ini mengarah ke tabel t_pesanan
use App\Models\PesananDetail; // Pastikan model ini mengarah ke tabel t_pesanan_detail
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PesananController extends Controller
{
    public function index()
    {
        // 1. Ambil data Mitra untuk pilihan dropdown di React
        $mitras = Mitra::where('status', 'Aktif')->get()->map(function($item) {
            return [
                'id' => $item->id_mitra,
                'kodeMitra' => $item->kode_mitra,
                'namaMitra' => $item->nama_mitra,
                'alamat' => $item->alamat, // Kita ambil alamatnya untuk otomatis diisi di form nanti
            ];
        });

        // 2. Ambil data Produk Jadi untuk pilihan barang
        $produks = DB::table('t_produk_jadi')->get(); // Sesuaikan dengan nama tabel produk jadimu

        // 3. LOGIC AUTO GENERATE NOMOR PESANAN (Format: SO-YYYYMM-001)
        $tahunBulan = date('Ym'); 
        $lastPesanan = Pesanan::where('no_pesanan', 'LIKE', "SO-$tahunBulan-%")
            ->orderBy('id_pesanan', 'desc')
            ->first();

        if (!$lastPesanan) {
            $nextNomorSO = "SO-$tahunBulan-001";
        } else {
            $lastNumber = (int) substr($lastPesanan->no_pesanan, -3);
            $nextNumber = $lastNumber + 1;
            $nextNomorSO = "SO-$tahunBulan-" . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        }

        // 4. Kirim semua data ke halaman React
        return Inertia::render('Transaksi/SalesOrder', [
            'mitras' => $mitras,
            'produks' => $produks,
            'nextNomorSO' => $nextNomorSO
        ]);
    }

    public function store(Request $request)
    {
        // Validasi disesuaikan dengan input dari React
        $request->validate([
            'nomorSO'     => 'required|string|max:20',
            'tanggalSO'   => 'required|date',
            'idMitra'     => 'required|integer',
            'alamat'      => 'required|string|max:100', // Sesuai kolom alamat varchar(100)
            'items'       => 'required|array|min:1',
            'items.*.id_produk'    => 'required|integer',
            'items.*.jumlah'       => 'required|integer|min:1',
            'items.*.hargaSatuan'  => 'required|numeric|min:0',
        ]);

        // Hitung total harga keseluruhan untuk disimpan ke t_pesanan
        $totalHarga = collect($request->items)->reduce(function ($sum, $item) {
            return $sum + ($item['jumlah'] * $item['hargaSatuan']);
        }, 0);

        // Gunakan Database Transaction agar aman
        DB::transaction(function () use ($request, $totalHarga) {
            
            // 1. Simpan ke Tabel Utama (t_pesanan)
            $pesanan = Pesanan::create([
                'no_pesanan'    => $request->nomorSO,     // Sesuai field no_pesanan
                'tgl_pesanan'   => $request->tanggalSO,   // Sesuai field tgl_pesanan
                'id_mitra'      => $request->idMitra,     // Sesuai field id_mitra
                'alamat'        => $request->alamat,       // Sesuai field alamat
                'total_harga' => $totalHarga,       // Sesuai field total_hargadecimal
            ]);

            // 2. Looping untuk Simpan ke Tabel Detail (t_pesanan_detail)
            foreach ($request->items as $item) {
                PesananDetail::create([
                    'id_pesanan' => $pesanan->id_pesanan, // FK ke t_pesanan
                    'id_produk'  => $item['id_produk'],   // Sesuai field id_produk
                    'id_harga'   => 0,                    // Sementara di-set 0 atau sesuaikan logic id_harga kamu jika ada tabel harga terpisah
                    'qty'        => $item['jumlah'],      // Sesuai field qty
                    'subtotal'   => $item['jumlah'] * $item['hargaSatuan'], // Sesuai field subtotal
                ]);
            }
        });

        return redirect()->route('pesanan.index')
            ->with('success', 'Sales Order berhasil disimpan!');
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Mitra;
use App\Models\Produk;
use App\Models\Pesanan;
use App\Models\PesananDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Exception;

class PesananController extends Controller
{
    public function index()
    {
        // 1. Ambil data mitra dengan filter langsung di database (lebih cepat & aman memory)
        $mitraList = Mitra::whereIn(DB::raw('LOWER(status)'), ['aktif', 'active'])
            ->orWhereNull('status')
            ->select('id_mitra', 'kode_mitra', 'nama_mitra', 'alamat')
            ->get();

        // Fallback jika hasil filter kosong, ambil semua
        if ($mitraList->isEmpty()) {
            $mitraList = Mitra::select('id_mitra', 'kode_mitra', 'nama_mitra', 'alamat')->get();
        }

        // 2. Data produk beserta daftar harganya
        $produkList = Produk::with(['hargaProduk' => function($query) {
                $query->select('id_harga_produk as id_harga', 'id_produk', 'jenis_transaksi', 'harga');
            }])
            ->get(['id_produk', 'nama_produk'])
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
                
                // --- LOGIKA STATUS OTOMATIS BERDASARKAN RELASI ---
                $adaSJ = DB::table('t_surat_jalan')->where('id_pesanan', $order->id_pesanan)->exists();

                // SEKARANG SUDAH AKURAT MENGGUNAKAN TABEL t_jual
                $adaInvoice = DB::table('t_jual')->where('id_pesanan', $order->id_pesanan)->exists();

                if ($adaInvoice) {
                    $statusTiruan = 'Selesai / Invoice';
                } elseif ($adaSJ) {
                    $statusTiruan = 'Diproses / Surat Jalan';
                } else {
                    $statusTiruan = 'Pesanan Baru';
                }

                return [
                    'id_pesanan' => $order->id_pesanan,
                    'no_pesanan' => $order->no_pesanan,
                    'tgl_pesanan' => $order->tgl_pesanan,
                    'id_mitra' => $order->id_mitra,
                    'nama_mitra' => $order->mitra ? $order->mitra->nama_mitra : 'Tidak Diketahui',
                    'jenis_transaksi' => $order->jenis_transaksi,
                    'alamat' => $order->alamat,
                    'total_harga' => (float) $order->total_harga,
                    'status' => $statusTiruan, // <-- Field Status Tersedia untuk Frontend
                    'sudah_ada_invoice' => $adaInvoice, // Membantu FE menonaktifkan tombol jika perlu
                    'sudah_ada_sj' => $adaSJ,           // Membantu FE menonaktifkan tombol jika perlu
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

        return redirect('/pesanan')->with('success', 'Pesanan berhasil disimpan.');
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
            $pesanan = Pesanan::findOrFail($id);
            $pesanan->update([
                'no_pesanan' => $request->nomorSO,
                'tgl_pesanan' => $request->tanggalSO,
                'id_mitra' => $request->idMitra,
                'jenis_transaksi' => $request->jenisTransaksi,
                'alamat' => $request->alamat,
                'total_harga' => $totalHarga,
            ]);

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

        return redirect('/pesanan')->with('success', 'Pesanan berhasil diperbarui.');
    }

    public function createInvoice(Request $request)
    {
        $idPesanan = $request->query('so_id');
        
        // PROTEKSI: Cek apakah data penjualan sudah ada di tabel t_jual
        $sudahAdaInvoice = DB::table('t_jual')->where('id_pesanan', $idPesanan)->exists();
        if ($sudahAdaInvoice) {
            return redirect('/pesanan')->with('error', 'Invoice gagal di-generate! Transaksi untuk pesanan ini sudah pernah dibuat sebelumnya.');
        }

        $pesanan = Pesanan::with(['mitra', 'items.produk'])->findOrFail($idPesanan);

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

public function storeInvoice(Request $request)
    {
        // 1. Validasi input form invoice kamu
        $request->validate([
            'id_pesanan'   => 'required',
            'no_invoice'   => 'required|string|max:20',
            'tgl_invoice'  => 'required|date',
            'total_harga'  => 'required|numeric',
        ]);

        // 2. Proteksi Klik Ganda
        $sudahAdaInvoice = DB::table('t_jual')->where('id_pesanan', $request->id_pesanan)->exists();
        if ($sudahAdaInvoice) {
            return redirect()->route('transaksi-penjualan.index')->with('error', 'Invoice untuk pesanan ini sudah pernah dibuat.');
        }

        DB::beginTransaction();
        try {
            // 3. Ambil data pesanan asli untuk menghitung HPP / Modal jika dibutuhkan
            $pesanan = Pesanan::with('items')->findOrFail($request->id_pesanan);

            // 4. INSERT KE TABEL INDUK (t_jual)
            $idJual = DB::table('t_jual')->insertGetId([
                'no_jual'           => $request->no_invoice,
                'tgl_jual'          => $request->tgl_invoice,
                'id_pesanan'        => $request->id_pesanan,
                'jenis_penjualan'   => 'Grosir',      
                'metode_pembayaran' => 'Tunai',       
                'subtotal'          => $request->total_harga,
                'total_diskon'      => 0,
                'total_hpp'         => 0, // Set 0 dulu agar tidak error SQL
                'grand_total'       => $request->total_harga,
                'created_at'        => now(),
                'updated_at'        => now()
            ]);

            // 5. INSERT KE TABEL DETAIL (t_detail_jual) 
            // Bagian ini WAJIB ADA agar query join di PenjualanController tidak pecah/kosong!
            foreach ($pesanan->items as $item) {
                DB::table('t_detail_jual')->insert([
                    'id_jual'     => $idJual,
                    'id_produk'   => $item->id_produk,
                    'qty_jual'    => $item->qty,
                    'hpp_satuan'  => 0, // Set default aman
                    'diskon'      => 0,
                    'subtotal'    => $item->subtotal,
                    'created_at'  => now(),
                    'updated_at'  => now()
                ]);
            }

            DB::commit();
            
            // 6. REDIRECT RESMI KE HALAMAN TRANSAKSI PENJUALAN
            return redirect()->route('transaksi-penjualan.index')->with('success', 'Transaksi Penjualan Berhasil Disimpan!');

        } catch (Exception $e) {
            DB::rollback();
            return redirect()->back()->withErrors([
                'database_error' => 'Gagal menyimpan data transaksi: ' . $e->getMessage()
            ]);
        }
    }

    public function createSuratJalan(Request $request)
    {
        $idPesanan = $request->query('so_id');
        
        // 1. Proteksi jika memang sudah ada surat jalan
        $sudahAdaSuratJalan = DB::table('t_surat_jalan')->where('id_pesanan', $idPesanan)->exists();
        if ($sudahAdaSuratJalan) {
            return redirect('/pesanan')->with('error', 'Surat Jalan untuk pesanan ini sudah pernah dibuat.');
        }
        
        // 2. --- FIX SISA ALERT MASA LALU ---
        // Jika lolos dan sukses masuk form, paksa hapus sisa flash error dari session
        $request->session()->forget('error'); 
        // Atau jika frontend-mu membaca dari key 'flash', gunakan ini:
        session()->forget('flash.error');

        $pesanan = Pesanan::with(['mitra', 'items.produk'])->findOrFail($idPesanan);

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

    public function storeSuratJalan(Request $request)
    {
        $request->validate([
            'id_pesanan'    => 'required', 
            'nama_pengirim' => 'required|string|max:50',
            'kendaraan'     => 'required|string|max:30',
            'no_plat'       => 'required|string|max:15',
        ]);

        $sudahAdaSuratJalan = DB::table('t_surat_jalan')->where('id_pesanan', $request->id_pesanan)->exists();
        if ($sudahAdaSuratJalan) {
            return redirect('/pesanan')->with('error', 'Surat Jalan sudah ada di database.');
        }

        DB::beginTransaction();
        try {
            $tanggal = date('Ymd');
            $lastId = DB::table('t_surat_jalan')->max('id_surat_jalan') ?? 0;
            $nomorUrut = str_pad($lastId + 1, 4, '0', STR_PAD_LEFT);
            $noSuratJalan = "SJ-{$tanggal}-{$nomorUrut}";

            DB::table('t_surat_jalan')->insert([
                'no_surat_jalan'   => $noSuratJalan,
                'tgl_surat_jalan'  => date('Y-m-d'),
                'id_pesanan'       => $request->id_pesanan,
                'id_konsinyasi'    => null, 
                'nama_pengirim'    => $request->nama_pengirim,
                'kendaraan'        => $request->kendaraan,
                'no_plat'          => $request->no_plat,
                'status'           => 'Diproses', 
                'created_at'       => now(),
                'updated_at'       => now()
            ]);

            DB::commit();
            
            // Diarahkan kembali ke halaman pesanan agar status langsung berubah
            return redirect('/pesanan')->with('success', 'Surat Jalan berhasil disimpan.');

        } catch (Exception $e) {
            DB::rollback();
            return redirect()->back()->withErrors([
                'database_error' => 'Gagal menyimpan Surat Jalan: ' . $e->getMessage()
            ]);
        }
    }
}
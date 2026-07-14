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
        // 1. Ambil data mitra dengan filter langsung di database
        $mitraList = Mitra::whereIn(DB::raw('LOWER(status)'), ['aktif', 'active'])
            ->orWhereNull('status')
            ->select('id_mitra', 'kode_mitra', 'nama_mitra', 'alamat')
            ->get();

        if ($mitraList->isEmpty()) {
            $mitraList = Mitra::select('id_mitra', 'kode_mitra', 'nama_mitra', 'alamat')->get();
        }

        // 2. OPTIMASI: Ambil semua harga sekaligus untuk menghindari Query N+1
        $allHarga = DB::table('t_harga_produk')
            ->select('id_harga_produk as id_harga', 'id_produk', 'jenis_transaksi', 'harga')
            ->get()
            ->groupBy('id_produk');

        // Data produk beserta daftar harganya + Mengambil saldo_qty terakhir dari kartu persediaan
        $produkList = DB::table('t_produk as p')
            ->leftJoin('t_kartu_persediaan as kp', function($join) {
                $join->on('p.id_produk', '=', 'kp.id_produk')
                     ->whereRaw('kp.id_kartu = (
                         SELECT max(id_kartu) 
                         FROM t_kartu_persediaan 
                         WHERE t_kartu_persediaan.id_produk = p.id_produk
                     )');
            })
            ->select('p.id_produk', 'p.nama_produk', 'p.kode_produk', 'p.satuan_produk', DB::raw('COALESCE(kp.saldo_qty, 0) as saldo_qty'))
            ->get()
            ->map(function ($prod) use ($allHarga) {
                return [
                    'id_produk' => $prod->id_produk,
                    'nama_produk' => $prod->nama_produk,
                    'kode_produk' => $prod->kode_produk,
                    'satuan_produk' => $prod->satuan_produk,
                    'saldo_qty' => (float) $prod->saldo_qty,
                    'harga_produk' => $allHarga->get($prod->id_produk) ?? [] // Diambil dari memori, bukan query lagi
                ];
            });

        // 3. Data daftar pesanan beserta relasi mitra & detail items
        $pesanan = Pesanan::with(['mitra', 'items.produk'])
            ->orderBy('tgl_pesanan', 'desc')
            ->get()
            ->map(function ($order) {
                
                $adaSJ = DB::table('t_surat_jalan')->where('id_pesanan', $order->id_pesanan)->exists();
                $adaInvoice = DB::table('t_jual')->where('id_pesanan', $order->id_pesanan)->exists();

                if ($adaInvoice) {
                    $statusTiruan = 'Selesai';
                } else {
                    $statusTiruan = 'Diproses';
                }

                return [
                    'id_pesanan' => $order->id_pesanan,
                    'no_pesanan' => $order->no_pesanan,
                    'tgl_pesanan' => $order->tgl_pesanan,
                    'id_mitra' => $order->id_mitra,
                    'nama_mitra' => $order->mitra ? $order->mitra->nama_mitra : 'Tidak Diketahui',
                    'jenis_transaksi' => $order->jenis_transaksi,
                    'alamat' => $order->alamat,
                    'total_diskon' => (float) ($order->total_diskon ?? 0), 
                    'total_harga' => (float) $order->total_harga,
                    'catatan' => $order->catatan,
                    'status' => $statusTiruan,
                    'sudah_ada_invoice' => $adaInvoice,
                    'status_surat_jalan' => $adaSJ, 
                    'items' => $order->items->map(function ($detail) {
                        return [
                            'id_pesanan_detail' => $detail->id_pesanan_detail,
                            'id_produk' => $detail->id_produk,
                            'id_harga' => $detail->id_harga,
                            'nama_produk' => $detail->produk ? $detail->produk->nama_produk : 'Produk Terhapus',
                            'harga' => (float) $detail->harga,
                            'qty' => $detail->qty,
                            'diskon' => (float) ($detail->diskon ?? 0), 
                            'subtotal' => (float) $detail->subtotal,
                        ];
                    }),
                ];
            });

        $tahunBulantanggal = date('Ymd');
        $lastPesanan = Pesanan::where('no_pesanan', 'like', "SO-$tahunBulantanggal-%")
            ->orderBy('id_pesanan', 'desc')
            ->first();

        if (!$lastPesanan) {
            $nextNomorSO = "SO-$tahunBulantanggal-001";
        } else {
            $lastNumber = (int) substr($lastPesanan->no_pesanan, -3);
            $nextNomorSO = "SO-$tahunBulantanggal-" . str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
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
            'jenisTransaksi' => 'required|in:Penjualan Langsung,Konsinyasi,Maklon',
            'alamat' => 'required|string|max:100',
            'catatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id_produk' => 'required|integer|exists:t_produk,id_produk',
            'items.*.id_harga' => 'required|integer|exists:t_harga_produk,id_harga_produk',
            'items.*.harga' => 'required|numeric|min:0',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.diskon' => 'required|numeric|min:0|max:100', 
        ]);

        $totalDiskon = 0;
        $totalHargaBersih = 0;

        foreach ($request->items as $item) {
            $gross = $item['jumlah'] * $item['harga'];
            $potongan = $gross * ($item['diskon'] / 100);
            
            $totalDiskon += $potongan;
            $totalHargaBersih += ($gross - $potongan);
        }

        DB::transaction(function () use ($request, $totalDiskon, $totalHargaBersih) {
            $pesanan = Pesanan::create([
                'no_pesanan' => $request->nomorSO,
                'tgl_pesanan' => $request->tanggalSO,
                'id_mitra' => $request->idMitra,
                'jenis_transaksi' => $request->jenisTransaksi,
                'alamat' => $request->alamat,
                'total_diskon' => $totalDiskon, 
                'total_harga' => $totalHargaBersih, 
                'catatan' => $request->catatan,
            ]);

            foreach ($request->items as $item) {
                $gross = $item['jumlah'] * $item['harga'];
                $potongan = $gross * ($item['diskon'] / 100);

                PesananDetail::create([
                    'id_pesanan' => $pesanan->id_pesanan,
                    'id_produk' => $item['id_produk'],
                    'id_harga' => $item['id_harga'],
                    'harga' => $item['harga'],
                    'qty' => $item['jumlah'],
                    'diskon' => $item['diskon'], 
                    'subtotal' => $gross - $potongan, 
                ]);
            }
        });

        return redirect('/pesanan')->with('success', 'Pesanan berhasil disimpan.');
    }

    public function update(Request $request, $id)
    {
        $adaInvoice = DB::table('t_jual')->where('id_pesanan', $id)->exists();
        $adaSJ = DB::table('t_surat_jalan')->where('id_pesanan', $id)->exists();

        if ($adaInvoice || $adaSJ) {
            return redirect()->back()->with('error', '⚠️ Gagal: Pesanan tidak bisa diubah karena Invoice atau Surat Jalan sudah digenerate!');
        }

        $request->validate([
            'nomorSO' => 'required|string|max:20',
            'tanggalSO' => 'required|date',
            'idMitra' => 'required|integer|exists:t_mitra,id_mitra',
            'jenisTransaksi' => 'required|in:Penjualan Langsung,Konsinyasi,Maklon',
            'alamat' => 'required|string|max:100',
            'catatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id_produk' => 'required|integer|exists:t_produk,id_produk',
            'items.*.id_harga' => 'required|integer|exists:t_harga_produk,id_harga_produk',
            'items.*.harga' => 'required|numeric|min:0',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.diskon' => 'required|numeric|min:0|max:100', 
        ]);

        $totalDiskon = 0;
        $totalHargaBersih = 0;

        foreach ($request->items as $item) {
            $gross = $item['jumlah'] * $item['harga'];
            $potongan = $gross * ($item['diskon'] / 100);
            
            $totalDiskon += $potongan;
            $totalHargaBersih += ($gross - $potongan);
        }

        DB::transaction(function () use ($request, $id, $totalDiskon, $totalHargaBersih) {
            $pesanan = Pesanan::findOrFail($id);
            $pesanan->update([
                'no_pesanan' => $request->nomorSO,
                'tgl_pesanan' => $request->tanggalSO,
                'id_mitra' => $request->idMitra,
                'jenis_transaksi' => $request->jenisTransaksi,
                'alamat' => $request->alamat,
                'total_diskon' => $totalDiskon, 
                'total_harga' => $totalHargaBersih, 
                'catatan' => $request->catatan,
            ]);

            PesananDetail::where('id_pesanan', $id)->delete();
            
            foreach ($request->items as $item) {
                $gross = $item['jumlah'] * $item['harga'];
                $potongan = $gross * ($item['diskon'] / 100);

                PesananDetail::create([
                    'id_pesanan' => $id,
                    'id_produk' => $item['id_produk'],
                    'id_harga' => $item['id_harga'],
                    'harga' => $item['harga'],
                    'qty' => $item['jumlah'],
                    'diskon' => $item['diskon'], 
                    'subtotal' => $gross - $potongan,
                ]);
            }
         });

        return redirect('/pesanan')->with('success', 'Pesanan berhasil diperbarui.');
    }

    public function createInvoice(Request $request)
    {
        $idPesanan = $request->query('so_id');
        
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
                'jenis_penjualan' => $pesanan->jenis_transaksi,
                'total_diskon' => (float) ($pesanan->total_diskon ?? 0), 
                'total_harga' => $pesanan->total_harga,
                'catatan' => $pesanan->catatan, 
                'items' => $pesanan->items->map(function ($detail) {
                    return [
                        'nama_produk' => $detail->produk ? $detail->produk->nama_produk : 'Produk Terhapus',
                        'kode_produk' => $detail->produk ? $detail->produk->kode_produk : '',
                        'qty' => $detail->qty,
                        'harga' => $detail->harga,
                        'satuan_produk' => $detail->produk ? $detail->produk->satuan_produk : '-',
                        'diskon_persen' => $detail->diskon, 
                        'subtotal' => $detail->subtotal,
                    ];
                }),
            ]
        ]);
    }

    public function storeInvoice(Request $request)
    {
        $request->validate([
            'id_pesanan'   => 'required',
            'no_invoice'   => 'required|string|max:20',
            'tgl_invoice'  => 'required|date',
            'total_harga'  => 'required|numeric',
            'catatan'   => 'nullable|string', 
        ]);

        $sudahAdaInvoice = DB::table('t_jual')->where('id_pesanan', $request->id_pesanan)->exists();
        if ($sudahAdaInvoice) {
            return redirect()->route('transaksi-penjualan.index')->with('error', 'Invoice untuk pesanan ini sudah pernah dibuat.');
        }

        DB::beginTransaction();
        try {
            $pesanan = Pesanan::with('items')->findOrFail($request->id_pesanan);
            $catatanInvoice = $request->catatan ?? $pesanan->catatan;

            $idJual = DB::table('t_jual')->insertGetId([
                'no_jual'           => $request->no_invoice,
                'tgl_jual'          => $request->tgl_invoice,
                'id_pesanan'        => $request->id_pesanan,
                'jenis_penjualan'   => $pesanan->jenis_transaksi,      
                'metode_pembayaran' => 'Tunai',       
                'subtotal'          => $request->total_harga + ($pesanan->total_diskon ?? 0), 
                'total_diskon'      => $pesanan->total_diskon ?? 0, 
                'total_hpp'         => 0, 
                'grand_total'       => $request->total_harga, 
                'catatan'           => $catatanInvoice, 
                'created_at'        => now(),
                'updated_at'        => now()
            ]);

            foreach ($pesanan->items as $item) {
                $grossItem = $item->qty * $item->harga;
                $potonganItem = $grossItem * (($item->diskon ?? 0) / 100); 

                DB::table('t_jual_detail')->insert([
                    'id_jual'    => $idJual,
                    'id_produk'  => $item->id_produk,
                    'harga'      => $item->harga,
                    'qty_jual'   => $item->qty,
                    'hpp_satuan' => 0, 
                    'diskon'     => $potonganItem, 
                    'subtotal'   => $item->subtotal, 
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            DB::commit();
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
        
        $sudahAdaSuratJalan = DB::table('t_surat_jalan')->where('id_pesanan', $idPesanan)->exists();
        if ($sudahAdaSuratJalan) {
            return redirect('/pesanan')->with('error', 'Surat Jalan untuk pesanan ini sudah pernah dibuat.');
        }
        
        $request->session()->forget('error'); 
        session()->forget('flash.error');

        $pesanan = Pesanan::with(['mitra', 'items.produk'])->findOrFail($idPesanan);

        return Inertia::render('Penjualan/SuratJalanForm', [
            'pesanan' => [
                'id_pesanan' => $pesanan->id_pesanan,
                'no_pesanan' => $pesanan->no_pesanan,
                'nama_mitra' => $pesanan->mitra ? $pesanan->mitra->nama_mitra : 'Tidak Diketahui',
                'alamat' => $pesanan->alamat,
                'catatan' => $pesanan->catatan, 
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
            'catatan'    => 'nullable|string', 
        ]);

        $sudahAdaSuratJalan = DB::table('t_surat_jalan')->where('id_pesanan', $request->id_pesanan)->exists();
        if ($sudahAdaSuratJalan) {
            return redirect('/pesanan')->with('error', 'Surat Jalan sudah ada di database.');
        }

        DB::beginTransaction();
        try {
            $pesanan = Pesanan::findOrFail($request->id_pesanan);
            $tanggal = date('Ymd');
            $lastId = DB::table('t_surat_jalan')->max('id_surat_jalan') ?? 0;
            $nomorUrut = str_pad($lastId + 1, 4, '0', STR_PAD_LEFT);
            $noSuratJalan = "SJ-{$tanggal}-{$nomorUrut}";

            $catatanSJ = $request->catatan ?? $pesanan->catatan;

            DB::table('t_surat_jalan')->insert([
                'no_surat_jalan'   => $noSuratJalan,
                'tgl_surat_jalan'  => date('Y-m-d'),
                'id_pesanan'       => $request->id_pesanan,
                'id_konsinyasi'    => null, 
                'alamat'           => $pesanan->alamat,
                'nama_pengirim'    => $request->nama_pengirim,
                'kendaraan'        => $request->kendaraan,
                'no_plat'          => $request->no_plat,
                'status'           => 'Diproses', 
                'catatan'          => $catatanSJ, 
                'created_at'       => now(),
                'updated_at'       => now()
            ]);

            DB::commit();
            return redirect('/pesanan')->with('success', 'Surat Jalan berhasil disimpan.');

        } catch (Exception $e) {
            DB::rollback();
            return redirect()->back()->withErrors([
                'database_error' => 'Gagal menyimpan Surat Jalan: ' . $e->getMessage()
            ]);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $pesanan = Pesanan::findOrFail($id);

            $adaInvoice = DB::table('t_jual')->where('id_pesanan', $id)->exists();
            $adaSJ = DB::table('t_surat_jalan')->where('id_pesanan', $id)->exists();

            if ($adaInvoice || $adaSJ) {
                return redirect()->back()->with('error', 'Pesanan tidak bisa dihapus karena sudah diproses menjadi Surat Jalan atau Invoice!');
            }

            PesananDetail::where('id_pesanan', $id)->delete();
            $pesanan->delete();

            DB::commit();
            return redirect('/pesanan')->with('success', 'Pesanan berhasil dihapus.');

        } catch (Exception $e) {
            DB::rollback();
            return redirect()->back()->withErrors([
                'database_error' => 'Gagal menghapus pesanan: ' . $e->getMessage()
            ]);
        }
    }
}
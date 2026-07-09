<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ReturJual;
use App\Services\InventoryService;
use App\Models\ReturJualDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Exception;

class ReturJualController extends Controller
{
    public function index()
    {
        // 1. Ambil data list riwayat retur di halaman utama
        //MENGGUNAKAN leftJoin agar data retur baru tetap paksa muncul di halaman utama meskipun relasi tabel lain belum sinkron
        $listRetur = ReturJual::leftJoin('t_jual', 't_retur_jual.id_jual', '=', 't_jual.id_jual')
            ->leftJoin('t_pesanan', 't_jual.id_pesanan', '=', 't_pesanan.id_pesanan')
            ->leftJoin('t_mitra', 't_pesanan.id_mitra', '=', 't_mitra.id_mitra')
            ->select([
                't_retur_jual.*',
                't_jual.no_jual',
                't_mitra.nama_mitra as pelanggan'
            ])
            ->orderBy('t_retur_jual.id_retur_jual', 'desc')
            ->get();

        // Ambil semua item detail untuk riwayat retur di atas sekaligus (Eager Loading)
        $returIds = $listRetur->pluck('id_retur_jual')->toArray();
        $allReturDetails = DB::table('t_retur_jual_detail')
            ->join('t_produk', 't_retur_jual_detail.id_produk', '=', 't_produk.id_produk')
            ->whereIn('t_retur_jual_detail.id_retur_jual', $returIds)
            ->select([
                't_retur_jual_detail.*',
                't_produk.nama_produk'
            ])
            ->get()
            ->groupBy('id_retur_jual');

        // Gabungkan detail retur ke objek induknya
        $listReturFormatted = $listRetur->map(function ($rt) use ($allReturDetails) {
            $items = $allReturDetails->get($rt->id_retur_jual) ?: collect([]);
            $rt->items = $items->map(function ($item) {
                return [
                    'id_produk'     => $item->id_produk,
                    'produk'        => $item->nama_produk,
                    'qty'           => $item->qty,
                    'kondisiBarang' => $item->kondisi_barang,
                    'keterangan'    => $item->keterangan ?? '',
                    'harga'         => (float) ($item->harga ?? 0), // Diambil dari field harga nominal langsung di t_retur_jual_detail
                    'subtotal'      => (float) $item->subtotal
                ];
            })->values();
            return $rt;
        });

        // 2. Ambil data list invoice asal untuk modal/form input
        $listInvoice = DB::table('t_jual')
            ->leftJoin('t_pesanan', 't_jual.id_pesanan', '=', 't_pesanan.id_pesanan')
            ->leftJoin('t_mitra', 't_pesanan.id_mitra', '=', 't_mitra.id_mitra')
            ->select([
                't_jual.id_jual',
                't_jual.no_jual',
                't_jual.grand_total',
                't_mitra.nama_mitra as pelanggan'
            ])
            ->orderBy('t_jual.id_jual', 'desc')
            ->get();

        //EAGER LOADING SELESAI: Query dibersihkan total dari t_pesanan_detail karena harga sudah ada langsung di t_jual_detail
        $invoiceIds = $listInvoice->pluck('id_jual')->toArray();
        $allInvoiceItems = DB::table('t_jual_detail')
            ->join('t_produk', 't_jual_detail.id_produk', '=', 't_produk.id_produk')
            ->whereIn('t_jual_detail.id_jual', $invoiceIds)
            ->select([
                't_jual_detail.id_jual',
                't_jual_detail.id_produk',
                't_produk.nama_produk',
                't_jual_detail.qty_jual as qty_terjual',
                't_jual_detail.harga as harga_satuan' // Ambil langsung dari field harga baru t_jual_detail kamu
            ])
            ->get()
            ->groupBy('id_jual');

        // Satukan item produk ke dalam masing-masing invoice penampungnya
        $listInvoiceFormatted = $listInvoice->map(function($inv) use ($allInvoiceItems) {
            $items = $allInvoiceItems->get($inv->id_jual) ?: collect([]);
            $inv->invoice_items = $items->map(function($item) {
                return [
                    'id_produk'    => $item->id_produk,
                    'nama_produk'  => $item->nama_produk,
                    'qty_terjual'  => $item->qty_terjual,
                    'harga_satuan' => $item->harga_satuan
                ];
            })->values();
            return $inv;
        });

        // 3. Generate Nomor Retur Otomatis
        $tahun = Carbon::now()->format('Y');
        $totalRetur = ReturJual::whereYear('tgl_retur_jual', $tahun)->count();
        $nextUrutan = $totalRetur + 1;
        $nomorUrutPad = str_pad($nextUrutan, 4, '0', STR_PAD_LEFT);
        $noReturOtomatis = "RTJ-{$tahun}-{$nomorUrutPad}";

        return Inertia::render('Penjualan/ReturJual', [
            'listRetur'       => $listReturFormatted,
            'listInvoice'     => $listInvoiceFormatted,
            'noReturOtomatis' => $noReturOtomatis
        ]);
    }

    public function store(Request $request)
{
    $request->validate([
        'id_jual'          => 'required',
        'tgl_retur_jual'   => 'required|date',
        'items'            => 'required|array',
    ]);

    DB::beginTransaction();
    try {
        $noRetur = $request->no_retur_jual ?? ('RTJ-' . date('Ymd') . '-' . rand(100, 999));

        // 1. Simpan ke tabel induk t_retur_jual
        $idReturJual = DB::table('t_retur_jual')->insertGetId([
            'no_retur_jual'   => $noRetur,
            'tgl_retur_jual'  => $request->tgl_retur_jual,
            'id_jual'         => $request->id_jual,
            'subtotal'        => $request->subtotal ?? 0,
            'total_hpp'       => 0, // Akan diupdate setelah loop
            'total_perbaikan' => $request->total_perbaikan ?? 0,
            'total_kerugian'  => $request->total_kerugian ?? 0,
            'grand_total'     => $request->grand_total ?? 0,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        $totalHppRetur = 0;

        // 2. Loop Detail Retur
        foreach ($request->items as $item) {

            // Lacak HPP asli dari penjualan sebelumnya
            $jualDetail = DB::table('t_jual_detail')
                ->where('id_jual', $request->id_jual)
                ->where('id_produk', $item['id_produk'])
                ->first();

            $hppSatuanAsli = $jualDetail ? (float) $jualDetail->hpp_satuan : 0;
            $subtotalHppItem = $hppSatuanAsli * $item['qty_retur'];

            // 3. Simpan ke tabel t_retur_jual_detail
            DB::table('t_retur_jual_detail')->insert([
                'id_retur_jual'   => $idReturJual,
                'id_produk'       => $item['id_produk'],
                'harga'           => $item['harga'],
                'hpp'             => $hppSatuanAsli,
                'qty'             => $item['qty_retur'],
                'subtotal'        => $item['subtotal_retur'],
                'kondisi_barang'  => $item['kondisi_barang'],
                'biaya_perbaikan' => $item['biaya_perbaikan'] ?? 0,
                'nilai_kerugian'  => $item['nilai_kerugian'] ?? 0,
                'keterangan'      => $item['keterangan'] ?? null,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);

            // 4. HUBUNGKAN KE KARTU PERSEDIAAN (Jika Layak ATAU Perbaikan)
            if (in_array($item['kondisi_barang'], ['Layak', 'Perbaikan'])) {
                $totalHppRetur += $subtotalHppItem;

                \App\Services\InventoryService::catatMutasi(
                    $item['id_produk'],
                    'produk',
                    'MASUK',
                    'retur_penjualan',
                    $noRetur,
                    $item['qty_retur'],
                    $hppSatuanAsli, // Menggunakan HPP saat barang keluar
                    $request->tgl_retur_jual,
                    "Retur Penjualan (" . $item['kondisi_barang'] . ") dari Invoice: " . $noRetur
                );
            }
            // Jika kondisi 'Rusak', otomatis diabaikan dari Kartu Persediaan
        }

        // 5. Update total_hpp di tabel induk
        DB::table('t_retur_jual')->where('id_retur_jual', $idReturJual)->update([
            'total_hpp' => $totalHppRetur
        ]);

        DB::commit();
        return redirect()->route('retur-penjualan.index')->with('success', 'Retur penjualan berhasil disimpan.');

    } catch (Exception $e) {
        DB::rollback();
        return redirect()->back()->with('error', 'Gagal simpan retur: ' . $e->getMessage());
    }
}
    }


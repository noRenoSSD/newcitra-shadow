<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ReturJual;
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
            'id_jual'    => 'required|integer',
            'grand_total'=> 'required|numeric',
            'items'      => 'required|array|min:1',
        ]);

        DB::beginTransaction();
        try {
            $tahun = Carbon::now()->format('Y');
            $totalRetur = ReturJual::whereYear('tgl_retur_jual', $tahun)->count();
            $noReturOtomatis = "RTJ-{$tahun}-" . str_pad($totalRetur + 1, 4, '0', STR_PAD_LEFT);

            // Simpan Induk Retur
            $retur = ReturJual::create([
                'no_retur_jual'   => $noReturOtomatis,
                'tgl_retur_jual'  => Carbon::now()->toDateString(),
                'id_jual'         => $request->id_jual,
                'subtotal'        => $request->subtotal,
                'ppn'             => 0,
                'total_perbaikan' => $request->total_perbaikan,
                'total_kerugian'  => $request->total_kerugian,
                'grand_total'     => $request->grand_total,
            ]);

            // Simpan Detail Retur
            foreach ($request->items as $item) {
                ReturJualDetail::create([
                    'id_retur_jual'   => $retur->id_retur_jual,
                    'id_produk'       => $item['id_produk'],
                    'harga'           => $item['harga'], // Menyimpan nominal harga langsung
                    'qty'             => $item['qty_retur'],
                    'subtotal'        => $item['subtotal_retur'],
                    'kondisi_barang'  => $item['kondisi_barang'],
                    'biaya_perbaikan' => $item['biaya_perbaikan'] ?? 0,
                    'nilai_kerugian'  => $item['nilai_kerugian'] ?? 0,
                    'keterangan'      => $item['keterangan'],
                ]);
            }

            DB::commit();
            // Pastikan nama route ini sudah sesuai dengan route list kamu (web.php)
            return redirect()->route('retur-penjualan.index')->with('success', 'Retur penjualan berhasil disimpan.');

        } catch (Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Gagal simpan retur: ' . $e->getMessage());
        }
    }
}
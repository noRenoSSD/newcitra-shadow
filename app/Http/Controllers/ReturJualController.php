<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ReturJual;     
use App\Models\ReturJualDetail;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Exception;

class ReturJualController extends Controller
{
    // 1. Menampilkan Daftar Riwayat Retur Penjualan
    public function index()
    {
        // Menggunakan model ReturJual untuk ambil data dan join ke t_jual
        $listRetur = ReturJual::join('t_jual', 't_retur_jual.id_jual', '=', 't_jual.id_jual')
            ->select('t_retur_jual.*', 't_jual.no_jual')
            ->orderBy('t_retur_jual.id_retur_jual', 'desc')
            ->get()
            ->map(function ($retur) {
                return [
                    'id_retur_jual'   => $retur->id_retur_jual,
                    'no_retur_jual'   => $retur->no_retur_jual,
                    'tgl_retur_jual'  => $retur->tgl_retur_jual,
                    'no_jual'         => $retur->no_jual,
                    'grand_total'     => (float) $retur->grand_total,
                    'total_kerugian'  => (float) $retur->total_kerugian,
                    'total_perbaikan' => (float) $retur->total_perbaikan,
                ];
            });

        // Ambil list invoice untuk pilihan di frontend
        $listInvoice = DB::table('t_jual')
            ->select('id_jual', 'no_jual', 'grand_total')
            ->orderBy('id_jual', 'desc')
            ->get();

        // LOGIKA AUTOFILL NOMOR URUT (Contoh format: RTJ-2026-0001)
        $tahun = Carbon::now()->format('Y');
        $totalRetur = ReturJual::whereYear('tgl_retur_jual', $tahun)->count();
        $nextUrutan = $totalRetur + 1;
        $nomorUrutPad = str_pad($nextUrutan, 4, '0', STR_PAD_LEFT);
        $noReturOtomatis = "RTJ-{$tahun}-{$nomorUrutPad}";

        return Inertia::render('Penjualan/ReturJual', [
            'listRetur'       => $listRetur,
            'listInvoice'     => $listInvoice,
            'noReturOtomatis' => $noReturOtomatis //Kirim nomor otomatis ke React
        ]);
    }

    // 2. Ambil detail produk dari invoice terpilih (via Axios/Fetch)
    public function getInvoiceItems($id_jual)
    {
        $items = DB::table('t_detail_jual')
            ->join('t_produk', 't_detail_jual.id_produk', '=', 't_produk.id_produk')
            ->where('t_detail_jual.id_jual', $id_jual)
            ->select('t_detail_jual.*', 't_produk.nama_produk')
            ->get();

        return response()->json($items);
    }

    // 3. Eksekusi Simpan Data Menggunakan Model Eloquent
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            //LOGIKA AUTOFILL NOMOR URUT SAAT SIMPAN (Biar tidak acak / rand lagi)
            $tahun = Carbon::now()->format('Y');
            $totalRetur = ReturJual::whereYear('tgl_retur_jual', $tahun)->count();
            $nextUrutan = $totalRetur + 1;
            $nomorUrutPad = str_pad($nextUrutan, 4, '0', STR_PAD_LEFT);
            $noRetur = "RTJ-{$tahun}-{$nomorUrutPad}";

            // Simpan data induk menggunakan Model ReturJual
            $retur = ReturJual::create([
                'no_retur_jual'   => $noRetur,
                'tgl_retur_jual'  => date('Y-m-d'),
                'id_jual'         => $request->id_jual,
                'subtotal'        => $request->subtotal ?? 0,
                'ppn'             => $request->ppn ?? 0,
                'total_perbaikan' => $request->total_perbaikan ?? 0,
                'total_kerugian'  => $request->total_kerugian ?? 0,
                'grand_total'     => $request->grand_total ?? 0,
            ]);

            // Simpan data detail menggunakan Model ReturJualDetail
            $items = $request->items; 
            foreach ($items as $item) {
                if (($item['qty_retur'] ?? 0) > 0) {
                    ReturJualDetail::create([
                        'id_retur_jual'     => $retur->id_retur_jual, 
                        'id_produk'         => $item['id_produk'],
                        'id_harga'          => $item['id_harga'],
                        'qty'               => $item['qty_retur'],
                        'subtotal'          => $item['subtotal_retur'] ?? 0,
                        'kondisi_barang'    => $item['kondisi_barang'] ?? 'Layak',
                        'biaya_perbaikan'   => $item['biaya_perbaikan'] ?? 0,
                        'nilai_kerugian'    => $item['nilai_kerugian'] ?? 0,
                        'keterangan'        => $item['keterangan'] ?? '',
                    ]);
                }
            }

            DB::commit();
            return redirect('/retur-penjualan')->with('success', 'Retur penjualan berhasil disimpan!');

        } catch (Exception $e) {
            DB::rollback();
            return back()->with('error', 'Gagal simpan retur: ' . $e->getMessage());
        }
    }
}
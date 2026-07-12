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

        // Ambil semua item detail untuk riwayat retur (Eager Loading)
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

        $listReturFormatted = $listRetur->map(function ($rt) use ($allReturDetails) {
            $items = $allReturDetails->get($rt->id_retur_jual) ?: collect([]);
            $rt->items = $items->map(function ($item) {
                return [
                    'id_produk'     => $item->id_produk,
                    'produk'        => $item->nama_produk,
                    'qty'           => $item->qty,
                    'kondisiBarang' => $item->kondisi_barang,
                    'keterangan'    => $item->keterangan ?? '',
                    'harga'         => (float) ($item->harga ?? 0),
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

        $invoiceIds = $listInvoice->pluck('id_jual')->toArray();
        $allInvoiceItems = DB::table('t_jual_detail')
            ->join('t_produk', 't_jual_detail.id_produk', '=', 't_produk.id_produk')
            ->whereIn('t_jual_detail.id_jual', $invoiceIds)
            ->select([
                't_jual_detail.id_jual',
                't_jual_detail.id_produk',
                't_produk.nama_produk',
                't_jual_detail.qty_jual as qty_terjual',
                't_jual_detail.harga as harga_satuan'
            ])
            ->get()
            ->groupBy('id_jual');

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

                    InventoryService::catatMutasi(
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

            // =================================================================
            // 6. OTOMATISASI JURNAL RETUR PENJUALAN
            // =================================================================
            
            // Pemetaan Kode Akun
            $kodeReturPenjualan = '4001005';
            $kodeKas            = '1001001'; // Kas Tunai 
            $kodePiutang        = '1001003';
            $kodePersediaanJadi = '1001006';
            $kodeHPP            = '5001001';
            $kodeBebanPerbaikan = '6001007';
            $kodeBebanKerusakan = '6001006';

            // Ambil ID Akun dari DB
            $idAkunReturJual = DB::table('t_akun')->where('kode_akun', $kodeReturPenjualan)->value('id_akun');
            $idAkunKas       = DB::table('t_akun')->where('kode_akun', $kodeKas)->value('id_akun');
            $idAkunPiutang   = DB::table('t_akun')->where('kode_akun', $kodePiutang)->value('id_akun');
            $idAkunBdgJadi   = DB::table('t_akun')->where('kode_akun', $kodePersediaanJadi)->value('id_akun');
            $idAkunHPP       = DB::table('t_akun')->where('kode_akun', $kodeHPP)->value('id_akun');
            $idAkunPerbaikan = DB::table('t_akun')->where('kode_akun', $kodeBebanPerbaikan)->value('id_akun');
            $idAkunKerusakan = DB::table('t_akun')->where('kode_akun', $kodeBebanKerusakan)->value('id_akun');

            // Cek Riwayat Pembayaran Penjualan Asli (Tunai atau Kredit)
            $penjualanAsli = DB::table('t_jual')->where('id_jual', $request->id_jual)->first();
            $isTunai = $penjualanAsli && (strtolower($penjualanAsli->metode_pembayaran) === 'tunai' || strtolower($penjualanAsli->metode_pembayaran) === 'cash');
            $idAkunPembayaran = $isTunai ? $idAkunKas : $idAkunPiutang;

            // Rekap Variabel Nominal
            $grandTotalRetur = $request->grand_total ?? 0;
            $totalPerbaikan  = $request->total_perbaikan ?? 0;
            $totalKerugian   = $request->total_kerugian ?? 0;

            if ($grandTotalRetur > 0 || $totalHppRetur > 0 || $totalPerbaikan > 0 || $totalKerugian > 0) {
                // A. Buat Header Jurnal
                $idJurnal = DB::table('t_jurnal')->insertGetId([
                    'kode_jurnal'    => 'JU-RJ' . date('ymd') . rand(100, 999),
                    'tanggal'        => $request->tgl_retur_jual,
                    'keterangan'     => 'Retur Penjualan (Ref: ' . $noRetur . ')',
                    'jenis_jurnal'   => 'umum',
                    'kode_referensi' => $noRetur,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                // B. JURNAL 1: PEMBATALAN PENJUALAN (Semua Kondisi Barang)
                if ($grandTotalRetur > 0 && $idAkunReturJual && $idAkunPembayaran) {
                    // Debit: Retur Penjualan
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal'  => $idJurnal, 'id_akun' => $idAkunReturJual, 'debit' => $grandTotalRetur, 'kredit' => 0, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                    // Kredit: Kas / Piutang Usaha
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal'  => $idJurnal, 'id_akun' => $idAkunPembayaran, 'debit' => 0, 'kredit' => $grandTotalRetur, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                }

                // C. JURNAL 2: PENGEMBALIAN PERSEDIAAN (Hanya untuk Layak & Perbaikan)
                if ($totalHppRetur > 0 && $idAkunBdgJadi && $idAkunHPP) {
                    // Debit: Persediaan Barang Jadi
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal'  => $idJurnal, 'id_akun' => $idAkunBdgJadi, 'debit' => $totalHppRetur, 'kredit' => 0, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                    // Kredit: Harga Pokok Penjualan
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal'  => $idJurnal, 'id_akun' => $idAkunHPP, 'debit' => 0, 'kredit' => $totalHppRetur, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                }

                // D. JURNAL 3: BIAYA PERBAIKAN PRODUK (LANGSUNG POTONG KAS)
                if ($totalPerbaikan > 0 && $idAkunPerbaikan && $idAkunKas) {
                    // Debit: Beban Perbaikan Produk
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal'  => $idJurnal, 'id_akun' => $idAkunPerbaikan, 'debit' => $totalPerbaikan, 'kredit' => 0, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                    // Kredit: Kas 
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal'  => $idJurnal, 'id_akun' => $idAkunKas, 'debit' => 0, 'kredit' => $totalPerbaikan, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                }

                // E. JURNAL 4: BARANG TIDAK LAYAK (RUSAK)
                // KEMBALI KE INSTRUKSI ASLI USER: Kredit Persediaan Barang Jadi
                if ($totalKerugian > 0 && $idAkunKerusakan && $idAkunBdgJadi) {
                    // Debit: Beban Kerusakan Barang
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal'  => $idJurnal, 'id_akun' => $idAkunKerusakan, 'debit' => $totalKerugian, 'kredit' => 0, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                    // Kredit: Persediaan Barang Jadi
                    DB::table('t_jurnal_detail')->insert([
                        'id_jurnal'  => $idJurnal, 'id_akun' => $idAkunBdgJadi, 'debit' => 0, 'kredit' => $totalKerugian, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('retur-penjualan.index')->with('success', 'Retur penjualan dan Jurnal berhasil disimpan.');

        } catch (Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Gagal simpan retur: ' . $e->getMessage());
        }
    }
}
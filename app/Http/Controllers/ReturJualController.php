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

    // Ambil semua item detail untuk riwayat retur
    $returIds = $listRetur->pluck('id_retur_jual')->toArray();
    $allReturDetails = DB::table('t_retur_jual_detail')
        ->join('t_produk', 't_retur_jual_detail.id_produk', '=', 't_produk.id_produk')
        ->whereIn('t_retur_jual_detail.id_retur_jual', $returIds)
        ->select([
            't_retur_jual_detail.*',
            't_produk.nama_produk',
            't_produk.kode_produk',    
            't_produk.satuan_produk'   
        ])
        ->get()
        ->groupBy('id_retur_jual');

    // UBAH KE PLAIN ARRAY: Menghindari konflik dengan relasi Eloquent
    $listReturFormatted = $listRetur->map(function ($rt) use ($allReturDetails) {
        $items = $allReturDetails->get($rt->id_retur_jual) ?: collect([]);
        
        return [
            'id_retur_jual'   => $rt->id_retur_jual,
            'no_retur_jual'   => $rt->no_retur_jual,
            'tgl_retur_jual'  => $rt->tgl_retur_jual,
            'id_jual'         => $rt->id_jual,
            'no_jual'         => $rt->no_jual,
            'pelanggan'       => $rt->pelanggan,
            'subtotal'        => (float) $rt->subtotal,
            'total_perbaikan' => (float) $rt->total_perbaikan,
            'total_kerugian'  => (float) $rt->total_kerugian,
            'grand_total'     => (float) $rt->grand_total,
            'created_at'      => $rt->created_at,
            'items'           => $items->map(function ($item) {
                return [
                    'id_produk'     => $item->id_produk,
                    'kode_produk'   => $item->kode_produk ?? '',    
                    'produk'        => $item->nama_produk,
                    'qty'           => $item->qty,
                    'satuan_produk' => $item->satuan_produk ?? '-', 
                    'kondisiBarang' => $item->kondisi_barang,
                    'keterangan'    => $item->keterangan ?? '',
                    'harga'         => (float) ($item->harga ?? 0),
                    'subtotal'      => (float) $item->subtotal
                ];
            })->values()->toArray() // Pastikan jadi array murni
        ];
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
        
        return [
            'id_jual'       => $inv->id_jual,
            'no_jual'       => $inv->no_jual,
            'grand_total'   => (float) $inv->grand_total,
            'pelanggan'     => $inv->pelanggan,
            'invoice_items' => $items->map(function($item) {
                return [
                    'id_produk'    => $item->id_produk,
                    'nama_produk'  => $item->nama_produk,
                    'qty_terjual'  => $item->qty_terjual,
                    'harga_satuan' => (float) $item->harga_satuan
                ];
            })->values()->toArray()
        ];
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
            'id_jual'        => 'required',
            'tgl_retur_jual' => 'required|date',
            'items'          => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            $noRetur = $request->no_retur_jual ?? ('RTJ-' . date('Ymd') . '-' . rand(100, 999));
            $grandTotalRetur = $request->grand_total ?? 0;

            // 1. Simpan ke tabel induk t_retur_jual
            $idReturJual = DB::table('t_retur_jual')->insertGetId([
                'no_retur_jual'   => $noRetur,
                'tgl_retur_jual'  => $request->tgl_retur_jual,
                'id_jual'         => $request->id_jual,
                'subtotal'        => $request->subtotal ?? 0,
                'total_hpp'       => 0, // Akan diupdate setelah loop
                'total_perbaikan' => $request->total_perbaikan ?? 0,
                'total_kerugian'  => $request->total_kerugian ?? 0,
                'grand_total'     => $grandTotalRetur,
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

                // Penyelarasan Kondisi Barang Rusak/Tidak Layak
                $kondisi = $item['kondisi_barang'];
                if ($kondisi === 'Tidak Layak') {
                    $kondisi = 'Rusak';
                }

                $biayaPerbaikanItem = 0;
                $nilaiKerugianItem  = 0;

                if ($kondisi === 'Perbaikan') {
                    $biayaPerbaikanItem = isset($item['biaya_perbaikan']) ? (float) $item['biaya_perbaikan'] : 0;
                } elseif ($kondisi === 'Rusak') {
                    $nilaiKerugianItem = $subtotalHppItem;
                }

                // 3. Simpan ke tabel t_retur_jual_detail
                DB::table('t_retur_jual_detail')->insert([
                    'id_retur_jual'   => $idReturJual,
                    'id_produk'       => $item['id_produk'],
                    'harga'           => $item['harga'],
                    'hpp'             => $hppSatuanAsli,
                    'qty'             => $item['qty_retur'],
                    'subtotal'        => $item['subtotal_retur'],
                    'kondisi_barang'  => $kondisi,
                    'biaya_perbaikan' => $biayaPerbaikanItem,
                    'nilai_kerugian'  => $nilaiKerugianItem,
                    'keterangan'      => $item['keterangan'] ?? null,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);

                // 4. HUBUNGKAN KE KARTU PERSEDIAAN
                if (in_array($item['kondisi_barang'], ['Layak', 'Perbaikan'])) {
                    $totalHppRetur += $subtotalHppItem;

                    InventoryService::catatMutasi(
                        $item['id_produk'],
                        'produk',
                        'MASUK',
                        'retur_penjualan',
                        $noRetur,
                        $item['qty_retur'],
                        $hppSatuanAsli,
                        $request->tgl_retur_jual,
                        "Retur Penjualan (" . $item['kondisi_barang'] . ") dari Invoice: " . $noRetur
                    );
                }
            } // <--- BATAS AKHIR LOOP ITEM DETAIL

            // 5. Update total_hpp di tabel induk
            DB::table('t_retur_jual')->where('id_retur_jual', $idReturJual)->update([
                'total_hpp' => $totalHppRetur
            ]);

            // 6. LOGIKA OTOMATIS POTONG PIUTANG
            $penjualanAsli = DB::table('t_jual')->where('id_jual', $request->id_jual)->first();

            if ($penjualanAsli) {
                $metode = strtolower($penjualanAsli->metode_pembayaran);
                
                if (str_contains($metode, 'kredit') || str_contains($metode, 'tempo')) {
                    $piutang = DB::table('t_piutang')->where('id_jual', $request->id_jual)->first();
                    
                    if ($piutang) {
                        // Kurangi sisa piutang sebesar grand total retur
                        DB::table('t_piutang')
                            ->where('id_jual', $request->id_jual)
                            ->decrement('sisa_piutang', $grandTotalRetur);
                            
                        // Cek sisa terbaru pasca-decrement
                        $sisaTerbaru = DB::table('t_piutang')->where('id_jual', $request->id_jual)->value('sisa_piutang');
                        if ($sisaTerbaru <= 0) {
                            DB::table('t_piutang')
                                ->where('id_jual', $request->id_jual)
                                ->update(['status' => 'Lunas', 'sisa_piutang' => 0]);
                        }
                    }
                }
            }

            // 7. OTOMATISASI JURNAL RETUR PENJUALAN
            $kodeReturPenjualan = '4001005';
            $kodeKas            = '1001001'; 
            $kodePiutang        = '1001003';
            $kodePersediaanJadi = '1001006';
            $kodeHPP            = '5001001';
            $kodeBebanPerbaikan = '6001007';
            $kodeBebanKerusakan = '6001006';

            $idAkunReturJual = DB::table('t_akun')->where('kode_akun', $kodeReturPenjualan)->value('id_akun');
            $idAkunKas       = DB::table('t_akun')->where('kode_akun', $kodeKas)->value('id_akun');
            $idAkunPiutang   = DB::table('t_akun')->where('kode_akun', $kodePiutang)->value('id_akun');
            $idAkunBdgJadi   = DB::table('t_akun')->where('kode_akun', $kodePersediaanJadi)->value('id_akun');
            $idAkunHPP       = DB::table('t_akun')->where('kode_akun', $kodeHPP)->value('id_akun');
            $idAkunPerbaikan = DB::table('t_akun')->where('kode_akun', $kodeBebanPerbaikan)->value('id_akun');
            $idAkunKerusakan = DB::table('t_akun')->where('kode_akun', $kodeBebanKerusakan)->value('id_akun');

            $isTunai = $penjualanAsli && (strtolower($penjualanAsli->metode_pembayaran) === 'tunai' || strtolower($penjualanAsli->metode_pembayaran) === 'cash');
            $idAkunPembayaran = $isTunai ? $idAkunKas : $idAkunPiutang;

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

                // B. JURNAL 1: PEMBATALAN PENJUALAN
                if ($grandTotalRetur > 0 && $idAkunReturJual && $idAkunPembayaran) {
                    DB::table('t_jurnal_detail')->insert([
                        ['id_jurnal' => $idJurnal, 'id_akun' => $idAkunReturJual, 'debit' => $grandTotalRetur, 'kredit' => 0, 'created_at' => now(), 'updated_at' => now()],
                        ['id_jurnal' => $idJurnal, 'id_akun' => $idAkunPembayaran, 'debit' => 0, 'kredit' => $grandTotalRetur, 'created_at' => now(), 'updated_at' => now()]
                    ]);
                }

                // C. JURNAL 2: PENGEMBALIAN PERSEDIAAN
                if ($totalHppRetur > 0 && $idAkunBdgJadi && $idAkunHPP) {
                    DB::table('t_jurnal_detail')->insert([
                        ['id_jurnal' => $idJurnal, 'id_akun' => $idAkunBdgJadi, 'debit' => $totalHppRetur, 'kredit' => 0, 'created_at' => now(), 'updated_at' => now()],
                        ['id_jurnal' => $idJurnal, 'id_akun' => $idAkunHPP, 'debit' => 0, 'kredit' => $totalHppRetur, 'created_at' => now(), 'updated_at' => now()]
                    ]);
                }

                // D. JURNAL 3: BIAYA PERBAIKAN PRODUK
                if ($totalPerbaikan > 0 && $idAkunPerbaikan && $idAkunKas) {
                    DB::table('t_jurnal_detail')->insert([
                        ['id_jurnal' => $idJurnal, 'id_akun' => $idAkunPerbaikan, 'debit' => $totalPerbaikan, 'kredit' => 0, 'created_at' => now(), 'updated_at' => now()],
                        ['id_jurnal' => $idJurnal, 'id_akun' => $idAkunKas, 'debit' => 0, 'kredit' => $totalPerbaikan, 'created_at' => now(), 'updated_at' => now()]
                    ]);
                }

                // E. JURNAL 4: BARANG RUSAK
                if ($totalKerugian > 0 && $idAkunKerusakan && $idAkunBdgJadi) {
                    DB::table('t_jurnal_detail')->insert([
                        ['id_jurnal' => $idJurnal, 'id_akun' => $idAkunKerusakan, 'debit' => $totalKerugian, 'kredit' => 0, 'created_at' => now(), 'updated_at' => now()],
                        ['id_jurnal' => $idJurnal, 'id_akun' => $idAkunBdgJadi, 'debit' => 0, 'kredit' => $totalKerugian, 'created_at' => now(), 'updated_at' => now()]
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('retur-penjualan.index')->with('success', 'Retur penjualan, pemotongan piutang, dan Jurnal berhasil disimpan.');

        } catch (Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Gagal simpan retur: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            // 1. Ambil data induk retur
            $retur = DB::table('t_retur_jual')->where('id_retur_jual', $id)->first();

            if (!$retur) {
                return redirect()->back()->with('error', 'Data retur tidak ditemukan di database.');
            }

            // 2. KEMBALIKAN SALDO PIUTANG
            $penjualanAsli = DB::table('t_jual')->where('id_jual', $retur->id_jual)->first();
            if ($penjualanAsli) {
                $metode = strtolower($penjualanAsli->metode_pembayaran);
                if (str_contains($metode, 'kredit') || str_contains($metode, 'tempo')) {
                    DB::table('t_piutang')
                        ->where('id_jual', $retur->id_jual)
                        ->increment('sisa_piutang', $retur->grand_total);
                }
            }

            // 3. SESUAIKAN KEMBALIKAN KARTU PERSEDIAAN
            $returDetails = DB::table('t_retur_jual_detail')
                ->where('id_retur_jual', $id)
                ->get();

            foreach ($returDetails as $item) {
                if (in_array($item->kondisi_barang, ['Layak', 'Perbaikan'])) {
                    InventoryService::catatMutasi(
                        $item->id_produk,
                        'produk',
                        'KELUAR',
                        'retur_penjualan', 
                        $retur->no_retur_jual,
                        $item->qty,
                        $item->hpp,
                        now()->format('Y-m-d'),
                        "Pembatalan/Hapus Retur (" . $item->kondisi_barang . ") Ref: " . $retur->no_retur_jual
                    );
                }
            }

            // 4. HAPUS JURNAL AKUNTANSI
            $jurnal = DB::table('t_jurnal')->where('kode_referensi', $retur->no_retur_jual)->first();
            if ($jurnal) {
                DB::table('t_jurnal_detail')->where('id_jurnal', $jurnal->id_jurnal)->delete();
                DB::table('t_jurnal')->where('id_jurnal', $jurnal->id_jurnal)->delete();
            }

            // 5. HAPUS DETAIL DAN INDUK RETUR
            DB::table('t_retur_jual_detail')->where('id_retur_jual', $id)->delete();
            DB::table('t_retur_jual')->where('id_retur_jual', $id)->delete();

            DB::commit();
            return redirect()->route('retur-penjualan.index')->with('success', 'Data retur berhasil dihapus secara permanen.');

        } catch (Exception $e) {
            DB::rollback();
            dd("Gagal menghapus! Terjadi Error: " . $e->getMessage(), $e->getTraceAsString());
        }
    }

    public function print($id)
    {
        $retur = ReturJual::with('items')->findOrFail($id);
        return view('retur.print', compact('retur'));
    }
}
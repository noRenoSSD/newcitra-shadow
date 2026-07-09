<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Carbon\Carbon;
use Exception;

class HargaPokokProduksiController extends Controller
{

    public function index()
    {
        // 1. Tarik Master Divisi (Untuk dropdown tenaga kerja)
        $masterDivisi = DB::table('t_divisi')->pluck('nama_divisi')->toArray();

        // 2. Tarik Master Overhead (Jika tabelnya ada, tarik default biayanya)
        $masterOverhead = [];
        if (Schema::hasTable('t_overhead')) {
             $masterOverhead = DB::table('t_overhead')
                ->select('nama_overhead')
                ->get()
                ->map(function($item) {
                    return [
                        'nama_overhead' => $item->nama_overhead,
                        'biaya'         => 0
                    ];
                })->toArray();
        }

        $qtyColumn = 'hp.output_aktual as qty_rencana';

        // 3. INI LOGIC KUNCINYA: Tarik Produksi yang Pemakaian Bahannya sudah 'approved'
        $rawData = DB::table('t_hasil_produksi as hp')
            ->join('t_detail_jadwal_produksi as djp', 'hp.id_produksi', '=', 'djp.id_produksi')
            ->join('t_produk as p', 'djp.id_produk', '=', 'p.id_produk')
            ->join('t_pemakaian_bahan as pb', 'hp.id_hasil_produksi', '=', 'pb.id_hasil_produksi')

            // JOIN KE APPROVAL UNTUK CEK STATUSNYA
            ->join('t_approval_pemakaian_bahan as apb', 'pb.id_pemakaian', '=', 'apb.id_pemakaian')

            ->join('t_bahan as b', 'pb.id_bahan', '=', 'b.id_bahan')

            // LEFT JOIN ke COGM untuk mengecek apakah HPP-nya "Sudah Input" atau "Belum"
            ->leftJoin('t_cogm as c', 'hp.id_produksi', '=', 'c.id_produksi')

            // FILTER HANYA YANG APPROVED
            ->where('apb.status_approval', 'approved')

            ->select(
                'hp.id_produksi',
                'djp.kode_produksi',
                'hp.tanggal_produksi',
                'p.nama_produk',
                $qtyColumn,
                'b.kode_bahan',
                'b.nama_bahan',
                'b.satuan_bahan',
                'pb.qty_aktual',
                'apb.harga_ratarata_aktual',
                'apb.total_aktual',
                'apb.komentar_admin',
                'c.id_cogm' // Kunci penentu status HPP
            )
            ->get();

        // 4. Mapping data raw ke format JSON yang dipahami oleh Front-End React
        $hppData = $rawData->groupBy('id_produksi')->map(function ($items, $idProduksi) {
            $first = $items->first();

            // Jika ada id_cogm, berarti data COGM-nya sudah pernah disimpan
            $statusHpp = $first->id_cogm ? 'Sudah Input' : 'Belum Input';

            // Mapping Material (Bahan Baku)
            $bahanBaku = $items->map(function ($item) {
                return [
                    'kode_material' => $item->kode_bahan ?? '-',
                    'nama_material' => $item->nama_bahan,
                    'qty_pemakaian' => (float) $item->qty_aktual,
                    'satuan'        => $item->satuan_bahan ?? '-',
                    'harga_satuan'  => (float) $item->harga_ratarata_aktual,
                    'total_biaya'   => (float) $item->total_aktual,
                ];
            })->values()->toArray();

            $tenagaKerja = [];
            $overhead = [];

            // Jika "Sudah Input", kita harus mengambil nilai BTKL dan BOP historisnya dari Database
            if ($statusHpp === 'Sudah Input') {
                // Tarik histori BTKL
                $tkData = DB::table('t_btkl as bk')
                    ->join('t_detail_btkl as dbk', 'bk.id_btkl', '=', 'dbk.id_btkl')
                    ->join('t_divisi as div', 'dbk.id_divisi', '=', 'div.id_divisi')
                    ->where('bk.id_produksi', $idProduksi)
                    ->get();

                foreach($tkData as $tk) {
                    $tenagaKerja[] = [
                        'id'             => 'tk_'.$tk->id_detail_btkl,
                        'nama_divisi'    => $tk->nama_divisi,
                        'jumlah_orang'   => (float) $tk->jumlah_orang,
                        'tarif_per_hari' => (float) $tk->tarif_per_hari,
                    ];
                }

                // Tarik histori Overhead
                $bopData = DB::table('t_bop as bp')
                    ->join('t_detail_bop as dbp', 'bp.id_bop', '=', 'dbp.id_bop')
                    ->join('t_overhead as ov', 'dbp.id_overhead', '=', 'ov.id_overhead')
                    ->where('bp.id_produksi', $idProduksi)
                    ->get();

                foreach($bopData as $bp) {
                    $overhead[] = [
                        'nama_overhead' => $bp->nama_overhead,
                        'biaya'         => (float) $bp->biaya,
                    ];
                }
            }

            return [
                'id'               => (string) $idProduksi,
                'no_produksi'      => $first->kode_produksi ?? 'PRD-'.$idProduksi,
                'tanggal_produksi' => Carbon::parse($first->tanggal_produksi)->format('Y-m-d'),
                'kode_produk'      => '-', // Opsional, bisa diisi jika ada kolom kode_produk
                'nama_produk'      => $first->nama_produk,
                'qty_rencana'      => (float) ($first->qty_rencana ?? 1),
                'satuan'           => 'Pack', // Asumsi satuan produksi
                'catatan'          => $first->komentar_admin ?? '',
                'status_hpp'       => $statusHpp,
                'bahan_baku'       => $bahanBaku,
                'tenaga_kerja'     => $tenagaKerja,
                'overhead'         => $overhead,
            ];
        })->values()->toArray();

        // 5. Lempar semua data ke Inertia (React Front-End)
        return Inertia::render('Produksi/HargaPokokProduksi', [
            'hppData'        => $hppData,
            'masterDivisi'   => $masterDivisi,
            'masterOverhead' => $masterOverhead
        ]);
    }

    /**
     * Memproses Penyimpanan COGM ke 7 Tabel Database
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id'             => 'required',
            'bahan_baku'     => 'required|array',
            'tenaga_kerja'   => 'required|array',
            'overhead'       => 'required|array',
        ]);

        $idProduksi = $validated['id'];
        $tanggalHitung = Carbon::now()->toDateString();

        try {
            DB::transaction(function () use ($validated, $idProduksi, $tanggalHitung) {

                // === 1. BIAYA BAHAN BAKU (BBB) ===
                $totalBBB = 0;
                $detailBBB = [];

                foreach ($validated['bahan_baku'] as $bb) {
                    $subtotalBahan = (float) $bb['total_biaya'];
                    $totalBBB += $subtotalBahan;

                    $idApproval = DB::table('t_approval_pemakaian_bahan as apb')
                        ->join('t_pemakaian_bahan as pb', 'apb.id_pemakaian', '=', 'pb.id_pemakaian')
                        ->join('t_bahan as b', 'pb.id_bahan', '=', 'b.id_bahan')
                        ->where('pb.id_hasil_produksi', $idProduksi)
                        ->where('b.kode_bahan', $bb['kode_material'])
                        ->value('apb.id_approval') ?? 1;

                    $detailBBB[] = [
                        'id_approval'    => $idApproval,
                        'subtotal_bahan' => $subtotalBahan,
                        'created_at'     => now(),
                        'updated_at'     => now(),
                    ];
                }

                $idBBB = DB::table('t_bbb')->insertGetId([
                    'id_produksi'    => $idProduksi,
                    'total_bbb'      => $totalBBB,
                    'tanggal_hitung' => $tanggalHitung,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                foreach ($detailBBB as &$detail) { $detail['id_bbb'] = $idBBB; }
                DB::table('t_detail_bbb')->insert($detailBBB);

                // === 2. BIAYA TENAGA KERJA LANGSUNG (BTKL) ===
                $totalBTKL = 0;
                $detailBTKL = [];

                foreach ($validated['tenaga_kerja'] as $tk) {
                    $jumlahOrang = (float) $tk['jumlah_orang'];
                    $tarifPerHari = (float) $tk['tarif_per_hari'];
                    $subtotalBTKL = $jumlahOrang * $tarifPerHari;

                    $totalBTKL += $subtotalBTKL;

                    $idDivisi = DB::table('t_divisi')
                        ->where('nama_divisi', $tk['nama_divisi'])
                        ->value('id_divisi') ?? 1;

                    $detailBTKL[] = [
                        'id_divisi'      => $idDivisi,
                        'jumlah_orang'   => $jumlahOrang,
                        'tarif_per_hari' => $tarifPerHari,
                        'subtotal_btkl'  => $subtotalBTKL,
                        'created_at'     => now(),
                        'updated_at'     => now(),
                    ];
                }

                $idBTKL = DB::table('t_btkl')->insertGetId([
                    'id_produksi'    => $idProduksi,
                    'total_btkl'     => $totalBTKL,
                    'tanggal_hitung' => $tanggalHitung,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                foreach ($detailBTKL as &$detail) { $detail['id_btkl'] = $idBTKL; }
                DB::table('t_detail_btkl')->insert($detailBTKL);

                // === 3. BIAYA OVERHEAD PABRIK (BOP) ===
                $totalBOP = 0;
                $detailBOP = [];

                foreach ($validated['overhead'] as $ov) {
                    $biayaOverhead = (float) $ov['biaya'];
                    $totalBOP += $biayaOverhead;

                    $idOverhead = DB::table('t_overhead')
                        ->where('nama_overhead', $ov['nama_overhead'])
                        ->value('id_overhead') ?? 1;

                    $detailBOP[] = [
                        'id_overhead' => $idOverhead,
                        'biaya'       => $biayaOverhead,
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ];
                }

                $idBOP = DB::table('t_bop')->insertGetId([
                    'id_produksi'    => $idProduksi,
                    'total_bop'      => $totalBOP,
                    'tanggal_hitung' => $tanggalHitung,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                foreach ($detailBOP as &$detail) { $detail['id_bop'] = $idBOP; }
                DB::table('t_detail_bop')->insert($detailBOP);

                // === 4. FINALISASI COGM ===
                $totalCOGM = $totalBBB + $totalBTKL + $totalBOP;

                DB::table('t_cogm')->insert([
                    'id_produksi' => $idProduksi,
                    'total_bbb'   => $totalBBB,
                    'total_btkl'  => $totalBTKL,
                    'total_bop'   => $totalBOP,
                    'total_cogm'  => $totalCOGM,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            // =========================================================================
                // ===== BARANG JADI BARU MASUK GUDANG SETELAH HPP DIHITUNG =====
                // =========================================================================
                // Ambil data produk dan Qty Aktual dari tabel hasil produksi
                $infoProduksi = DB::table('t_hasil_produksi as hp')
                    ->join('t_detail_jadwal_produksi as djp', 'hp.id_produksi', '=', 'djp.id_produksi')
                    ->where('hp.id_produksi', $idProduksi)
                    // TAMBAHKAN hp.output_aktual untuk mengambil jumlah barangnya!
                    ->select('djp.id_produk', 'djp.kode_produksi', 'hp.output_aktual')
                    ->first();

                if ($infoProduksi && $infoProduksi->output_aktual > 0) {

                    // Hitung Harga Per Unit = Total COGM / Jumlah Barang
                    $hargaPerUnit = $totalCOGM / $infoProduksi->output_aktual;

                    // Masukkan barang ke kartu persediaan dengan Qty dan Harga yang sudah valid!
                    \App\Services\InventoryService::catatMutasi(
                        $infoProduksi->id_produk,
                        'produk',
                        'MASUK',
                        'produksi_masuk', // Ganti sumbernya jadi penerimaan normal produksi
                        $infoProduksi->kode_produksi ?? 'PRD-'.$idProduksi,
                        $infoProduksi->output_aktual, // Qty Aktual
                        $hargaPerUnit,                // Harga per satuan
                        $tanggalHitung,
                        "Penerimaan produk jadi setelah perhitungan HPP/COGM selesai"
                    );

            }
            });


            return redirect()->back()->with('success', 'Harga Pokok Produksi (COGM) berhasil dikalkulasi dan disimpan secara permanen.');

        } catch (Exception $e) {
            Log::error('Kegagalan kalkulasi COGM: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Gagal memproses Harga Pokok Produksi. Pastikan master data divisi dan overhead sudah lengkap.'
            ]);
        }
    }
}

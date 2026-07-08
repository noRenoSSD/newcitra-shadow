<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Piutang;
use App\Models\PelunasanPiutang;
use App\Models\PerpanjanganPiutang;
use App\Models\Mitra; 
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PiutangController extends Controller
{
    /**
     * 1. HALAMAN UTAMA: Daftar Piutang Per Mitra beserta Isinya (Notas & Riwayat)
     */
    public function index()
    {
        // Menghitung total cicilan piutang yang BERHASIL MASUK/TERTAGIH bulan ini
        $total_omset = PelunasanPiutang::whereMonth('tgl_pelunasan', now()->month)
                                        ->whereYear('tgl_pelunasan', now()->year)
                                        ->sum('nominal_bayar');

        $total_piutang_berjalan = Piutang::where('status_piutang', 'Belum Lunas')->sum('sisa_piutang');
        
        $mitra_jatuh_tempo = Piutang::where('status_piutang', 'Belum Lunas')
                                    ->where('jt_piutang', '<=', date('Y-m-d'))
                                    ->distinct('id_mitra')
                                    ->count('id_mitra');

        // Isi Tabel Master Mitra
        $daftar_piutang_mitra = Mitra::leftJoin('t_piutang', 't_mitra.id_mitra', '=', 't_piutang.id_mitra')
            ->select(
                't_mitra.id_mitra as id', 
                't_mitra.kode_mitra as kodeMitra', 
                't_mitra.nama_mitra as namaMitra', 
                DB::raw("COUNT(CASE WHEN t_piutang.status_piutang = 'Belum Lunas' THEN 1 END) as totalNota"),
                DB::raw("SUM(CASE WHEN t_piutang.status_piutang = 'Belum Lunas' THEN t_piutang.sisa_piutang ELSE 0 END) as totalSisaPiutang")
            )
            ->groupBy('t_mitra.id_mitra', 't_mitra.kode_mitra', 't_mitra.nama_mitra')
            ->get();

        // ─── AMBIL DATA NOTA & RIWAYAT FLEKSIBEL ───
        $daftar_piutang_mitra->transform(function($item) {
            // Join ganda ke t_jual (Penjualan Umum) dan t_jual_konsinyasi (Penjualan Konsinyasi)
            $item->notas = Piutang::leftJoin('t_jual', 't_piutang.id_jual', '=', 't_jual.id_jual')
                ->leftJoin('t_jual_konsinyasi', 't_piutang.id_jual', '=', 't_jual_konsinyasi.id_jual_konsinyasi')
                ->where('t_piutang.id_mitra', $item->id)
                ->where('t_piutang.status_piutang', 'Belum Lunas')
                ->select(
                    't_piutang.*', 
                    // COALESCE akan mengambil t_jual.no_jual jika ada, jika null dia mengambil t_jual_konsinyasi.no_penjualan
                    DB::raw('COALESCE(t_jual.no_jual, t_jual_konsinyasi.no_penjualan) as no_invoice_asli')
                )
                ->orderBy('t_piutang.tgl_piutang', 'asc')
                ->get()
                ->map(function($nota) {
                    return [
                        'id_piutang'     => $nota->id_piutang,
                        'no_invoice'     => $nota->no_invoice_asli ?? $nota->no_piutang, 
                        'no_piutang'     => $nota->no_piutang,
                        'tgl_piutang'    => $nota->tgl_piutang,
                        'total_piutang'  => (int)$nota->total_piutang,
                        'terbayar'       => (int)$nota->terbayar,
                        'sisa_piutang'   => (int)$nota->sisa_piutang,
                        'jt_piutang'     => $nota->jt_piutang,
                        'status_piutang' => $nota->status_piutang,
                        'keterangan'     => $nota->keterangan
                    ];
                });

            // Ambil riwayat pembayaran untuk mitra ini
            $item->riwayat = PelunasanPiutang::whereHas('piutang', function($query) use ($item) {
                    $query->where('id_mitra', $item->id);
                })
                ->orderBy('tgl_pelunasan', 'desc')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function($rw) {
                    return [
                        'id_pelunasan'  => $rw->id_pelunasan,
                        'no_pelunasan'  => $rw->no_pelunasan,
                        'tgl_pelunasan' => $rw->tgl_pelunasan,
                        'id_piutang'    => $rw->id_piutang,
                        'nominal_bayar' => (int)$rw->nominal_bayar,
                        'metode_bayar'  => $rw->metode_bayar,
                        'keterangan'    => $rw->keterangan
                    ];
                });

            return $item;
        });

        return Inertia::render('Keuangan/Piutang', [
            'totalOmsetBulanIni'    => (int)$total_omset, 
            'totalPiutang'          => (int)$total_piutang_berjalan,
            'jumlahMitraJatuhTempo' => (int)$mitra_jatuh_tempo,
            'dataMitra'             => $daftar_piutang_mitra
        ]);
    }

    /**
     * 2. DETAIL KARTU PIUTANG (Fleksibel Penjualan & Konsinyasi)
     */
    public function detailKartu($id_mitra)
    {
        $mitra = Mitra::findOrFail($id_mitra);

        // Terapkan Join ganda yang sama pada detail kartu piutang
        $invoice_aktif = Piutang::leftJoin('t_jual', 't_piutang.id_jual', '=', 't_jual.id_jual')
            ->leftJoin('t_jual_konsinyasi', 't_piutang.id_jual', '=', 't_jual_konsinyasi.id_jual_konsinyasi')
            ->where('t_piutang.id_mitra', $id_mitra)
            ->where('t_piutang.status_piutang', 'Belum Lunas')
            ->select(
                't_piutang.*', 
                DB::raw('COALESCE(t_jual.no_jual, t_jual_konsinyasi.no_penjualan) as no_invoice_asli')
            )
            ->orderBy('t_piutang.tgl_piutang', 'asc')
            ->get()
            ->map(function($nota) {
                $nota->no_invoice = $nota->no_invoice_asli ?? $nota->no_piutang;
                return $nota;
            });

        $riwayat_bayar = PelunasanPiutang::whereHas('piutang', function($query) use ($id_mitra) {
                $query->where('id_mitra', $id_mitra);
            })
            ->orderBy('tgl_pelunasan', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $total_terbayar = Piutang::where('id_mitra', $id_mitra)->sum('terbayar');
        $sisa_piutang_mitra = Piutang::where('id_mitra', $id_mitra)->where('status_piutang', 'Belum Lunas')->sum('sisa_piutang');

        return response()->json([
            'mitra' => $mitra,
            'invoice_aktif' => $invoice_aktif,
            'riwayat_bayar' => $riwayat_bayar,
            'total_terbayar' => $total_terbayar,
            'sisa_piutang_mitra' => $sisa_piutang_mitra
        ]);
    }

    /**
     * 3. PROSES SIMPAN CICILAN
     */
    public function bayarCicilan(Request $request)
    {
        $request->validate([
            'id_piutang' => 'required',
            'nominal_bayar' => 'required|numeric|min:1',
            'metode_bayar' => 'required|in:Tunai,Transfer,Giro',
            'keterangan' => 'nullable|string|max:100',
        ]);

        DB::beginTransaction();

        try {
            $piutang = Piutang::findOrFail($request->id_piutang);

            if ($request->nominal_bayar > $piutang->sisa_piutang) {
                return redirect()->back()->with('error', 'Nominal bayar melebihi sisa piutang!');
            }

            $tgl_sekarang = date('Ymd');
            $hitung_hari_ini = PelunasanPiutang::whereDate('created_at', date('Y-m-d'))->count() + 1;
            $no_pelunasan = 'BYR-' . $tgl_sekarang . '-' . str_pad($hitung_hari_ini, 4, '0', STR_PAD_LEFT);

            PelunasanPiutang::create([
                'no_pelunasan' => $no_pelunasan,
                'tgl_pelunasan' => date('Y-m-d'),
                'id_piutang' => $piutang->id_piutang,
                'nominal_bayar' => $request->nominal_bayar,
                'metode_bayar' => $request->metode_bayar,
                'keterangan' => $request->keterangan,
            ]);

            $piutang->terbayar += $request->nominal_bayar;
            $piutang->sisa_piutang -= $request->nominal_bayar;

            if ($piutang->sisa_piutang <= 0) {
                $piutang->status_piutang = 'Lunas';
            }

            $piutang->save();

            DB::commit();
            return redirect()->back()->with('success', 'Pembayaran cicilan berhasil disimpan!');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Gagal menyimpan data: ' . $e->getMessage());
        }
    }

    /**
     * 4. PROSES SIMPAN: Saldo Awal Piutang
     */
    public function simpanSaldoAwal(Request $request)
    {
        $request->validate([
            'id_mitra' => 'required',
            'no_invoice' => 'required|string|max:30|unique:t_piutang,no_piutang', 
            'tgl_piutang' => 'required|date',
            'total_piutang' => 'required|numeric|min:1',
            'jt_piutang' => 'required|date|after_or_equal:tgl_piutang',
            'keterangan' => 'nullable|string|max:100',
        ]);

        try {
            Piutang::create([
                'no_piutang' => $request->no_invoice, 
                'id_jual' => null, 
                'id_mitra' => $request->id_mitra,
                'tgl_piutang' => $request->tgl_piutang,
                'total_piutang' => $request->total_piutang,
                'terbayar' => 0,
                'sisa_piutang' => $request->total_piutang, 
                'jt_piutang' => $request->jt_piutang,
                'status_piutang' => 'Belum Lunas',
                'keterangan' => $request->keterangan ?? 'Saldo Awal Piutang',
            ]);

            return redirect()->back()->with('success', 'Saldo awal piutang berhasil ditambahkan!');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menyimpan saldo awal: ' . $e->getMessage());
        }
    }

    public function perpanjang(Request $request)
    {
        $request->validate([
            'id_piutang' => 'required|exists:t_piutang,id_piutang',
            'nominal'    => 'required|numeric|min:1',
            'jt_lama'    => 'required|date',
            'jt_baru'    => 'required|date|after_or_equal:jt_lama',
            'alasan'     => 'nullable|string',
        ]);

        \DB::table('t_piutang_perpanjangan')->insert([
            'id_piutang'   => $request->id_piutang,
            'nominal'      => $request->nominal,
            'jt_lama'      => $request->jt_lama, 
            'jt_baru'      => $request->jt_baru, 
            'alasan'       => $request->alasan,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        \DB::table('t_piutang')
            ->where('id_piutang', $request->id_piutang)
            ->update(['jt_piutang' => $request->jt_baru]);

        return redirect()->back()->with('success', 'Perpanjangan berhasil disimpan!');
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\PenjualanKonsinyasi;
use App\Models\PenjualanKonsinyasiDetail;

class PenjualanKonsinyasiController extends Controller
{
    public function index()
    {
        // 1. AMBIL DATA UTAMA (Menggunakan Model agar fungsi ->with() bekerja!)
        // PENTING: Pastikan di dalam Model PenjualanKonsinyasi sudah diset protected $table = 't_jual_konsinyasi';
        $dataPenjualan = PenjualanKonsinyasi::query()
            ->leftJoin('t_mitra', 't_jual_konsinyasi.id_mitra', '=', 't_mitra.id_mitra')
            ->leftJoin('t_konsinyasi_keluar', 't_jual_konsinyasi.id_konsinyasi_keluar', '=', 't_konsinyasi_keluar.id_konsinyasi_keluar')
            ->select(
                't_jual_konsinyasi.*', 
                't_mitra.nama_mitra as nama_toko',
                't_mitra.alamat as alamat_toko', 
                DB::raw('COALESCE(t_konsinyasi_keluar.no_konsinyasi, t_konsinyasi_keluar.id_konsinyasi_keluar) as no_konsinyasi_keluar')
            )
            ->with(['items']) 
            ->orderBy('t_jual_konsinyasi.id_jual_konsinyasi', 'desc')
            ->get();

        // 2. Ambil data untuk dropdown Dokumen Konsinyasi Keluar
        $dataKonsinyasiKeluar = DB::table('t_konsinyasi_keluar')
            ->leftJoin('t_mitra', 't_konsinyasi_keluar.id_mitra', '=', 't_mitra.id_mitra')
            ->select(
                't_konsinyasi_keluar.id_konsinyasi_keluar',
                DB::raw('COALESCE(t_konsinyasi_keluar.no_konsinyasi, t_konsinyasi_keluar.id_konsinyasi_keluar) as no_dokumen'),
                't_konsinyasi_keluar.id_mitra',
                't_mitra.nama_mitra as nama_toko',
                't_mitra.alamat as alamat_toko'
            )
            ->get();

        // 3. Ambil data produk titipan (MENGGUNAKAN HARGA_TITIP)
        $dataProdukKonsinyasi = DB::table('t_konsinyasi_keluar_detail')
            ->join('t_produk', 't_konsinyasi_keluar_detail.id_produk', '=', 't_produk.id_produk')
            ->select(
                't_konsinyasi_keluar_detail.id_konsinyasi_keluar',
                't_produk.id_produk',
                't_produk.kode_produk',
                't_produk.nama_produk',
                't_konsinyasi_keluar_detail.harga_titip as harga_konsinyasi'
            )
            ->get();

        // 4. Generate nomor penjualan otomatis selanjutnya
        $nextNoPenjualan = 'INV-CSG-' . date('Ymd') . '-' . sprintf('%04d', ($dataPenjualan->count() + 1));

        // Kirim ke React via Inertia
        return Inertia::render('Konsinyasi/PenjualanKonsinyasi', [
            'dataPenjualan' => $dataPenjualan,
            'dataKonsinyasiKeluar' => $dataKonsinyasiKeluar,
            'dataProdukKonsinyasi' => $dataProdukKonsinyasi,
            'nextNoPenjualan' => $nextNoPenjualan
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validasi Input Data
        $request->validate([
            'no_penjualan'          => 'required',
            'tgl_penjualan'         => 'required|date',
            'id_konsinyasi_keluar'  => 'required',
            'id_mitra'              => 'required',
            'jenis_pembayaran'      => 'required|in:Tunai,Kredit',
            'termin_hari'          => 'required_if:jenis_bayar,Tempo|nullable|integer|min:1',
            'jatuh_tempo_tanggal'  => 'required_if:jenis_bayar,Tempo|nullable|date',
            'items'                 => 'required|array|min:1',
        ]);

        // 2. Kalkulasi Tanggal Jatuh Tempo (Hanya untuk keperluan tabel piutang)
        $jatuhTempo = null;

        if ($request->jenis_pembayaran === 'Kredit') {
            if ($request->filled('jatuh_tempo_tanggal')) {
                $jatuhTempo = $request->jatuh_tempo_tanggal;
            } else {
                $termin = $request->termin_hari ?? 30; 
                $jatuhTempo = \Carbon\Carbon::parse($request->tgl_penjualan)
                    ->addDays((int)$termin)
                    ->format('Y-m-d');
            }
        }

        DB::beginTransaction();
        try {
            // 3. INSERT KE TABEL INDUK (Kolom 'status' sudah dihapus sesuai request sebelumnya)
            $idJualKonsinyasi = DB::table('t_jual_konsinyasi')->insertGetId([
                'no_penjualan'          => $request->no_penjualan,
                'tgl_penjualan'         => $request->tgl_penjualan,
                'id_mitra'              => $request->id_mitra,
                'id_konsinyasi_keluar'  => $request->id_konsinyasi_keluar,
                'total_bayar'           => $request->total_bayar,
                'keterangan'            => $request->keterangan,
                'jenis_pembayaran'      => $request->jenis_pembayaran,
                'hpp_total'             => 0,
                'created_at'            => now(),
                'updated_at'            => now()
            ]);

            // 4. INSERT KE TABEL DETAIL (Menggunakan kolom 'subtotal' yang sudah aman)
            foreach ($request->items as $item) {
                DB::table('t_jual_konsinyasi_detail')->insert([
                    'id_jual_konsinyasi' => $idJualKonsinyasi,
                    'id_produk'          => $item['id_produk'],
                    'qty_terjual'        => $item['qty_terjual'],
                    'harga_jual'         => $item['harga_jual'],
                    'subtotal'           => $item['total_penjualan'],
                    'hpp_satuan'          => 0,
                    'created_at'         => now(),
                    'updated_at'         => now()
                ]);
            }

            // 5. GENERATE KARTU PIUTANG OTOMATIS JIKALAU KREDIT
            if ($request->jenis_pembayaran === 'Kredit') {
                $noPiutangOtomatis = 'PTK-' . date('Ymd') . '-' . $idJualKonsinyasi;

                DB::table('t_piutang')->insert([
                    'id_mitra'       => $request->id_mitra,
                    'no_piutang'     => $noPiutangOtomatis,
                    'id_jual'        => $idJualKonsinyasi, // <-- KUNCI PERBAIKAN: id_jual sekarang berelasi dengan id_jual_konsinyasi
                    'tgl_piutang'    => $request->tgl_penjualan,
                    'total_piutang'  => $request->total_bayar,
                    'terbayar'       => 0,
                    'sisa_piutang'   => $request->total_bayar,
                    'jt_piutang'     => $jatuhTempo,
                    'status_piutang' => 'Belum Lunas', 
                    'keterangan'     => 'Piutang otomatis dari setoran konsinyasi ' . $request->no_penjualan,
                ]);
            }

            DB::commit();
            return redirect()->route('konsinyasi-penjualan.index')->with('success', 'Laporan Penjualan Konsinyasi Berhasil Disimpan!');

        } catch (\Exception $e) {
            DB::rollback();
            dd('Gagal menyimpan setoran konsinyasi: ' . $e->getMessage());
        }
    }
}
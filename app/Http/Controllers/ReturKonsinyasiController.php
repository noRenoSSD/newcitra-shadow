<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\ReturKonsinyasi;
use App\Models\ReturKonsinyasiDetail;
use App\Models\Produk; // -> TAMBAHKAN IMPORT INI

class ReturKonsinyasiController extends Controller
{
    /**
     * 1. TAMPILAN UTAMA & PENGAMBILAN DATA
     */
    public function index()
    {
        // A. Ambil semua riwayat retur konsinyasi yang sudah pernah dibuat
        $dataRetur = ReturKonsinyasi::query()
            ->join('t_konsinyasi_keluar', 't_retur_konsinyasi.id_konsinyasi_keluar', '=', 't_konsinyasi_keluar.id_konsinyasi_keluar')
            ->join('t_mitra', 't_konsinyasi_keluar.id_mitra', '=', 't_mitra.id_mitra')
            ->select(
                't_retur_konsinyasi.*',
                't_mitra.nama_mitra as nama_toko',
                DB::raw('COALESCE(t_konsinyasi_keluar.no_konsinyasi, t_konsinyasi_keluar.id_konsinyasi_keluar) as no_konsinyasi_keluar')
            )
            ->with(['items.produk']) // Load detail items beserta nama produknya
            ->orderBy('t_retur_konsinyasi.id_retur_konsinyasi', 'desc')
            ->get();

        // B. Ambil data dropdown Dokumen Konsinyasi Keluar yang aktif (untuk form retur baru)
        $dataKonsinyasiKeluar = DB::table('t_konsinyasi_keluar')
            ->join('t_mitra', 't_konsinyasi_keluar.id_mitra', '=', 't_mitra.id_mitra')
            ->select(
                't_konsinyasi_keluar.id_konsinyasi_keluar',
                DB::raw('COALESCE(t_konsinyasi_keluar.no_konsinyasi, t_konsinyasi_keluar.id_konsinyasi_keluar) as no_dokumen'),
                't_mitra.nama_mitra as nama_toko'
            )
            ->get();

        // C. Ambil data list produk bawaan dari setiap dokumen konsinyasi keluar
        $dataProdukKonsinyasi = DB::table('t_konsinyasi_keluar_detail')
            ->join('t_produk', 't_konsinyasi_keluar_detail.id_produk', '=', 't_produk.id_produk')
            ->select(
                't_konsinyasi_keluar_detail.id_konsinyasi_keluar',
                't_produk.id_produk',
                't_produk.kode_produk',
                't_produk.nama_produk',
                't_konsinyasi_keluar_detail.harga_titip as harga',
                't_konsinyasi_keluar_detail.qty as qty_kirim' // Menggunakan harga_titip asli
            )
            ->get();

        // D. Generate Nomor Retur Otomatis Selanjutnya
        $nextNoRetur = 'RTC-' . date('Ymd') . '-' . sprintf('%04d', ($dataRetur->count() + 1));

        return Inertia::render('Konsinyasi/ReturKonsinyasi', [
            'dataRetur' => $dataRetur,
            'dataKonsinyasiKeluar' => $dataKonsinyasiKeluar,
            'dataProdukKonsinyasi' => $dataProdukKonsinyasi,
            'nextNoRetur' => $nextNoRetur
        ]);
    }

    /**
     * 2. PROSES SIMPAN DATA RETUR & ADJUSTMENT STOK
     */
    public function store(Request $request)
    {
        $request->validate([
            'no_retur_konsinyasi' => 'required|string',
            'tgl_retur_konsinyasi' => 'required|date',
            'id_konsinyasi_keluar' => 'required|integer',
            'items' => 'required|array|min:1',
            'items.*.id_produk' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.kondisi_barang' => 'required|in:Layak,Perlu Perbaikan,Rusak',
            'items.*.keterangan' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Buat data induk menggunakan nama kolom Anda (total_perbaikan, total_kerugian)
            $retur = ReturKonsinyasi::create([
                'no_retur_konsinyasi'  => $request->no_retur_konsinyasi,
                'tgl_retur_konsinyasi' => $request->tgl_retur_konsinyasi,
                'id_konsinyasi_keluar' => $request->id_konsinyasi_keluar,
                'total_hpp_retur'      => 0,
                'total_perbaikan'      => 0,
                'total_kerugian'       => 0,
            ]);

            $accumulatedHppRetur   = 0;
            $accumulatedPerbaikan  = 0;
            $accumulatedKerugian   = 0;

            foreach ($request->items as $item) {
                $produk = Produk::findOrFail($item['id_produk']); 
                $hppProduk = $produk->hpp ?? 0;
                
                // Mengambil field master biaya_perbaikan dari tabel produk Anda
                $estBiayaPerbaikan = $produk->biaya_perbaikan ?? 0; 

                // 1. Hitung total HPP masuk (semua kondisi barang)
                $accumulatedHppRetur += ($hppProduk * $item['qty']);

                // 2. LOGIKA AKUMULASI NOMINAL BERDASARKAN KONDISI
                if ($item['kondisi_barang'] === 'Rusak') {
                    // Rusak total = Nilai kerugian sebesar HPP barang
                    $accumulatedKerugian += ($hppProduk * $item['qty']);
                } elseif ($item['kondisi_barang'] === 'Perlu Perbaikan') {
                    // Perlu perbaikan = Akumulasi estimasi biaya perbaikan
                    $accumulatedPerbaikan += ($estBiayaPerbaikan * $item['qty']);
                }

                // Simpan menggunakan nama Model yang sudah di-import di atas (ReturKonsinyasiDetail)
                ReturKonsinyasiDetail::create([
                    'id_retur_konsinyasi' => $retur->getKey(), // Mengambil primary key secara dinamis & aman
                    'id_produk'           => $item['id_produk'],
                    'qty'                 => $item['qty'],
                    'kondisi_barang'      => $item['kondisi_barang'],
                    'hpp_saat_ini'        => $hppProduk,
                    'biaya_perbaikan'     => $item['kondisi_barang'] === 'Perlu Perbaikan' ? $estBiayaPerbaikan : 0,
                    'nilai_kerugian'      => $item['kondisi_barang'] === 'Rusak' ? $hppProduk : 0,
                    'keterangan'          => $item['keterangan'] ?? null,
                ]);
            }

            // 3. Update data induk dengan nama kolom yang sudah sinkron 100%
            $retur->update([
                'total_hpp_retur' => $accumulatedHppRetur,
                'total_perbaikan' => $accumulatedPerbaikan,
                'total_kerugian'  => $accumulatedKerugian
            ]);

            DB::commit();
            
            // UBAH BARIS INI: Dari redirect()->back() menjadi redirect()->route()
            return redirect()->route('konsinyasi-retur.index')->with('success', 'Retur konsinyasi sukses diproses!');

        } catch (\Exception $e) {
            DB::rollBack();
            // Untuk error, tetap gunakan back() agar inputan form lama tidak hilang
            return redirect()->back()->with('error', 'Gagal memproses data: ' . $e->getMessage());
        }
    }
}
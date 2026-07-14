<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SuratJalanController extends Controller
{
    /**
     * 1. Menampilkan Daftar Surat Jalan (Mendukung Jalur Pesanan & Konsinyasi Keluar)
     */
    public function index()
    {
        $suratJalans = DB::table('t_surat_jalan')
            // Join Jalur 1: Dari Pesanan (Sales Order)
            ->leftJoin('t_pesanan', 't_surat_jalan.id_pesanan', '=', 't_pesanan.id_pesanan')
            ->leftJoin('t_mitra as mitra_pesanan', 't_pesanan.id_mitra', '=', 'mitra_pesanan.id_mitra')
            
            // 💡 TAMBAHAN: Join ke tabel penjualan untuk mengambil Nomor Nota Jual / Invoice terkait
            ->leftJoin('t_jual', 't_pesanan.id_pesanan', '=', 't_jual.id_pesanan')
            
            // Join Jalur 2: Dari Konsinyasi Keluar
            ->leftJoin('t_konsinyasi_keluar', 't_surat_jalan.id_konsinyasi', '=', 't_konsinyasi_keluar.id_konsinyasi_keluar')
            ->leftJoin('t_mitra as mitra_konsinyasi', 't_konsinyasi_keluar.id_mitra', '=', 'mitra_konsinyasi.id_mitra')
            
            ->select(
                // Data dari Jalur Pesanan
                't_pesanan.no_pesanan', 
                'mitra_pesanan.nama_mitra as nama_mitra_pesanan',
                
                // 💡 TAMBAHAN: Ambil kolom nomor jual (invoice) dari tabel penjualan
                't_jual.no_jual as no_invoice_pesanan', // Sesuaikan nama kolom asli seperti no_jual / no_invoice
                
                // Data dari Jalur Konsinyasi (Alamat diambil dari tabel mitra_konsinyasi)
                't_konsinyasi_keluar.no_konsinyasi as k_no_konsinyasi',
                'mitra_konsinyasi.nama_mitra as nama_mitra_konsinyasi',
                'mitra_konsinyasi.alamat as k_alamat', 
                
                // t_surat_jalan.* di paling bawah agar status pengiriman murni milik Surat Jalan
                't_surat_jalan.*' 
            )
            ->orderBy('t_surat_jalan.id_surat_jalan', 'desc')
            ->get()
            ->map(function ($sj) {
                // SINKRONISASI UNTUK FRONTEND REACT
                // 1. Ambil nomor referensi
                $sj->konsinyasi_no_order = $sj->k_no_konsinyasi; 
                
                // 2. Ambil nama mitra secara tepat dari relasi masing-masing
                $sj->nama_mitra = $sj->nama_mitra_pesanan; 
                $sj->konsinyasi_nama_toko = $sj->nama_mitra_konsinyasi; 
                
                // 3. Ambil alamat pengiriman
                $sj->konsinyasi_alamat = $sj->k_alamat ?? '';

                // 💡 SINKRONISASI BARU: Memetakan nomor invoice ke komponen React
                $sj->no_invoice = $sj->no_invoice_pesanan ?? null;

                // SINKRONISASI DETAIL PRODUK (Masing-masing Jalur)
                if ($sj->id_pesanan) {
                    // Jalur Produk 1: Jika dari Pesanan
                    $sj->items = DB::table('t_pesanan_detail')
                        ->leftJoin('t_produk', 't_pesanan_detail.id_produk', '=', 't_produk.id_produk')
                        ->select('t_pesanan_detail.*', 't_produk.nama_produk', 't_produk.kode_produk', 't_produk.satuan_produk')
                        ->where('t_pesanan_detail.id_pesanan', $sj->id_pesanan) 
                        ->get();
                } else if ($sj->id_konsinyasi) {
                    // Jalur Produk 2: Jika dari Konsinyasi Keluar
                    $sj->items = DB::table('t_konsinyasi_keluar_detail')
                        ->leftJoin('t_produk', 't_konsinyasi_keluar_detail.id_produk', '=', 't_produk.id_produk')
                        ->select('t_konsinyasi_keluar_detail.*', 't_produk.nama_produk', 't_produk.kode_produk', 't_produk.satuan_produk')
                        ->where('t_konsinyasi_keluar_detail.id_konsinyasi_keluar', $sj->id_konsinyasi) 
                        ->get();
                } else {
                    $sj->items = [];
                }
                
                return $sj;
            });

        return Inertia::render('Penjualan/SuratJalan', [
            'suratJalans' => $suratJalans
        ]);
    }

    /**
     * 2. Mengarahkan Tombol Truk dari Sales Order ke Form Surat Jalan Baru
     */
    public function create(Request $request)
    {
        $id_pesanan = $request->query('so_id');

        // CEK APAKAH PESANAN INI SUDAH PERNAH DIBUATKAN SURAT JALAN
        $sudahAdaSJ = DB::table('t_surat_jalan')
            ->where('id_pesanan', $id_pesanan)
            ->exists();

        if ($sudahAdaSJ) {
            return redirect()->back()->withErrors([
                'pesanan' => 'Surat Jalan untuk pesanan ini sudah pernah diterbitkan!'
            ]);
        }

        $pesanan = DB::table('t_pesanan')
            ->leftJoin('t_mitra', 't_pesanan.id_mitra', '=', 't_mitra.id_mitra')
            ->select('t_pesanan.*', 't_mitra.nama_mitra')
            ->where('t_pesanan.id_pesanan', $id_pesanan)
            ->first();

        return Inertia::render('Penjualan/SuratJalanForm', [
            'pesanan' => $pesanan
        ]);
    }

    /**
     * 3. Menyimpan Data Post dari SuratJalanForm.tsx
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_pengirim' => 'required',
            'kendaraan'     => 'required',
            'no_plat'       => 'required',
        ]);

        DB::beginTransaction();
        try {
            $lastId = DB::table('t_surat_jalan')->max('id_surat_jalan') ?? 0;
            $tanggal = date('Ymd');
            $nomorUrut = str_pad($lastId + 1, 4, '0', STR_PAD_LEFT);
            $noSuratJalan = "SJ-{$tanggal}-{$nomorUrut}";

            DB::table('t_surat_jalan')->insert([
                'no_surat_jalan'   => $noSuratJalan,
                'tgl_surat_jalan'  => date('Y-m-d'),
                'id_pesanan'       => $request->id_pesanan ?? null,
                'id_konsinyasi'    => $request->id_konsinyasi ?? null, 
                'nama_pengirim'    => $request->nama_pengirim,
                'kendaraan'        => $request->kendaraan,
                'no_plat'          => $request->no_plat,
                'status'           => 'Diproses',
                'created_at'       => now(),
                'updated_at'       => now()
            ]);

            DB::commit();
            return redirect('/surat-jalan');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->withErrors(['error' => 'Gagal DB: ' . $e->getMessage()]);
        }
    }

    /**
     * 4. Mengubah Status Pengiriman Secara Inline
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:Diproses,Dikirim,Terkirim'
        ]);

        DB::table('t_surat_jalan')
            ->where('id_surat_jalan', $id)
            ->update([
                'status' => $request->status, 
                'updated_at' => now()
            ]);

        return redirect()->back()->with('success', 'Status pengiriman berhasil diperbarui!');
    }

    /**
     * 5. Menghapus Dokumen Surat Jalan
     */
    public function destroy($id)
    {
        try {
            $sj = DB::table('t_surat_jalan')->where('id_surat_jalan', $id)->first();
            
            if (!$sj) {
                return redirect()->back()->with('error', 'Data surat jalan tidak ditemukan.');
            }

            DB::table('t_surat_jalan')->where('id_surat_jalan', $id)->delete();
            return redirect()->back()->with('success', 'Surat Jalan berhasil dihapus.');
            
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
}
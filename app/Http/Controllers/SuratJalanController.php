<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SuratJalanController extends Controller
{
    /**
     * 1. Menampilkan Daftar Surat Jalan (Halaman Utama SuratJalan.tsx)
     */
    /**
     * 1. Menampilkan Daftar Surat Jalan beserta Detail Barang
     */
    public function index()
    {
        $suratJalans = DB::table('t_surat_jalan')
            ->leftJoin('t_pesanan', 't_surat_jalan.id_pesanan', '=', 't_pesanan.id_pesanan')
            ->leftJoin('t_mitra', 't_pesanan.id_mitra', '=', 't_mitra.id_mitra')
            ->select('t_surat_jalan.*', 't_pesanan.no_pesanan', 't_mitra.nama_mitra')
            ->orderBy('t_surat_jalan.id_surat_jalan', 'desc')
            ->get()
            ->map(function ($sj) {
                // SINKRONISASI: Kita cari detail pesanan berdasarkan id_pesanan milik tabel surat jalan
                $sj->items = DB::table('t_pesanan_detail')
                    ->leftJoin('t_produk', 't_pesanan_detail.id_produk', '=', 't_produk.id_produk')
                    ->select('t_pesanan_detail.*', 't_produk.nama_produk')
                    ->where('t_pesanan_detail.id_pesanan', $sj->id_pesanan) 
                    ->get();
                
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

        //CEK APAKAH PESANAN INI SUDAH PERNAH DIBUATKAN SURAT JALAN
        $sudahAdaSJ = DB::table('t_surat_jalan')
            ->where('id_pesanan', $id_pesanan)
            ->exists();

        if ($sudahAdaSJ) {
            // Jika sudah ada, kembalikan ke halaman sebelumnya dengan pesan error
            return redirect()->back()->withErrors([
                'pesanan' => 'Surat Jalan untuk pesanan ini sudah pernah diterbitkan!'
            ]);
        }

        // Jika lolos, ambil data seperti biasa
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
            'id_pesanan'    => 'required',
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

            // Insert ke t_surat_jalan dengan status default 'Diproses'
            DB::table('t_surat_jalan')->insert([
                'no_surat_jalan'   => $noSuratJalan,
                'tgl_surat_jalan'  => date('Y-m-d'),
                'id_pesanan'       => $request->id_pesanan,
                'id_konsinyasi'    => null, 
                'nama_pengirim'    => $request->nama_pengirim,
                'kendaraan'        => $request->kendaraan,
                'no_plat'          => $request->no_plat,
                'status'           => 'Diproses', // <--- Sinkron ENUM
                'created_at'       => now(),
                'updated_at'       => now()
            ]);

            // ❌ BAGIAN UPDATE STATUS t_pesanan YANG BIKIN ERROR SUDAH DIBUANG DARI SINI!

            DB::commit();

            return redirect('/surat-jalan');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->withErrors(['id_pesanan' => 'Gagal DB: ' . $e->getMessage()]);
        }
    }

    /**
     * 4. Mengubah Status Pengiriman Secara Inline (Diproses / Dikirim / Terkirim)
     */
    public function updateStatus(Request $request, $id)
    {
        // SINKRONISASI: Ubah validasi agar menerima input ENUM yang baru
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
        DB::table('t_surat_jalan')->where('id_surat_jalan', $id)->delete();

        return redirect()->back()->with('success', 'Dokumen Surat Jalan berhasil dihapus!');
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\KonsinyasiKeluar;
use App\Models\KonsinyasiKeluarDetail;
use App\Models\Mitra; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class KonsinyasiKeluarController extends Controller
{
    public function index()
    {
        // 1. LOGIKA GENERATE NOMOR URUT OTOMATIS
        $hariIni = Carbon::now()->format('Ymd');
        $prefix = "CSG-OUT-" . $hariIni . "-";

        $terakhir = KonsinyasiKeluar::where('no_konsinyasi', 'LIKE', $prefix . '%')
            ->orderBy('no_konsinyasi', 'desc')
            ->first();

        if ($terakhir) {
            $nomorStr = substr($terakhir->no_konsinyasi, -3);
            $urutanBaru = intval($nomorStr) + 1;
        } else {
            $urutanBaru = 1;
        }

        $nextNoKonsinyasi = $prefix . str_pad($urutanBaru, 3, '0', STR_PAD_LEFT);

        // 2. AMBIL DATA PENDUKUNG
        $dataProduk = DB::table('t_produk')
            ->join('t_harga_produk', 't_produk.id_produk', '=', 't_harga_produk.id_produk')
            ->select(
                't_produk.id_produk', 
                't_produk.kode_produk', 
                't_produk.nama_produk', 
                't_produk.satuan_produk as satuan', 
                't_harga_produk.harga as harga_konsinyasi',
                't_harga_produk.id_harga_produk as id_harga' 
            )
            ->where('t_harga_produk.jenis_transaksi', 'Konsinyasi')
            ->get();

        $dataMitra = DB::table('t_mitra')->select('id_mitra', 'kode_mitra', 'nama_mitra as nama_toko', 'alamat')->get();

        $dataKonsinyasi = DB::table('t_konsinyasi_keluar')
            ->join('t_mitra', 't_konsinyasi_keluar.id_mitra', '=', 't_mitra.id_mitra')
            ->select(
                't_konsinyasi_keluar.id_konsinyasi_keluar as id_konsinyasi_keluar', 
                't_konsinyasi_keluar.no_konsinyasi as no_order',
                't_konsinyasi_keluar.tgl_konsinyasi as tgl_keluar',
                't_konsinyasi_keluar.id_mitra',
                't_konsinyasi_keluar.total_estimasi',
                't_konsinyasi_keluar.keterangan', 
                't_mitra.nama_mitra as nama_toko',
                't_mitra.alamat',
                DB::raw("CASE 
                    WHEN t_konsinyasi_keluar.status = 'Titip' THEN 'Draf'
                    WHEN t_konsinyasi_keluar.status = 'SJ' THEN 'Surat Jalan'
                    ELSE 'Selesai' 
                END as status")
            )
            ->orderBy('t_konsinyasi_keluar.id_konsinyasi_keluar', 'desc') 
            ->get();

        foreach ($dataKonsinyasi as $k) {
            $k->items = DB::table('t_konsinyasi_keluar_detail')
                ->join('t_produk', 't_konsinyasi_keluar_detail.id_produk', '=', 't_produk.id_produk')
                // PERBAIKAN: Menggunakan nama kolom baru id_konsinyasi_keluar
                ->where('t_konsinyasi_keluar_detail.id_konsinyasi_keluar', $k->id_konsinyasi_keluar)
                ->select(
                    't_konsinyasi_keluar_detail.id_produk', 
                    't_produk.nama_produk', 
                    't_konsinyasi_keluar_detail.qty', 
                    't_konsinyasi_keluar_detail.harga_titip',
                    't_konsinyasi_keluar_detail.id_harga'
                )
                ->get();
        }

        return Inertia::render('Konsinyasi/KonsinyasiKeluar', [
            'dataMitra' => $dataMitra,
            'dataProduk' => $dataProduk,
            'dataKonsinyasi' => $dataKonsinyasi,
            'nextNoKonsinyasi' => $nextNoKonsinyasi
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'no_order' => 'required|unique:t_konsinyasi_keluar,no_konsinyasi',
            'tgl_keluar' => 'required|date',
            'id_mitra' => 'required',
            'items' => 'required|array|min:1',
        ]);

        try {
            DB::beginTransaction();
            
            $totalEstimasi = 0;
            foreach ($request->items as $item) {
                $totalEstimasi += $item['harga_titip'] * $item['qty'];
            }

            // Ganti Eloquent ke DB Table Insert biasa untuk menghindari bug ketidaksinkronan nama PK di Model
            $id_konsinyasi_keluar = DB::table('t_konsinyasi_keluar')->insertGetId([
                'no_konsinyasi'  => $request->no_order,
                'tgl_konsinyasi' => $request->tgl_keluar,
                'id_mitra'       => $request->id_mitra,
                'total_estimasi' => $totalEstimasi,
                'status'         => 'Titip', 
                'keterangan'     => $request->keterangan,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            foreach ($request->items as $item) {
                DB::table('t_konsinyasi_keluar_detail')->insert([
                    'id_konsinyasi_keluar' => $id_konsinyasi_keluar, // Menggunakan nama kolom baru hasil migrasi
                    'id_produk'            => $item['id_produk'],
                    'qty'                  => $item['qty'],
                    'id_harga'             => $item['id_harga'], // PERBAIKAN: ID harga resmi dimasukkan
                    'harga_titip'          => $item['harga_titip'], // Snapshot harga dikunci
                    'subtotal'             => $item['harga_titip'] * $item['qty'],
                    'created_at'           => now(),
                    'updated_at'           => now(),
                ]);
            }

            DB::commit();
            return redirect()->back();
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();
            
            $totalEstimasiBaru = 0;
            foreach ($request->items as $item) {
                $totalEstimasiBaru += $item['harga_titip'] * $item['qty'];
            }

            // Update menggunakan DB Query Builder agar dijamin aman
            DB::table('t_konsinyasi_keluar')
                ->where('id_konsinyasi_keluar', $id)
                ->update([
                    'id_mitra'       => $request->id_mitra,
                    'tgl_konsinyasi' => $request->tgl_keluar,
                    'total_estimasi' => $totalEstimasiBaru,
                    'keterangan'     => $request->keterangan,
                    'updated_at'     => now(),
                ]);

            // Hapus detail lama dan pasang yang baru secara bersih
            DB::table('t_konsinyasi_keluar_detail')->where('id_konsinyasi_keluar', $id)->delete(); 
            
            foreach ($request->items as $item) {
                DB::table('t_konsinyasi_keluar_detail')->insert([
                    'id_konsinyasi_keluar' => $id,
                    'id_produk'            => $item['id_produk'],
                    'qty'                  => $item['qty'],
                    'id_harga'             => $item['id_harga'], // PERBAIKAN: ID harga saat diupdate
                    'harga_titip'          => $item['harga_titip'],
                    'subtotal'             => $item['harga_titip'] * $item['qty'],
                    'created_at'           => now(),
                    'updated_at'           => now(),
                ]);
            }

            DB::commit();
            return redirect()->back();
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function generateSj(Request $request, $id)
    {
        $request->validate([
            'pengirim' => 'required',
            'kendaraan' => 'required'
        ]);

        try {
            DB::beginTransaction();
            
            $konsinyasi = DB::table('t_konsinyasi_keluar')
                ->join('t_mitra', 't_konsinyasi_keluar.id_mitra', '=', 't_mitra.id_mitra')
                ->select('t_konsinyasi_keluar.*', 't_mitra.alamat')
                ->where('t_konsinyasi_keluar.id_konsinyasi_keluar', $id) // PERBAIKAN: id_konsinyasi_keluar
                ->first();

            if (!$konsinyasi) {
                return redirect()->back()->withErrors(['error' => 'Data konsinyasi tidak ditemukan.']);
            }

            $sudahAdaSj = DB::table('t_surat_jalan')->where('id_konsinyasi', $id)->exists();
            if ($sudahAdaSj || $konsinyasi->status === 'SJ') {
                DB::rollBack();
                return redirect()->back()->withErrors([
                    'error' => '⚠️ Gagal: Surat jalan untuk dokumen konsinyasi ini sudah pernah digenerate!'
                ]);
            }

            $hariIni = date('Ymd');
            $prefixSj = "SJ-CSG-" . $hariIni . "-";
            
            $terakhirSj = DB::table('t_surat_jalan')
                ->where('no_surat_jalan', 'LIKE', $prefixSj . '%')
                ->orderBy('no_surat_jalan', 'desc')
                ->first();

            if ($terakhirSj) {
                $nomorStr = substr($terakhirSj->no_surat_jalan, -3);
                $urutanBaru = intval($nomorStr) + 1;
            } else {
                $urutanBaru = 1;
            }
            $noSuratJalan = $prefixSj . str_pad($urutanBaru, 3, '0', STR_PAD_LEFT);

            $kendaraanFull = $request->kendaraan;
            $noPlat = '';
            if (preg_match('/(.*)\s\((.*)\)/', $kendaraanFull, $matches)) {
                $kendaraanFull = trim($matches[1]);
                $noPlat = trim($matches[2]);
            }

            DB::table('t_surat_jalan')->insert([
                'no_surat_jalan'   => $noSuratJalan,
                'tgl_surat_jalan'  => date('Y-m-d'),
                'id_pesanan'       => null, 
                'id_konsinyasi'    => $id, 
                'alamat'           => $konsinyasi->alamat,
                'nama_pengirim'    => $request->pengirim,
                'kendaraan'        => $kendaraanFull,
                'no_plat'          => $noPlat,
                'status'           => 'Diproses', 
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            DB::table('t_konsinyasi_keluar')
                ->where('id_konsinyasi_keluar', $id) // PERBAIKAN: id_konsinyasi_keluar
                ->update([
                    'status' => 'SJ',
                    'keterangan' => $request->keterangan,
                    'updated_at' => now()
                ]);

            DB::commit();
            return redirect()->back();
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function delete($id)
    {
        try {
            DB::beginTransaction();
            
            // Menggunakan query builder murni agar cascade penghapusan berjalan mulus
            DB::table('t_konsinyasi_keluar_detail')->where('id_konsinyasi_keluar', $id)->delete();
            DB::table('t_konsinyasi_keluar')->where('id_konsinyasi_keluar', $id)->delete();

            DB::commit();
            return redirect()->back();
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
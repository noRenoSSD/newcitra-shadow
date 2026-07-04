<?php

namespace App\Http\Controllers;
use App\Services\InventoryService;
use App\Models\HasilProduksi;
use App\Models\PemakaianBahan;
use App\Models\DetailJadwalProduksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HasilProduksiController extends Controller
{
    public function index()
    {
        // 1. Ambil semua hasil produksi yang sudah selesai untuk ditampilkan di tabel
        $hasilProduksi = HasilProduksi::with(['detailJadwal.produk', 'pemakaianBahan.bahan'])
            ->orderBy('created_at', 'desc')
            ->get();

        // 2. Ambil jadwal produksi yang sudah 'Approved' sebagai sumber form "Tambah Produksi"
        // Kita load kebutuhan_bahan agar data snapshot (standar) tersedia untuk dihitung selisihnya
        $jadwalProduksi = DetailJadwalProduksi::with(['produk', 'kebutuhanBahan.detailBom.bahan'])
            ->whereHas('jadwalProduksi', function($q) {
                $q->where('status_jadwal', 'Approved');
            })
            ->get();

        return Inertia::render('Produksi/HasilProduksi', [
            'hasilProduksi' => $hasilProduksi,
            'jadwalProduksi' => $jadwalProduksi
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_produksi'        => 'required|exists:t_detail_jadwal_produksi,id_produksi',
            'output_aktual'      => 'required|numeric|min:0',
            'tanggal_produksi'   => 'required|date',
            'tanggal_kadaluarsa' => 'required|date',
            'items'              => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            // 1. Simpan Header Hasil Produksi
            $hasil = HasilProduksi::create([
                'id_produksi'        => $request->id_produksi,
                'output_aktual'      => $request->output_aktual,
                'tanggal_produksi'   => $request->tanggal_produksi,
                'tanggal_kadaluarsa' => $request->tanggal_kadaluarsa,
                'status'             => 'Selesai',
            ]);

            $detailJadwal = DetailJadwalProduksi::findOrFail($request->id_produksi);
            $idProduk = $detailJadwal->id_produk;

            // 2. Simpan Detail Pemakaian Bahan & Kurangi Stok Bahan Baku
            foreach ($request->items as $item) {
                $selisih = $item['qty_aktual'] - $item['kalkulasi_standar'];

                PemakaianBahan::create([
                    'id_hasil_produksi' => $hasil->id_hasil_produksi,
                    'id_bahan'          => $item['id_bahan'],
                    'qty_aktual'        => $item['qty_aktual'],
                    'selisih'           => $selisih,
                ]);

                // ======== KODE KARTU PERSEDIAAN (BARANG KELUAR) ========
                InventoryService::catatMutasi(
                    $item['id_bahan'],              // FIX: Ubah $bahan jadi $item
                    'bahan',                        // Tipe: bahan
                    'KELUAR',                       // Transaksi KELUAR
                    'produksi_keluar',              // Sumbernya dari produksi
                    'PROD-' . $request->id_produksi,// FIX: Referensi dari ID produksi
                    $item['qty_aktual'],            // FIX: Ubah $bahan jadi $item
                    0,                              // HARGA ISI 0 SAJA!
                    $request->tanggal_produksi,     // Tanggal produksi
                    "Dipakai untuk produksi pabrik"
                );
            } // <--- FIX: INI KURUNG KURAWAL TUTUP FOREACH YANG HILANG TADI

            DB::commit();
            return redirect()->back()->with('success', 'Data hasil produksi & stok berhasil disimpan!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan: ' . $e->getMessage()]);
        }
    }
} // <--- PASTIKAN HANYA ADA 1 KURUNG KURAWAL DI PALING BAWAH FILE (Penutup Class)

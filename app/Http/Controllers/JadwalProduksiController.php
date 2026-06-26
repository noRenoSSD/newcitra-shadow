<?php

namespace App\Http\Controllers;

use App\Models\JadwalProduksi;
use App\Models\Produk;
use App\Models\Bom;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JadwalProduksiController extends Controller
{
    public function index()
    {
        $jadwal = JadwalProduksi::with(['detailProduksi.produk', 'detailProduksi.bom'])
            ->orderBy('tanggal_dibuat', 'desc')
            ->get();

        $produk = Produk::select('id_produk', 'kode_produk', 'nama_produk')->get();
        // Pastikan id_bom ditarik agar React bisa membacanya
        $bom = Bom::select('id_bom', 'kode_bom', 'nama_resep', 'satuan_batch')->get();

        // ─── LOGIKA AUTO-INCREMENT KODE JADWAL ───
        $currentYear = date('Y');
        $lastJadwal = JadwalProduksi::where('kode_jadwal', 'like', "JDW-$currentYear-%")
            ->orderBy('kode_jadwal', 'desc')
            ->first();

        if ($lastJadwal) {
            // Ambil 4 digit terakhir, jadikan integer, tambah 1
            $lastNumber = intval(substr($lastJadwal->kode_jadwal, -4));
            $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '0001';
        }
        $nextKodeJadwal = "JDW-$currentYear-$nextNumber";

        return Inertia::render('Produksi/JadwalProduksi', [
            'jadwals' => $jadwal, 
            'masterProduk' => $produk,
            'masterBom' => $bom,
            'nextKodeJadwal' => $nextKodeJadwal // Lempar kode otomatis ke React
        ]);
    }
}
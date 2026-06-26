<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TransaksiPengeluaran;
use App\Models\Pengeluaran; // Pastikan model master pengeluaran di-import
use Inertia\Inertia;

class TransaksiPengeluaranController extends Controller
{
    /**
     * Menampilkan daftar transaksi pengeluaran dan form tambah data.
     */
    public function index()
    {
        // 1. Ambil semua data transaksi beserta data relasi master pengeluarannya
        $transaksis = TransaksiPengeluaran::with('masterPengeluaran')
            ->orderBy('tgl_transaksi', 'desc')
            ->get();

        // 2. Ambil semua data dari master pengeluaran untuk pilihan dropdown di form
        $pengeluarans = Pengeluaran::all();

        // 3. Render ke halaman React (Inertia)
        // Sesuaikan 'TransaksiPengeluaran/Index' dengan struktur folder js/Pages kamu
        return Inertia::render('TransaksiPengeluaran', [
    'transaksis' => $transaksis,
    'pengeluarans' => $pengeluarans
]);
    }

    /**
     * Menyimpan data transaksi pengeluaran baru ke database.
     */
    public function store(Request $request)
    {
        // 1. Validasi input dari form React
        $request->validate([
            'id_pengeluaran'    => 'required|exists:t_pengeluaran,id_pengeluaran',
            'no_transaksi'      => 'required|string|max:20',
            'tgl_transaksi'     => 'required|date',
            'total_transaksi'   => 'required|numeric',
            'metode_bayar'     => 'required|in:Cash,transfer',
            'catatan'           => 'nullable|string',
        ]);

        // 2. Simpan data baru ke dalam tabel t_transaksi_pengeluaran
        TransaksiPengeluaran::create([
            'id_pengeluaran'    => $request->id_pengeluaran,
            'no_transaksi'      => $request->no_transaksi,
            'tgl_transaksi'     => $request->tgl_transaksi,
            'total_transaksi'   => $request->total_transaksi,
            'metode_bayar'     => $request->metode_bayar,
            'catatan'           => $request->catatan,
        ]);

        // 3. Redirect kembali ke halaman dengan membawa pesan sukses
        return redirect()->back()->with('message', 'Transaksi pengeluaran berhasil ditambahkan!');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\PermintaanPembelian;
use App\Models\DetailPP;
use App\Models\DetailJadwalProduksi;
use App\Models\Bahan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PermintaanPembelianController extends Controller
{
    public function index()
    {
        $permintaans = PermintaanPembelian::with([
            'details.bahan',
            'detailJadwal.produk',
            'detailJadwal.jadwalProduksi'
        ])->orderBy('tgl_pp', 'desc')->get();

        $jadwals = DetailJadwalProduksi::with([
            'jadwalProduksi',
            'produk',
            'kebutuhanBahan.detailBom.bahan'
        ])
        ->whereHas('jadwalProduksi', fn($q) => $q->where('status_jadwal', 'Approved'))
        ->get();

        $bahans = Bahan::orderBy('jenis_bahan')->orderBy('nama_bahan')->get();

        $nextNoPp = [
            'baku'     => PermintaanPembelian::generateNoPp('baku'),
            'penolong' => PermintaanPembelian::generateNoPp('penolong'),
            'tambahan' => PermintaanPembelian::generateNoPp('tambahan'),
        ];

        return Inertia::render('Pembelian/PermintaanPembelian', compact(
            'permintaans', 'jadwals', 'bahans', 'nextNoPp'
        ));
    }

    public function store(Request $request)
    {
        $rules = [
            'jenis_bahan' => 'required|in:baku,penolong,tambahan',
            'tgl_pp' => 'required|date',
            'catatan' => 'nullable|string|max:255',
            'details' => 'required|array|min:1',
            'details.*.id_bahan' => 'required|exists:t_bahan,id_bahan',
            'details.*.qty_diminta' => 'required|numeric|min:0.01',
            'details.*.qty_kebutuhan' => 'required|numeric|min:0',
        ];

        // Validasi id_produksi hanya jika bukan bahan tambahan
        if ($request->jenis_bahan !== 'tambahan') {
            $rules['id_produksi'] = 'required|exists:t_detail_jadwal_produksi,id_produksi';
        }

        $request->validate($rules);

        DB::transaction(function () use ($request) {
            $permintaan = PermintaanPembelian::create([
                'no_pp' => PermintaanPembelian::generateNoPp($request->jenis_bahan),
                'tgl_pp' => $request->tgl_pp,
                'id_produksi' => $request->jenis_bahan === 'tambahan' ? null : $request->id_produksi,
                'jenis_bahan' => $request->jenis_bahan,
                'status' => 'diajukan',
                'catatan' => $request->catatan,
            ]);

            foreach ($request->details as $detail) {
                DetailPP::create([
                    'id_pp' => $permintaan->id_pp,
                    'id_bahan' => $detail['id_bahan'],
                    'qty_kebutuhan' => $detail['qty_kebutuhan'],
                    'qty_diminta' => $detail['qty_diminta'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Permintaan pembelian berhasil disimpan!');
    }

    public function destroy(int $id)
    {
        PermintaanPembelian::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Permintaan pembelian berhasil dihapus!');
    }
}

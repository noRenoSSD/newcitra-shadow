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

        // UPDATE: Filter jadwals agar kebutuhanBahan HANYA memuat bahan bermerek kategori_simpan = 'perishable'
        $jadwals = DetailJadwalProduksi::with([
            'jadwalProduksi',
            'produk',
            'kebutuhanBahan' => function($query) {
                $query->whereHas('detailBom.bahan', function($q) {
                    $q->where('kategori_simpan', 'perishable');
                });
            },
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
            'tgl_pp'                  => 'required|date',
            'jenis_bahan'             => 'required|in:baku,penolong,tambahan',
            'catatan'                 => 'nullable|string',
            'details'                 => 'required|array|min:1',
            'details.*.id_bahan'      => 'required|exists:t_bahan,id_bahan',
            'details.*.qty_diminta'   => 'required|numeric|min:0',
            'details.*.qty_kebutuhan' => 'required|numeric|min:0',
            'tgl_mulai_periode'       => 'nullable|date', // <-- Ditambahkan
            'tgl_akhir_periode'       => 'nullable|date', // <-- Ditambahkan
        ];

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
                'tgl_mulai_periode' => $request->tgl_mulai_periode ?? null, // <-- Ditambahkan
                'tgl_akhir_periode' => $request->tgl_akhir_periode ?? null, // <-- Ditambahkan
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

  public function getKebutuhanMingguan(Request $request)
    {
        $request->validate([
            'tgl_mulai' => 'required|date',
            'tgl_akhir' => 'required|date|after_or_equal:tgl_mulai'
        ]);

        $detailProduksi = DetailJadwalProduksi::with([
                'produk',
                'jadwalProduksi',
                'kebutuhanBahan' => function($query) {
                    $query->whereHas('detailBom.bahan', function($q) {
                        $q->where('kategori_simpan', 'non_perishable');
                    });
                },
                'kebutuhanBahan.detailBom.bahan'
            ])
            ->whereDate('tanggal_produksi', '>=', $request->tgl_mulai)
            ->whereDate('tanggal_produksi', '<=', $request->tgl_akhir)
            // PENGAMAN 1: Pastikan data induknya BENAR-BENAR ADA di database (bukan data yatim)
            ->whereHas('jadwalProduksi', function($q) {
                // PENGAMAN 2: Kebal terhadap huruf besar/kecil (Approved/approved)
                $q->where('status_jadwal', 'LIKE', '%Approved%');
            })
            ->get();

        if ($detailProduksi->isEmpty()) {
            return response()->json(['kebutuhan' => [], 'kodeProduksi' => []]);
        }

        $grouped = [];
        $kodeProduksiList = [];

        foreach ($detailProduksi as $produksi) {
            if ($produksi->kebutuhanBahan->isNotEmpty()) {

                // Ambil kode_produksi dengan aman
                $kode = $produksi->kode_produksi ?: ($produksi->jadwalProduksi->kode_produksi ?? 'PRD-' . $produksi->id_produksi);
                $kodeProduksiList[] = $kode;

                foreach ($produksi->kebutuhanBahan as $kb) {
                    $bahan = $kb->detailBom->bahan ?? null;
                    if (!$bahan) continue;

                    $idBahan = $bahan->id_bahan;
                    if (!isset($grouped[$idBahan])) {
                        $grouped[$idBahan] = [
                            'id_bahan' => $bahan->id_bahan,
                            'kode_bahan' => $bahan->kode_bahan,
                            'nama_bahan' => $bahan->nama_bahan,
                            'satuan_bahan' => $bahan->satuan_bahan,
                            'qty_kebutuhan' => 0,
                        ];
                    }
                    $grouped[$idBahan]['qty_kebutuhan'] += $kb->qty_kebutuhan;
                }
            }
        }

        $produksiBerisiBahan = $detailProduksi->filter(fn($p) => $p->kebutuhanBahan->isNotEmpty())->first();
        $idProduksiAnchor = $produksiBerisiBahan ? $produksiBerisiBahan->id_produksi : null;

        if (empty($grouped)) {
            return response()->json(['kebutuhan' => [], 'kodeProduksi' => []]);
        }

        return response()->json([
            'kebutuhan' => array_values($grouped),
            'kodeProduksi' => array_unique($kodeProduksiList),
            'idProduksiAnchor' => $idProduksiAnchor,
        ]);
    }
}

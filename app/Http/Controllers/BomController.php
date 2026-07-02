<?php

namespace App\Http\Controllers;

use App\Models\Bom;
use App\Models\DetailBom;
use App\Models\Produk;
use App\Models\Bahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BomController extends Controller
{
    public function index()
    {
        $boms = Bom::with(['produk', 'detailBoms.bahan'])->get()->map(function ($bom) {
            return [
                'id'          => $bom->id_bom,
                'kodeBOM'     => $bom->kode_bom,
                'kodeProduk'  => $bom->produk->id_produk ?? '',
                'namaProduk'  => $bom->produk->nama_produk ?? 'Unknown',
                'namaResep'   => $bom->nama_resep,
                'qtyBatch'    => $bom->qty_batch,
                'satuanBatch' => $bom->satuan_batch,
                'lastUpdated' => $bom->updated_at->format('d M Y'),
                'details'     => $bom->detailBoms->map(function ($detail) {
                    return [
                        'id'           => $detail->id_detail_bom,
                        'kodeMaterial' => $detail->id_bahan,
                        'namaMaterial' => $detail->bahan->nama_bahan ?? 'Unknown',
                        'jumlahBahan'  => (float) $detail->jumlah_bahan,
                        'satuan'       => $detail->bahan->satuan ?? '',
                    ];
                }),
            ];
        });

        return inertia('Master/DataKebutuhanMaterial', [
            'boms'         => $boms,
            'produkList'   => Produk::all(),
            'materialList' => Bahan::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_bom'              => 'required|string|unique:t_bom,kode_bom',
            'id_produk'             => 'required',
            'nama_resep'            => 'required|string|max:255',
            'qty_batch'             => 'required|numeric|min:1',
            'satuan_batch'          => 'required|string|max:20',
            'details'               => 'required|array|min:1',
            'details.*.id_bahan'    => 'required',
            'details.*.jumlah_bahan'=> 'required|numeric|min:0.1',
        ]);

        DB::transaction(function () use ($request) {
            $bom = Bom::create([
                'kode_bom'    => $request->kode_bom,
                'id_produk'   => $request->id_produk,
                'nama_resep'  => $request->nama_resep,
                'qty_batch'   => $request->qty_batch,
                'satuan_batch'=> $request->satuan_batch,
            ]);

            foreach ($request->details as $detail) {
                DetailBom::create([
                    'id_bom'      => $bom->id_bom,
                    'id_bahan'    => $detail['id_bahan'],
                    'jumlah_bahan'=> $detail['jumlah_bahan'],
                ]);
            }
        });

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'kode_bom'              => 'required|string|unique:t_bom,kode_bom,' . $id . ',id_bom',
            'id_produk'             => 'required',
            'nama_resep'            => 'required|string|max:255',
            'qty_batch'             => 'required|numeric|min:1',
            'satuan_batch'          => 'required|string|max:20',
            'details'               => 'required|array|min:1',
            'details.*.id_bahan'    => 'required',
            'details.*.jumlah_bahan'=> 'required|numeric|min:0.1',
        ]);

        DB::transaction(function () use ($request, $id) {
            $bom = Bom::findOrFail($id);

            // ── 1. Update header BOM ─────────────────────────────────────────
            $bom->update([
                'kode_bom'    => $request->kode_bom,
                'id_produk'   => $request->id_produk,
                'nama_resep'  => $request->nama_resep,
                'qty_batch'   => $request->qty_batch,
                'satuan_batch'=> $request->satuan_batch,
            ]);

            // ── 2. Kumpulkan ID detail yang dikirim dari form ────────────────
            $incomingDetails = collect($request->details ?? []);

            // ID yang ada di form (baris lama yang masih dipertahankan)
            $keptIds = $incomingDetails
                ->pluck('id')         // 'id' = id_detail_bom dari frontend
                ->filter()            // buang null / 0 (baris baru belum punya id)
                ->map(fn($v) => (int) $v)
                ->values();

            // ── 3. Hapus HANYA baris yang:
            //         a) dihilangkan dari form (tidak ada di $keptIds)
            //     DAN b) belum pernah dipakai di t_kebutuhan_bahan
            //
            //   Baris yang sudah ada di t_kebutuhan_bahan TIDAK dihapus
            //   agar data snapshot kebutuhan bahan tetap bisa di-join.
            DetailBom::where('id_bom', $bom->id_bom)
                ->whereNotIn('id_detail_bom', $keptIds)
                ->whereNotExists(function ($query) {
                    $query->select(DB::raw(1))
                          ->from('t_kebutuhan_bahan')
                          ->whereColumn(
                              't_kebutuhan_bahan.id_detail_bom',
                              't_detail_bom.id_detail_bom'
                          );
                })
                ->delete();

            // ── 4. UPDATE baris lama / INSERT baris baru ─────────────────────
            foreach ($incomingDetails as $detail) {
                $detailId = isset($detail['id']) ? (int) $detail['id'] : 0;

                if ($detailId > 0) {
                    // Baris lama → UPDATE di tempat (id_detail_bom tidak berubah)
                    DetailBom::where('id_detail_bom', $detailId)
                              ->where('id_bom', $bom->id_bom) // safety check
                              ->update([
                                  'id_bahan'    => $detail['id_bahan'],
                                  'jumlah_bahan'=> $detail['jumlah_bahan'],
                              ]);
                } else {
                    // Baris baru → INSERT (dapat id_detail_bom baru)
                    DetailBom::create([
                        'id_bom'      => $bom->id_bom,
                        'id_bahan'    => $detail['id_bahan'],
                        'jumlah_bahan'=> $detail['jumlah_bahan'],
                    ]);
                }
            }
        });

        return redirect()->back();
    }

    public function destroy($id)
    {
        try {
            $bom = Bom::findOrFail($id);
            $bom->delete();

            return redirect()->back();
        } catch (\Illuminate\Database\QueryException $e) {
            // Kode 23000 mengindikasikan Integrity constraint violation (Foreign Key)
            if ($e->getCode() == "23000") {
                return back()->withErrors([
                    'delete' => 'BOM (Resep) ini tidak dapat dihapus karena sudah digunakan dalam Jadwal Produksi.'
                ]);
            }

            return back()->withErrors(['delete' => 'Terjadi kesalahan pada sistem saat menghapus data.']);
        }
    }
}
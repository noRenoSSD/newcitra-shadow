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
                'id' => $bom->id_bom,
                'kodeBOM' => $bom->kode_bom, // Mengambil langsung dari database
                'kodeProduk' => $bom->produk->id_produk ?? '', 
                'namaProduk' => $bom->produk->nama_produk ?? 'Unknown',
                'namaResep' => $bom->nama_resep,
                'qtyBatch' => $bom->qty_batch,
                'satuanBatch' => $bom->satuan_batch,
                'lastUpdated' => $bom->updated_at->format('d M Y'),
                'details' => $bom->detailBoms->map(function ($detail) {
                    return [
                        'id' => $detail->id_detail_bom,
                        'kodeMaterial' => $detail->id_bahan,
                        'namaMaterial' => $detail->bahan->nama_bahan ?? 'Unknown',
                        'jumlahBahan' => (float) $detail->jumlah_bahan,
                        'satuan' => $detail->bahan->satuan ?? '',
                    ];
                }),
            ];
        });

        return inertia('Master/DataKebutuhanMaterial', [ 
            'boms' => $boms,
            'produkList' => Produk::all(), 
            'materialList' => Bahan::all(), 
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_bom' => 'required|string|unique:t_bom,kode_bom',
            'id_produk' => 'required',
            'nama_resep' => 'required|string|max:255',
            'qty_batch' => 'required|numeric|min:1',
            'satuan_batch' => 'required|string|max:20',
            'details' => 'required|array|min:1',
            'details.*.id_bahan' => 'required',
            'details.*.jumlah_bahan' => 'required|numeric|min:0.1',
        ]);

        DB::transaction(function () use ($request) {
            $bom = Bom::create([
                'kode_bom' => $request->kode_bom,
                'id_produk' => $request->id_produk,
                'nama_resep' => $request->nama_resep,
                'qty_batch' => $request->qty_batch,
                'satuan_batch' => $request->satuan_batch,
            ]);

            foreach ($request->details as $detail) {
                DetailBom::create([
                    'id_bom' => $bom->id_bom,
                    'id_bahan' => $detail['id_bahan'],
                    'jumlah_bahan' => $detail['jumlah_bahan'],
                ]);
            }
        });

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'kode_bom' => 'required|string|unique:t_bom,kode_bom,' . $id . ',id_bom',
            'id_produk' => 'required',
            'nama_resep' => 'required|string|max:255',
            'qty_batch' => 'required|numeric|min:1',
            'satuan_batch' => 'required|string|max:20',
        ]);
        
        DB::transaction(function () use ($request, $id) {
            $bom = Bom::findOrFail($id);
            $bom->update([
                'kode_bom' => $request->kode_bom,
                'id_produk' => $request->id_produk,
                'nama_resep' => $request->nama_resep,
                'qty_batch' => $request->qty_batch,
                'satuan_batch' => $request->satuan_batch,
            ]);

            DetailBom::where('id_bom', $bom->id_bom)->delete();

            foreach ($request->details as $detail) {
                DetailBom::create([
                    'id_bom' => $bom->id_bom,
                    'id_bahan' => $detail['id_bahan'],
                    'jumlah_bahan' => $detail['jumlah_bahan'],
                ]);
            }
        });

        return redirect()->back();
    }

    public function destroy($id)
    {
        $bom = Bom::findOrFail($id);
        $bom->delete();

        return redirect()->back();
    }
}
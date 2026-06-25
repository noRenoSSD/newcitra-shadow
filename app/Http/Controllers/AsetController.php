<?php

namespace App\Http\Controllers;

use App\Models\Aset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AsetController extends Controller
{
    public function index()
    {
        return Inertia::render('Master/AsetTetap', [
            'dataAsetDariDB' => Aset::orderBy('id_aset', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_aset' => 'required',
            'tipe_aset' => 'required|in:mesin,kendaraan,peralatan',
            'tanggal_beli' => 'required|date',
            'harga_perolehan' => 'required|numeric',
            'umur_ekonomis' => 'required|numeric',
            'nilai_sisa' => 'required|numeric',
        ]);

        Aset::create([
            'kode_aset'       => Aset::generateKode(),
            'nama_aset'       => $request->nama_aset,
            'tipe_aset'       => $request->tipe_aset,
            'tanggal_beli'    => $request->tanggal_beli,
            'harga_perolehan' => $request->harga_perolehan,
            'umur_ekonomis'   => $request->umur_ekonomis,
            'nilai_sisa'      => $request->nilai_sisa,
        ]);

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_aset' => 'required',
            'tipe_aset' => 'required|in:mesin,kendaraan,peralatan',
            'tanggal_beli' => 'required|date',
            'harga_perolehan' => 'required|numeric',
            'umur_ekonomis' => 'required|numeric',
            'nilai_sisa' => 'required|numeric',
        ]);

        $aset = Aset::where('id_aset', $id)->firstOrFail();
        
        $aset->update([
            'nama_aset'       => $request->nama_aset,
            'tipe_aset'       => $request->tipe_aset,
            'tanggal_beli'    => $request->tanggal_beli,
            'harga_perolehan' => $request->harga_perolehan,
            'umur_ekonomis'   => $request->umur_ekonomis,
            'nilai_sisa'      => $request->nilai_sisa,
        ]);

        return redirect()->back();
    }

    public function destroy($id)
    {
        Aset::where('id_aset', $id)->delete();
        return redirect()->back();
    }
}
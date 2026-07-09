<?php
namespace App\Http\Controllers;

use App\Models\Bahan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BahanController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'jenis_bahan'     => 'required|in:baku,penolong',
            'kategori_simpan' => 'required_if:jenis_bahan,baku|in:perishable,non_perishable', // Wajib hanya jika bahan baku
            'nama_bahan'      => 'required|max:100',
            'satuan_bahan'    => 'required|max:20',
            'harga_beli'      => 'required|numeric|min:0',
        ]);

        Bahan::create([
            'kode_bahan'      => Bahan::generateKode($request->jenis_bahan),
            'jenis_bahan'     => $request->jenis_bahan,
            // Jika bahan baku gunakan input, jika penolong default-kan ke non_perishable
            'kategori_simpan' => $request->jenis_bahan === 'baku' ? $request->kategori_simpan : 'non_perishable',
            'nama_bahan'      => $request->nama_bahan,
            'satuan_bahan'    => $request->satuan_bahan,
            'harga_beli'      => $request->harga_beli,
        ]);

        return redirect()->back()->with('success', 'Bahan berhasil ditambah!');
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'jenis_bahan'     => 'required|in:baku,penolong',
            'kategori_simpan' => 'required_if:jenis_bahan,baku|in:perishable,non_perishable', // Wajib hanya jika bahan baku
            'nama_bahan'      => 'required|max:100',
            'satuan_bahan'    => 'required|max:20',
            'harga_beli'      => 'required|numeric|min:0',
        ]);

        $bahan = Bahan::findOrFail($id);

        // Cek jika jenis berubah, kode harus digenerate ulang
        $kode_bahan = $bahan->kode_bahan;
        if ($bahan->jenis_bahan !== $request->jenis_bahan) {
            $kode_bahan = Bahan::generateKode($request->jenis_bahan);
        }

        $bahan->update([
            'kode_bahan'      => $kode_bahan,
            'jenis_bahan'     => $request->jenis_bahan,
            // Jika bahan baku gunakan input, jika penolong default-kan ke non_perishable
            'kategori_simpan' => $request->jenis_bahan === 'baku' ? $request->kategori_simpan : 'non_perishable',
            'nama_bahan'      => $request->nama_bahan,
            'satuan_bahan'    => $request->satuan_bahan,
            'harga_beli'      => $request->harga_beli,
        ]);

        return redirect()->back()->with('success', 'Bahan berhasil diubah!');
    }

    public function destroy(int $id)
    {
        Bahan::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Bahan berhasil dihapus!');
    }

    public function indexBaku()
    {
        return Inertia::render('Master/BahanBaku', [
            'bahans' => Bahan::where('jenis_bahan', 'baku')->orderBy('id_bahan', 'desc')->get(),
        ]);
    }

    public function indexPenolong()
    {
        return Inertia::render('Master/BahanPenolong', [
            'bahans' => Bahan::where('jenis_bahan', 'penolong')->orderBy('id_bahan', 'desc')->get(),
        ]);
    }
}

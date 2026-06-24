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
            'jenis_bahan'  => 'required|in:baku,penolong',
            'nama_bahan'   => 'required|max:100',
            'satuan_bahan' => 'required|max:20',
            'stok_min'     => 'required|numeric',
        ]);

        Bahan::create([
            'kode_bahan'   => Bahan::generateKode($request->jenis_bahan),
            'jenis_bahan'  => $request->jenis_bahan,
            'nama_bahan'   => $request->nama_bahan,
            'satuan_bahan' => $request->satuan_bahan,
            'stok_min'     => $request->stok_min,
        ]);

        return redirect()->back()->with('success', 'Bahan berhasil ditambah!');
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'jenis_bahan'  => 'required|in:baku,penolong',
            'nama_bahan'   => 'required|max:100',
            'satuan_bahan' => 'required|max:20',
            'stok_min'     => 'required|numeric',
        ]);

        $bahan = Bahan::findOrFail($id);

        // Cek jika jenis berubah, kode harus digenerate ulang
        $kode_bahan = $bahan->kode_bahan;
        if ($bahan->jenis_bahan !== $request->jenis_bahan) {
            $kode_bahan = Bahan::generateKode($request->jenis_bahan);
        }

        $bahan->update([
            'kode_bahan'   => $kode_bahan,
            'jenis_bahan'  => $request->jenis_bahan,
            'nama_bahan'   => $request->nama_bahan,
            'satuan_bahan' => $request->satuan_bahan,
            'stok_min'     => $request->stok_min,
        ]);

        return redirect()->back()->with('success', 'Bahan berhasil diubah!');
    }

    public function destroy(int $id)
    {
        Bahan::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Bahan berhasil dihapus!');
    }

// Tambahkan 2 fungsi ini sebagai pengganti public function index()

 public function indexBaku()
{
    // WAJIB GANTI: Jangan sampai tertulis 'Master/Bahan'
    return Inertia::render('Master/BahanBaku', [
        'bahans' => Bahan::where('jenis_bahan', 'baku')->orderBy('id_bahan', 'desc')->get(),
    ]);
}

 public function indexPenolong()
{
    // WAJIB GANTI: Jangan sampai tertulis 'Master/Bahan'
    return Inertia::render('Master/BahanPenolong', [
        'bahans' => Bahan::where('jenis_bahan', 'penolong')->orderBy('id_bahan', 'desc')->get(),
    ]);
}

}

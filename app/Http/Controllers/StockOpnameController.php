<?php
namespace App\Http\Controllers;

use App\Models\Bahan;
use App\Models\Produk; // <-- 1. Pastikan Model Produk di-import
use App\Models\StockOpname;
use App\Models\StockOpnameDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockOpnameController extends Controller
{
    public function index()
    {
        // 2. Ambil data SO beserta detail bahan AND produk sekaligus
        $stockOpnames = StockOpname::with(['details.bahan', 'details.produk'])
            ->orderBy('tgl_so', 'desc')
            ->get();

        $bahans = Bahan::orderBy('jenis_bahan')->orderBy('nama_bahan')->get();

        // 3. Ambil data produk untuk pilihan di frontend
        $produks = Produk::orderBy('nama_produk')->get();

        // Generate no SO berikutnya untuk ditampilkan di form
        $last = StockOpname::orderBy('id_so', 'desc')->first();
        $lastNumber = $last ? (int) substr($last->no_so, 3) : 0;
        $nextNoSo = 'SO-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return Inertia::render('Persediaan/StockOpname', [
            'stockOpnames' => $stockOpnames,
            'bahans'       => $bahans,
            'produks'      => $produks, // <-- 4. Kirim data produk ke React
            'nextNoSo'     => $nextNoSo,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tgl_so'                    => 'required|date',
            'details'                   => 'required|array|min:1',
            // Ubah rule validasi menjadi nullable karena salah satu pasti kosong (Bahan atau Produk)
            'details.*.id_bahan'        => 'nullable|exists:t_bahan,id_bahan',
            'details.*.id_produk'       => 'nullable|exists:t_produk,id_produk',
            'details.*.qty_sistem'      => 'required|numeric|min:0',
            'details.*.qty_fisik'       => 'required|numeric|min:0',
            'details.*.qty_kadaluarsa'  => 'nullable|numeric|min:0',
        ]);

        $so = StockOpname::create([
            'no_so'   => StockOpname::generateNoSo(),
            'tgl_so'  => $request->tgl_so,
        ]);

        foreach ($request->details as $detail) {
            StockOpnameDetail::create([
                'id_so'           => $so->id_so,
                'id_bahan'        => $detail['id_bahan'] ?? null,  // Jika tidak ada bahan, set null
                'id_produk'       => $detail['id_produk'] ?? null, // Jika tidak ada produk, set null
                'qty_sistem'      => $detail['qty_sistem'],
                'qty_fisik'       => $detail['qty_fisik'],
                'qty_kadaluarsa'  => $detail['qty_kadaluarsa'] ?? 0,
            ]);
        }

        return redirect()->back()->with('success', 'Stock Opname berhasil disimpan!');
    }

    public function show(int $id)
    {
        // Pastikan halaman detail juga memuat data produk
        $so = StockOpname::with(['details.bahan', 'details.produk'])->findOrFail($id);

        return Inertia::render('StockOpname/Show', [
            'stockOpname' => $so,
        ]);
    }

    public function destroy(int $id)
    {
        StockOpname::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Stock Opname berhasil dihapus!');
    }
}

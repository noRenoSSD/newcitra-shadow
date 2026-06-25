<?php
namespace App\Http\Controllers;

use App\Models\Overhead;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OverheadController extends Controller
{
    public function index()
    {
        // Logika Auto-Numbering OVH-001
        $lastOverhead = Overhead::orderBy('id_overhead', 'desc')->first();

        if (!$lastOverhead) {
            $nextCode = 'OVH-001';
        } else {
            $lastCode = $lastOverhead->kode_overhead;
            $parts = explode('-', $lastCode);
            $number = (int) end($parts); 
            $number++;
            $nextCode = 'OVH-' . str_pad($number, 3, '0', STR_PAD_LEFT);
        }

        return Inertia::render('Master/Overhead', [
            'overheads' => Overhead::all(),
            'nextCode' => $nextCode
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_overhead' => 'required|unique:t_overhead,kode_overhead',
            'nama_overhead' => 'required|string|max:100',
            'keterangan' => 'nullable|string|max:255',
        ]);

        Overhead::create($request->all());
        return redirect()->back()->with('success', 'Data berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $overhead = Overhead::findOrFail($id);
        $overhead->update($request->all());
        return redirect()->back()->with('success', 'Data berhasil diperbarui');
    }

    public function destroy($id)
    {
        Overhead::destroy($id);
        return redirect()->back()->with('success', 'Data berhasil dihapus');
    }
}
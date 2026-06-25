<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AkunController extends Controller
{
    public function index()
    {
        return Inertia::render('Master/Akun', [
            'akuns' => Akun::orderBy('kode_akun', 'asc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_akun' => 'required|string|max:10|unique:t_akun,kode_akun',
            'nama_akun' => 'required|string|max:100',
            'kategori'  => 'required|string|max:255',
        ]);

        // Menggunakan $validated alih-alih $request->all() untuk mencegah Mass Assignment
        Akun::create($validated);
        
        return redirect()->back()->with('success', 'Data akun berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $akun = Akun::findOrFail($id);
        
        // Validasi update (kode_akun biasanya tidak boleh diubah jika sudah ada transaksi)
        $validated = $request->validate([
            'nama_akun' => 'required|string|max:100',
            'kategori'  => 'required|string|max:255',
        ]);

        $akun->update($validated);
        
        return redirect()->back()->with('success', 'Data akun berhasil diperbarui');
    }

    public function destroy($id)
    {
        Akun::destroy($id);
        
        return redirect()->back()->with('success', 'Data akun berhasil dihapus');
    }
}
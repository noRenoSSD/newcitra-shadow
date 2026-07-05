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
        // Tambahkan validasi untuk saldo_normal dan saldo_awal
        $validated = $request->validate([
            'kode_akun'    => 'required|string|max:10|unique:t_akun,kode_akun',
            'nama_akun'    => 'required|string|max:100',
            'kategori'     => 'required|string|max:255',
            'saldo_normal' => 'required|in:Debit,Kredit',
            'saldo_awal'   => 'required|numeric|min:0',
        ]);

        // Karena nama field di $validated sudah sama persis dengan di database, 
        // kita bisa langsung pakai $validated untuk create.
        Akun::create($validated);
        
        return redirect()->back()->with('success', 'Data akun beserta saldo awal berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $akun = Akun::findOrFail($id);
        
        // Pastikan kode_akun, saldo_normal, dan saldo_awal juga ikut divalidasi saat update
        $validated = $request->validate([
            'kode_akun'    => 'required|string|max:10|unique:t_akun,kode_akun,' . $id . ',id_akun',
            'nama_akun'    => 'required|string|max:100',
            'kategori'     => 'required|string|max:255',
            'saldo_normal' => 'required|in:Debit,Kredit',
            'saldo_awal'   => 'required|numeric|min:0',
        ]);

        $akun->update($validated);
        
        return redirect()->back()->with('success', 'Data akun beserta saldo awal berhasil diperbarui');
    }

    public function destroy($id)
    {
        Akun::destroy($id);
        
        return redirect()->back()->with('success', 'Data akun berhasil dihapus');
    }
}
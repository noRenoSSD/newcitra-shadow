<?php

namespace App\Http\Controllers;

use App\Models\Divisi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DivisiController extends Controller
{
    public function index()
    {
        // Logika Auto-Numbering DIV-001
        $lastDivisi = Divisi::orderBy('id_divisi', 'desc')->first();

        if (!$lastDivisi) {
            $nextCode = 'DIV-001';
        } else {
            $lastCode = $lastDivisi->kode_divisi;
            $parts = explode('-', $lastCode);
            $number = (int) end($parts); 
            $number++;
            $nextCode = 'DIV-' . str_pad($number, 3, '0', STR_PAD_LEFT);
        }

        return Inertia::render('Master/Divisi', [
            'divisis' => Divisi::all(),
            'nextCode' => $nextCode
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_divisi' => 'required|unique:t_divisi,kode_divisi',
            'nama_divisi' => 'required|string|max:100',
        ]);

        Divisi::create($request->all());
        return redirect()->back()->with('success', 'Data divisi berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $divisi = Divisi::findOrFail($id);
        
        $request->validate([
            'nama_divisi' => 'required|string|max:100',
        ]);

        $divisi->update($request->all());
        return redirect()->back()->with('success', 'Data divisi berhasil diperbarui');
    }

    public function destroy($id)
    {
        Divisi::destroy($id);
        return redirect()->back()->with('success', 'Data divisi berhasil dihapus');
    }
}
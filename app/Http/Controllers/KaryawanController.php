<?php

namespace App\Http\Controllers;

use App\Models\Karyawan; 
use Illuminate\Http\Request;
use Inertia\Inertia; 

class KaryawanController extends Controller
{
    public function index()
    {
        // 1. Logika Auto-Numbering KRY-001
        $lastKaryawan = Karyawan::orderBy('id_karyawan', 'desc')->first();

        if (!$lastKaryawan) {
            $nextCode = 'KRY-001';
        } else {
            $lastCode = $lastKaryawan->kode_karyawan;
            $parts = explode('-', $lastCode);
            $number = (int) end($parts); 
            $number++;
            $nextCode = 'KRY-' . str_pad($number, 3, '0', STR_PAD_LEFT);
        }

        // 2. Kirim data karyawan dan kode otomatis ke frontend
        return Inertia::render('Master/Karyawan', [
            'karyawans' => Karyawan::all(),
            'nextCode' => $nextCode
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_karyawan' => 'required|unique:t_karyawan,kode_karyawan',
            'nama_karyawan' => 'required|string|max:255',
            'jabatan' => 'required|string',
            'departemen' => 'required|string',
        ]);

        Karyawan::create($request->all());
        return redirect()->back()->with('success', 'Data berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $karyawan = Karyawan::findOrFail($id);
        $karyawan->update($request->all());
        return redirect()->back()->with('success', 'Data berhasil diperbarui');
    }

    public function destroy($id)
    {
        Karyawan::destroy($id);
        return redirect()->back()->with('success', 'Data berhasil dihapus');
    }
}
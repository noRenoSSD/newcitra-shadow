<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    // Menampilkan halaman utama
    public function index()
    {
        return Inertia::render('Master/Supplier', [
            // Mengambil data supplier terbaru
            'suppliers' => Supplier::orderBy('id', 'desc')->get(),
        ]);
    }

    public function create()
    {
        return redirect()->route('supplier.index');
    }

    // MENYIMPAN DATA (Input manual dari frontend)
    public function store(Request $request)
    {
        $request->validate([
            'kode_supplier'   => 'required|max:50|unique:suppliers,kode_supplier', // Wajib diisi & unik
            'nama_supplier'   => 'required|max:50',
            'kontak_supplier' => 'required|max:50',
            'alamat_supplier' => 'required|max:100',
        ]);

        Supplier::create([
            'kode_supplier'   => $request->kode_supplier, // Menangkap input teks manual
            'nama_supplier'   => $request->nama_supplier,
            'kontak_supplier' => $request->kontak_supplier,
            'alamat_supplier' => $request->alamat_supplier,
        ]);

        return redirect()->route('supplier.index')->with('success', 'Supplier berhasil ditambah!');
    }

    // UPDATE DATA (Kode supplier bisa ikut diedit)
    public function update(Request $request, int $id)
    {
        $request->validate([
            // Validasi unik, abaikan ID milik supplier ini sendiri agar tidak bentrok saat di-save
            'kode_supplier'   => 'required|max:50|unique:suppliers,kode_supplier,' . $id . ',id_supplier',
            'nama_supplier'   => 'required|max:50',
            'kontak_supplier' => 'required|max:50',
            'alamat_supplier' => 'required|max:100',
        ]);

        $supplier = Supplier::findOrFail($id);

        // Update semua field termasuk kode_supplier yang diedit manual
        $supplier->update($request->only(['kode_supplier', 'nama_supplier', 'kontak_supplier', 'alamat_supplier']));

        return redirect()->route('supplier.index')->with('success', 'Supplier berhasil diubah!');
    }

    public function destroy(int $id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return redirect()->route('supplier.index')->with('success', 'Supplier berhasil dihapus!');
    }
}

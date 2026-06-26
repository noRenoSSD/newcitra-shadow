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
        // 1. Ambil data supplier terbaru
        $suppliers = Supplier::orderBy('id', 'desc')->get();

        // 2. Panggil fungsi generator kode otomatis dari Model Supplier
        $kodeOtomatis = Supplier::generateKode();

        return Inertia::render('Master/Supplier', [
            'suppliers' => $suppliers,
            'kode_otomatis' => $kodeOtomatis // <-- Mengirim format SPL-0001, dst ke React
        ]);
    }

    // MENYIMPAN DATA
    public function store(Request $request)
    {
        $request->validate([
            // PENTING: Target tabel validasi diganti ke 't_supplier' agar tidak SQLSTATE Error lagi!
            'kode_supplier'   => 'required|max:50|unique:t_supplier,kode_supplier',
            'nama_supplier'   => 'required|max:50',
            'kontak_supplier' => 'required|max:50',
            'alamat_supplier' => 'required|max:100',
        ]);

        Supplier::create([
            'kode_supplier'   => $request->kode_supplier,
            'nama_supplier'   => $request->nama_supplier,
            'kontak_supplier' => $request->kontak_supplier,
            'alamat_supplier' => $request->alamat_supplier,
        ]);

        return redirect()->route('supplier.index')->with('success', 'Supplier berhasil ditambah!');
    }

    // UPDATE DATA
    public function update(Request $request, int $id)
    {
        $request->validate([
            // PENTING: Target tabel validasi diganti ke 't_supplier'
            'kode_supplier'   => 'required|max:50|unique:t_supplier,kode_supplier,' . $id . ',id',
            'nama_supplier'   => 'required|max:50',
            'kontak_supplier' => 'required|max:50',
            'alamat_supplier' => 'required|max:100',
        ]);

        $supplier = Supplier::findOrFail($id);
        $supplier->update($request->only(['kode_supplier', 'nama_supplier', 'kontak_supplier', 'alamat_supplier']));

        return redirect()->route('supplier.index')->with('success', 'Supplier berhasil diubah!');
    }

    // HAPUS DATA
    public function destroy(int $id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return redirect()->route('supplier.index')->with('success', 'Supplier berhasil dihapus!');
    }
}

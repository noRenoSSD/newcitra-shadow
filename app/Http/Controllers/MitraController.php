<?php

namespace App\Http\Controllers;

use App\Models\Mitra;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MitraController extends Controller
{
    public function index()
    {
        // --- 1. LOGIKA AUTO GENERATE KODE MITRA ---
        // Ambil data mitra terakhir berdasarkan id_mitra
        $lastMitra = Mitra::orderBy('id_mitra', 'desc')->first();
        
        if (!$lastMitra) {
            $nextKode = 'MTR-001';
        } else {
            // Mengambil angka di belakang 'MTR-' (misal 'MTR-004' diambil angka 4)
            $lastNumber = (int) substr($lastMitra->kode_mitra, 4);
            $nextNumber = $lastNumber + 1;
            
            // Format kembali menjadi MTR-00X (3 digit angka)
            $nextKode = 'MTR-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        }

        // --- 2. RENDER INERTIA DENGAN BERBAGI DATA KODE OTOMATIS ---
        return Inertia::render('Master/Mitra', [
            'nextKodeMitra' => $nextKode, // Kita kirim kode baru ini ke React
            'mitra' => Mitra::orderBy('id_mitra', 'desc')->get()->map(function($item) {
                return [
                    'id' => $item->id_mitra,
                    'kodeMitra' => $item->kode_mitra,
                    'namaMitra' => $item->nama_mitra,
                    'alamat' => $item->alamat,
                    'kota' => $item->kota,
                    'telepon' => $item->no_telp,
                    'kontakPerson' => $item->pic_mitra,
                    'status' => $item->status,
                ];
            }),
        ]);
    }

    public function create()
    {
        return redirect()->route('mitra.index');
    }

    public function store(Request $request)
    {
        $request->validate([
            'kodeMitra'    => 'required|max:10|unique:t_mitra,kode_mitra',
            'namaMitra'    => 'required|max:100',
            'alamat'       => 'required|max:100',
            'kota'         => 'required|max:100',
            'telepon'      => 'required|max:20',
            'kontakPerson' => 'required|max:100',
            'status'       => 'required|max:20',
        ]);

        Mitra::create([
            'kode_mitra' => $request->kodeMitra,
            'nama_mitra' => $request->namaMitra,
            'alamat'     => $request->alamat,
            'kota'       => $request->kota,
            'no_telp'    => $request->telepon,
            'pic_mitra'  => $request->kontakPerson,
            'status'     => $request->status,
        ]);

        return redirect()->route('mitra.index')
            ->with('success', 'Mitra berhasil ditambah!');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'kodeMitra'    => 'required|max:10|unique:t_mitra,kode_mitra,' . $id . ',id_mitra',
            'namaMitra'    => 'required|max:100',
            'alamat'       => 'required|max:100',
            'kota'         => 'required|max:100',
            'telepon'      => 'required|max:20',
            'kontakPerson' => 'required|max:100',
            'status'       => 'required|max:20',
        ]);

        $mitra = Mitra::findOrFail($id);

        $mitra->update([
            'kode_mitra' => $request->kodeMitra,
            'nama_mitra' => $request->namaMitra,
            'alamat'     => $request->alamat,
            'kota'       => $request->kota,
            'no_telp'    => $request->telepon,
            'pic_mitra'  => $request->kontakPerson,
            'status'     => $request->status,
        ]);

        return redirect()->route('mitra.index')
            ->with('success', 'Data mitra berhasil diubah!');
    }

    public function destroy(int $id)
    {
        $mitra = Mitra::findOrFail($id);
        $mitra->delete();

        return redirect()->route('mitra.index')
            ->with('success', 'Mitra berhasil dihapus!');
    }
}
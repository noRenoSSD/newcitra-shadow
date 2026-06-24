<?php

namespace App\Http\Controllers;

use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengeluaranController extends Controller
{
    public function index()
{
    $pengeluarans = Pengeluaran::all(); // sesuaikan dengan nama model kamu

    return inertia('Master/Pengeluaran', [
        'pengeluarans' => $pengeluarans
    ]);
}
    public function store(Request $request)
    {
        Pengeluaran::create($request->validate([
            'kode_pengeluaran' => 'required|string|max:20',
            'nama_pengeluaran' => 'required|string|max:50',
            'keterangan' => 'nullable|string|max:200',
        ]));
        return redirect()->back();
    }

    public function update(Request $request, int $id)
    {
        $pengeluaran = Pengeluaran::findOrFail($id);
        $pengeluaran->update($request->validate([
            'kode_pengeluaran' => 'required|string|max:20',
            'nama_pengeluaran' => 'required|string|max:50',
            'keterangan' => 'nullable|string|max:200',
        ]));
        return redirect()->back();
    }

    public function destroy(int $id)
    {
        Pengeluaran::findOrFail($id)->delete();
        return redirect()->back();
    }
}

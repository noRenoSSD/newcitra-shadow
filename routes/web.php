<?php
use App\Http\Controllers\BahanController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Rute untuk menampilkan halaman (dipisah)
Route::get('/bahan-baku', [BahanController::class, 'indexBaku']);
Route::get('/bahan-penolong', [BahanController::class, 'indexPenolong']);

// Rute untuk aksi simpan, edit, dan hapus (tetap digabung agar hemat kode)
Route::post('/bahan', [BahanController::class, 'store']);
Route::put('/bahan/{id}', [BahanController::class, 'update']);
Route::delete('/bahan/{id}', [BahanController::class, 'destroy']);

Route::resource('supplier', SupplierController::class);
Route::get('/', function () {
    return redirect('/login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

use App\Http\Controllers\ProdukController;

// Rute Master Produk Jadi
Route::get('/produk-jadi', [ProdukController::class, 'index'])->name('produk.index');
Route::post('/produk-jadi', [ProdukController::class, 'store']);
Route::put('/produk-jadi/{id_produk}', [ProdukController::class, 'update']);
Route::delete('/produk-jadi/{id_produk}', [ProdukController::class, 'destroy']);

use App\Http\Controllers\PengeluaranController;

// Rute Master Jenis Pengeluaran
Route::get('/jenis-pengeluaran', [PengeluaranController::class, 'index'])->name('pengeluaran.index');
Route::post('/jenis-pengeluaran', [PengeluaranController::class, 'store']);
Route::put('/jenis-pengeluaran/{id_pengeluaran}', [PengeluaranController::class, 'update']);
Route::delete('/jenis-pengeluaran/{id_pengeluaran}', [PengeluaranController::class, 'destroy']);

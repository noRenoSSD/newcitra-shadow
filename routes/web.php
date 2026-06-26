<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Kumpulan Import Controller (Dirapikan ke atas semua)
use App\Http\Controllers\BahanController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\MitraController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\HargaProdukController;
use App\Http\Controllers\PengeluaranController;
use App\Http\Controllers\PesananController;
use App\Http\Controllers\AsetController;
use App\Http\Controllers\KaryawanController;
use App\Http\Controllers\OverheadController;
use App\Http\Controllers\AkunController;
use App\Http\Controllers\TransaksiPengeluaranController;

// ... (rute lainnya)

// Menampilkan halaman transaksi
Route::get('/transaksi-pengeluaran', [TransaksiPengeluaranController::class, 'index'])->name('transaksi-pengeluaran.index');

// Menyimpan data transaksi baru
Route::post('/transaksi-pengeluaran', [TransaksiPengeluaranController::class, 'store'])->name('transaksi-pengeluaran.store');
// Rute untuk menampilkan halaman (dipisah)
Route::get('/bahan-baku', [BahanController::class, 'indexBaku']);
Route::get('/bahan-penolong', [BahanController::class, 'indexPenolong']);

// Rute untuk aksi simpan, edit, dan hapus (tetap digabung agar hemat kode)
Route::post('/bahan', [BahanController::class, 'store']);
Route::put('/bahan/{id}', [BahanController::class, 'update']);
Route::delete('/bahan/{id}', [BahanController::class, 'destroy']);

Route::resource('supplier', SupplierController::class);
Route::resource('mitra', MitraController::class);

// Rute Master Produk Jadi
Route::get('/produk', [ProdukController::class, 'index'])->name('produk.index');
// Route::post('/produk', [ProdukController::class, 'store']);
// Route::put('/produk/{id_produk}', [ProdukController::class, 'update']);
// Route::delete('/produk/{id_produk}', [ProdukController::class, 'destroy']);

// Rute Harga Produk
Route::post('/harga-produk', [HargaProdukController::class, 'store']);
Route::delete('/harga-produk/{id}', [HargaProdukController::class, 'destroy']);

// Rute Master Jenis Pengeluaran
Route::get('/jenis-pengeluaran', [PengeluaranController::class, 'index'])->name('pengeluaran.index');
Route::post('/jenis-pengeluaran', [PengeluaranController::class, 'store']);
Route::put('/jenis-pengeluaran/{id_pengeluaran}', [PengeluaranController::class, 'update']);
Route::delete('/jenis-pengeluaran/{id_pengeluaran}', [PengeluaranController::class, 'destroy']);

// Rute transaksi pengeluaran
Route::get('/transaksi-pengeluaran', [TransaksiPengeluaranController::class, 'index'])->name('transaksi-pengeluaran.index');
Route::post('/transaksi-pengeluaran', [TransaksiPengeluaranController::class, 'store'])->name('transaksi-pengeluaran.store');
// Rute Pesanan
Route::get('/pesanan', [PesananController::class, 'index'])->name('pesanan.index');
Route::post('pesanan', [PesananController::class, 'store'])->name('pesanan.store');

// --- RUTE ASET TETAP ---
Route::get('/aset', [AsetController::class, 'index'])->name('aset.index');
Route::post('/aset', [AsetController::class, 'store']);
Route::put('/aset/{id}', [AsetController::class, 'update']);
Route::delete('/aset/{id}', [AsetController::class, 'destroy']);

// --- RUTE KARYAWAN ---
Route::get('/karyawan', [KaryawanController::class, 'index']);
Route::post('/karyawan', [KaryawanController::class, 'store']);
Route::put('/karyawan/{id}', [KaryawanController::class, 'update']);
Route::delete('/karyawan/{id}', [KaryawanController::class, 'destroy']);

// --- RUTE OVERHEAD ---
Route::get('/overhead', [OverheadController::class, 'index']);
Route::post('/overhead', [OverheadController::class, 'store']);
Route::put('/overhead/{id}', [OverheadController::class, 'update']);
Route::delete('/overhead/{id}', [OverheadController::class, 'destroy']);

// --- RUTE AKUN ---
Route::get('/akun', [AkunController::class, 'index']);
Route::post('/akun', [AkunController::class, 'store']);
Route::put('/akun/{id}', [AkunController::class, 'update']);
Route::delete('/akun/{id}', [AkunController::class, 'destroy']);

// --- RUTE AUTH & DASHBOARD ---
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

<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Kumpulan Import Controller
use App\Http\Controllers\PermintaanPembelianController;
use App\Http\Controllers\StockOpnameController;
use App\Http\Controllers\BahanController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\MitraController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\HargaProdukController;
use App\Http\Controllers\PengeluaranController;
use App\Http\Controllers\PesananController;
use App\Http\Controllers\PenjualanController;
use App\Http\Controllers\AsetController;
use App\Http\Controllers\DivisiController;
use App\Http\Controllers\OverheadController;
use App\Http\Controllers\AkunController;
use App\Http\Controllers\TransaksiPengeluaranController;
use App\Http\Controllers\BomController;
use App\Http\Controllers\JadwalProduksiController;
use App\Http\Controllers\PersetujuanJadwalController;
use App\Http\Controllers\KebutuhanBahanController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\ApprovalPOController;
use App\Http\Controllers\PenerimaanBahanController;
use App\Http\Controllers\ReturPembelianController;
use App\Http\Controllers\HasilProduksiController;

// Rute Stok Opname
Route::prefix('persediaan/stok-opname')->name('stock-opname.')->group(function () {
    Route::get('/',        [StockOpnameController::class, 'index'])->name('index');
    Route::post('/',       [StockOpnameController::class, 'store'])->name('store');
    Route::get('/{id}',    [StockOpnameController::class, 'show'])->name('show');
    Route::delete('/{id}', [StockOpnameController::class, 'destroy'])->name('destroy');
});

// Rute Transaksi Pengeluaran
Route::get('/transaksi-pengeluaran', [TransaksiPengeluaranController::class, 'index'])->name('transaksi-pengeluaran.index');
Route::post('/transaksi-pengeluaran', [TransaksiPengeluaranController::class, 'store'])->name('transaksi-pengeluaran.store');

// Rute Master Bahan
Route::get('/bahan-baku', [BahanController::class, 'indexBaku']);
Route::get('/bahan-penolong', [BahanController::class, 'indexPenolong']);
Route::post('/bahan', [BahanController::class, 'store']);
Route::put('/bahan/{id}', [BahanController::class, 'update']);
Route::delete('/bahan/{id}', [BahanController::class, 'destroy']);

Route::resource('supplier', SupplierController::class);
Route::resource('mitra', MitraController::class);

// Rute Master Produk Jadi & Harga
Route::get('/produk', [ProdukController::class, 'index'])->name('produk.index');
Route::post('/produk', [ProdukController::class, 'store']);
Route::put('/produk/{id_produk}', [ProdukController::class, 'update']);
Route::delete('/produk/{id_produk}', [ProdukController::class, 'destroy']);

Route::post('/harga-produk', [HargaProdukController::class, 'store']);
Route::delete('/harga-produk/{id}', [HargaProdukController::class, 'destroy']);

// Rute Master Jenis Pengeluaran
Route::get('/jenis-pengeluaran', [PengeluaranController::class, 'index'])->name('pengeluaran.index');
Route::post('/jenis-pengeluaran', [PengeluaranController::class, 'store']);
Route::put('/jenis-pengeluaran/{id_pengeluaran}', [PengeluaranController::class, 'update']);
Route::delete('/jenis-pengeluaran/{id_pengeluaran}', [PengeluaranController::class, 'destroy']);

// Rute Pesanan & Dokumen Penjualan
Route::resource('pesanan', PesananController::class);
Route::get('/invoice/create', [PesananController::class, 'createInvoice'])->name('invoice.create');
Route::get('/surat-jalan/create', [PesananController::class, 'createSuratJalan'])->name('surat-jalan.create');
Route::post('/transaksi-penjualan', [PesananController::class, 'storeInvoice']);
Route::post('/transaksi-surat-jalan', [PesananController::class, 'storeSuratJalan']);

// Rute Finansial, Organisasi & Aset
Route::get('/aset', [AsetController::class, 'index'])->name('aset.index');
Route::post('/aset', [AsetController::class, 'store']);
Route::put('/aset/{id}', [AsetController::class, 'update']);
Route::delete('/aset/{id}', [AsetController::class, 'destroy']);

Route::get('/divisi', [DivisiController::class, 'index']);
Route::post('/divisi', [DivisiController::class, 'store']);
Route::put('/divisi/{id}', [DivisiController::class, 'update']);
Route::delete('/divisi/{id}', [DivisiController::class, 'destroy']);

Route::get('/overhead', [OverheadController::class, 'index']);
Route::post('/overhead', [OverheadController::class, 'store']);
Route::put('/overhead/{id}', [OverheadController::class, 'update']);
Route::delete('/overhead/{id}', [OverheadController::class, 'destroy']);

Route::get('/akun', [AkunController::class, 'index']);
Route::post('/akun', [AkunController::class, 'store']);
Route::put('/akun/{id}', [AkunController::class, 'update']);
Route::delete('/akun/{id}', [AkunController::class, 'destroy']);

// Rute Produksi (BOM & Penjadwalan)
Route::get('/kebutuhan-material', [BomController::class, 'index']);
Route::post('/kebutuhan-material', [BomController::class, 'store']);
Route::put('/kebutuhan-material/{id}', [BomController::class, 'update']);
Route::delete('/kebutuhan-material/{id}', [BomController::class, 'destroy']);

Route::get('/jadwal-produksi', [JadwalProduksiController::class, 'index']);
Route::post('/jadwal-produksi', [JadwalProduksiController::class, 'store']);
Route::put('/jadwal-produksi/{id}', [JadwalProduksiController::class, 'update']);
Route::delete('/jadwal-produksi/{id}', [JadwalProduksiController::class, 'destroy']);

Route::get('/persetujuan-jadwal', [PersetujuanJadwalController::class, 'index'])->name('persetujuan-jadwal.index');
Route::put('/persetujuan-jadwal/{id}', [PersetujuanJadwalController::class, 'updateStatus'])->name('persetujuan-jadwal.updateStatus');
Route::post('/kebutuhan-bahan', [KebutuhanBahanController::class, 'store']);

// Rute Penjualan (Transaksi & Detail)
Route::get('/transaksi-penjualan', [PenjualanController::class, 'index'])->name('transaksi-penjualan.index');
Route::post('/transaksi-penjualan', [PenjualanController::class, 'storeInvoice'])->name('transaksi-penjualan.store');
Route::get('/transaksi-penjualan/{id}', [PenjualanController::class, 'show'])->name('transaksi-penjualan.show');

// Dasar Autentikasi Redirection
Route::get('/', function () {
    return redirect('/login');
});


// --- KELOMPOK RUTE DENGAN PROTEKSI AUTHENTICATION (Kunci Perbaikan Di Sini) ---
Route::middleware('auth')->group(function () {

    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- RUTE PERMINTAAN PEMBELIAN ---
    Route::prefix('pembelian/permintaan')->name('pp.')->group(function () {
        Route::get('/', [PermintaanPembelianController::class, 'index'])->name('index');
        Route::get('/kebutuhan-mingguan', [PermintaanPembelianController::class, 'getKebutuhanMingguan'])->name('kebutuhan-mingguan');
        Route::post('/', [PermintaanPembelianController::class, 'store'])->name('store');
        Route::delete('/{id}', [PermintaanPembelianController::class, 'destroy'])->name('destroy');
    });

    // --- RUTE PESANAN PEMBELIAN (PURCHASE ORDER) ---
    Route::prefix('pembelian/pesanan')->name('po.')->group(function () {
        Route::get('/', [PurchaseOrderController::class, 'index'])->name('index');
        Route::post('/', [PurchaseOrderController::class, 'store'])->name('store');
        Route::put('/{id}', [PurchaseOrderController::class, 'update'])->name('update');
        Route::delete('/{id}', [PurchaseOrderController::class, 'destroy'])->name('destroy');
    });

    // --- RUTE APPROVAL PURCHASE ORDER (FINANCE) ---
    Route::prefix('keuangan/approval-po')->name('po-approval.')->group(function () {
        Route::get('/', [ApprovalPOController::class, 'index'])->name('index');
        Route::put('/{id}/setujui', [ApprovalPOController::class, 'setujui'])->name('setujui');
        Route::put('/{id}/revisi', [ApprovalPOController::class, 'revisi'])->name('revisi');
    });
// --- RUTE PENERIMAAN BAHAN (BAGIAN PRODUKSI) ---
    Route::prefix('pembelian/penerimaan-bahan')->name('penerimaan-bahan.')->group(function () {
        Route::get('/', [PenerimaanBahanController::class, 'index'])->name('index');
        Route::post('/', [PenerimaanBahanController::class, 'store'])->name('store');
    });
// --- RUTE RETUR PEMBELIAN ---
    Route::prefix('pembelian/retur-pembelian')->name('retur-pembelian.')->group(function () {
        Route::get('/', [ReturPembelianController::class, 'index'])->name('index');
        Route::post('/', [ReturPembelianController::class, 'store'])->name('store');
    });
Route::prefix('produksi/hasil-produksi')->name('hasil-produksi.')->group(function () {
        Route::get('/', [HasilProduksiController::class, 'index'])->name('index');
        Route::post('/', [HasilProduksiController::class, 'store'])->name('store');
    });
}); // Kurung kurawal penutup middleware auth utama berada di akhir rute internal

require __DIR__.'/auth.php';

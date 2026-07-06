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
use App\Http\Controllers\ReturJualController;
use App\Http\Controllers\SuratJalanController;
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
use App\Http\Controllers\PenyusutanAsetController;
use App\Http\Controllers\TransaksiPembelianController;
use App\Http\Controllers\KartuPersediaanController;
use App\Http\Controllers\ApprovalPemakaianBahanController;
use App\Http\Controllers\HargaPokokProduksiController;
use App\Http\Controllers\JurnalUmumController;
use App\Http\Controllers\JurnalPenyesuaianController;
use App\Http\Controllers\BukuBesarController;
use App\Http\Controllers\HutangUsahaController;

// Dasar Autentikasi Redirection
Route::get('/', function () {
    return redirect('/login');
});

// =====================================================================================
// SEMUA RUTE APLIKASI HARUS BERADA DI DALAM MIDDLEWARE AUTH AGAR AMAN DARI PENYUSUP
// =====================================================================================
Route::middleware('auth')->group(function () {

    // --- Dashboard & Profile ---
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- Master Data (Bahan, Supplier, Mitra, Aset, Akun, dll) ---
    Route::get('/bahan-baku', [BahanController::class, 'indexBaku']);
    Route::get('/bahan-penolong', [BahanController::class, 'indexPenolong']);
    Route::post('/bahan', [BahanController::class, 'store']);
    Route::put('/bahan/{id}', [BahanController::class, 'update']);
    Route::delete('/bahan/{id}', [BahanController::class, 'destroy']);

    Route::resource('supplier', SupplierController::class);
    Route::resource('mitra', MitraController::class);

    Route::get('/produk', [ProdukController::class, 'index'])->name('produk.index');
    Route::post('/produk', [ProdukController::class, 'store']);
    Route::put('/produk/{id_produk}', [ProdukController::class, 'update']);
    Route::delete('/produk/{id_produk}', [ProdukController::class, 'destroy']);

    Route::post('/harga-produk', [HargaProdukController::class, 'store']);
    Route::delete('/harga-produk/{id}', [HargaProdukController::class, 'destroy']);

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

    Route::get('/jenis-pengeluaran', [PengeluaranController::class, 'index'])->name('pengeluaran.index');
    Route::post('/jenis-pengeluaran', [PengeluaranController::class, 'store']);
    Route::put('/jenis-pengeluaran/{id_pengeluaran}', [PengeluaranController::class, 'update']);
    Route::delete('/jenis-pengeluaran/{id_pengeluaran}', [PengeluaranController::class, 'destroy']);

    // --- Approval Pemakaian Bahan ---
    Route::get('/approval-pemakaian-bahan', [ApprovalPemakaianBahanController::class, 'index'])->name('approval-pemakaian-bahan.index');
    Route::put('/approval-pemakaian-bahan/{id}', [ApprovalPemakaianBahanController::class, 'approve'])->name('approval-pemakaian-bahan.approve');

    // Rute Harga Pokok Produksi (COGM)
    Route::prefix('produksi/hpp')->name('hpp.')->group(function () {
        Route::get('/', [HargaPokokProduksiController::class, 'index'])->name('index');
        Route::post('/', [HargaPokokProduksiController::class, 'store'])->name('store');
    });

    // --- Penyusutan Aset (MENGGUNAKAN PREFIX & ROUTE GENERATE) ---
    Route::prefix('penyusutan')->name('penyusutan.')->group(function () {
        Route::get('/aset', [PenyusutanAsetController::class, 'index'])->name('index');
        Route::post('/generate', [PenyusutanAsetController::class, 'generate'])->name('generate');
        Route::post('/simpan-jurnal', [PenyusutanAsetController::class, 'simpanJurnal'])->name('simpan-jurnal');
    });

    // --- Jurnal Umum & Jurnal Penyesuaian ---
    Route::get('/keuangan/jurnal-umum', [JurnalUmumController::class, 'index'])->name('jurnal.umum');
    Route::get('/keuangan/jurnal-penyesuaian', [JurnalPenyesuaianController::class, 'index'])->name('jurnal.penyesuaian');

    // --- Buku Besar ---
    Route::get('/keuangan/buku-besar', [BukuBesarController::class, 'index'])->name('buku.besar');

    // --- Stok Opname ---
    Route::prefix('persediaan/stock-opname')->name('stock-opname.')->group(function () {
        Route::get('/', [StockOpnameController::class, 'index'])->name('index');
        Route::post('/', [StockOpnameController::class, 'store'])->name('store');
        Route::get('/{id}', [StockOpnameController::class, 'show'])->name('show');
        Route::delete('/{id}', [StockOpnameController::class, 'destroy'])->name('destroy');
    });


    // --- Transaksi Finansial ---
    Route::get('/transaksi-pengeluaran', [TransaksiPengeluaranController::class, 'index'])->name('transaksi-pengeluaran.index');
    Route::post('/transaksi-pengeluaran', [TransaksiPengeluaranController::class, 'store'])->name('transaksi-pengeluaran.store');


    // --- Penjualan & Pesanan ---
    Route::get('/invoice/create', [PesananController::class, 'createInvoice'])->name('invoice.create');
    Route::post('/transaksi-penjualan', [PesananController::class, 'storeInvoice']);
    Route::get('/delivery-order/create', [PesananController::class, 'createSuratJalan'])->name('surat-jalan.create');
    Route::post('/surat-jalan', [PesananController::class, 'storeSuratJalan']);
    Route::resource('pesanan', PesananController::class);

    Route::get('/transaksi-penjualan', [PenjualanController::class, 'index'])->name('transaksi-penjualan.index');
    Route::post('/transaksi-penjualan-store', [PenjualanController::class, 'storeInvoice'])->name('transaksi-penjualan.store');
    Route::get('/transaksi-penjualan/{id}', [PenjualanController::class, 'show'])->name('transaksi-penjualan.show');

    Route::post('/surat-jalan-store', [SuratJalanController::class, 'store'])->name('surat-jalan.store');
    Route::get('/surat-jalan', [SuratJalanController::class, 'index'])->name('surat-jalan.index');
    Route::put('/surat-jalan/{id}/status', [SuratJalanController::class, 'updateStatus']);

    Route::get('/retur-penjualan', [ReturJualController::class, 'index'])->name('retur-penjualan.index');


    // --- Produksi ---
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

    Route::prefix('produksi/hasil-produksi')->name('hasil-produksi.')->group(function () {
        Route::get('/', [HasilProduksiController::class, 'index'])->name('index');
        Route::post('/', [HasilProduksiController::class, 'store'])->name('store');
    });


    // --- Pembelian (Purchasing) ---
    Route::prefix('pembelian/permintaan')->name('pp.')->group(function () {
        Route::get('/', [PermintaanPembelianController::class, 'index'])->name('index');
        Route::get('/kebutuhan-mingguan', [PermintaanPembelianController::class, 'getKebutuhanMingguan'])->name('kebutuhan-mingguan');
        Route::post('/', [PermintaanPembelianController::class, 'store'])->name('store');
        Route::delete('/{id}', [PermintaanPembelianController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('pembelian/pesanan')->name('po.')->group(function () {
        Route::get('/', [PurchaseOrderController::class, 'index'])->name('index');
        Route::post('/', [PurchaseOrderController::class, 'store'])->name('store');
        Route::put('/{id}', [PurchaseOrderController::class, 'update'])->name('update');
        Route::delete('/{id}', [PurchaseOrderController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('keuangan/approval-po')->name('po-approval.')->group(function () {
        Route::get('/', [ApprovalPOController::class, 'index'])->name('index');
        Route::put('/{id}/setujui', [ApprovalPOController::class, 'setujui'])->name('setujui');
        Route::put('/{id}/revisi', [ApprovalPOController::class, 'revisi'])->name('revisi');
    });

    Route::prefix('pembelian/penerimaan-bahan')->name('penerimaan-bahan.')->group(function () {
        Route::get('/', [PenerimaanBahanController::class, 'index'])->name('index');
        Route::post('/', [PenerimaanBahanController::class, 'store'])->name('store');
    });

    Route::prefix('pembelian/retur-pembelian')->name('retur-pembelian.')->group(function () {
        Route::get('/', [ReturPembelianController::class, 'index'])->name('index');
        Route::post('/', [ReturPembelianController::class, 'store'])->name('store');
    });
// --- RUTE TRANSAKSI PEMBELIAN (KEUANGAN/PEMBELIAN) ---
Route::prefix('pembelian/transaksi-pembelian')->name('transaksi-pembelian.')->group(function () {
    Route::get('/', [TransaksiPembelianController::class, 'index'])->name('index');
    Route::post('/', [TransaksiPembelianController::class, 'store'])->name('store');
});
// ==========================================
// RUTE KARTU PERSEDIAAN
// ==========================================
Route::prefix('persediaan')->group(function () {

    // 1. Halaman Bahan Baku -> URL: /persediaan/bahan-baku
    Route::get('/bahan-baku', [KartuPersediaanController::class, 'indexBahanBaku'])
        ->name('persediaan.baku');

    // 2. Halaman Bahan Penolong -> URL: /persediaan/bahan-penolong
    Route::get('/bahan-penolong', [KartuPersediaanController::class, 'indexBahanPenolong'])
        ->name('persediaan.penolong');

    // 3. Halaman Produk Jadi -> URL: /persediaan/produk-jadi
    Route::get('/produk-jadi', [KartuPersediaanController::class, 'indexProdukJadi'])
        ->name('persediaan.produk');

});
Route::prefix('keuangan/hutang-usaha')->name('hutang-usaha.')->group(function () {
    Route::get('/', [HutangUsahaController::class, 'index'])->name('index');
    // Ubah baris di bawah ini (hapus kata /hutang-usaha di depan karena sudah diwakili prefix)
    Route::post('/{id_hutang}/bayar', [\App\Http\Controllers\HutangUsahaController::class, 'bayar'])->name('bayar');
});
}); // <-- Penutup Middleware Auth Utama

require __DIR__.'/auth.php';

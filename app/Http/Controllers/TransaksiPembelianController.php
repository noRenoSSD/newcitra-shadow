<?php

namespace App\Http\Controllers;

use App\Services\InventoryService;
use App\Models\TransaksiPembelian;
use App\Models\DetailTransaksiPembelian;
use App\Models\DetailPenerimaanBahan;
use App\Models\PenerimaanBahan;
use App\Models\HutangUsaha;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransaksiPembelianController extends Controller
{
    /**
     * Menampilkan daftar penerimaan yang siap ditagihkan
     * dan riwayat transaksi yang sudah dibuat.
     */
    public function index()
    {
        // 1. Ambil data PO & Penerimaan yang belum ditagihkan
        $penerimaanPending = PenerimaanBahan::with([
            'purchaseOrder.supplier',
            'purchaseOrder.details',
            'detailPenerimaan.bahan'
        ])
        ->whereDoesntHave('transaksiPembelian')
        ->get();

        // 2. Ambil Riwayat Transaksi (LOAD semua relasi termasuk detail item barangnya)
        $riwayatTransaksiRaw = TransaksiPembelian::with([
            'penerimaanBahan.purchaseOrder.supplier',
            'details.detailPenerimaan.bahan'
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        // 3. Mapping data agar STRUKTURNYA COCOK 100% dengan kebutuhan variabel di React
        $riwayatTransaksi = $riwayatTransaksiRaw->map(function($t) {
            $penerimaan = $t->penerimaanBahan;
            $po = $penerimaan ? $penerimaan->purchaseOrder : null;
            $supplier = $po ? $po->supplier : null;

            // Merapikan data detail barang
            $mappedDetails = $t->details->map(function($d) {
                $detPenerimaan = $d->detailPenerimaan;
                $bahan = $detPenerimaan ? $detPenerimaan->bahan : null;

                return [
                    'qty'          => $detPenerimaan ? (int) $detPenerimaan->qty_diterima : 0,
                    'harga_aktual' => (float) $d->harga_aktual,
                    'subtotal'     => (float) $d->subtotal,
                    'bahan'        => $bahan ? [
                        'kode_bahan'   => $bahan->kode_bahan,
                        'nama_bahan'   => $bahan->nama_bahan,
                        'satuan_bahan' => $bahan->satuan_bahan ?? $bahan->satuan ?? '-'
                    ] : null
                ];
            });

            return [
                'id_transaksi'      => $t->id_transaksi,
                'no_faktur'         => $t->no_faktur,
                'tanggal_transaksi' => $t->tanggal_transaksi,
                'metode_pembayaran' => $t->metode_pembayaran,
                'jatuh_tempo'       => $t->jatuh_tempo,
                'subtotal_barang'   => $t->subtotal_barang,
                'diskon'            => $t->diskon,
                'ongkos_kirim'      => $t->ongkos_kirim,
                'pajak'             => $t->pajak,
                'total_tagihan'     => $t->total_tagihan,
                'penerimaan'        => $penerimaan ? [
                    'no_penerimaan'  => $penerimaan->no_penerimaan,
                    'purchase_order' => $po ? [
                        'no_po'    => $po->no_po,
                        'supplier' => $supplier ? [
                            'nama_supplier' => $supplier->nama_supplier
                        ] : null
                    ] : null
                ] : null,
                'details' => $mappedDetails
            ];
        });

        return Inertia::render('Pembelian/TransaksiPembelian', [
            'penerimaanPending' => $penerimaanPending,
            'riwayatTransaksi'  => $riwayatTransaksi
        ]);
    }

    /**
     * Menyimpan transaksi pembelian, mutasi persediaan, dan otomatisasi JURNAL
     */
    public function store(Request $request)
    {
        // Validasi data
        $request->validate([
            'id_penerimaan'     => 'required|exists:t_penerimaan_bahan,id_penerimaan',
            'no_faktur'         => 'required|string|max:50',
            'tanggal_transaksi' => 'required|date',
            'metode_pembayaran' => 'required|in:Tunai,Kredit',
            'jatuh_tempo'       => 'required_if:metode_pembayaran,Kredit|nullable|date',
            'subtotal_barang'   => 'required|numeric',
            'total_tagihan'     => 'required|numeric',
            'items'             => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            // =================================================================
            // 1. SIMPAN HEADER TRANSAKSI (FAKTUR)
            // =================================================================
            $transaksi = TransaksiPembelian::create([
                'id_penerimaan'     => $request->id_penerimaan,
                'no_faktur'         => $request->no_faktur,
                'tanggal_transaksi' => $request->tanggal_transaksi,
                'metode_pembayaran' => $request->metode_pembayaran,
                'status_pembayaran' => $request->status_pembayaran ?? 'Belum Lunas',
                'jatuh_tempo'       => $request->metode_pembayaran === 'Kredit' ? $request->jatuh_tempo : null,
                'subtotal_barang'   => $request->subtotal_barang,
                'diskon'            => $request->diskon ?? 0,
                'ongkos_kirim'      => $request->ongkos_kirim ?? 0,
                'pajak'             => $request->pajak ?? 0,
                'total_tagihan'     => $request->total_tagihan,
            ]);

            // =================================================================
            // 2. SIMPAN DETAIL, CATAT MUTASI, DAN REKAP NILAI JURNAL
            // =================================================================
            $subtotalBarang = $request->subtotal_barang;
            $totalTagihan = $request->total_tagihan;
            $faktorPenyesuaian = $subtotalBarang > 0 ? ($totalTagihan / $subtotalBarang) : 1;

            // Variabel rekap nilai persediaan untuk Jurnal (Dipisah berdasarkan jenis bahan)
            $totalBahanBaku = 0;
            $totalBahanPenolong = 0;

            foreach ($request->items as $item) {
                // Load relasi bahan untuk mengecek jenis_bahan ('baku' atau 'penolong')
                $detailPenerimaan = DetailPenerimaanBahan::with('bahan')->find($item['id_detail_penerimaan']);

                if ($detailPenerimaan && $detailPenerimaan->bahan) {
                    // A. Simpan Detail Transaksi
                    DetailTransaksiPembelian::create([
                        'id_transaksi'         => $transaksi->id_transaksi,
                        'id_detail_penerimaan' => $item['id_detail_penerimaan'],
                        'harga_aktual'         => $item['harga_aktual'],
                        'subtotal'             => $item['subtotal'],
                    ]);

                    // B. Hitung Total Bersih
                    $totalBersihItem = round($item['subtotal'] * $faktorPenyesuaian);
                    $hargaBersih = $detailPenerimaan->qty_diterima > 0 ? ($totalBersihItem / $detailPenerimaan->qty_diterima) : 0;
                    $namaBahan = $detailPenerimaan->bahan->nama_bahan;

                    // C. Catat Mutasi Persediaan
                    InventoryService::catatMutasi(
                        $item['id_bahan'],
                        'bahan',
                        'MASUK',
                        'pembelian',
                        $request->no_faktur,
                        $detailPenerimaan->qty_diterima,
                        $hargaBersih,
                        $request->tanggal_transaksi,
                        "Pembelian " . $namaBahan . " berdasarkan faktur: " . $request->no_faktur,
                        $totalBersihItem
                    );

                    // D. Pengelompokan untuk Jurnal berdasarkan Enum jenis_bahan dari t_bahan
                    if ($detailPenerimaan->bahan->jenis_bahan === 'baku') {
                        $totalBahanBaku += $totalBersihItem;
                    } else if ($detailPenerimaan->bahan->jenis_bahan === 'penolong') {
                        $totalBahanPenolong += $totalBersihItem;
                    }
                }
            }

            // =================================================================
            // 3. CATAT HUTANG JIKA KREDIT
            // =================================================================
            if ($request->metode_pembayaran === 'Kredit') {
                HutangUsaha::create([
                    'id_transaksi' => $transaksi->id_transaksi,
                    'no_hutang'    => 'HU-' . date('Ymd') . '-' . str_pad($transaksi->id_transaksi, 3, '0', STR_PAD_LEFT),
                    'total_hutang' => $transaksi->total_tagihan,
                    'terbayar'     => 0,
                    'kurang_bayar' => $transaksi->total_tagihan,
                    'status'       => 'Belum Lunas'
                ]);
            }

            // =================================================================
            // 4. OTOMATISASI JURNAL PEMBELIAN (DEBIT & KREDIT)
            // =================================================================

            // --> KODE AKUN BERDASARKAN SEEDER <--
            $kodeAkunBahanBaku     = '1001004'; // PERSEDIAAN BAHAN BAKU
            $kodeAkunBahanPenolong = '1001005'; // PERSEDIAAN BAHAN PENOLONG
            $kodeAkunKas           = '1001001'; // KAS
            $kodeAkunHutang        = '2001001'; // HUTANG USAHA

            // Query untuk mendapatkan ID Akun berdasarkan Kode Akun
            $idAkunBaku     = DB::table('t_akun')->where('kode_akun', $kodeAkunBahanBaku)->value('id_akun');
            $idAkunPenolong = DB::table('t_akun')->where('kode_akun', $kodeAkunBahanPenolong)->value('id_akun');
            $idAkunKas      = DB::table('t_akun')->where('kode_akun', $kodeAkunKas)->value('id_akun');
            $idAkunHutang   = DB::table('t_akun')->where('kode_akun', $kodeAkunHutang)->value('id_akun');

            // A. Buat Header Jurnal (Jurnal Umum)
            $idJurnal = DB::table('t_jurnal')->insertGetId([
                'kode_jurnal'    => 'JU-PB' . date('ymd') . rand(100, 999),
                'tanggal'        => $request->tanggal_transaksi,
                'keterangan'     => 'Pembelian Persediaan (Faktur: ' . $request->no_faktur . ')',
                'jenis_jurnal'   => 'umum',
                'kode_referensi' => $request->no_faktur,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            // B. SISI DEBIT (Persediaan Bertambah)
            if ($totalBahanBaku > 0 && $idAkunBaku) {
                DB::table('t_jurnal_detail')->insert([
                    'id_jurnal'  => $idJurnal,
                    'id_akun'    => $idAkunBaku,
                    'debit'      => $totalBahanBaku,
                    'kredit'     => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if ($totalBahanPenolong > 0 && $idAkunPenolong) {
                DB::table('t_jurnal_detail')->insert([
                    'id_jurnal'  => $idJurnal,
                    'id_akun'    => $idAkunPenolong,
                    'debit'      => $totalBahanPenolong,
                    'kredit'     => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // C. SISI KREDIT (Kas Berkurang / Hutang Bertambah)
            // Cek metode pembayaran untuk menentukan akun kredit
            $idAkunKredit = ($request->metode_pembayaran === 'Tunai') ? $idAkunKas : $idAkunHutang;

            if ($idAkunKredit) {
                DB::table('t_jurnal_detail')->insert([
                    'id_jurnal'  => $idJurnal,
                    'id_akun'    => $idAkunKredit,
                    'debit'      => 0,
                    'kredit'     => $totalTagihan, // Total tagihan penuh di sisi kredit
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Transaksi Pembelian dan Jurnal Otomatis berhasil disimpan!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan transaksi: ' . $e->getMessage()]);
        }
    }
}
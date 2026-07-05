<?php

namespace App\Http\Controllers;

use App\Models\ApprovalPemakaianBahan;
use App\Models\PemakaianBahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ApprovalPemakaianBahanController extends Controller
{
    public function index()
    {
        // 1. Ambil Data Dasar Pemakaian
        $rawData = DB::table('t_approval_pemakaian_bahan as apb')
            ->join('t_pemakaian_bahan as pb', 'apb.id_pemakaian', '=', 'pb.id_pemakaian')
            ->join('t_hasil_produksi as hp', 'pb.id_hasil_produksi', '=', 'hp.id_hasil_produksi')
            ->join('t_detail_jadwal_produksi as djp', 'hp.id_produksi', '=', 'djp.id_produksi')
            ->join('t_produk as p', 'djp.id_produk', '=', 'p.id_produk')
            ->join('t_bahan as b', 'pb.id_bahan', '=', 'b.id_bahan')
            ->select(
                'apb.status_approval', 'apb.komentar_admin', 'hp.id_hasil_produksi',
                'djp.id_produksi', 'djp.kode_produksi', 'p.nama_produk',
                'pb.created_at', 'pb.id_bahan', 'b.nama_bahan', 'b.satuan_bahan',
                'b.harga_beli as harga_standar', 'pb.qty_aktual'
            )->get();

        if ($rawData->isEmpty()) {
            return Inertia::render('Persediaan/ApprovalPemakaianBahan', ['approvalData' => []]);
        }

        // 2. Ambil Standar BOM
        $standars = DB::table('t_kebutuhan_bahan as kb')
            ->join('t_detail_bom as db', 'kb.id_detail_bom', '=', 'db.id_detail_bom')
            ->whereIn('kb.id_produksi', $rawData->pluck('id_produksi')->unique())
            ->get()->keyBy(fn($item) => $item->id_produksi . '_' . $item->id_bahan);

        // 3. Ambil Saldo Harga dari Kartu Persediaan (Hanya KELUAR & Paling Terbaru)
        $kartus = DB::table('t_kartu_persediaan')
            ->whereIn('id_bahan', $rawData->pluck('id_bahan')->unique())
            ->where('jenis_transaksi', 'KELUAR')
            ->orderBy('tanggal_transaksi', 'desc')
            ->orderBy('id_kartu', 'desc')
            ->get(['id_bahan', 'tanggal_transaksi', 'saldo_harga']);

        // 4. Kalkulasi Data (Semua Matematika Dilakukan di PHP agar bebas NaN)
        $approvals = $rawData->groupBy('id_hasil_produksi')
            ->map(function ($items, $idHasilProduksi) use ($standars, $kartus) {
                $first = $items->first();
                $tglInput = Carbon::parse($first->created_at)->format('Y-m-d');
                $semuaDisetujui = $items->every(fn($i) => $i->status_approval === 'approved');

                $materials = $items->map(function ($detail) use ($standars, $kartus, $tglInput) {
                    // Qty Standar & Aktual
                    $keyStandar = $detail->id_produksi . '_' . $detail->id_bahan;
                    $qtyStandar = isset($standars[$keyStandar]) ? (float) $standars[$keyStandar]->qty_kebutuhan : 0.0;
                    $qtyAktual  = (float) $detail->qty_aktual;
                    
                    // Harga Standar
                    $hargaStandar = (float) $detail->harga_standar;

                    // Cari Saldo Harga Aktual di Kartu Persediaan (Sesuai tgl KELUAR = tgl input)
                    $matchKartu = $kartus->first(function($k) use ($detail, $tglInput) {
                        // Mencari transaksi keluar di hari yang sama, atau hari sebelumnya
                        return $k->id_bahan == $detail->id_bahan && $k->tanggal_transaksi <= $tglInput;
                    });

                    // Jika ketemu ambil saldo_harga, jika tidak ada fallback ke harga_standar
                    $hargaAktual = $matchKartu ? (float) $matchKartu->saldo_harga : $hargaStandar;

                    // Hitung Total Biaya (DIJAMIN FLOAT, TIDAK MUNGKIN NaN)
                    $biayaStandar = $qtyStandar * $hargaStandar;
                    $biayaAktual  = $qtyAktual * $hargaAktual;

                    return [
                        'nama_bahan'      => $detail->nama_bahan,
                        'satuan'          => $detail->satuan_bahan ?? '-',
                        'qty_standar'     => $qtyStandar,
                        'biaya_standar'   => $biayaStandar,
                        'qty_aktual'      => $qtyAktual,
                        'biaya_aktual'    => $biayaAktual,
                        
                        // Kirim juga variabel satuan harganya untuk jaga-jaga
                        'harga_keluar_kp' => $hargaAktual, 
                        'harga_standar'   => $hargaStandar,
                    ];
                })->values();

                return [
                    'id'               => (string) $idHasilProduksi,
                    'no_produksi'      => $first->kode_produksi,
                    'nama_produk'      => $first->nama_produk,
                    'tanggal_produksi' => $tglInput,
                    'tanggal_input'    => $tglInput,
                    'status'           => $semuaDisetujui ? 'Disetujui' : 'Menunggu',
                    'catatan_approval' => $first->komentar_admin ?? '',
                    'materials'        => $materials
                ];
            })->values();

        return Inertia::render('Persediaan/ApprovalPemakaianBahan', [
            'approvalData' => $approvals,
        ]);
    }

    public function approve(Request $request, $id)
    {
        // 1. Ambil semua data pemakaian bahan berdasarkan id_hasil_produksi
        $pemakaianBahan = PemakaianBahan::where('id_hasil_produksi', $id)->get();

        // Gunakan DB Transaction agar jika ada error di satu bahan, tidak ada yang tersimpan separuh
        DB::transaction(function () use ($request, $pemakaianBahan) {
            
            foreach ($pemakaianBahan as $pb) {
                // A. Cari Harga Standar dari Master Bahan
                $bahan = DB::table('t_bahan')->where('id_bahan', $pb->id_bahan)->first();
                $hargaStandar = $bahan ? (float) $bahan->harga_beli : 0;

                // B. Cari Harga Aktual (Saldo Harga) dari Kartu Persediaan
                // Patokan pencarian adalah tanggal saat input produksi dibuat
                $tglInput = \Carbon\Carbon::parse($pb->created_at)->format('Y-m-d');
                
                $kartu = DB::table('t_kartu_persediaan')
                    ->where('id_bahan', $pb->id_bahan)
                    ->where('jenis_transaksi', 'KELUAR')
                    ->whereDate('tanggal_transaksi', '<=', $tglInput)
                    ->orderBy('tanggal_transaksi', 'desc')
                    ->orderBy('id_kartu', 'desc')
                    ->first();

                // Jika ada di kartu, pakai saldo_harga. Jika kosong, fallback ke harga standar.
                $hargaAktual = $kartu ? (float) $kartu->saldo_harga : $hargaStandar;
                
                // C. Kalkulasi Total Biaya Aktual
                $qtyAktual = (float) $pb->qty_aktual;
                $totalAktual = $qtyAktual * $hargaAktual;

                // D. Update tabel t_approval_pemakaian_bahan
                ApprovalPemakaianBahan::where('id_pemakaian', $pb->id_pemakaian)
                    ->update([
                        'harga_standar'         => $hargaStandar,  // Otomatis mengisi harga standar juga
                        'harga_ratarata_aktual' => $hargaAktual,
                        'total_aktual'          => $totalAktual,
                        'status_approval'       => 'approved',
                        'komentar_admin'        => $request->catatan_approval,
                        'tanggal_approval'      => now()->toDateString(),
                    ]);
            }
            
        });

        return redirect()->back();
    }
}
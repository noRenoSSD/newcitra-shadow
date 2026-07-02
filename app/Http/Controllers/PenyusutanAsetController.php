<?php

namespace App\Http\Controllers;

use App\Models\Aset;
use App\Models\PenyusutanAset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class PenyusutanAsetController extends Controller
{
    // ── Helper: mapping nama bulan → angka ───────────────────────────────────
    private array $bulanMap = [
        'Januari'   => 1,  'Februari'  => 2,  'Maret'     => 3,
        'April'     => 4,  'Mei'       => 5,  'Juni'      => 6,
        'Juli'      => 7,  'Agustus'   => 8,  'September' => 9,
        'Oktober'   => 10, 'November'  => 11, 'Desember'  => 12,
    ];

    // ─────────────────────────────────────────────────────────────────────────
    //  INDEX — Render halaman penyusutan
    // ─────────────────────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        // 1. Periode yang sudah pernah digenerate
        $processedPeriods = PenyusutanAset::selectRaw(
                "DATE_FORMAT(periode, '%m-%Y') as periode_key, MIN(kode_penyusutan) as kode"
            )
            ->groupBy('periode')
            ->get()
            ->keyBy('periode_key')
            ->map(fn($item) => ['processed' => true, 'kode' => $item->kode]);

        // 2. Baca query param periode (dikirim dari generate() atau reload manual)
        $selectedBulan = $request->input('bulan', '');
        $selectedTahun = $request->input('tahun', '');

        $asetData = collect();

        if ($selectedBulan && $selectedTahun && isset($this->bulanMap[$selectedBulan])) {
            $bulanNum      = $this->bulanMap[$selectedBulan];
            $filterPeriode = Carbon::create($selectedTahun, $bulanNum, 1)->startOfMonth();
            $periodeStr    = $filterPeriode->toDateString();

            // ── Cek apakah periode ini sudah digenerate ───────────────────────
            $sudahGenerate = PenyusutanAset::where('periode', $periodeStr)->exists();

            if ($sudahGenerate) {
                // Ambil data AKTUAL dari DB untuk periode ini (bukan kalkulasi ulang)
                $asetData = PenyusutanAset::with('aset')
                    ->where('periode', $periodeStr)
                    ->get()
                    ->map(function ($py) {
                        $umurBulan = $py->aset->umur_ekonomis * 12;
                        return [
                            'kode_aset'            => $py->aset->kode_aset,
                            'nama_aset'            => $py->aset->nama_aset,
                            'tipe_aset'            => $py->aset->tipe_aset,  // ← tambahan
                            'harga_perolehan'      => (float) $py->aset->harga_perolehan,
                            'umur_ekonomis'        => $umurBulan,
                            'penyusutan_per_bulan' => (float) $py->nilai_penyusutan,
                            'akumulasi_penyusutan' => (float) $py->akumulasi_penyusutan,
                            'nilai_buku'           => (float) $py->nilai_buku,
                        ];
                    });
            } else {
                // Periode belum digenerate — filter aset yang masih aktif di periode ini
                $asetData = Aset::where('umur_ekonomis', '>', 0)
                    ->get()
                    ->filter(function ($aset) use ($filterPeriode) {
                        $tanggalBeli  = Carbon::parse($aset->tanggal_beli)->startOfMonth();
                        $tanggalHabis = $tanggalBeli->copy()->addYears($aset->umur_ekonomis);

                        return $filterPeriode->greaterThanOrEqualTo($tanggalBeli)
                            && $filterPeriode->lessThan($tanggalHabis);
                    })
                    ->map(function ($aset) {
                        $depreciableAmount  = $aset->harga_perolehan - $aset->nilai_sisa;
                        $umurBulan          = $aset->umur_ekonomis * 12;
                        $penyusutanPerBulan = $umurBulan > 0
                            ? $depreciableAmount / $umurBulan
                            : 0;

                        $akumulasi = (float) PenyusutanAset::where('id_aset', $aset->id_aset)
                            ->sum('nilai_penyusutan');
                        $nilaiBuku = $aset->harga_perolehan - $akumulasi;

                        return [
                            'kode_aset'            => $aset->kode_aset,
                            'nama_aset'            => $aset->nama_aset,
                            'tipe_aset'            => $aset->tipe_aset,  // ← tambahan
                            'harga_perolehan'      => (float) $aset->harga_perolehan,
                            'umur_ekonomis'        => $umurBulan,
                            'penyusutan_per_bulan' => round($penyusutanPerBulan, 2),
                            'akumulasi_penyusutan' => round($akumulasi, 2),
                            'nilai_buku'           => round($nilaiBuku, 2),
                        ];
                    })
                    ->values();
            }
        }
        // Jika tidak ada param periode → asetData kosong (tampilkan empty state)

        return Inertia::render('Keuangan/PenyusutanAsetTetap', [
            'initialProcessed' => $processedPeriods,
            'asetData'         => $asetData->values(),
            'selectedBulan'    => $selectedBulan,   // untuk init state frontend
            'selectedTahun'    => $selectedTahun,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  GENERATE — Hitung & simpan penyusutan satu periode
    // ─────────────────────────────────────────────────────────────────────────
    public function generate(Request $request)
    {
        $request->validate([
            'bulan' => 'required|string|in:' . implode(',', array_keys($this->bulanMap)),
            'tahun' => 'required|integer|min:2000|max:2100',
        ]);

        $bulanNum      = $this->bulanMap[$request->bulan];
        $periodeCarbon = Carbon::create($request->tahun, $bulanNum, 1)->startOfMonth();
        $periodeStr    = $periodeCarbon->toDateString();

        // ── Guard: periode sudah pernah digenerate ────────────────────────────
        if (PenyusutanAset::where('periode', $periodeStr)->exists()) {
            return back()->withErrors([
                'error' => 'Penyusutan untuk periode ini sudah pernah dilakukan.',
            ]);
        }

        DB::beginTransaction();
        try {
            // Filter aset yang masih aktif PADA periode yang dipilih
            $asets = Aset::where('umur_ekonomis', '>', 0)
                ->get()
                ->filter(function ($aset) use ($periodeCarbon) {
                    $tanggalBeli  = Carbon::parse($aset->tanggal_beli)->startOfMonth();
                    $tanggalHabis = $tanggalBeli->copy()->addYears($aset->umur_ekonomis);

                    // Pakai lessThan agar bulan tepat habis tidak ikut disusutkan
                    return $periodeCarbon->greaterThanOrEqualTo($tanggalBeli)
                        && $periodeCarbon->lessThan($tanggalHabis);
                });

            $kodePrefix = sprintf(
                'PNY-%s-%s-',
                $request->tahun,
                str_pad($bulanNum, 2, '0', STR_PAD_LEFT)
            );
            $counter = 1;

            foreach ($asets as $aset) {
                $depreciableAmount  = $aset->harga_perolehan - $aset->nilai_sisa;
                $umurBulan          = $aset->umur_ekonomis * 12;
                $penyusutanPerBulan = $umurBulan > 0
                    ? $depreciableAmount / $umurBulan
                    : 0;

                $akumulasiSebelumnya = (float) PenyusutanAset::where('id_aset', $aset->id_aset)
                    ->sum('nilai_penyusutan');

                // Skip jika sudah fully depreciated
                if ($akumulasiSebelumnya >= $depreciableAmount) {
                    continue;
                }

                // Cap bulan terakhir agar tidak melampaui sisa yang bisa disusutkan
                $sisaYangBisaDisusutkan = $depreciableAmount - $akumulasiSebelumnya;
                $penyusutanBulanIni     = min($penyusutanPerBulan, $sisaYangBisaDisusutkan);

                $akumulasiBaru = $akumulasiSebelumnya + $penyusutanBulanIni;
                $nilaiBukuBaru = $aset->harga_perolehan - $akumulasiBaru;

                PenyusutanAset::create([
                    'kode_penyusutan'      => $kodePrefix . str_pad($counter, 3, '0', STR_PAD_LEFT),
                    'id_aset'              => $aset->id_aset,
                    'periode'              => $periodeStr,
                    'nilai_penyusutan'     => round($penyusutanBulanIni, 2),
                    'akumulasi_penyusutan' => round($akumulasiBaru, 2),
                    'nilai_buku'           => round($nilaiBukuBaru, 2),
                ]);

                $counter++;
            }

            DB::commit();

            // ── Redirect ke index dengan param periode → frontend init state ──
            return redirect()->route('penyusutan.index', [
                'bulan' => $request->bulan,
                'tahun' => $request->tahun,
            ])->with('success', 'Berhasil melakukan proses penyusutan.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Gagal memproses penyusutan: ' . $e->getMessage(),
            ]);
        }
    }
}
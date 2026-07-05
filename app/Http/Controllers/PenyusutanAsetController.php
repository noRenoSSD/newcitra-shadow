<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use App\Models\Aset;
use App\Models\Jurnal;
use App\Models\JurnalDetail;
use App\Models\PenyusutanAset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class PenyusutanAsetController extends Controller
{
    private array $bulanMap = [
        'Januari'   => 1,  'Februari'  => 2,  'Maret'     => 3,
        'April'     => 4,  'Mei'       => 5,  'Juni'      => 6,
        'Juli'      => 7,  'Agustus'   => 8,  'September' => 9,
        'Oktober'   => 10, 'November'  => 11, 'Desember'  => 12,
    ];

    public function index(Request $request)
    {
        $processedPeriods = PenyusutanAset::selectRaw(
                "DATE_FORMAT(periode, '%m-%Y') as periode_key, MIN(kode_penyusutan) as kode"
            )
            ->groupBy('periode')
            ->get()
            ->keyBy('periode_key')
            ->map(fn($item) => ['processed' => true, 'kode' => $item->kode]);

        $selectedBulan = $request->input('bulan', '');
        $selectedTahun = $request->input('tahun', '');

        $asetData = collect();

        if ($selectedBulan && $selectedTahun && isset($this->bulanMap[$selectedBulan])) {
            $bulanNum      = $this->bulanMap[$selectedBulan];
            $filterPeriode = Carbon::create($selectedTahun, $bulanNum, 1)->startOfMonth();
            $periodeStr    = $filterPeriode->toDateString();

            $sudahGenerate = PenyusutanAset::where('periode', $periodeStr)->exists();

            if ($sudahGenerate) {
                $asetData = PenyusutanAset::with('aset')
                    ->where('periode', $periodeStr)
                    ->get()
                    ->map(function ($py) {
                        $umurBulan = $py->aset->umur_ekonomis * 12;
                        return [
                            'kode_aset'            => $py->aset->kode_aset,
                            'nama_aset'            => $py->aset->nama_aset,
                            'tipe_aset'            => $py->aset->tipe_aset,
                            'harga_perolehan'      => (float) $py->aset->harga_perolehan,
                            'umur_ekonomis'        => $umurBulan,
                            'penyusutan_per_bulan' => (float) $py->nilai_penyusutan,
                            'akumulasi_penyusutan' => (float) $py->akumulasi_penyusutan,
                            'nilai_buku'           => (float) $py->nilai_buku,
                        ];
                    });
            } else {
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
                            'tipe_aset'            => $aset->tipe_aset,
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

        return Inertia::render('Keuangan/PenyusutanAsetTetap', [
            'initialProcessed' => $processedPeriods,
            'asetData'         => $asetData->values(),
            'selectedBulan'    => $selectedBulan,
            'selectedTahun'    => $selectedTahun,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'bulan' => 'required|string|in:' . implode(',', array_keys($this->bulanMap)),
            'tahun' => 'required|integer|min:2000|max:2100',
        ]);

        $bulanNum      = $this->bulanMap[$request->bulan];
        $periodeCarbon = Carbon::create($request->tahun, $bulanNum, 1)->startOfMonth();
        $periodeStr    = $periodeCarbon->toDateString();

        if (PenyusutanAset::where('periode', $periodeStr)->exists()) {
            return back()->withErrors([
                'error' => 'Penyusutan untuk periode ini sudah pernah dilakukan.',
            ]);
        }

        DB::beginTransaction();
        try {
            $asets = Aset::where('umur_ekonomis', '>', 0)
                ->get()
                ->filter(function ($aset) use ($periodeCarbon) {
                    $tanggalBeli  = Carbon::parse($aset->tanggal_beli)->startOfMonth();
                    $tanggalHabis = $tanggalBeli->copy()->addYears($aset->umur_ekonomis);

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

                if ($akumulasiSebelumnya >= $depreciableAmount) {
                    continue;
                }

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

    // ─────────────────────────────────────────────────────────────────────────
    //  SIMPAN JURNAL — Otomatis membuat jurnal berdasarkan periode
    // ─────────────────────────────────────────────────────────────────────────
    public function simpanJurnal(Request $request)
    {
        $request->validate([
            'periode'            => 'required|string',
            'entries'            => 'required|array',
            'entries.*.kode_akun'=> 'required|string',
            'entries.*.debit'    => 'required|numeric',
            'entries.*.kredit'   => 'required|numeric',
        ]);

        // Parsing "Juli 2026" untuk mendapatkan tanggal akhir bulan
        $parts = explode(' ', $request->periode);
        $bulanStr = $parts[0] ?? '';
        $tahun = $parts[1] ?? date('Y');
        $bulanNum = $this->bulanMap[$bulanStr] ?? date('n');
        
        $tanggalJurnal = Carbon::create($tahun, $bulanNum, 1)->endOfMonth();

        // Cek jika referensi ini sudah di-jurnal sebelumnya untuk mencegah double entry
        $kodeRef = 'PYS-' . $tanggalJurnal->format('Ym');
        if (Jurnal::where('kode_referensi', $kodeRef)->exists()) {
            return back()->withErrors(['error' => 'Jurnal untuk penyusutan periode ini sudah pernah dibuat.']);
        }

        // Generate Nomor Jurnal (JP-202607-001)
        $prefix = 'JP-' . $tanggalJurnal->format('Ym') . '-';
        $lastJurnal = Jurnal::where('kode_jurnal', 'like', $prefix . '%')
                            ->orderBy('kode_jurnal', 'desc')
                            ->first();

        $newNumber = $lastJurnal ? ((int) substr($lastJurnal->kode_jurnal, -3)) + 1 : 1;
        $kodeJurnal = $prefix . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

        DB::beginTransaction();
        try {
            $jurnal = Jurnal::create([
                'kode_jurnal'    => $kodeJurnal,
                'tanggal'        => $tanggalJurnal->format('Y-m-d'),
                'keterangan'     => 'Penyusutan Aset Tetap Bulan ' . $request->periode,
                'jenis_jurnal'   => 'penyesuaian',
                'kode_referensi' => $kodeRef,
            ]);

            foreach ($request->entries as $entry) {
                $akun = Akun::where('kode_akun', $entry['kode_akun'])->first();
                
                if (!$akun) {
                    throw new \Exception("Gagal: Akun dengan kode {$entry['kode_akun']} tidak ditemukan di Master Akun.");
                }

                JurnalDetail::create([
                    'id_jurnal' => $jurnal->id_jurnal,
                    'id_akun'   => $akun->id_akun,
                    'debit'     => $entry['debit'],
                    'kredit'    => $entry['kredit'],
                ]);
            }

            DB::commit();
            return back()->with('success', 'Jurnal Penyesuaian berhasil disimpan dan masuk ke Buku Besar!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Sistem gagal menyimpan jurnal: ' . $e->getMessage()]);
        }
    }
}
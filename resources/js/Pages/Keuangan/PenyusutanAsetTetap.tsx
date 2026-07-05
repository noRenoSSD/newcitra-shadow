import { useState, useRef, useEffect } from 'react';
import {
  RefreshCw, ChevronDown, FileText, FileSpreadsheet,
  Printer, X, CheckCircle2, Clock, Building2,
  AlertCircle, BookOpen,
} from 'lucide-react';
import { usePage, router } from '@inertiajs/react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AsetTetap {
  kode_aset: string;
  nama_aset: string;
  tipe_aset: string;
  harga_perolehan: number;
  umur_ekonomis: number;
  penyusutan_per_bulan: number;
  akumulasi_penyusutan: number;
  nilai_buku: number;
}

interface JurnalEntry {
  tanggal: string;
  kode_akun: string;
  nama_akun: string;
  debit: number;
  kredit: number;
}

// ─── Constants & Helpers ──────────────────────────────────────────────────────

const rp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

// Format kode akun untuk display UI saja (1001001 -> 1-001001)
const formatKodeAkunUI = (kode: string) => {
  if (!kode) return '';
  if (kode.includes('-')) return kode;
  return `${kode.slice(0, 1)}-${kode.slice(1)}`;
};

const bulanOptions = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const currentYear = new Date().getFullYear();
const tahunOptions = Array.from({ length: 8 }, (_, i) => String(currentYear - 2 + i));

const bulanNumMap: Record<string, string> = {
  Januari: '01', Februari: '02', Maret: '03', April: '04',
  Mei: '05', Juni: '06', Juli: '07', Agustus: '08',
  September: '09', Oktober: '10', November: '11', Desember: '12',
};

// ─── Mapping Kode Akun per Tipe Aset (Tanpa Strip agar cocok dengan database) ─
const TIPE_AKUN: Record<string, {
  kodeBeban: string; namaBeban: string;
  kodeAkumulasi: string; namaAkumulasi: string;
}> = {
  peralatan: {
    kodeBeban:     '6006005',
    namaBeban:     'BEBAN PENYUSUTAN PERALATAN',
    kodeAkumulasi: '1002006',
    namaAkumulasi: 'AKUMULASI DEPRESIASI - PERALATAN',
  },
  mesin: {
    kodeBeban:     '6006006',
    namaBeban:     'BEBAN PENYUSUTAN MESIN',
    kodeAkumulasi: '1002007',
    namaAkumulasi: 'AKUMULASI DEPRESIASI - MESIN',
  },
  kendaraan: {
    kodeBeban:     '6006007',
    namaBeban:     'BEBAN PENYUSUTAN KENDARAAN',
    kodeAkumulasi: '1002008',
    namaAkumulasi: 'AKUMULASI DEPRESIASI - KENDARAAN',
  },
};

const getAkunByTipe = (tipe: string) =>
  TIPE_AKUN[tipe?.toLowerCase()] ?? TIPE_AKUN['peralatan'];

const buildJurnal = (periode: string, asetData: AsetTetap[]): JurnalEntry[] => {
  const [bulan, tahun] = periode.split(' ');
  const tgl = `${tahun}-${bulanNumMap[bulan]}-30`;

  const grouped: Record<string, number> = {};
  asetData.forEach(a => {
    const key = a.tipe_aset?.toLowerCase() || 'peralatan';
    grouped[key] = (grouped[key] ?? 0) + a.penyusutan_per_bulan;
  });

  const rows: JurnalEntry[] = [];

  Object.entries(grouped).forEach(([tipe, total]) => {
    const akun = getAkunByTipe(tipe);
    rows.push({
      tanggal: tgl,
      kode_akun: akun.kodeBeban,
      nama_akun: akun.namaBeban,
      debit: total,
      kredit: 0,
    });
  });

  Object.entries(grouped).forEach(([tipe, total]) => {
    const akun = getAkunByTipe(tipe);
    rows.push({
      tanggal: tgl,
      kode_akun: akun.kodeAkumulasi,
      nama_akun: akun.namaAkumulasi,
      debit: 0,
      kredit: total,
    });
  });

  return rows;
};

// ─── Export Dropdown ──────────────────────────────────────────────────────────

function ExportDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = [
    { label: 'Export PDF',   icon: <FileText className="w-3.5 h-3.5" /> },
    { label: 'Export Excel', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
    { label: 'Print',        icon: <Printer className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
      >
        <FileText className="w-4 h-4" />
        Export
        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {items.map(item => (
            <button
              key={item.label}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-400">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Jurnal Modal ─────────────────────────────────────────────────────────────

function JurnalModal({ periode, asetData, onClose, onSave, isSaving }: {
  periode: string;
  asetData: AsetTetap[];
  onClose: () => void;
  onSave: (entries: JurnalEntry[]) => void;
  isSaving: boolean;
}) {
  const entries     = buildJurnal(periode, asetData);
  const totalDebit  = entries.reduce((s, e) => s + e.debit, 0);
  const totalKredit = entries.reduce((s, e) => s + e.kredit, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-red-700 to-red-800 px-6 py-5 rounded-t-2xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/20">
            <BookOpen className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base">Jurnal Penyusutan Aset Tetap</h3>
            <p className="text-red-200 text-xs mt-0.5">Periode: {periode}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-auto flex-1 p-6">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  {['Tanggal', 'Kode Akun', 'Nama Akun', 'Debit (Rp)', 'Kredit (Rp)'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((e, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-700 whitespace-nowrap">{e.tanggal.split('-').reverse().join('/')}</td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-gray-700">{formatKodeAkunUI(e.kode_akun)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">{e.nama_akun}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-gray-700 tabular-nums">
                      {e.debit > 0 ? rp(e.debit) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right text-gray-700 tabular-nums">
                      {e.kredit > 0 ? rp(e.kredit) : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300">
                  <td colSpan={3} className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wide">Total</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-700 tabular-nums">{rp(totalDebit)}</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-700 tabular-nums">{rp(totalKredit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs">
            {totalDebit === totalKredit ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Jurnal seimbang (Debit = Kredit)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Jurnal tidak seimbang
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onClose} disabled={isSaving}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50">
            Batal
          </button>
          <button onClick={() => onSave(entries)} disabled={isSaving || totalDebit !== totalKredit}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-700 text-white hover:bg-red-800 text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isSaving ? 'Menyimpan...' : 'Simpan Jurnal'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PenyusutanAsetTetap() {
  const { initialProcessed = {}, asetData = [], errors, flash, selectedBulan: initBulan = '', selectedTahun: initTahun = '' } = usePage().props as any;

  const [bulan, setBulan]           = useState<string>(initBulan);
  const [tahun, setTahun]           = useState<string>(initTahun);
  const [showJurnal, setShowJurnal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingJurnal, setIsSavingJurnal] = useState(false);

  const periodeKey     = bulan && tahun ? `${bulanNumMap[bulan]}-${tahun}` : '';
  const periodeDisplay = bulan && tahun ? `${bulan} ${tahun}` : '';

  const isProcessed    = periodeKey ? !!initialProcessed[periodeKey]?.processed : false;
  const kodePenyusutan = isProcessed ? initialProcessed[periodeKey]?.kode : '';
  const canGenerate    = !!periodeKey && !isProcessed;

  const hasLoaded = useRef(false);
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      return;
    }
    if (isProcessed && bulan && tahun) {
      router.get('/penyusutan/aset', { bulan, tahun }, {
        preserveScroll: true,
        replace: true,
      });
    }
  }, [bulan, tahun]);

  const activeAsetData: AsetTetap[] = (asetData as AsetTetap[]).filter(
    a => a.penyusutan_per_bulan > 0
  );

  const totalHarga      = activeAsetData.reduce((s, a) => s + a.harga_perolehan, 0);
  const totalPenyusutan = activeAsetData.reduce((s, a) => s + a.penyusutan_per_bulan, 0);
  const totalAkumulasi  = activeAsetData.reduce((s, a) => s + a.akumulasi_penyusutan, 0);
  const totalNilaiBuku  = activeAsetData.reduce((s, a) => s + a.nilai_buku, 0);

  const handleGenerate = () => {
    setIsGenerating(true);
    router.post('/penyusutan/generate', { bulan, tahun }, {
      onSuccess: () => setIsGenerating(false),
      onError:   () => setIsGenerating(false),
    });
  };

  // Fungsi pengiriman Jurnal ke Controller
  const handleSaveJurnal = (entries: JurnalEntry[]) => {
    setIsSavingJurnal(true);
    router.post('/penyusutan/simpan-jurnal', { 
      periode: periodeDisplay,
      entries: entries as any
    }, {
      onSuccess: () => {
        setIsSavingJurnal(false);
        setShowJurnal(false);
      },
      onError: () => {
        setIsSavingJurnal(false);
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Penyusutan Aset Tetap</h1>
        <p className="text-sm text-red-800 mt-1">Kalkulasi Beban Penyusutan dan Nilai Buku Aset</p>
      </div>

      {errors?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{errors.error}</span>
        </div>
      )}

      {flash?.success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3.5 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800">{flash.success}</p>
        </div>
      )}

      {/* ── Filter & Action ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-40">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Bulan</label>
            <select value={bulan} onChange={e => setBulan(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400">
              <option value="">Pilih Bulan</option>
              {bulanOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="min-w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tahun</label>
            <select value={tahun} onChange={e => setTahun(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400">
              <option value="">Pilih Tahun</option>
              {tahunOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="min-w-56">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Status Perhitungan</label>
            <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
              {!periodeKey ? (
                <span className="text-sm text-gray-400 italic">Pilih periode terlebih dahulu</span>
              ) : isProcessed ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
                    <CheckCircle2 className="w-4 h-4" /> Sudah Dihitung
                  </span>
                  <span className="text-xs text-gray-500">·</span>
                  <span className="text-xs font-semibold text-gray-700">{kodePenyusutan}</span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500">
                  <Clock className="w-4 h-4" /> Belum Dihitung
                </span>
              )}
            </div>
          </div>

          <div className="flex-1" />

          <button onClick={handleGenerate} disabled={!canGenerate || isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-800 disabled:hover:bg-red-700">
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Memproses...' : 'Generate Penyusutan'}
          </button>
        </div>
      </div>

      {/* ── Empty: Belum pilih periode ── */}
      {!periodeKey && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="py-24 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
              <Building2 className="w-9 h-9 text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold text-base mb-2">Pilih Periode Terlebih Dahulu</p>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              Silakan pilih bulan dan tahun untuk melihat daftar aset atau men-generate penyusutan bulanan.
            </p>
          </div>
        </div>
      )}

      {/* ── Empty: Periode belum di-generate ── */}
      {periodeKey && !isProcessed && !isGenerating && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
          <div className="py-20 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-yellow-500" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">Belum Ada Data Penyusutan</p>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-4">
              Periode <span className="font-medium text-gray-600">{periodeDisplay}</span> belum diproses.
              Klik tombol "Generate Penyusutan" untuk menghitung otomatis.
            </p>
            <button onClick={handleGenerate} disabled={!canGenerate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 hover:bg-red-800">
              <RefreshCw className="w-4 h-4" /> Generate Sekarang
            </button>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {isGenerating && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="py-20 flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-red-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Sistem sedang mengkalkulasi penyusutan massal...</p>
          </div>
        </div>
      )}

      {/* ── Tabel Hasil ── */}
      {isProcessed && !isGenerating && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-gray-800">Daftar Penyusutan Aset Tetap</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Periode: {periodeDisplay} · {activeAsetData.length} aset
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {[
                      'Kode Aset',
                      'Nama Aset',
                      'Harga Perolehan',
                      'Umur Ekonomis',
                      'Penyusutan/Bulan',
                      'Akumulasi Penyusutan',
                      'Nilai Buku',
                    ].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeAsetData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        Tidak ada aset aktif yang bisa disusutkan pada periode ini.
                      </td>
                    </tr>
                  ) : activeAsetData.map(a => (
                    <tr key={a.kode_aset} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">{a.kode_aset}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{a.nama_aset}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700 whitespace-nowrap">{rp(a.harga_perolehan)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700 whitespace-nowrap">{a.umur_ekonomis} bln</td>
                      <td className="px-4 py-3 text-sm text-right font-medium whitespace-nowrap bg-red-50/30">{rp(a.penyusutan_per_bulan)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700 whitespace-nowrap">{rp(a.akumulasi_penyusutan)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700 whitespace-nowrap">{rp(a.nilai_buku)}</td>
                    </tr>
                  ))}
                </tbody>
                {activeAsetData.length > 0 && (
                  <tfoot>
                    <tr className="bg-gray-100 border-t-2 border-gray-300">
                      <td className="px-4 py-3 font-bold text-gray-700 text-xs uppercase tracking-wide" colSpan={2}>
                        Total ({activeAsetData.length} Aset)
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-gray-800 whitespace-nowrap">{rp(totalHarga)}</td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-sm text-right font-bold text-red-700 whitespace-nowrap">{rp(totalPenyusutan)}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-gray-800 whitespace-nowrap">{rp(totalAkumulasi)}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-gray-800 whitespace-nowrap">{rp(totalNilaiBuku)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex items-center justify-end gap-3 flex-wrap">
            <button
              onClick={() => { setBulan(''); setTahun(''); }}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Kembali
            </button>
            <ExportDropdown />
            <button
              onClick={() => setShowJurnal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-700 text-white hover:bg-red-800 text-sm font-semibold transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" /> Review & Simpan Jurnal
            </button>
          </div>
        </>
      )}

      {showJurnal && periodeKey && (
        <JurnalModal
          periode={periodeDisplay}
          asetData={activeAsetData}
          onClose={() => setShowJurnal(false)}
          onSave={handleSaveJurnal}
          isSaving={isSavingJurnal}
        />
      )}
    </div>
  );
}
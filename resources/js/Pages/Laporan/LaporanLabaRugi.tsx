import { useState } from 'react';
import { Printer, Calendar } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const pct = (nilai: number, base: number) => {
  if (base === 0) return '0.00%';
  return ((nilai / base) * 100).toFixed(2) + '%';
};

const BULAN_LABELS: Record<number, string> = {
  1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
  5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
  9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember',
};

// ─── Interfaces ────────────────────────────────────────────────────────────────
interface AkunData {
  label: string;
  nilai: number;
}

interface PageProps {
  dataLaporan: {
    pendapatan: AkunData[];
    hpp: AkunData[];
    bebanOperasional: AkunData[];
    penghasilanLain: AkunData[];
    bebanLain: AkunData[];
  } | null; // Nullable untuk keamanan
  filters: {
    bulan: number;
    tahun: number;
  };
  error: string | null;
}

// ─── Row components ───────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <tr className="bg-gray-50 border-b border-gray-200">
      <td colSpan={3} className="px-4 py-2.5 font-semibold text-gray-700 uppercase tracking-wide text-xs">
        {label}
      </td>
    </tr>
  );
}

function ItemRow({ label, nilai, base, indent = false }: { label: string; nilai: number; base: number; indent?: boolean }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
      <td className={`px-4 py-2.5 text-sm text-gray-700 border-r border-gray-200 ${indent ? 'pl-8' : ''}`}>{label}</td>
      <td className="px-4 py-2.5 text-right text-sm text-gray-700 font-medium border-r border-gray-100">{idr(nilai)}</td>
      <td className="px-4 py-2.5 text-right text-sm text-gray-600">{pct(nilai, base)}</td>
    </tr>
  );
}

function SubtotalRow({ label, nilai, base, isGrand = false }: { label: string; nilai: number; base: number; isGrand?: boolean }) {
  return (
    <tr className={`border-y border-gray-200 ${isGrand ? 'bg-gray-100' : 'bg-gray-50'}`}>
      <td className={`px-4 py-3 text-sm ${isGrand ? 'font-bold' : 'font-semibold'} text-gray-800 border-r border-gray-200`}>
        {isGrand ? label.toUpperCase() : <span className="ml-4">{label}</span>}
      </td>
      <td className={`px-4 py-3 text-sm ${isGrand ? 'font-bold' : 'font-semibold'} text-right text-gray-800 border-r border-gray-100`}>
        {idr(nilai)}
      </td>
      <td className={`px-4 py-3 text-sm ${isGrand ? 'font-bold' : 'font-semibold'} text-right text-gray-800`}>
        {pct(nilai, base)}
      </td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LaporanLabaRugi() {
  const { dataLaporan, filters, error } = usePage().props as unknown as PageProps;

  // State untuk form filter
  const [bulan, setBulan] = useState(filters?.bulan || new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(filters?.tahun || new Date().getFullYear());

  // Pastikan data memiliki struktur default jika null/undefined dari server
  const safeData = dataLaporan || {
    pendapatan: [],
    hpp: [],
    bebanOperasional: [],
    penghasilanLain: [],
    bebanLain: []
  };

  // Fungsi helper untuk menjumlahkan array secara aman
  const sumNilai = (arr?: AkunData[]) => {
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((acc, curr) => acc + (Number(curr.nilai) || 0), 0);
  };

  // Perhitungan Laba Rugi
  const totalPendapatan   = sumNilai(safeData.pendapatan);
  const totalHpp          = sumNilai(safeData.hpp);
  const labaKotor         = totalPendapatan - totalHpp;
  
  const totalBebanOperasi = sumNilai(safeData.bebanOperasional);
  const labaUsaha         = labaKotor - totalBebanOperasi;
  
  const totalPdptLain     = sumNilai(safeData.penghasilanLain);
  const totalBebanLain    = sumNilai(safeData.bebanLain);
  const labaSebelumPajak  = labaUsaha + totalPdptLain - totalBebanLain;
  
  const tarifPajak        = 0;
  const pajak             = Math.max(0, labaSebelumPajak) * tarifPajak;
  const labaBersih        = labaSebelumPajak - pajak;

  const periodeLabel = `${BULAN_LABELS[bulan]} ${tahun}`;
  
  const handleFilter = () => {
    // MEMPERBAIKI MASALAH LOADING: URL harus sama dengan yang di web.php
    router.get('/laporan/laba-rugi', { bulan, tahun }, { preserveState: true });
  };

  const isDataKosong = 
    safeData.pendapatan.length === 0 && 
    safeData.hpp.length === 0 && 
    safeData.bebanOperasional.length === 0;

  return (
    <div className="p-6 space-y-6">

      {/* ── HEADER OUTSIDE CARD ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-red-800">Laporan Laba Rugi</h2>
          <p className="text-sm text-red-800 mt-1">Laporan laba rugi komprehensif per periode</p>
        </div>
        <button
          onClick={() => window.print()}
          disabled={isDataKosong}
          className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Printer className="w-5 h-5" />
          Cetak Laporan
        </button>
      </div>

      {/* ── ERROR MESSAGE ── */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg font-mono text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* ── CARD FILTER ── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1 text-gray-400" /> Bulan
            </label>
            <select value={bulan} onChange={e => setBulan(Number(e.target.value))} className="px-3 py-2 text-sm border border-gray-300 rounded-lg min-w-40 focus:ring-2 focus:ring-red-500 outline-none">
              {Object.entries(BULAN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
            <select value={tahun} onChange={e => setTahun(Number(e.target.value))} className="px-3 py-2 text-sm border border-gray-300 rounded-lg min-w-32 focus:ring-2 focus:ring-red-500 outline-none">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={handleFilter} className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white text-sm font-medium rounded-lg">
            Tampilkan
          </button>
        </div>
      </div>

      {/* ── CARD LAPORAN ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isDataKosong ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            Tidak ada transaksi jurnal untuk periode <span className="font-medium text-gray-700">{periodeLabel}</span>.
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200 text-center">
              <h1 className="text-2xl font-bold text-gray-800">CV NEW CITRA</h1>
              <p className="text-sm text-gray-600 mt-1">Laporan Laba Rugi</p>
              <p className="text-sm text-gray-600">Periode: {periodeLabel}</p>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto max-w-4xl mx-auto">
                <table className="w-full border border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-200">Keterangan</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700 border-r border-gray-100 w-48">Nilai (Rp)</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700 w-32">Persentase (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    
                    {/* I. PENDAPATAN */}
                    <SectionHeader label="I. Pendapatan Usaha" />
                    {safeData.pendapatan.map((akun, i) => (
                      <ItemRow key={`p-${i}`} indent label={akun.label} nilai={akun.nilai} base={totalPendapatan} />
                    ))}
                    <SubtotalRow label="Total Pendapatan Usaha" nilai={totalPendapatan} base={totalPendapatan} />

                    {/* II. HPP */}
                    <SectionHeader label="II. Beban Pokok Penjualan" />
                    {safeData.hpp.map((akun, i) => (
                      <ItemRow key={`h-${i}`} indent label={akun.label} nilai={akun.nilai} base={totalPendapatan} />
                    ))}
                    <SubtotalRow label="Total Beban Pokok Penjualan" nilai={totalHpp} base={totalPendapatan} />

                    <SubtotalRow label="LABA KOTOR" nilai={labaKotor} base={totalPendapatan} isGrand />

                    {/* III. BEBAN OPERASIONAL */}
                    <SectionHeader label="III. Beban Operasional" />
                    {safeData.bebanOperasional.map((akun, i) => (
                      <ItemRow key={`bo-${i}`} indent label={akun.label} nilai={akun.nilai} base={totalPendapatan} />
                    ))}
                    <SubtotalRow label="Total Beban Operasional" nilai={totalBebanOperasi} base={totalPendapatan} />

                    <SubtotalRow label="LABA USAHA (EBIT)" nilai={labaUsaha} base={totalPendapatan} isGrand />

                    {/* IV. PENDAPATAN & BEBAN LAIN */}
                    <SectionHeader label="IV. Penghasilan & Beban Lain-lain" />
                    {safeData.penghasilanLain.map((akun, i) => (
                      <ItemRow key={`pl-${i}`} indent label={akun.label} nilai={akun.nilai} base={totalPendapatan} />
                    ))}
                    {safeData.bebanLain.map((akun, i) => (
                      <ItemRow key={`bl-${i}`} indent label={akun.label} nilai={akun.nilai * -1} base={totalPendapatan} /> 
                    ))}
                    <SubtotalRow label="Total Pendapatan (Beban) Lain-lain" nilai={totalPdptLain - totalBebanLain} base={totalPendapatan} />

                    <SubtotalRow label="LABA SEBELUM PAJAK" nilai={labaSebelumPajak} base={totalPendapatan} isGrand />

                    {/* V. PAJAK */}
                    {tarifPajak > 0 && (
                      <>
                        <SectionHeader label="V. Pajak Penghasilan" />
                        <ItemRow indent label={`Pajak Penghasilan Badan (${(tarifPajak * 100).toFixed(0)}%)`} nilai={pajak} base={totalPendapatan} />
                      </>
                    )}

                    <SubtotalRow label="LABA BERSIH" nilai={labaBersih} base={totalPendapatan} isGrand />
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          .bg-white.rounded-lg.shadow-sm.border.border-gray-200.overflow-hidden,
          .bg-white.rounded-lg.shadow-sm.border.border-gray-200.overflow-hidden * { visibility: visible; }
          .bg-white.rounded-lg.shadow-sm.border.border-gray-200.overflow-hidden {
            position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Printer, Calendar } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Math.abs(n));

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface AkunSaldo {
  kode: string;
  nama: string;
  saldo: number;
}

interface PosisiKeuangan {
  periode: string;
  tanggal: string;
  asetLancar: AkunSaldo[];
  asetTetap: AkunSaldo[];
  liabilitas: AkunSaldo[];
  ekuitas: AkunSaldo[];
}

// ─── Kalkulasi Dinamis (Anti-Crash) ───────────────────────────────────────────
const sumSaldo = (arr?: AkunSaldo[]) => {
  if (!Array.isArray(arr)) return 0; // Mencegah layar putih jika data gagal dimuat
  return arr.reduce((sum, item) => sum + (Number(item.saldo) || 0), 0);
};

const totalAsetLancar  = (d: PosisiKeuangan) => sumSaldo(d.asetLancar);
const totalAsetTetap   = (d: PosisiKeuangan) => sumSaldo(d.asetTetap);
const totalAset        = (d: PosisiKeuangan) => totalAsetLancar(d) + totalAsetTetap(d);

const totalLiabilitas  = (d: PosisiKeuangan) => sumSaldo(d.liabilitas);
const totalEkuitas     = (d: PosisiKeuangan) => sumSaldo(d.ekuitas);
const totalLiabEkuitas = (d: PosisiKeuangan) => totalLiabilitas(d) + totalEkuitas(d);

// ─── Dropdown options ─────────────────────────────────────────────────────────
const BULAN = [
  { value: 1,  label: 'Januari' },  { value: 2,  label: 'Februari' }, { value: 3,  label: 'Maret' },
  { value: 4,  label: 'April' },    { value: 5,  label: 'Mei' },      { value: 6,  label: 'Juni' },
  { value: 7,  label: 'Juli' },     { value: 8,  label: 'Agustus' },  { value: 9,  label: 'September' },
  { value: 10, label: 'Oktober' },  { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
];

const TAHUN_OPTIONS = [2024, 2025, 2026, 2027];

// ─── Tabel Row Components ─────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <tr className="bg-gray-100 border-y border-gray-200">
      <td colSpan={3} className="px-4 py-2.5 text-sm font-bold text-gray-800 uppercase tracking-wide">
        {label}
      </td>
    </tr>
  );
}

function GroupHeader({ label }: { label: string }) {
  return (
    <tr className="bg-gray-50 border-b border-gray-100">
      <td colSpan={3} className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
        {label}
      </td>
    </tr>
  );
}

function ItemRow({ kode, label, val, indent = true, noRedNegative = false }: {
  kode: string; label: string; val: number; indent?: boolean; noRedNegative?: boolean;
}) {
  const negative = val < 0;
  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
      <td className="px-4 py-2.5 text-xs font-mono text-gray-500 whitespace-nowrap border-r border-gray-200">{kode}</td>
      <td className={`px-4 py-2.5 text-sm text-gray-700 border-r border-gray-200 ${indent ? 'pl-8' : ''}`}>{label}</td>
      <td className={`px-4 py-2.5 text-sm text-right font-medium ${negative && !noRedNegative ? 'text-red-600' : 'text-gray-700'}`}>
        {negative ? `(${idr(Math.abs(val))})` : idr(val)}
      </td>
    </tr>
  );
}

function SubtotalRow({ label, val, variant = 'normal' }: {
  label: string; val: number; variant?: 'normal' | 'section' | 'grand';
}) {
  if (variant === 'grand') {
    return (
      <tr className="bg-gray-100 border-t-2 border-gray-300">
        <td className="px-4 py-3.5 border-r border-gray-200" colSpan={2}>
          <span className="font-bold text-gray-900 text-base uppercase">{label}</span>
        </td>
        <td className="px-4 py-3.5 text-right font-bold text-gray-900 text-base">{idr(val)}</td>
      </tr>
    );
  }
  return (
    <tr className="bg-gray-50 border-y border-gray-200">
      <td className="px-4 py-2.5 border-r border-gray-200" colSpan={2}>
        <span className="font-semibold text-gray-800 text-sm ml-4">{label}</span>
      </td>
      <td className="px-4 py-2.5 text-sm font-semibold text-right text-gray-800">{idr(val)}</td>
    </tr>
  );
}

function Spacer() {
  return <tr><td colSpan={3} className="h-4 bg-white" /></tr>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LaporanPosisiKeuangan() {
  const { dataKeuangan, filterBulan, filterTahun } = usePage().props as unknown as {
    dataKeuangan: PosisiKeuangan | null;
    filterBulan: number;
    filterTahun: number;
  };

  const [bulan, setBulan] = useState(filterBulan || new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(filterTahun || new Date().getFullYear());

  const handleTampilkan = () => {
    router.get('/laporan-posisi-keuangan', { bulan, tahun }, { preserveState: true });
  };

  const d = dataKeuangan;
  const isBalanced = d ? Math.abs(totalAset(d) - totalLiabEkuitas(d)) <= 1 : false; 

  return (
    <div className="p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-red-800">Laporan Posisi Keuangan</h2>
          <p className="text-sm text-red-800 mt-1">Laporan neraca keuangan (Balance Sheet)</p>
        </div>
        <button
          onClick={() => window.print()}
          disabled={!d}
          className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Printer className="w-5 h-5" /> Cetak Laporan
        </button>
      </div>

      {/* ── FILTER ── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" /> Bulan
            </label>
            <select
              value={bulan}
              onChange={e => setBulan(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-w-40"
            >
              {BULAN.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
            <select
              value={tahun}
              onChange={e => setTahun(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-w-32"
            >
              {TAHUN_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button
            onClick={handleTampilkan}
            className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Tampilkan Laporan
          </button>
        </div>
      </div>

      {/* ── LAPORAN ── */}
      {!d ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center text-gray-400 text-sm">
          Data belum tersedia. Silakan klik Tampilkan Laporan.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Perusahaan */}
          <div className="p-6 border-b border-gray-200 text-center">
            <h1 className="text-2xl font-bold text-gray-800">CV NEW CITRA</h1>
            <h3 className="text-sm text-gray-600 mt-1">Laporan Posisi Keuangan</h3>
            <p className="text-sm text-gray-600">Per {d.tanggal}</p>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto max-w-4xl mx-auto">
              <table className="w-full border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-200 w-36">Kode Akun</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-200">Nama Akun</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 w-52">{d.tanggal}</th>
                  </tr>
                </thead>
                <tbody>

                  {/* ══ ASET ══ */}
                  <SectionHeader label="ASET" />

                  <GroupHeader label="Aset Lancar" />
                  {Array.isArray(d.asetLancar) && d.asetLancar.map((akun) => (
                    <ItemRow key={akun.kode} kode={akun.kode} label={akun.nama} val={akun.saldo} />
                  ))}
                  <SubtotalRow label="Jumlah Aset Lancar" val={totalAsetLancar(d)} variant="section" />

                  <Spacer />
                  <GroupHeader label="Aset Tidak Lancar — Aset Tetap" />
                  {Array.isArray(d.asetTetap) && d.asetTetap.map((akun) => (
                    <ItemRow 
                      key={akun.kode} 
                      kode={akun.kode} 
                      label={akun.nama} 
                      val={akun.saldo} 
                      noRedNegative={false} 
                    />
                  ))}
                  <SubtotalRow label="Nilai Buku Aset Tetap" val={totalAsetTetap(d)} variant="section" />

                  <Spacer />
                  <SubtotalRow label="JUMLAH ASET" val={totalAset(d)} variant="grand" />

                  {/* ══ LIABILITAS ══ */}
                  <Spacer />
                  <SectionHeader label="LIABILITAS" />
                  <GroupHeader label="Liabilitas Jangka Pendek" />
                  {Array.isArray(d.liabilitas) && d.liabilitas.map((akun) => (
                    <ItemRow key={akun.kode} kode={akun.kode} label={akun.nama} val={akun.saldo} indent={false} />
                  ))}
                  <SubtotalRow label="Jumlah Liabilitas" val={totalLiabilitas(d)} variant="section" />

                  {/* ══ EKUITAS ══ */}
                  <Spacer />
                  <SectionHeader label="EKUITAS" />
                  {Array.isArray(d.ekuitas) && d.ekuitas.map((akun) => (
                    <ItemRow key={akun.kode} kode={akun.kode} label={akun.nama} val={akun.saldo} indent={false} />
                  ))}
                  <SubtotalRow label="Jumlah Ekuitas" val={totalEkuitas(d)} variant="section" />

                  <Spacer />
                  <SubtotalRow label="JUMLAH LIABILITAS DAN EKUITAS" val={totalLiabEkuitas(d)} variant="grand" />

                </tbody>
              </table>
            </div>

            {/* Balance Check */}
            <div className="max-w-4xl mx-auto mt-6 px-6 py-4 rounded-lg bg-gray-50 border border-gray-200 print:hidden">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isBalanced ? 'bg-green-500' : 'bg-red-500'}`} />
                {isBalanced ? (
                  <p className="text-sm text-green-700 font-medium">
                    Neraca seimbang: Total Aset = Total Liabilitas + Ekuitas
                  </p>
                ) : (
                  <p className="text-sm text-red-700 font-medium">
                    Neraca tidak seimbang — Selisih: {idr(totalAset(d) - totalLiabEkuitas(d))}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      `}</style>
    </div>
  );
}
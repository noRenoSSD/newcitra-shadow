import { useState, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Printer, Calendar } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

// ─── Types ────────────────────────────────────────────────────────────────────

interface HPPData {
  biayaBB: number;
  biayaTK: number;
  biayaOH: number;
}

const BULAN = [
  { value: 1,  label: 'Januari'   },
  { value: 2,  label: 'Februari'  },
  { value: 3,  label: 'Maret'     },
  { value: 4,  label: 'April'     },
  { value: 5,  label: 'Mei'       },
  { value: 6,  label: 'Juni'      },
  { value: 7,  label: 'Juli'      },
  { value: 8,  label: 'Agustus'   },
  { value: 9,  label: 'September' },
  { value: 10, label: 'Oktober'   },
  { value: 11, label: 'November'  },
  { value: 12, label: 'Desember'  },
];

const currentYear = new Date().getFullYear();
const TAHUN_OPTIONS = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

interface RowDef {
  type: 'header' | 'item' | 'hpp';
  label: string;
  value?: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LaporanHargaPokokProduksi() {
  // Tangkap data dari Controller Laravel
  const { laporanData, filterBulan, filterTahun } = usePage().props as unknown as {
    laporanData: HPPData;
    filterBulan: number;
    filterTahun: number;
  };

  const [bulan, setBulan] = useState(filterBulan);
  const [tahun, setTahun] = useState(filterTahun);

  const hpp = laporanData.biayaBB + laporanData.biayaTK + laporanData.biayaOH;

  const namaBulan = BULAN.find(b => b.value === filterBulan)?.label ?? '';
  const periodeLabel = `${namaBulan} ${filterTahun}`;

  const rows: RowDef[] = useMemo(() => [
    { type: 'header',  label: 'BAHAN BAKU LANGSUNG' },
    { type: 'item',    label: 'Biaya Bahan Baku Langsung',   value: laporanData.biayaBB },
    { type: 'header',  label: 'TENAGA KERJA LANGSUNG' },
    { type: 'item',    label: 'Biaya Tenaga Kerja Langsung', value: laporanData.biayaTK },
    { type: 'header',  label: 'BIAYA OVERHEAD PABRIK' },
    { type: 'item',    label: 'Biaya Overhead Pabrik',       value: laporanData.biayaOH },
    { type: 'hpp',     label: 'Harga Pokok Produksi',        value: hpp },
  ], [laporanData, hpp]);

  // Fungsi untuk menembak ulang API dengan filter baru
  const handleTampilkan = () => {
    router.get('/produksi/laporan-hpp', { bulan, tahun }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handlePrint = () => window.print();

  return (
    <div className="p-6 space-y-6">
      
      {/* ── HEADER OUTSIDE CARD ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-red-800">Laporan Harga Pokok Produksi</h2>
          <p className="text-sm text-red-800 mt-1">Laporan perhitungan harga pokok produksi per periode</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors text-sm font-medium"
        >
          <Printer className="w-5 h-5" />
          Cetak Laporan
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        
        {/* ── CARD FILTER & ACTIONS ── */}
        <div className="p-6 border-b border-gray-200 print:hidden">
          <div className="flex flex-wrap items-end gap-4">
            {/* Bulan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
                Bulan
              </label>
              <select
                value={bulan}
                onChange={e => setBulan(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-w-40 text-sm"
              >
                {BULAN.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>

            {/* Tahun */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
              <select
                value={tahun}
                onChange={e => setTahun(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-w-32 text-sm"
              >
                {TAHUN_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Tombol Tampilkan */}
            <div>
              <button
                onClick={handleTampilkan}
                className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Tampilkan
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD LAPORAN (HEADER PERUSAHAAN + TABEL) ── */}
        <div className="p-6">
          {/* Header Perusahaan */}
          <div className="hidden print:block mb-6 border-b-2 border-gray-800 pb-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800">CV NEW CITRA</h1>
            <p className="text-sm text-gray-600 mt-1">Laporan Harga Pokok Produksi</p>
            <p className="text-sm text-gray-600">Periode: {periodeLabel}</p>
          </div>
          <div className="print:hidden border-b border-gray-200 pb-6 mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800">CV NEW CITRA</h1>
            <p className="text-sm text-gray-600 mt-1">Laporan Harga Pokok Produksi</p>
            <p className="text-sm text-gray-600">Periode: {periodeLabel}</p>
          </div>

          {/* Tabel HPP */}
          <div className="overflow-x-auto max-w-4xl mx-auto">
            <table className="w-full border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 border-r border-gray-200">Komponen Biaya</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  
                  // Row Header Kategori
                  if (row.type === 'header') {
                    return (
                      <tr key={idx} className="bg-gray-50 border-b border-gray-200">
                        <td className="py-2.5 px-4 font-semibold text-gray-700 uppercase" colSpan={2}>
                          {row.label}
                        </td>
                      </tr>
                    );
                  }

                  // Row Total HPP
                  if (row.type === 'hpp') {
                    return (
                      <tr key={idx} className="bg-gray-100 border-t-2 border-gray-300">
                        <td className="py-4 px-4 font-bold text-gray-800 text-base border-r border-gray-200 uppercase">
                          {row.label}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-gray-800 text-base">
                          {idr(row.value ?? 0)}
                        </td>
                      </tr>
                    );
                  }

                  // Row Item Biasa
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 pl-10 text-gray-700 border-r border-gray-200">
                        {row.label}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 font-medium">
                        {idr(row.value ?? 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {hpp === 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Tidak ada data produksi yang selesai dihitung (COGM) untuk periode {periodeLabel}.
            </div>
          )}
        </div>
      </div>

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
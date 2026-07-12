import { useState, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Search, Printer, FileText } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────

type TipeAset = 'Mesin' | 'Kendaraan' | 'Peralatan';

const BULAN_OPTIONS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const currentYear = new Date().getFullYear();
const TAHUN_OPTIONS = Array.from({ length: 8 }, (_, i) => String(currentYear - 3 + i));

interface AsetTetap {
  kodeAset: string;
  namaAset: string;
  tipeAset: TipeAset;
  tanggalBeli: string;
  hargaPerolehan: number;
  penyusutanPerBulan: number;  // Diambil lgsg dari DB
  akumulasiPenyusutan: number; // Diambil lgsg dari DB
  nilaiBuku: number;           // Diambil lgsg dari DB
}

const TIPE_OPTIONS: TipeAset[] = ['Mesin', 'Kendaraan', 'Peralatan'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LaporanAsetTetap() {
  // Menangkap data asli dari Controller
  const { asetData = [], filterBulan, filterTahun } = usePage().props as unknown as {
    asetData: AsetTetap[];
    filterBulan: string;
    filterTahun: string;
  };

  const [bulan,      setBulan]      = useState(filterBulan);
  const [tahun,      setTahun]      = useState(filterTahun);
  const [tipeFilter, setTipeFilter] = useState<TipeAset | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  const periodeDisplay = `${bulan} ${tahun}`;

  // ── Auto-Fetch ke Database saat Filter Berubah ────────────────────────────
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    // Kirim request ke backend saat bulan/tahun diubah
    router.get('/laporan/aset-tetap', { bulan, tahun }, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  }, [bulan, tahun]);

  // ── Filter Lokal (Hanya untuk Search & Tipe) ──────────────────────────────
  const filtered = asetData.filter(a => {
    if (tipeFilter && a.tipeAset !== tipeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!a.kodeAset.toLowerCase().includes(q) && !a.namaAset.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalPerolehan    = filtered.reduce((s, a) => s + a.hargaPerolehan, 0);
  const totalPenyPerBulan = filtered.reduce((s, a) => s + a.penyusutanPerBulan, 0);
  const totalAkumulasi    = filtered.reduce((s, a) => s + a.akumulasiPenyusutan, 0);
  const totalNilaiBuku    = filtered.reduce((s, a) => s + a.nilaiBuku, 0);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header Outside Card */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-red-800">Laporan Aset Tetap</h2>
          <p className="text-sm text-red-800 mt-1">Laporan daftar aset tetap dan penyusutannya</p>
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

        {/* ── FILTER ── */}
        <div className="p-6 border-b border-gray-200 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Bulan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
              <select
                value={bulan}
                onChange={e => setBulan(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              >
                {BULAN_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Tahun */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
              <select
                value={tahun}
                onChange={e => setTahun(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              >
                {TAHUN_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Tipe Aset */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Aset</label>
              <select
                value={tipeFilter}
                onChange={e => setTipeFilter(e.target.value as TipeAset | '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              >
                <option value="">Semua Tipe</option>
                {TIPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Placeholder kolom ke-4 */}
            <div className="hidden lg:block" />
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari Kode Aset atau Nama Aset..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* ── TABEL ── */}
        <div className="p-6">
          {/* Print header */}
          <div className="hidden print:block mb-6 text-center border-b-2 border-gray-800 pb-4">
            <h1 className="text-2xl font-bold text-gray-800">CV NEW CITRA</h1>
            <p className="text-sm text-gray-600 mt-1">Laporan Aset Tetap</p>
            <p className="text-sm text-gray-600">Per periode: {periodeDisplay}</p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data penyusutan aset untuk periode {periodeDisplay}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="text-left py-3 px-4 font-semibold border-r border-gray-200">Kode</th>
                      <th className="text-left py-3 px-4 font-semibold border-r border-gray-200">Nama Aset</th>
                      <th className="text-left py-3 px-4 font-semibold border-r border-gray-200">Tanggal Perolehan</th>
                      <th className="text-right py-3 px-4 font-semibold border-r border-gray-200">Harga Perolehan</th>
                      <th className="text-right py-3 px-4 font-semibold border-r border-gray-200">Penyusutan/Bulan</th>
                      <th className="text-right py-3 px-4 font-semibold border-r border-gray-200">Akum. Penyusutan</th>
                      <th className="text-right py-3 px-4 font-semibold">Nilai Buku</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a, idx) => (
                      <tr key={a.kodeAset} className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                        <td className="py-2.5 px-4 font-semibold text-gray-700 border-r border-gray-100 whitespace-nowrap">
                          {a.kodeAset}
                        </td>
                        <td className="py-2.5 px-4 text-gray-700 border-r border-gray-100">
                          {a.namaAset}
                        </td>
                        <td className="py-2.5 px-4 text-gray-700 border-r border-gray-100 whitespace-nowrap">
                          {formatDate(a.tanggalBeli)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-gray-700 border-r border-gray-100 whitespace-nowrap">
                          {formatCurrency(a.hargaPerolehan)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-gray-700 border-r border-gray-100 whitespace-nowrap">
                          {formatCurrency(a.penyusutanPerBulan)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-gray-700 border-r border-gray-100 whitespace-nowrap">
                          {formatCurrency(a.akumulasiPenyusutan)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-gray-700 whitespace-nowrap">
                          {formatCurrency(a.nilaiBuku)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                      <td colSpan={3} className="py-3 px-4 text-gray-800 text-right border-r border-gray-300">
                        TOTAL:
                      </td>
                      <td className="py-3 px-4 text-right text-gray-800 border-r border-gray-300 whitespace-nowrap">
                        {formatCurrency(totalPerolehan)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-800 border-r border-gray-300 whitespace-nowrap">
                        {formatCurrency(totalPenyPerBulan)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-800 border-r border-gray-300 whitespace-nowrap">
                        {formatCurrency(totalAkumulasi)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-800 whitespace-nowrap">
                        {formatCurrency(totalNilaiBuku)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Total {filtered.length} aset tetap tercatat
              </div>
            </>
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
import { useState, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { Search, Printer, Calendar, FileText } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProduksiRecord {
  noProduksi: string;
  tanggalISO: string;    
  tanggalLabel: string;  
  kodeProduk: string;
  namaProduk: string;
  qtyRencana: number;
  qtyRealisasi: number;
  satuan: string;
  totalBiayaBB: number;
  totalBiayaTK: number;
  totalOverhead: number;
  catatan: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LaporanProduksi() {
  // Tangkap data dari Controller Laravel
  const { laporanData = [] } = usePage().props as unknown as { laporanData: ProduksiRecord[] };

  const [tanggalMulai,   setTanggalMulai]   = useState('2026-01-01');
  const [tanggalSelesai, setTanggalSelesai] = useState('2026-12-31');
  const [filterProduk,   setFilterProduk]   = useState('');
  const [searchTerm,     setSearchTerm]     = useState('');

  // Buat daftar produk unik untuk dropdown filter secara dinamis
  const uniqueProduk = useMemo(() => {
    return Array.from(new Set(laporanData.map(r => r.namaProduk)));
  }, [laporanData]);

  // ── Filter ────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return laporanData.filter(r => {
      const tgl     = new Date(r.tanggalISO);
      const mulai   = new Date(tanggalMulai);
      const selesai = new Date(tanggalSelesai);
      if (tgl < mulai || tgl > selesai) return false;
      if (filterProduk && r.namaProduk !== filterProduk) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (!r.noProduksi.toLowerCase().includes(q) && !r.namaProduk.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [laporanData, tanggalMulai, tanggalSelesai, filterProduk, searchTerm]);

  // ── Totals (footer) ───────────────────────────────────────────────────────

  const totalRencana   = filtered.reduce((s, r) => s + r.qtyRencana, 0);
  const totalRealisasi = filtered.reduce((s, r) => s + r.qtyRealisasi, 0);
  const totalBiaya     = filtered.reduce((s, r) => s + r.totalBiayaBB + r.totalBiayaTK + r.totalOverhead, 0);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handlePrint = () => window.print();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header Outside Card */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-red-800">Laporan Produksi</h2>
          <p className="text-sm text-red-800 mt-1">Laporan rekapitulasi hasil produksi per periode</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
        >
          <Printer className="w-5 h-5" />
          Cetak Laporan
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* ── FILTER ── */}
        <div className="p-6 border-b border-gray-200 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tanggal Mulai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={e => setTanggalMulai(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Tanggal Selesai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={e => setTanggalSelesai(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Produk */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Produk</label>
              <select
                value={filterProduk}
                onChange={e => setFilterProduk(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              >
                <option value="">Semua Produk</option>
                {uniqueProduk.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari No Produksi atau Nama Produk..."
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
            <p className="text-sm text-gray-600">Laporan Produksi</p>
            <p className="text-sm text-gray-600">
              Periode: {formatDate(tanggalMulai)} – {formatDate(tanggalSelesai)}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data produksi untuk periode yang dipilih</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="text-left py-3 px-4 font-semibold border-r border-gray-200">No Produksi</th>
                      <th className="text-left py-3 px-4 font-semibold border-r border-gray-200">Tanggal</th>
                      <th className="text-left py-3 px-4 font-semibold border-r border-gray-200">Produk</th>
                      <th className="text-right py-3 px-4 font-semibold border-r border-gray-200">Rencana</th>
                      <th className="text-right py-3 px-4 font-semibold border-r border-gray-200">Realisasi</th>
                      <th className="text-right py-3 px-4 font-semibold border-r border-gray-200">Biaya BB</th>
                      <th className="text-right py-3 px-4 font-semibold border-r border-gray-200">Biaya TK</th>
                      <th className="text-right py-3 px-4 font-semibold border-r border-gray-200">Overhead</th>
                      <th className="text-right py-3 px-4 font-semibold">Total Biaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, idx) => {
                      const biaya = r.totalBiayaBB + r.totalBiayaTK + r.totalOverhead;
                      return (
                        <tr key={r.noProduksi}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                          <td className="py-2.5 px-4 font-semibold text-gray-700 border-r border-gray-100 whitespace-nowrap">
                            {r.noProduksi}
                          </td>
                          <td className="py-2.5 px-4 text-gray-700 border-r border-gray-100 whitespace-nowrap">
                            {r.tanggalLabel}
                          </td>
                          <td className="py-2.5 px-4 text-gray-700 border-r border-gray-100">
                            {r.namaProduk}
                          </td>
                          <td className="py-2.5 px-4 text-right text-gray-700 border-r border-gray-100 whitespace-nowrap">
                            {r.qtyRencana.toLocaleString('id-ID')} {r.satuan}
                          </td>
                          <td className="py-2.5 px-4 text-right text-gray-700 border-r border-gray-100 whitespace-nowrap">
                            {r.qtyRealisasi.toLocaleString('id-ID')} {r.satuan}
                          </td>
                          <td className="py-2.5 px-4 text-right text-gray-700 border-r border-gray-100 whitespace-nowrap">
                            {formatCurrency(r.totalBiayaBB)}
                          </td>
                          <td className="py-2.5 px-4 text-right text-gray-700 border-r border-gray-100 whitespace-nowrap">
                            {formatCurrency(r.totalBiayaTK)}
                          </td>
                          <td className="py-2.5 px-4 text-right text-gray-700 border-r border-gray-100 whitespace-nowrap">
                            {formatCurrency(r.totalOverhead)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-medium text-gray-700 whitespace-nowrap">
                            {formatCurrency(biaya)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                      <td colSpan={3} className="py-3 px-4 text-gray-800 text-right border-r border-gray-300">
                        TOTAL
                      </td>
                      <td className="py-3 px-4 text-right text-gray-800 border-r border-gray-300">
                        {totalRencana.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-800 border-r border-gray-300">
                        {totalRealisasi.toLocaleString('id-ID')}
                      </td>
                      <td colSpan={3} className="border-r border-gray-300" />
                      <td className="py-3 px-4 text-right text-gray-800 whitespace-nowrap">
                        {formatCurrency(totalBiaya)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
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
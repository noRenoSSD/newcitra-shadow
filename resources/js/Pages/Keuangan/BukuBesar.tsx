import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Search, RefreshCw, BookOpen, Calendar, Printer, FileDown } from 'lucide-react';

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const formatDate = (iso: string) => {
  if (!iso) return '';
  const datePart = iso.split('T')[0].split(' ')[0]; 
  const [y, m, d] = datePart.split('-');
  const bl = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d} ${bl[Number(m)]} ${y}`;
};

const formatKodeAkun = (kode: string) => {
  if (!kode) return '';
  if (kode.includes('-')) return kode;
  return `${kode.slice(0, 1)}-${kode.slice(1)}`;
};

interface AkunRecord {
  kode: string;
  nama: string;
  kategori: string; // <-- Menampung kategori dari backend
  normalDebit: boolean;
  saldoAwal: number;
}

interface LedgerTx {
  id: string;
  tanggalISO: string;
  tanggal: string;
  noJurnal: string;
  keterangan: string;
  debit: number;
  kredit: number;
}

interface LedgerData {
  kodeAkun: string;
  saldoAwal: number;
  transactions: LedgerTx[];
}

export default function BukuBesar() {
  const { masterAkun = [], ledgerData = [] } = usePage().props as unknown as { 
    masterAkun: AkunRecord[];
    ledgerData: LedgerData[];
  };

  const [selectedAkun,   setSelectedAkun]   = useState('');
  const [tanggalMulai,   setTanggalMulai]   = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [search,         setSearch]         = useState('');
  const [akunSearch,     setAkunSearch]     = useState('');

  const akun        = masterAkun.find(a => a.kode === selectedAkun);
  const ledgerEntry = ledgerData.find(l => l.kodeAkun === selectedAkun);

  // Sorting Transaksi
  const allTx = (ledgerEntry?.transactions ?? []).slice().sort((a, b) => a.tanggalISO.localeCompare(b.tanggalISO));

  // =======================================================================
  // LOGIKA AKUNTANSI: PEMISAHAN AKUN RIIL (Neraca) & AKUN NOMINAL (Laba Rugi)
  // =======================================================================
  const nominalCategories = [
    'Pendapatan',
    'Beban Pokok Penjualan',
    'Beban Operasional',
    'Penghasilan Lain-lain',
    'Beban Lain-lain'
  ];

  const isNominal = akun ? nominalCategories.includes(akun.kategori) : false;

  // Jika Nominal, Saldo Awal selalu 0. Jika Riil, ambil saldo_awal dari DB.
  const baseSaldoAwal = (!isNominal && akun) ? akun.saldoAwal : 0;
  
  // Transaksi sebelum periode (untuk menghitung saldo awal berjalan pada akun Riil)
  const txBefore = tanggalMulai ? allTx.filter(tx => tx.tanggalISO < tanggalMulai) : [];
  
  let saldoAwal = baseSaldoAwal;

  // Hanya Akun Riil yang mengakumulasikan transaksi masa lalu ke Saldo Awal
  if (!isNominal) {
    txBefore.forEach(tx => {
      saldoAwal = akun?.normalDebit
        ? saldoAwal + tx.debit - tx.kredit
        : saldoAwal - tx.debit + tx.kredit;
    });
  }
  // =======================================================================

  // Filter transaksi HANYA dalam rentang tanggal
  const txInRange = allTx.filter(tx =>
    (!tanggalMulai   || tx.tanggalISO >= tanggalMulai) &&
    (!tanggalSelesai || tx.tanggalISO <= tanggalSelesai)
  );

  // Filter pencarian table
  const filteredTx = search
    ? txInRange.filter(r =>
        r.keterangan.toLowerCase().includes(search.toLowerCase()) ||
        r.noJurnal.toLowerCase().includes(search.toLowerCase())
      )
    : txInRange;

  // Komputasi Saldo Berjalan (Running Balance)
  const rows = (() => {
    let saldo = saldoAwal;
    return filteredTx.map(tx => {
      saldo = akun?.normalDebit
        ? saldo + tx.debit - tx.kredit
        : saldo - tx.debit + tx.kredit;
      return { ...tx, saldo };
    });
  })();

  const totalD     = txInRange.reduce((s, r) => s + r.debit, 0);
  const totalK     = txInRange.reduce((s, r) => s + r.kredit, 0);
  const saldoAkhir = akun?.normalDebit ? saldoAwal + totalD - totalK : saldoAwal - totalD + totalK;

  // Pencarian list akun
  const filteredAkun = masterAkun.filter(a =>
    a.kode.toLowerCase().includes(akunSearch.toLowerCase()) ||
    a.nama.toLowerCase().includes(akunSearch.toLowerCase())
  );

  const handleReset = () => {
    setSelectedAkun(''); 
    setTanggalMulai('');
    setTanggalSelesai(''); 
    setSearch(''); 
    setAkunSearch('');
  };

  const handleExportCSV = () => {
    if (!akun) return;
    const BOM = '\uFEFF';
    const header = ['Tanggal', 'No. Jurnal', 'Keterangan', 'Debit (Rp)', 'Kredit (Rp)', 'Saldo (Rp)'];
    const saData = [['', '', 'Saldo Awal', '', '', baseSaldoAwal]];
    
    const body = rows.map(r => [formatDate(r.tanggalISO), r.noJurnal, r.keterangan, r.debit || 0, r.kredit || 0, Math.abs(r.saldo)]);
    
    const footer = [['', '', 'Saldo Akhir', totalD, totalK, Math.abs(saldoAkhir)]];
    const csv = BOM + [header, ...saData, ...body, ...footer]
      .map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `BukuBesar-${akun.kode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Buku Besar</h2>
          <p className="text-sm text-gray-500 mt-1">Rekap transaksi per akun dengan saldo berjalan</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button onClick={handleExportCSV} disabled={!akun}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <FileDown className="w-4 h-4" />Excel
          </button>
          <button onClick={() => window.print()} disabled={!akun}
            className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white text-sm rounded-lg hover:bg-red-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Printer className="w-4 h-4" />Cetak
          </button>
        </div>
      </div>

      {/* Control Panel / Filter */}
      <div className="bg-white rounded-lg shadow print:hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Account Selector */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1 text-red-600" />Akun <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400"
                  placeholder="Cari kode atau nama akun..."
                  value={akunSearch}
                  onChange={e => setAkunSearch(e.target.value)}
                />
              </div>

              <div
                className="mt-4 pr-1 custom-scrollbar"
                style={{ maxHeight: '160px', overflowY: 'auto' }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredAkun.map(a => (
                    <button
                      key={a.kode}
                      onClick={() => setSelectedAkun(a.kode)}
                      className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                        selectedAkun === a.kode
                          ? 'bg-red-700 text-white border-red-700'
                          : 'bg-gray-50 border-gray-200 hover:border-red-300 text-gray-700'
                      }`}
                    >
                      <span className="font-mono font-semibold">{formatKodeAkun(a.kode)}</span>
                      <br />
                      <span className="text-xs opacity-90 truncate block mt-0.5">{a.nama}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date Range & Metadata */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1 text-red-600" />Tanggal Mulai
                </label>
                <input type="date" value={tanggalMulai}
                  onChange={e => setTanggalMulai(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1 text-red-600" />Tanggal Selesai
                </label>
                <input type="date" value={tanggalSelesai}
                  onChange={e => setTanggalSelesai(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400" />
              </div>

              {akun && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600 font-medium">Akun Dipilih</p>
                  <p className="text-xs font-mono text-red-800 font-semibold mt-0.5">
                    {formatKodeAkun(akun.kode)} &mdash; {akun.nama}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-red-500">Saldo Normal: <span className="font-bold">{akun.normalDebit ? 'Debit' : 'Kredit'}</span></p>
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded border border-red-200">
                      {isNominal ? 'Akun Nominal' : 'Akun Riil'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" />Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Display Area */}
      {!akun ? (
        <div className="bg-white rounded-lg shadow flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
            <BookOpen className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-500">Pilih akun untuk melihat buku besar</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-wrap gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                {formatKodeAkun(akun.kode)} &mdash; {akun.nama}
              </h3>
              {(tanggalMulai || tanggalSelesai) && (
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(tanggalMulai)} s/d {formatDate(tanggalSelesai)}</p>
              )}
            </div>
            <div className="relative min-w-60 print:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400"
                placeholder="Cari keterangan/jurnal..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 whitespace-nowrap">Tanggal</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 whitespace-nowrap">No. Jurnal</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Keterangan</th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700 whitespace-nowrap">Debit (Rp)</th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700 whitespace-nowrap">Kredit (Rp)</th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700 whitespace-nowrap">Saldo (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-amber-50/50 border-b border-gray-100">
                  <td className="px-6 py-3 text-sm text-gray-400">—</td>
                  <td className="px-6 py-3 text-sm text-gray-400">—</td>
                  <td className="px-6 py-3 text-sm font-semibold text-amber-800">Saldo Awal</td>
                  <td className="px-6 py-3 text-right text-sm text-gray-400">—</td>
                  <td className="px-6 py-3 text-right text-sm text-gray-400">—</td>
                  <td className="px-6 py-3 text-right font-bold text-amber-800 tabular-nums">{idr(saldoAwal)}</td>
                </tr>

                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                      Belum ada transaksi pada periode ini
                    </td>
                  </tr>
                ) : rows.map((r, idx) => {
                  const rowBg = idx % 2 === 1 ? 'bg-gray-50' : 'bg-white';
                  return (
                    <tr key={r.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${rowBg}`}>
                      <td className="px-6 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDate(r.tanggalISO)}</td>
                      <td className="px-6 py-3 font-mono text-sm font-semibold text-gray-700 whitespace-nowrap">{r.noJurnal}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{r.keterangan}</td>
                      <td className="px-6 py-3 text-right text-sm tabular-nums">
                        {r.debit > 0 ? <span className="text-gray-800">{idr(r.debit)}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-3 text-right text-sm tabular-nums">
                        {r.kredit > 0 ? <span className="text-gray-800">{idr(r.kredit)}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className={`px-6 py-3 text-right text-sm font-semibold tabular-nums ${r.saldo >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {idr(Math.abs(r.saldo))}{r.saldo < 0 ? ' (Abnormal)' : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300">
                  <td colSpan={3} className="px-6 py-3 text-sm font-bold text-gray-700">Saldo Akhir</td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-gray-900 tabular-nums">{idr(totalD)}</td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-gray-900 tabular-nums">{idr(totalK)}</td>
                  <td className={`px-6 py-3 text-right text-sm font-bold tabular-nums ${saldoAkhir >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {idr(Math.abs(saldoAkhir))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          .bg-white.rounded-lg.shadow { visibility: visible; position: fixed; top: 0; left: 0; width: 100%; }
          .bg-white.rounded-lg.shadow * { visibility: visible; }
        }
      `}</style>
    </div>
  );
}
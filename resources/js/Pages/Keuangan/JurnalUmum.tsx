import { useState, useMemo } from 'react';
import { Search, Printer, Calendar, FileDown, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const formatDate = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const bl = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d} ${bl[Number(m)]} ${y}`;
};

const PAGE_SIZE = 10;

interface JurnalUmumProps {
  jurnals?: any[];
}

export default function JurnalUmum({ jurnals = [] }: JurnalUmumProps) {
  const [tanggalMulai,   setTanggalMulai]   = useState('2026-01-01');
  const [tanggalSelesai, setTanggalSelesai] = useState('2026-12-31');
  const [search,         setSearch]         = useState('');
  const [page,           setPage]           = useState(1);

  // Menyelaraskan struktur penamaan dari database Eloquent Laravel ke komponen UI
  const mappedJurnals = useMemo(() => {
    return jurnals.map((j: any) => ({
      noJurnal: j.kode_jurnal,
      tanggalISO: j.tanggal,
      keterangan: j.keterangan,
      kodeReferensi: j.kode_referensi || '—',
      lines: (j.detail || []).map((d: any) => ({
        id: d.id_jurnal_detail,
        kodeAkun: d.akun?.kode_akun || '—',
        namaAkun: d.akun?.nama_akun || 'Tidak Diketahui',
        debit: parseFloat(d.debit) || 0,
        kredit: parseFloat(d.kredit) || 0,
      }))
    }));
  }, [jurnals]);

  const filtered = useMemo(() => {
    return mappedJurnals.filter((e: any) => {
      const inRange = (!tanggalMulai || e.tanggalISO >= tanggalMulai) &&
                      (!tanggalSelesai || e.tanggalISO <= tanggalSelesai);
      const q = search.toLowerCase();
      const matchSearch = !q || 
        e.noJurnal.toLowerCase().includes(q) ||
        e.keterangan.toLowerCase().includes(q) ||
        e.kodeReferensi.toLowerCase().includes(q) ||
        e.lines.some((l: any) => l.namaAkun.toLowerCase().includes(q) || l.kodeAkun.toLowerCase().includes(q));
      return inRange && matchSearch;
    });
  }, [mappedJurnals, tanggalMulai, tanggalSelesai, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // FIX: Menambahkan tipe data :number dan :any agar TypeScript tidak protes
  const totalD = filtered.reduce((s: number, e: any) => s + e.lines.reduce((ss: number, l: any) => ss + l.debit, 0), 0);
  const totalK = filtered.reduce((s: number, e: any) => s + e.lines.reduce((ss: number, l: any) => ss + l.kredit, 0), 0);

  const handleReset = () => { 
    setTanggalMulai('2026-01-01'); 
    setTanggalSelesai('2026-12-31'); 
    setSearch(''); 
    setPage(1); 
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. HEADER (CV NEW CITRA warna MERAH & Rata Tengah)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(197, 34, 31); // Mengubah teks menjadi MERAH
    doc.text('CV NEW CITRA', pageWidth / 2, 15, { align: 'center' });
    
    doc.setTextColor(0, 0, 0); // Kembalikan ke HITAM
    doc.setFontSize(12);
    doc.text('Jurnal Umum', pageWidth / 2, 21, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const textPeriode = `Periode ${formatDate(tanggalMulai)} s/d ${formatDate(tanggalSelesai)}`;
    doc.text(textPeriode, pageWidth / 2, 27, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text('(Dalam Rupiah)', pageWidth / 2, 32, { align: 'center' });

    // 2. MENYIAPKAN DATA TABEL JURNAL UMUM
    const body: (string | number)[][] = [];
    filtered.forEach((e: any) => {
      const sorted = [...e.lines].sort((a: any, b: any) => b.debit - a.debit);
      sorted.forEach((l: any, i: number) => {
        body.push([
          i === 0 ? e.noJurnal : '',
          i === 0 ? formatDate(e.tanggalISO) : '',
          i === 0 ? e.kodeReferensi : '',
          l.debit > 0 ? l.namaAkun : `    ${l.namaAkun}`,
          i === 0 ? e.keterangan : '',
          l.debit  > 0 ? idr(l.debit)  : '-',
          l.kredit > 0 ? idr(l.kredit) : '-',
        ]);
      });
    });

    // Baris Total
    body.push(['', '', '', '', 'TOTAL', idr(totalD), idr(totalK)]);

    // 3. STYLE TABEL BLACK & WHITE GRID (Sama persis seperti PO & Jurnal Penyesuaian)
    autoTable(doc, {
      head: [['No. Jurnal', 'Tanggal', 'Ref', 'Nama Akun', 'Keterangan', 'Debit (Rp)', 'Kredit (Rp)']],
      body,
      startY: 40,
      theme: 'grid',
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        textColor: [0, 0, 0], 
        lineColor: [0, 0, 0], 
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0],       
        fontStyle: 'bold',
        halign: 'center'            
      },
      columnStyles: { 
        5: { halign: 'right' }, 
        6: { halign: 'right' } 
      },
      didParseCell: function (data) {
        if (data.row.index === body.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [250, 250, 250]; 
          if (data.column.index === 4) {
             data.cell.styles.halign = 'right'; 
          }
        }
      }
    });

    doc.save(`JurnalUmum-${tanggalMulai}-${tanggalSelesai}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Outside Card */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Jurnal Umum</h2>
          <p className="text-sm text-gray-500 mt-1">Jurnal dibuat otomatis dari setiap transaksi yang terjadi</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors print:hidden">
            <FileDown className="w-4 h-4" />PDF
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white text-sm rounded-lg hover:bg-red-900 transition-colors print:hidden">
            <Printer className="w-4 h-4" />Cetak
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Filter */}
        <div className="p-6 border-b border-gray-200 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1 text-red-600" />Tanggal Mulai
              </label>
              <input type="date" value={tanggalMulai}
                onChange={e => { setTanggalMulai(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1 text-red-600" />Tanggal Selesai
              </label>
              <input type="date" value={tanggalSelesai}
                onChange={e => { setTanggalSelesai(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400" />
            </div>
            <div className="lg:col-span-2 flex items-end">
              <button onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-4 h-4" />Reset
              </button>
            </div>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Cari no. jurnal, ref, keterangan, atau nama akun..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100 whitespace-nowrap">No. Jurnal</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100 whitespace-nowrap">Tanggal</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100 whitespace-nowrap">Ref</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">Nama Akun</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">Keterangan</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100 whitespace-nowrap">Debit (Rp)</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Kredit (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Tidak ada data untuk rentang tanggal yang dipilih</td></tr>
              ) : paged.map((entry: any, eIdx: number) => {
                const sorted = [...entry.lines].sort((a: any, b: any) => b.debit - a.debit);
                return sorted.map((line: any, lIdx: number) => {
                  const isFirst = lIdx === 0;
                  const isKredit = line.kredit > 0;
                  const rowBg = eIdx % 2 === 1 ? 'bg-gray-50' : 'bg-white';
                  return (
                    <tr key={`${entry.noJurnal}-${line.id}`} className={`border-t border-gray-100 hover:bg-gray-50 ${rowBg}`}>
                      {isFirst && (
                        <td rowSpan={sorted.length} className="px-4 py-3 font-mono text-sm font-semibold text-gray-700 border-r border-gray-100 align-top whitespace-nowrap">
                          {entry.noJurnal}
                        </td>
                      )}
                      {isFirst && (
                        <td rowSpan={sorted.length} className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100 align-top whitespace-nowrap">
                          {formatDate(entry.tanggalISO)}
                        </td>
                      )}
                      {isFirst && (
                        <td rowSpan={sorted.length} className="px-4 py-3 text-sm font-semibold text-blue-800 border-r border-gray-100 align-top whitespace-nowrap">
                          {entry.kodeReferensi}
                        </td>
                      )}
                      <td className={`px-4 py-2.5 text-sm border-r border-gray-100 ${isKredit ? 'pl-10 text-gray-500 italic' : 'text-gray-700 font-medium'}`}>
                        <span className="text-xs text-gray-400 font-mono font-semibold mr-1.5">{line.kodeAkun}</span>
                        {line.namaAkun}
                      </td>
                      {isFirst && (
                        <td rowSpan={sorted.length} className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100 align-top max-w-xs">
                          {entry.keterangan}
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-right text-sm border-r border-gray-100 tabular-nums">
                        {line.debit > 0 ? <span className="text-gray-700">{idr(line.debit)}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm tabular-nums">
                        {line.kredit > 0 ? <span className="text-gray-700">{idr(line.kredit)}</span> : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 border-t-2 border-gray-300">
                <td colSpan={5} className="px-4 py-3 text-sm font-bold text-gray-700 border-r border-gray-200">TOTAL</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 border-r border-gray-200 tabular-nums">{idr(totalD)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 tabular-nums">{idr(totalK)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500">
            {filtered.length === 0 ? 'Tidak ada data' : `${(page-1)*PAGE_SIZE+1}–${Math.min(page*PAGE_SIZE, filtered.length)} dari ${filtered.length} entri`}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-white disabled:opacity-40">Sebelumnya</button>
            {Array.from({length: totalPages}, (_, i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-3 py-1 text-xs border rounded ${p===page ? 'bg-red-800 text-white border-red-800' : 'border-gray-200 hover:bg-white'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-white disabled:opacity-40">Berikutnya</button>
          </div>
        </div>
      </div>

      <style>{`
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
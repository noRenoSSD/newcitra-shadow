import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import {
  ChevronLeft, Eye, RefreshCw, Search, CheckCircle2,
  Clock, X, AlertTriangle, TrendingDown, Minus,
  ClipboardCheck,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusApproval = 'Menunggu' | 'Disetujui';

interface MaterialItem {
  nama_bahan: string;
  satuan: string;
  qty_standar: number;
  biaya_standar: number;
  qty_aktual: number;
  biaya_aktual: number;
  harga_standar: number;
  harga_aktual: number;
}

interface ApprovalRecord {
  id: string;
  no_produksi: string;
  nama_produk: string;
  tanggal_produksi: string;
  tanggal_input: string;
  status: StatusApproval;
  catatan_approval: string;
  materials: MaterialItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const formatDate = (iso: string) => {
  if (!iso) return '-';
  const months = ['Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember'];
  const [y, m, d] = iso.split('-');
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
};

type Variance = 'normal' | 'over' | 'under';
const getVariance = (standar: number, aktual: number): Variance => {
  if (aktual === standar) return 'normal';
  if (aktual > standar) return 'over';
  return 'under';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StatusApproval }) {
  if (status === 'Disetujui')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">
        <CheckCircle2 className="w-3 h-3" /> Disetujui
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-700 border-yellow-200">
      <Clock className="w-3 h-3" /> Menunggu
    </span>
  );
}

function VarianceBadge({ variance }: { variance: Variance }) {
  if (variance === 'normal')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
        <Minus className="w-3 h-3" /> Normal
      </span>
    );
  if (variance === 'over')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
        <AlertTriangle className="w-3 h-3" /> Terlalu Tinggi
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
      <TrendingDown className="w-3 h-3" /> Di Bawah Standar
    </span>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-800 to-red-900 px-6 py-5 flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white font-bold text-base flex-1">Konfirmasi Persetujuan</h3>
          <button onClick={onCancel} className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 text-sm leading-relaxed">
            Apakah Anda yakin ingin menyetujui pemakaian bahan ini? Tindakan ini tidak dapat dibatalkan setelah disimpan.
          </p>
        </div>
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
            Batal
          </button>
          <button onClick={onConfirm}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-800 text-white hover:bg-red-900 text-sm font-semibold transition-colors shadow-sm">
            <CheckCircle2 className="w-4 h-4" /> Ya, Setujui
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Page ──────────────────────────────────────────────────────────────

function DetailPemakaianBahan({
  record,
  onBack,
  onApprove,
}: {
  record: ApprovalRecord;
  onBack: () => void;
  onApprove: (id: string, catatan: string) => void;
}) {
  const [catatan, setCatatan] = useState(record.catatan_approval || '');
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = () => {
    setShowModal(false);
    onApprove(record.id, catatan);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const isDisetujui = record.status === 'Disetujui';

  return (
    <div className="p-6 space-y-6">
      {/* Success alert */}
      {showSuccess && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-300 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="text-sm font-medium text-green-800">Persetujuan pemakaian bahan berhasil disimpan.</span>
        </div>
      )}

      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Detail Persetujuan Pemakaian Bahan</h2>
          <p className="text-xs text-gray-400 font-mono">{record.no_produksi}</p>
        </div>
      </div>

      {/* Combined card: Info + Detail + Catatan */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Info section */}
        <div className="p-5 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Informasi Produksi</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Kode Produksi</p>
              <p className="text-sm font-semibold text-gray-700">{record.no_produksi}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Produk</p>
              <p className="text-sm font-semibold text-gray-700">{record.nama_produk}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Tanggal Produksi</p>
              <p className="text-sm font-semibold text-gray-700">{formatDate(record.tanggal_produksi)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Tanggal Input</p>
              <p className="text-sm font-semibold text-gray-700">{formatDate(record.tanggal_input)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <StatusBadge status={record.status} />
            </div>
          </div>

          {isDisetujui && record.catatan_approval && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-medium text-green-700 mb-1">Catatan Persetujuan</p>
              <p className="text-sm text-green-800">{record.catatan_approval}</p>
            </div>
          )}
        </div>

        {/* Detail section */}
        <div>
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Detail Kewajaran Pemakaian Bahan</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {/* Baris group header */}
                <tr className="bg-gray-100 text-center">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide" rowSpan={2}>No</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide" rowSpan={2}>Nama Bahan</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide" rowSpan={2}>Satuan</th>
                  <th colSpan={2} className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wide border-l border-gray-200 bg-gray-100">Standar</th>
                  <th colSpan={2} className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wide border-l border-gray-200 bg-gray-100">Aktual</th>
                  <th colSpan={2} className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wide border-l border-gray-200 bg-gray-100">Selisih</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-700 uppercase tracking-wide border-l border-gray-200" rowSpan={2}>Status</th>
                </tr>
                {/* Baris sub-header */}
                <tr className="bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  <th className="px-4 py-2 text-right border-l border-gray-200">Jumlah</th>
                  <th className="px-4 py-2 text-right border-l border-gray-200">Biaya</th>
                  <th className="px-4 py-2 text-right border-l border-gray-200">Jumlah</th>
                  <th className="px-4 py-2 text-right border-l border-gray-200">Biaya</th>
                  <th className="px-4 py-2 text-right border-l border-gray-200">Jumlah</th>
                  <th className="px-4 py-2 text-right border-l border-gray-200">Biaya</th>
                </tr>
              </thead>
              <tbody>
                {record.materials.map((m, i) => {
                  // Selisih cukup pengurangan karena biaya_aktual dari backend
                  const selisihQty   = m.qty_aktual - m.qty_standar;
                  const selisihBiaya = m.biaya_aktual - m.biaya_standar;
                  const variance     = getVariance(m.qty_standar, m.qty_aktual);

                  return (
                    <tr key={i} className={`border-t border-gray-100 ${i % 2 === 1 ? 'bg-gray-50' : ''} hover:bg-gray-50`}>
                      <td className="px-4 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{m.nama_bahan}</td>
                      <td className="px-4 py-2.5 text-center text-gray-700">{m.satuan}</td>
                      <td className="px-4 py-2.5 text-right text-gray-700 border-l border-gray-200">{m.qty_standar.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2.5 text-right text-gray-700 border-l border-gray-200">{rp(m.biaya_standar)}</td>
                      <td className="px-4 py-2.5 text-right text-gray-700 border-l border-gray-200">{m.qty_aktual.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2.5 text-right text-gray-700 border-l border-gray-200">{rp(m.biaya_aktual)}</td>
                      <td className="px-4 py-2.5 text-right text-gray-700 border-l border-gray-200">
                        {selisihQty > 0 ? `+${selisihQty.toLocaleString('id-ID')}` : selisihQty.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-700 border-l border-gray-200">
                        {selisihBiaya > 0 ? '+' : ''}{rp(selisihBiaya)}
                      </td>
                      <td className="px-4 py-2.5 border-l border-gray-200">
                        <VarianceBadge variance={variance} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Catatan Section (hanya tampil jika Menunggu) */}
        {!isDisetujui && (
          <div className="p-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tindakan Persetujuan</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Catatan Persetujuan</label>
              <textarea
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                rows={3}
                placeholder="Tulis catatan persetujuan jika diperlukan..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none outline-none focus:border-red-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack}
          className="px-4 py-2.5 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Kembali
        </button>
        {!isDisetujui ? (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
            <CheckCircle2 className="w-4 h-4" />Approve
          </button>
        ) : (
          <button disabled
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-100 text-green-600 text-sm font-medium rounded-lg cursor-not-allowed">
            <CheckCircle2 className="w-4 h-4" />Sudah Disetujui
          </button>
        )}
      </div>

      {showModal && <ConfirmModal onConfirm={handleConfirm} onCancel={() => setShowModal(false)} />}
    </div>
  );
}

// ─── Sub-tabel per status ─────────────────────────────────────────────────────

function TabelPemakaian({
  records,
  page,
  onDetail,
  onPageChange,
  totalPages,
  pageStart,
}: {
  records: ApprovalRecord[];
  page: number;
  onDetail: (r: ApprovalRecord) => void;
  onPageChange: (p: number) => void;
  totalPages: number;
  pageStart: number;
}) {
  if (records.length === 0) return null;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0">
            <tr className="bg-gray-100 text-gray-700 text-left">
              {['No', 'Kode Produksi', 'Tanggal Input', 'Status', 'Aksi'].map(h => (
                <th key={h} className={`px-4 py-3 font-semibold whitespace-nowrap ${h === 'Aksi' ? 'text-center' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.id} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                <td className="px-4 py-3 text-gray-400 text-xs">{pageStart + i}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">{r.no_produksi}</td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDate(r.tanggal_input)}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => onDetail(r)} title="Detail"
                    className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500">
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-1">
            <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
              className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">Sebelumnya</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => onPageChange(p)}
                className={`px-3 py-1 text-xs border rounded ${p === page ? 'bg-red-800 text-white border-red-800' : 'border-gray-200 hover:bg-white'}`}>{p}</button>
            ))}
            <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">Berikutnya</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── List Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function ListPemakaianBahan({
  data,
  onDetail,
}: {
  data: ApprovalRecord[];
  onDetail: (r: ApprovalRecord) => void;
}) {
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState<'' | 'Menunggu' | 'Disetujui'>('');
  const [page, setPage] = useState(1);

  const reset = () => { setSearch(''); setFilterStatus(''); setPage(1); };

  const menungguAll  = data.filter(r => r.status === 'Menunggu');
  const disetujuiAll = data.filter(r => r.status === 'Disetujui');

  // Menunggu selalu di atas, Disetujui di bawah
  const sorted = [...data].sort((a, b) => {
    const order: Record<StatusApproval, number> = { 'Menunggu': 0, 'Disetujui': 1 };
    return order[a.status] - order[b.status];
  });

  const filtered = sorted.filter(r =>
    (!filterStatus || r.status === filterStatus) &&
    (!search || r.no_produksi.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-red-800">Persetujuan Pemakaian Bahan</h2>
        <p className="text-sm text-red-800 mt-1">Kelola dan review persetujuan pemakaian bahan produksi</p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Menunggu */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center mb-3">
            <div className="text-yellow-600"><Clock className="w-3 h-3" /></div>
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Menunggu Persetujuan</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{menungguAll.length}</p>
        </div>
        {/* Disetujui */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <div className="text-green-600"><CheckCircle2 className="w-3 h-3" /></div>
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Disetujui</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{disetujuiAll.length}</p>
        </div>
      </div>

      {/* ── Table + Filter ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Daftar Pemakaian Bahan</h3>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari Kode Produksi..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value as '' | 'Menunggu' | 'Disetujui'); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white text-gray-700 min-w-44"
            >
              <option value="">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Disetujui">Disetujui</option>
            </select>

            {/* Reset */}
            <button onClick={reset} title="Reset filter"
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-red-600 transition-colors shrink-0">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabel Unified */}
        <TabelPemakaian
          records={paged}
          page={page}
          onDetail={onDetail}
          onPageChange={setPage}
          totalPages={totalPages}
          pageStart={(page - 1) * PAGE_SIZE + 1}
        />

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">Tidak ada data ditemukan</div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ApprovalPemakaianBahan() {
  const { approvalData = [] } = usePage().props as any;
  const [data, setData] = useState<ApprovalRecord[]>(approvalData);
  const [selected, setSelected] = useState<ApprovalRecord | null>(null);

  // Sync data dari Inertia Props apabila ada reload data dari server
  useEffect(() => {
    setData(approvalData);
  }, [approvalData]);

const handleApprove = (id: string, catatan: string) => {
    router.put(`/approval-pemakaian-bahan/${id}`, { catatan_approval: catatan }, {
      preserveScroll: true,
      onSuccess: () => {
        setData(prev => prev.map(r =>
          r.id === id ? { ...r, status: 'Disetujui', catatan_approval: catatan } : r
        ));
        setSelected(null);
      }
    });
  };

  if (selected) {
    return (
      <DetailPemakaianBahan
        record={selected}
        onBack={() => setSelected(null)}
        onApprove={handleApprove}
      />
    );
  }

  return <ListPemakaianBahan data={data} onDetail={r => setSelected(r)} />;
}
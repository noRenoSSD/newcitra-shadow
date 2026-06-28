import { useState } from 'react';
import { Eye, Search, RefreshCw, ChevronLeft, CheckCircle, Clock, X, RotateCcw } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';

// ─── Types ───────────────────────────────────────────────────────────────────
type StatusJadwalBackend = 'Pending Approval' | 'Approved' | 'Revision Required';

interface DetailProduksi {
  kode_produksi: string;
  tanggal_produksi: string;
  produk?: { nama_produk: string };
  bom?: { nama_resep: string; satuan_batch?: string };
  qty_rencana: number;
  catatan: string;
}

interface JadwalPersetujuan {
  id_jadwal: number;
  kode_jadwal: string;
  periode: string;
  tanggal_dibuat: string;
  status_jadwal: StatusJadwalBackend;
  detail_produksi: DetailProduksi[];
  komentar_owner?: string;
}

// ─── Status Config ────────────────────────────────────────────────────────────
// Mapping konversi dari String Database ke Label Tampilan Indonesia
const statusConfig: Record<
  StatusJadwalBackend,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  'Pending Approval': {
    label: 'Menunggu Persetujuan',
    cls: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: <Clock className="w-3 h-3" />,
  },
  Approved: {
    label: 'Disetujui',
    cls: 'bg-green-100 text-green-700 border-green-200',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  'Revision Required': {
    label: 'Revisi',
    cls: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: <RotateCcw className="w-3 h-3" />,
  },
};

const STATUS_SORT_ORDER: Record<StatusJadwalBackend, number> = {
  'Pending Approval': 0,
  'Revision Required': 1,
  Approved: 2,
};

function StatusBadge({ status }: { status: StatusJadwalBackend }) {
  const cfg = statusConfig[status] ?? statusConfig['Pending Approval'];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function ModalSetujui({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">Konfirmasi Persetujuan</h3>
          <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-5">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            Apakah Anda yakin ingin menyetujui jadwal produksi ini?
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Ya, Setujui
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalRevisi({
  onConfirm,
  onCancel,
}: {
  onConfirm: (catatan: string) => void;
  onCancel: () => void;
}) {
  const [catatan, setCatatan] = useState('');
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">Minta Revisi</h3>
          <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Komentar Owner <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            placeholder="Tuliskan komentar revisi..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(catatan)}
            disabled={!catatan.trim()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kirim Revisi
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Page ──────────────────────────────────────────────────────────────
function DetailPage({
  jadwal,
  onBack,
  onAction,
}: {
  jadwal: JadwalPersetujuan;
  onBack: () => void;
  onAction: (status: string, komentar?: string) => void;
}) {
  const [showSetujui, setShowSetujui] = useState(false);
  const [showRevisi, setShowRevisi] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isMenunggu = jadwal.status_jadwal === 'Pending Approval';

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleApprove = () => {
    onAction('Approved', 'Disetujui sesuai kapasitas produksi.');
    setShowSetujui(false);
    triggerSuccess('Persetujuan jadwal produksi berhasil disimpan.');
  };

  const handleRevisi = (txt: string) => {
    onAction('Revision Required', txt);
    setShowRevisi(false);
    triggerSuccess('Permintaan revisi berhasil dikirimkan.');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Success Alert */}
      {successMsg && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-300 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <span className="text-sm font-medium text-green-800">{successMsg}</span>
        </div>
      )}

      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Detail Persetujuan Jadwal Produksi
          </h2>
          <p className="text-xs text-gray-400 font-mono">{jadwal.kode_jadwal}</p>
        </div>
      </div>

      {/* Combined Card: Info + Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Info Section */}
        <div className="p-5 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Informasi Jadwal Produksi
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Kode Jadwal</p>
              <p className="text-sm font-semibold text-gray-700">{jadwal.kode_jadwal}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Periode</p>
              <p className="text-sm font-semibold text-gray-700">{jadwal.periode}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Tanggal Dibuat</p>
              <p className="text-sm font-semibold text-gray-700">
                {jadwal.tanggal_dibuat.split('-').reverse().join('/')}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Status Jadwal</p>
              <StatusBadge status={jadwal.status_jadwal} />
            </div>
          </div>

          {/* Catatan Owner: tampilkan berbeda per status */}
          {jadwal.komentar_owner && jadwal.status_jadwal === 'Approved' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-medium text-green-700 mb-1">Catatan Persetujuan</p>
              <p className="text-sm text-green-800">{jadwal.komentar_owner}</p>
            </div>
          )}
          {jadwal.komentar_owner && jadwal.status_jadwal === 'Revision Required' && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs font-medium text-orange-700 mb-1">Catatan Revisi</p>
              <p className="text-sm text-orange-800">{jadwal.komentar_owner}</p>
            </div>
          )}
        </div>

        {/* Detail Table Section */}
        <div>
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Detail Jadwal Produksi
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  <th className="px-4 py-2.5 text-xs font-semibold">Kode Produksi</th>
                  <th className="px-4 py-2.5 text-xs font-semibold">Tanggal Produksi</th>
                  <th className="px-4 py-2.5 text-xs font-semibold">Produk</th>
                  <th className="px-4 py-2.5 text-xs font-semibold">Resep/BOM</th>
                  <th className="px-4 py-2.5 text-xs font-semibold">Qty Rencana</th>
                  <th className="px-4 py-2.5 text-xs font-semibold">Satuan</th>
                  <th className="px-4 py-2.5 text-xs font-semibold">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {jadwal.detail_produksi?.map((d, idx) => (
                  <tr
                    key={`${jadwal.kode_jadwal}-detail-${idx}`}
                    className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 1 ? 'bg-gray-50' : ''
                    }`}
                  >
                    <td className="px-4 py-2.5 font-semibold text-gray-700">
                      {d.kode_produksi}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                      {d.tanggal_produksi.split('-').reverse().join('/')}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">{d.produk?.nama_produk}</td>
                    <td className="px-4 py-2.5 text-gray-700">{d.bom?.nama_resep}</td>
                    <td className="px-4 py-2.5 text-gray-700">
                      {d.qty_rencana.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">
                      {d.bom?.satuan_batch ?? 'Pcs'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{d.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2.5 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Kembali
        </button>
        <div className="flex gap-3">
          {isMenunggu ? (
            <>
              <button
                onClick={() => setShowRevisi(true)}
                className="px-5 py-2.5 border border-orange-500 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-50 transition-colors inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Revisi
              </button>
              <button
                onClick={() => setShowSetujui(true)}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            </>
          ) : jadwal.status_jadwal === 'Approved' ? (
            <button
              disabled
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-100 text-green-600 text-sm font-medium rounded-lg cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              Sudah Disetujui
            </button>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-100 text-orange-500 text-sm font-medium rounded-lg cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Menunggu Revisi
            </button>
          )}
        </div>
      </div>

      {showSetujui && (
        <ModalSetujui onConfirm={handleApprove} onCancel={() => setShowSetujui(false)} />
      )}
      {showRevisi && (
        <ModalRevisi onConfirm={handleRevisi} onCancel={() => setShowRevisi(false)} />
      )}
    </div>
  );
}

// ─── List Page ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

function ListPage({
  data,
  onDetail,
}: {
  data: JadwalPersetujuan[];
  onDetail: (j: JadwalPersetujuan) => void;
}) {
  const [search, setSearch] = useState('');
  const [filterPeriode, setFilterPeriode] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  // Pending Approval selalu di atas → Revision Required → Approved
  const sorted = [...data].sort(
    (a, b) => STATUS_SORT_ORDER[a.status_jadwal] - STATUS_SORT_ORDER[b.status_jadwal]
  );

  const filtered = sorted.filter(
    (j) =>
      (!filterPeriode || j.periode === filterPeriode) &&
      (!filterStatus || j.status_jadwal === filterStatus) &&
      j.kode_jadwal.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const reset = () => {
    setSearch('');
    setFilterPeriode('');
    setFilterStatus('');
    setPage(1);
  };

  // Summary card config
  const summaryConfig: {
    key: StatusJadwalBackend;
    icon: React.ReactNode;
    bgIcon: string;
    iconColor: string;
  }[] = [
    {
      key: 'Pending Approval',
      icon: <Clock className="w-5 h-5" />,
      bgIcon: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      key: 'Revision Required',
      icon: <RotateCcw className="w-5 h-5" />,
      bgIcon: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      key: 'Approved',
      icon: <CheckCircle className="w-5 h-5" />,
      bgIcon: 'bg-green-50',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-red-800">Persetujuan Jadwal Produksi</h2>
        <p className="text-sm text-red-800 mt-1">
          Kelola dan lakukan persetujuan jadwal produksi
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryConfig.map(({ key, icon, bgIcon, iconColor }) => {
          const count = data.filter((j) => j.status_jadwal === key).length;
          const { label } = statusConfig[key];
          return (
            <div
              key={key}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div
                className={`w-10 h-10 ${bgIcon} rounded-xl flex items-center justify-center mb-3`}
              >
                <span className={iconColor}>{icon}</span>
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {label}
              </p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Daftar Jadwal Produksi</h3>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Cari nomor jadwal produksi..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Filter Periode */}
            <select
              value={filterPeriode}
              onChange={(e) => {
                setFilterPeriode(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-700 min-w-44"
            >
              <option value="">Semua Periode</option>
              {Array.from(new Set(data.map((j) => j.periode))).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-700 min-w-52"
            >
              <option value="">Semua Status</option>
              <option value="Pending Approval">Menunggu Persetujuan</option>
              <option value="Revision Required">Revisi</option>
              <option value="Approved">Disetujui</option>
            </select>

            {/* Reset Filter */}
            <button
              onClick={reset}
              title="Reset filter"
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-red-600 transition-colors shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0">
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="px-4 py-3 font-semibold">Kode Jadwal</th>
                <th className="px-4 py-3 font-semibold">Periode</th>
                <th className="px-4 py-3 font-semibold">Tanggal Dibuat</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                paged.map((j, idx) => (
                  <tr
                    key={j.id_jadwal}
                    className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 1 ? 'bg-gray-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-700">{j.kode_jadwal}</td>
                    <td className="px-4 py-3 text-gray-700">{j.periode}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {j.tanggal_dibuat.split('-').reverse().join('/')}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={j.status_jadwal} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onDetail(j)}
                        title="Detail"
                        className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500">
            {filtered.length === 0
              ? 'Tidak ada data'
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                  page * PAGE_SIZE,
                  filtered.length
                )} dari ${filtered.length} data`}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={`page-${p}`}
                onClick={() => setPage(p)}
                className={`px-3 py-1 text-xs border rounded ${
                  p === page
                    ? 'bg-red-600 text-white border-red-600'
                    : 'border-gray-200 hover:bg-white'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Root Component ──────────────────────────────────────────────────────
export default function PersetujuanJadwalProduksi() {
  const { jadwals = [] } = usePage().props as any;
  const [selected, setSelected] = useState<JadwalPersetujuan | null>(null);

  const handleAction = (statusBackend: string, komentar?: string) => {
    if (!selected) return;

    router.put(
      `/persetujuan-jadwal/${selected.id_jadwal}`,
      { status_jadwal: statusBackend, komentar_owner: komentar },
      {
        onSuccess: () => {
          // Tutup detail dan kembali ke list (list otomatis refresh via Inertia)
          setSelected(null);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {selected ? (
        <DetailPage jadwal={selected} onBack={() => setSelected(null)} onAction={handleAction} />
      ) : (
        <ListPage data={jadwals} onDetail={setSelected} />
      )}
    </div>
  );
}
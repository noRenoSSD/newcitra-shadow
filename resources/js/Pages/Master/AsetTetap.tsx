import { useState, useMemo } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, X, ChevronLeft, Monitor, Truck, Wrench } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

// ─── Constants & Helpers ──────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

// ─── Types & Interfaces ───────────────────────────────────────────────────────

type TipeAset = 'mesin' | 'kendaraan' | 'peralatan';
type ViewMode = 'list' | 'form' | 'detail';

interface AsetTetap {
  id_aset?: number;
  kode_aset: string;
  nama_aset: string;
  tipe_aset: string; // Bisa menerima dari DB meskipun huruf kecil/besar
  tanggal_beli: string;
  harga_perolehan: number;
  umur_ekonomis: number;
  nilai_sisa: number;
  keterangan?: string;
}

const TIPE_OPTIONS = ['Mesin', 'Kendaraan', 'Peralatan'];

const emptyForm = (): AsetTetap => ({
  kode_aset: '', nama_aset: '', tipe_aset: 'Mesin',
  tanggal_beli: '', harga_perolehan: 0, umur_ekonomis: 1,
  nilai_sisa: 0, keterangan: '',
});

// ─── Sub-Components (UI Styles dari Figma) ────────────────────────────────────

function TipeBadge({ tipe }: { tipe: string }) {
  const t = tipe?.toLowerCase() || 'mesin';
  let bg = 'bg-gray-100 text-gray-700';
  let icon = <Wrench className="w-3 h-3" />;
  let text = 'Peralatan';

  if (t === 'mesin') {
    bg = 'bg-orange-100 text-orange-700';
    icon = <Monitor className="w-3 h-3" />;
    text = 'Mesin';
  } else if (t === 'kendaraan') {
    bg = 'bg-blue-100 text-blue-700';
    icon = <Truck className="w-3 h-3" />;
    text = 'Kendaraan';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${bg}`}>
      {icon}{text}
    </span>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function AsetTetapPage() {
  const { dataAsetDariDB } = usePage().props as any;

  const [view,         setView]         = useState<ViewMode>('list');
  const [editMode,     setEditMode]     = useState(false);
  const [selectedAset, setSelectedAset] = useState<AsetTetap | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AsetTetap | null>(null);
  const [formData,     setFormData]     = useState<AsetTetap>(emptyForm());

  // State Filter & Pagination
  const [search,      setSearch]      = useState('');
  const [filterTipe,  setFilterTipe]  = useState('');
  const [page,        setPage]        = useState(1);

  // Auto-generate Kode
  const generateNextKode = () => {
    if (!dataAsetDariDB || dataAsetDariDB.length === 0) return 'AST-001';
    let maxNum = 0;
    dataAsetDariDB.forEach((item: AsetTetap) => {
      const match = item.kode_aset.match(/\d+$/);
      if (match) { const num = parseInt(match[0], 10); if (num > maxNum) maxNum = num; }
    });
    return `AST-${(maxNum + 1).toString().padStart(3, '0')}`;
  };

  // Actions
  const handleAdd = () => {
    setFormData({ ...emptyForm(), kode_aset: generateNextKode() });
    setEditMode(false);
    setView('form');
  };

  const handleEdit = (a: AsetTetap) => {
    // Normalisasi huruf kapital untuk select option
    setFormData({ ...a, tipe_aset: capitalize(a.tipe_aset) });
    setSelectedAset(a);
    setEditMode(true);
    setView('form');
  };

  const handleDetail = (a: AsetTetap) => {
    setSelectedAset(a);
    setView('detail');
  };

  const handleCancel = () => {
    setView('list');
    setSelectedAset(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Kembalikan ke lowercase sebelum dikirim ke DB agar seragam
    const payload = { ...formData, tipe_aset: formData.tipe_aset.toLowerCase() };
    if (editMode) {
      router.put(`/aset/${formData.id_aset}`, payload as any, { onSuccess: handleCancel });
    } else {
      router.post('/aset', payload as any, { onSuccess: handleCancel });
    }
  };

  const executeDelete = () => {
    if (deleteTarget?.id_aset) {
      router.delete(`/aset/${deleteTarget.id_aset}`, { onSuccess: () => setDeleteTarget(null) });
    }
  };

  // ─── Filter Logic (DIPERBAIKI) ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    return (dataAsetDariDB ?? [])
      .filter((a: AsetTetap) => {
        const matchSearch =
          a.kode_aset?.toLowerCase().includes(search.toLowerCase()) ||
          a.nama_aset?.toLowerCase().includes(search.toLowerCase());
        
        // FIX: Bandingkan dengan lowercase agar tidak sensitif huruf besar/kecil
        const matchTipe = filterTipe === '' || a.tipe_aset?.toLowerCase() === filterTipe.toLowerCase();
        
        return matchSearch && matchTipe;
      })
      .sort((a: AsetTetap, b: AsetTetap) => a.kode_aset.localeCompare(b.kode_aset));
  }, [dataAsetDariDB, search, filterTipe]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ─── FORM VIEW ──────────────────────────────────────────────────────────────
  if (view === 'form') {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {editMode ? 'Edit Data Aset Tetap' : 'Tambah Data Aset Tetap'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Isi informasi aset tetap perusahaan</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Kode Aset <span className="text-red-500">*</span></label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600">
                  {formData.kode_aset}
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Aset <span className="text-red-500">*</span></label>
                <input
                  required
                  value={formData.nama_aset}
                  onChange={e => setFormData({ ...formData, nama_aset: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                  placeholder="Misal: Mesin Press"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipe Aset <span className="text-red-500">*</span></label>
                <select
                  value={formData.tipe_aset}
                  onChange={e => setFormData({ ...formData, tipe_aset: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white"
                >
                  {TIPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tanggal Beli <span className="text-red-500">*</span></label>
                <input
                  required
                  type="date"
                  value={formData.tanggal_beli}
                  onChange={e => setFormData({ ...formData, tanggal_beli: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                />
              </div>
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Nilai & Penyusutan</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Harga Perolehan (Rp) <span className="text-red-500">*</span></label>
                <input
                  required type="number" min={0}
                  value={formData.harga_perolehan}
                  onChange={e => setFormData({ ...formData, harga_perolehan: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 text-right"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Umur Ekonomis (Tahun) <span className="text-red-500">*</span></label>
                <input
                  required type="number" min={1}
                  value={formData.umur_ekonomis}
                  onChange={e => setFormData({ ...formData, umur_ekonomis: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 text-right"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nilai Sisa (Rp)</label>
                <input
                  type="number" min={0}
                  value={formData.nilai_sisa}
                  onChange={e => setFormData({ ...formData, nilai_sisa: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 text-right"
                />
              </div>
            </div>

            {formData.harga_perolehan > 0 && formData.umur_ekonomis > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                <span className="text-xs text-amber-700">Estimasi Penyusutan per Tahun (Garis Lurus):</span>
                <span className="text-sm font-bold text-amber-800">
                  {idr((formData.harga_perolehan - formData.nilai_sisa) / formData.umur_ekonomis)}
                </span>
              </div>
            )}

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Keterangan</p>
            <div>
              <textarea
                rows={3}
                value={formData.keterangan ?? ''}
                onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Tambahkan catatan atau spesifikasi teknis aset..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Batal
            </button>
            <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900 transition-colors">
              {editMode ? 'Update Data' : 'Simpan Aset'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─── DETAIL VIEW (FIGMA STYLE) ──────────────────────────────────────────────
  if (view === 'detail' && selectedAset) {
    const py = selectedAset.umur_ekonomis > 0 ? (selectedAset.harga_perolehan - selectedAset.nilai_sisa) / selectedAset.umur_ekonomis : 0;
    
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={handleCancel} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detail Aset Tetap</h1>
              <p className="text-sm text-gray-500 font-mono mt-0.5">{selectedAset.kode_aset}</p>
            </div>
          </div>
          <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <X className="w-4 h-4" /> Tutup
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Informasi Aset</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <ReadField label="Kode Aset" value={selectedAset.kode_aset} />
            <ReadField label="Nama Aset" value={selectedAset.nama_aset} />
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 flex flex-col justify-center">
              <p className="text-xs text-gray-400 mb-1.5">Tipe Aset</p>
              <div><TipeBadge tipe={selectedAset.tipe_aset} /></div>
            </div>
            <ReadField label="Tanggal Beli" value={formatDate(selectedAset.tanggal_beli)} />
          </div>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Nilai & Penyusutan</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <ReadField label="Harga Perolehan" value={idr(selectedAset.harga_perolehan)} />
            <ReadField label="Umur Ekonomis" value={`${selectedAset.umur_ekonomis} Tahun`} />
            <ReadField label="Nilai Sisa" value={idr(selectedAset.nilai_sisa)} />
            <div className="bg-amber-50 rounded-lg px-4 py-3 border border-amber-200">
              <p className="text-xs font-medium text-amber-600 mb-1">Penyusutan / Tahun</p>
              <p className="text-sm font-bold text-amber-800">{idr(py)}</p>
            </div>
          </div>

          {selectedAset.keterangan && (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Keterangan</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                {selectedAset.keterangan}
              </p>
            </>
          )}

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button onClick={handleCancel} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Tutup Detail
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── LIST VIEW (FIGMA STYLE) ────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-red-800">Data Aset Tetap</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data aset tetap perusahaan beserta informasi penyusutan</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Aset
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search & Filters */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kode atau nama aset..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
            />
          </div>
          <select
            className="w-full sm:w-64 px-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-700 cursor-pointer"
            value={filterTipe}
            onChange={e => { setFilterTipe(e.target.value); setPage(1); }}
          >
            <option value="">Semua Tipe Aset</option>
            {TIPE_OPTIONS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">Kode Aset</th>
                <th className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">Nama Aset</th>
                <th className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">Tipe</th>
                <th className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">Tanggal Beli</th>
                <th className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap text-right">Harga Perolehan</th>
                <th className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap text-center">Umur Ekonomis</th>
                <th className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap text-right">Nilai Sisa</th>
                <th className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400 bg-gray-50/50">
                    Tidak ada data aset yang ditemukan
                  </td>
                </tr>
              ) : paged.map((a: AsetTetap, idx: number) => (
                <tr key={a.id_aset} className={`hover:bg-gray-50/80 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                  <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">{a.kode_aset}</td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{a.nama_aset}</td>
                  <td className="px-6 py-4"><TipeBadge tipe={a.tipe_aset} /></td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDate(a.tanggal_beli)}</td>
                  <td className="px-6 py-4 text-gray-800 font-semibold text-right">{idr(a.harga_perolehan)}</td>
                  <td className="px-6 py-4 text-gray-600 text-center">{a.umur_ekonomis} Thn</td>
                  <td className="px-6 py-4 text-gray-600 text-right">{idr(a.nilai_sisa)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleDetail(a)} title="Detail Aset" className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(a)} title="Edit Aset" className="p-1.5 rounded-md hover:bg-yellow-100 text-yellow-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(a)} title="Hapus Aset" className="p-1.5 rounded-md hover:bg-red-100 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 gap-4">
            <span className="text-xs font-medium text-gray-500">
              Menampilkan {(page - 1) * PAGE_SIZE + 1} sampai {Math.min(page * PAGE_SIZE, filtered.length)} dari total {filtered.length} data
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-transparent text-gray-600">Sebelumnya</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${p === page ? 'bg-red-700 text-white border-red-700 shadow-sm' : 'border-gray-200 hover:bg-white text-gray-600 bg-transparent'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-transparent text-gray-600">Berikutnya</button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL HAPUS ──────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Hapus Data Aset</h3>
              <button onClick={() => setDeleteTarget(null)} className="p-1 rounded-md hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">Apakah Anda yakin ingin menghapus data aset tetap ini secara permanen?</p>
            
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-1">Aset yang dihapus:</p>
              <p className="text-sm font-bold text-red-800">{deleteTarget.kode_aset}</p>
              <p className="text-sm text-red-700 mt-0.5">{deleteTarget.nama_aset}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={executeDelete} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
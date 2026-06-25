import { useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, X, ChevronLeft, User } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';

const JABATAN_OPTIONS = ['CEO', 'Manajer', 'Staff'];
const DEPARTEMEN_OPTIONS = ['Produksi', 'Administrasi dan Finance', 'Distribusi'];

const DEPT_COLORS: Record<string, string> = {
  'Produksi': 'bg-blue-100 text-blue-700',
  'Administrasi dan Finance': 'bg-green-100 text-green-700',
  'Distribusi': 'bg-orange-100 text-orange-700',
};

function DeptBadge({ dept }: { dept: string }) {
  const cls = DEPT_COLORS[dept] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {dept}
    </span>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800 capitalize">{value}</p>
    </div>
  );
}

const PAGE_SIZE = 10;
type ViewMode = 'list' | 'form' | 'detail';

// ── DETAIL ────────────────────────────────────────────────────────────────────
function DetailKaryawan({ k, onBack }: { k: any; onBack: () => void }) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Karyawan</h1>
          <p className="text-sm text-gray-500">{k.kode_karyawan}</p>
        </div>
        <button onClick={onBack} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <User className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{k.nama_karyawan}</p>
            <p className="text-sm text-gray-500 capitalize">{k.jabatan}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ReadField label="Kode Karyawan" value={k.kode_karyawan} />
          <ReadField label="Jabatan" value={k.jabatan} />
          <ReadField label="Departemen" value={k.departemen} />
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          Kembali
        </button>
      </div>
    </div>
  );
}

// ── DELETE MODAL ──────────────────────────────────────────────────────────────
function DeleteModal({ item, onConfirm, onCancel }: { item: any; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">Hapus Data Karyawan</h3>
          <button onClick={onCancel}><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <p className="text-sm text-gray-600 mb-3">Apakah Anda yakin ingin menghapus data karyawan berikut?</p>
        <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <span className="font-semibold text-red-700">{item.kode_karyawan}</span> — {item.nama_karyawan}
        </div>
        <p className="text-xs text-gray-400 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900">Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ── ROOT PAGE ─────────────────────────────────────────────────────────────────
export default function KaryawanPage({ karyawans, nextCode }: any) {
  const [view, setView] = useState<ViewMode>('list');
  const [isEdit, setIsEdit] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, setData, post, put, reset } = useForm({
    kode_karyawan: '',
    nama_karyawan: '',
    jabatan: 'Staff',
    departemen: 'Produksi',
  });

  const openFormTambah = () => {
    setIsEdit(false);
    reset();
    setData('kode_karyawan', nextCode);
    setView('form');
  };

  const openFormEdit = (karyawan: any) => {
    setIsEdit(true);
    setSelectedKaryawan(karyawan);
    setData({
      kode_karyawan: karyawan.kode_karyawan,
      nama_karyawan: karyawan.nama_karyawan,
      jabatan: karyawan.jabatan,
      departemen: karyawan.departemen,
    });
    setView('form');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(`/karyawan/${selectedKaryawan.id_karyawan}`, { onSuccess: () => setView('list') });
    } else {
      post('/karyawan', { onSuccess: () => setView('list') });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      router.delete(`/karyawan/${deleteTarget.id_karyawan}`, { onSuccess: () => setDeleteTarget(null) });
    }
  };

  const filtered = karyawans.filter((k: any) =>
    k.kode_karyawan.toLowerCase().includes(search.toLowerCase()) ||
    k.nama_karyawan.toLowerCase().includes(search.toLowerCase()) ||
    k.jabatan.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (view === 'form') return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Data Karyawan' : 'Tambah Data Karyawan'}</h1>
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Kode Karyawan *</label>
          <input disabled className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-100 rounded-lg cursor-not-allowed" value={data.kode_karyawan} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Karyawan *</label>
          <input required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400" value={data.nama_karyawan} onChange={e => setData('nama_karyawan', e.target.value)} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Jabatan *</label>
          <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-red-400 bg-white" value={data.jabatan} onChange={e => setData('jabatan', e.target.value)}>{JABATAN_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Departemen *</label>
          <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-red-400 bg-white" value={data.departemen} onChange={e => setData('departemen', e.target.value)}>{DEPARTEMEN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button type="button" onClick={() => setView('list')} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
          <button type="submit" className="px-4 py-2 text-sm text-white bg-red-800 rounded-lg hover:bg-red-900">Simpan</button>
        </div>
      </form>
    </div>
  );

  if (view === 'detail' && selectedKaryawan) return <DetailKaryawan k={selectedKaryawan} onBack={() => setView('list')} />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Data Karyawan</h1><p className="text-sm text-gray-500">Kelola data karyawan perusahaan</p></div>
        <button onClick={openFormTambah} className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900"><Plus className="w-4 h-4" /> Tambah Karyawan</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative mb-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Cari karyawan..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" /></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr><th className="px-4 py-3 text-left">Kode Karyawan</th><th className="px-4 py-3 text-left">Nama</th><th className="px-4 py-3 text-left">Jabatan</th><th className="px-4 py-3 text-left">Departemen</th><th className="px-4 py-3 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paged.map((k: any) => (
              <tr key={k.id_karyawan} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{k.kode_karyawan}</td>
                <td className="px-4 py-3">{k.nama_karyawan}</td>
                <td className="px-4 py-3 text-gray-700 capitalize">{k.jabatan}</td>
                <td className="px-4 py-3"><DeptBadge dept={k.departemen} /></td>
                <td className="px-4 py-3 text-center flex justify-center gap-2">
                  <button onClick={() => { setSelectedKaryawan(k); setView('detail'); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => openFormEdit(k)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(k)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deleteTarget && <DeleteModal item={deleteTarget} onConfirm={handleConfirmDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}
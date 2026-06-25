import { useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, X, BookOpen } from 'lucide-react';
import { usePage, useForm, router } from '@inertiajs/react';

type TipeLaporan = 'Neraca' | 'Laba Rugi';

const KATEGORI_OPTIONS = [
  'Aset Lancar', 'Aset Tidak Lancar', 'Liabilitas Jangka Pendek', 
  'Liabilitas Jangka Panjang', 'Ekuitas', 'Pendapatan', 
  'Beban Pokok Penjualan', 'Beban Operasional'
];

const KATEGORI_TIPE_MAP: Record<string, TipeLaporan> = {
  'Aset Lancar': 'Neraca', 'Aset Tidak Lancar': 'Neraca',
  'Liabilitas Jangka Pendek': 'Neraca', 'Liabilitas Jangka Panjang': 'Neraca',
  'Ekuitas': 'Neraca', 'Pendapatan': 'Laba Rugi',
  'Beban Pokok Penjualan': 'Laba Rugi', 'Beban Operasional': 'Laba Rugi',
};

const KATEGORI_COLOR: Record<string, string> = {
  'Aset Lancar': 'bg-blue-100 text-blue-700',
  'Aset Tidak Lancar': 'bg-blue-50 text-blue-600',
  'Liabilitas Jangka Pendek': 'bg-red-100 text-red-700',
  'Liabilitas Jangka Panjang': 'bg-red-50 text-red-600',
  'Ekuitas': 'bg-purple-100 text-purple-700',
  'Pendapatan': 'bg-green-100 text-green-700',
  'Beban Pokok Penjualan': 'bg-orange-100 text-orange-700',
  'Beban Operasional': 'bg-amber-100 text-amber-700',
};

interface Akun {
  id_akun?: number;
  kode_akun: string;
  nama_akun: string;
  kategori: string;
}

function KategoriBadge({ k }: { k: string }) {
  const cls = KATEGORI_COLOR[k] ?? 'bg-gray-100 text-gray-600';
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{k}</span>;
}

function ReadField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="text-sm font-medium text-gray-800">{value}</div>
    </div>
  );
}

const PAGE_SIZE = 10;
type ViewMode = 'list' | 'form' | 'detail';

export default function DataAkun() {
  // Resolusi Error 2352: Menggunakan type assertion 'any' yang lazim di ekosistem Inertia standar
  const { akuns } = usePage().props as any;
  
  const [view, setView] = useState<ViewMode>('list');
  const [selected, setSelected] = useState<Akun | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Akun | null>(null);

  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('Semua');
  const [page, setPage] = useState(1);

  const { data, setData, post, put, reset, errors, clearErrors } = useForm({
    kode_akun: '',
    nama_akun: '',
    kategori: 'Aset Lancar',
  });

  const openAddForm = () => {
    setSelected(null);
    reset();
    clearErrors();
    setView('form');
  };

  const openEditForm = (a: Akun) => {
    setSelected(a);
    setData({
      kode_akun: a.kode_akun,
      nama_akun: a.nama_akun,
      kategori: a.kategori,
    });
    clearErrors();
    setView('form');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected?.id_akun) {
      put(`/akun/${selected.id_akun}`, { onSuccess: () => setView('list') });
    } else {
      post('/akun', { onSuccess: () => setView('list') });
    }
  };

  const executeDelete = () => {
    if (deleteTarget?.id_akun) {
      router.delete(`/akun/${deleteTarget.id_akun}`, {
        onSuccess: () => setDeleteTarget(null)
      });
    }
  };

  const filtered = akuns?.filter((a: Akun) =>
    (kategoriFilter === 'Semua' || a.kategori === kategoriFilter) &&
    (a.kode_akun.toLowerCase().includes(search.toLowerCase()) ||
     a.nama_akun.toLowerCase().includes(search.toLowerCase()))
  ) || [];
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── VIEW: FORM ──────────────────────────────────────────────────────────────
  if (view === 'form') return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{selected ? 'Edit Data Akun' : 'Tambah Data Akun'}</h1>
        <p className="text-sm text-gray-500">Isi informasi akun untuk Chart of Accounts</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Kode Akun <span className="text-red-500">*</span></label>
              {selected ? (
                <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed">{data.kode_akun}</div>
              ) : (
                <>
                  <input className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-red-400 ${errors.kode_akun ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Contoh: 1-1100" value={data.kode_akun}
                    onChange={e => setData('kode_akun', e.target.value)} />
                  <p className="text-xs text-gray-400 mt-0.5">Format: [Kelompok]-[Nomor urut]</p>
                  {errors.kode_akun && <p className="text-xs text-red-500 mt-0.5">{errors.kode_akun}</p>}
                </>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Akun <span className="text-red-500">*</span></label>
              <input className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-red-400 ${errors.nama_akun ? 'border-red-300' : 'border-gray-200'}`}
                placeholder="Masukkan nama akun" value={data.nama_akun}
                onChange={e => setData('nama_akun', e.target.value)} />
              {errors.nama_akun && <p className="text-xs text-red-500 mt-0.5">{errors.nama_akun}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Kategori <span className="text-red-500">*</span></label>
              <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white"
                value={data.kategori} onChange={e => setData('kategori', e.target.value)}>
                {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              {errors.kategori && <p className="text-xs text-red-500 mt-0.5">{errors.kategori}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button type="button" onClick={() => setView('list')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900">{selected ? 'Update' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  );

  // ── VIEW: DETAIL ────────────────────────────────────────────────────────────
  if (view === 'detail' && selected) return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Akun</h1>
          <p className="text-sm text-gray-500">{selected.kode_akun}</p>
        </div>
        <button onClick={() => setView('list')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"><X className="w-5 h-5" /></button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{selected.nama_akun}</p>
            <p className="text-xs font-mono text-gray-400">{selected.kode_akun}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ReadField label="Kode Akun" value={<span className="font-mono">{selected.kode_akun}</span>} />
          <ReadField label="Nama Akun" value={selected.nama_akun} />
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-400 mb-1">Kategori (Tipe: {KATEGORI_TIPE_MAP[selected.kategori]})</p>
            <KategoriBadge k={selected.kategori} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button onClick={() => setView('list')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Tutup</button>
        </div>
      </div>
    </div>
  );

  // ── VIEW: LIST ──────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Akun</h1>
          <p className="text-sm text-gray-500">Kelola Chart of Accounts untuk pencatatan keuangan</p>
        </div>
        <button onClick={openAddForm} className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900">
          <Plus className="w-4 h-4" /> Tambah Akun
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-2 flex-wrap mb-6">
          <div className="relative flex-1 min-w-48 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
              placeholder="Cari kode atau nama akun..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white text-gray-700"
            value={kategoriFilter} onChange={e => { setKategoriFilter(e.target.value); setPage(1); }}>
            <option value="Semua">Semua Kategori</option>
            {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Kode Akun</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Nama Akun</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Kategori</th>
                <th className="px-4 py-3 font-semibold text-gray-900 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-gray-400">Tidak ada data ditemukan</td></tr>
              ) : paged.map((a: Akun) => (
                <tr key={a.id_akun} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold font-mono">{a.kode_akun}</td>
                  <td className="px-4 py-3">{a.nama_akun}</td>
                  <td className="px-4 py-3"><KategoriBadge k={a.kategori} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setSelected(a); setView('detail'); }} className="p-1.5 rounded hover:bg-blue-100 text-blue-600"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEditForm(a)} className="p-1.5 rounded hover:bg-yellow-100 text-yellow-600"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(a)} className="p-1.5 rounded hover:bg-red-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 mt-4">
            <span className="text-xs text-gray-500">{`${(page-1)*PAGE_SIZE+1}–${Math.min(page*PAGE_SIZE, filtered.length)} dari ${filtered.length} data`}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-white disabled:opacity-40">Sebelumnya</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 text-xs border rounded ${p===page?'bg-red-800 text-white border-red-800':'border-gray-200 hover:bg-white'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-white disabled:opacity-40">Berikutnya</button>
            </div>
          </div>
        )}
      </div>

      {/* ── DELETE MODAL ──────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">Hapus Data Akun</h3>
              <button onClick={() => setDeleteTarget(null)}><X className="w-4 h-4 text-gray-500 hover:text-gray-700" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Apakah Anda yakin ingin menghapus akun berikut?</p>
            <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
              <span className="font-mono font-semibold text-red-700">{deleteTarget.kode_akun}</span> — {deleteTarget.nama_akun}
            </div>
            <p className="text-xs text-gray-400 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={executeDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900 transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
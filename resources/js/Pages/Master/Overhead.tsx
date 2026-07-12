import { useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, X, ChevronLeft, Zap } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';

const PAGE_SIZE = 10;
type ViewMode = 'list' | 'form' | 'detail';

export default function DataOverhead({ overheads, nextCode }: any) {
  const [view, setView] = useState<ViewMode>('list');
  const [isEdit, setIsEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // STATE UNTUK ERROR NAMA OVERHEAD
  const [nameError, setNameError] = useState('');

  // Inertia Form
  const { data, setData, post, put, reset, errors } = useForm({
    kode_overhead: '',
    nama_overhead: '',
    keterangan: '',
  });

  const openFormTambah = () => {
    setIsEdit(false);
    reset(); 
    setData('kode_overhead', nextCode); 
    setData('nama_overhead', '');      
    setData('keterangan', ''); 
    setNameError(''); // Reset error saat buka form
    setView('form');
  };

  const openFormEdit = (item: any) => {
    setIsEdit(true);
    setSelectedItem(item);
    setData({
      kode_overhead: item.kode_overhead,
      nama_overhead: item.nama_overhead,
      keterangan: item.keterangan || '',
    });
    setNameError(''); // Reset error saat buka form
    setView('form');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Ekstra saat klik simpan (Pencegahan Ganda)
    if (!/^[a-zA-Z\s]+$/.test(data.nama_overhead)) {
      setNameError('Nama overhead tidak valid, pastikan tidak ada angka atau simbol.');
      return;
    }

    if (isEdit) {
      put(`/overhead/${selectedItem.id_overhead}`, { onSuccess: () => setView('list') });
    } else {
      post('/overhead', { onSuccess: () => setView('list') });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      router.delete(`/overhead/${deleteTarget.id_overhead}`, {
        onSuccess: () => setDeleteTarget(null)
      });
    }
  };

  // Logika Filter & Pagination
  const filtered = overheads.filter((o: any) =>
    o.kode_overhead.toLowerCase().includes(search.toLowerCase()) ||
    o.nama_overhead.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── TAMPILAN FORM ────────────────────────────────────────────────────────
  if (view === 'form') {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Data Overhead' : 'Tambah Data Overhead'}</h1>
          <p className="text-sm text-gray-500">Isi informasi komponen biaya overhead produksi</p>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Kode Overhead *</label>
              <input 
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-100 rounded-lg outline-none cursor-not-allowed" 
                value={data.kode_overhead} 
              />
            </div>
            
            {/* Input NAMA OVERHEAD dengan Validasi */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Overhead *</label>
              <input 
                required
                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${nameError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:border-red-400 focus:ring-1 focus:ring-red-400'}`} 
                placeholder="Masukkan nama komponen overhead" 
                value={data.nama_overhead} 
                onChange={e => {
                  const val = e.target.value;
                  setData('nama_overhead', val);
                  
                  // Regex Pengecekan: Hanya izinkan huruf besar/kecil dan spasi
                  if (val.length > 0 && !/^[a-zA-Z\s]+$/.test(val)) {
                    setNameError('Hanya boleh berisi teks/huruf dan spasi. Angka & simbol tidak diizinkan.');
                  } else {
                    setNameError('');
                  }
                }} 
              />
              {/* Pesan Error Muncul Disini */}
              {nameError && (
                <p className="text-red-500 text-[11px] mt-1.5 flex items-start gap-1">
                  <span className="font-bold">Peringatan:</span> {nameError}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Keterangan</label>
            <textarea 
              rows={4} 
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none"
              placeholder="Deskripsi komponen biaya overhead..." 
              value={data.keterangan}
              onChange={e => setData('keterangan', e.target.value)} 
            />
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button type="button" onClick={() => setView('list')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
            <button 
              type="submit" 
              disabled={!!nameError} // Tombol mati otomatis jika ada pesan error
              className="px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── TAMPILAN DETAIL ──────────────────────────────────────────────────────
  if (view === 'detail' && selectedItem) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Overhead</h1>
            <p className="text-sm text-gray-500">{selectedItem.kode_overhead}</p>
          </div>
          <button onClick={() => setView('list')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{selectedItem.nama_overhead}</p>
              <p className="text-xs text-gray-500">Kode: {selectedItem.kode_overhead}</p>
            </div>
          </div>
          <hr className="border-gray-100 my-4" />
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">Keterangan</p>
            <p className="text-sm text-gray-700">{selectedItem.keterangan || <span className="italic text-gray-400">Tidak ada keterangan</span>}</p>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button onClick={() => setView('list')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Tutup</button>
          </div>
        </div>
      </div>
    );
  }

  // ── TAMPILAN LIST (TABEL UTAMA) ──────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Data Overhead</h1>
           <p className="text-sm text-gray-500">Kelola komponen biaya overhead produksi</p>
        </div>
        <button onClick={openFormTambah} className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900">
          <Plus className="w-4 h-4" /> Tambah Overhead
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            placeholder="Cari kode atau nama overhead..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Kode Overhead</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Nama Overhead</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Keterangan</th>
                <th className="px-4 py-3 font-semibold text-gray-900 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">Tidak ada data ditemukan</td>
                </tr>
              ) : paged.map((o: any) => (
                <tr key={o.id_overhead} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{o.kode_overhead}</td>
                  <td className="px-4 py-3">{o.nama_overhead}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-sm">
                    <span className="line-clamp-2">{o.keterangan || <span className="italic">—</span>}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button title="Detail" onClick={() => { setSelectedItem(o); setView('detail'); }} className="p-1.5 rounded hover:bg-blue-100 text-blue-600"><Eye className="w-4 h-4" /></button>
                      <button title="Edit" onClick={() => openFormEdit(o)} className="p-1.5 rounded hover:bg-yellow-100 text-yellow-600"><Pencil className="w-4 h-4" /></button>
                      <button title="Hapus" onClick={() => setDeleteTarget(o)} className="p-1.5 rounded hover:bg-red-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fitur Pagination Bawaan Figma */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 mt-4">
            <span className="text-xs text-gray-500">
              {`${(page-1)*PAGE_SIZE+1}–${Math.min(page*PAGE_SIZE, filtered.length)} dari ${filtered.length} data`}
            </span>
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
              <h3 className="text-base font-semibold text-gray-800">Hapus Data Overhead</h3>
              <button onClick={() => setDeleteTarget(null)}><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Apakah Anda yakin ingin menghapus data overhead berikut?</p>
            <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
              <span className="font-semibold text-red-700">{deleteTarget.kode_overhead}</span> — {deleteTarget.nama_overhead}
            </div>
            <p className="text-xs text-gray-400 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
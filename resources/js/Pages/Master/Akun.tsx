import { useState, useMemo } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, X, Zap } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';

const PAGE_SIZE = 10;
type ViewMode = 'list' | 'form' | 'detail';

// Mapping Prefix Kategori ala MYOB
const PREFIX_MAP: Record<string, string> = {
  'Aset Lancar': '1',
  'Aset Tetap': '1',
  'Liabilitas': '2',
  'Ekuitas': '3',
  'Pendapatan': '4',
  'Beban Pokok Penjualan': '5',
  'Beban Operasional': '6',
  'Pendapatan Lain-lain': '8',
  'Penghasilan Lain-lain': '8',
  'Beban Lain-lain': '9',
};

// Helper Format Rupiah
const formatRupiah = (value: number | string) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};

export default function DataAkun({ akuns }: any) {
  const [view, setView] = useState<ViewMode>('list');
  const [isEdit, setIsEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);

  // STATE UNTUK ERROR NAMA DAN KODE AKUN
  const [nameError, setNameError] = useState('');
  const [codeError, setCodeError] = useState('');

  // Inertia Form
  const { data, setData, post, put, reset, transform } = useForm({
    kode_akun_suffix: '', 
    nama_akun: '',
    kategori: '',
    saldo_normal: 'Debit', // Default Enum
    saldo_awal: 0,
  });

  transform((formData) => {
    const prefix = PREFIX_MAP[formData.kategori] || '';
    return {
      kode_akun: prefix + formData.kode_akun_suffix,
      nama_akun: formData.nama_akun,
      kategori: formData.kategori,
      saldo_normal: formData.saldo_normal,
      saldo_awal: parseFloat(formData.saldo_awal.toString()) || 0,
    };
  });

  const uniqueCategories = useMemo(() => {
    const cats = akuns.map((a: any) => a.kategori);
    return Array.from(new Set(cats)).filter(Boolean);
  }, [akuns]);

  // Helper untuk menampilkan format 1-xxxx di Tabel & UI
  const formatKodeAkun = (kode: string, kategori: string) => {
    if (!kode) return '';
    const prefix = PREFIX_MAP[kategori];
    if (prefix && kode.startsWith(prefix)) {
      const suffix = kode.substring(prefix.length);
      return `${prefix}-${suffix}`;
    }
    return kode;
  };

  const openFormTambah = () => {
    setIsEdit(false);
    reset();
    setNameError(''); // Reset error
    setCodeError(''); // Reset error
    setView('form');
  };

  const openFormEdit = (item: any) => {
    setIsEdit(true);
    setSelectedItem(item);
    setNameError(''); // Reset error
    setCodeError(''); // Reset error
    
    const prefix = PREFIX_MAP[item.kategori] || '';
    let suffix = item.kode_akun;
    
    if (prefix && item.kode_akun.startsWith(prefix)) {
      suffix = item.kode_akun.substring(prefix.length);
      if (suffix.startsWith('-')) suffix = suffix.substring(1);
    }

    setData({
      kode_akun_suffix: suffix,
      nama_akun: item.nama_akun,
      kategori: item.kategori || '',
      saldo_normal: item.saldo_normal || 'Debit',
      saldo_awal: item.saldo_awal || 0,
    });
    setView('form');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Ganda Saat Klik Simpan (Keamanan Tambahan)
    if (!/^[0-9]+$/.test(data.kode_akun_suffix)) {
      setCodeError('Kode akun hanya boleh berisi angka.');
      return;
    }
    
    if (!/^[a-zA-Z\s]+$/.test(data.nama_akun)) {
      setNameError('Nama akun tidak valid, pastikan tidak ada angka atau simbol.');
      return;
    }

    if (isEdit) {
      put(`/akun/${selectedItem.id_akun}`, { onSuccess: () => setView('list') });
    } else {
      post('/akun', { onSuccess: () => setView('list') });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      router.delete(`/akun/${deleteTarget.id_akun}`, {
        onSuccess: () => setDeleteTarget(null)
      });
    }
  };

  const filtered = akuns.filter((a: any) => {
    const matchesSearch = 
      (a.kode_akun || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.nama_akun || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === '' || a.kategori === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const currentPrefix = PREFIX_MAP[data.kategori] || '';

  // ── TAMPILAN FORM ────────────────────────────────────────────────────────
  if (view === 'form') {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Data Akun' : 'Tambah Data Akun'}</h1>
          <p className="text-sm text-gray-500">Isi informasi Chart of Accounts (CoA) beserta saldo awalnya</p>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Baris Kategori */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Kategori *</label>
            <select 
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white"
              value={data.kategori}
              onChange={e => setData('kategori', e.target.value)}
            >
              <option value="">Pilih Kategori...</option>
              {Object.keys(PREFIX_MAP).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Baris Kode & Nama Akun */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Input KODE AKUN dengan Validasi */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Kode Akun *</label>
              <div className="flex">
                {currentPrefix && (
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-600 sm:text-sm font-semibold">
                    {currentPrefix} -
                  </span>
                )}
                <input 
                  required
                  disabled={isEdit || !data.kategori} 
                  className={`flex-1 min-w-0 block w-full px-3 py-2 text-sm border outline-none ${currentPrefix ? 'rounded-none rounded-r-lg' : 'rounded-lg'} ${isEdit || !data.kategori ? 'bg-gray-100 cursor-not-allowed border-gray-200' : codeError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:border-red-400 focus:ring-1 focus:ring-red-400'}`} 
                  placeholder={data.kategori ? "xxxx" : "Pilih kategori dulu"}
                  value={data.kode_akun_suffix} 
                  onChange={e => {
                    const val = e.target.value;
                    setData('kode_akun_suffix', val);
                    
                    // Regex Pengecekan: Hanya izinkan angka 0-9
                    if (val.length > 0 && !/^[0-9]+$/.test(val)) {
                      setCodeError('Hanya boleh berisi angka.');
                    } else {
                      setCodeError('');
                    }
                  }} 
                />
              </div>
              {/* Pesan Error Kode Akun Muncul Disini */}
              {codeError && (
                <p className="text-red-500 text-[11px] mt-1.5 flex items-start gap-1">
                  <span className="font-bold">Peringatan:</span> {codeError}
                </p>
              )}
            </div>
            
            {/* Input NAMA AKUN dengan Validasi */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Akun *</label>
              <input 
                required
                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none ${nameError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:border-red-400 focus:ring-1 focus:ring-red-400'}`} 
                placeholder="Misal: Kas" 
                value={data.nama_akun} 
                onChange={e => {
                  const val = e.target.value;
                  setData('nama_akun', val);
                  
                  // Regex Pengecekan: Hanya izinkan huruf besar/kecil dan spasi
                  if (val.length > 0 && !/^[a-zA-Z\s]+$/.test(val)) {
                    setNameError('Hanya boleh berisi teks/huruf dan spasi. Angka & simbol tidak diizinkan.');
                  } else {
                    setNameError('');
                  }
                }} 
              />
              {/* Pesan Error Nama Akun Muncul Disini */}
              {nameError && (
                <p className="text-red-500 text-[11px] mt-1.5 flex items-start gap-1">
                  <span className="font-bold">Peringatan:</span> {nameError}
                </p>
              )}
            </div>
          </div>

          {/* Baris Saldo Normal & Saldo Awal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Saldo Normal *</label>
              <select 
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white"
                value={data.saldo_normal}
                onChange={e => setData('saldo_normal', e.target.value)}
              >
                <option value="Debit">Debit</option>
                <option value="Kredit">Kredit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Saldo Awal</label>
              <input 
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400" 
                placeholder="0" 
                value={data.saldo_awal} 
                onChange={e => setData('saldo_awal', Number(e.target.value))} 
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button type="button" onClick={() => setView('list')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
            <button 
              type="submit" 
              disabled={!!nameError || !!codeError} // Tombol mati jika salah satu form error
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
            <h1 className="text-2xl font-bold text-gray-900">Detail Akun</h1>
            <p className="text-sm text-gray-500">{formatKodeAkun(selectedItem.kode_akun, selectedItem.kategori)}</p>
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
              <p className="text-lg font-bold text-gray-800">{selectedItem.nama_akun}</p>
              <p className="text-xs text-gray-500">Kode: {formatKodeAkun(selectedItem.kode_akun, selectedItem.kategori)}</p>
            </div>
          </div>
          <hr className="border-gray-100 my-4" />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">Kategori</p>
              <p className="text-sm font-semibold text-gray-700">{selectedItem.kategori}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">Saldo Normal</p>
              <p className="text-sm font-semibold text-gray-700">{selectedItem.saldo_normal}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">Saldo Awal</p>
              <p className="text-sm font-semibold text-green-700">{formatRupiah(selectedItem.saldo_awal)}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button onClick={() => setView('list')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Tutup</button>
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
           <h1 className="text-2xl font-bold text-gray-900">Data Akun</h1>
           <p className="text-sm text-gray-500">Kelola master data Chart of Accounts & Saldo Awal</p>
        </div>
        <button onClick={openFormTambah} className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900">
          <Plus className="w-4 h-4" /> Tambah Akun
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
              placeholder="Cari kode atau nama akun..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          
          <select 
            className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white text-gray-700"
            value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}
          >
            <option value="">Semua Kategori</option>
            {uniqueCategories.map((cat: any) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Kode Akun</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Nama Akun</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Kategori</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Saldo Normal</th>
                <th className="px-4 py-3 font-semibold text-gray-900 text-right">Saldo Awal</th>
                <th className="px-4 py-3 font-semibold text-gray-900 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">Tidak ada data ditemukan</td>
                </tr>
              ) : paged.map((a: any) => (
                <tr key={a.id_akun} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{formatKodeAkun(a.kode_akun, a.kategori)}</td>
                  <td className="px-4 py-3">{a.nama_akun}</td>
                  <td className="px-4 py-3 text-gray-500">{a.kategori}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${a.saldo_normal === 'Debit' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                      {a.saldo_normal}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">{formatRupiah(a.saldo_awal)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button title="Detail" onClick={() => { setSelectedItem(a); setView('detail'); }} className="p-1.5 rounded hover:bg-blue-100 text-blue-600"><Eye className="w-4 h-4" /></button>
                      <button title="Edit" onClick={() => openFormEdit(a)} className="p-1.5 rounded hover:bg-yellow-100 text-yellow-600"><Pencil className="w-4 h-4" /></button>
                      <button title="Hapus" onClick={() => setDeleteTarget(a)} className="p-1.5 rounded hover:bg-red-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">Hapus Data Akun</h3>
              <button onClick={() => setDeleteTarget(null)}><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Apakah Anda yakin ingin menghapus data akun berikut?</p>
            <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm flex flex-col">
              <span className="font-semibold text-red-700 mb-1">{formatKodeAkun(deleteTarget.kode_akun, deleteTarget.kategori)} — {deleteTarget.nama_akun}</span>
              <span className="text-gray-500 text-xs">Saldo Awal: {formatRupiah(deleteTarget.saldo_awal)}</span>
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
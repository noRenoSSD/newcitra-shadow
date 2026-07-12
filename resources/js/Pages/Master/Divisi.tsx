import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Building2, Eye } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';

export default function DivisiPage({ divisis, nextCode }: any) {
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [isEdit, setIsEdit] = useState(false);
  const [target, setTarget] = useState<any>(null);
  
  // STATE UNTUK ERROR NAMA DIVISI
  const [nameError, setNameError] = useState('');
  
  const { data, setData, post, put, reset } = useForm({
    kode_divisi: '', nama_divisi: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Ekstra saat klik simpan (Pencegahan Ganda)
    if (!/^[a-zA-Z\s]+$/.test(data.nama_divisi)) {
      setNameError('Nama divisi tidak valid, pastikan tidak ada angka atau simbol.');
      return;
    }

    if (isEdit) {
      put(`/divisi/${target.id_divisi}`, { onSuccess: () => setView('list') });
    } else {
      post('/divisi', { onSuccess: () => setView('list') });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Data Divisi</h1>
          <p className="text-gray-500 text-sm">Kelola divisi produksi perusahaan</p>
        </div>
        {/* Tombol tambah disembunyikan saat sedang di mode form/detail */}
        {view === 'list' && (
            <button 
                onClick={() => { 
                  setIsEdit(false); 
                  reset(); 
                  setData('kode_divisi', nextCode); 
                  setNameError(''); // Reset error
                  setView('form'); 
                }} 
                className="bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
                <Plus className="w-4 h-4"/> Tambah Divisi
            </button>
        )}
      </div>

      {/* ── VIEW: LIST ── */}
      {view === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Kode Divisi</th>
                <th className="p-3 text-left">Nama Divisi</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {divisis.map((d: any) => (
                <tr key={d.id_divisi} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-800">{d.kode_divisi}</td>
                  <td className="p-3 text-gray-700">{d.nama_divisi}</td>
                  <td className="p-3 flex justify-center gap-2">
                    {/* Tombol Detail (Eye) */}
                    <button 
                        onClick={() => { setTarget(d); setView('detail'); }} 
                        className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"
                        title="Detail"
                    >
                        <Eye className="w-4 h-4"/>
                    </button>
                    {/* Tombol Edit */}
                    <button 
                        onClick={() => { 
                          setIsEdit(true); 
                          setTarget(d); 
                          setData(d); 
                          setNameError(''); // Reset error
                          setView('form'); 
                        }} 
                        className="text-yellow-600 hover:bg-yellow-50 p-1.5 rounded transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4"/>
                    </button>
                    {/* Tombol Hapus */}
                    <button 
                        onClick={() => router.delete(`/divisi/${d.id_divisi}`)} 
                        className="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── VIEW: FORM INPUT/EDIT ── */}
      {view === 'form' && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kode Divisi</label>
                <input disabled value={data.kode_divisi} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500" />
            </div>
            
            {/* Input NAMA DIVISI dengan Validasi */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Divisi</label>
                <input 
                  required 
                  value={data.nama_divisi} 
                  onChange={e => {
                    const val = e.target.value;
                    setData('nama_divisi', val);
                    
                    // Regex Pengecekan: Hanya izinkan huruf besar/kecil dan spasi
                    if (val.length > 0 && !/^[a-zA-Z\s]+$/.test(val)) {
                      setNameError('Hanya boleh berisi teks/huruf dan spasi. Angka & simbol tidak diizinkan.');
                    } else {
                      setNameError('');
                    }
                  }} 
                  className={`w-full px-4 py-2 border rounded-lg outline-none transition-colors ${nameError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30' : 'border-gray-300 focus:border-red-400 focus:ring-1 focus:ring-red-400'}`} 
                />
                {/* Pesan Error Muncul Disini */}
                {nameError && (
                  <p className="text-red-500 text-[11px] mt-1.5 flex items-start gap-1">
                    <span className="font-bold">Peringatan:</span> {nameError}
                  </p>
                )}
            </div>
          </div>
          <div className="mt-6 pt-6 border-t flex gap-2">
            <button type="button" onClick={() => setView('list')} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
            <button 
              type="submit" 
              disabled={!!nameError} // Tombol mati otomatis jika ada pesan error
              className="px-5 py-2.5 bg-red-800 text-white rounded-lg hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Simpan
            </button>
          </div>
        </form>
      )}

      {/* ── VIEW: DETAIL ── */}
      {view === 'detail' && target && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
             <Building2 className="w-5 h-5 text-gray-400" /> Detail Divisi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-lg border border-gray-100">
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Kode Divisi</label>
                <p className="font-semibold text-lg text-gray-800">{target.kode_divisi}</p>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Nama Divisi</label>
                <p className="font-semibold text-lg text-gray-800">{target.nama_divisi}</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t">
            <button type="button" onClick={() => setView('list')} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Kembali ke Daftar</button>
          </div>
        </div>
      )}

    </div>
  );
}
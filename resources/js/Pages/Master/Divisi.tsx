import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Building2 } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';

export default function DivisiPage({ divisis, nextCode }: any) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [isEdit, setIsEdit] = useState(false);
  const [target, setTarget] = useState<any>(null);
  
  const { data, setData, post, put, reset } = useForm({
    kode_divisi: '', nama_divisi: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    isEdit ? put(`/divisi/${target.id_divisi}`, { onSuccess: () => setView('list') })
           : post('/divisi', { onSuccess: () => setView('list') });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Data Divisi</h1>
          <p className="text-gray-500 text-sm">Kelola divisi produksi perusahaan</p>
        </div>
        <button onClick={() => { setIsEdit(false); reset(); setData('kode_divisi', nextCode); setView('form'); }} 
                className="bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4"/> Tambah Divisi</button>
      </div>

      {view === 'list' ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr><th className="p-3 text-left">Kode Divisi</th><th className="p-3 text-left">Nama Divisi</th><th className="p-3 text-center">Aksi</th></tr>
            </thead>
            <tbody className="divide-y">
              {divisis.map((d: any) => (
                <tr key={d.id_divisi} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold">{d.kode_divisi}</td>
                  <td className="p-3">{d.nama_divisi}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <button onClick={() => { setIsEdit(true); setTarget(d); setData(d); setView('form'); }} className="text-yellow-600"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => router.delete(`/divisi/${d.id_divisi}`)} className="text-red-600"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm mb-2">Kode Divisi</label><input disabled value={data.kode_divisi} className="w-full px-4 py-2 bg-gray-50 border rounded-lg" /></div>
            <div><label className="block text-sm mb-2">Nama Divisi</label><input required value={data.nama_divisi} onChange={e => setData('nama_divisi', e.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
          </div>
          <div className="mt-6 pt-6 border-t flex gap-2">
            <button type="button" onClick={() => setView('list')} className="px-4 py-2 border rounded-lg">Batal</button>
            <button type="submit" className="px-4 py-2 bg-red-800 text-white rounded-lg">Simpan</button>
          </div>
        </form>
      )}
    </div>
  );
}
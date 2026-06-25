import { useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, X } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

type TipeAset = 'mesin' | 'kendaraan' | 'peralatan';

interface AsetTetap {
  id_aset?: number;
  kode_aset: string;
  nama_aset: string;
  tipe_aset: TipeAset;
  tanggal_beli: string;
  harga_perolehan: number;
  umur_ekonomis: number;
  nilai_sisa: number;
  keterangan?: string;
}

const TIPE_OPTIONS: TipeAset[] = ['mesin', 'kendaraan', 'peralatan'];

export default function AsetTetap() {
  const { dataAsetDariDB } = usePage().props as any; 
  
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAset, setSelectedAset] = useState<AsetTetap | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AsetTetap | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<AsetTetap>({
    kode_aset: '', nama_aset: '', tipe_aset: 'mesin', tanggal_beli: '', 
    harga_perolehan: 0, umur_ekonomis: 0, nilai_sisa: 0, keterangan: ''
  });

  const generateNextKode = () => {
    if (!dataAsetDariDB || dataAsetDariDB.length === 0) return 'AST-001';
    let maxNum = 0;
    dataAsetDariDB.forEach((item: AsetTetap) => {
      const match = item.kode_aset.match(/\d+$/);
      if (match) { const num = parseInt(match[0], 10); if (num > maxNum) maxNum = num; }
    });
    return `AST-${(maxNum + 1).toString().padStart(3, '0')}`;
  };

  const handleAdd = () => {
    setFormData({ kode_aset: generateNextKode(), nama_aset: '', tipe_aset: 'mesin', tanggal_beli: '', harga_perolehan: 0, umur_ekonomis: 0, nilai_sisa: 0, keterangan: '' });
    setEditMode(false);
    setShowForm(true);
  };

  const handleEdit = (a: AsetTetap) => {
    setFormData({ ...a });
    setSelectedAset(a);
    setEditMode(true);
    setShowForm(true);
  };

  const executeDelete = () => {
    if (deleteTarget && deleteTarget.id_aset) {
      router.delete(`/aset/${deleteTarget.id_aset}`, { onSuccess: () => setDeleteTarget(null) });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editMode 
      ? router.put(`/aset/${formData.id_aset}`, formData as any, { onSuccess: () => handleCancel() })
      : router.post('/aset', formData as any, { onSuccess: () => handleCancel() });
  };

  const handleCancel = () => { setShowForm(false); setShowDetail(false); setSelectedAset(null); };

  const filteredAset = dataAsetDariDB?.filter((a: AsetTetap) =>
    a.kode_aset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.nama_aset?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a: AsetTetap, b: AsetTetap) => a.kode_aset.localeCompare(b.kode_aset)) || [];

  // VIEW 1: FORM
  if (showForm) return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6"><h2 className="text-2xl font-bold">{editMode ? 'Edit Aset' : 'Tambah Aset Baru'}</h2></div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Fields sama dengan gaya karyawan */}
          <div><label className="block text-sm font-medium mb-2">Kode Aset</label><input disabled value={formData.kode_aset} className="w-full px-4 py-2 bg-gray-50 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Nama Aset</label><input required value={formData.nama_aset} onChange={e => setFormData({...formData, nama_aset: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" /></div>
          <div><label className="block text-sm font-medium mb-2">Tipe</label><select value={formData.tipe_aset} onChange={e => setFormData({...formData, tipe_aset: e.target.value as TipeAset})} className="w-full px-4 py-2 border rounded-lg">{TIPE_OPTIONS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-2">Tanggal Beli</label><input type="date" required value={formData.tanggal_beli} onChange={e => setFormData({...formData, tanggal_beli: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Harga Perolehan</label><input type="number" required value={formData.harga_perolehan} onChange={e => setFormData({...formData, harga_perolehan: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Umur Ekonomis</label><input type="number" required value={formData.umur_ekonomis} onChange={e => setFormData({...formData, umur_ekonomis: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" /></div>
          <div className="md:col-span-2"><button type="submit" className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900">Simpan Data</button></div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header & Search Bar seragam */}
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-2xl font-bold">Master Aset Tetap</h1><p className="text-gray-500 text-sm">Kelola aset dan penyusutan perusahaan</p></div>
        <button onClick={handleAdd} className="bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4"/> Tambah</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b"><input className="w-full px-4 py-2 border rounded-lg" placeholder="Cari aset..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="p-4 text-left">Kode</th><th className="p-4 text-left">Nama</th><th className="p-4 text-left">Tipe</th><th className="p-4 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y">
            {filteredAset.map((item: AsetTetap) => (
              <tr key={item.id_aset} className="hover:bg-gray-50">
                <td className="p-4 font-semibold">{item.kode_aset}</td>
                <td className="p-4">{item.nama_aset}</td>
                <td className="p-4 capitalize">{item.tipe_aset}</td>
                <td className="p-4 flex justify-center gap-2">
                  <button onClick={() => { setSelectedAset(item); setShowDetail(true); }} className="text-blue-600 p-1.5 hover:bg-blue-50 rounded"><Eye className="w-4 h-4"/></button>
                  <button onClick={() => handleEdit(item)} className="text-yellow-600 p-1.5 hover:bg-yellow-50 rounded"><Pencil className="w-4 h-4"/></button>
                  <button onClick={() => setDeleteTarget(item)} className="text-red-600 p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── DELETE MODAL ──────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">Hapus Data Aset</h3>
              <button onClick={() => setDeleteTarget(null)}><X className="w-4 h-4 text-gray-500 hover:text-gray-700" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Apakah Anda yakin ingin menghapus data aset berikut?</p>
            <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
              <span className="font-semibold text-red-700">{deleteTarget.kode_aset}</span> — {deleteTarget.nama_aset}
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
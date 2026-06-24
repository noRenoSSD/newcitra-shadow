import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Plus, Search, Eye, Pencil, Trash2, X } from 'lucide-react';

interface Mitra {
  id: number;
  kodeMitra: string;
  namaMitra: string;
  alamat: string;
  kota: string;
  telepon: string;
  kontakPerson: string;
  status: 'Aktif' | 'Tidak Aktif' | string;
}

// Menyatukan properti array 'mitra' dan data string 'nextKodeMitra' dari Backend
interface DataMitraProps {
  mitra: Mitra[];
  nextKodeMitra: string; 
}

export default function Mitra({ mitra, nextKodeMitra }: DataMitraProps) {
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMitra, setSelectedMitra] = useState<Mitra | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Inertia form helper yang memetakan object data ke Controller
  const { data, setData, post, put, reset, errors, processing } = useForm({
    kodeMitra: nextKodeMitra,
    namaMitra: '',
    alamat: '',
    kota: '',
    telepon: '',
    kontakPerson: '',
    status: 'Aktif'
  });

  const handleAdd = () => {
    reset();
    setData('kodeMitra', nextKodeMitra);
    setEditMode(false);
    setShowForm(true);
  };

  const handleEdit = (item: Mitra) => {
    setData({
      kodeMitra: item.kodeMitra,
      namaMitra: item.namaMitra,
      alamat: item.alamat,
      kota: item.kota,
      telepon: item.telepon,
      kontakPerson: item.kontakPerson,
      status: item.status
    });
    setSelectedMitra(item);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDetail = (item: Mitra) => {
    setSelectedMitra(item);
    setShowDetail(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data mitra ini?')) {
      router.delete(`/master/mitra/${id}`); // Sesuaikan jika url-nya adalah /mitra/${id}
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && selectedMitra) {
      put(`/master/mitra/${selectedMitra.id}`, { onSuccess: () => handleCancel() });
    } else {
      post('/master/mitra', { onSuccess: () => handleCancel() });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowDetail(false);
    setSelectedMitra(null);
    reset();
  };

  const filteredMitra = (mitra || []).filter(item =>
    item.kodeMitra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.namaMitra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kontakPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==================== 1. FORM VIEW (TAMBAH / EDIT) ====================
  if (showForm) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{editMode ? 'Edit Mitra' : 'Tambah Mitra Baru'}</h1>
          <p className="text-sm text-gray-500">Kelola data mitra perusahaan</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kode Mitra *</label>
                <input
                  type="text"
                  disabled
                  maxLength={10}
                  value={data.kodeMitra}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  placeholder="Contoh: MTR-001"
                />
                {errors.kodeMitra && <span className="text-red-500 text-sm">{errors.kodeMitra}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Mitra *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={data.namaMitra}
                  onChange={(e) => setData('namaMitra', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Nama lengkap mitra"
                />
                {errors.namaMitra && <span className="text-red-500 text-sm">{errors.namaMitra}</span>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat *</label>
                <textarea
                  required
                  maxLength={100}
                  value={data.alamat}
                  onChange={(e) => setData('alamat', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  rows={3}
                  placeholder="Alamat lengkap mitra"
                />
                {errors.alamat && <span className="text-red-500 text-sm">{errors.alamat}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kota *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={data.kota}
                  onChange={(e) => setData('kota', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Kota"
                />
                {errors.kota && <span className="text-red-500 text-sm">{errors.kota}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telepon *</label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={data.telepon}
                  onChange={(e) => setData('telepon', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="No. telepon"
                />
                {errors.telepon && <span className="text-red-500 text-sm">{errors.telepon}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kontak Person (PIC) *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={data.kontakPerson}
                  onChange={(e) => setData('kontakPerson', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="Nama kontak person"
                />
                {errors.kontakPerson && <span className="text-red-500 text-sm">{errors.kontakPerson}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select
                  required
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
                {errors.status && <span className="text-red-500 text-sm">{errors.status}</span>}
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={processing}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 bg-red-900 hover:bg-red-950 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {processing ? 'Memproses...' : editMode ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==================== 2. DETAIL VIEW ====================
  if (showDetail && selectedMitra) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Mitra</h1>
            <p className="text-sm text-gray-500">Informasi lengkap data mitra</p>
          </div>
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" /> Tutup
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Kode Mitra</label>
              <p className="text-gray-800 font-medium">{selectedMitra.kodeMitra}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Nama Mitra</label>
              <p className="text-gray-800 font-medium">{selectedMitra.namaMitra}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Alamat</label>
              <p className="text-gray-800 font-medium">{selectedMitra.alamat}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Kota</label>
              <p className="text-gray-800 font-medium">{selectedMitra.kota}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Telepon</label>
              <p className="text-gray-800 font-medium">{selectedMitra.telepon}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Kontak Person (PIC)</label>
              <p className="text-gray-800 font-medium">{selectedMitra.kontakPerson}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                selectedMitra.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {selectedMitra.status}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={() => { setShowDetail(false); handleEdit(selectedMitra); }}
              className="inline-flex items-center gap-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 3. TABLE LIST VIEW ====================
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Mitra</h1>
          <p className="text-sm text-gray-500">Kelola data mitra perusahaan</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-800 hover:bg-red-900 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" /> Tambah Mitra
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari mitra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-3">Kode Mitra</th>
                <th className="px-6 py-3">Nama Mitra</th>
                <th className="px-6 py-3">Kota</th>
                <th className="px-6 py-3">Kontak Person (PIC)</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {filteredMitra.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Tidak ada data mitra</td>
                </tr>
              ) : (
                filteredMitra.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.kodeMitra}</td>
                    <td className="px-6 py-4">{item.namaMitra}</td>
                    <td className="px-6 py-4">{item.kota}</td>
                    <td className="px-6 py-4">{item.kontakPerson}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDetail(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
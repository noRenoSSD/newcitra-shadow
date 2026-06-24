import { useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, X, Tag, Filter, PlusCircle, ArrowLeft } from 'lucide-react';

// =======================================================
// INTERFACES (Disamakan dengan struktur komponenmu)
// =======================================================
interface Produk {
  id_produk: number; // Menggunakan number sesuai kodemu
  kode_produk: string;
  nama_produk: string;
  satuan_produk: string;
}

interface Props {
  produk: Produk[];
}

interface THargaProduk {
  id_harga: string;
  kode_harga: string;
  id_produk: number; // Menyesuaikan ke number
  tipe_harga: string; 
  mitra_id: string | null;
  nama_mitra: string | null;
  nominal: number;    
}

// Mock Data Harga Awal (Menghubungkan ke id_produk tipe number)
const mockTabelHargaProduk: THargaProduk[] = [
  { id_harga: 'HP-1', kode_harga: 'HG-001', id_produk: 1, tipe_harga: 'Penjualan Langsung', mitra_id: null, nama_mitra: null, nominal: 45000 },
  { id_harga: 'HP-2', kode_harga: 'HG-002', id_produk: 1, tipe_harga: 'Konsinyasi', mitra_id: 'MTR-001', nama_mitra: 'Toko Sumber Rejeki', nominal: 42000 }
];

const mitraOptions = [
  { mitraId: 'MTR-001', namaMitra: 'Toko Sumber Rejeki' },
  { mitraId: 'MTR-002', namaMitra: 'Toko Maju Bersama' },
  { mitraId: 'MTR-003', namaMitra: 'UD Berkah Jaya' },
];

interface ModalHargaProps {
  produkItem: Produk;
  onClose: () => void;
  onRefreshList: () => void;
}

// =======================================================
// KOMPONEN: MODAL DETAIL MULTI HARGA
// =======================================================
function ModalDetailMultiHarga({ produkItem, onClose, onRefreshList }: ModalHargaProps) {
  const [searchMitra, setSearchMitra] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editPriceId, setEditPriceId] = useState<string | null>(null);
  
  const [localHarga, setLocalHarga] = useState<THargaProduk[]>([...mockTabelHargaProduk]);
  
  const [formInput, setFormInput] = useState({
    kode_harga: '',
    tipe_harga: '',
    mitra_id: '',
    nominal: ''
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const rows = localHarga.filter((h) => {
    if (h.id_produk !== produkItem.id_produk) return false;
    if (filterJenis && h.tipe_harga !== filterJenis) return false;
    if (searchMitra) {
      const nama = h.nama_mitra ?? 'Umum';
      if (!nama.toLowerCase().includes(searchMitra.toLowerCase())) return false;
    }
    return true;
  });

  const handleSimpanHarga = () => {
    if (!formInput.tipe_harga || !formInput.nominal || !formInput.kode_harga) return;
    const mitraObj = mitraOptions.find(m => m.mitraId === formInput.mitra_id) ?? null;

    if (editPriceId) {
      const updatedHarga = localHarga.map((h) => {
        if (h.id_harga === editPriceId) {
          return {
            ...h,
            kode_harga: formInput.kode_harga,
            tipe_harga: formInput.tipe_harga,
            mitra_id: mitraObj?.mitraId ?? null,
            nama_mitra: mitraObj?.namaMitra ?? null,
            nominal: Number(formInput.nominal)
          };
        }
        return h;
      });
      setLocalHarga(updatedHarga);
      
      const idx = mockTabelHargaProduk.findIndex(t => t.id_harga === editPriceId);
      if (idx !== -1) {
        mockTabelHargaProduk[idx] = {
          ...mockTabelHargaProduk[idx],
          kode_harga: formInput.kode_harga,
          tipe_harga: formInput.tipe_harga,
          mitra_id: mitraObj?.mitraId ?? null,
          nama_mitra: mitraObj?.namaMitra ?? null,
          nominal: Number(formInput.nominal)
        };
      }
    } else {
      const newEntry: THargaProduk = {
        id_harga: `HP-NEW-${Date.now()}`,
        kode_harga: formInput.kode_harga,
        id_produk: produkItem.id_produk,
        tipe_harga: formInput.tipe_harga,
        mitra_id: mitraObj?.mitraId ?? null,
        nama_mitra: mitraObj?.namaMitra ?? null,
        nominal: Number(formInput.nominal)
      };
      setLocalHarga([...localHarga, newEntry]);
      mockTabelHargaProduk.push(newEntry);
    }

    setFormInput({ kode_harga: '', tipe_harga: '', mitra_id: '', nominal: '' });
    setEditPriceId(null);
    setShowForm(false);
    onRefreshList();
  };

  const handleEditHarga = (hargaItem: THargaProduk) => {
    setFormInput({
      kode_harga: hargaItem.kode_harga,
      tipe_harga: hargaItem.tipe_harga,
      mitra_id: hargaItem.mitra_id ?? '',
      nominal: hargaItem.nominal.toString()
    });
    setEditPriceId(hargaItem.id_harga);
    setShowForm(true);
  };

  const handleHapusHarga = (id_harga: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus varian harga ini?')) {
      setLocalHarga(localHarga.filter(h => h.id_harga !== id_harga));
      const idx = mockTabelHargaProduk.findIndex(t => t.id_harga === id_harga);
      if (idx !== -1) mockTabelHargaProduk.splice(idx, 1);
      onRefreshList();
    }
  };

  const handleCloseForm = () => {
    setFormInput({ kode_harga: '', tipe_harga: '', mitra_id: '', nominal: '' });
    setEditPriceId(null);
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-xl w-full max-w-md flex flex-col shadow-xl">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
            <button onClick={handleCloseForm} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h3 className="text-lg font-bold text-red-800">
                {editPriceId ? 'Edit Varian Harga' : 'Tambah Varian Harga'}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{produkItem.kode_produk} — {produkItem.nama_produk}</p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Harga *</label>
              <input
                type="text"
                value={formInput.kode_harga}
                onChange={e => setFormInput({ ...formInput, kode_harga: e.target.value })}
                placeholder="Contoh: HG-01"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Harga *</label>
              <select
                value={formInput.tipe_harga}
                onChange={e => setFormInput({ ...formInput, tipe_harga: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 bg-white"
              >
                <option value="">Pilih Tipe Harga</option>
                <option value="Penjualan Langsung">Penjualan Langsung</option>
                <option value="Konsinyasi">Konsinyasi</option>
                <option value="Grosir">Grosir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Berlaku Untuk</label>
              <select
                value={formInput.mitra_id}
                onChange={e => setFormInput({ ...formInput, mitra_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 bg-white"
              >
                <option value="">Umum / Default (semua mitra)</option>
                {mitraOptions.map(m => (
                  <option key={m.mitraId} value={m.mitraId}>{m.namaMitra}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nominal Harga (Rp) *</label>
              <input
                type="number"
                value={formInput.nominal}
                onChange={e => setFormInput({ ...formInput, nominal: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button onClick={handleCloseForm} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
            <button onClick={handleSimpanHarga} disabled={!formInput.tipe_harga || !formInput.nominal || !formInput.kode_harga} className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900 disabled:opacity-50 transition-colors">
              {editPriceId ? 'Simpan Perubahan' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-bold text-red-800">Detail Multi-Harga</h3>
            <p className="text-sm text-gray-500 mt-0.5">{produkItem.kode_produk} — {produkItem.nama_produk}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama mitra..."
              value={searchMitra}
              onChange={(e) => setSearchMitra(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 bg-white"
            >
              <option value="">Semua Jenis</option>
              <option value="Penjualan Langsung">Penjualan Langsung</option>
              <option value="Konsinyasi">Konsinyasi</option>
              <option value="Grosir">Grosir</option>
            </select>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Berlaku Untuk</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipe Harga</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Nominal</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Tidak ada data harga</td>
                </tr>
              ) : (
                rows.map((h) => (
                  <tr key={h.id_harga} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      {h.nama_mitra ? <span className="font-medium text-gray-800">{h.nama_mitra}</span> : <span className="text-gray-500 italic">Umum / Default</span>}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${h.tipe_harga === 'Konsinyasi' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {h.tipe_harga}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-800">{formatCurrency(h.nominal)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleEditHarga(h)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleHapusHarga(h.id_harga)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900 transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4" /> Tambah Jenis Harga
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">Tutup</button>
        </div>
      </div>
    </div>
  );
}

// =======================================================
// MAIN COMPONENT (Default Export Berdasarkan Strukturmu)
// =======================================================
export default function Index({ produk }: Props) {
  // Local state diisi dengan initial data props dari parameter komponenmu
  const [daftarProduk, setDaftarProduk] = useState<Produk[]>(produk || []);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);
  const [modalHargaProduk, setModalHargaProduk] = useState<Produk | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setRefreshTrigger] = useState(0); 

  const [formData, setFormData] = useState({
    kode_produk: '',
    nama_produk: '',
    satuan_produk: ''
  });

  const countHargaTypes = (id_produk: number) => mockTabelHargaProduk.filter(h => h.id_produk === id_produk).length;

  const handleAdd = () => {
    setFormData({ kode_produk: '', nama_produk: '', satuan_produk: '' });
    setEditMode(false);
    setShowForm(true);
  };

  const handleEdit = (p: Produk) => {
    setFormData({ kode_produk: p.kode_produk, nama_produk: p.nama_produk, satuan_produk: p.satuan_produk });
    setSelectedProduk(p);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDetail = (p: Produk) => {
    setSelectedProduk(p);
    setShowDetail(true);
  };

  const handleDelete = (id_produk: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data produk ini?')) {
      setDaftarProduk(daftarProduk.filter(p => p.id_produk !== id_produk));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && selectedProduk) {
      setDaftarProduk(daftarProduk.map(p => p.id_produk === selectedProduk.id_produk ? { ...p, ...formData } : p));
    } else {
      const newProduk: Produk = { id_produk: Date.now(), ...formData };
      setDaftarProduk([...daftarProduk, newProduk]);
    }
    handleCancel();
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowDetail(false);
    setSelectedProduk(null);
    setFormData({ kode_produk: '', nama_produk: '', satuan_produk: '' });
  };

  const filteredProduk = daftarProduk.filter(p =>
    p.kode_produk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nama_produk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.satuan_produk?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // VIEW 1: Form Tambah/Edit Data
  if (showForm) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{editMode ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
          <p className="text-sm text-gray-500">Kelola master data produk sistem</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kode Produk *</label>
                <input
                  type="text" required value={formData.kode_produk}
                  onChange={(e) => setFormData({ ...formData, kode_produk: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="Contoh: PRD-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk *</label>
                <input
                  type="text" required value={formData.nama_produk}
                  onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="Nama produk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Satuan *</label>
                <input
                  type="text" required value={formData.satuan_produk}
                  onChange={(e) => setFormData({ ...formData, satuan_produk: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="Contoh: Pack, Pcs, Box"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
              <button type="submit" className="px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900 transition-colors">
                {editMode ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // VIEW 2: Detail Data Produk
  if (showDetail && selectedProduk) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detail Master Produk</h2>
            <p className="text-sm text-gray-500">Informasi lengkap data produk</p>
          </div>
          <button onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <X className="w-4 h-4" /> Tutup
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Kode Produk</label>
              <p className="text-gray-800 font-semibold text-lg">{selectedProduk.kode_produk}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Nama Produk</label>
              <p className="text-gray-800 font-semibold text-lg">{selectedProduk.nama_produk}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Satuan</label>
              <p className="text-gray-800 font-medium">{selectedProduk.satuan_produk}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Jumlah Varian Harga</label>
              <p className="text-gray-800 font-medium">{countHargaTypes(selectedProduk.id_produk)} jenis harga</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Tutup</button>
            <button onClick={() => { setShowDetail(false); handleEdit(selectedProduk); }} className="flex items-center gap-1.5 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700">
              <Pencil className="w-4 h-4" /> Edit Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VIEW MASTER UTAMA (Tabel Data dengan fungsionalitas kompleks)
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Produk</h1>
          <p className="text-sm text-gray-500">Kelola data produk dan pengaturan multi-harga</p>
        </div>
        <button onClick={handleAdd} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900 transition-colors shadow-sm desktop-btn">
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text" placeholder="Cari produk berdasarkan kode, nama, atau satuan..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
          />
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Kode</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Nama</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Satuan</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Daftar Harga</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProduk?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Tidak ada data produk ditemukan</td>
                </tr>
              ) : (
                filteredProduk?.map((item) => (
                  <tr key={item.id_produk} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.kode_produk}</td>
                    <td className="px-6 py-4 text-gray-700">{item.nama_produk}</td>
                    <td className="px-6 py-4 text-gray-600">{item.satuan_produk}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setModalHargaProduk(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-full text-xs font-semibold transition-colors"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {countHargaTypes(item.id_produk)} Jenis Harga
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleDetail(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Detail"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleEdit(item)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id_produk)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalHargaProduk && (
        <ModalDetailMultiHarga
          produkItem={modalHargaProduk}
          onClose={() => setModalHargaProduk(null)}
          onRefreshList={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}
    </div>
  );
}
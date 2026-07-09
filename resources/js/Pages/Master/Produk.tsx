import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, X, Tag, Filter, PlusCircle, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';

// =======================================================
// INTERFACES (Menyesuaikan Eager Loading Laravel Anda)
// =======================================================
interface THargaProduk {
  id_harga?: string;
  id_harga_produk?: string; // Menampung penamaan dari database asli
  kode_harga: string;
  id_produk: number;
  jenis_transaksi: string; 
  harga: number;           
}

interface Produk {
  id_produk: number;
  kode_produk: string;
  nama_produk: string;
  satuan_produk: string;
  harga_produk?: THargaProduk[];
}

interface Props {
  produk: Produk[];
}

interface ModalHargaProps {
  produkItem: Produk;
  hargaData: THargaProduk[];
  onClose: () => void;
  onRefreshList: () => void; 
}

// =======================================================
// KOMPONEN: MODAL DETAIL MULTI HARGA
// =======================================================
function ModalDetailMultiHarga({ produkItem, hargaData, onClose, onRefreshList }: ModalHargaProps) {
  const [filterJenis, setFilterJenis] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editPriceId, setEditPriceId] = useState<string | null>(null);
  
  const [formInput, setFormInput] = useState({
    kode_harga: '',
    jenis_transaksi: '',
    harga: ''
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const rows = hargaData.filter((h) => {
    if (filterJenis && h.jenis_transaksi !== filterJenis) return false;
    return true;
  });

  // Otomatis generate Kode Harga (HG-0X) saat form tambah dibuka
  const handleBukaFormTambah = () => {
    const nextNumber = hargaData.length + 1;
    const autoKode = `HG-${String(nextNumber).padStart(2, '0')}`;
    
    setFormInput({
      kode_harga: autoKode,
      jenis_transaksi: '',
      harga: ''
    });
    setEditPriceId(null);
    setShowForm(true);
  };

  const handleSimpanHarga = () => {
    if (!formInput.jenis_transaksi || !formInput.harga || !formInput.kode_harga) return;

    if (editPriceId) {
      router.post('/harga-produk', {
        id_harga: editPriceId,
        ...formInput
      }, {
        onSuccess: () => {
          handleCloseForm();
          onRefreshList();
        }
      });
    } else {
      router.post('/harga-produk', {
        id_produk: produkItem.id_produk,
        ...formInput
      }, {
        onSuccess: () => {
          handleCloseForm();
          onRefreshList();
        }
      });
    }
  };

  const handleEditHarga = (hargaItem: THargaProduk) => {
    const targetId = hargaItem.id_harga_produk || hargaItem.id_harga || '';
    setFormInput({
      kode_harga: hargaItem.kode_harga,
      jenis_transaksi: hargaItem.jenis_transaksi,
      harga: hargaItem.harga.toString()
    });
    setEditPriceId(targetId);
    setShowForm(true);
  };

  const handleHapusHarga = (hargaItem: THargaProduk) => {
    const targetId = hargaItem.id_harga_produk || hargaItem.id_harga;
    if (!targetId) return;

    if (window.confirm('Apakah Anda yakin ingin menghapus varian harga ini?')) {
      router.delete(`/harga-produk/${targetId}`, {
        onSuccess: () => {
          onRefreshList();
        }
      });
    }
  };

  const handleCloseForm = () => {
    setFormInput({ kode_harga: '', jenis_transaksi: '', harga: '' });
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 font-semibold focus:outline-none"
                readOnly // Dibuat readOnly karena sudah auto-increment teratur
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Transaksi *</label>
              <select
                value={formInput.jenis_transaksi}
                onChange={e => setFormInput({ ...formInput, jenis_transaksi: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 bg-white"
              >
                <option value="">Pilih Tipe</option>
                <option value="Penjualan Langsung">Penjualan Langsung</option>
                <option value="Konsinyasi">Konsinyasi</option>
                <option value="Maklon">Maklon</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nominal Harga (Rp) *</label>
              <input
                type="number"
                value={formInput.harga}
                onChange={e => setFormInput({ ...formInput, harga: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button onClick={handleCloseForm} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
            <button onClick={handleSimpanHarga} disabled={!formInput.jenis_transaksi || !formInput.harga || !formInput.kode_harga} className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900 disabled:opacity-50 transition-colors">
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
            <h3 className="text-lg font-bold text-red-800">Detail Multi-Harga (Per Transaksi)</h3>
            <p className="text-sm text-gray-500 mt-0.5">{produkItem.kode_produk} — {produkItem.nama_produk}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-gray-100 flex justify-end">
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 bg-white"
            >
              <option value="">Semua Tipe</option>
              <option value="Penjualan Langsung">Penjualan Langsung</option>
              <option value="Konsinyasi">Konsinyasi</option>
              <option value="Maklon">Maklon</option>
            </select>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kode Harga</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipe Transaksi</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Nominal</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Tidak ada data harga transaksi</td>
                </tr>
              ) : (
                rows.map((h, index) => (
                  <tr key={h.id_harga_produk || h.id_harga || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-800">{h.kode_harga}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        h.jenis_transaksi === 'Konsinyasi' ? 'bg-amber-100 text-amber-700' : 
                        h.jenis_transaksi === 'Maklon' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {h.jenis_transaksi}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-800">{formatCurrency(h.harga)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleEditHarga(h)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleHapusHarga(h)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <button onClick={handleBukaFormTambah} className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900 transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4" /> Tambah Tipe Harga
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">Tutup</button>
        </div>
      </div>
    </div>
  );
}

// =======================================================
// MAIN COMPONENT
// =======================================================
export default function Index({ produk = [] }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);
  const [modalHargaProduk, setModalHargaProduk] = useState<Produk | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    kode_produk: '',
    nama_produk: '',
    satuan_produk: ''
  });

  // Efek memantau update props real-time dari Laravel Inertia untuk modal harga
  useEffect(() => {
    if (modalHargaProduk) {
      const updated = produk.find(p => p.id_produk === modalHargaProduk.id_produk);
      if (updated) setModalHargaProduk(updated);
    }
  }, [produk]);

  // Otomatis mencari urutan terbesar kode produk (PRD-00X) saat klik tambah
  const handleAdd = () => {
    let nextNum = 1;
    if (produk.length > 0) {
      const codes = produk
        .map(p => {
          const match = p.kode_produk?.match(/\d+/);
          return match ? parseInt(match[0], 10) : 0;
        })
        .filter(num => !isNaN(num));
      if (codes.length > 0) {
        nextNum = Math.max(...codes) + 1;
      }
    }
    const autoKodeProduk = `PRD-${String(nextNum).padStart(3, '0')}`;

    setFormData({ kode_produk: autoKodeProduk, nama_produk: '', satuan_produk: '' });
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

  const handleCancel = () => {
    setShowForm(false);
    setShowDetail(false);
    setSelectedProduk(null);
    setFormData({ kode_produk: '', nama_produk: '', satuan_produk: '' });
  };

  const handleSimpanProduk = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && selectedProduk) {
      router.put(`/produk/${selectedProduk.id_produk}`, formData, {
        onSuccess: () => handleCancel()
      });
    } else {
      router.post('/produk', formData, {
        onSuccess: () => handleCancel()
      });
    }
  };

  const handleHapusProduk = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini beserta seluruh varian harganya?')) {
      router.delete(`/produk/${id}`);
    }
  };

  const filteredProduk = produk.filter(p =>
    p.kode_produk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nama_produk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.satuan_produk?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const syncModalData = () => {
    if (modalHargaProduk) {
      const updated = produk.find(p => p.id_produk === modalHargaProduk.id_produk);
      if (updated) setModalHargaProduk(updated);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* RENDER FORM PRODUK */}
      {showForm && (
        <div className="mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{editMode ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            <p className="text-sm text-gray-500">Kelola master data produk sistem</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <form onSubmit={handleSimpanProduk} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kode Produk *</label>
                  <input
                    type="text" required value={formData.kode_produk}
                    onChange={(e) => setFormData({ ...formData, kode_produk: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-50 font-semibold text-sm"
                    placeholder="Contoh: PRD-001"
                    readOnly
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
                  {editMode ? 'Update Data' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER DETAIL PRODUK */}
      {showDetail && selectedProduk && (
        <div className="mb-6">
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
                <p className="text-gray-800 font-medium">{(selectedProduk.harga_produk || []).length} tipe transaksi</p>
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
      )}

      {/* RENDER UTAMA: LIST TABEL PRODUK */}
      {!showForm && !showDetail && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Produk</h1>
              <p className="text-sm text-gray-500">Kelola data produk dan pengaturan harga per jenis transaksi</p>
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
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">Varian Harga</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700 w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProduk?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Tidak ada data produk ditemukan</td>
                    </tr>
                  ) : (
                    filteredProduk?.map((item) => {
                      const currentHargaList = item.harga_produk || [];
                      return (
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
                              {currentHargaList.length} Tipe Harga
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => handleDetail(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Detail"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => handleEdit(item)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => handleHapusProduk(item.id_produk)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* RENDER MODAL DETAIL MULTI HARGA */}
      {modalHargaProduk && (
        <ModalDetailMultiHarga
          produkItem={modalHargaProduk}
          hargaData={produk.find(p => p.id_produk === modalHargaProduk.id_produk)?.harga_produk || []}
          onClose={() => setModalHargaProduk(null)}
          onRefreshList={syncModalData}
        />
      )}
    </div>
  );
}
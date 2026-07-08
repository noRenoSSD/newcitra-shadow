import React from 'react';
import { useState, useEffect } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import { Plus, Search, Eye, Pencil, Trash2, X, FileText, Truck, ArrowLeft } from 'lucide-react';

// ==================== INTERFACES & TYPES ====================
interface TPesananDetail {
  id_pesanan_detail?: number;
  id_pesanan?: number;
  id_produk: number;
  id_harga: number;
  nama_produk: string; 
  harga: number;       
  qty: number;
  subtotal: number;
}

interface TPesanan {
  id_pesanan: number;
  no_pesanan: string;
  tgl_pesanan: string;
  id_mitra: number;
  nama_mitra?: string; 
  jenis_transaksi: 'Penjualan Langsung' | 'Maklon';
  alamat: string;
  total_harga: number;
  items: TPesananDetail[];
  status_surat_jalan?: boolean; 
  status: 'Selesai' | 'Diproses';
  sudah_ada_invoice: boolean;
}

interface MasterMitra {
  id_mitra: number;
  nama_mitra: string;
  alamat: string; 
}

interface MasterHarga {
  id_harga: number;
  jenis_transaksi: string;
  harga: number;
}

interface MasterProduk {
  id_produk: number;
  nama_produk: string;
  harga_produk: MasterHarga[];
}

interface SalesOrderProps {
  pesanan?: TPesanan[];
  mitraList?: MasterMitra[];
  produkList?: MasterProduk[];
  nextNoPesanan?: string;
}

export default function SalesOrder({ pesanan = [], mitraList = [], produkList = [], nextNoPesanan = '' }: SalesOrderProps) {
  // ==================== STATES SYSTEM ====================
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TPesanan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { flash } = usePage().props as any;

  useEffect(() => {
    if (flash?.error) {
      alert(flash.error); 
    }
  }, [flash?.error]);
  
  // State Item Builder Komoditas
  const [localItems, setLocalItems] = useState<TPesananDetail[]>([]);
  const [selectedProdukId, setSelectedProdukId] = useState('');
  const [inputQty, setInputQty] = useState('');
  const [currentHargaObj, setCurrentHargaObj] = useState<{ id_harga: number; harga: number }>({ id_harga: 0, harga: 0 });

  // ==================== INERTIA HOOK FORM ====================
  const { data, setData, post, put, reset, errors, processing } = useForm({
    no_pesanan: nextNoPesanan || '',
    tgl_pesanan: new Date().toISOString().split('T')[0],
    id_mitra: '',
    alamat: '',
    jenis_transaksi: 'Penjualan Langsung',
    total_harga: 0,
    items: [] as TPesananDetail[]
  });

  // Sinkronisasi item ke form payload utama
  useEffect(() => {
    const total = (localItems || []).reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
    setData(prev => ({
      ...prev,
      items: localItems,
      total_harga: total
    }));
  }, [localItems]);

  const resolvePrice = (idProduk: any, jenisTransaksi: string) => {
    const prod = (produkList || []).find(p => String(p.id_produk) === String(idProduk));
    if (prod && prod.harga_produk) {
      const priceObj = prod.harga_produk.find(h => h.jenis_transaksi === jenisTransaksi);
      return priceObj ? { id_harga: priceObj.id_harga, harga: Number(priceObj.harga) } : { id_harga: 0, harga: 0 };
    }
    return { id_harga: 0, harga: 0 };
  };

  const clearProductInputs = () => {
    setSelectedProdukId('');
    setInputQty('');
    setCurrentHargaObj({ id_harga: 0, harga: 0 });
  };

  // ==================== HANDLERS ====================
  const handleAdd = () => {
    setLocalItems([]);
    clearProductInputs();
    setData({
      no_pesanan: nextNoPesanan || '',
      tgl_pesanan: new Date().toISOString().split('T')[0],
      id_mitra: '',
      alamat: '',
      jenis_transaksi: 'Penjualan Langsung',
      total_harga: 0,
      items: []
    });
    setEditMode(false);
    setShowForm(true);
    setShowDetail(false);
  };

  const handleEdit = (item: TPesanan) => {
    setData({
      no_pesanan: item.no_pesanan || '',
      tgl_pesanan: item.tgl_pesanan || '',
      id_mitra: item.id_mitra ? item.id_mitra.toString() : '',
      alamat: item.alamat || '',
      jenis_transaksi: item.jenis_transaksi || 'Penjualan Langsung',
      total_harga: Number(item.total_harga) || 0,
      items: item.items || []
    });
    setLocalItems(item.items || []);
    clearProductInputs();
    setSelectedOrder(item);
    setEditMode(true);
    setShowForm(true);
    setShowDetail(false);
  };

  const handleDetail = (item: TPesanan) => {
    setSelectedOrder(item);
    setShowDetail(true);
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pesanan penjualan ini?')) {
      router.delete(`/pesanan/${id}`);
    }
  };

  const handleJenisTransaksiChange = (jenis: string) => {
    const updatedItems = (localItems || []).map(item => {
      const pObj = resolvePrice(item.id_produk, jenis);
      return {
        ...item,
        id_harga: pObj.id_harga,
        harga: pObj.harga,
        subtotal: (Number(item.qty) || 0) * pObj.harga
      };
    });
    setLocalItems(updatedItems);

    if (selectedProdukId) {
      setCurrentHargaObj(resolvePrice(selectedProdukId, jenis));
    }
    setData(prev => ({ ...prev, jenis_transaksi: jenis as any }));
  };

  const handleMitraChange = (idMitraStr: string) => {
    const target = (mitraList || []).find(m => String(m.id_mitra) === idMitraStr);
    setData(prev => ({
      ...prev,
      id_mitra: idMitraStr,
      alamat: target ? target.alamat : ''
    }));
  };

  const handleProdukChange = (idProdukStr: string) => {
    setSelectedProdukId(idProdukStr);
    if (!idProdukStr) {
      setCurrentHargaObj({ id_harga: 0, harga: 0 });
      return;
    }
    setCurrentHargaObj(resolvePrice(idProdukStr, data.jenis_transaksi));
  };

  const handleAddItem = () => {
    if (!selectedProdukId || !inputQty || currentHargaObj.harga <= 0) {
      alert('Mohon pilih produk dan isi kuantitas dengan benar.');
      return;
    }

    const qty = parseFloat(inputQty);
    if (qty <= 0) return;

    const id_produk = Number(selectedProdukId);
    
    const prodObj = (produkList || []).find(p => String(p.id_produk) === selectedProdukId);
    const existingIndex = localItems.findIndex(item => String(item.id_produk) === selectedProdukId);

    if (existingIndex > -1) {
      const updated = [...localItems];
      updated[existingIndex].qty += qty;
      updated[existingIndex].subtotal = updated[existingIndex].qty * updated[existingIndex].harga;
      setLocalItems(updated);
    } else {
      setLocalItems([...localItems, {
        id_produk,
        id_harga: currentHargaObj.id_harga,
        nama_produk: prodObj ? prodObj.nama_produk : 'Produk Tidak Diketahui',
        harga: currentHargaObj.harga,
        qty,
        subtotal: qty * currentHargaObj.harga
      }]);
    }
    clearProductInputs();
  };

  const handleRemoveItem = (index: number) => {
    setLocalItems(localItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localItems.length === 0) {
      alert('Tambahkan minimal 1 item produk terlebih dahulu.');
      return;
    }

    const payload = {
      nomorSO: data.no_pesanan,
      tanggalSO: data.tgl_pesanan,
      idMitra: Number(data.id_mitra),
      jenisTransaksi: data.jenis_transaksi,
      alamat: data.alamat,
      items: localItems.map(item => ({
        id_produk: item.id_produk,
        id_harga: item.id_harga,
        harga: item.harga,
        jumlah: item.qty 
      }))
    };

    if (editMode && selectedOrder) {
      router.put(`/pesanan/${selectedOrder.id_pesanan}`, payload, { onSuccess: () => handleCancel() });
    } else {
      router.post('/pesanan', payload, { onSuccess: () => handleCancel() });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowDetail(false);
    setSelectedOrder(null);
    setLocalItems([]);
    clearProductInputs();
    reset();
  };

  const filteredOrders = (pesanan || []).filter(item =>
    item.no_pesanan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama_mitra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jenis_transaksi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* 1. KONDISI FORM VIEW */}
      {showForm && (
        <div className="block">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{editMode ? 'Edit Pesanan Penjualan' : 'Tambah Pesanan Baru'}</h1>
            <p className="text-sm text-gray-500">Kelola data pemesanan perusahaan</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. Pesanan *</label>
                  <input
                    type="text"
                    disabled
                    value={data.no_pesanan}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pesanan *</label>
                  <input
                    type="date"
                    required
                    value={data.tgl_pesanan}
                    onChange={(e) => setData('tgl_pesanan', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Transaksi *</label>
                  <select
                    required
                    value={data.jenis_transaksi}
                    onChange={(e) => handleJenisTransaksiChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 bg-white"
                  >
                    <option value="Penjualan Langsung">Penjualan Langsung</option>
                    <option value="Maklon">Maklon</option>
                    <option value="Konsinyasi">Konsinyasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pelanggan / Mitra *</label>
                  <select
                    required
                    value={data.id_mitra}
                    onChange={(e) => handleMitraChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 bg-white"
                  >
                    <option value="">Pilih Pelanggan</option>
                    {(mitraList || []).map((m) => (
                      <option key={m.id_mitra} value={m.id_mitra}>{m.nama_mitra}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Pengiriman</label>
                  <input
                    type="text"
                    readOnly
                    value={data.alamat}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 outline-none"
                    placeholder="Alamat mitra otomatis terisi"
                  />
                </div>
              </div>

              {/* BAR TABEL BUILDER SELECTION */}
              <div className="border-t border-gray-200 pt-6 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">
                  Tambah Produk <span className="text-red-800 font-medium">({data.jenis_transaksi})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Produk</label>
                    <select
                      value={selectedProdukId}
                      onChange={(e) => handleProdukChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none"
                    >
                      <option value="">Pilih Produk</option>
                      {(produkList || []).map((p) => (
                        <option key={p.id_produk} value={p.id_produk}>{p.nama_produk}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={inputQty}
                      onChange={(e) => setInputQty(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Harga</label>
                    <input
                      type="text"
                      disabled
                      value={currentHargaObj.harga > 0 ? `Rp ${currentHargaObj.harga.toLocaleString('id-ID')}` : 'Rp 0'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Sisipkan Item
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl mb-4">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                        <th className="px-4 py-3">Nama Produk</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Harga Satuan</th>
                        <th className="px-4 py-3">Subtotal</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {localItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-gray-400">Belum ada produk yang ditambahkan</td>
                        </tr>
                      ) : (
                        localItems.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{item.nama_produk}</td>
                            <td className="px-4 py-3">{item.qty}</td>
                            <td className="px-4 py-3">Rp {(Number(item.harga) || 0).toLocaleString('id-ID')}</td>
                            <td className="px-4 py-3 font-semibold">Rp {(Number(item.subtotal) || 0).toLocaleString('id-ID')}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mb-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full md:w-80">
                    <div className="flex justify-between items-center font-bold text-gray-900">
                      <span>Grand Total:</span>
                      <span className="text-red-900 text-lg">Rp {(Number(data.total_harga) || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
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
      )}

      {/* 2. KONDISI DETAIL VIEW */}
      {showDetail && selectedOrder && (
        <div className="block animate-fade-in">
          {/* Header */}
          <div className="mb-6">
            {/* <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar
            </button> */}
            <h1 className="text-3xl font-bold text-gray-900">Detail Pesanan Penjualan</h1>
            <p className="text-red-800 font-semibold mt-1">{selectedOrder.no_pesanan}</p>
          </div>

          {/* Detail Card Master Transaksi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-400">No. Order / No. Pesanan</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">{selectedOrder.no_pesanan}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400">Tanggal Transaksi</p>
                <p className="text-base font-medium text-gray-900 mt-0.5">
                  {new Date(selectedOrder.tgl_pesanan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400">Tipe / Jenis Transaksi</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">{selectedOrder.jenis_transaksi}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400">Nama Pelanggan / Mitra</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">{selectedOrder.nama_mitra || 'Tidak Diketahui'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-400">Alamat Pengiriman</p>
                <p className="text-base font-medium text-gray-900 mt-0.5">{selectedOrder.alamat || '-'}</p>
              </div>
            </div>
          </div>

          {/* Items Card Rincian Barang */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-bold text-gray-900">Rincian Item Produk Terdaftar</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-600">
                  <tr>
                    <th className="px-6 py-3">Nama Produk</th>
                    <th className="px-6 py-3 text-center">Kuantitas</th>
                    <th className="px-6 py-3 text-right">Harga Bersih</th>
                    <th className="px-6 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-700 bg-white">
                  {(selectedOrder.items || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">
                        Tidak ada item produk di dalam dokumen ini
                      </td>
                    </tr>
                  ) : (
                    (selectedOrder.items || []).map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.nama_produk || 'Produk Tidak Diketahui'}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">{item.qty} Pcs</td>
                        <td className="px-6 py-4 text-right">Rp {(Number(item.harga) || 0).toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          Rp {(Number(item.subtotal) || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bagian Bawah Form Aksi & Grand Total Box */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            {/* Tombol Aksi Kiri */}
            <div className="flex gap-2">
              {/* <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors bg-white shadow-sm"
              >
                Kembali ke Daftar
              </button> */}
            </div>
            
            {/* Kotak Total Tagihan + Tombol Edit Order (Di bawahnya) */}
        </div>

          {/* Bagian Bawah Form Aksi & Grand Total Box */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            {/* Tombol Aksi Kiri (Berjejer di pojok kiri bawah) */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors bg-white shadow-sm"
              >
                Kembali ke Daftar
              </button>

              <button
                onClick={() => handleEdit(selectedOrder)}
                className="w-max inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <Pencil className="w-4 h-4" /> Edit Order Pesanan
              </button>
            </div>
            
            {/* Kotak Total Tagihan (Tetap di pojok kanan bawah) */}
            <div className="w-full md:w-auto flex flex-col gap-3 items-end">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full md:w-80">
                <div className="flex justify-between items-center font-bold text-gray-900">
                  <span>Total Nilai Tagihan:</span>
                  <span className="text-xl text-red-800">Rp {(Number(selectedOrder.total_harga) || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. UTAMA: TABLE LIST VIEW */}
      {!showForm && !showDetail && (
        <div className="block">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-red-800">Pesanan Penjualan</h1>
              <p className="text-sm text-gray-500">Kelola data pesanan penjualan pelanggan</p>
            </div>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-800 hover:bg-red-900 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" /> Tambah Pesanan
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nomor pesanan, pelanggan atau tipe transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 tracking-wider">
                    <th className="px-6 py-3">No. Order</th>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Tipe Transaksi</th>
                    <th className="px-6 py-3">Pelanggan</th>
                    <th className="px-6 py-3 text-right">Total Transaksi</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">Tidak ada data dokumen pesanan penjualan</td>
                    </tr>
                  ) : (
                    filteredOrders.map((item) => (
                      <tr key={item.id_pesanan} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{item.no_pesanan}</td>
                        <td className="px-6 py-4">{item.tgl_pesanan}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            {item.jenis_transaksi}
                          </span>
                        </td>
                        <td className="px-6 py-4">{item.nama_mitra || "Tidak Diketahui"}</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          Rp {(Number(item.total_harga) || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            (item as any).sudah_ada_invoice
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              (item as any).sudah_ada_invoice ? 'bg-emerald-500' : 'bg-amber-500'
                            }`} />
                            {(item as any).sudah_ada_invoice ? 'Selesai' : 'Diproses'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleDetail(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                              title="Ubah Data"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id_pesanan)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => router.get(`/invoice/create?so_id=${item.id_pesanan}`)}
                              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                              title="Faktur Tagihan"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                if (item.status_surat_jalan) {
                                  alert('⚠️ Gagal: Surat jalan untuk pesanan ini sudah pernah digenerate!');
                                } else {
                                  router.get(`/delivery-order/create?so_id=${item.id_pesanan}`);
                                }
                              }}
                              className={`p-1.5 rounded-md transition-colors ${
                                item.status_surat_jalan 
                                  ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                                  : 'text-purple-600 hover:bg-purple-50'
                              }`}
                              title={item.status_surat_jalan ? "Surat Jalan Sudah Dibuat" : "Surat Jalan"}
                              disabled={item.status_surat_jalan}
                            >
                              <Truck className="w-4 h-4" />
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
      )}
    </div>
  );
}
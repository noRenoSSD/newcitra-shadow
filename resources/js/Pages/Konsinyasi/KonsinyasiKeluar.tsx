import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Eye, Pencil, Trash2, Plus, ArrowLeft, Search, Truck } from 'lucide-react';
import KonsinyasiKeluarDetail from './KonsinyasiKeluarDetail';
import SuratJalanForm from '@/Pages/Penjualan/SuratJalanForm'; 

interface Produk {
  id_produk: number;
  kode_produk: string;
  nama_produk: string;
  satuan: string;
  harga_konsinyasi: number;
  id_harga: number;
}

interface MitraKonsinyasi {
  id_mitra: number;
  kode_mitra: string;
  nama_toko: string;
  alamat: string;
}

interface CartItem {
  id_produk: number;
  kode_produk: string;
  nama_produk: string;
  satuan: string;
  harga_konsinyasi: number; // Diseragamkan menjadi penampung nilai snapshot utama
  qty: number;
  id_harga: number;
}

interface KonsinyasiKeluarItem {
  id_konsinyasi_keluar: number;
  no_order: string;
  tgl_keluar: string;
  id_mitra: number;
  nama_toko: string;
  alamat: string;
  keterangan?: string;
  status: 'Draf' | 'Surat Jalan' | 'Selesai';
  items: {
    id_produk: number;
    nama_produk: string;
    qty: number; // SINKRONISASI: Menggunakan 'qty' murni sesuai database
    harga_titip: number;
    id_harga: number;
  }[];
}

interface KonsinyasiKeluarProps {
  dataMitra?: MitraKonsinyasi[];
  dataProduk?: Produk[];
  dataKonsinyasi?: KonsinyasiKeluarItem[];
  nextNoKonsinyasi?: string;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const formatTanggalIndo = (dateString: string) => {
  if (!dateString) return '';
  const [tahun, bulan, tanggal] = dateString.split('-');
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${parseInt(tanggal, 10)} ${namaBulan[parseInt(bulan, 10) - 1]} ${tahun}`;
};

export default function KonsinyasiKeluar({ dataMitra = [], dataProduk = [], dataKonsinyasi = [], nextNoKonsinyasi = '' }: KonsinyasiKeluarProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingDetail, setViewingDetail] = useState<KonsinyasiKeluarItem | null>(null);
  const [activeSuratJalan, setActiveSuratJalan] = useState<any | null>(null); 
  const [searchTerm, setSearchTerm] = useState('');

  const [noOrder, setNoOrder] = useState('');
  const [tanggalKeluar, setTanggalKeluar] = useState('');
  const [selectedMitraId, setSelectedMitraId] = useState('');
  const [selectedAlamat, setSelectedAlamat] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const [selectedProdukId, setSelectedProdukId] = useState('');
  const [inputQty, setInputQty] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleOpenCreateForm = () => {
    setNoOrder(nextNoKonsinyasi || `CSG-OUT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`);
    setTanggalKeluar(new Date().toISOString().split('T')[0]);
    setSelectedMitraId('');
    setSelectedAlamat('');
    setKeterangan('');
    setCart([]);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleMitraChange = (id: string) => {
    setSelectedMitraId(id);
    const mitra = dataMitra.find(m => m.id_mitra === Number(id));
    setSelectedAlamat(mitra ? mitra.alamat : '');
  };

  const handleAddItemToCart = () => {
    if (!selectedProdukId || !inputQty || Number(inputQty) <= 0) return;
    
    const prod = dataProduk.find(p => p.id_produk === Number(selectedProdukId));
    if (!prod) return;

    const existingIndex = cart.findIndex(item => item.id_produk === prod.id_produk);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].qty += Number(inputQty);
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        id_produk: prod.id_produk,
        kode_produk: prod.kode_produk,
        nama_produk: prod.nama_produk,
        satuan: prod.satuan,
        harga_konsinyasi: prod.harga_konsinyasi,
        qty: Number(inputQty),
        id_harga: prod.id_harga
      }]);
    }
    setSelectedProdukId('');
    setInputQty('');
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(cart.filter(item => item.id_produk !== id));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMitraId || cart.length === 0) {
      alert('Pilih mitra dan masukkan minimal 1 produk terlebih dahulu!');
      return;
    }

    const payload = {
      no_order: noOrder,
      tgl_keluar: tanggalKeluar,
      id_mitra: Number(selectedMitraId),
      keterangan: keterangan,
      items: cart.map(item => ({
        id_produk: item.id_produk,
        qty: item.qty, // Memastikan terkirim sebagai 'qty' murni
        harga_titip: item.harga_konsinyasi,
        id_harga: item.id_harga 
      }))
    };

    if (editingId) {
      router.put(`/konsinyasi-keluar/update/${editingId}`, payload, {
        onSuccess: () => {
        //   alert('Dokumen berhasil diubah!');
          setIsFormOpen(false);
        },
        onError: (errors) => {
          alert('Gagal mengubah dokumen: ' + Object.values(errors).join(', '));
        }
      });
    } else {
      router.post('/konsinyasi-keluar/store', payload, {
        onSuccess: () => {
        //   alert('Dokumen konsinyasi berhasil dibuat!');
          setIsFormOpen(false);
        },
        onError: (errors) => {
          alert('Gagal menyimpan dokumen: ' + Object.values(errors).join(', '));
        }
      });
    }
  };

  const handleEdit = (k: KonsinyasiKeluarItem) => {
    setEditingId(k.id_konsinyasi_keluar);
    setNoOrder(k.no_order);
    setTanggalKeluar(k.tgl_keluar);
    setSelectedMitraId(k.id_mitra.toString());
    setSelectedAlamat(k.alamat);
    setKeterangan(k.keterangan || '');
    
    const dbCart = k.items.map(item => {
      const pData = dataProduk.find(p => p.id_produk === item.id_produk);
      return {
        id_produk: item.id_produk,
        kode_produk: pData?.kode_produk || '',
        nama_produk: item.nama_produk,
        satuan: pData?.satuan || 'Pcs',
        harga_konsinyasi: item.harga_titip, // PERBAIKAN: Disamakan agar terender sempurna di tabel draf
        qty: item.qty, // Menggunakan properti qty murni database
        id_harga: item.id_harga || pData?.id_harga || 0 
      };
    });
    setCart(dbCart);
    setIsFormOpen(true);
  };

  const handleGenerateSuratJalan = (k: KonsinyasiKeluarItem) => {
    setActiveSuratJalan({
      id_konsinyasi: k.id_konsinyasi_keluar,
      no_order: k.no_order,
      nama_toko: k.nama_toko,
      alamat: k.alamat,
      tgl_keluar: k.tgl_keluar,
      keterangan: k.keterangan || '',
      items: k.items
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus draf dokumen konsinyasi ini?')) {
      router.post(`/konsinyasi-keluar/delete/${id}`, {}, {
        onSuccess: () => alert('Dokumen berhasil dihapus!')
      });
    }
  };

  const filteredKonsinyasis = dataKonsinyasi.filter(k =>
    k.no_order.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.nama_toko.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewingDetail) {
    return (
      <KonsinyasiKeluarDetail 
        konsinyasi={viewingDetail} 
        dataProduk={dataProduk}
        onBack={() => setViewingDetail(null)} 
      />
    );
  }

  if (activeSuratJalan) {
    return (
      <SuratJalanForm 
        konsinyasi={{
          id_konsinyasi: activeSuratJalan.id_konsinyasi,
          no_order: activeSuratJalan.no_order,
          nama_toko: activeSuratJalan.nama_toko,
          keterangan: activeSuratJalan.keterangan,
        } as any} 
        onBack={() => setActiveSuratJalan(null)} 
      />
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      {isFormOpen ? (
        <form onSubmit={handleSubmitOrder} className="space-y-6">
          <div className="flex flex-row items-center gap-4 text-red-800">
            <button type="button" onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-200/60 rounded-xl transition-colors">
              <ArrowLeft className="w-7 h-7" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {editingId ? 'Edit Dokumen Konsinyasi Keluar' : 'Buat Dokumen Konsinyasi Baru'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Isi rincian informasi produk menggunakan Harga Konsinyasi khusus.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border-b border-gray-100 pb-5">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">No. Konsinyasi Keluar</label>
                <input type="text" value={noOrder} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Tanggal Keluar *</label>
                <input type="date" value={tanggalKeluar} onChange={e => setTanggalKeluar(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Pilih Toko Mitra Penerima *</label>
                <select value={selectedMitraId} onChange={e => handleMitraChange(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">-- Pilih Toko Mitra --</option>
                  {dataMitra.map(m => (
                    <option key={m.id_mitra} value={m.id_mitra}>{m.kode_mitra} - {m.nama_toko}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Alamat Kirim (Otomatis)</label>
                <input type="text" value={selectedAlamat} readOnly placeholder="Alamat terisi setelah memilih mitra" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Input Baris Produk</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Produk</label>
                  <select 
                    value={selectedProdukId} 
                    onChange={e => setSelectedProdukId(e.target.value)} 
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-red-800"
                  >
                    <option value="">Pilih Produk</option>
                    {dataProduk.map(p => (
                      <option key={p.id_produk} value={p.id_produk}>{p.nama_produk}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Harga Konsinyasi</label>
                  <input 
                    type="text" 
                    readOnly
                    value={selectedProdukId ? formatCurrency(dataProduk.find(p => p.id_produk === Number(selectedProdukId))?.harga_konsinyasi || 0) : ''} 
                    placeholder="Rp 0" 
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-100 font-medium text-gray-700 focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Qty</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={inputQty} 
                    onChange={e => setInputQty(e.target.value)} 
                    placeholder="0" 
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-red-800" 
                  />
                </div>

                <div className="flex items-end">
                  <button 
                    type="button" 
                    onClick={handleAddItemToCart} 
                    className="w-full bg-red-800 hover:bg-red-900 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
                  >
                    Tambah Item
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mt-6">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 font-semibold text-sm border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 w-36">Kode</th>
                  <th className="px-6 py-3">Nama Produk</th>
                  <th className="px-6 py-3 text-right">Harga Konsinyasi</th>
                  <th className="px-6 py-3 text-center w-28">Qty</th>
                  <th className="px-6 py-3 text-right">Subtotal</th>
                  <th className="px-6 py-3 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-600">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">Belum ada produk dalam draf titipan ini</td>
                  </tr>
                ) : (
                  cart.map((item) => (
                    <tr key={item.id_produk} className="hover:bg-gray-50/70">
                      <td className="px-6 py-3 text-xs font-semibold text-gray-500">{item.kode_produk}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">{item.nama_produk}</td>
                      <td className="px-6 py-3 text-right text-gray-900 font-medium">{formatCurrency(item.harga_konsinyasi)}</td>
                      <td className="px-6 py-3 text-center font-bold">{item.qty} {item.satuan}</td>
                      <td className="px-6 py-3 text-right font-bold text-gray-900">{formatCurrency(item.harga_konsinyasi * item.qty)}</td>
                      <td className="px-6 py-3 text-center">
                        <button type="button" onClick={() => handleRemoveFromCart(item.id_produk)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Hapus baris">
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Keterangan / Catatan Dokumen</label>
            <textarea value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Tulis catatan di sini..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" rows={2} />
          </div>

          <div className="flex justify-end mb-6 mt-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full md:w-80">
              <div className="flex justify-between items-center font-bold text-gray-900">
                <span className="text-sm">Grand Total:</span>
                <span className="text-red-900 text-lg">
                  {formatCurrency(cart.reduce((sum, item) => sum + (item.harga_konsinyasi * item.qty), 0))}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
            <button type="submit" disabled={cart.length === 0} className="px-4 py-2 bg-red-900 hover:bg-red-950 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">{editingId ? 'Update' : 'Simpan'}</button>
          </div>
        </form>
      ) : (
        <>
          <div className="mb-6 flex flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-red-800 tracking-tight">Daftar Produk Konsinyasi Keluar</h1>
              <p className="text-sm text-gray-500 mt-1 hidden sm:block">Kelola distribusi dan pemantauan barang titipan toko menggunakan Harga Konsinyasi.</p>
            </div>
            <button onClick={handleOpenCreateForm} className="bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
              <Plus className="w-5 h-5" /> Tambah Konsinyasi Keluar
            </button>
          </div>

          <div className="bg-white p-6 space-y-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </span>
              <input type="text" placeholder="Cari nomor order konsinyasi atau nama mitra..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 shadow-sm text-gray-800" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-gray-100 text-gray-700 font-semibold text-sm">
                  <tr>
                    <th className="px-6 py-4">No. Konsinyasi</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Toko Mitra</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center w-40">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-700">
                  {filteredKonsinyasis.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400 italic">Tidak ada data konsinyasi keluar</td>
                    </tr>
                  ) : (
                    filteredKonsinyasis.map((k) => (
                      <tr key={k.id_konsinyasi_keluar} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-800">{k.no_order}</td>
                        <td className="px-6 py-4 text-gray-600">{formatTanggalIndo(k.tgl_keluar)}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{k.nama_toko}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            k.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                            k.status === 'Surat Jalan' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {k.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setViewingDetail(k)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg hover:text-gray-900 transition-colors" title="Lihat Detail"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => handleEdit(k)} disabled={k.status !== 'Draf'} className="p-1.5 text-red-600 hover:bg-gray-100 rounded-lg disabled:opacity-30" title="Edit"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(k.id_konsinyasi_keluar)} disabled={k.status !== 'Draf'} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                            <button onClick={() => handleGenerateSuratJalan(k)} disabled={k.status !== 'Draf'} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-30" title="Generate Surat Jalan"><Truck className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
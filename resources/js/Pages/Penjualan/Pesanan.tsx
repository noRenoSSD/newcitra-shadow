import React, { useState, useEffect } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import { Plus, Search, Eye, Pencil, Trash2, FileText, Truck, ArrowLeft } from 'lucide-react';

interface TPesananDetail {
  id_pesanan_detail?: number;
  id_pesanan?: number;
  id_produk: number;
  id_harga: number;
  kode_produk?: string;
  satuan_produk?: string; // Penambahan properti kode produk
  nama_produk: string; 
  harga: number;       
  qty: number;
  diskon: number; 
  subtotal: number;      
}

interface TPesanan {
  id_pesanan: number;
  no_pesanan: string;
  tgl_pesanan: string;
  id_mitra: number;
  nama_mitra?: string; 
  jenis_transaksi: 'Penjualan Langsung' | 'Maklon' | 'Konsinyasi';
  alamat: string;
  total_diskon: number; 
  total_harga: number;  
  catatan?: string;
  items: TPesananDetail[];
  status_surat_jalan?: boolean; 
  status: 'Selesai' | 'Diproses';
  sudah_ada_invoice: boolean;
}

interface MasterMitra { id_mitra: number; nama_mitra: string; alamat: string; }
interface MasterHarga { id_harga: number; jenis_transaksi: string; harga: number; }
interface MasterProduk {
  id_produk: number;
  kode_produk?: string; // Penambahan properti di master produk
  nama_produk: string;
  satuan_produk: string; 
  saldo_qty: number;     
  harga_produk: MasterHarga[];
}

interface SalesOrderProps {
  pesanan?: TPesanan[];
  mitraList?: MasterMitra[];
  produkList?: MasterProduk[];
  nextNoPesanan?: string;
}

export default function SalesOrder({ pesanan = [], mitraList = [], produkList = [], nextNoPesanan = '' }: SalesOrderProps) {
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TPesanan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { flash } = usePage().props as any;

  useEffect(() => { if (flash?.error) alert(flash.error); }, [flash?.error]);
  
  const [localItems, setLocalItems] = useState<TPesananDetail[]>([]);
  const [selectedProdukId, setSelectedProdukId] = useState('');
  const [inputQty, setInputQty] = useState('');
  const [inputDiskonItem, setInputDiskonItem] = useState(''); 
  const [currentHargaObj, setCurrentHargaObj] = useState({ id_harga: 0, harga: 0 });

  const { data, setData, reset, processing } = useForm({
    no_pesanan: nextNoPesanan || '',
    tgl_pesanan: new Date().toISOString().split('T')[0],
    id_mitra: '',
    alamat: '',
    jenis_transaksi: 'Penjualan Langsung',
    total_diskon: 0,
    total_harga: 0,
    catatan: '',
    items: [] as TPesananDetail[]
  });

  useEffect(() => {
    const totalAkhirBersih = localItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
    const akumulasiDiskon = localItems.reduce((sum, item) => {
      return sum + ((Number(item.qty) * Number(item.harga)) * (Number(item.diskon) / 100));
    }, 0);
    setData(prev => ({ ...prev, items: localItems, total_diskon: akumulasiDiskon, total_harga: totalAkhirBersih }));
  }, [localItems]);

  const resolvePrice = (idProduk: any, jenisTransaksi: string) => {
    const prod = produkList.find(p => String(p.id_produk) === String(idProduk));
    if (prod?.harga_produk) {
      const priceObj = prod.harga_produk.find(h => h.jenis_transaksi === jenisTransaksi);
      return priceObj ? { id_harga: priceObj.id_harga, harga: Number(priceObj.harga) } : { id_harga: 0, harga: 0 };
    }
    return { id_harga: 0, harga: 0 };
  };

  const clearProductInputs = () => {
    setSelectedProdukId(''); setInputQty(''); setInputDiskonItem(''); setCurrentHargaObj({ id_harga: 0, harga: 0 });
  };

  const getSatuanProduk = (idProduk: number) => {
    return produkList.find(p => p.id_produk === idProduk)?.satuan_produk || 'Pcs';
  };

  const getKodeProduk = (idProduk: number) => {
    return produkList.find(p => p.id_produk === idProduk)?.kode_produk || '-';
  };

  const handleAdd = () => {
    setLocalItems([]); clearProductInputs();
    setData({
      no_pesanan: nextNoPesanan || '', tgl_pesanan: new Date().toISOString().split('T')[0],
      id_mitra: '', alamat: '', jenis_transaksi: 'Penjualan Langsung', total_diskon: 0, total_harga: 0, catatan: '', items: []
    });
    setEditMode(false); setShowForm(true); setShowDetail(false);
  };

  const handleEdit = (item: TPesanan) => {
    if (item.sudah_ada_invoice || item.status_surat_jalan) {
      alert('⚠️ Gagal: Pesanan tidak bisa diubah karena Invoice atau Surat Jalan sudah digenerate!'); return;
    }
    setData({
      no_pesanan: item.no_pesanan || '', tgl_pesanan: item.tgl_pesanan || '', id_mitra: item.id_mitra ? item.id_mitra.toString() : '',
      alamat: item.alamat || '', jenis_transaksi: item.jenis_transaksi || 'Penjualan Langsung', total_diskon: item.total_diskon || 0,
      total_harga: Number(item.total_harga) || 0, catatan: item.catatan || '', items: item.items || []
    });
    setLocalItems(item.items || []); clearProductInputs(); setSelectedOrder(item); setEditMode(true); setShowForm(true); setShowDetail(false);
  };

  const handleDetail = (item: TPesanan) => { setSelectedOrder(item); setShowDetail(true); setShowForm(false); };

  const handleDelete = (id: number) => {
    const item = pesanan.find(p => p.id_pesanan === id);
    if (item && (item.sudah_ada_invoice || item.status_surat_jalan)) {
      alert('⚠️ Gagal: Pesanan tidak bisa dihapus karena Invoice atau Surat Jalan sudah digenerate!'); return;
    }
    if (window.confirm('Apakah Anda yakin ingin menghapus data pesanan penjualan ini?')) { router.delete(`/pesanan/${id}`); }
  };

  const handleJenisTransaksiChange = (jenis: string) => {
    const updatedItems = localItems.map(item => {
      const pObj = resolvePrice(item.id_produk, jenis);
      const gross = (Number(item.qty) || 0) * pObj.harga;
      return { ...item, id_harga: pObj.id_harga, harga: pObj.harga, subtotal: gross - (gross * (Number(item.diskon) / 100)) };
    });
    setLocalItems(updatedItems);
    if (selectedProdukId) setCurrentHargaObj(resolvePrice(selectedProdukId, jenis));
    setData(prev => ({ ...prev, jenis_transaksi: jenis as any }));
  };

  const handleMitraChange = (idMitraStr: string) => {
    const target = mitraList.find(m => String(m.id_mitra) === idMitraStr);
    setData(prev => ({ ...prev, id_mitra: idMitraStr, alamat: target ? target.alamat : '' }));
  };

  const handleProdukChange = (idProdukStr: string) => {
    setSelectedProdukId(idProdukStr);
    if (!idProdukStr) { setCurrentHargaObj({ id_harga: 0, harga: 0 }); return; }
    setCurrentHargaObj(resolvePrice(idProdukStr, data.jenis_transaksi));
  };

  const handleAddItem = () => {
    if (!selectedProdukId || !inputQty || currentHargaObj.harga <= 0) { alert('Mohon pilih produk dan isi kuantitas dengan benar.'); return; }
    const qty = parseFloat(inputQty);
    if (qty <= 0 || isNaN(qty)) { alert('⚠️ Gagal: Kuantitas tidak boleh bernilai nol atau minus!'); return; }

    const id_produk = Number(selectedProdukId);
    const prodObj = produkList.find(p => String(p.id_produk) === selectedProdukId);
    if (!prodObj) return;

    const stokTersedia = prodObj.saldo_qty ?? 0;
    const satuan = prodObj.satuan_produk || 'Pcs';
    const existingItem = localItems.find(item => item.id_produk === id_produk);
    const totalQtyAkanDiinput = qty + (existingItem ? existingItem.qty : 0);

    if (totalQtyAkanDiinput > stokTersedia) {
      alert(`⚠️ Stok Tidak Cukup! Saldo tersisa: ${stokTersedia} ${satuan}. Total input: ${totalQtyAkanDiinput} ${satuan}.`); return;
    }

    let diskonItem = inputDiskonItem ? parseFloat(inputDiskonItem) : 0;
    if (diskonItem < 0) diskonItem = 0; if (diskonItem > 100) diskonItem = 100;

    const grossSubtotal = qty * currentHargaObj.harga;
    const netSubtotal = grossSubtotal - (grossSubtotal * (diskonItem / 100));
    const existingIndex = localItems.findIndex(item => String(item.id_produk) === selectedProdukId);

    if (existingIndex > -1) {
      const updated = [...localItems];
      updated[existingIndex].qty += qty; updated[existingIndex].diskon = diskonItem; 
      const newGross = updated[existingIndex].qty * updated[existingIndex].harga;
      updated[existingIndex].subtotal = newGross - (newGross * (diskonItem / 100));
      setLocalItems(updated);
    } else {
      setLocalItems([...localItems, { 
        id_produk, 
        id_harga: currentHargaObj.id_harga, 
        kode_produk: prodObj.kode_produk || '-',
        nama_produk: prodObj.nama_produk, 
        harga: currentHargaObj.harga, 
        qty, 
        diskon: diskonItem, 
        subtotal: netSubtotal 
      }]);
    }
    clearProductInputs();
  };

  const handleRemoveItem = (index: number) => { setLocalItems(localItems.filter((_, i) => i !== index)); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localItems.length === 0) { alert('Tambahkan minimal 1 item produk terlebih dahulu.'); return; }
    const payload = {
      nomorSO: data.no_pesanan, tanggalSO: data.tgl_pesanan, idMitra: Number(data.id_mitra), jenisTransaksi: data.jenis_transaksi, alamat: data.alamat, catatan: data.catatan, totalDiskon: Number(data.total_diskon), totalHarga: Number(data.total_harga),
      items: localItems.map(item => ({ id_produk: item.id_produk, id_harga: item.id_harga, harga: item.harga, jumlah: item.qty, diskon: item.diskon, subtotal: item.subtotal }))
    };
    if (editMode && selectedOrder) { router.put(`/pesanan/${selectedOrder.id_pesanan}`, payload, { onSuccess: () => handleCancel() }); }
    else { router.post('/pesanan', payload, { onSuccess: () => handleCancel() }); }
  };

  const handleCancel = () => { setShowForm(false); setShowDetail(false); setSelectedOrder(null); setLocalItems([]); clearProductInputs(); reset(); };

  const filteredOrders = pesanan.filter(item =>
    item.no_pesanan?.toLowerCase().includes(searchTerm.toLowerCase()) || item.nama_mitra?.toLowerCase().includes(searchTerm.toLowerCase()) || item.jenis_transaksi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotalSebelumDiskon = localItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.harga)), 0);
  const currentSelectedProd = produkList.find(p => String(p.id_produk) === selectedProdukId);
  const detailSubtotalSebelumDiskon = selectedOrder
      ? (selectedOrder.items || []).reduce((sum, item) => sum + (Number(item.qty) * Number(item.harga)), 0)
      : 0;
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {showForm && (
        <div className="block">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{editMode ? 'Edit Pesanan Penjualan' : 'Tambah Pesanan Baru'}</h1>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. Pesanan *</label>
                  <input type="text" disabled value={data.no_pesanan} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pesanan *</label>
                  <input type="date" required value={data.tgl_pesanan} onChange={(e) => setData('tgl_pesanan', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Transaksi *</label>
                  <select required value={data.jenis_transaksi} onChange={(e) => handleJenisTransaksiChange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                    <option value="Penjualan Langsung">Penjualan Langsung</option><option value="Maklon">Maklon</option><option value="Konsinyasi">Konsinyasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pelanggan / Mitra *</label>
                  <select required value={data.id_mitra} onChange={(e) => handleMitraChange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                    <option value="">Pilih Pelanggan</option>
                    {mitraList.map((m) => (<option key={m.id_mitra} value={m.id_mitra}>{m.nama_mitra}</option>))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Pengiriman</label>
                  <input type="text" readOnly value={data.alamat} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" placeholder="Alamat otomatis terisi" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
                <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={3} value={data.catatan} onChange={(e) => setData('catatan', e.target.value)} placeholder="Contoh: Kirim sebelum jam 4 sore..." />
              </div>
              <div className="border-t border-gray-200 pt-6 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Tambah Produk <span className="text-red-800 font-medium">({data.jenis_transaksi})</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200 mb-2">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Produk</label>
                    <select value={selectedProdukId} onChange={(e) => handleProdukChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                      <option value="">Pilih Produk</option>
                      {produkList.map((p) => (
                        <option key={p.id_produk} value={p.id_produk}>
                          {p.kode_produk ? `[${p.kode_produk}] ` : ''}{p.nama_produk} (Stok: {p.saldo_qty ?? 0} {p.satuan_produk || 'Pcs'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Harga Satuan</label>
                    <input type="text" readOnly disabled value={currentHargaObj.harga > 0 ? `Rp ${currentHargaObj.harga.toLocaleString('id-ID')}` : '-'} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Qty ({currentSelectedProd?.satuan_produk || 'Satuan'})</label>
                    <input type="number" min="1" value={inputQty} onChange={(e) => setInputQty(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Diskon (%)</label>
                    <input type="number" min="0" max="100" value={inputDiskonItem} onChange={(e) => setInputDiskonItem(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
                  </div>
                  <div>
                    <button type="button" onClick={handleAddItem} className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg">Sisipkan Item</button>
                  </div>
                </div>
                {currentSelectedProd && (
                  <p className="text-xs text-gray-500 mb-4 px-1">💡 Batas maksimal persediaan produk ini: <span className="font-bold text-red-800">{currentSelectedProd.saldo_qty ?? 0} {currentSelectedProd.satuan_produk || 'Pcs'}</span></p>
                )}
                <div className="overflow-x-auto border border-gray-200 rounded-xl mb-4">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                        <th className="px-4 py-3">Kode Produk</th>
                        <th className="px-4 py-3">Nama Produk</th>
                        <th className="px-4 py-3">Qty</th>
                        {/* <th className="px-4 py-3">Satuan</th> */}
                        <th className="px-4 py-3">Harga Satuan</th>
                        <th className="px-4 py-3">Diskon</th>
                        <th className="px-4 py-3">Subtotal</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {localItems.length === 0 ? (<tr><td colSpan={8} className="text-center py-6 text-gray-400">Belum ada produk</td></tr>) : (
                        localItems.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold text-gray-700">{item.kode_produk || getKodeProduk(item.id_produk)}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{item.nama_produk}</td>
                            <td className="px-4 py-3 font-semibold">{item.qty} {getSatuanProduk(item.id_produk)}</td>
                            {/* <td className="px-4 py-3 text-gray-500 text-xs">{getSatuanProduk(item.id_produk)}</td> */}
                            <td className="px-4 py-3">Rp {item.harga.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-3">{item.diskon > 0 ? <span className="text-red-600 font-medium">{item.diskon}%</span> : '-'}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-3 text-center"><button type="button" onClick={() => handleRemoveItem(index)} className="text-red-600"><Trash2 className="w-4 h-4 mx-auto" /></button></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mb-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full md:w-80 space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between"><span>Subtotal Sebelum Diskon:</span><span className="text-gray-900 font-medium">Rp {subtotalSebelumDiskon.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between"><span>Total Potongan:</span><span className="text-red-600 font-medium">Rp {data.total_diskon.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between items-center font-bold text-gray-900 border-t border-gray-200 pt-2 text-base"><span>Grand Total Bersih:</span><span className="text-red-900">Rp {data.total_harga.toLocaleString('id-ID')}</span></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" disabled={processing}>Batal</button>
                <button type="submit" disabled={processing} className="px-4 py-2 bg-red-900 text-white text-sm font-medium rounded-lg">{processing ? 'Memproses...' : editMode ? 'Update' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && selectedOrder && (() => {
        // Amankan objek ke variabel lokal agar TypeScript tenang dari error 'possibly null'
        const order = selectedOrder;
        
        // 1. Hitung total kotor sebelum diskon (Qty x Harga)
        const detailSubtotalSebelumDiskon = (order.items || []).reduce(
          (sum, item) => sum + (Number(item.qty) * Number(item.harga)), 
          0
        );

        // 2. Hitung NOMINAL nominal potongan keseluruhan diskon dalam Rupiah
        const detailTotalPotonganRupiah = (order.items || []).reduce(
          (sum, item) => sum + ((Number(item.qty) * Number(item.harga)) * (Number(item.diskon) / 100)), 
          0
        );

        return (
          <div className="block">
            <div className="mb-6">
              <button 
                onClick={handleCancel} 
                className="flex items-center gap-2 px-4 py-2  text-gray-600 hover:text-gray-900 text-sm font-medium rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Detail Pesanan Penjualan</h1>
              <p className="text-red-800 font-semibold mt-1">{order.no_pesanan}</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><p className="text-xs font-semibold text-gray-400">No. Pesanan</p><p className="text-base font-bold text-gray-900">{order.no_pesanan}</p></div>
                <div><p className="text-xs font-semibold text-gray-400">Tanggal</p><p className="text-base font-medium text-gray-900">{new Date(order.tgl_pesanan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                <div><p className="text-xs font-semibold text-gray-400">Jenis Transaksi</p><p className="text-base font-bold text-gray-900">{order.jenis_transaksi}</p></div>
                <div><p className="text-xs font-semibold text-gray-400">Pelanggan</p><p className="text-base font-bold text-gray-900">{order.nama_mitra || 'Tidak Diketahui'}</p></div>
                <div className="md:col-span-2"><p className="text-xs font-semibold text-gray-400">Alamat Pengiriman</p><p className="text-base font-medium text-gray-900">{order.alamat || '-'}</p></div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-xs font-bold text-gray-600">
                  <tr>
                    <th className="px-6 py-3">Kode Produk</th>
                    <th className="px-6 py-3">Nama Produk</th>
                    <th className="px-6 py-3 text-center">Kuantitas</th>
                    <th className="px-6 py-3 text-right">Harga Satuan</th>
                    <th className="px-6 py-3 text-center">Diskon (%)</th>
                    <th className="px-6 py-3 text-right">Subtotal Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {(order.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 font-semibold text-gray-700">{item.kode_produk || getKodeProduk(item.id_produk)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.nama_produk}</td>
                      <td className="px-6 py-4 text-center">{item.qty} {getSatuanProduk(item.id_produk)}</td>
                      <td className="px-6 py-4 text-right">Rp {item.harga.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-center text-red-600">{item.diskon > 0 ? `${item.diskon}%` : '-'}</td>
                      <td className="px-6 py-4 text-right font-bold">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex flex-col md:flex-row justify-end items-start md:items-end gap-6 w-full">
              {/* <button onClick={handleCancel} className="px-4 py-2 border text-gray-700 text-sm rounded-lg bg-white shadow-sm">Kembali</button> */}
              
              <div className="bg-white border border-gray-200 rounded-xl p-4 w-full md:w-80 space-y-2 text-sm text-gray-600 ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal Sebelum Diskon:</span>
                  <span className="text-gray-900 font-medium">Rp {detailSubtotalSebelumDiskon.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Potongan Diskon:</span>
                  <span className="text-red-600 font-medium">Rp {detailTotalPotonganRupiah.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-gray-900 border-t border-gray-200 pt-2 text-base">
                  <span>Grand Total :</span>
                  <span className="text-red-900">Rp {(Number(order.total_harga) || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {!showForm && !showDetail && (
      <div className="block">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div><h1 className="text-2xl font-bold text-black-800">Daftar Pesanan Penjualan</h1><p className="text-black-500 mt-1 text-sm">Kelola data pesanan penjualan pelanggan</p></div>
          <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-red-800 text-white text-sm font-medium rounded-lg"><Plus className="w-5 h-5" /> Tambah Pesanan</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Cari nomor pesanan, pelanggan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-600">
                  <th className="px-6 py-3">No. Order</th><th className="px-6 py-3">Tanggal</th><th className="px-6 py-3">Tipe Transaksi</th><th className="px-6 py-3">Pelanggan</th><th className="px-6 py-3 text-right">Total Transaksi</th><th className="px-4 py-3">Status</th><th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredOrders.length === 0 ? (<tr><td colSpan={7} className="text-center py-8 text-gray-500">Tidak ada data dokumen pesanan</td></tr>) : (
                  filteredOrders.map((item) => {
                    // Kondisi pengunci aksi
                    const hasInvoice = !!item.sudah_ada_invoice;
                    const hasDeliveryOrder = !!item.status_surat_jalan;

                    // Edit & Hapus terkunci jika sudah ada Invoice ATAU Surat Jalan
                    const isEditDeleteLocked = hasInvoice || hasDeliveryOrder; 
                    
                    // Lihat (Detail) terkunci HANYA jika statusnya sudah jadi Invoice (Selesai)
                    // Namun jika baru ada Surat Jalan, tombol Lihat tetap bisa diklik
                    // const isViewLocked = hasInvoice || hasDeliveryOrder; 

                    // Tombol buat Invoice terkunci jika sudah pernah dibuat sebelumnya
                    const isInvoiceLocked = hasInvoice;

                    // Tombol buat Surat Jalan terkunci jika sudah ada Surat Jalan ATAU sudah selesai sampai Invoice
                    const isDeliveryLocked = hasDeliveryOrder;

                    return (
                      <tr key={item.id_pesanan} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-900">{item.no_pesanan}</td>
                        <td className="px-6 py-4">{item.tgl_pesanan}</td>
                        <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">{item.jenis_transaksi}</span></td>
                        <td className="px-6 py-4">{item.nama_mitra || "Tidak Diketahui"}</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">Rp {item.total_harga.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${hasInvoice ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${hasInvoice ? 'bg-emerald-500' : 'bg-amber-500'}`} />{hasInvoice ? 'Selesai' : 'Diproses'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Tombol Lihat / Detail */}
                            <button 
                              // disabled={isViewLocked} 
                              onClick={() => handleDetail(item)} 
                              // className={`p-1.5 rounded-md ${isViewLocked ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Tombol Edit */}
                            <button 
                              disabled={isEditDeleteLocked} 
                              onClick={() => handleEdit(item)} 
                              className={`p-1.5 rounded-md ${isEditDeleteLocked ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-yellow-600 hover:bg-yellow-50'}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Tombol Hapus */}
                            <button 
                              disabled={isEditDeleteLocked} 
                              onClick={() => handleDelete(item.id_pesanan)} 
                              className={`p-1.5 rounded-md ${isEditDeleteLocked ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Tombol Buat Invoice */}
                            <button 
                              type="button" 
                              disabled={isInvoiceLocked} 
                              onClick={() => !isInvoiceLocked && router.get(`/invoice/create?so_id=${item.id_pesanan}`)} 
                              className={`p-1.5 rounded-md ${isInvoiceLocked ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            {/* Tombol Buat Surat Jalan */}
                            <button 
                              type="button" 
                              disabled={isDeliveryLocked} 
                              onClick={() => !isDeliveryLocked && router.get(`/delivery-order/create?so_id=${item.id_pesanan}`)} 
                              className={`p-1.5 rounded-md ${isDeliveryLocked ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50'}`}
                            >
                              <Truck className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
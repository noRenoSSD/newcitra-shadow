import React, { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2, Plus, ArrowLeft, Search } from 'lucide-react';
import { router } from '@inertiajs/react'; 
import ReturPenjualanDetail from './ReturJualDetail';

interface ReturPenjualanItem {
  id: string;
  noRetur: string;
  tanggal: string;
  noInvoice: string;
  id_jual: number;
  pelanggan: string;
  items: {
    id_produk: number;
    produk: string;
    qty: number;
    kondisiBarang: 'Layak' | 'Perlu Perbaikan' | 'Rusak';
    keterangan: string;
    harga: number;
    subtotal: number;
  }[];
  subtotal: number;
  grandTotal: number;
}

interface InvoiceDataAPI {
  id_jual: number;
  no_jual: string;
  grand_total: string | number;
  pelanggan?: string; 
  invoice_items?: {
    id_produk: number;
    nama_produk: string;
    qty_terjual: number;
    harga: number; 
    subtotal: number;
  }[];
}

export default function ReturPenjualan({ 
  noReturOtomatis, 
  listInvoice = [],
  listRetur = [] 
}: { 
  noReturOtomatis: string; 
  listInvoice: InvoiceDataAPI[]; 
  listRetur: any[];
}) {
  
  const formatReturData = (data: any[]): ReturPenjualanItem[] => {
    return data.map(rt => ({
      id: rt.id_retur_jual.toString(),
      noRetur: rt.no_retur_jual,
      tanggal: rt.tgl_retur_jual,
      noInvoice: rt.no_jual,
      id_jual: rt.id_jual || 0,
      pelanggan: rt.pelanggan || 'Pelanggan Umum', 
      subtotal: parseFloat(rt.subtotal) || 0,
      grandTotal: parseFloat(rt.grand_total) || 0,
      items: (rt.items || []).map((item: any) => ({
        id_produk: item.id_produk,
        produk: item.produk || item.nama_produk,
        qty: item.qty,
        kondisiBarang: item.kondisiBarang || item.kondisi_barang,
        keterangan: item.keterangan || '',
        harga: Number(item.harga) || 0,
        subtotal: parseFloat(item.subtotal) || 0
      }))
    }));
  };

  const [returPenjualans, setReturPenjualans] = useState<ReturPenjualanItem[]>(formatReturData(listRetur));
  const [invoicesFromAPI, setInvoicesFromAPI] = useState<InvoiceDataAPI[]>(listInvoice);

  const [formData, setFormData] = useState({
    noRetur: noReturOtomatis || '',
    tanggal: new Date().toISOString().split('T')[0],
    noInvoice: '', 
    id_jual: '', 
    pelanggan: ''
  });

  const [items, setItems] = useState<{
    id_produk: number; 
    produk: string;
    qtyTerjual: number; 
    qty: number;        
    kondisiBarang: 'Layak' | 'Perlu Perbaikan' | 'Rusak' | '';
    keterangan: string;
    harga: number;
    subtotal: number;
    isRetured: boolean; 
  }[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingDetail, setViewingDetail] = useState<ReturPenjualanItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const kondisiBarangList: ('Layak' | 'Perlu Perbaikan' | 'Rusak')[] = ['Layak', 'Perlu Perbaikan', 'Rusak'];

  useEffect(() => {
    setReturPenjualans(formatReturData(listRetur));
  }, [listRetur]);

  useEffect(() => {
    setInvoicesFromAPI(listInvoice);
  }, [listInvoice]);

  useEffect(() => {
    if (noReturOtomatis) {
      setFormData(prev => ({ ...prev, noRetur: noReturOtomatis }));
    }
  }, [noReturOtomatis]);

  const handleOpenNewForm = () => {
    setFormData({
      noRetur: noReturOtomatis,
      tanggal: new Date().toISOString().split('T')[0],
      noInvoice: '',
      id_jual: '',
      pelanggan: ''
    });
    setItems([]);
    setIsFormOpen(true);
  };

  const handleInvoiceChange = (noInv: string) => {
    const selectedInvoice = listInvoice.find(inv => inv.no_jual === noInv);
    
    if (selectedInvoice) {
      setFormData(prev => ({
        ...prev,
        noInvoice: noInv,
        id_jual: selectedInvoice.id_jual.toString(), 
        pelanggan: selectedInvoice.pelanggan || 'Mitra Tidak Diketahui'
      }));

      const apiItems = selectedInvoice.invoice_items || [];

      const mappedItems = apiItems.map((item: any) => {
        const qtyBeli = Number(item.qty_terjual) || Number(item.qty_jual) || 0;
        
        // Pemindaian otomatis: mencari properti angka yang merupakan nominal harga
        let hargaBeli = 0;
        
        // 1. Cek prioritas field standar yang sering digunakan
        if (Number(item.harga) > 0) hargaBeli = Number(item.harga);
        else if (Number(item.harga_jual_satuan) > 0) hargaBeli = Number(item.harga_jual_satuan);
        else if (Number(item.harga_satuan) > 0) hargaBeli = Number(item.harga_satuan);
        else {
          // 2. Jika semua field di atas 0, sisir seluruh isi objek item untuk mencari nominal harga
          const keys = Object.keys(item);
          for (const key of keys) {
            const val = Number(item[key]);
            // Jika nilai berupa angka besar (kemungkinan nominal harga) dan bukan id / qty
            if (!isNaN(val) && val > 100 && !key.includes('id') && !key.includes('qty') && !key.includes('total') && !key.includes('subtotal')) {
              hargaBeli = val;
              break;
            }
          }
        }

        // 3. Batas pengaman terakhir: hitung mundur dari subtotal jika harga masih belum ketemu
        if (hargaBeli === 0 && Number(item.subtotal) > 0 && qtyBeli > 0) {
          hargaBeli = Number(item.subtotal) / qtyBeli;
        }

        return {
          id_produk: Number(item.id_produk), 
          produk: item.nama_produk || 'Produk Tidak Diketahui', 
          qtyTerjual: qtyBeli, 
          qty: 0,              
          kondisiBarang: '' as const,
          keterangan: '',
          harga: hargaBeli,    
          subtotal: 0,
          isRetured: true 
        };
      });

      setItems(mappedItems);
    } else {
      setFormData(prev => ({ ...prev, noInvoice: noInv, id_jual: '', pelanggan: '' }));
      setItems([]);
    }
  };

  const handleItemRowChange = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    const item = updatedItems[index];

    if (field === 'qty') {
      const inputQty = parseFloat(value) || 0;
      if (inputQty > item.qtyTerjual) {
        alert(`Jumlah retur tidak boleh melebihi qty terjual (${item.qtyTerjual})`);
        item.qty = item.qtyTerjual;
      } else {
        item.qty = inputQty;
      }
      item.subtotal = item.qty * item.harga;
    } else {
      updatedItems[index] = { ...item, [field]: value };
    }

    setItems(updatedItems);
  };

  const handleRemoveRow = (index: number) => {
    const updatedItems = [...items];
    updatedItems[index].isRetured = false; 
    setItems(updatedItems);
  };

  const activeItems = items.filter(item => item.isRetured && item.qty > 0);
  const calculateSubtotal = () => activeItems.reduce((sum, item) => sum + item.subtotal, 0);
  const calculateGrandTotal = () => calculateSubtotal(); 

  const handleSubmit = () => {
    if (!formData.noRetur || !formData.tanggal || !formData.noInvoice) {
      alert('Mohon lengkapi informasi utama retur!');
      return;
    }

    if (activeItems.length === 0) {
      alert('Minimal harus ada 1 produk dengan jumlah retur valid (> 0).');
      return;
    }

    const missingCondition = activeItems.some(item => !item.kondisiBarang);
    if (missingCondition) {
      alert('Mohon lengkapi Kondisi Barang untuk produk yang akan diretur.');
      return;
    }

    const payload = {
      id_jual: Number(formData.id_jual),
      subtotal: calculateSubtotal(),
      grand_total: calculateGrandTotal(),
      total_perbaikan: activeItems.filter(i => i.kondisiBarang === 'Perlu Perbaikan').reduce((s, i) => s + i.subtotal, 0),
      total_kerugian: activeItems.filter(i => i.kondisiBarang === 'Rusak').reduce((s, i) => s + i.subtotal, 0),
      items: activeItems.map(item => ({
        id_produk: item.id_produk,
        harga: item.harga,
        qty_retur: item.qty,
        subtotal_retur: item.subtotal,
        kondisi_barang: item.kondisiBarang,
        biaya_perbaikan: 0, 
        nilai_kerugian: item.kondisiBarang === 'Rusak' ? item.subtotal : 0,
        keterangan: item.keterangan
      }))
    };

    router.post('/retur-penjualan', payload, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
      onError: (errors) => {
        alert('Terjadi kesalahan saat menyimpan data.');
        console.error(errors);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus retur penjualan ini?')) {
      setReturPenjualans(returPenjualans.filter(rtp => rtp.id !== id));
    }
  };

  const filteredReturPenjualans = returPenjualans.filter(
    (rtp) =>
      rtp.noRetur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rtp.pelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rtp.noInvoice.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewingDetail) {
    return <ReturPenjualanDetail retur={viewingDetail} onBack={() => setViewingDetail(null)} />;
  }

  return (
    <div className="p-8">
      {isFormOpen ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsFormOpen(false)} className="text-red-800 hover:text-red-900 transition-colors">
              <ArrowLeft className="w-7 h-7" />
            </button>
            <h1 className="text-2xl font-bold text-red-800">Input Retur Penjualan Baru</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Retur</label>
                <input type="text" value={formData.noRetur} disabled className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Retur</label>
                <input type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih No. Invoice Asal</label>
                <select value={formData.noInvoice} onChange={(e) => handleInvoiceChange(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-white outline-none focus:border-red-500">
                  <option value="">-- Pilih Invoice --</option>
                  {invoicesFromAPI.map((inv) => (
                    <option key={inv.id_jual} value={inv.no_jual}>{inv.no_jual}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
                <input type="text" value={formData.pelanggan} disabled className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
              </div>
            </div>

            {formData.noInvoice && items.some(item => item.isRetured) ? (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Daftar Produk Terjual (Sesuaikan Jumlah Retur)</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                        <th className="px-4 py-2.5">Produk</th>
                        <th className="px-4 py-2.5">Harga</th>
                        <th className="px-4 py-2.5 w-24">Qty Beli</th>
                        <th className="px-4 py-2.5 w-28">Qty Retur</th>
                        <th className="px-4 py-2.5 w-48">Kondisi Barang</th>
                        <th className="px-4 py-2.5">Keterangan / Alasan</th>
                        <th className="px-4 py-2.5">Subtotal</th>
                        <th className="text-center px-4 py-2.5">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {items.map((item, index) => {
                        if (!item.isRetured) return null;
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-medium text-gray-900">{item.produk}</td>
                            <td className="px-4 py-2.5">Rp {item.harga.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-2.5 text-gray-500 font-semibold">{item.qtyTerjual}</td>
                            <td className="px-4 py-2.5">
                              <input type="number" min="0" max={item.qtyTerjual} value={item.qty || ''} placeholder="0" onChange={(e) => handleItemRowChange(index, 'qty', e.target.value)} className="w-20 border border-gray-300 rounded p-1 text-center outline-none focus:border-red-500 font-semibold" />
                            </td>
                            <td className="px-4 py-2.5">
                              <select value={item.kondisiBarang} disabled={item.qty === 0} onChange={(e) => handleItemRowChange(index, 'kondisiBarang', e.target.value)} className={`w-full border border-gray-300 rounded p-1 text-xs bg-white ${item.qty === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                                <option value="">Pilih Kondisi</option>
                                {kondisiBarangList.map((k) => <option key={k} value={k}>{k}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-2.5">
                              <input type="text" placeholder="Alasan dikembalikan..." value={item.keterangan} disabled={item.qty === 0} onChange={(e) => handleItemRowChange(index, 'keterangan', e.target.value)} className={`w-full border border-gray-300 rounded p-1 text-xs outline-none focus:border-red-500 ${item.qty === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                            </td>
                            <td className="px-4 py-2.5 font-semibold text-gray-700">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-2.5 text-center">
                              <button type="button" onClick={() => handleRemoveRow(index)} className="text-red-600 hover:text-red-800 font-medium text-xs border border-red-200 px-2 py-1 rounded hover:bg-red-50">Tanpa Retur</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : formData.noInvoice ? (
              <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">Semua produk invoice telah dieliminasi dari daftar retur.</div>
            ) : (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">Silakan pilih Nomor Invoice Asal terlebih dahulu.</div>
            )}

            {activeItems.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Subtotal Retur:</span>
                  <span className="font-semibold text-gray-900">Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 text-gray-950">
                  <span>Grand Total Retur:</span>
                  <span className="text-red-800">Rp {calculateGrandTotal().toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors bg-white">Batal</button>
              <button type="button" onClick={handleSubmit} disabled={activeItems.length === 0} className={`px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm ${activeItems.length === 0 ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-red-800 hover:bg-red-900'}`}>Simpan Retur</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-red-800">Retur Penjualan</h1>
              <p className="text-red-800/80 mt-1 text-sm">Kelola data pengembalian barang dari pelanggan</p>
            </div>
            <button onClick={handleOpenNewForm} className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm"><Plus className="w-4 h-4" />Tambah Retur</button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Cari No. Retur, Invoice, atau Pelanggan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-500 transition-colors" />
              </div>
            </div>

            <div className="overflow-x-auto px-6 pb-4">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm">
                    <th className="p-4 font-semibold">No. Retur</th>
                    <th className="p-4 font-semibold">Tanggal</th>
                    <th className="p-4 font-semibold">No. Invoice</th>
                    <th className="p-4 font-semibold">Pelanggan</th>
                    <th className="p-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredReturPenjualans.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">Data tidak ditemukan</td></tr>
                  ) : (
                    filteredReturPenjualans.map((rtp) => (
                      <tr key={rtp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-semibold text-gray-700">{rtp.noRetur}</td>
                        <td className="p-4 text-gray-700">{new Date(rtp.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="p-4 font-semibold text-gray-700">{rtp.noInvoice}</td>
                        <td className="p-4 font-medium text-gray-700">{rtp.pelanggan}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => setViewingDetail(rtp)} className="text-gray-500 hover:text-red-600 transition-colors" title="Detail"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(rtp.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
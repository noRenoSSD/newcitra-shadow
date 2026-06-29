import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Eye, Pencil, FileText, Truck, X } from 'lucide-react';

// ==================== INTERFACES & TYPES (SESUAI DATABASE t_pesanan) ====================
interface TPesananDetail {
  id_pesanan_detail?: number;
  id_pesanan?: number;
  id_produk: number;
  id_harga: number;
  nama_produk: string; // Helper UI
  harga: number;       // Snapshot harga
  qty: number;
  subtotal: number;
}

interface TPesanan {
  id_pesanan: number;
  no_pesanan: string;
  tgl_pesanan: string;
  id_mitra: number;
  nama_mitra?: string; // Helper UI
  jenis_transaksi: 'Penjualan Langsung' | 'Konsinyasi' | 'Grosir';
  alamat: string;
  total_harga: number;
  items: TPesananDetail[];
}

export default function SalesOrder() {
  // ==================== MASTER DATA ====================
  const mitraList = [
    { id_mitra: 1, nama_mitra: 'Toko Budi Semarang', alamat_mitra: 'Jl. Pandanaran No. 51, Semarang' },
    { id_mitra: 2, nama_mitra: 'Ritel Berkah Kendal', alamat_mitra: 'Jl. Pemuda No. 10, Kendal' },
    { id_mitra: 3, nama_mitra: 'Toko Sejahtera', alamat_mitra: 'Jl. Gatot Subroto No. 12, Batang' }
  ];

  const jenisTransaksiList = ['Penjualan Langsung', 'Konsinyasi', 'Grosir'];

  const produkList = [
    { id_produk: 1, nama_produk: 'Bandeng Presto Premium', harga_produk: [{ id_harga: 1, jenis_transaksi: 'Penjualan Langsung', harga: 35000 }, { id_harga: 2, jenis_transaksi: 'Grosir', harga: 29000 }, { id_harga: 3, jenis_transaksi: 'Konsinyasi', harga: 25000 }] },
    { id_produk: 2, nama_produk: 'Bandeng Presto Reguler', harga_produk: [{ id_harga: 4, jenis_transaksi: 'Penjualan Langsung', harga: 30000 }, { id_harga: 5, jenis_transaksi: 'Grosir', harga: 25000 }, { id_harga: 6, jenis_transaksi: 'Konsinyasi', harga: 20000 }] },
    { id_produk: 3, nama_produk: 'Bandeng Otak-Otak', harga_produk: [{ id_harga: 7, jenis_transaksi: 'Penjualan Langsung', harga: 40000 }, { id_harga: 8, jenis_transaksi: 'Grosir', harga: 34000 }, { id_harga: 9, jenis_transaksi: 'Konsinyasi', harga: 30000 }] }
  ];

  const metodePembayaranList = ['Cash', 'Transfer Bank'];
  const terminPembayaranList = ['15 Hari', '30 Hari', '45 Hari', '60 Hari'];
  const driverList = ['Budi Santoso', 'Ahmad Ridwan', 'Siti Aminah', 'Joko Susilo'];
  const kendaraanList = ['H 1234 AB (Pick Up)', 'H 5678 CD (Box)', 'H 9012 EF (Truk)'];

  // ==================== INITIAL SEED DATA ====================
  const contohTransaksi: TPesanan[] = [
    {
      id_pesanan: 1,
      no_pesanan: 'PSG-2026-001',
      tgl_pesanan: '2026-06-15',
      id_mitra: 1,
      nama_mitra: 'Toko Budi Semarang',
      alamat: 'Jl. Pandanaran No. 51, Semarang',
      jenis_transaksi: 'Grosir',
      total_harga: 750000, 
      items: [
        { id_produk: 1, id_harga: 2, nama_produk: 'Bandeng Presto Premium', harga: 29000, qty: 20, subtotal: 580000 }
      ]
    }
  ];

  // ==================== STATES ====================
  const [pesananOrders, setPesananOrders] = useState<TPesanan[]>(contohTransaksi);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<TPesananDetail[]>([]);
  const [viewingDetail, setViewingDetail] = useState<TPesanan | null>(null);
  
  const [sjTarget, setSjTarget] = useState<TPesanan | null>(null);
  const [formSJ, setFormSJ] = useState({ pengirim: '', kendaraan: '' });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedSO, setSelectedSO] = useState<TPesanan | null>(null);
  const [invoiceFormData, setInvoiceFormData] = useState({
    noInvoice: '',
    tanggalInvoice: new Date().toISOString().split('T')[0],
    jenisPenjualan: '' as 'Tunai' | 'Kredit' | '',
    metodePembayaran: '',
    tanggalJatuhTempo: '',
    terminPembayaran: ''
  });

  const [formData, setFormData] = useState({
    no_pesanan: '',
    tgl_pesanan: new Date().toISOString().split('T')[0], 
    id_mitra: '',
    alamat: '',
    jenis_transaksi: 'Penjualan Langsung',
    id_produk: '',
    qty: '',
    harga: '',
    id_harga: ''
  });

  // ==================== LOGIC HANDLERS ====================
  const generateNoPesanan = (ordersList: TPesanan[]) => {
    const tahunSekarang = new Date().getFullYear();
    let maxCounter = 0;
    ordersList.forEach(order => {
      if (order.no_pesanan.startsWith(`PSG-${tahunSekarang}-`)) {
        const parts = order.no_pesanan.split('-');
        const counter = parseInt(parts[2], 10);
        if (!isNaN(counter) && counter > maxCounter) maxCounter = counter;
      }
    });
    return `PSG-${tahunSekarang}-${String(maxCounter + 1).padStart(3, '0')}`;
  };

  useEffect(() => {
    if (showForm && !editMode) {
      setFormData(prev => ({
        ...prev,
        no_pesanan: generateNoPesanan(pesananOrders)
      }));
    }
  }, [showForm, editMode, pesananOrders]);

  const getHargaObj = (idProduk: number, jenisTransaksi: string) => {
    const prod = produkList.find(p => p.id_produk === idProduk);
    if (prod) {
      return prod.harga_produk.find(h => h.jenis_transaksi === jenisTransaksi) || { id_harga: 0, harga: 0 };
    }
    return { id_harga: 0, harga: 0 };
  };

  const resetForm = () => {
    setFormData({
      no_pesanan: '',
      tgl_pesanan: new Date().toISOString().split('T')[0],
      id_mitra: '',
      alamat: '',
      jenis_transaksi: 'Penjualan Langsung',
      id_produk: '',
      qty: '',
      harga: '',
      id_harga: ''
    });
    setItems([]);
    setEditingId(null);
    setShowForm(false);
    setEditMode(false);
  };

  const handleJenisTransaksiChange = (jenis_transaksi: string) => {
    const targetProdId = Number(formData.id_produk);
    const priceObj = getHargaObj(targetProdId, jenis_transaksi);
    
    const updatedItems = items.map(item => {
      const innerPriceObj = getHargaObj(item.id_produk, jenis_transaksi);
      return {
        ...item,
        id_harga: innerPriceObj.id_harga,
        harga: innerPriceObj.harga,
        subtotal: item.qty * innerPriceObj.harga
      };
    });

    setItems(updatedItems);
    setFormData({
      ...formData,
      jenis_transaksi,
      id_harga: priceObj.id_harga.toString(),
      harga: priceObj.harga > 0 ? priceObj.harga.toString() : ''
    });
  };

  const handleMitraChange = (idMitraStr: string) => {
    const selected = mitraList.find(m => m.id_mitra === Number(idMitraStr));
    setFormData({
      ...formData,
      id_mitra: idMitraStr,
      alamat: selected?.alamat_mitra || ''
    });
  };

  const handleProdukChange = (idProdukStr: string) => {
    const priceObj = getHargaObj(Number(idProdukStr), formData.jenis_transaksi);
    setFormData({
      ...formData,
      id_produk: idProdukStr,
      id_harga: priceObj.id_harga.toString(),
      harga: priceObj.harga > 0 ? priceObj.harga.toString() : ''
    });
  };

  const handleAddItem = () => {
    if (!formData.id_produk || !formData.qty || !formData.harga) {
      alert('Mohon lengkapi produk dan kuantitas.');
      return;
    }
    
    const qty = parseFloat(formData.qty);
    const harga = parseFloat(formData.harga);
    const id_produk = Number(formData.id_produk);
    const prodObj = produkList.find(p => p.id_produk === id_produk);

    if (qty <= 0) {
      alert('Kuantitas harus lebih dari 0');
      return;
    }

    const existingIndex = items.findIndex(item => item.id_produk === id_produk);
    if (existingIndex > -1) {
      const updatedItems = [...items];
      updatedItems[existingIndex].qty += qty;
      updatedItems[existingIndex].subtotal = updatedItems[existingIndex].qty * updatedItems[existingIndex].harga;
      setItems(updatedItems);
    } else {
      setItems([...items, {
        id_produk,
        id_harga: Number(formData.id_harga),
        nama_produk: prodObj?.nama_produk || '',
        harga,
        qty,
        subtotal: qty * harga
      }]);
    }

    setFormData({ ...formData, id_produk: '', qty: '', harga: '', id_harga: '' });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotalHarga = () => items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = () => {
    if (!formData.no_pesanan || !formData.id_mitra) {
      alert('Mohon lengkapi semua field utama.');
      return;
    }
    if (items.length === 0) {
      alert('Minimal harus ada 1 produk terdaftar.');
      return;
    }

    const total_harga = calculateTotalHarga();
    const targetMitra = mitraList.find(m => m.id_mitra === Number(formData.id_mitra));

    if (editingId) {
      setPesananOrders(pesananOrders.map(so =>
        so.id_pesanan === editingId
          ? { ...so, no_pesanan: formData.no_pesanan, tgl_pesanan: formData.tgl_pesanan, id_mitra: Number(formData.id_mitra), nama_mitra: targetMitra?.nama_mitra, alamat: formData.alamat, jenis_transaksi: formData.jenis_transaksi as any, total_harga, items: [...items] }
          : so
      ));
    } else {
      const newOrder: TPesanan = {
        id_pesanan: Date.now(),
        no_pesanan: formData.no_pesanan,
        tgl_pesanan: formData.tgl_pesanan,
        id_mitra: Number(formData.id_mitra),
        nama_mitra: targetMitra?.nama_mitra,
        alamat: formData.alamat,
        jenis_transaksi: formData.jenis_transaksi as any,
        total_harga,
        items: [...items]
      };
      setPesananOrders([...pesananOrders, newOrder]);
    }
    resetForm();
  };

  const handleEdit = (so: TPesanan) => {
    setFormData({
      no_pesanan: so.no_pesanan, 
      tgl_pesanan: so.tgl_pesanan,
      id_mitra: so.id_mitra.toString(),
      alamat: so.alamat,
      jenis_transaksi: so.jenis_transaksi,
      id_produk: '',
      qty: '',
      harga: '',
      id_harga: ''
    });
    setItems([...so.items]);
    setEditingId(so.id_pesanan);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
      setPesananOrders(pesananOrders.filter(so => so.id_pesanan !== id));
    }
  };

  const handleGenerateInvoice = (so: TPesanan) => {
    const tahun = new Date().getFullYear();
    setSelectedSO(so);
    setShowInvoiceModal(true);
    setInvoiceFormData({ 
      noInvoice: `INV-${tahun}-${Math.floor(100 + Math.random() * 900)}`,
      tanggalInvoice: new Date().toISOString().split('T')[0],
      jenisPenjualan: '', metodePembayaran: '', tanggalJatuhTempo: '', terminPembayaran: '' 
    });
  };

  const handleFinalizeInvoice = () => {
    if (!selectedSO || !invoiceFormData.jenisPenjualan || !invoiceFormData.metodePembayaran) {
      alert('Mohon lengkapi semua field input penagihan yang diperlukan');
      return;
    }
    alert(`Invoice ${invoiceFormData.noInvoice} berhasil diproses untuk SO: ${selectedSO.no_pesanan}`);
    setShowInvoiceModal(false);
  };

  const filteredSalesOrders = pesananOrders.filter(
    (so) =>
      so.no_pesanan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.nama_mitra?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==================== RENDERING UI ====================
  if (viewingDetail) {
    // Fallback jika SalesOrderDetail belum di-inline style, kita bypass dulu
    return (
      <div style={{ padding: '24px' }}>
        <button onClick={() => setViewingDetail(null)} style={{ padding: '8px 16px', marginBottom: '16px' }}>Kembali</button>
        <pre>{JSON.stringify(viewingDetail, null, 2)}</pre>
      </div>
    );
  }

  if (showForm) {
    return (
      <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            {editMode ? 'Edit Pesanan Penjualan' : 'Tambah Pesanan Penjualan'}
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>Kelola data pesanan penjualan pelanggan</p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>No. Pesanan (Otomatis)</label>
              <input type="text" readOnly value={formData.no_pesanan} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#F3F4F6', color: '#4B5563', fontWeight: 'bold' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Tanggal *</label>
              <input type="date" required value={formData.tgl_pesanan} onChange={(e) => setFormData({ ...formData, tgl_pesanan: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #9CA3AF', borderRadius: '8px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Jenis Transaksi *</label>
              <select required value={formData.jenis_transaksi} onChange={(e) => handleJenisTransaksiChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #9CA3AF', borderRadius: '8px', backgroundColor: '#fff' }}>
                {jenisTransaksiList.map((tipe) => (
                  <option key={tipe} value={tipe}>{tipe}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Pelanggan / Mitra *</label>
              <select required value={formData.id_mitra} onChange={(e) => handleMitraChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #9CA3AF', borderRadius: '8px', backgroundColor: '#fff' }}>
                <option value="">Pilih Pelanggan</option>
                {mitraList.map((p) => (
                  <option key={p.id_mitra} value={p.id_mitra}>{p.nama_mitra}</option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Alamat Pengiriman</label>
              <input type="text" value={formData.alamat} readOnly style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#F9FAFB', color: '#6B7280' }} />
            </div>
          </div>

          {/* Tambah Produk */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '16px' }}>
              Tambah Produk <span style={{ color: '#991B1B' }}>({formData.jenis_transaksi})</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Produk</label>
                <select value={formData.id_produk} onChange={(e) => handleProdukChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #9CA3AF', borderRadius: '8px', backgroundColor: '#fff' }}>
                  <option value="">Pilih Produk</option>
                  {produkList.map((p) => (
                    <option key={p.id_produk} value={p.id_produk}>{p.nama_produk}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Qty</label>
                <input type="number" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #9CA3AF', borderRadius: '8px' }} placeholder="0" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Harga Bersih</label>
                <input type="text" value={formData.harga ? `Rp ${parseFloat(formData.harga).toLocaleString('id-ID')}` : ''} readOnly style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#F9FAFB', color: '#4B5563', fontWeight: 'bold' }} placeholder="Harga otomatis" />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="button" onClick={handleAddItem} style={{ width: '100%', padding: '12px', backgroundColor: '#7F1D1D', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Tambah
                </button>
              </div>
            </div>
          </div>

          {/* Tabel Detail Items */}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>Produk</th>
                  <th style={{ padding: '12px 16px' }}>Qty</th>
                  <th style={{ padding: '12px 16px' }}>Harga</th>
                  <th style={{ padding: '12px 16px' }}>Subtotal</th>
                  <th style={{ padding: '12px 16px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>Belum ada produk ditambahkan</td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#374151' }}>{item.nama_produk}</td>
                      <td style={{ padding: '12px 16px' }}>{item.qty}</td>
                      <td style={{ padding: '12px 16px' }}>Rp {item.harga.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>Rp {item.subtotal.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button type="button" onClick={() => handleRemoveItem(index)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Ringkasan Biaya */}
          <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '16px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
              <span style={{ color: '#4B5563' }}>Subtotal:</span>
              <span style={{ fontWeight: 'bold' }}>Rp {calculateTotalHarga().toLocaleString('id-ID')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid #E5E7EB', paddingTop: '8px' }}>
              <span>Grand Total:</span>
              <span style={{ color: '#991B1B' }}>Rp {calculateTotalHarga().toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
            <button type="button" onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer' }}>Batal</button>
            <button type="button" onClick={handleSubmit} style={{ padding: '10px 20px', backgroundColor: '#7F1D1D', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {editMode ? 'Update Pesanan' : 'Simpan Pesanan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Daftar Pesanan Penjualan</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>Kelola data transaksi penjualan (`t_pesanan` & `t_pesanan_detail`)</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditMode(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#991B1B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          <Plus className="w-5 h-5" /> Tambah Pesanan Penjualan
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', width: '20px', height: '20px' }} />
          <input type="text" placeholder="Cari nomor order atau nama pelanggan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1px solid #9CA3AF', borderRadius: '8px', outline: 'none' }} />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>No. Order</th>
                <th style={{ padding: '12px 16px' }}>Tanggal</th>
                <th style={{ padding: '12px 16px' }}>Tipe</th>
                <th style={{ padding: '12px 16px' }}>Pelanggan</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Total</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalesOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>Tidak ada data pesanan penjualan</td>
                </tr>
              ) : (
                filteredSalesOrders.map((so) => (
                  <tr key={so.id_pesanan} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{so.no_pesanan}</td>
                    <td style={{ padding: '12px 16px' }}>{new Date(so.tgl_pesanan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', backgroundColor: '#F3F4F6', color: '#1F2937' }}>{so.jenis_transaksi}</span></td>
                    <td style={{ padding: '12px 16px' }}>{so.nama_mitra}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>Rp {so.total_harga.toLocaleString('id-ID')}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        <button onClick={() => setViewingDetail(so)} style={{ padding: '6px', border: 'none', background: 'none', color: '#2563EB', cursor: 'pointer' }} title="Lihat"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleEdit(so)} style={{ padding: '6px', border: 'none', background: 'none', color: '#D97706', cursor: 'pointer' }} title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(so.id_pesanan)} style={{ padding: '6px', border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer' }} title="Hapus"><Trash2 className="w-4 h-4" /></button>
                        <button onClick={() => handleGenerateInvoice(so)} style={{ padding: '6px', border: 'none', background: 'none', color: '#4B5563', cursor: 'pointer' }} title="Generate Invoice"><FileText className="w-4 h-4" /></button>
                        <button onClick={() => setSjTarget(so)} style={{ padding: '6px', border: 'none', background: 'none', color: '#2563EB', cursor: 'pointer' }} title="Generate Surat Jalan"><Truck className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== MODAL GENERATE SURAT JALAN ==================== */}
      {sjTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#991B1B', margin: 0 }}>Generate Surat Jalan</h3>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>{sjTarget.no_pesanan} — {sjTarget.nama_mitra}</p>
              </div>
              <button onClick={() => setSjTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Nama Pengirim / Driver *</label>
                <select value={formSJ.pengirim} onChange={e => setFormSJ({ ...formSJ, pengirim: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#fff' }}>
                  <option value="">Pilih Driver</option>
                  {driverList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>No. Kendaraan *</label>
                <select value={formSJ.kendaraan} onChange={e => setFormSJ({ ...formSJ, kendaraan: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#fff' }}>
                  <option value="">Pilih Kendaraan</option>
                  {kendaraanList.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '12px' }}>
              <button onClick={() => setSjTarget(null)} style={{ flex: 1, padding: '8px 16px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>Batal</button>
              <button disabled={!formSJ.pengirim || !formSJ.kendaraan} onClick={() => { alert('Surat Jalan sukses di-generate!'); setSjTarget(null); }} style={{ flex: 1, padding: '8px 16px', backgroundColor: '#991B1B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: (!formSJ.pengirim || !formSJ.kendaraan) ? 0.5 : 1 }}>Generate</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FORM / MODAL INVOICE BARU LENGKAP DETAIL PRODUK ==================== */}
      {showInvoiceModal && selectedSO && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Formulir Pembuatan Invoice</h2>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>Konfirmasi data tagihan berdasarkan nomor pesanan {selectedSO.no_pesanan}</p>
              </div>
              <button onClick={() => { setShowInvoiceModal(false); setSelectedSO(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X className="w-5 h-5" /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>No. Invoice</label>
                  <input type="text" value={invoiceFormData.noInvoice} readOnly style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#F3F4F6' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>Tanggal Invoice</label>
                  <input type="date" value={invoiceFormData.tanggalInvoice} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, tanggalInvoice: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #9CA3AF', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>Referensi No. SO</label>
                  <input type="text" value={selectedSO.no_pesanan} readOnly style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#F3F4F6' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>Nama Pelanggan</label>
                  <input type="text" value={selectedSO.nama_mitra} readOnly style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#F3F4F6' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1F2937', marginBottom: '4px' }}>Jenis Penjualan / Syarat *</label>
                  <select value={invoiceFormData.jenisPenjualan} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, jenisPenjualan: e.target.value as any, tanggalJatuhTempo: '', terminPembayaran: '' })} style={{ width: '100%', border: '1px solid #9CA3AF', backgroundColor: '#fff', borderRadius: '8px', padding: '8px 12px' }}>
                    <option value="">Pilih Jenis Penjualan</option>
                    <option value="Tunai">Tunai / Cash</option>
                    <option value="Kredit">Kredit / Term of Payment</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1F2937', marginBottom: '4px' }}>Metode Pembayaran Utama *</label>
                  <select value={invoiceFormData.metodePembayaran} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, metodePembayaran: e.target.value })} style={{ width: '100%', border: '1px solid #9CA3AF', backgroundColor: '#fff', borderRadius: '8px', padding: '8px 12px' }}>
                    <option value="">Pilih Metode Pembayaran</option>
                    {metodePembayaranList.map((m) => (<option key={m} value={m}>{m}</option>))}
                  </select>
                </div>
              </div>

              {invoiceFormData.jenisPenjualan === 'Kredit' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Tanggal Jatuh Tempo</label>
                    <input type="date" value={invoiceFormData.tanggalJatuhTempo} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, tanggalJatuhTempo: e.target.value, terminPembayaran: '' })} style={{ width: '100%', border: '1px solid #9CA3AF', borderRadius: '8px', padding: '8px 12px' }} disabled={!!invoiceFormData.terminPembayaran} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Pilihan Termin (Hari)</label>
                    <select value={invoiceFormData.terminPembayaran} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, terminPembayaran: e.target.value, tanggalJatuhTempo: '' })} style={{ width: '100%', border: '1px solid #9CA3AF', borderRadius: '8px', padding: '8px 12px', backgroundColor: '#fff' }} disabled={!!invoiceFormData.tanggalJatuhTempo}>
                      <option value="">Pilih Termin</option>
                      {terminPembayaranList.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>Rincian Komoditas</label>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      <tr>
                        <th style={{ padding: '12px 16px' }}>Nama Produk</th>
                        <th style={{ padding: '12px 16px' }}>Qty</th>
                        <th style={{ padding: '12px 16px' }}>Harga Satuan</th>
                        <th style={{ padding: '12px 16px' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSO.items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 500 }}>{item.nama_produk}</td>
                          <td style={{ padding: '12px 16px' }}>{item.qty}</td>
                          <td style={{ padding: '12px 16px' }}>Rp {item.harga.toLocaleString('id-ID')}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>Rp {item.subtotal.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', maxWidth: '350px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: '#6B7280' }}>Subtotal:</span>
                    <span>Rp {selectedSO.total_harga.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid #E5E7EB', paddingTop: '8px' }}>
                    <span>Total Tagihan:</span>
                    <span style={{ color: '#991B1B' }}>Rp {selectedSO.total_harga.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#F9FAFB' }}>
              <button type="button" onClick={() => { setShowInvoiceModal(false); setSelectedSO(null); }} style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer' }}>Batal</button>
              <button type="button" onClick={handleFinalizeInvoice} style={{ padding: '8px 20px', backgroundColor: '#7F1D1D', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Simpan & Cetak Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useForm, Head } from "@inertiajs/react";
import { Eye, Pencil, Printer, Plus, Search, ChevronDown, ArrowLeft, Trash2 } from "lucide-react";
import PenjualanKonsinyasiDetail from "@/Pages/Konsinyasi/PenjualanKonsinyasiDetail";

interface Penjualan {
  id_jual_konsinyasi: number;
  no_penjualan: string;
  tgl_penjualan: string;
  id_mitra: number;
  nama_toko: string;
  alamat_toko: string;
  id_konsinyasi_keluar: number;
  no_konsinyasi_keluar: string;
  total_bayar: number;
  keterangan: string;
  status: string;
  jenis_pembayaran?: string;
  jatuh_tempo_tanggal?: string;
  termin_hari?: number | string;
  items?: Array<{
    id_produk: number;
    kode_produk: string;
    nama_produk: string;
    qty_terjual: number;
    harga_jual: number;
    total_penjualan: number;
  }>;
}

interface KonsinyasiKeluar {
  id_konsinyasi_keluar: number;
  no_dokumen: string;
  id_mitra: number;
  nama_toko: string;
  alamat_toko: string;
}

interface ProdukKonsinyasi {
  id_konsinyasi_keluar: number;
  id_produk: number;
  kode_produk: string;
  nama_produk: string;
  harga_konsinyasi: number;
}

interface Props {
  dataPenjualan: Penjualan[];
  dataKonsinyasiKeluar: KonsinyasiKeluar[];
  dataProdukKonsinyasi: ProdukKonsinyasi[];
  nextNoPenjualan: string;
}

export default function PenjualanKonsinyasi({ 
  dataPenjualan, 
  dataKonsinyasiKeluar, 
  dataProdukKonsinyasi, 
  nextNoPenjualan 
}: Props) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchDropdownTerm, setSearchDropdownTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingDetail, setViewingDetail] = useState<Penjualan | null>(null);

  // State lokal rincian produk
  const [inputRow, setInputRow] = useState({
    id_produk: "",
    kode_produk: "",
    nama_produk: "",
    qty_terjual: "",
    harga_jual: 0,
  });

  // Inertia Form
  const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
    no_penjualan: nextNoPenjualan,
    tgl_penjualan: new Date().toISOString().split('T')[0],
    id_mitra: "",
    id_konsinyasi_keluar: "",
    total_bayar: 0,
    keterangan: "",
    status: "Lunas", 
    jenis_pembayaran: "Tunai", 
    jatuh_tempo_tanggal: "",
    termin_hari: "", 
    nama_toko: "", 
    alamat_toko: "",
    items: [] as Array<{
      id_produk: number;
      kode_produk: string;
      nama_produk: string;
      qty_terjual: number;
      harga_jual: number;
      total_penjualan: number;
    }>,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculatedTotalPenjualan = useMemo(() => {
    return data.items.reduce((sum, item) => sum + item.total_penjualan, 0);
  }, [data.items]);

  useEffect(() => {
    setData("total_bayar", calculatedTotalPenjualan);
  }, [calculatedTotalPenjualan]);

  // Helper Perhitungan Jatuh Tempo (Tanggal Penjualan + Jumlah Hari)
  const calculateJatuhTempo = (tglJual: string, termin: string) => {
    if (!tglJual || !termin) return "";
    const date = new Date(tglJual);
    date.setDate(date.getDate() + parseInt(termin));
    return date.toISOString().split('T')[0];
  };

  // Helper Perhitungan Termin Hari (Tanggal Jatuh Tempo - Tanggal Penjualan)
  const calculateTerminHari = (tglJual: string, tglJT: string) => {
    if (!tglJual || !tglJT) return "";
    const start = new Date(tglJual);
    const end = new Date(tglJT);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays.toString() : "0";
  };

  const handleOpenCreateForm = () => {
    reset();
    setData(prev => ({
      ...prev,
      no_penjualan: nextNoPenjualan,
      tgl_penjualan: new Date().toISOString().split('T')[0],
      jenis_pembayaran: "Tunai",
      status: "Lunas",
      jatuh_tempo_tanggal: "",
      termin_hari: "",
    }));
    setSearchDropdownTerm("");
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleInputProdukChange = (idProdukStr: string) => {
    const idProd = parseInt(idProdukStr);
    const prodSelected = dataProdukKonsinyasi.find(
      p => p.id_produk === idProd && p.id_konsinyasi_keluar === parseInt(data.id_konsinyasi_keluar)
    );

    if (prodSelected) {
      setInputRow({
        id_produk: idProdukStr,
        kode_produk: prodSelected.kode_produk,
        nama_produk: prodSelected.nama_produk,
        qty_terjual: "",
        harga_jual: parseFloat(prodSelected.harga_konsinyasi.toString()),
      });
    } else {
      setInputRow({ id_produk: "", kode_produk: "", nama_produk: "", qty_terjual: "", harga_jual: 0 });
    }
  };

  const handleAddItem = () => {
    const qtyTerjualNum = parseInt(inputRow.qty_terjual) || 0;

    if (!inputRow.id_produk) {
      alert("Mohon pilih produk terlebih dahulu!");
      return;
    }
    if (qtyTerjualNum <= 0) {
      alert("Kuantitas terjual harus lebih dari 0!");
      return;
    }

    if (data.items.some(item => item.id_produk === parseInt(inputRow.id_produk))) {
      alert("Produk ini sudah ada dalam daftar rincian laporan!");
      return;
    }

    const newItem = {
      id_produk: parseInt(inputRow.id_produk),
      kode_produk: inputRow.kode_produk,
      nama_produk: inputRow.nama_produk,
      qty_terjual: qtyTerjualNum,
      harga_jual: inputRow.harga_jual,
      total_penjualan: qtyTerjualNum * inputRow.harga_jual,
    };

    setData("items", [...data.items, newItem]);
    setInputRow({ id_produk: "", kode_produk: "", nama_produk: "", qty_terjual: "", harga_jual: 0 });
  };

  const handleRemoveItem = (index: number) => {
    setData("items", data.items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.items.length === 0) {
      alert("Harap masukkan minimal 1 produk ke dalam rincian!");
      return;
    }

    if (editingId) {
      put(route('konsinyasi-penjualan.update', { id: editingId }), {
        onSuccess: () => resetForm(),
        onError: (err) => console.error(err)
      });
    } else {
      post(route('konsinyasi-penjualan.store'), {
        onSuccess: () => resetForm(),
        onError: (err) => console.error(err)
      });
    }
  };

  const handleEdit = (l: Penjualan) => {
    setEditingId(l.id_jual_konsinyasi);
    setSearchDropdownTerm(l.no_konsinyasi_keluar);
    
    setData({
      no_penjualan: l.no_penjualan,
      tgl_penjualan: l.tgl_penjualan,
      id_mitra: l.id_mitra.toString(),
      id_konsinyasi_keluar: l.id_konsinyasi_keluar.toString(),
      total_bayar: l.total_bayar,
      keterangan: l.keterangan || "",
      status: l.status,
      jenis_pembayaran: l.jenis_pembayaran || (l.status === 'Lunas' ? 'Tunai' : 'Kredit'),
      jatuh_tempo_tanggal: l.jatuh_tempo_tanggal || "",
      termin_hari: l.termin_hari?.toString() || "",
      nama_toko: l.nama_toko,
      alamat_toko: l.alamat_toko,
      items: (l.items || []).map(item => ({
        id_produk: item.id_produk, 
        kode_produk: item.kode_produk,
        nama_produk: item.nama_produk,
        qty_terjual: item.qty_terjual,
        harga_jual: item.harga_jual,
        total_penjualan: item.total_penjualan
      })),
    });

    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data laporan penjualan ini?")) {
      destroy(route('konsinyasi-penjualan.destroy', id));
    }
  };

  const handlePrint = (l: Penjualan) => {
    window.open(route('konsinyasi-penjualan.print', l.id_jual_konsinyasi), '_blank');
  };

  const resetForm = () => {
    reset();
    setSearchDropdownTerm("");
    setEditingId(null);
    setIsFormOpen(false);
  };

  const filteredLaporans = dataPenjualan.filter((l) => {
    return (
      l.no_penjualan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.no_konsinyasi_keluar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.nama_toko.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredDropdownOptions = dataKonsinyasiKeluar.filter((k) =>
    k.no_dokumen.toLowerCase().includes(searchDropdownTerm.toLowerCase())
  );

  const availableProdukOptions = useMemo(() => {
    if (!data.id_konsinyasi_keluar) return [];
    return dataProdukKonsinyasi.filter(p => p.id_konsinyasi_keluar === parseInt(data.id_konsinyasi_keluar));
  }, [data.id_konsinyasi_keluar, dataProdukKonsinyasi]);

  if (viewingDetail) {
    return (
      <PenjualanKonsinyasiDetail
        laporan={viewingDetail}
        onBack={() => setViewingDetail(null)}
      />
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <Head title="Laporan Penjualan Konsinyasi" />
      
      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-row items-center gap-4">
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 text-red-800 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-7 h-7" />
            </button>
            <h2 className="text-2xl font-bold text-red-800 tracking-tight">
              {editingId ? "Edit Transaksi Penjualan" : "Input Transaksi Penjualan"}
            </h2>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <strong className="font-semibold block mb-1">Gagal menyimpan data karena:</strong>
              <ul className="list-disc list-inside text-xs text-red-600">
                {Object.values(errors).map((val, idx) => <li key={idx}>{val}</li>)}
              </ul>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border-b border-gray-100 pb-5">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 tracking-wide">No. Invoice</label>
                  <input type="text" value={data.no_penjualan} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed font-medium" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 tracking-wide">Tanggal <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={data.tgl_penjualan} 
                    onChange={(e) => {
                      const newTglJual = e.target.value;
                      setData(prev => ({
                        ...prev,
                        tgl_penjualan: newTglJual,
                        jatuh_tempo_tanggal: calculateJatuhTempo(newTglJual, prev.termin_hari as string)
                      }));
                    }} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:border-red-800 focus:outline-none" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 tracking-wide">Keterangan / Catatan</label>
                  <textarea rows={4} value={data.keterangan} onChange={(e) => setData("keterangan", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 resize-none focus:border-red-800 focus:outline-none" placeholder="Masukkan catatan tambahan bilyet / nomor rekening transfer..." />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1 relative" ref={dropdownRef}>
                  <label className="text-sm font-semibold text-gray-700 tracking-wide">No. Konsinyasi Keluar <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="text" value={searchDropdownTerm} onChange={(e) => { setSearchDropdownTerm(e.target.value); setSearchDropdownOpen(true); }} onFocus={() => setSearchDropdownOpen(true)} disabled={!!editingId} className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 disabled:bg-gray-50 disabled:cursor-not-allowed focus:border-red-800 focus:outline-none" placeholder="Ketik untuk mencari dokumen pengiriman..." />
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
                  </div>

                  {searchDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-50 shadow-lg">
                      {filteredDropdownOptions.length === 0 ? (
                        <div className="px-3 py-2.5 text-xs text-gray-400 italic">Tidak ditemukan</div>
                      ) : (
                        filteredDropdownOptions.map((option) => (
                          <div
                            key={option.id_konsinyasi_keluar}
                            onClick={() => {
                              setData(prev => ({
                                ...prev,
                                id_konsinyasi_keluar: option.id_konsinyasi_keluar.toString(),
                                id_mitra: option.id_mitra.toString(),
                                nama_toko: option.nama_toko,
                                alamat_toko: option.alamat_toko,
                                items: [],
                              }));
                              setSearchDropdownTerm(option.no_dokumen);
                              setSearchDropdownOpen(false);
                            }}
                            className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <div className="font-semibold">{option.no_dokumen}</div>
                            <div className="text-xs text-gray-400">{option.nama_toko}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 tracking-wide">Mitra Toko (otomatis)</label>
                  <input type="text" value={data.nama_toko} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed font-medium" placeholder="Terisi otomatis..." />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 tracking-wide">Alamat Toko (otomatis)</label>
                  <input type="text" value={data.alamat_toko} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed font-medium" placeholder="Alamat otomatis..." />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 tracking-wide">Jenis Pembayaran</label>
                  <select 
                    value={data.jenis_pembayaran} 
                    onChange={(e) => { 
                      const val = e.target.value; 
                      setData(prev => ({ 
                        ...prev, 
                        jenis_pembayaran: val, 
                        status: val === "Tunai" ? "Lunas" : "Belum Lunas",
                        termin_hari: val === "Kredit" ? "30" : "",
                        jatuh_tempo_tanggal: val === "Kredit" ? calculateJatuhTempo(prev.tgl_penjualan, "30") : ""
                      })); 
                    }} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:border-red-800 focus:outline-none"
                  >
                    <option value="Tunai">Tunai (Lunas)</option>
                    <option value="Kredit">Kredit (Piutang)</option>
                  </select>
                </div>

                {data.jenis_pembayaran === "Kredit" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Input Termin Hari */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700 tracking-wide">Termin (Hari) <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        min="1"
                        value={data.termin_hari} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setData(prev => ({
                            ...prev,
                            termin_hari: val,
                            jatuh_tempo_tanggal: calculateJatuhTempo(prev.tgl_penjualan, val)
                          }));
                        }} 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:border-red-800 focus:outline-none" 
                        placeholder="Contoh: 30"
                        required
                      />
                    </div>

                    {/* Input Tanggal Jatuh Tempo */}
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700 tracking-wide">Jatuh Tempo <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        value={data.jatuh_tempo_tanggal} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setData(prev => ({
                            ...prev,
                            jatuh_tempo_tanggal: val,
                            termin_hari: calculateTerminHari(prev.tgl_penjualan, val)
                          }));
                        }} 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:border-red-800 focus:outline-none" 
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Tambah Rincian Produk */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 tracking-wide">Tambah Rincian Produk</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kode</label>
                  <input type="text" value={inputRow.kode_produk} readOnly className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pilih Produk <span className="text-red-500">*</span></label>
                  <select value={inputRow.id_produk} onChange={(e) => handleInputProdukChange(e.target.value)} disabled={!data.id_konsinyasi_keluar} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 disabled:bg-gray-100">
                    <option value="">{data.id_konsinyasi_keluar ? "-- Pilih Produk --" : "-- Pilih No. Konsinyasi Dulu --"}</option>
                    {availableProdukOptions.map((p) => <option key={p.id_produk} value={p.id_produk}>{p.nama_produk}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Harga Satuan</label>
                  <input type="text" value={inputRow.harga_jual ? formatCurrency(inputRow.harga_jual) : ""} readOnly className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Qty <span className="text-red-500">*</span></label>
                  <input type="number" value={inputRow.qty_terjual} onChange={(e) => setInputRow({ ...inputRow, qty_terjual: e.target.value })} disabled={!inputRow.id_produk} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-red-800 focus:outline-none" placeholder="0" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={handleAddItem} className="bg-red-800 hover:bg-red-900 text-white px-6 py-2 rounded-lg text-sm font-semibold cursor-pointer">Tambah Produk</button>
              </div>
            </div>

            {/* Rincian Tabel */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 text-sm font-semibold">
                  <tr>
                    <th className="px-6 py-3">Kode</th>
                    <th className="px-6 py-3">Produk</th>
                    <th className="px-6 py-3 text-right">Qty</th>
                    <th className="px-6 py-3 text-right">Harga Satuan</th>
                    <th className="px-6 py-3 text-right">Subtotal</th>
                    <th className="px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm bg-white">
                  {data.items.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic">Belum ada item produk.</td></tr>
                  ) : (
                    data.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-mono text-gray-500 text-xs">{item.kode_produk}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{item.nama_produk}</td>
                        <td className="px-6 py-4 text-right text-gray-900 font-semibold">{item.qty_terjual}</td>
                        <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(item.harga_jual)}</td>
                        <td className="px-6 py-4 text-right text-gray-900 font-bold">{formatCurrency(item.total_penjualan)}</td>
                        <td className="px-6 py-4 text-center">
                          <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-4">
              <div className="text-right font-bold text-base text-gray-950">
                Total Uang Setoran: <span className="text-xl text-red-800 ml-2">{formatCurrency(calculatedTotalPenjualan)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-100 cursor-pointer">Batal</button>
              <button type="submit" disabled={processing || data.items.length === 0} className={`px-5 py-2 text-sm font-semibold rounded-xl text-white cursor-pointer ${data.items.length === 0 || processing ? "bg-red-800/50 cursor-not-allowed" : "bg-red-800 hover:bg-red-900"}`}>Simpan Transaksi</button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <div className="mb-6 flex flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-red-800 tracking-tight">Daftar Penjualan Konsinyasi</h1>
              <p className="text-sm text-red-800 mt-1">Kelola data realisasi penjualan putus dari toko mitra</p>
            </div>
            <button onClick={handleOpenCreateForm} className="bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium cursor-pointer"><Plus className="w-5 h-5" /> Tambah Penjualan</button>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <input type="text" placeholder="Cari No. Invoice, No. Konsinyasi atau Nama Mitra Toko..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none mb-4" />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 font-semibold text-sm">
                  <tr>
                    <th className="px-6 py-4">No. Invoice</th>
                    <th className="px-6 py-4">No. Konsinyasi</th>
                    <th className="px-6 py-4">Tanggal Lapor</th>
                    <th className="px-6 py-4">Mitra Toko</th>
                    <th className="px-6 py-4 text-center">Metode</th>
                    <th className="px-6 py-4 text-right">Grand Total</th>
                    <th className="px-6 py-4 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-sm">
                  {filteredLaporans.map((l) => (
                    <tr key={l.id_jual_konsinyasi} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{l.no_penjualan}</td>
                      <td className="px-6 py-4"><span className=" text-gray-700 px-2 py-1 rounded text-xs font-semibold">{l.no_konsinyasi_keluar}</span></td>
                      <td className="px-6 py-4">{new Date(l.tgl_penjualan).toLocaleDateString("id-ID")}</td>
                      <td className="px-6 py-4 font-medium">{l.nama_toko}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          (l.jenis_pembayaran || l.status) === 'Tunai' || (l.jenis_pembayaran || l.status) === 'Lunas'
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {l.jenis_pembayaran || 'Tunai'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold">{formatCurrency(l.total_bayar)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => setViewingDetail(l)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 cursor-pointer"><Eye className="w-4 h-4" /></button>
                          {/* <button onClick={() => handleEdit(l)} className="p-2 hover:bg-gray-100 rounded-lg text-red-600 cursor-pointer"><Pencil className="w-4 h-4" /></button> */}
                          <button onClick={() => handlePrint(l)} className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 cursor-pointer"><Printer className="w-4 h-4" /></button>
                          {/* <button onClick={() => handleDelete(l.id_jual_konsinyasi)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
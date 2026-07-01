import React, { useState } from 'react';
import { Eye, Pencil, Plus, Search, Printer, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';

// Struktur data disesuaikan dengan select query t_jual dari Laravel
interface TPendingPenjualan {
  id_jual: number;
  no_jual: string;
  tgl_jual: string;
  no_pesanan: string;
  nama_mitra: string;
  jenis_penjualan: 'Grosir' | 'Eceran';
  metode_pembayaran: 'Tunai' | 'Kredit';
  subtotal: number;
  total_diskon: number;
  total_hpp: number;
  grand_total: number;
}

interface IndexProps {
  penjualan: TPendingPenjualan[]; // Menerima lemparan data otomatis dari PenjualanController
}

export default function Index({ penjualan = [] }: IndexProps) {
  const [searchQuery, setSearchQuery] = useState(''); 

  // --- FILTER SEARCH PADA TABEL ---
  const filteredInvoices = penjualan.filter(inv => 
    inv.no_jual.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.nama_mitra.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.no_pesanan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- FORMAT TANGGAL INDONESIA ---
  const formatTanggalIndo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // --- HANDLER BUTTON DETEKSI ROUTE INERTIA ---
  const handleOpenNewForm = () => {
    // Alur baru: mengarahkan kembali ke manajemen pesanan untuk melakukan alur "Generate" form
    router.get('/pesanan'); 
  };

  const handleViewDetail = (id_jual: number) => {
    // Mengarah ke halaman rincian detail jual item (akan dibahas di file kedua)
    router.get(`/transaksi-penjualan/${id_jual}`);
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* HEADER HALAMAN UTAMA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-red-800">Daftar Penjualan</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Kelola data transaksi penjualan</p>
          </div>
          <button 
            onClick={handleOpenNewForm} 
            className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4"/> Tambah Penjualan
          </button>
        </div>

        {/* CARD KONTENER UTAMA TABEL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* INPUT SEARCH */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari nomor invoice, nomor SO atau nama pelanggan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 text-sm text-gray-700 placeholder-gray-400 bg-white"
            />
          </div>

          {/* DATA UTAMA TABEL */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider">No. Invoice</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider">Ref. No SO</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider">Tanggal</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider">Pelanggan</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider text-center">Metode</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider text-right">Grand Total</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-700">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id_jual} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{inv.no_jual}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">{inv.no_pesanan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatTanggalIndo(inv.tgl_jual)}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{inv.nama_mitra}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                        inv.metode_pembayaran === 'Tunai' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.metode_pembayaran}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-right">
                      Rp {Number(inv.grand_total).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleViewDetail(inv.id_jual)} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md border border-transparent hover:border-blue-200 transition-colors"
                          title="Lihat Rincian Barang"
                        >
                          <Eye className="w-4 h-4"/>
                        </button>
                        <button 
                          onClick={() => window.open(`/transaksi-penjualan/cetak/${inv.id_jual}`, '_blank')} 
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md border border-transparent hover:border-gray-200 transition-colors"
                          title="Cetak Nota Invoice"
                        >
                          <Printer className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-sm text-gray-400 italic bg-white">
                      Tidak ada data transaksi penjualan yang tercatat
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
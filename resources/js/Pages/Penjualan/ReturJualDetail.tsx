import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';

interface ReturPenjualanDetailProps {
  retur: {
    id: string | number;
    noRetur: string;
    tanggal: string;
    noInvoice: string;
    id_jual: number; 
    pelanggan: string;
    catatan?: string;
    items: {
      id_produk?: number; 
      id_harga?: number;  
      kode_produk?: string; 
      produk: string;
      qty: number;
      satuan_produk?: string;      // Properti satuan produk
      kondisiBarang: 'Layak' | 'Perbaikan' | 'Rusak';
      keterangan: string;
      harga: number;
      subtotal: number;
    }[];
    subtotal: number;
    grandTotal: number;
  };
  onBack: () => void;
  onPrint: () => void;
}

export default function ReturPenjualanDetail({ 
  retur, 
  onBack, 
  onPrint 
}: ReturPenjualanDetailProps) {
  
  const getKondisiBadgeColor = (kondisi: string) => {
    switch (kondisi) {
      case 'Layak':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Perbaikan':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Rusak':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Detail Retur Penjualan</h1>
          <p className="text-red-800 font-semibold mt-1">{retur.noRetur}</p>
        </div>

        {/* Tombol Cetak / Print */}
        <div className="flex items-end sm:items-center">
          <button
            onClick={onPrint}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-800 hover:bg-red-950 text-white rounded-lg font-semibold transition-colors shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Retur
          </button>
        </div>
      </div>

      {/* Detail Card Master Transaksi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-400">No. Retur</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{retur.noRetur}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400">No. Invoice Asal</p>
            <p className="text-base font-semibold text-red-800 mt-0.5">{retur.noInvoice}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400">Tanggal Retur</p>
            <p className="text-base font-medium text-gray-900 mt-0.5">
              {new Date(retur.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400">Pelanggan / Mitra</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{retur.pelanggan}</p>
          </div>
          
          {/* Catatan / Keterangan Penjualan */}
          <div className="md:col-span-2 border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-400">Catatan / Keterangan Retur</p>
            <p className="text-sm font-medium text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {retur.catatan ? `${retur.catatan}` : 'Tidak ada catatan tambahan.'}
            </p>
          </div>
        </div>
      </div>

      {/* Items Card Rincian Barang */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-base font-bold text-gray-900">Rincian Item Produk Retur</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
              <tr>
                <th className="px-6 py-3">Kode Produk</th>
                <th className="px-6 py-3">Produk</th>
                <th className="px-6 py-3 text-center">Qty</th>
                <th className="px-6 py-3 text-left">Kondisi Barang</th>
                <th className="px-6 py-3 text-left">Keterangan / Alasan</th>
                <th className="px-6 py-3 text-right">Harga Satuan</th>
                <th className="px-6 py-3 text-right">Total Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700 bg-white">
              {retur.items.map((item, idx) => {
                const namaSatuan = item.satuan_produk || 'Unit';

                return (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    {/* Kolom Kode Produk */}
                    <td className="px-6 py-4 font-medium text-gray-500 whitespace-nowrap">
                      {item.kode_produk || '-'}
                    </td>
                    {/* Kolom Nama Produk */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.produk}
                    </td>
                    {/* Menampilkan Satuan Dinamis */}
                    <td className="px-6 py-4 text-center whitespace-nowrap font-medium">
                      {item.qty} {namaSatuan}
                    </td>
                    {/* Badge Kondisi */}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border ${getKondisiBadgeColor(item.kondisiBarang)}`}>
                        {item.kondisiBarang}
                      </span>
                    </td>
                    {/* Keterangan */}
                    <td className="px-6 py-4 text-gray-500 italic">
                      {item.keterangan || '-'}
                    </td>
                    {/* Harga Satuan */}
                    <td className="px-6 py-4 text-right">
                      Rp {Number(item.harga).toLocaleString('id-ID')}
                    </td>
                    {/* Total Subtotal */}
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      Rp {Number(item.subtotal).toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ringkasan Tagihan Pelanggan */}
      <div className="flex justify-end">
        <div className="w-full md:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal Retur:</span>
            <span className="font-semibold text-gray-900">
              Rp {retur.subtotal.toLocaleString('id-ID')}
            </span>
          </div>
          
          {/* Grand Total */}
          <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3">
            <span>Grand Total Retur:</span>
            <span className="text-xl text-red-800">
              Rp {Number(retur.grandTotal).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
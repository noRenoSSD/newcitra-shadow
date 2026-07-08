import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface KonsinyasiKeluarDetailProps {
  konsinyasi: {
    id_konsinyasi_keluar: number;
    no_order: string;
    tgl_keluar: string;
    nama_toko: string;
    alamat: string;
    keterangan?: string;
    status: string;
    items: {
      id_produk: number;
      nama_produk: string;
      qty: number;
      harga_titip: number;
    }[];
  };
  dataProduk?: { id_produk: number; kode_produk: string }[]; // <-- Ambil master data produk untuk lookup kode
  onBack: () => void;
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

export default function KonsinyasiKeluarDetail({ konsinyasi, dataProduk = [], onBack }: KonsinyasiKeluarDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-row items-center gap-4 text-red-800">
        <button type="button" onClick={onBack} className="p-2 hover:bg-gray-200/60 rounded-xl transition-colors">
          <ArrowLeft className="w-7 h-7" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Dokumen Konsinyasi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Rincian informasi produk menggunakan Harga Konsinyasi khusus.</p>
        </div>
      </div>

      {/* Box Informasi Utama */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pb-5 border-b border-gray-100">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">No. Konsinyasi Keluar</label>
            <input type="text" value={konsinyasi.no_order} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Tanggal Keluar</label>
            <input type="text" value={formatTanggalIndo(konsinyasi.tgl_keluar)} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Toko Mitra Penerima</label>
            <input type="text" value={konsinyasi.nama_toko} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Alamat Kirim</label>
            <input type="text" value={konsinyasi.alamat} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 focus:outline-none" />
          </div>
          
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Keterangan / Catatan Dokumen</label>
            <textarea 
              value={konsinyasi.keterangan || ''} 
              readOnly 
              placeholder=""
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 focus:outline-none" 
              rows={2} 
            />
          </div>
        </div>
      </div>

      {/* Tabel Item Produk */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mt-6">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 font-semibold text-sm border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 w-36">Kode</th>
              <th className="px-6 py-3">Nama Produk</th>
              <th className="px-6 py-3 text-right">Harga Konsinyasi</th>
              <th className="px-6 py-3 text-center w-28">Qty</th>
              <th className="px-6 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-600">
            {konsinyasi.items?.map((item, index) => {
              // PERBAIKAN DI SINI: Cari kode produk berdasarkan id_produk dari master dataProduk
              const produkMaster = dataProduk.find(p => p.id_produk === item.id_produk);
              
              return (
                <tr key={index} className="hover:bg-gray-50/70">
                  {/* Tampilkan kode produk asli jika ketemu, jika tidak baru tampilkan strip */}
                  <td className="px-6 py-3 text-xs font-semibold text-gray-500">
                    {produkMaster ? produkMaster.kode_produk : '-'}
                  </td> 
                  <td className="px-6 py-3 font-medium text-gray-900">{item.nama_produk}</td>
                  <td className="px-6 py-3 text-right text-gray-900 font-medium">{formatCurrency(item.harga_titip)}</td>
                  <td className="px-6 py-3 text-center font-bold">{item.qty} Pcs</td>
                  <td className="px-6 py-3 text-right font-bold text-gray-900">{formatCurrency(item.harga_titip * item.qty)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Grand Total Box */}
      <div className="flex justify-end mb-6 mt-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full md:w-80">
          <div className="flex justify-between items-center font-bold text-gray-900">
            <span className="text-sm">Grand Total:</span>
            <span className="text-red-900 text-lg">
              {formatCurrency(konsinyasi.items?.reduce((sum, item) => sum + (item.harga_titip * item.qty), 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
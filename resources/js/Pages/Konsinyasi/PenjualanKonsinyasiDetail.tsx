import React from "react";
import { ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';

interface DetailItem {
  id_produk: number;
  nama_produk: string;
  qty_terjual: number;
  harga_jual: number;
  total_penjualan: number;
  subtotal?: number;
  satuan_produk?: string; // Diubah opsional jika ada data database lama yang bernilai null
}

interface LaporanDetail {
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
  jatuh_tempo?: string;
  termin_hari?: number | string;
  items?: DetailItem[];
}

interface Props {
  laporan: LaporanDetail;
  onBack?: () => void;
}

// Menggunakan interface Props (bukan any) agar integrasi data dari file utama bersih tanpa memicu error parameter map
export default function PenjualanKonsinyasiDetail({ laporan, onBack }: Props) {
  
  const detailItems = laporan.items || [];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              router.get('/konsinyasi-penjualan'); 
            }
          }}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Detail Penjualan</h1>
        <p className="text-red-800 font-semibold mt-1">{laporan.no_penjualan}</p>
      </div>

      {/* Detail Card Master Transaksi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">No. Invoice</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{laporan.no_penjualan}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">No. Konsinyasi Keluar</p>
            <p className="text-base font-medium text-gray-700 mt-0.5">{laporan.no_konsinyasi_keluar}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Tanggal Lapor Penjualan</p>
            <p className="text-base font-medium text-gray-900 mt-0.5">
              {new Date(laporan.tgl_penjualan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Mitra Penyalur / Toko</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{laporan.nama_toko}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Jenis Pembayaran</p>
            <p className="text-base font-medium text-gray-900 mt-0.5">
              <span className={`font-bold ${laporan.jenis_pembayaran === 'Tunai' ? 'text-green-700' : 'text-red-700'}`}>
                {laporan.jenis_pembayaran || 'Tunai'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Alamat Toko</p>
            <p className="text-base font-medium text-gray-900 mt-0.5">{laporan.alamat_toko || '-'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-semibold text-gray-400 uppercase">Keterangan / Catatan Tambahan</p>
            <p className="text-base font-medium text-gray-700 mt-0.5 italic">{laporan.keterangan || '-'}</p>
          </div>
        </div>
      </div>

      {/* Items Card Rincian Barang */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-base font-bold text-gray-900">Rincian Item Produk Terjual</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
              <tr>
                <th className="px-6 py-3">Produk</th>
                <th className="px-6 py-3 text-center">Qty</th>
                <th className="px-6 py-3 text-right">Harga Jual</th>
                <th className="px-6 py-3 text-right">Total Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700 bg-white">
              {detailItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                    Tidak ada rincian produk yang ditemukan.
                  </td>
                </tr>
              ) : (
                // Ditambahkan penegasan type ": DetailItem" dan ": number" agar parameter tidak dianggap implicit any
                detailItems.map((item: DetailItem, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.nama_produk}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">{item.qty_terjual} {item.satuan_produk || 'Pcs'}</td>
                    <td className="px-6 py-4 text-right">Rp {Number(item.harga_jual).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      Rp {Number(item.subtotal || item.total_penjualan).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ringkasan Tagihan */}
      <div className="flex justify-end">
        <div className="w-full md:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Grand Total:</span>
            <span className="text-xl text-red-800">Rp {Number(laporan.total_bayar).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
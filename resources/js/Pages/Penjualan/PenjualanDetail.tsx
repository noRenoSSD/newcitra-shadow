import { ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react'; // 🔴 1. Pastikan router di-import di sini

interface InvoiceDetailProps {
  invoice: {
    id_jual: number;
    no_jual: string;
    tgl_jual: string;
    no_pesanan: string;
    nama_mitra: string;
    alamat_mitra?: string;
    jenis_penjualan: 'Grosir' | 'Eceran';
    metode_pembayaran: 'Tunai' | 'Kredit';
    subtotal: number;
    total_diskon: number;
    total_hpp: number; 
    grand_total: number;
    items: {
      nama_produk: string;
      qty_jual: number;
      hpp_satuan: number;
      diskon: number;
      subtotal: number;
      harga_jual_satuan: number;
    }[];
  };
  onBack?: () => void; // 🔴 2. Ubah jadi opsional pakai tanda tanya (?) agar tidak error saat dikosongkan
}

export default function InvoiceDetail({ invoice, onBack }: InvoiceDetailProps) {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => {
            // 🔴 3. KUNCI AMAN: Jika parent tidak kirim fungsi onBack, paksa redirect lewat URL Inertia
            if (onBack) {
              onBack();
            } else {
              router.get('/transaksi-penjualan'); 
            }
          }}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Detail Penjualan</h1>
        <p className="text-red-800 font-semibold mt-1">{invoice.no_jual}</p>
      </div>

      {/* Detail Card Master Transaksi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">No. Invoice / No. Jual</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{invoice.no_jual}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Ref. No. Sales Order (SO)</p>
            <p className="text-base font-medium text-gray-700 mt-0.5">{invoice.no_pesanan}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Tanggal Penjualan</p>
            <p className="text-base font-medium text-gray-900 mt-0.5">
              {new Date(invoice.tgl_jual).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Pelanggan / Mitra</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{invoice.nama_mitra}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Jenis & Metode Pembayaran</p>
            <p className="text-base font-medium text-gray-900 mt-0.5">
              <span className="font-semibold text-red-900">{invoice.jenis_penjualan}</span> — Haluan ({invoice.metode_pembayaran})
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Alamat Pengiriman</p>
            <p className="text-base font-medium text-gray-900 mt-0.5">{invoice.alamat_mitra || '-'}</p>
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
                <th className="px-6 py-3 text-center">Diskon</th>
                <th className="px-6 py-3 text-right">Total Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700 bg-white">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.nama_produk}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{item.qty_jual} Unit</td>
                  <td className="px-6 py-4 text-right">Rp {Number(item.harga_jual_satuan).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-center text-red-600 font-medium">
                    {item.diskon > 0 ? `Rp ${Number(item.diskon).toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    Rp {Number(item.subtotal).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ringkasan Tagihan Pelanggan (HPP Bersih & Laba Sudah Dihapus Total) */}
      <div className="flex justify-end">
        <div className="w-full md:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal Transaksi:</span>
            <span className="font-semibold text-gray-900">Rp {Number(invoice.subtotal).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Potongan Diskon Master:</span>
            <span className="font-semibold text-red-600">
              {invoice.total_diskon > 0 ? `- Rp ${Number(invoice.total_diskon).toLocaleString('id-ID')}` : 'Rp 0'}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3">
            <span>Grand Total:</span>
            <span className="text-xl text-red-800">Rp {Number(invoice.grand_total).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
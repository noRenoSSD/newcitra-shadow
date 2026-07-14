import { ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';

interface InvoiceDetailProps {
  invoice: {
    id_jual: number;
    no_jual: string;
    tgl_jual: string;
    no_pesanan: string;
    nama_mitra: string;
    alamat_mitra?: string;
    jenis_penjualan: string; // Menampung 'Penjualan Langsung', 'Maklon', 'Konsinyasi', dll
    metode_pembayaran: 'Tunai' | 'Kredit';
    jatuh_tempo_tanggal?: string; // Menampung tanggal jatuh tempo jika kredit
    subtotal: number; 
    total_hpp: number; 
    grand_total: number;
    keterangan?: string; 
    items: {
      kode_produk?: string; // Kode unik milik produk
      nama_produk: string;
      satuan?: string;      // Satuan kustom produk (Pcs, Box, Kg, dll)
      qty_jual: number;
      hpp_satuan: number;
      diskon: number; 
      subtotal: number; 
      harga_jual_satuan: number;
    }[];
  };
  onBack?: () => void; 
}

export default function InvoiceDetail({ invoice, onBack }: InvoiceDetailProps) {
  
  // ─── RUMUS 1: HITUNG TOTAL SUBOTAL SEBELUM DISKON ───
  const hitungSubtotalSebelumDiskon = invoice.items.reduce((totalAkumulasi, item) => {
    const hargaKotorBaris = item.qty_jual * item.harga_jual_satuan;
    return totalAkumulasi + hargaKotorBaris;
  }, 0);

  // ─── RUMUS 2: HITUNG TOTAL NOMINAL DISKON 1 DOKUMEN ───
  const hitungTotalDiskonDokumen = invoice.items.reduce((totalAkumulasi, item) => {
    const persenDiskon = Number(item.diskon) || 0;
    const hargaKotorBaris = item.qty_jual * item.harga_jual_satuan;
    const nominalDiskonBaris = hargaKotorBaris * (persenDiskon / 100);
    return totalAkumulasi + nominalDiskonBaris;
  }, 0);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => {
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
            <p className="text-sm font-semibold text-gray-400">No. Invoice / No. Jual</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{invoice.no_jual}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400">Ref. No. Sales Order (SO)</p>
            <p className="text-base font-medium text-gray-700 mt-0.5">{invoice.no_pesanan}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400">Tanggal Penjualan</p>
            <p className="text-base font-medium text-gray-900 mt-0.5">
              {new Date(invoice.tgl_jual).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400 ">Pelanggan / Mitra</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{invoice.nama_mitra}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400 ">Jenis & Metode Pembayaran</p>
            <p className="text-base font-medium text-gray-900 mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-red-900">{invoice.jenis_penjualan}</span>
              <span className="text-gray-400">—</span>
              <span className="font-medium text-gray-800">({invoice.metode_pembayaran})</span>
              
              {/* Jika metode Kredit, tampilkan tanggal jatuh tempo di sampingnya */}
              {invoice.metode_pembayaran === 'Kredit' && invoice.jatuh_tempo_tanggal && (
                <span className="text-xs bg-red-50 text-red-800 font-semibold px-2 py-0.5 rounded border border-red-200 ml-1">
                  Jatuh Tempo: {new Date(invoice.jatuh_tempo_tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400 ">Alamat Pengiriman</p>
            <p className="text-base font-medium text-gray-900 mt-0.5">{invoice.alamat_mitra || '-'}</p>
          </div>
          
          {/* Catatan Komparabel Dari Data Pesanan */}
          <div className="md:col-span-2 border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-400 ">Catatan / Keterangan Penjualan</p>
            <p className="text-sm font-medium text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {invoice.keterangan ? `${invoice.keterangan}` : 'Tidak ada catatan tambahan.'}
            </p>
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
                <th className="px-6 py-3">Kode Produk</th>
                <th className="px-6 py-3">Produk</th>
                <th className="px-6 py-3 text-center">Qty</th>
                <th className="px-6 py-3 text-right">Harga Jual</th>
                <th className="px-6 py-3 text-center">Diskon</th>
                <th className="px-6 py-3 text-right">Total Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700 bg-white">
              {invoice.items.map((item, idx) => {
                const nilaiPersen = Number(item.diskon) || 0;
                const namaSatuan = item.satuan || 'Unit'; // Fallback ke 'Unit' jika database null

                return (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    {/* Kolom Kode Produk Baru */}
                    <td className="px-6 py-4 font-medium text-gray-500 whitespace-nowrap">
                      {item.kode_produk || '-'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.nama_produk}</td>
                    {/* Menampilkan Satuan Dinamis */}
                    <td className="px-6 py-4 text-center whitespace-nowrap font-medium">
                      {item.qty_jual} {namaSatuan}
                    </td>
                    <td className="px-6 py-4 text-right">Rp {Number(item.harga_jual_satuan).toLocaleString('id-ID')}</td>
                    
                    {/* Diskon Persen Per Produk */}
                    <td className="px-6 py-4 text-center text-red-600 font-semibold">
                      {nilaiPersen > 0 ? `${nilaiPersen}%` : '-'}
                    </td>
                    
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
          
          {/* Subtotal Sebelum Diskon */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal Transaksi:</span>
            <span className="font-semibold text-gray-900">
              Rp {hitungSubtotalSebelumDiskon.toLocaleString('id-ID')}
            </span>
          </div>
          
          {/* Potongan Diskon Master */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Potongan Diskon Master:</span>
            <span className="font-semibold text-red-600">
              {hitungTotalDiskonDokumen > 0 ? `- Rp ${hitungTotalDiskonDokumen.toLocaleString('id-ID')}` : 'Rp 0'}
            </span>
          </div>
          
          {/* Grand Total */}
          <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3">
            <span>Grand Total:</span>
            <span className="text-xl text-red-800">Rp {Number(invoice.grand_total).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
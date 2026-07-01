import { ArrowLeft } from 'lucide-react';

//Interface Props ini sudah disamakan persis dengan struktur ReturPenjualanItem
interface ReturPenjualanDetailProps {
  retur: {
    id: string;
    noRetur: string;
    tanggal: string;
    noInvoice: string;
    id_jual: number; //Ditambahkan agar tidak error type mismatch
    pelanggan: string;
    items: {
      id_produk?: number; //Ditambahkan opsional agar fleksibel
      id_harga?: number;  //Ditambahkan opsional agar fleksibel
      produk: string;
      qty: number;
      kondisiBarang: 'Layak' | 'Perlu Perbaikan' | 'Rusak';
      keterangan: string;
      harga: number;
      subtotal: number;
    }[];
    subtotal: number;
    grandTotal: number;
  };
  onBack: () => void;
}

export default function ReturPenjualanDetail({ retur, onBack }: ReturPenjualanDetailProps) {
  const getKondisiBadgeColor = (kondisi: string) => {
    switch (kondisi) {
      case 'Layak':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Perlu Perbaikan':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Rusak':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-red-800 hover:text-red-900 font-medium mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>
        <h1 className="text-3xl font-bold text-red-800">Detail Retur Penjualan</h1>
        <p className="text-gray-500 mt-1">{retur.noRetur}</p>
      </div>

      {/* Detail Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider border-b pb-2">Informasi Retur</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">No. Retur</p>
            <p className="text-sm font-semibold text-gray-900">{retur.noRetur}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tanggal</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(retur.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">No. Invoice</p>
            <p className="text-sm font-semibold text-red-800">{retur.noInvoice}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pelanggan</p>
            <p className="text-sm font-semibold text-gray-900">{retur.pelanggan}</p>
          </div>
        </div>
      </div>

      {/* Items Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Detail Produk Retur</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-700">Produk</th>
                <th className="text-center px-6 py-3.5 font-semibold text-gray-700 w-20">Qty</th>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-700 w-40">Kondisi Barang</th>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-700">Keterangan</th>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-700">Harga</th>
                <th className="text-right px-6 py-3.5 font-semibold text-gray-700">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {retur.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.produk}</td>
                  <td className="px-6 py-4 text-center font-bold">{item.qty}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border ${getKondisiBadgeColor(item.kondisiBarang)}`}>
                      {item.kondisiBarang}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 italic">{item.keterangan || '-'}</td>
                  <td className="px-6 py-4">Rp {item.harga.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      <div className="flex justify-end">
        <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2">Ringkasan Retur</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900">Rp {retur.subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-black text-gray-950">
            <span>Grand Total</span>
            <span className="text-red-800 text-lg font-black">Rp {retur.grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
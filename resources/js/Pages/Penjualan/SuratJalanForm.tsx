import { useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Truck } from 'lucide-react';

export default function SuratJalanForm({ pesanan }: any) {
  const { data, setData, post, processing } = useForm({
    id_pesanan: pesanan.id_pesanan,
    nama_pengirim: '',
    kendaraan: '',
    no_plat: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Di-post ke rute pengiriman surat jalan
    post('/transaksi-surat-jalan', {
      onSuccess: () => router.get('/transaksi-surat-jalan') // Arahkan ke halaman logistik surat jalan
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white my-6 shadow-sm border border-gray-200 rounded-xl">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <h1 className="text-xl font-bold text-gray-900 inline-flex items-center gap-2">
          <Truck className="w-5 h-5 text-purple-900" /> Form Dokumen Surat Jalan
        </h1>
        <p className="text-xs text-gray-500 mt-1">Referensi SO: {pesanan.no_pesanan} — Kirim ke: {pesanan.nama_mitra}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengirim / Sopir *</label>
          <input type="text" required placeholder="Nama lengkap driver" value={data.nama_pengirim} onChange={e => setData('nama_pengirim', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-800" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Armada Kendaraan *</label>
            <input type="text" required placeholder="Contoh: Truck Isuzu / Pickup" value={data.kendaraan} onChange={e => setData('kendaraan', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Plat Nomor *</label>
            <input type="text" required placeholder="Contoh: H 1234 AB" value={data.no_plat} onChange={e => setData('no_plat', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-800" />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-800 hover:bg-purple-900 text-white text-sm font-medium rounded-lg transition-colors">
            <Save className="w-4 h-4" /> Proses Surat Jalan
          </button>
        </div>
      </form>
    </div>
  );
}
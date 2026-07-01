import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { ArrowLeft, Save, Truck } from 'lucide-react';

interface Props {
  pesanan: {
    id_pesanan: number;
    no_pesanan: string;
    nama_mitra: string;
  };
}

export default function SuratJalanForm({ pesanan }: Props) {
  // Masukkan id_pesanan langsung ke dalam data default useForm
  const { data, setData, post, processing, errors } = useForm({
    id_pesanan: pesanan?.id_pesanan || '',
    nama_pengirim: '',
    kendaraan: '',
    no_plat: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Inertia useForm post otomatis mengirimkan seluruh isi objek state di atas
    post('/surat-jalan');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white my-6 shadow-sm border border-gray-200 rounded-xl">
      <Head title="Buat Surat Jalan" />
      
      <div className="mb-6 border-b border-gray-100 pb-4">
        <button 
          onClick={() => window.history.back()} 
          type="button"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        
        <h1 className="text-xl font-bold text-gray-900 inline-flex items-center gap-2">
          <Truck className="w-5 h-5 text-purple-900" /> Form Dokumen Surat Jalan
        </h1>
        
        {pesanan ? (
          <p className="text-xs text-gray-500 mt-1">
            Referensi SO: <span className="font-semibold text-gray-700">{pesanan.no_pesanan}</span> — Kirim ke: <span className="font-semibold text-gray-700">{pesanan.nama_mitra}</span>
          </p>
        ) : (
          <p className="text-xs text-red-600 mt-1 font-semibold">Peringatan: Data referensi pesanan gagal terbaca!</p>
        )}
      </div>

      {/* TAMPILAN ERROR VALIDASI / DATABASE DARI LARAVEL */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-800">
          <span className="font-bold block mb-1">Gagal Menyimpan Data:</span>
          <ul className="list-disc pl-5">
            {Object.entries(errors).map(([key, value]) => (
              <li key={key}>{value}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input hidden untuk memastikan id_pesanan ikut terikat di form state */}
        <input type="hidden" value={data.id_pesanan} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengirim / Sopir *</label>
          <input 
            type="text" 
            required 
            placeholder="Nama lengkap driver" 
            value={data.nama_pengirim} 
            onChange={e => setData('nama_pengirim', e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-800 text-gray-800" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Armada Kendaraan *</label>
            <input 
              type="text" 
              required 
              placeholder="Contoh: Truck Isuzu / Pickup" 
              value={data.kendaraan} 
              onChange={e => setData('kendaraan', e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-800 text-gray-800" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Plat Nomor *</label>
            <input 
              type="text" 
              required 
              placeholder="Contoh: H 1234 AB" 
              value={data.no_plat} 
              onChange={e => setData('no_plat', e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-800 text-gray-800" 
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button 
            type="submit" 
            disabled={processing || !data.id_pesanan} 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-800 hover:bg-purple-900 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" /> {processing ? 'Memproses...' : 'Proses Surat Jalan'}
          </button>
        </div>
      </form>
    </div>
  );
}
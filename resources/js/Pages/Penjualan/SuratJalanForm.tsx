import React from 'react';
import { useForm, Head, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
  pesanan?: any;
  konsinyasi?: any;
  onBack?: () => void;
}

export default function SuratJalanForm({ pesanan, konsinyasi, onBack }: Props) {
  const isKonsinyasi = !!konsinyasi;
  const idReferensi = isKonsinyasi ? konsinyasi?.id_konsinyasi : pesanan?.id_pesanan;
  const noDokumen = isKonsinyasi ? konsinyasi?.no_order : pesanan?.no_pesanan;
  const namaTujuan = isKonsinyasi ? konsinyasi?.nama_toko : pesanan?.nama_mitra;
  
  // Ambil keterangan awal untuk dikirim ke backend tanpa ditampilkan di input
  const keteranganBackground = isKonsinyasi ? konsinyasi?.keterangan : pesanan?.keterangan;

  const { data, setData, post, processing, errors } = useForm({
    id_referensi: idReferensi || '',
    nama_pengirim: '',
    kendaraan: '',
    no_plat: '',
    catatan_pengiriman: keteranganBackground || '' // Disimpan di background
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isKonsinyasi) {
      router.post(`/konsinyasi-keluar/generate-sj/${idReferensi}`, {
        pengirim: data.nama_pengirim,
        kendaraan: `${data.kendaraan} (${data.no_plat})`,
        catatan_pengiriman: data.catatan_pengiriman // Tetap terkirim ke database
      }, {
        onSuccess: () => { if (onBack) onBack(); }
      });
    } else {
      router.post('/surat-jalan', {
        id_pesanan: data.id_referensi,
        nama_pengirim: data.nama_pengirim,
        kendaraan: data.kendaraan,
        no_plat: data.no_plat,
        catatan_pengiriman: data.catatan_pengiriman
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white my-6 shadow-sm border border-gray-200 rounded-xl">
      <Head title="Buat Surat Jalan" />
      
      {/* HEADER DENGAN TOMBOL KEMBALI DI KIRI */}
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
        <button 
          type="button" 
          onClick={onBack ? onBack : () => window.history.back()} 
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 text-gray-600"
          title="Kembali"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formulir Surat Jalan</h1>
          <p className="text-sm text-gray-500">Dokumen instruksi pengiriman barang ke mitra.</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
         <p className="text-sm text-gray-600">
           Referensi {isKonsinyasi ? 'Konsinyasi' : 'SO'}: <span className="font-bold text-gray-900">{noDokumen}</span>
           <span className="mx-2">|</span>
           Tujuan: <span className="font-bold text-gray-900">{namaTujuan}</span>
         </p>
      </div>

      {/* ALERT ERROR */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6 text-sm text-red-800">
          <ul className="list-disc pl-5">
            {Object.entries(errors).map(([key, value]) => (
              <li key={key}>{value as string}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Nama Pengirim / Sopir *</label>
            <input 
              type="text" 
              required 
              placeholder="Input nama driver" 
              value={data.nama_pengirim} 
              onChange={e => setData('nama_pengirim', e.target.value)} 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">No. Plat Kendaraan *</label>
            <input 
              type="text" 
              required 
              placeholder="Contoh: H 1234 AB" 
              value={data.no_plat} 
              onChange={e => setData('no_plat', e.target.value)} 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 outline-none" 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Armada / Jenis Kendaraan *</label>
            <input 
              type="text" 
              required 
              placeholder="Contoh: Truck Isuzu / Pickup Box" 
              value={data.kendaraan} 
              onChange={e => setData('kendaraan', e.target.value)} 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 outline-none" 
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button 
            type="submit" 
            disabled={processing} 
            className={`flex items-center gap-2 px-8 py-3 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${
              isKonsinyasi ? 'bg-red-800 hover:bg-red-900' : 'bg-purple-900 hover:bg-black'
            }`}
          >
            <Save className="w-5 h-5" />
            {processing ? 'Sedang Memproses...' : 'Proses & Terbitkan Surat Jalan'}
          </button>
        </div>
      </form>
    </div>
  );
}
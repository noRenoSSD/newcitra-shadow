import { useState, useEffect } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, FileText } from 'lucide-react';

export default function InvoiceForm({ pesanan }: any) {
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [dueType, setDueType] = useState('Hari'); 

  const { flash, errors } = usePage().props as any; // Ambil 'errors' untuk melacak validasi gagal

  useEffect(() => {
    if (flash?.error) {
      alert(flash.error);
    }
  }, [flash?.error]);

  // --- GENERATE OTOMATIS VALUE UNTUK BACKEND ---
  const tanggalHariIni = new Date().toISOString().split('T')[0];
  // Format No Invoice Otomatis: INV-YYYYMMDD-IDPESANAN
  const nomorInvoiceOtomatis = `INV-${tanggalHariIni.replace(/-/g, '')}-${pesanan.id_pesanan}`;

  const { data, setData, post, processing } = useForm({
    id_pesanan: pesanan.id_pesanan,
    no_invoice: nomorInvoiceOtomatis, // SEKARANG SUDAH TERISI
    tgl_invoice: tanggalHariIni,       // SEKARANG SUDAH TERISI
    metode_pembayaran: 'Tunai',
    termin_hari: '',
    jatuh_tempo_tanggal: '',
    total_harga: pesanan.total_harga
  });

  const handlePaymentChange = (method: string) => {
    setPaymentMethod(method);
    setData('metode_pembayaran', method);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kirim data menggunakan rute resmi transaksi-penjualan
    post('/transaksi-penjualan', {
      onSuccess: () => {
         // Paksa redirect setelah sukses
         router.get('/transaksi-penjualan');
      }
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white my-6 shadow-sm border border-gray-200 rounded-xl">
      
      {/* Banner Alert Merah jika terdeteksi duplikasi */}
      {flash?.error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg font-medium text-sm flex items-center gap-2">
          ⚠️ {flash.error}
        </div>
      )}

      {/* Debugging validasi backend jika ada yang tertinggal */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-4 bg-orange-100 border border-orange-400 text-orange-700 rounded-lg text-sm">
          <strong>Gagal Simpan! Periksa Kolom Ini:</strong>
          <ul className="list-disc pl-5 mt-1">
            {Object.values(errors).map((err: any, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}
      
      <div className="mb-6 border-b border-gray-100 pb-4">
        <button type="button" onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <h1 className="text-xl font-bold text-gray-900 inline-flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-800" /> Generate Invoice Penjualan
        </h1>
        <p className="text-xs text-gray-500 mt-1">Referensi SO: {pesanan.no_pesanan} ({pesanan.nama_mitra})</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Input Hidden untuk No & Tgl Invoice agar tetap terkirim ke backend */}
        <input type="hidden" value={data.no_invoice} />
        <input type="hidden" value={data.tgl_invoice} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 w-full">
              <input type="radio" name="payment" checked={paymentMethod === 'Tunai'} onChange={() => handlePaymentChange('Tunai')} className="text-red-800 focus:ring-red-800" />
              <span className="text-sm font-medium text-gray-800">Tunai / Cash</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 w-full">
              <input type="radio" name="payment" checked={paymentMethod === 'Kredit'} onChange={() => handlePaymentChange('Kredit')} className="text-red-800 focus:ring-red-800" />
              <span className="text-sm font-medium text-gray-800">Kredit / Top</span>
            </label>
          </div>
        </div>

        {/* Kondisional jika memilih Kredit */}
        {paymentMethod === 'Kredit' && (
          <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Tentukan Jatuh Tempo Based On:</label>
              <div className="flex gap-4">
                <button type="button" onClick={() => setDueType('Hari')} className={`px-3 py-1.5 text-xs font-medium rounded-md border ${dueType === 'Hari' ? 'bg-red-900 text-white border-red-900' : 'bg-white text-gray-700 border-gray-200'}`}>
                  Termin Hari (TOP)
                </button>
                <button type="button" onClick={() => setDueType('Tanggal')} className={`px-3 py-1.5 text-xs font-medium rounded-md border ${dueType === 'Tanggal' ? 'bg-red-900 text-white border-red-900' : 'bg-white text-gray-700 border-gray-200'}`}>
                  Pilih Tanggal Langsung
                </button>
              </div>
            </div>

            {dueType === 'Hari' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Hari (Termin) *</label>
                <div className="relative">
                  <input type="number" required min="1" placeholder="Contoh: 30" value={data.termin_hari} onChange={e => setData('termin_hari', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 pr-12" />
                  <span className="absolute right-4 top-2 text-sm font-semibold text-gray-400">Hari</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Jatuh Tempo *</label>
                <input type="date" required value={data.jatuh_tempo_tanggal} onChange={e => setData('jatuh_tempo_tanggal', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800" />
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-400 block">Total Tagihan SO</span>
            <span className="text-base font-bold text-gray-900">Rp {pesanan.total_harga.toLocaleString('id-ID')}</span>
          </div>
          <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-4 py-2 bg-red-800 hover:bg-red-900 text-white text-sm font-medium rounded-lg transition-colors">
            <Save className="w-4 h-4" /> Simpan Ke Transaksi
          </button>
        </div>
      </form>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

export default function InvoiceForm({ pesanan }: any) {
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [dueType, setDueType] = useState('Hari'); 

  const { flash, errors } = usePage().props as any; 

  useEffect(() => {
    if (flash?.error) {
      alert(flash.error);
    }
  }, [flash?.error]);

  // --- GENERATE OTOMATIS VALUE UNTUK BACKEND ---
  const tanggalHariIni = new Date().toISOString().split('T')[0];
  const nomorInvoiceOtomatis = `INV-${tanggalHariIni.replace(/-/g, '')}-${pesanan.id_pesanan || pesanan.id}`;

  const { data, setData, post, processing } = useForm({
    id_pesanan: pesanan.id_pesanan || pesanan.id,
    no_invoice: nomorInvoiceOtomatis, 
    tgl_invoice: tanggalHariIni,      
    metode_pembayaran: 'Tunai',
    termin_hari: '',
    jatuh_tempo_tanggal: '', 
    total_harga: pesanan.total_harga || pesanan.total || 0,
    diskon: 0 // Sekarang murni merekam total diskon otomatis dari akumulasi produk
  });

  const handlePaymentChange = (method: string) => {
    setPaymentMethod(method);
    setData('metode_pembayaran', method);
    if (method === 'Tunai') {
      setData(prev => ({
        ...prev,
        metode_pembayaran: 'Tunai',
        termin_hari: '',
        jatuh_tempo_tanggal: ''
      }));
    }
  };

  const handleTerminHariChange = (hari: string) => {
    setData('termin_hari', hari);
    
    if (hari && !isNaN(Number(hari))) {
      const baseDate = data.tgl_invoice ? new Date(data.tgl_invoice) : new Date();
      baseDate.setDate(baseDate.getDate() + parseInt(hari, 10));
      const hasilTanggal = baseDate.toISOString().split('T')[0];
      setData('jatuh_tempo_tanggal', hasilTanggal);
    } else {
      setData('jatuh_tempo_tanggal', '');
    }
  };
  useEffect(() => {
    if (paymentMethod === 'Kredit' && dueType === 'Hari' && data.termin_hari) {
      const baseDate = new Date(data.tgl_invoice);
      baseDate.setDate(baseDate.getDate() + parseInt(data.termin_hari, 10));
      const hasilTanggal = baseDate.toISOString().split('T')[0];
      setData('jatuh_tempo_tanggal', hasilTanggal);
    }
  }, [data.tgl_invoice]);

  // --- LOGIKA KALKULASI FINANSIAL ---
  let hitungSubtotalTransaksiSebelumDiskon = 0;
  let hitungTotalDiskonProduk = 0;

  if (pesanan.items && Array.isArray(pesanan.items)) {
    pesanan.items.forEach((item: any) => {
      const qty = Number(item.qty || item.qty_jual || item.jumlah || item.qty_pesanan || 0);
      const hargaSatuan = Number(item.harga_satuan || item.harga || item.harga_jual_satuan || item.harga_jual || 0);
      const persenDiskon = Number(item.diskon || item.diskon_persen || item.potongan || 0);

      const subtotalBarisSblmDiskon = qty * hargaSatuan;
      const nominalDiskonBaris = subtotalBarisSblmDiskon * (persenDiskon / 100);

      hitungSubtotalTransaksiSebelumDiskon += subtotalBarisSblmDiskon;
      hitungTotalDiskonProduk += nominalDiskonBaris;
    });
  }

  // Karena input diskon master dihilangkan, diskon tambahan murni diisi dari hasil hitung diskon produk
  const nominalTotalDiskon = hitungTotalDiskonProduk;
  const grandTotal = Math.max(0, hitungSubtotalTransaksiSebelumDiskon - nominalTotalDiskon);

  // Sync nilai diskon ke useForm payload agar backend menerima kalkulasi yang valid
  useEffect(() => {
    setData('diskon', nominalTotalDiskon);
  }, [nominalTotalDiskon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/transaksi-penjualan-store', {
      onSuccess: () => {
         router.get('/transaksi-penjualan');
      }
    });
  };

  // --- PARSING JENIS PENJUALAN SECARA AGRESIF ---
  // Mencari kemungkinan string jenis penjualan di dalam objek pesanan
  const rawJenisJual = pesanan.jenis_penjualan || pesanan.jenis_pesanan || pesanan.jenis_jual || pesanan.jenis || '';
  let jenisPenjualanDisplay = 'Penjualan Langsung'; // Default fallback

  if (typeof rawJenisJual === 'string') {
    const lowerJual = rawJenisJual.toLowerCase();
    if (lowerJual.includes('maklon')) jenisPenjualanDisplay = 'Maklon';
    else if (lowerJual.includes('konsinyasi') || lowerJual.includes('titip')) jenisPenjualanDisplay = 'Konsinyasi';
    else if (lowerJual.includes('langsung') || lowerJual.includes('direct') || lowerJual.includes('ecer')) jenisPenjualanDisplay = 'Penjualan Langsung';
    else if (rawJenisJual) jenisPenjualanDisplay = rawJenisJual; // Jika ada nilai lain yang tidak terdeteksi keyword-nya
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Generate Penjualan</h1>
        <p className="text-red-800 font-semibold mt-1">{data.no_invoice}</p>
      </div>

      {/* Banner Validasi Error jika Ada */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-4 bg-orange-100 border border-orange-400 text-orange-700 rounded-lg text-sm">
          <strong>Periksa kembali isian form Anda:</strong>
          <ul className="list-disc pl-5 mt-1">
            {Object.values(errors).map((err: any, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Detail Card Master Transaksi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-400 ">No. Invoice / No. Jual</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{data.no_invoice}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 ">Ref. No. Sales Order (SO)</p>
              <p className="text-base font-medium text-gray-700 mt-0.5">{pesanan.no_pesanan || pesanan.no_order || pesanan.id_pesanan}</p>
            </div>
            
            {/* Input Tanggal Penjualan */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1">Tanggal Penjualan *</label>
              <input 
                type="date" 
                required
                value={data.tgl_invoice} 
                onChange={e => setData('tgl_invoice', e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-800 bg-white"
              />
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-400 ">Pelanggan / Mitra</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{pesanan.nama_mitra || pesanan.mitra?.nama_mitra || pesanan.pelanggan || '-'}</p>
            </div>

            {/* Elemen Pengaturan Interaktif Jenis & Metode Pembayaran */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Jenis & Metode Pembayaran *</label>
              <div className="flex gap-4 items-center">
                {/* Menampilkan Jenis Penjualan dinamis yang sudah diparsing */}
                <span className="font-semibold text-red-900 tracking-wide text-sm">
                  {jenisPenjualanDisplay}
                </span>
                <span className="text-gray-400">—</span>
                <div className="flex gap-3">
                  <label className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 cursor-pointer">
                    <input type="radio" name="payment_method" checked={paymentMethod === 'Tunai'} onChange={() => handlePaymentChange('Tunai')} className="accent-red-800" />
                    Tunai
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 cursor-pointer">
                    <input type="radio" name="payment_method" checked={paymentMethod === 'Kredit'} onChange={() => handlePaymentChange('Kredit')} className="accent-red-800" />
                    Kredit
                  </label>
                </div>
              </div>

              {/* Box Kondisional Jika Memilih Metode Kredit */}
              {paymentMethod === 'Kredit' && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3 max-w-sm">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setDueType('Hari'); setData('jatuh_tempo_tanggal', ''); }} className={`px-2 py-1 text-xs font-medium rounded ${dueType === 'Hari' ? 'bg-red-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      Termin Hari
                    </button>
                    <button type="button" onClick={() => { setDueType('Tanggal'); setData('termin_hari', ''); }} className={`px-2 py-1 text-xs font-medium rounded ${dueType === 'Tanggal' ? 'bg-red-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      Pilih Tanggal
                    </button>
                  </div>
                  {dueType === 'Hari' ? (
                    <div className="relative">
                      <input type="number" required min="1" placeholder="Durasi (Hari)" value={data.termin_hari} onChange={e => handleTerminHariChange(e.target.value)} className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-800 pr-12" />
                      <span className="absolute right-3 top-1 text-xs text-gray-400">Hari</span>
                    </div>
                  ) : (
                    <input type="date" required value={data.jatuh_tempo_tanggal} onChange={e => setData('jatuh_tempo_tanggal', e.target.value)} className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-800" />
                  )}
                  {data.jatuh_tempo_tanggal && (
                    <p className="text-xs text-red-800 font-medium">Jatuh Tempo: {data.jatuh_tempo_tanggal}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-400 ">Alamat Pengiriman</p>
              <p className="text-base font-medium text-gray-900 mt-0.5">
                {pesanan.alamat_mitra || pesanan.alamat || pesanan.alamat_kirim || pesanan.mitra?.alamat || '-'}
              </p>
            </div>
            
            {/* Catatan Bawaan SO */}
            <div className="md:col-span-2 border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-400 ">Catatan / Keterangan Penjualan</p>
              <p className="text-sm font-medium text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {pesanan.keterangan || pesanan.catatan || pesanan.keterangan_pesanan || pesanan.keterangan_so 
                  ? `${pesanan.keterangan || pesanan.catatan || pesanan.keterangan_pesanan || pesanan.keterangan_so}` 
                  : 'Tidak ada catatan tambahan.'}
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
                {pesanan.items && pesanan.items.map((item: any, idx: number) => {
                  const nilaiPersen = Number(item.diskon || item.diskon_persen || item.potongan || 0);
                  const hargaSatuan = Number(item.harga_satuan || item.harga || item.harga_jual_satuan || item.harga_jual || 0);
                  const qty = Number(item.qty || item.qty_jual || item.jumlah || item.qty_pesanan || 0);
                  
                  const subtotalBarisSblmDiskon = qty * hargaSatuan;
                  const nominalDiskonBaris = subtotalBarisSblmDiskon * (nilaiPersen / 100);
                  const totalSubtotalSetelahDiskon = subtotalBarisSblmDiskon - nominalDiskonBaris;

                  // --- METODE DETEKSI KODE PRODUK SECARA MENDALAM ---
                  // Melacak semua potensi penempatan kode produk, termasuk di dalam objek relasi 'produk' atau 'barang'
                  const kodeProduk = item.kode_produk || 
                                     item.produk?.kode_produk || 
 '';

                  const namaSatuan = item.satuan || item.nama_satuan || item.satuan_produk || item.produk?.satuan || 'Unit';
                  const namaProdukDisplay = item.nama_produk || item.nama_barang || item.produk?.nama_produk || item.barang?.nama_barang || 'Produk Tidak Diketahui';

                  return (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        {/* Nama Produk Bersandingan Langsung dengan Kode Produk */}
                        <div className="flex items-baseline gap-2">
                          <p className="font-medium text-gray-900">{kodeProduk}</p>
                          {/* {kodeProduk && (
                            <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                              #{kodeProduk}
                            </span>
                          )} */}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left whitespace-nowrap font-medium">
                        {namaProdukDisplay}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap font-medium">
                        {qty} {namaSatuan}
                      </td>
                      <td className="px-6 py-4 text-right">Rp {hargaSatuan.toLocaleString('id-ID')}</td>
                      
                      <td className="px-6 py-4 text-center font-semibold">
                        {nilaiPersen > 0 ? `${nilaiPersen}%` : '-'}
                      </td>
                      
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        Rp {totalSubtotalSetelahDiskon.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ringkasan Tagihan Pelanggan */}
        <div className="flex flex-col items-end space-y-4">
          <div className="w-full md:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
            
            {/* Subtotal Transaksi (Kotor sebelum diskon) */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal Transaksi:</span>
              <span className="font-semibold text-gray-900">
                Rp {hitungSubtotalTransaksiSebelumDiskon.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Total nominal akumulasi diskon produk (Input diskon master telah DIHAPUS) */}
            <div className="flex justify-between text-sm ">
              <span>Total Diskon:</span>
              <span className="font-semibold">
                - Rp {nominalTotalDiskon.toLocaleString('id-ID')}
              </span>
            </div>
            
            {/* Grand Total */}
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3">
              <span>Grand Total:</span>
              <span className="text-xl text-red-800">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Tombol Aksi Form */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={processing} 
              className="inline-flex items-center gap-2 px-5 py-2 bg-red-800 hover:bg-red-900 text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer disabled:bg-gray-400"
            >
              <Save className="w-4 h-4" /> Simpan Ke Transaksi
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
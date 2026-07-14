import React, { useState } from 'react';
import { useForm, router, Head } from '@inertiajs/react';
import { Eye, Trash2, Search, Printer, Pencil, X, Check } from 'lucide-react'; 

interface SuratJalanItem {
  id_pesanan_detail?: number;
  id_konsinyasi_detail?: number;
  id_produk: number;
  kode_produk?: string;
  nama_produk: string;
  satuan_produk?: string;
  qty: number;
}

interface DBStatusSuratJalan {
  id_surat_jalan: number;
  no_surat_jalan: string;
  tgl_surat_jalan: string;
  no_pesanan: string | null;
  no_invoice?: string | null; // 👈 Menambahkan nomor invoice pendukung faktur jika ada
  nama_mitra: string | null;
  konsinyasi_no_order: string | null;
  konsinyasi_nama_toko: string | null;
  konsinyasi_alamat: string | null;
  nama_pengirim: string;
  kendaraan: string;
  no_plat: string;
  alamat: string | null; 
  status: 'Diproses' | 'Dikirim' | 'Terkirim';
  catatan?: string; 
  items?: SuratJalanItem[];
  [key: string]: any; 
}

interface Props {
  suratJalans: DBStatusSuratJalan[];
}

export default function SuratJalan({ suratJalans }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingDetail, setViewingDetail] = useState<DBStatusSuratJalan | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedPrint, setSelectedPrint] = useState<DBStatusSuratJalan | null>(null);
  
  const { data, setData } = useForm({
    status: 'Diproses' as 'Diproses' | 'Dikirim' | 'Terkirim'
  });

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus surat jalan ini?')) {
      router.delete(`/surat-jalan/${id}`, {
        onSuccess: () => {
          if (viewingDetail?.id_surat_jalan === id) setViewingDetail(null);
        }
      });
    }
  };

  const handleStartEdit = (sj: DBStatusSuratJalan) => {
    setEditingId(sj.id_surat_jalan);
    setData('status', sj.status);
  };

  const handleSaveStatus = (id: number) => {
    router.put(`/surat-jalan/${id}/status`, { status: data.status }, {
      onSuccess: () => {
        setEditingId(null);
        if (viewingDetail?.id_surat_jalan === id) {
          setViewingDetail(prev => prev ? { ...prev, status: data.status as any } : null);
        }
      }
    });
  };

  // Logika pemicu cetak nota instan langsung
  const handlePrintAction = (sj: DBStatusSuratJalan) => {
    setSelectedPrint(sj);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const getNoReferensi = (sj: DBStatusSuratJalan) => {
    return sj.no_pesanan || sj.konsinyasi_no_order || '-';
  };

  const getNamaMitra = (sj: DBStatusSuratJalan) => {
    return sj.nama_mitra || sj.konsinyasi_nama_toko || '-';
  };

  const getAlamatKirim = (sj: DBStatusSuratJalan) => {
    return sj.alamat || sj.konsinyasi_alamat || '';
  };

  const formatTanggalLengkap = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredSuratJalans = (suratJalans || []).filter(sj => {
    const noSj = (sj.no_surat_jalan || '').toLowerCase();
    const noRef = getNoReferensi(sj).toLowerCase();
    const mitra = getNamaMitra(sj).toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return noSj.includes(query) || noRef.includes(query) || mitra.includes(query);
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Terkirim': return 'bg-green-100 text-green-800 border-green-200';
      case 'Dikirim': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Diproses':
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Head title="Daftar Surat Jalan" />

      {/* ─── AREA DASHBOARD / WEB UTAMA (Tersembunyi otomatis saat print) ─── */}
      <div className="print:hidden space-y-6">
        
        {/* VIEW DETAIL CONDITIONAL RENDERING */}
        {viewingDetail ? (
          <div className="space-y-6">
            <button
              onClick={() => setViewingDetail(null)}
              className="flex items-center gap-2 text-red-800 hover:text-red-900 font-medium transition-colors cursor-pointer"
            >
              &larr; Kembali ke Daftar
            </button>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Detail Surat Jalan</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Status Pengiriman:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(viewingDetail.status)}`}>
                  {viewingDetail.status}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-4 border-b border-gray-100 pb-2">Informasi Ekspedisi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">No. Surat Jalan</p>
                  <p className="text-base font-semibold text-gray-900">{viewingDetail.no_surat_jalan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Transaksi</p>
                  <p className="text-base font-medium text-gray-900">{formatTanggalLengkap(viewingDetail.tgl_surat_jalan)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">No. Pesanan / SO</p>
                  <p className="text-base font-medium text-gray-900">{viewingDetail.no_pesanan || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">No. Invoice Terkait</p>
                  <p className="text-base font-medium text-gray-900">{viewingDetail.no_invoice || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pelanggan / Mitra</p>
                  <p className="text-base font-medium text-gray-900">{getNamaMitra(viewingDetail)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nama Driver / Pengirim</p>
                  <p className="text-base font-medium text-gray-900">{viewingDetail.nama_pengirim || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Armada & Plat Nomor</p>
                  <p className="text-base font-medium text-gray-900">{viewingDetail.kendaraan} ({viewingDetail.no_plat})</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Alamat Tujuan Pengiriman</p>
                  <p className="text-sm font-medium text-gray-800 mt-1 leading-relaxed">
                    {getAlamatKirim(viewingDetail) || <span className="text-gray-400 italic">Alamat tidak terdata</span>}
                  </p>
                </div>
                <div className="md:col-span-2 border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500">Catatan Pengiriman</p>
                  <p className="text-sm font-medium text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {viewingDetail.catatan || 'Tidak ada catatan pengiriman.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-4 border-b border-gray-100 pb-2">Rincian Barang Dikirim</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-xs font-semibold text-gray-600 tracking-wider">
                      <th className="px-6 py-3">Kode Produk</th>
                      <th className="px-6 py-3">Nama Produk</th>
                      <th className="px-6 py-3 text-center">Jumlah / Qty</th>
                      <th className="px-6 py-3 text-center">Satuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {(viewingDetail.items || []).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 text-sm">
                        <td className="px-6 py-4 text-gray-500">{item.kode_produk || '-'}</td>
                        <td className="px-6 py-4 text-gray-900 font-medium">{item.nama_produk}</td>
                        <td className="px-6 py-4 text-gray-900 text-center font-semibold">{item.qty}</td>
                        <td className="px-6 py-4 text-gray-600 text-center">{item.satuan_produk || 'Pcs'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* TABEL UTAMA */
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Daftar Surat Jalan</h1>
              <p className="text-sm text-gray-500 mt-1">Kelola data surat jalan pengiriman</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nomor surat jalan, mitra, atau nomor pesanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 bg-white text-gray-700"
                />
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <th className="px-6 py-3.5">No. Surat Jalan</th>
                      <th className="px-6 py-3.5">Tanggal</th>
                      <th className="px-6 py-3.5">No. Pesanan / Ref SO</th>
                      <th className="px-6 py-3.5">Pelanggan / Mitra</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-700">
                    {filteredSuratJalans.map((sj) => (
                      <tr key={sj.id_surat_jalan} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{sj.no_surat_jalan}</td>
                        <td className="px-6 py-4 text-gray-600">{formatTanggalLengkap(sj.tgl_surat_jalan)}</td>
                        <td className="px-6 py-4 text-gray-500 font-medium">{getNoReferensi(sj)}</td>
                        <td className="px-6 py-4 text-gray-900 font-medium">{getNamaMitra(sj)}</td>
                        <td className="px-6 py-4">
                          {editingId === sj.id_surat_jalan ? (
                            <select
                              value={data.status}
                              onChange={(e) => setData('status', e.target.value as any)}
                              className="p-1.5 text-xs font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 bg-white text-gray-800"
                            >
                              <option value="Diproses">Diproses</option>
                              <option value="Dikirim">Dikirim</option>
                              <option value="Terkirim">Terkirim</option>
                            </select>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(sj.status)}`}>
                              {sj.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {editingId === sj.id_surat_jalan ? (
                              <>
                                <button
                                  onClick={() => handleSaveStatus(sj.id_surat_jalan)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors border border-green-200 cursor-pointer"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors border border-gray-200 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setViewingDetail(sj)}
                                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                                  title="Lihat Detail"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStartEdit(sj)}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                                  title="Ubah Status"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(sj.id_surat_jalan)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handlePrintAction(sj)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                  title="Print Surat Jalan"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSuratJalans.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-400 italic bg-white">
                          Belum ada data dokumen surat jalan dalam database
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRINT HARDCOPY AREA - CLEAN SURAT JALAN */}
{selectedPrint && (
    <div id="surat-jalan-print-area" className="hidden print:block bg-white p-4 text-black text-sm print:absolute print:top-0 print:left-0 print:w-full print:m-0 print:p-0 print:z-9999">
        
        {/* KUNCI SAKTI: Isolasi cetakan, hilangkan bayangan/modal web lain */}
        <style dangerouslySetInnerHTML={{__html: `
            @media print {
                body * {
                    visibility: hidden !important;
                }
                #surat-jalan-print-area, #surat-jalan-print-area * {
                    visibility: visible !important;
                }
                #surat-jalan-print-area {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    background: white !important;
                    box-shadow: none !important;
                }
            }
        `}} />

        {/* HEADER SURAT JALAN */}
        <div className="border-b border-gray-900 pb-4 mb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide">SURAT JALAN / PENGIRIMAN</h1>
                    <p className="text-lg font-semibold mt-1 text-gray-900">{selectedPrint.no_surat_jalan}</p>
                </div>
                <div className="text-right text-xs text-gray-700">
                    <p className="font-bold text-black">CV. JAYA MANDIRI UTAMA</p>
                    <p>Jl. Industri Pangan Raya No. 12</p>
                    <p>Semarang, Jawa Tengah</p>
                </div>
            </div>
        </div>

        {/* DOKUMEN REFERENSI & DETAIL TUJUAN */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
            <div>
                <p className="text-gray-400 uppercase font-semibold tracking-wider text-[10px]">Tujuan Pengiriman:</p>
                <p className="font-bold text-sm mt-1 text-gray-900">{getNamaMitra(selectedPrint)}</p>
                <p className="mt-1 text-gray-600 leading-relaxed">
                    {getAlamatKirim(selectedPrint) || 'Alamat tidak terdata secara lengkap.'}
                </p>
            </div>
            <div className="space-y-1.5">
                <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-500">Tanggal Pengiriman:</span>
                    <span className="font-medium">{formatTanggalLengkap(selectedPrint.tgl_surat_jalan)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-500">No. Sales Order (SO):</span>
                    <span className="font-semibold text-gray-900">{selectedPrint.no_pesanan || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-500">No. Invoice Terkait:</span>
                    <span className="font-semibold text-gray-900">{selectedPrint.no_invoice || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-500">Nama Kurir / Supir:</span>
                    <span className="text-gray-800">{selectedPrint.nama_pengirim || '-'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Armada Kendaraan:</span>
                    <span className="font-medium text-gray-900">{selectedPrint.kendaraan} ({selectedPrint.no_plat})</span>
                </div>
            </div>
        </div>

        {/* TABEL BARANG */}
        <table className="w-full text-xs text-left border-collapse mb-6">
            <thead>
                <tr className="border-b border-t border-gray-900 text-gray-900 font-bold">
                    <th className="py-2.5 pl-2 w-1/4">Kode Produk</th>
                    <th className="py-2.5 w-1/2">Nama Barang / Deskripsi</th>
                    <th className="py-2.5 text-center w-1/8">Qty</th>
                    <th className="py-2.5 text-center w-1/8 pr-2">Satuan</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {(selectedPrint.items || []).map((item, index) => (
                    <tr key={index} className="align-top hover:bg-gray-50/50">
                        <td className="py-3 pl-2 font-medium text-gray-900">{item.kode_produk || '-'}</td>
                        <td className="py-3 text-gray-800">{item.nama_produk}</td>
                        <td className="py-3 text-center font-semibold text-gray-900">{item.qty}</td>
                        <td className="py-3 text-center pr-2 text-gray-600">{item.satuan_produk || 'Pcs'}</td>
                    </tr>
                ))}
                {(selectedPrint.items || []).length === 0 && (
                    <tr>
                        <td colSpan={4} className="text-center py-6 italic text-gray-400">
                            Tidak ada rincian barang dalam paket pengiriman ini.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>

        {/* FOOTER & CATATAN DRIVER */}
        <div className="flex justify-between items-start text-xs mb-12">
            <div className="w-2/3 border-l-2 border-gray-300 pl-3 py-1">
                <span className="font-semibold block text-gray-400 uppercase text-[10px] tracking-wider">Catatan Ekspedisi / Pengiriman:</span>
                <p className="italic text-gray-600 mt-1 leading-relaxed">{selectedPrint.catatan || 'Tidak ada instruksi khusus.'}</p>
            </div>
        </div>

        {/* TANDA TANGAN TRIPARTIT */}
        <div className="grid grid-cols-3 gap-6 text-center text-xs mt-20">
            <div>
                <p className="text-gray-400 mb-16">Dibuat Oleh,</p>
                <div className="w-28 mx-auto border-b border-gray-400"></div>
                <p className="mt-1.5 font-medium text-gray-500">Logistik / Gudang</p>
            </div>
            <div>
                <p className="text-gray-400 mb-16">Pengirim / Driver,</p>
                <div className="w-28 mx-auto border-b border-gray-400"></div>
                <p className="mt-1.5 font-semibold text-gray-700">{selectedPrint.nama_pengirim || '.......................'}</p>
            </div>
            <div>
                <p className="text-gray-400 mb-16">Diterima Dengan Baik,</p>
                <div className="w-28 mx-auto border-b border-gray-400"></div>
                <p className="mt-1.5 font-bold text-gray-700">{getNamaMitra(selectedPrint)}</p>
            </div>
        </div>
    </div>
)}
    </div>
  );
}
import React, { useState } from 'react';
import { useForm, router, Head } from '@inertiajs/react';
import { Eye, Trash2, Search, Printer, Pencil, X, Check } from 'lucide-react'; 

interface SuratJalanItem {
  id_pesanan_detail?: number;
  id_konsinyasi_detail?: number;
  id_produk: number;
  kode_produk?: string;   // 👈 Menambahkan properti kode_produk opsional
  nama_produk: string;
  satuan_produk?: string; // 👈 Menambahkan properti satuan_produk opsional
  qty: number;
}

interface DBStatusSuratJalan {
  id_surat_jalan: number;
  no_surat_jalan: string;
  tgl_surat_jalan: string;
  no_pesanan: string | null;
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

  const getNoReferensi = (sj: DBStatusSuratJalan) => {
    return sj.no_pesanan || sj.konsinyasi_no_order || '-';
  };

  const getNamaMitra = (sj: DBStatusSuratJalan) => {
    return sj.nama_mitra || sj.konsinyasi_nama_toko || '-';
  };

  const getAlamatKirim = (sj: DBStatusSuratJalan) => {
    return sj.alamat || sj.konsinyasi_alamat || '';
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

  // --- RENDERING DETAIL MODAL ---
  if (viewingDetail) {
    const listBarang = viewingDetail.items || [];

    return (
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setViewingDetail(null)}
          className="flex items-center gap-2 text-red-800 hover:text-red-900 mb-4 font-medium transition-colors"
        >
          &larr; Kembali ke Daftar
        </button>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Detail Surat Jalan</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Status Pengiriman:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(viewingDetail.status)}`}>
              {viewingDetail.status}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-4 border-b border-gray-100 pb-2">Informasi Ekspedisi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">No. Surat Jalan</p>
              <p className="text-base font-semibold text-gray-900">{viewingDetail.no_surat_jalan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tanggal Transaksi</p>
              <p className="text-base font-medium text-gray-900">{viewingDetail.tgl_surat_jalan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">No. Pesanan / Referensi</p>
              <p className="text-base font-medium text-gray-900">{getNoReferensi(viewingDetail)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nama Driver / Pengirim</p>
              <p className="text-base font-medium text-gray-900">{viewingDetail.nama_pengirim || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pelanggan / Mitra</p>
              <p className="text-base font-medium text-gray-900">{getNamaMitra(viewingDetail)}</p>
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
                {viewingDetail.catatan ? `${viewingDetail.catatan}` : 'Tidak ada catatan pengiriman.'}
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
                  {/* ─── KEPALA TABEL TERBARU ─── */}
                  <th className="px-6 py-3">Kode Produk</th>
                  <th className="px-6 py-3">Nama Produk</th>
                  <th className="px-6 py-3 text-center">Jumlah / Qty</th>
                  <th className="px-6 py-3 text-center">Satuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {listBarang.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* ─── BARIS ISI DATA TERBARU ─── */}
                    <td className="px-6 py-4 text-sm text-gray-500 ">{item.kode_produk || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.nama_produk || 'Produk Tidak Diketahui'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center font-semibold">{item.qty || item.jumlah || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{item.satuan_produk || 'Pcs'}</td>
                  </tr>
                ))}
                {listBarang.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-sm text-gray-400 italic">
                      Tidak ada rincian produk untuk surat jalan ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING TABEL UTAMA ---
  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Head title="Daftar Surat Jalan" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black-800 inline-flex items-center gap-2"> Daftar Surat Jalan </h1>
        <p className="text-sm text-black-500 mt-1">Kelola data surat jalan pengiriman</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor surat jalan, mitra, atau nomor pesanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-red-800 text-gray-600 placeholder-gray-400 bg-white"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr className="text-sm font-semibold text-gray-600">
                <th className="px-6 py-4">No. Surat Jalan</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">No. Pesanan / Referensi</th>
                <th className="px-6 py-4">Pelanggan / Mitra</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredSuratJalans.map((sj) => (
                <tr key={sj.id_surat_jalan} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{sj.no_surat_jalan}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sj.tgl_surat_jalan}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{getNoReferensi(sj)}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{getNamaMitra(sj)}</td>
                  <td className="px-6 py-4 text-sm">
                    {editingId === sj.id_surat_jalan ? (
                      <select
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value as any)}
                        className="p-1.5 text-xs font-medium border border-gray-300 rounded focus:outline-none focus:border-red-800 bg-white text-gray-800"
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
                    <div className="flex items-center justify-center gap-2">
                      {editingId === sj.id_surat_jalan ? (
                        <>
                          <button
                            onClick={() => handleSaveStatus(sj.id_surat_jalan)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg border border-green-200"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setViewingDetail(sj)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStartEdit(sj)}
                            className="p-2 text-amber-600 hover:bg-gray-100 rounded-lg"
                            title="Ubah Status"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sj.id_surat_jalan)}
                            className="p-2 text-red-600 hover:bg-gray-100 rounded-lg"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Print Nota"
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
                  <td colSpan={6} className="text-center py-8 text-sm text-gray-400 italic bg-white">
                    Belum ada data dokumen surat jalan dalam database
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
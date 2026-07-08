import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash2, Plus, ArrowLeft, Search } from 'lucide-react';
import { ReturKonsinyasiDetail } from './ReturKonsinyasiDetail';

// ================= INTERFACE TYPESCRIPT (LARAVEL PROPS) =================
interface ProductKonsinyasi {
    id_konsinyasi_keluar: number;
    id_produk: number;
    kode_produk: string;
    nama_produk: string;
    harga: number;
    qty_kirim: number;
}

interface KonsinyasiKeluarDoc {
    id_konsinyasi_keluar: number;
    no_dokumen: string;
    nama_toko: string;
}

interface HistoryRetur {
    id_retur_konsinyasi: number;
    no_retur_konsinyasi: string;
    tgl_retur_konsinyasi: string;
    no_konsinyasi_keluar: string;
    nama_toko: string;
    kondisi_list: string;
    items: FormItemType[];
}

interface PageProps {
    dataRetur: HistoryRetur[];
    dataKonsinyasiKeluar: KonsinyasiKeluarDoc[];
    dataProdukKonsinyasi: ProductKonsinyasi[];
    nextNoRetur: string;
}

interface FormItemType {
    id_produk: number | string;
    nama_produk: string;
    qty_kirim: number;
    qty: number;
    kondisi_barang: 'Layak' | 'Perlu Perbaikan' | 'Rusak' | '';
    keterangan: string;
    isRetured: boolean;
}

interface FormDataType {
    no_retur_konsinyasi: string;
    tgl_retur_konsinyasi: string;
    id_konsinyasi_keluar: string | number;
    total_perbaikan: number; // Disinkronkan dengan database
    total_kerugian: number;  // Disinkronkan dengan database
    items: FormItemType[];
}

export default function ReturKonsinyasi() {
    const { dataRetur = [], dataKonsinyasiKeluar = [], dataProdukKonsinyasi = [], nextNoRetur = '' } = usePage<any>().props as unknown as PageProps;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewingDetail, setViewingDetail] = useState<HistoryRetur | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);

    const kondisiBarangList: ('Layak' | 'Perlu Perbaikan' | 'Rusak')[] = ['Layak', 'Perlu Perbaikan', 'Rusak'];

    // FIX: Menambahkan 'transform' ke dalam destructuring useForm agar bisa dipanggil saat submit
    const { data, setData, post, put, transform, processing, reset } = useForm<FormDataType>({
        no_retur_konsinyasi: '',
        tgl_retur_konsinyasi: '',
        id_konsinyasi_keluar: '',
        total_perbaikan: 0,
        total_kerugian: 0,
        items: []
    });

    const handleOpenNewForm = () => {
        setData({
            no_retur_konsinyasi: nextNoRetur,
            tgl_retur_konsinyasi: new Date().toISOString().split('T')[0],
            id_konsinyasi_keluar: '',
            total_perbaikan: 0,
            total_kerugian: 0,
            items: []
        });
        setEditingId(null);
        setIsFormOpen(true);
    };

    const handleKonsinyasiChange = (idKon: string) => {
        if (idKon) {
            const produkTerkait = dataProdukKonsinyasi.filter(
                p => p.id_konsinyasi_keluar === parseInt(idKon)
            );

            const mappedItems: FormItemType[] = produkTerkait.map(item => {
                const qtyKirimSistem = item.qty_kirim ?? (item as any).qty ?? (item as any).jumlah ?? 0; 

                return {
                    id_produk: item.id_produk,
                    nama_produk: item.nama_produk,
                    qty_kirim: qtyKirimSistem, 
                    qty: 0, 
                    kondisi_barang: '',
                    keterangan: '',
                    isRetured: true
                };
            });

            setData(prev => ({ 
                ...prev, 
                id_konsinyasi_keluar: idKon, 
                items: mappedItems,
                total_perbaikan: 0,
                total_kerugian: 0
            }));
        } else {
            setData(prev => ({ ...prev, id_konsinyasi_keluar: '', items: [], total_perbaikan: 0, total_kerugian: 0 }));
        }
    };

    const handleItemRowChange = (index: number, field: keyof FormItemType, value: any) => {
        const updatedItems = [...data.items];
        const item = { ...updatedItems[index] };

        if (field === 'qty') {
            const inputQty = parseInt(value) || 0;
            if (inputQty > item.qty_kirim) {
                alert(`Jumlah retur tidak boleh melebihi qty terkirim (${item.qty_kirim})`);
                item.qty = item.qty_kirim;
            } else {
                item.qty = inputQty;
            }
        } else if (field === 'kondisi_barang') {
            item.kondisi_barang = value;
        } else if (field === 'keterangan') {
            item.keterangan = value;
        }

        updatedItems[index] = item;

        let kalkulasiTotalPerbaikan = 0;
        let kalkulasiTotalKerugian = 0;

        updatedItems.forEach(itm => {
            if (itm.isRetured && itm.qty > 0) {
                const masterProduk = dataProdukKonsinyasi.find(p => p.id_produk === parseInt(itm.id_produk as string));
                const hargaSatuan = masterProduk ? parseInt(masterProduk.harga as any) || 0 : 0;
                const subtotalItem = hargaSatuan * itm.qty;

                if (itm.kondisi_barang === 'Perlu Perbaikan') kalkulasiTotalPerbaikan += subtotalItem;
                if (itm.kondisi_barang === 'Rusak') kalkulasiTotalKerugian += subtotalItem;
            }
        });

        setData(prev => ({
            ...prev,
            items: updatedItems,
            total_perbaikan: kalkulasiTotalPerbaikan,
            total_kerugian: kalkulasiTotalKerugian
        }));
    };

    const handleRemoveRow = (index: number) => {
        handleItemRowChange(index, 'qty', 0);
    };

    const activeItems = data.items.filter(item => item.isRetured && item.qty > 0);

    const handleSubmit = () => {
        if (!data.id_konsinyasi_keluar) {
            alert('Mohon pilih dokumen konsinyasi asal!');
            return;
        }
        
        const itemAkanDiretur = data.items.filter(item => item.isRetured && item.qty > 0);

        if (itemAkanDiretur.length === 0) {
            alert('Minimal harus ada 1 produk dengan jumlah retur valid (> 0)!');
            return;
        }
        if (itemAkanDiretur.some(item => !item.kondisi_barang)) {
            alert('Mohon lengkapi Kondisi Barang untuk produk yang akan diretur.');
            return;
        }

        // Memanipulasi payload akhir sebelum dikirim ke backend Laravel
        transform((formData) => {
            let kalkulasiTotalPerbaikan = 0;
            let kalkulasiTotalKerugian = 0;

            const finalItems = formData.items
                .filter(item => item.isRetured && item.qty > 0)
                .map(item => {
                    const masterProduk = dataProdukKonsinyasi.find(
                        p => p.id_produk === (typeof item.id_produk === 'string' ? parseInt(item.id_produk) : item.id_produk)
                    );
                    const hargaSatuan = masterProduk ? parseInt(masterProduk.harga as any) || 0 : 0;
                    const subtotalItem = hargaSatuan * item.qty;

                    if (item.kondisi_barang === 'Perlu Perbaikan') kalkulasiTotalPerbaikan += subtotalItem;
                    if (item.kondisi_barang === 'Rusak') kalkulasiTotalKerugian += subtotalItem;

                    return {
                        id_produk: typeof item.id_produk === 'string' ? parseInt(item.id_produk) : item.id_produk,
                        nama_produk: item.nama_produk,
                        qty_kirim: item.qty_kirim,
                        qty: item.qty,
                        harga: hargaSatuan,
                        kondisi_barang: item.kondisi_barang,
                        keterangan: item.keterangan || ''
                    };
                });

            return {
                ...formData,
                id_konsinyasi_keluar: parseInt(formData.id_konsinyasi_keluar as string),
                total_perbaikan: kalkulasiTotalPerbaikan,
                total_kerugian: kalkulasiTotalKerugian,
                items: finalItems
            };
        });

        if (editingId) {
            put(`/konsinyasi-retur/${editingId}`, {
                onSuccess: () => { 
                    setIsFormOpen(false); 
                    setEditingId(null); 
                    reset(); 
                },
                onError: (errors: any) => {
                    alert('Gagal memperbarui data retur!');
                    console.error("Put Error:", errors);
                }
            });
        } else {
            post('/konsinyasi-retur', {
                onSuccess: () => { 
                    setIsFormOpen(false); 
                    reset(); 
                },
                onError: (errors: any) => {
                    alert('Gagal menyimpan data retur!');
                    console.error("Post Error:", errors);
                }
            });
        }
    };

    const filteredRetur = dataRetur.filter(
        (rtk) =>
            rtk.no_retur_konsinyasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rtk.nama_toko.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rtk.no_konsinyasi_keluar.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (viewingDetail) {
        return (
            <div className="p-8">
                <div className="mb-6">
                    <button onClick={() => setViewingDetail(null)} className="text-red-600 hover:underline mb-2 flex items-center gap-1 font-medium text-sm">
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Detail Retur {viewingDetail.no_retur_konsinyasi}</h1>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div><span className="text-gray-500">Mitra / Toko:</span> <p className="font-semibold text-gray-800">{viewingDetail.nama_toko}</p></div>
                        <div><span className="text-gray-500">No. Konsinyasi Asal:</span> <p className="font-semibold text-gray-800">{viewingDetail.no_konsinyasi_keluar}</p></div>
                        <div><span className="text-gray-500">Tanggal Input Retur:</span> <p className="font-semibold text-gray-800">{viewingDetail.tgl_retur_konsinyasi}</p></div>
                    </div>
                    <table className="w-full text-left border-collapse text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 border-b border-gray-200 font-semibold">
                                <th className="p-3">Produk</th>
                                <th className="p-3">Qty Retur</th>
                                <th className="p-3">Kondisi</th>
                                <th className="p-3">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {viewingDetail.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="p-3 font-medium text-gray-900">{item.nama_produk}</td>
                                    <td className="p-3 text-red-600 font-bold">{item.qty}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                                            item.kondisi_barang === 'Layak' ? 'bg-green-50 text-green-700 border-green-100' :
                                            item.kondisi_barang === 'Perlu Perbaikan' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                            'bg-red-50 text-red-700 border-red-100'
                                        }`}>{item.kondisi_barang}</span>
                                    </td>
                                    <td className="p-3 text-gray-500 italic">"{item.keterangan || '-'}"</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {isFormOpen ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsFormOpen(false)} className="text-red-800 hover:text-red-900 transition-colors" title="Batal dan Kembali">
                            <ArrowLeft className="w-7 h-7" />
                        </button>
                        <h1 className="text-2xl font-bold text-red-800">
                            {editingId ? 'Edit Retur Konsinyasi' : 'Input Retur Konsinyasi Baru'}
                        </h1>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No. Retur</label>
                                <input type="text" value={data.no_retur_konsinyasi} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2 text-sm text-gray-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Retur</label>
                                <input type="date" value={data.tgl_retur_konsinyasi} onChange={(e) => setData('tgl_retur_konsinyasi', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-red-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih No. Konsinyasi Asal</label>
                                <select value={data.id_konsinyasi_keluar} onChange={(e) => handleKonsinyasiChange(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-white outline-none focus:border-red-500">
                                    <option value="">-- Pilih Nomor Dokumen --</option>
                                    {dataKonsinyasiKeluar.map((kon) => (
                                        <option key={kon.id_konsinyasi_keluar} value={kon.id_konsinyasi_keluar}>{kon.no_dokumen}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mitra</label>
                                <input type="text" value={dataKonsinyasiKeluar.find(k => k.id_konsinyasi_keluar === parseInt(data.id_konsinyasi_keluar as string))?.nama_toko || ''} disabled className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed outline-none" placeholder="Otomatis terisi berdasarkan dokumen" />
                            </div>
                        </div>

                        {data.id_konsinyasi_keluar && data.items.some(item => item.isRetured) ? (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Daftar Produk Dikirim (Sesuaikan Jumlah Retur)</h3>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-700 text-sm font-semibold border-b border-gray-200">
                                                <th className="px-4 py-2.5">Produk</th>
                                                <th className="px-4 py-2.5 w-24">Qty Kirim</th>
                                                <th className="px-4 py-2.5 w-28">Qty Retur</th>
                                                <th className="px-4 py-2.5 w-48">Kondisi Barang</th>
                                                <th className="px-4 py-2.5">Keterangan / Alasan</th>
                                                <th className="text-center px-4 py-2.5">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                                            {data.items.map((item, index) => (
                                                <ReturKonsinyasiDetail 
                                                    key={index}
                                                    item={item}
                                                    index={index}
                                                    kondisiBarangList={kondisiBarangList}
                                                    onItemRowChange={handleItemRowChange}
                                                    onRemoveRow={handleRemoveRow}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : data.id_konsinyasi_keluar ? (
                            <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                Semua produk dokumen telah dieliminasi dari daftar retur. Silakan pilih ulang nomor dokumen untuk mereset.
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                Silakan pilih Nomor Konsinyasi Asal terlebih dahulu untuk memuat daftar produk.
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors bg-white">Batal</button>
                            <button type="button" onClick={handleSubmit} disabled={processing || activeItems.length === 0} className={`px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm ${activeItems.length === 0 ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-red-800 hover:bg-red-900'}`}>
                                {editingId ? 'Simpan Perubahan' : 'Simpan Retur'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-red-800">Retur Konsinyasi</h1>
                            <p className="text-red-800/80 mt-1 text-sm">Kelola data pengembalian barang dari mitra konsinyasi</p>
                        </div>
                        <button onClick={handleOpenNewForm} className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm self-start sm:self-auto">
                            <Plus className="w-4 h-4" /> Tambah Retur
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4">
                            <div className="relative w-full">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input type="text" placeholder="Cari No. Retur, Konsinyasi, atau Mitra..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-500 transition-colors" />
                            </div>
                        </div>

                        <div className="overflow-x-auto px-6 pb-4">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700 text-sm overflow-hidden">
                                        <th className="p-4 font-semibold">No. Retur</th>
                                        <th className="p-4 font-semibold">Tanggal</th>
                                        <th className="p-4 font-semibold">No. Konsinyasi</th>
                                        <th className="p-4 font-semibold">Mitra</th>
                                        <th className="p-4 font-semibold">Kondisi</th>
                                        <th className="p-4 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {filteredRetur.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-400 italic">Data tidak ditemukan</td>
                                        </tr>
                                    ) : (
                                        filteredRetur.map((rtk) => (
                                            <tr key={rtk.id_retur_konsinyasi} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-semibold text-gray-700">{rtk.no_retur_konsinyasi}</td>
                                                <td className="p-4 text-gray-700">
                                                    {new Date(rtk.tgl_retur_konsinyasi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="p-4 text-gray-700">{rtk.no_konsinyasi_keluar}</td>
                                                <td className="p-4 font-medium text-gray-700">{rtk.nama_toko}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Array.from(new Set(rtk.items?.map(i => i.kondisi_barang) || ['Layak'])).map((kondisi) => (
                                                            <span key={kondisi} className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                                                                kondisi === 'Layak' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                kondisi === 'Perlu Perbaikan' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                                'bg-red-50 text-red-700 border-red-100'
                                                            }`}>
                                                                {kondisi}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button onClick={() => setViewingDetail(rtk)} className="text-gray-500 hover:text-red-600 transition-colors" title="Detail">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => {
                                                            setEditingId(rtk.id_retur_konsinyasi);
                                                            setData({
                                                                no_retur_konsinyasi: rtk.no_retur_konsinyasi,
                                                                tgl_retur_konsinyasi: rtk.tgl_retur_konsinyasi,
                                                                id_konsinyasi_keluar: dataKonsinyasiKeluar.find(k => k.no_dokumen === rtk.no_konsinyasi_keluar)?.id_konsinyasi_keluar || '',
                                                                total_perbaikan: 0,
                                                                total_kerugian: 0,
                                                                items: rtk.items || []
                                                            });
                                                            setIsFormOpen(true);
                                                        }} className="text-gray-500 hover:text-amber-600 transition-colors" title="Edit">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => confirm('Apakah Anda yakin ingin menghapus data retur ini?')} className="text-gray-400 hover:text-red-600 transition-colors" title="Hapus">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
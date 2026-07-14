import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Printer, Eye, Plus, Search } from 'lucide-react';

// 1. Penyelarasan Interface dengan data item produk milik t_jual_detail
interface InvoiceItem {
    kode_produk: string;
    nama_produk: string;
    satuan: string;
    id_produk: number;
    qty_jual: number;
    harga: number;
    harga_jual_satuan: number;
    hpp_satuan: number;
    diskon: number;
    subtotal: number;
}

// 2. Penyelarasan Interface dengan data master t_jual hasil mapping Controller
interface PenjualanData {
    id_jual: number;
    no_jual: string;
    tgl_jual: string;
    id_pesanan: number;
    jenis_penjualan: string;
    metode_pembayaran: string;
    subtotal: number;
    total_diskon: number;
    total_hpp: number;
    grand_total: number;
    created_at: string;
    updated_at: string;
    no_pesanan: string;
    keterangan_so: string | null;
    nama_mitra: string;
    alamat_mitra: string | null;
    jatuh_tempo_tanggal: string | null;
    no_surat_jalan: string;
    keterangan: string | null;
    items: InvoiceItem[];
}

interface Props {
    penjualan: PenjualanData[];
}

export default function Penjualan({ penjualan }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<PenjualanData | null>(null);

    // Navigasi ke form tambah transaksi baru
    const handleOpenNewForm = () => {
        router.visit('/transaksi-penjualan/create'); 
    };

    // FIX TYPO: Sekarang menggunakan backticks dan tanda garing /${id} dengan benar
    const handleViewDetail = (id: number) => {
        router.visit(`/transaksi-penjualan/${id}`);
    };

    // Aksi cetak nota instan langsung lewat browser tanpa pindah halaman
    const handlePrintAction = (invoice: PenjualanData) => {
        setSelectedInvoice(invoice);
        
        // Jeda 100ms agar DOM state React sempat memperbarui isi nota sebelum cetak dimulai
        setTimeout(() => {
            window.print();
        }, 100);
    };

    // Formatter Rupiah Standar Bank
    const rp = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Formatter Tanggal Indonesia (Contoh: 14 Juli 2026)
    const formatTanggalLengkap = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Fitur pencarian multi-kolom yang sinkron dengan data Controller Anda
    const filteredInvoices = penjualan.filter((inv) => {
        const query = searchQuery.toLowerCase();
        return (
            (inv.no_jual?.toLowerCase() || '').includes(query) ||
            (inv.no_pesanan?.toLowerCase() || '').includes(query) ||
            (inv.no_surat_jalan?.toLowerCase() || '').includes(query) ||
            (inv.nama_mitra?.toLowerCase() || '').includes(query)
        );
    });

    return (
        <div className="p-6">
            <Head title="Transaksi Penjualan" />

            {/* AREA UTAMA: Otomatis disembunyikan oleh browser saat mode cetak aktif (print:hidden) */}
            <div className="space-y-6 print:hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Daftar Penjualan</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Kelola data invoice dan cetak nota transaksi</p>
                    </div>
                    <button
                        onClick={handleOpenNewForm}
                        className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm self-stretch sm:self-auto justify-center cursor-pointer"
                    >
                        <Plus className="w-4 h-4"/> Tambah Penjualan
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                    <div className="relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nomor invoice, nomor SO, surat jalan atau nama mitra..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 text-sm text-gray-700 bg-white"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider">No. Invoice</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider">Ref. No SO / SJ</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider">Tanggal</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider">Nama Pelanggan / Mitra</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider text-center">Metode</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider text-right">Grand Total</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-gray-700 tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-700">
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv.id_jual} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{inv.no_jual}</td>
                                        <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                                            <div>SO: {inv.no_pesanan}</div>
                                            <div className="text-[10px] text-gray-400 font-normal mt-0.5">SJ: {inv.no_surat_jalan}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatTanggalLengkap(inv.tgl_jual)}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{inv.nama_mitra}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                                                inv.metode_pembayaran === 'Tunai' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {inv.metode_pembayaran}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 text-right">
                                            {rp(inv.grand_total)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => handleViewDetail(inv.id_jual)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4"/>
                                                </button>
                                                <button
                                                    onClick={() => handlePrintAction(inv)}
                                                    className="p-1.5 text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                                    title="Cetak Instan"
                                                >
                                                    <Printer className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10 text-sm text-gray-400 italic bg-white">
                                            Tidak ada data transaksi penjualan yang cocok dengan pencarian
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

          {/* PRINT HARDCOPY AREA - CLEAN STYLE */}
          {selectedInvoice && (
              <div id="faktur-print-area" className="hidden print:block bg-white p-4 text-black text-sm print:absolute print:top-0 print:left-0 print:w-full print:m-0 print:p-0 print:z-9999">
                  
                  {/* INI KUNCI SAKTINYA: Paksa sembunyi semua elemen web lain secara total saat print */}
                  <style dangerouslySetInnerHTML={{__html: `
                      @media print {
                          /* Sembunyikan seluruh body web, layout, navbar, sidebar, dan modal bawaan */
                          body * {
                              visibility: hidden !important;
                          }
                          /* Kecuali area faktur ini dan seluruh isi di dalamnya */
                          #faktur-print-area, #faktur-print-area * {
                              visibility: visible !important;
                          }
                          /* Pasang posisi di pojok kiri atas kertas tanpa bayangan/box luar */
                          #faktur-print-area {
                              position: absolute !important;
                              left: 0 !important;
                              top: 0 !important;
                              width: 100% !important;
                              background: white !important;
                              box-shadow: none !important;
                          }
                      }
                  `}} />

                  {/* HEADER FAKTUR */}
                  <div className="border-b border-gray-900 pb-4 mb-6">
                      <div className="flex justify-between items-start">
                          <div>
                              <h1 className="text-2xl font-bold uppercase tracking-wide">FAKTUR PENJUALAN</h1>
                              <p className="text-lg font-semibold mt-1 text-gray-900">{selectedInvoice.no_jual}</p>
                          </div>
                          <div className="text-right text-xs text-gray-700">
                              <p className="font-bold text-black">CV NEW CITRA</p>
                              <p>Jl. Industri Pangan Raya No. 12</p>
                              <p>Semarang, Jawa Tengah</p>
                          </div>
                      </div>
                  </div>

                    <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
                        <div>
                            <p className="text-gray-500 uppercase font-semibold">Tujuan Tagihan:</p>
                            <p className="font-bold text-sm mt-0.5">{selectedInvoice.nama_mitra}</p>
                            <p className="mt-0.5 text-gray-700 whitespace-pre-line">{selectedInvoice.alamat_mitra || '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tanggal Faktur:</span>
                                <span className="font-medium">{formatTanggalLengkap(selectedInvoice.tgl_jual)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Metode Bayar:</span>
                                <span className="font-semibold uppercase">{selectedInvoice.metode_pembayaran}</span>
                            </div>
                            {selectedInvoice.metode_pembayaran === 'Kredit' && selectedInvoice.jatuh_tempo_tanggal && (
                                <div className="flex justify-between text-red-600 font-medium">
                                    <span>Jatuh Tempo:</span>
                                    <span>{formatTanggalLengkap(selectedInvoice.jatuh_tempo_tanggal)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Nomor Sales Order:</span>
                                <span>{selectedInvoice.no_pesanan}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Nomor Surat Jalan:</span>
                                <span className="font-medium text-gray-900">{selectedInvoice.no_surat_jalan}</span>
                            </div>
                        </div>
                    </div>

                    <table className="w-full text-xs text-left border-collapse mb-6">
                        <thead>
                            <tr className="border-b border-t border-gray-800 bg-gray-50 text-gray-700 font-bold">
                                <th className="py-2 pl-2">Kode</th>
                                <th className="py-2">Nama Barang / Produk</th>
                                <th className="py-2 text-right">Quantity</th>
                                <th className="py-2 text-right">Harga Satuan</th>
                                <th className="py-2 text-right">Pot. Diskon</th>
                                <th className="py-2 text-right pr-2">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {selectedInvoice.items.map((item, index) => (
                                <tr key={index} className="align-top">
                                    <td className="py-2.5 pl-2 font-medium">{item.kode_produk}</td>
                                    <td className="py-2.5">{item.nama_produk}</td>
                                    <td className="py-2.5 text-right whitespace-nowrap">{item.qty_jual} {item.satuan}</td>
                                    <td className="py-2.5 text-right">{rp(item.harga)}</td>
                                    <td className="py-2.5 text-right text-red-600">{item.diskon > 0 ? `${item.diskon}%` : '-'}</td>
                                    <td className="py-2.5 text-right pr-2 font-medium">{rp(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between items-start text-xs">
                        <div className="w-1/2 max-w-xs border border-dashed border-gray-300 p-2 rounded bg-gray-50">
                            <span className="font-semibold block text-gray-500 uppercase text-[10px]">Catatan / Keterangan:</span>
                            <p className="italic text-gray-700 mt-0.5">{selectedInvoice.keterangan || 'Tidak ada catatan tambahan.'}</p>
                        </div>
                        <div className="w-56 space-y-1.5 text-right">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal Kotor:</span>
                                <span>{rp(selectedInvoice.subtotal)}</span>
                            </div>
                            {selectedInvoice.total_diskon > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Total Diskon (Rp):</span>
                                    <span>-{rp(selectedInvoice.total_diskon)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-gray-800 pt-1.5 text-base font-semibold text-gray-900">
                                <span>Grand Total:</span>
                                <span>{rp(selectedInvoice.grand_total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mt-16 text-center text-xs">
                        <div>
                            <p className="text-gray-400 mb-14">Hormat Kami,</p>
                            <div className="w-32 mx-auto border-b border-black"></div>
                            <p className="mt-1 font-semibold text-gray-600">Bagian Operasional Penjualan</p>
                        </div>
                        <div>
                            <p className="text-gray-400 mb-14">Tanda Terima Pelanggan,</p>
                            <div className="w-32 mx-auto border-b border-black"></div>
                            <p className="mt-1 font-semibold text-gray-600">{selectedInvoice.nama_mitra}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
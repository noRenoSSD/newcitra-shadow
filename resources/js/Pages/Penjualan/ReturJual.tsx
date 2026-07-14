import React, { useState, useEffect } from "react";
import { Eye, Trash2, Plus, ArrowLeft, Search, Printer } from "lucide-react";
import { router } from "@inertiajs/react";
import ReturPenjualanDetail from "./ReturJualDetail";

interface ReturPenjualanItem {
    id: string;
    noRetur: string;
    tanggal: string;
    noInvoice: string;
    id_jual: number;
    pelanggan: string;
    catatan?: string;
    subtotal: number;
    grandTotal: number;
    total_perbaikan?: number;
    total_kerugian?: number;
    items: {
        id_produk: number;
        kode_produk?: string;
        produk: string;
        qty: number;
        satuan_produk?: string; // Menyimpan field satuan_produk
        kondisiBarang: "Layak" | "Perbaikan" | "Rusak";
        keterangan: string;
        harga: number;
        subtotal: number;
    }[];
}

interface InvoiceDataAPI {
    id_jual: number;
    no_jual: string;
    grand_total: string | number;
    pelanggan?: string;
    metode_pembayaran?: string;
    invoice_items?: {
        id_produk: number;
        kode_produk?: string;
        nama_produk: string;
        qty_terjual: number;
        satuan_produk?: string; // Memanggil satuan_produk dari API Invoice
        satuan?: string;        // Fallback jika API menggunakan nama field 'satuan'
        harga: number;
        subtotal: number;
        hpp_satuan?: number;
    }[];
}

export default function ReturPenjualan({
    noReturOtomatis,
    listInvoice = [],
    listRetur = [],
}: {
    noReturOtomatis: string;
    listInvoice: InvoiceDataAPI[];
    listRetur: any[];
}) {
    const formatReturData = (data: any[]): ReturPenjualanItem[] => {
        return (data || []).map((rt) => ({
            id: rt.id_retur_jual?.toString() || Math.random().toString(),
            noRetur: rt.no_retur_jual || "",
            tanggal: rt.tgl_retur_jual || "",
            noInvoice: rt.no_jual || "",
            id_jual: rt.id_jual || 0,
            pelanggan: rt.pelanggan || "Pelanggan Umum",
            catatan: rt.catatan || "",
            subtotal: parseFloat(rt.subtotal) || 0,
            grandTotal: parseFloat(rt.grand_total) || 0,
            total_perbaikan: parseFloat(rt.total_perbaikan) || 0,
            total_kerugian: parseFloat(rt.total_kerugian) || 0,
            items: (rt.items || []).map((item: any) => ({
                id_produk: item.id_produk || 0,
                kode_produk: item.kode_produk || item.kode || "-",
                produk: item.produk || item.nama_produk || "Produk",
                qty: Number(item.qty) || 0,
                satuan_produk: item.satuan_produk || item.satuan || "", // Memetakan field satuan_produk
                kondisiBarang: item.kondisiBarang || item.kondisi_barang || "Layak",
                keterangan: item.keterangan || "",
                harga: Number(item.harga) || 0,
                subtotal: parseFloat(item.subtotal) || 0,
            })),
        }));
    };

    const [returPenjualans, setReturPenjualans] = useState<ReturPenjualanItem[]>(
        formatReturData(listRetur)
    );
    const [invoicesFromAPI, setInvoicesFromAPI] = useState<InvoiceDataAPI[]>(listInvoice);

    const [formData, setFormData] = useState({
        noRetur: noReturOtomatis || "",
        tanggal: new Date().toISOString().split("T")[0],
        noInvoice: "",
        id_jual: "",
        pelanggan: "",
        catatan: "",
        statusBayarInvoice: "",
    });

    const [items, setItems] = useState<
        {
            id_produk: number;
            kode_produk: string;
            produk: string;
            qtyTerjual: number;
            qty: number;
            satuan_produk: string; // State penampung satuan_produk
            kondisiBarang: "Layak" | "Perbaikan" | "Rusak" | "";
            keterangan: string;
            harga: number;
            subtotal: number;
            isRetured: boolean;
            hpp_satuan: number;
        }[]
    >([]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewingDetail, setViewingDetail] = useState<ReturPenjualanItem | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [itemToPrint, setItemToPrint] = useState<ReturPenjualanItem | null>(null);

    const kondisiBarangList: ("Layak" | "Perbaikan" | "Rusak")[] = [
        "Layak",
        "Perbaikan",
        "Rusak",
    ];

    useEffect(() => {
        setReturPenjualans(formatReturData(listRetur));
    }, [listRetur]);

    useEffect(() => {
        setInvoicesFromAPI(listInvoice);
    }, [listInvoice]);

    useEffect(() => {
        if (noReturOtomatis) {
            setFormData((prev) => ({ ...prev, noRetur: noReturOtomatis }));
        }
    }, [noReturOtomatis]);

    const handleOpenNewForm = () => {
        setFormData({
            noRetur: noReturOtomatis || "",
            tanggal: new Date().toISOString().split("T")[0],
            noInvoice: "",
            id_jual: "",
            pelanggan: "",
            catatan: "",
            statusBayarInvoice: "",
        });
        setItems([]);
        setIsFormOpen(true);
    };

    const handleInvoiceChange = (noInv: string) => {
        const selectedInvoice = invoicesFromAPI.find((inv) => inv.no_jual === noInv);

        if (selectedInvoice) {
            setFormData((prev) => ({
                ...prev,
                noInvoice: noInv,
                id_jual: selectedInvoice.id_jual.toString(),
                pelanggan: selectedInvoice.pelanggan || "Mitra Tidak Diketahui",
                statusBayarInvoice: selectedInvoice.metode_pembayaran || "Tunai",
            }));

            const apiItems = selectedInvoice.invoice_items || [];

            const mappedItems = apiItems.map((item: any) => {
                const qtyBeli = Number(item.qty_terjual) || Number(item.qty_jual) || 0;
                let hargaBeli = Number(item.harga) || Number(item.harga_satuan) || 0;

                if (hargaBeli === 0 && Number(item.subtotal) > 0 && qtyBeli > 0) {
                    hargaBeli = Number(item.subtotal) / qtyBeli;
                }

                const hppProduk = Number(item.hpp_satuan) || hargaBeli || 0;

                return {
                    id_produk: Number(item.id_produk) || 0,
                    kode_produk: item.kode_produk || item.sku || "-",
                    produk: item.nama_produk || "Produk Tidak Diketahui",
                    qtyTerjual: qtyBeli,
                    qty: 0,
                    satuan_produk: item.satuan_produk || item.satuan || "", // Memanggil field satuan_produk
                    kondisiBarang: "" as const,
                    keterangan: "",
                    harga: hargaBeli,
                    subtotal: 0,
                    isRetured: true,
                    hpp_satuan: hppProduk,
                };
            });

            setItems(mappedItems);
        } else {
            setFormData((prev) => ({
                ...prev,
                noInvoice: noInv,
                id_jual: "",
                pelanggan: "",
                statusBayarInvoice: "",
            }));
            setItems([]);
        }
    };

    const handleItemRowChange = (index: number, field: string, value: any) => {
        const updatedItems = [...items];
        const item = updatedItems[index];

        if (field === "qty") {
            const inputQty = parseFloat(value) || 0;
            if (inputQty > item.qtyTerjual) {
                alert(`Jumlah retur tidak boleh melebihi qty terjual (${item.qtyTerjual} ${item.satuan_produk})`);
                item.qty = item.qtyTerjual;
            } else {
                item.qty = inputQty;
            }
            item.subtotal = item.qty * item.harga;
        } else {
            updatedItems[index] = { ...item, [field]: value };
        }

        setItems(updatedItems);
    };

    const handleRemoveRow = (index: number) => {
        const updatedItems = [...items];
        updatedItems[index].isRetured = false;
        updatedItems[index].qty = 0;
        updatedItems[index].subtotal = 0;
        setItems(updatedItems);
    };

    const activeItems = items.filter((item) => item.isRetured && item.qty > 0);
    const calculateSubtotal = () => activeItems.reduce((sum, item) => sum + item.subtotal, 0);
    const calculateGrandTotal = () => calculateSubtotal();

    const handleSubmit = () => {
        if (!formData.noRetur || !formData.tanggal || !formData.noInvoice) {
            alert("Mohon lengkapi informasi utama retur!");
            return;
        }

        const activeItemsList = activeItems;

        if (activeItemsList.length === 0) {
            alert("Minimal harus ada 1 produk dengan jumlah retur valid (> 0).");
            return;
        }

        const missingCondition = activeItemsList.some((item) => !item.kondisiBarang);
        if (missingCondition) {
            alert("Mohon pilih Kondisi Barang untuk produk yang akan diretur!");
            return;
        }

        const mappedItems = activeItemsList.map((item) => {
            const qtyReturNumeric = Number(item.qty) || 0;

            const biayaPerbaikan =
                item.kondisiBarang === "Perbaikan" ? 5000 * qtyReturNumeric : 0;

            const nilaiKerugian =
                item.kondisiBarang === "Rusak"
                    ? Number(item.hpp_satuan || 0) * qtyReturNumeric
                    : 0;

            return {
                id_produk: Number(item.id_produk),
                harga: Number(item.harga),
                qty_retur: qtyReturNumeric,
                satuan_produk: item.satuan_produk, // Mengirimkan field satuan_produk ke backend
                subtotal_retur: Number(item.subtotal),
                kondisi_barang: item.kondisiBarang,
                biaya_perbaikan: Number(biayaPerbaikan),
                nilai_kerugian: Number(nilaiKerugian),
                keterangan: item.keterangan || "",
            };
        });

        const totalPerbaikan = mappedItems.reduce((acc, cur) => acc + Number(cur.biaya_perbaikan), 0);
        const totalKerugian = mappedItems.reduce((acc, cur) => acc + Number(cur.nilai_kerugian), 0);

        const payload = {
            no_retur_jual: formData.noRetur,
            tgl_retur_jual: formData.tanggal,
            id_jual: Number(formData.id_jual),
            catatan: formData.catatan,
            subtotal: Number(calculateSubtotal()),
            grand_total: Number(calculateGrandTotal()),
            total_perbaikan: Number(totalPerbaikan),
            total_kerugian: Number(totalKerugian),
            potong_piutang: formData.statusBayarInvoice.toLowerCase() === "kredit" ? 1 : 0, 
            items: mappedItems,
        };

        router.post("/retur-penjualan", payload, {
            onSuccess: () => {
                setIsFormOpen(false);
            },
            onError: (errors: any) => {
                console.error("Payload Error detail:", errors);
                const errorMessages = Object.entries(errors)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join("\n");
                alert(`Gagal Menyimpan! Server menolak karena:\n${errorMessages || "Terjadi kesalahan sistem."}`);
            },
        });
    };

    const handlePrint = (retur: ReturPenjualanItem) => {
        setItemToPrint(retur);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const handleDelete = (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus retur penjualan ini?")) {
            router.delete(`/retur-penjualan/${id}`, {
                onSuccess: () => {
                    setReturPenjualans(returPenjualans.filter((rtp) => rtp.id !== id));
                }
            });
        }
    };

    const filteredReturPenjualans = returPenjualans.filter(
        (rtp) =>
            rtp.noRetur.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rtp.pelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rtp.noInvoice.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (viewingDetail) {
        return (
            <ReturPenjualanDetail 
                retur={viewingDetail} 
                onBack={() => setViewingDetail(null)} 
                onPrint={() => handlePrint(viewingDetail)} 
            />
        );
    }

    return (
        <div className="p-8">
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-section, #print-section * {
                        visibility: visible;
                    }
                    #print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}} />

            {/* Template Print Nota Rapi + Kolom Kode Produk */}
{itemToPrint && (
    <div id="print-section" className="h-0 overflow-hidden hidden print:block print:h-auto print:overflow-visible bg-white p-4 text-black text-sm">
        {/* HEADER NOTA */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide">NOTA RETUR PENJUALAN</h1>
                    <p className="text-lg font-semibold mt-1">{itemToPrint.noRetur}</p>
                </div>
                <div className="text-right text-xs">
                    <p className="font-bold">CV. JAYA MANDIRI UTAMA</p>
                    <p>Jl. Industri Pangan Raya No. 12</p>
                    <p>Semarang, Jawa Tengah</p>
                </div>
            </div>
        </div>

        {/* DATA TRANSAKSI */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
            <div>
                <p className="text-gray-500 uppercase font-semibold">Pelanggan / Mitra:</p>
                <p className="font-bold text-sm mt-0.5">{itemToPrint.pelanggan}</p>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span className="text-gray-500">Tanggal Retur:</span>
                    <span className="font-medium">{new Date(itemToPrint.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Nomor Invoice Asal:</span>
                    <span className="font-semibold uppercase">{itemToPrint.noInvoice}</span>
                </div>
            </div>
        </div>

        {/* TABEL ITEM PRODUK */}
        <table className="w-full text-xs text-left border-collapse mb-6">
            <thead>
                <tr className="border-b border-t border-gray-800 bg-gray-50 text-gray-700 font-bold">
                    <th className="py-2 pl-2 w-28">Kode</th>
                    <th className="py-2">Nama Barang / Produk</th>
                    <th className="py-2 text-center w-24">Quantity</th>
                    <th className="py-2 text-left">Kondisi Barang</th>
                    <th className="py-2 text-right">Harga Satuan</th>
                    <th className="py-2 text-right pr-2">Subtotal</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {(itemToPrint.items || []).map((item, idx) => (
                    <tr key={idx} className="align-top">
                        <td className="py-2.5 pl-2 font-medium text-gray-900">{item.kode_produk || "-"}</td>
                        <td className="py-2.5">{item.produk}</td>
                        <td className="py-2.5 text-center whitespace-nowrap">{item.qty} {item.satuan_produk || ""}</td>
                        <td className="py-2.5 text-left">{item.kondisiBarang}</td>
                        <td className="py-2.5 text-right">Rp {item.harga.toLocaleString("id-ID")}</td>
                        <td className="py-2.5 text-right pr-2 font-medium">Rp {item.subtotal.toLocaleString("id-ID")}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* FOOTER TOTAL & CATATAN */}
        <div className="flex justify-between items-start text-xs">
            <div className="w-1/2 max-w-xs border border-dashed border-gray-300 p-2 rounded bg-gray-50">
                <span className="font-semibold block text-gray-500 uppercase text-[10px]">Catatan Retur:</span>
                <p className="italic text-gray-700 mt-0.5">{itemToPrint.catatan || 'Tidak ada catatan tambahan.'}</p>
            </div>
            <div className="w-56 space-y-1.5 text-right">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal Retur:</span>
                    <span>Rp {itemToPrint.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-1.5 text-base font-bold text-gray-900">
                    <span>Grand Total:</span>
                    <span>Rp {itemToPrint.grandTotal.toLocaleString("id-ID")}</span>
                </div>
            </div>
        </div>

        {/* AREA TANDA TERIMA */}
        <div className="grid grid-cols-2 gap-12 mt-16 text-center text-xs">
            <div>
                <p className="text-gray-400 mb-14">Hormat Kami,</p>
                <div className="w-32 mx-auto border-b border-black"></div>
                <p className="mt-1 font-semibold text-gray-600">Bagian Operasional Retur</p>
            </div>
            <div>
                <p className="text-gray-400 mb-14">Diterima Oleh,</p>
                <div className="w-32 mx-auto border-b border-black"></div>
                <p className="mt-1 font-semibold text-gray-600">{itemToPrint.pelanggan}</p>
            </div>
        </div>
    </div>
)}

            {isFormOpen ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Tambah Retur Penjualan</h1>
                            <p className="text-sm text-gray-400">Buat data retur penjualan baru dari invoice pelanggan</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">No. Retur</label>
                                <input
                                    type="text"
                                    value={formData.noRetur}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-sm text-gray-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Tanggal Retur</label>
                                <input
                                    type="date"
                                    value={formData.tanggal}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, tanggal: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">No. Invoice Asal</label>
                                <select
                                    value={formData.noInvoice}
                                    onChange={(e) => handleInvoiceChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-500 transition-colors bg-white"
                                >
                                    <option value="">-- Pilih No Invoice --</option>
                                    {invoicesFromAPI.map((inv) => (
                                        <option key={inv.id_jual} value={inv.no_jual}>
                                            {inv.no_jual} ({inv.pelanggan || "Umum"})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Pelanggan</label>
                                <input
                                    type="text"
                                    value={formData.pelanggan}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-sm text-gray-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Catatan Retur (Opsional)</label>
                            <textarea
                                value={formData.catatan}
                                onChange={(e) => setFormData((prev) => ({ ...prev, catatan: e.target.value }))}
                                placeholder="Masukkan catatan retur..."
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-500 transition-colors resize-none"
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-md font-bold text-gray-800 mb-4">Item Transaksi Penjualan</h3>
                            {items.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-6 bg-gray-50 rounded-lg">
                                    Silakan pilih nomor invoice asal terlebih dahulu
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-left text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-700">
                                                <th className="p-3 font-semibold">Produk</th>
                                                <th className="p-3 font-semibold text-center w-28">Qty Beli</th>
                                                <th className="p-3 font-semibold text-center w-32">Qty Retur</th>
                                                <th className="p-3 font-semibold w-40">Kondisi Barang</th>
                                                <th className="p-3 font-semibold">Alasan / Keterangan</th>
                                                <th className="p-3 font-semibold text-right w-36">Harga Satuan</th>
                                                <th className="p-3 font-semibold text-right w-36">Subtotal</th>
                                                <th className="p-3 font-semibold text-center w-16">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {items.map((item, idx) => (
                                                <tr key={idx} className={item.isRetured ? "hover:bg-gray-50/50" : "opacity-40 bg-gray-50"}>
                                                    <td className="p-3">
                                                        <div className="font-medium text-gray-800">{item.produk}</div>
                                                        <div className="text-xs text-gray-400 font-mono mt-0.5">{item.kode_produk}</div>
                                                    </td>
                                                    <td className="p-3 text-center text-gray-600 font-medium">
                                                        {item.qtyTerjual} {item.satuan_produk}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                disabled={!item.isRetured}
                                                                value={item.qty === 0 ? "" : item.qty}
                                                                onChange={(e) => handleItemRowChange(idx, "qty", e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-200 rounded text-center text-sm"
                                                                placeholder="0"
                                                            />
                                                            <span className="text-xs text-gray-500 whitespace-nowrap">{item.satuan_produk}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <select
                                                            disabled={!item.isRetured}
                                                            value={item.kondisiBarang}
                                                            onChange={(e) => handleItemRowChange(idx, "kondisiBarang", e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm bg-white"
                                                        >
                                                            <option value="">-- Pilih --</option>
                                                            {kondisiBarangList.map((kond) => (
                                                                <option key={kond} value={kond}>{kond}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-3">
                                                        <input
                                                            type="text"
                                                            disabled={!item.isRetured}
                                                            value={item.keterangan}
                                                            onChange={(e) => handleItemRowChange(idx, "keterangan", e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                                                            placeholder="Sebab retur..."
                                                        />
                                                    </td>
                                                    <td className="p-3 text-right text-gray-600">
                                                        Rp {item.harga.toLocaleString("id-ID")}
                                                    </td>
                                                    <td className="p-3 text-right text-gray-800 font-semibold">
                                                        Rp {item.subtotal.toLocaleString("id-ID")}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <button
                                                            type="button"
                                                            disabled={!item.isRetured}
                                                            onClick={() => handleRemoveRow(idx)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <div className="w-80 space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Subtotal Retur:</span>
                                    <span className="font-semibold text-gray-800">Rp {calculateSubtotal().toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-base font-bold text-gray-800">
                                    <span>Grand Total Retur:</span>
                                    <span>Rp {calculateGrandTotal().toLocaleString("id-ID")}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-semibold text-gray-600 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                            >
                                Simpan Transaksi
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Retur Penjualan</h1>
                            <p className="text-sm text-gray-400">Kelola berkas pengembalian produk dari transaksi penjualan</p>
                        </div>
                        <button
                            onClick={handleOpenNewForm}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Retur
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 col-span-12">
                            <div className="relative max-w-sm">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Cari data retur..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                                        <th className="p-4 font-semibold">No. Retur</th>
                                        <th className="p-4 font-semibold">Tanggal</th>
                                        <th className="p-4 font-semibold">No. Invoice</th>
                                        <th className="p-4 font-semibold">Pelanggan</th>
                                        <th className="p-4 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredReturPenjualans.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center p-8 text-gray-400 italic">
                                                Data tidak ditemukan
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReturPenjualans.map((rtp) => (
                                            <tr key={rtp.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-semibold text-gray-700">{rtp.noRetur}</td>
                                                <td className="p-4 text-gray-700">
                                                    {new Date(rtp.tanggal).toLocaleDateString("id-ID", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="p-4 font-semibold text-gray-700">{rtp.noInvoice}</td>
                                                <td className="p-4 font-medium text-gray-700">{rtp.pelanggan}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => setViewingDetail(rtp)}
                                                            className="text-gray-500 hover:text-blue-600 transition-colors"
                                                            title="Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePrint(rtp)}
                                                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                            title="Print Nota"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(rtp.id)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Hapus"
                                                        >
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
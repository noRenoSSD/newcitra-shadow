import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Search, Plus, X, Eye, Printer } from "lucide-react"; // Tambah Eye & Printer

// 1. Interface Laravel Database
interface MasterPengeluaran {
    id_pengeluaran: number;
    nama_pengeluaran: string;
}

interface TransaksiPengeluaran {
    id_transaksi: number;
    no_transaksi: string;
    tgl_transaksi: string;
    total_transaksi: number;
    metode_bayar: string;
    catatan: string | null; // Tambahkan catatan di interface
    master_pengeluaran: MasterPengeluaran;
}

interface Props {
    transaksis: TransaksiPengeluaran[];
    pengeluarans: MasterPengeluaran[];
}

export default function PengeluaranLain({ transaksis, pengeluarans }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // State untuk menampung data transaksi yang sedang dilihat detailnya
    const [selectedDetail, setSelectedDetail] =
        useState<TransaksiPengeluaran | null>(null);

    // 2. useForm Inertia
    const { data, setData, post, processing, reset, errors } = useForm({
        no_transaksi: "",
        tgl_transaksi: "",
        id_pengeluaran: "",
        metode_bayar: "",
        total_transaksi: "",
        catatan: "", // Field catatan
    });

    const generateNoTransaksi = () => {
        const year = new Date().getFullYear();
        const count = transaksis.length + 1;
        return `PL-${year}-${String(count).padStart(3, "0")}`;
    };

    const handleTambah = () => {
        reset();
        setData({
            ...data,
            no_transaksi: generateNoTransaksi(),
            tgl_transaksi: new Date().toISOString().split("T")[0],
            metode_bayar: "Cash", // Default value
        });
        setShowForm(true);
    };

    const handleBatal = () => {
        setShowForm(false);
        reset();
    };

    const handleSimpan = (e: React.FormEvent) => {
        e.preventDefault();
        post("/transaksi-pengeluaran", {
            onSuccess: () => {
                setShowForm(false);
                reset();
            },
        });
    };

    // Fungsi Cetak / Print Struk Nota
    const handlePrint = (transaksi: TransaksiPengeluaran) => {
        const printWindow = window.open("", "_blank", "width=600,height=600");
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Nota - ${transaksi.no_transaksi}</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 14px; color: #000; }
                        .text-center { text-align: center; }
                        .bold { font-weight: bold; }
                        .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                        table { width: 100%; border-collapse: collapse; }
                        td { padding: 4px 0; }
                        .total { font-size: 16px; font-weight: bold; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="text-center bold" style="font-size: 16px;">NOTA PENGELUARAN LAIN</div>
                    <div class="text-center">${transaksi.no_transaksi}</div>
                    <div class="line"></div>
                    <table>
                        <tr><td>Tanggal</td><td>: ${new Date(transaksi.tgl_transaksi).toLocaleDateString("id-ID")}</td></tr>
                        <tr><td>Jenis</td><td>: ${transaksi.master_pengeluaran?.nama_pengeluaran || "-"}</td></tr>
                        <tr><td>Metode</td><td>: ${transaksi.metode_bayar === "Cash" ? "Tunai" : "Transfer"}</td></tr>
                        <tr><td valign="top">Catatan</td><td>: ${transaksi.catatan || "-"}</td></tr>
                    </table>
                    <div class="line"></div>
                    <div class="total">TOTAL: ${formatRupiah(transaksi.total_transaksi)}</div>
                    <div class="line"></div>
                    <div class="text-center" style="margin-top: 20px;">-- Terima Kasih --</div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    // Filter data
    const filteredPengeluaran = transaksis.filter(
        (p) =>
            p.no_transaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.master_pengeluaran?.nama_pengeluaran
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // VIEW 1: MODAL FORM TAMBAH DATA
    if (showForm) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-red-700">
                            Form Pengeluaran Lain-lain
                        </h3>
                        <button
                            onClick={handleBatal}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSimpan}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        No Transaksi
                                    </label>
                                    <input
                                        type="text"
                                        value={data.no_transaksi}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.tgl_transaksi}
                                        onChange={(e) =>
                                            setData(
                                                "tgl_transaksi",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                    />
                                    {errors.tgl_transaksi && (
                                        <span className="text-red-500 text-xs">
                                            {errors.tgl_transaksi}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jenis Pengeluaran{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.id_pengeluaran}
                                        onChange={(e) =>
                                            setData(
                                                "id_pengeluaran",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                    >
                                        <option value="">
                                            Pilih Jenis Pengeluaran
                                        </option>
                                        {pengeluarans.map((jenis) => (
                                            <option
                                                key={jenis.id_pengeluaran}
                                                value={jenis.id_pengeluaran}
                                            >
                                                {jenis.nama_pengeluaran}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.id_pengeluaran && (
                                        <span className="text-red-500 text-xs">
                                            {errors.id_pengeluaran}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Metode Pembayaran{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.metode_bayar}
                                        onChange={(e) =>
                                            setData(
                                                "metode_bayar",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                    >
                                        <option value="">
                                            Pilih Metode Pembayaran
                                        </option>
                                        <option value="Cash">Tunai</option>
                                        <option value="transfer">
                                            Transfer
                                        </option>
                                    </select>
                                    {errors.metode_bayar && (
                                        <span className="text-red-500 text-xs">
                                            {errors.metode_bayar}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jumlah{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.total_transaksi}
                                        onChange={(e) =>
                                            setData(
                                                "total_transaksi",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                    />
                                    {errors.total_transaksi && (
                                        <span className="text-red-500 text-xs">
                                            {errors.total_transaksi}
                                        </span>
                                    )}
                                </div>

                                {/* INPUT FIELD CATATAN */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Catatan
                                    </label>
                                    <textarea
                                        value={data.catatan}
                                        onChange={(e) =>
                                            setData("catatan", e.target.value)
                                        }
                                        placeholder="Masukkan catatan tambahan (opsional)..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none"
                                    />
                                    {errors.catatan && (
                                        <span className="text-red-500 text-xs">
                                            {errors.catatan}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !data.tgl_transaksi ||
                                        !data.id_pengeluaran ||
                                        !data.metode_bayar ||
                                        !data.total_transaksi
                                    }
                                    className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {processing ? "Menyimpan..." : "Simpan"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBatal}
                                    className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // VIEW 2: HALAMAN UTAMA (TABEL DATA)
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-red-800">
                        Pengeluaran Lain-lain
                    </h2>
                    <p className="text-sm text-red-800 mt-1">
                        Kelola data transaksi pengeluaran
                    </p>
                </div>
                <button
                    onClick={handleTambah}
                    className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Pengeluaran
                </button>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari pengeluaran..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-100">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        No Transaksi
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Tanggal
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Jenis Pengeluaran
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Metode
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Jumlah
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                        Aksi
                                    </th>{" "}
                                    {/* Header Aksi */}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPengeluaran.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            Tidak ada data pengeluaran
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPengeluaran.map((pengeluaran) => (
                                        <tr
                                            key={pengeluaran.id_transaksi}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                {pengeluaran.no_transaksi}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {new Date(
                                                    pengeluaran.tgl_transaksi,
                                                ).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {
                                                    pengeluaran
                                                        .master_pengeluaran
                                                        ?.nama_pengeluaran
                                                }
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                                                    {pengeluaran.metode_bayar ===
                                                    "Cash"
                                                        ? "Tunai"
                                                        : "Transfer"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">
                                                {formatRupiah(
                                                    pengeluaran.total_transaksi,
                                                )}
                                            </td>
                                            {/* TOMBOL AKSI DETAIL & PRINT */}
                                            <td className="py-3 px-4 text-sm text-center flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        setSelectedDetail(
                                                            pengeluaran,
                                                        )
                                                    }
                                                    className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                                    title="Detail Transaksi"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handlePrint(pengeluaran)
                                                    }
                                                    className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                                                    title="Print Nota"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL DETAIL (POPM-UP POPUP JIKA SELECTED DETAIL TERISI) */}
            {selectedDetail && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">
                                Detail Transaksi
                            </h3>
                            <button
                                onClick={() => setSelectedDetail(null)}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">
                                    No Transaksi
                                </span>
                                <span className="text-sm font-semibold text-gray-800">
                                    {selectedDetail.no_transaksi}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">
                                        Tanggal
                                    </span>
                                    <span className="text-sm text-gray-800">
                                        {new Date(
                                            selectedDetail.tgl_transaksi,
                                        ).toLocaleDateString("id-ID")}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">
                                        Metode
                                    </span>
                                    <span className="text-sm text-gray-800">
                                        {selectedDetail.metode_bayar === "Cash"
                                            ? "Tunai"
                                            : "Transfer"}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">
                                    Jenis Pengeluaran
                                </span>
                                <span className="text-sm text-gray-800 font-medium">
                                    {selectedDetail.master_pengeluaran
                                        ?.nama_pengeluaran || "-"}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">
                                    Catatan
                                </span>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1 whitespace-pre-line">
                                    {selectedDetail.catatan || (
                                        <span className="text-gray-400 italic">
                                            Tidak ada catatan
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">
                                    Total Pengeluaran
                                </span>
                                <span className="text-xl font-bold text-red-700">
                                    {formatRupiah(
                                        selectedDetail.total_transaksi,
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                            <button
                                onClick={() => handlePrint(selectedDetail)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                            >
                                <Printer className="w-4 h-4" /> Print Nota
                            </button>
                            <button
                                onClick={() => setSelectedDetail(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors text-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

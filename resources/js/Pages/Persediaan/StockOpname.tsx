import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    Eye,
    Filter,
    Save,
    ArrowLeft,
    ClipboardList,
    Calendar,
    AlertCircle,
    Printer,
} from "lucide-react";

// --- Types ---
interface Bahan {
    id_bahan: number;
    kode_bahan: string;
    nama_bahan: string;
    jenis_bahan: "baku" | "penolong";
    satuan_bahan: string;
    qty_sistem: number;
}

interface Produk {
    id_produk: number;
    kode_produk: string;
    nama_produk: string;
    satuan_produk: string;
    qty_sistem: number;
}

interface MasterItem {
    id_unik: string;
    id_bahan: number | null;
    id_produk: number | null;
    tipe: "bahan_baku" | "bahan_penolong" | "produk_jadi";
    kode: string;
    nama: string;
    satuan: string;
    qty_sistem: number;
    qty_fisik: number | string;
    qty_kadaluarsa: number | string;
}

interface SoDetail {
    id_so_detail: number;
    id_bahan: number | null;
    id_produk: number | null;
    qty_sistem: number;
    qty_fisik: number;
    qty_kadaluarsa: number;
    selisih: number;
    bahan?: { nama_bahan: string; satuan_bahan: string; kode_bahan: string };
    produk?: {
        nama_produk: string;
        satuan_produk: string;
        kode_produk: string;
    };
}

interface StockOpnameData {
    id_so: number;
    no_so: string;
    tgl_so: string;
    details: SoDetail[];
}

interface Props {
    stockOpnames: StockOpnameData[];
    bahans: Bahan[];
    produks: Produk[];
    nextNoSo: string;
}

export default function StockOpname({
    stockOpnames,
    bahans,
    produks,
    nextNoSo,
}: Props) {
    const { errors } = usePage<any>().props;

    const [isCreating, setIsCreating] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedSo, setSelectedSo] = useState<StockOpnameData | null>(null);

    const [tglSo, setTglSo] = useState(new Date().toISOString().split("T")[0]);
    const [filterMenu, setFilterMenu] = useState<
        "bahan_baku" | "bahan_penolong" | "produk_jadi" | "all"
    >("bahan_baku");
    const [masterItems, setMasterItems] = useState<MasterItem[]>([]);

    useEffect(() => {
        if (isCreating) {
            const initialItems: MasterItem[] = [];

            bahans.forEach((b) => {
                initialItems.push({
                    id_unik: `bahan_${b.id_bahan}`,
                    id_bahan: b.id_bahan,
                    id_produk: null,
                    tipe:
                        b.jenis_bahan === "baku"
                            ? "bahan_baku"
                            : "bahan_penolong",
                    kode: b.kode_bahan,
                    nama: b.nama_bahan,
                    satuan: b.satuan_bahan,
                    qty_sistem: b.qty_sistem,
                    qty_fisik: b.qty_sistem,
                    qty_kadaluarsa: 0,
                });
            });

            produks.forEach((p) => {
                initialItems.push({
                    id_unik: `produk_${p.id_produk}`,
                    id_bahan: null,
                    id_produk: p.id_produk,
                    tipe: "produk_jadi",
                    kode: p.kode_produk,
                    nama: p.nama_produk,
                    satuan: p.satuan_produk || "Pcs",
                    qty_sistem: p.qty_sistem,
                    qty_fisik: p.qty_sistem,
                    qty_kadaluarsa: 0,
                });
            });

            setMasterItems(initialItems);
        }
    }, [isCreating, bahans, produks]);

    const filteredItems = masterItems.filter((item) =>
        filterMenu === "all" ? true : item.tipe === filterMenu,
    );

    const handleInputChange = (
        id_unik: string,
        field: "qty_fisik" | "qty_kadaluarsa",
        value: string,
    ) => {
        const numValue = value === "" ? "" : parseFloat(value);
        setMasterItems((prev) =>
            prev.map((item) =>
                item.id_unik === id_unik
                    ? { ...item, [field]: numValue }
                    : item,
            ),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        const payload = {
            tgl_so: tglSo,
            details: masterItems.map((item) => ({
                id_bahan: item.id_bahan,
                id_produk: item.id_produk,
                qty_sistem: item.qty_sistem,
                qty_fisik: item.qty_fisik === "" ? 0 : Number(item.qty_fisik),
                qty_kadaluarsa:
                    item.qty_kadaluarsa === ""
                        ? 0
                        : Number(item.qty_kadaluarsa),
            })),
        };

        router.post("/persediaan/stock-opname", payload, {
            onSuccess: () => {
                setIsCreating(false);
                setIsProcessing(false);
            },
            onError: (err) => {
                console.error("Terjadi Error:", err);
                setIsProcessing(false);
            },
        });
    };

    const handlePrint = (so: StockOpnameData) => {
        // Memicu pencetakan window dokumen
        window.print();
    };

    if (!isCreating) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Stock Opname
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Daftar riwayat pemeriksaan fisik persediaan barang
                            gudang
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm"
                    >
                        + Buat SO Baru
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    No. Dokumen SO
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Tanggal Periksa
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Jumlah Item
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center w-28">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stockOpnames.map((so) => (
                                <tr
                                    key={so.id_so}
                                    className="hover:bg-gray-50 transition"
                                >
                                    <td className="px-6 py-4 text-sm font-semibold text-red-800">
                                        {so.no_so}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {so.tgl_so}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                        {so.details?.length || 0} Item
                                    </td>
                                    <td className="px-6 py-4 text-sm text-center">
                                        {/* Container Aksi Berjejer Sesuai Style Pesanan Pembelian */}
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() =>
                                                    setSelectedSo(so)
                                                }
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Detail"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handlePrint(so)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Cetak"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {stockOpnames.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-sm text-gray-400"
                                    >
                                        Belum ada data dokumen Stock Opname.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedSo && (
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl border w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                            <div className="px-6 py-4 bg-gray-100 border-b flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        Detail Dokumen: {selectedSo.no_so}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Tanggal Pelaksanaan: {selectedSo.tgl_so}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedSo(null)}
                                    className="text-gray-400 hover:text-gray-600 text-sm font-semibold px-2 py-1"
                                >
                                    Tutup
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto print:p-0">
                                <table className="w-full text-left text-sm border border-collapse divide-y divide-gray-100">
                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Kode
                                            </th>
                                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Nama Item
                                            </th>
                                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                                Sistem
                                            </th>
                                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                                Fisik
                                            </th>
                                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                                Kadaluarsa
                                            </th>
                                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                                Selisih
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedSo.details.map((d) => {
                                            const nama = d.id_bahan
                                                ? d.bahan?.nama_bahan
                                                : d.produk?.nama_produk;
                                            const kode = d.id_bahan
                                                ? d.bahan?.kode_bahan
                                                : d.produk?.kode_produk;
                                            const satuan = d.id_bahan
                                                ? d.bahan?.satuan_bahan
                                                : d.produk?.satuan_produk;
                                            const selisihNum = parseFloat(
                                                d.selisih as any,
                                            );

                                            return (
                                                <tr
                                                    key={d.id_so_detail}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="p-3 text-gray-500 font-mono text-xs">
                                                        {kode}
                                                    </td>
                                                    <td className="p-3 font-medium text-gray-900">
                                                        {nama}
                                                    </td>
                                                    <td className="p-3 text-center text-gray-600 font-semibold">
                                                        {d.qty_sistem}
                                                    </td>
                                                    <td className="p-3 text-center text-green-700 font-semibold">
                                                        {d.qty_fisik}
                                                    </td>
                                                    <td className="p-3 text-center text-red-600 font-semibold">
                                                        {d.qty_kadaluarsa}
                                                    </td>
                                                    <td
                                                        className={`p-3 text-center font-bold ${selisihNum < 0 ? "text-red-600" : selisihNum > 0 ? "text-green-600" : "text-gray-400"}`}
                                                    >
                                                        {selisihNum > 0
                                                            ? `+${selisihNum}`
                                                            : selisihNum}{" "}
                                                        {satuan}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 print:hidden">
                                <button
                                    onClick={() => handlePrint(selectedSo)}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-lg font-bold transition shadow-sm text-sm"
                                >
                                    <Printer className="w-4 h-4" /> Print
                                    Dokumen
                                </button>
                                <button
                                    onClick={() => setSelectedSo(null)}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-bold transition text-sm ml-auto"
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

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => setIsCreating(false)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-semibold transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Riwayat
                </button>
                <div className="text-right">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        No. Dokumen Otomatis
                    </span>
                    <span className="text-base font-bold text-red-800">
                        {nextNoSo}
                    </span>
                </div>
            </div>

            {Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded-r-lg flex gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-bold text-red-800">
                            Gagal Menyimpan Data!
                        </h3>
                        <ul className="mt-1 list-disc list-inside text-sm text-red-700">
                            {Object.values(errors).map((err: any, idx) => (
                                <li key={idx}>{err}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                    <div className="p-2 bg-red-50 rounded-lg text-red-800">
                        <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Formulir Penyesuaian Fisik
                        </h2>
                        <p className="text-xs text-gray-400">
                            Silakan isi kuantitas riil hasil perhitungan fisik
                            di gudang penyimpanan
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="max-w-xs mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />{" "}
                            Tanggal Opname
                        </label>
                        <input
                            type="date"
                            required
                            value={tglSo}
                            onChange={(e) => setTglSo(e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-800/20 focus:border-red-800 text-sm text-gray-700 font-medium h-10"
                        />
                    </div>

                    <div className="mb-5">
                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Pilih Filter Tampilan Data
                        </span>
                        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl w-fit">
                            <button
                                type="button"
                                onClick={() => setFilterMenu("bahan_baku")}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterMenu === "bahan_baku" ? "bg-white text-red-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                            >
                                Bahan Baku
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMenu("bahan_penolong")}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterMenu === "bahan_penolong" ? "bg-white text-red-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                            >
                                Bahan Penolong
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMenu("produk_jadi")}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterMenu === "produk_jadi" ? "bg-white text-red-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                            >
                                Produk Jadi
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMenu("all")}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${filterMenu === "all" ? "bg-red-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                            >
                                <Filter className="w-3 h-3" /> Semua
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-xl mb-6 shadow-inner max-h-[500px]">
                        <table className="w-full text-left text-sm border-collapse divide-y divide-gray-100">
                            <thead className="bg-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Kode
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Nama Item Gudang
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                        Stok Sistem
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                        Stok Fisik (Riil)
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                        Qty Kadaluarsa
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredItems.map((item) => (
                                    <tr
                                        key={item.id_unik}
                                        className="hover:bg-gray-50 group transition"
                                    >
                                        <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                                            {item.kode}
                                        </td>
                                        <td className="px-5 py-3 font-semibold text-gray-800">
                                            {item.nama}{" "}
                                            <span className="text-xs font-normal text-gray-400">
                                                ({item.satuan})
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center font-bold text-base text-gray-600 bg-gray-50">
                                            {item.qty_sistem}
                                        </td>
                                        <td className="px-5 py-3 bg-white">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.qty_fisik}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        item.id_unik,
                                                        "qty_fisik",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-24 text-center border-gray-300 group-hover:border-gray-400 rounded-md focus:ring-2 focus:ring-red-800/20 focus:border-red-800 text-sm font-bold text-gray-800 h-9 mx-auto block transition"
                                            />
                                        </td>
                                        <td className="px-5 py-3 bg-white">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.qty_kadaluarsa}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        item.id_unik,
                                                        "qty_kadaluarsa",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-24 text-center border-gray-300 group-hover:border-gray-400 rounded-md focus:ring-2 focus:ring-red-800/20 focus:border-red-800 text-sm font-bold text-red-700 h-9 mx-auto block transition"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-10 text-center text-xs text-gray-400 font-medium"
                                        >
                                            Tidak ada material di kategori ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing || masterItems.length === 0}
                            className="bg-red-800 hover:bg-red-900 text-white px-6 py-2 rounded-lg font-bold text-sm transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />{" "}
                            {isProcessing
                                ? "Menyimpan..."
                                : "Simpan Formulir SO"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

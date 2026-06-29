import { useState } from "react";
import { Eye, Search, CheckCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { router } from "@inertiajs/react";

// ================= INTERFACE TYPESCRIPT BACKEND =================
interface Bahan {
    id_bahan: number;
    kode_bahan: string;
    nama_bahan: string;
    satuan_bahan: string;
    harga_beli: number;
}

interface DetailPO {
    id_detail_po: number;
    qty_po: number;
    harga_satuan: number;
    subtotal: number;
    bahan: Bahan;
}

interface PermintaanPembelian {
    id_pp: number;
    no_pp: string;
    jenis_bahan: "baku" | "penolong" | "tambahan";
}

interface Supplier {
    id: number;
    nama_supplier: string;
}

// Gunakan nama IPurchaseOrder agar bebas dari error bentrok
export interface IPurchaseOrder {
    id_po: number;
    no_po: string;
    tgl_po: string;
    metode_beli: "tunai" | "tempo_30";
    catatan: string | null;
    status: "diajukan" | "perlu_revisi" | "disetujui";
    catatan_finance: string | null;
    permintaan: PermintaanPembelian;
    supplier: Supplier;
    details: DetailPO[];
}

interface Props {
    purchaseOrders: IPurchaseOrder[];
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);

const statusStyle: Record<IPurchaseOrder["status"], string> = {
    diajukan: "bg-yellow-100 text-yellow-700",
    disetujui: "bg-green-100 text-green-700",
    perlu_revisi: "bg-red-100 text-red-700",
};

const statusLabel: Record<IPurchaseOrder["status"], string> = {
    diajukan: "Menunggu Persetujuan",
    disetujui: "Disetujui",
    perlu_revisi: "Perlu Revisi",
};

export default function ApprovalPO({ purchaseOrders = [] }: Props) {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewingPO, setViewingPO] = useState<IPurchaseOrder | null>(null);
    const [catatan, setCatatan] = useState("");

    const handleApprove = () => {
        if (!viewingPO) return;
        router.put(
            `/keuangan/approval-po/${viewingPO.id_po}/setujui`,
            {
                catatan_finance: catatan || null,
            },
            {
                onSuccess: () => {
                    setViewingPO(null);
                    setCatatan("");
                },
            },
        );
    };

    const handleRevisi = () => {
        if (!viewingPO) return;
        if (!catatan.trim()) {
            alert("Catatan wajib diisi untuk status Perlu Revisi.");
            return;
        }
        router.put(
            `/keuangan/approval-po/${viewingPO.id_po}/revisi`,
            {
                catatan_finance: catatan,
            },
            {
                onSuccess: () => {
                    setViewingPO(null);
                    setCatatan("");
                },
            },
        );
    };

    // Pembagian list sesuai data backend
    const menunggu = purchaseOrders.filter(
        (p) => p.status === "diajukan" || p.status === "perlu_revisi",
    );
    const riwayat = purchaseOrders.filter((p) => p.status === "disetujui");

    const filteredMenunggu = menunggu.filter(
        (p) =>
            p.no_po.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.supplier.nama_supplier
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            p.permintaan.no_pp.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const filteredRiwayat = riwayat.filter(
        (p) =>
            p.no_po.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.supplier.nama_supplier
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            p.permintaan.no_pp.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // ── Halaman Detail ─────────────────────────────────────────────────────────
    if (viewingPO) {
        const p = viewingPO;
        // Tampilkan tombol approve/revisi selama belum disetujui
        const isMenunggu =
            p.status === "diajukan" || p.status === "perlu_revisi";

        return (
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setViewingPO(null);
                            setCatatan("");
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-red-800">
                            Detail Purchase Order
                        </h2>
                        <p className="text-sm text-red-800 mt-1">
                            Tinjau dan lakukan persetujuan pesanan pembelian
                        </p>
                    </div>
                </div>

                {/* Informasi PO */}
                <div className="bg-white rounded-lg shadow border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-base font-semibold text-red-800">
                            Informasi Pesanan Pembelian
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">
                                No. PO
                            </p>
                            <p className="text-sm font-semibold text-gray-800">
                                {p.no_po}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">
                                Tanggal PO
                            </p>
                            <p className="text-sm text-gray-800">
                                {new Date(p.tgl_po).toLocaleDateString(
                                    "id-ID",
                                    {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    },
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">
                                No. PR
                            </p>
                            <p className="text-sm font-semibold text-gray-800">
                                {p.permintaan.no_pp}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">
                                Supplier
                            </p>
                            <p className="text-sm text-gray-800">
                                {p.supplier.nama_supplier}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">
                                Jenis Pembayaran
                            </p>
                            <p className="text-sm text-gray-800">
                                {p.metode_beli === "tunai"
                                    ? "Tunai"
                                    : "Tempo 30 Hari"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">
                                Status
                            </p>
                            <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[p.status]}`}
                            >
                                {statusLabel[p.status]}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabel Detail Pembelian */}
                <div className="bg-white rounded-lg shadow border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-base font-semibold text-red-800">
                            Detail Pembelian
                        </h3>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Kode Bahan
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Nama Bahan
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Qty
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                        Satuan
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Harga Satuan
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {p.details.map((item) => (
                                    <tr
                                        key={item.id_detail_po}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                    >
                                        <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                            {item.bahan.kode_bahan}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {item.bahan.nama_bahan}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                            {item.qty_po}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                            {item.bahan.satuan_bahan}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                            {formatCurrency(item.harga_satuan)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700 text-right font-semibold">
                                            {formatCurrency(
                                                item.qty_po * item.harga_satuan,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100">
                                    <td
                                        colSpan={5}
                                        className="py-3 px-4 text-sm font-bold text-gray-800 text-right"
                                    >
                                        Total Purchase Order
                                    </td>
                                    <td className="py-3 px-4 text-sm font-bold text-gray-700 text-right">
                                        {formatCurrency(
                                            p.details.reduce(
                                                (s, i) =>
                                                    s +
                                                    i.qty_po * i.harga_satuan,
                                                0,
                                            ),
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Aksi Persetujuan */}
                <div className="bg-white rounded-lg shadow border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-base font-semibold text-red-800">
                            {isMenunggu
                                ? "Aksi Persetujuan"
                                : "Catatan Approval"}
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Tampilkan catatan lama jika ada */}
                        {p.catatan_finance && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                    Catatan
                                </p>
                                <p className="text-sm text-gray-700">
                                    {p.catatan_finance}
                                </p>
                            </div>
                        )}

                        {/* Field input hanya untuk yang masih menunggu */}
                        {isMenunggu && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Catatan Approval
                                    <span className="text-gray-400 font-normal ml-1">
                                        (wajib diisi jika Perlu Revisi)
                                    </span>
                                </label>
                                <textarea
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    rows={3}
                                    placeholder="Masukkan catatan persetujuan atau alasan revisi..."
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none"
                                />
                            </div>
                        )}

                        <div className="flex gap-3 pt-2 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setViewingPO(null);
                                    setCatatan("");
                                }}
                                className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Kembali
                            </button>

                            {/* Tombol approve/revisi hanya untuk yang masih menunggu */}
                            {isMenunggu && (
                                <>
                                    <button
                                        onClick={handleRevisi}
                                        className="flex items-center gap-2 px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Perlu Revisi
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Setuju
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Halaman List ───────────────────────────────────────────────────────────
    const TabelPO = ({
        data,
        emptyMsg,
    }: {
        data: IPurchaseOrder[];
        emptyMsg: string;
    }) => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            No. PO
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Tanggal PO
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            No. PR
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Supplier
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Metode Pembayaran
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                            Total PO
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                            Status
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={8}
                                className="py-8 text-center text-sm text-gray-400 italic"
                            >
                                {emptyMsg}
                            </td>
                        </tr>
                    ) : (
                        data.map((p) => (
                            <tr
                                key={p.id_po}
                                className="border-b border-gray-100 hover:bg-gray-50"
                            >
                                <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                                    {p.no_po}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {new Date(p.tgl_po).toLocaleDateString(
                                        "id-ID",
                                    )}
                                </td>
                                <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                                    {p.permintaan.no_pp}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {p.supplier.nama_supplier}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {p.metode_beli === "tunai"
                                        ? "Tunai"
                                        : "Tempo 30 Hari"}
                                </td>
                                <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">
                                    {formatCurrency(
                                        p.details.reduce(
                                            (s, i) =>
                                                s + i.qty_po * i.harga_satuan,
                                            0,
                                        ),
                                    )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[p.status]}`}
                                    >
                                        {statusLabel[p.status]}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <button
                                        onClick={() => {
                                            setViewingPO(p);
                                            setCatatan(p.catatan_finance || "");
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Detail"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-red-800">
                        Approval Pesanan Pembelian
                    </h2>
                    <p className="text-sm text-red-800 mt-1">
                        Tinjau dan setujui Purchase Order sebelum dikirim ke
                        supplier
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari no. PO, supplier, atau no. PR..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white"
                />
            </div>

            {/* Tabel 1: Menunggu Persetujuan */}
            <div className="bg-white rounded-lg shadow border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-bold text-red-800">
                        Daftar Pesanan Pembelian Menunggu Persetujuan
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Purchase Order yang belum mendapat keputusan approval
                    </p>
                </div>
                <div className="p-6">
                    <TabelPO
                        data={filteredMenunggu}
                        emptyMsg="Tidak ada PO yang menunggu persetujuan"
                    />
                </div>
            </div>

            {/* Tabel 2: Riwayat Persetujuan */}
            <div className="bg-white rounded-lg shadow border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-bold text-red-800">
                        Riwayat Persetujuan Pesanan Pembelian
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Purchase Order yang telah disetujui atau memerlukan
                        revisi
                    </p>
                </div>
                <div className="p-6">
                    <TabelPO
                        data={filteredRiwayat}
                        emptyMsg="Belum ada riwayat persetujuan"
                    />
                </div>
            </div>
        </div>
    );
}

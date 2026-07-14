import { useState, useMemo } from "react";
import { usePage } from "@inertiajs/react";
import { Search, Printer, Calendar, FileText } from "lucide-react";

interface HutangData {
    id: string;
    noHutang: string;
    noTransaksi: string;
    supplier: string;
    totalHutang: number;
    terbayar: number;
    kurangBayar: number;
    tanggalJatuhTempo: string;
    status: "Lunas" | "Belum Lunas";
}

const formatCurrency = (v: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(v);

export default function LaporanHutangUsaha() {
    const { dbHutang = [] } = usePage().props as unknown as {
        dbHutang: HutangData[];
    };

    const [tanggalMulai, setTanggalMulai] = useState("2026-01-01");
    const [tanggalSelesai, setTanggalSelesai] = useState("2026-12-31");
    const [filterStatus, setFilterStatus] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Filter & Search Logic
    const filteredData = useMemo(() => {
        return dbHutang.filter((h) => {
            const tgl = new Date(h.tanggalJatuhTempo);
            const mulai = new Date(tanggalMulai);
            const selesai = new Date(tanggalSelesai);

            const inDate =
                h.tanggalJatuhTempo !== "-"
                    ? tgl >= mulai && tgl <= selesai
                    : true;
            const matchStatus =
                filterStatus === "" || h.status === filterStatus;
            const matchSearch =
                !searchTerm ||
                h.noHutang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.supplier.toLowerCase().includes(searchTerm.toLowerCase());

            return inDate && matchStatus && matchSearch;
        });
    }, [dbHutang, tanggalMulai, tanggalSelesai, filterStatus, searchTerm]);

    const totalHutang = filteredData.reduce((s, h) => s + h.totalHutang, 0);
    const totalSisa = filteredData.reduce((s, h) => s + h.kurangBayar, 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-red-800">
                        Laporan Hutang Usaha
                    </h2>
                    <p className="text-sm text-red-800 mt-1">
                        Rekapitulasi hutang kepada supplier
                    </p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                >
                    <Printer className="w-5 h-5" /> Cetak Laporan
                </button>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200">
                {/* Filter */}
                <div className="p-6 border-b border-gray-200 print:hidden grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="date"
                        value={tanggalMulai}
                        onChange={(e) => setTanggalMulai(e.target.value)}
                        className="px-4 py-2 border rounded-lg text-sm"
                    />
                    <input
                        type="date"
                        value={tanggalSelesai}
                        onChange={(e) => setTanggalSelesai(e.target.value)}
                        className="px-4 py-2 border rounded-lg text-sm"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg text-sm"
                    >
                        <option value="">Semua Status</option>
                        <option value="Lunas">Lunas</option>
                        <option value="Belum Lunas">Belum Lunas</option>
                    </select>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari Supplier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="py-3 px-4 border text-left">
                                    No Hutang
                                </th>
                                <th className="py-3 px-4 border text-left">
                                    Supplier
                                </th>
                                <th className="py-3 px-4 border text-right">
                                    Total Hutang
                                </th>
                                <th className="py-3 px-4 border text-right">
                                    Sisa Hutang
                                </th>
                                <th className="py-3 px-4 border text-center">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((h) => (
                                <tr
                                    key={h.id}
                                    className="border-b hover:bg-gray-50"
                                >
                                    <td className="py-3 px-4 border">
                                        {h.noHutang}
                                    </td>
                                    <td className="py-3 px-4 border">
                                        {h.supplier}
                                    </td>
                                    <td className="py-3 px-4 border text-right">
                                        {formatCurrency(h.totalHutang)}
                                    </td>
                                    <td className="py-3 px-4 border text-right font-semibold text-red-600">
                                        {formatCurrency(h.kurangBayar)}
                                    </td>
                                    <td className="py-3 px-4 border text-center">
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${h.status === "Lunas" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                        >
                                            {h.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="font-bold bg-gray-50">
                            <tr>
                                <td
                                    colSpan={2}
                                    className="py-3 px-4 border text-right"
                                >
                                    GRAND TOTAL
                                </td>
                                <td className="py-3 px-4 border text-right">
                                    {formatCurrency(totalHutang)}
                                </td>
                                <td className="py-3 px-4 border text-right text-red-700">
                                    {formatCurrency(totalSisa)}
                                </td>
                                <td className="border"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

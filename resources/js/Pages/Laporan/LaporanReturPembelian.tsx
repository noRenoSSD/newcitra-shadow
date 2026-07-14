import { useState, useMemo } from "react";
import { usePage } from "@inertiajs/react";
import { Search, Printer, FileText, Calendar } from "lucide-react";

// --- INTERFACES SESUAI CONTROLLER LARAVEL ---
interface BahanDetail {
    kode_bahan: string;
    nama_bahan: string;
}

interface DetailRetur {
    id_detail_retur: number;
    qty_retur: number;
    harga_satuan: number;
    alasan: string;
    bahan: BahanDetail | null;
}

interface Supplier {
    nama_supplier: string;
}

interface PurchaseOrder {
    no_po: string;
    supplier: Supplier | null;
}

interface Penerimaan {
    no_penerimaan: string;
    purchaseOrder: PurchaseOrder | null;
}

interface RiwayatRetur {
    id_retur: number;
    no_retur: string;
    tanggal_retur: string;
    total_nilai: number;
    penerimaan: Penerimaan | null;
    details: DetailRetur[];
}

interface LaporanRow {
    noRetur: string;
    tanggal: string;
    supplier: string;
    namaBahan: string;
    qty: number;
    harga: number;
    total: number;
    alasan: string;
}

export default function LaporanReturPembelian() {
    // Tangkap data 'riwayatRetur' dari Controller menggunakan usePage
    const { riwayatRetur = [] } = usePage().props as unknown as {
        riwayatRetur: RiwayatRetur[];
    };

    // Set default tanggal ke awal tahun agar data langsung muncul
    const [tanggalMulai, setTanggalMulai] = useState("2026-01-01");
    const [tanggalSelesai, setTanggalSelesai] = useState("2026-12-31");
    const [filterSupplier, setFilterSupplier] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // --- HELPER FUNCTIONS ---
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // --- MAPPING & FILTER LOGIC DENGAN USEMEMO ---
    const filteredRows = useMemo(() => {
        const rows: LaporanRow[] = [];

        riwayatRetur.forEach((retur) => {
            const tanggalItem = new Date(retur.tanggal_retur);
            const mulai = new Date(tanggalMulai);
            const selesai = new Date(tanggalSelesai);

            const supplierName =
                retur.penerimaan?.purchaseOrder?.supplier?.nama_supplier || "-";

            // Pengecekan filter Header
            const inDateRange = tanggalItem >= mulai && tanggalItem <= selesai;
            const matchSupplier =
                filterSupplier === "" || supplierName === filterSupplier;

            if (inDateRange && matchSupplier) {
                // Ekstrak detail barang
                retur.details.forEach((detail) => {
                    const namaBahan = detail.bahan?.nama_bahan || "-";

                    // Pengecekan search teks (No Retur, Supplier, Nama Bahan)
                    const matchSearch =
                        !searchTerm ||
                        retur.no_retur
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                        supplierName
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                        namaBahan
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase());

                    if (matchSearch) {
                        rows.push({
                            noRetur: retur.no_retur,
                            tanggal: retur.tanggal_retur,
                            supplier: supplierName,
                            namaBahan: namaBahan,
                            qty: detail.qty_retur,
                            harga: detail.harga_satuan,
                            total: detail.qty_retur * detail.harga_satuan,
                            alasan: detail.alasan || "-",
                        });
                    }
                });
            }
        });

        return rows;
    }, [
        riwayatRetur,
        tanggalMulai,
        tanggalSelesai,
        filterSupplier,
        searchTerm,
    ]);

    // --- UNIQUE DROPDOWN LISTS ---
    const supplierList = Array.from(
        new Set(
            riwayatRetur
                .map(
                    (retur) =>
                        retur.penerimaan?.purchaseOrder?.supplier
                            ?.nama_supplier,
                )
                .filter(Boolean),
        ),
    ) as string[];

    // --- CALCULATION METRICS ---
    const totalQty = useMemo(
        () => filteredRows.reduce((sum, item) => sum + item.qty, 0),
        [filteredRows],
    );
    const totalNilai = useMemo(
        () => filteredRows.reduce((sum, item) => sum + item.total, 0),
        [filteredRows],
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6 print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-red-800">
                        Laporan Retur Pembelian
                    </h2>
                    <p className="text-sm text-red-800 mt-1">
                        Laporan rekapitulasi retur pembelian bahan CV New Citra
                    </p>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                >
                    <Printer className="w-5 h-5" />
                    Cetak Laporan
                </button>
            </div>

            <div className="bg-white rounded-lg shadow">
                {/* Filter Section */}
                <div className="p-6 border-b border-gray-200 print:hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Periode Dari
                            </label>
                            <input
                                type="date"
                                value={tanggalMulai}
                                onChange={(e) =>
                                    setTanggalMulai(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Periode Sampai
                            </label>
                            <input
                                type="date"
                                value={tanggalSelesai}
                                onChange={(e) =>
                                    setTanggalSelesai(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter Supplier
                            </label>
                            <select
                                value={filterSupplier}
                                onChange={(e) =>
                                    setFilterSupplier(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="">Semua Supplier</option>
                                {supplierList.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari No Retur, Supplier, atau Nama Bahan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1 font-medium">
                                Total Qty Retur
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {totalQty.toLocaleString("id-ID")}{" "}
                                <span className="text-xs font-normal text-gray-400">
                                    unit
                                </span>
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1 font-medium">
                                Total Nilai Retur
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {formatCurrency(totalNilai)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="p-6">
                    {/* Print Header */}
                    <div className="hidden print:block mb-6 text-center border-b-2 border-gray-800 pb-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            CV NEW CITRA
                        </h1>
                        <p className="text-sm text-gray-600">
                            Laporan Retur Pembelian
                        </p>
                        <p className="text-sm text-gray-600">
                            Periode: {formatDate(tanggalMulai)} -{" "}
                            {formatDate(tanggalSelesai)}
                        </p>
                    </div>

                    {filteredRows.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">
                                Tidak ada data retur pembelian untuk periode
                                yang dipilih
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">
                                                No. Retur
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">
                                                Tanggal
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">
                                                Supplier
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">
                                                Nama Bahan
                                            </th>
                                            <th className="text-right py-3 px-3 text-sm font-semibold text-gray-700">
                                                Qty
                                            </th>
                                            <th className="text-right py-3 px-3 text-sm font-semibold text-gray-700">
                                                Harga
                                            </th>
                                            <th className="text-right py-3 px-3 text-sm font-semibold text-gray-700">
                                                Total
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">
                                                Alasan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRows.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100 font-semibold">
                                                    {item.noRetur}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                    {formatDate(item.tanggal)}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                    {item.supplier}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                    {item.namaBahan}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 text-right border-r border-gray-100 font-medium">
                                                    {item.qty.toLocaleString(
                                                        "id-ID",
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 text-right border-r border-gray-100">
                                                    {formatCurrency(item.harga)}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 text-right border-r border-gray-100 font-medium">
                                                    {formatCurrency(item.total)}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700">
                                                    {item.alasan}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-100 font-bold">
                                            <td
                                                colSpan={4}
                                                className="py-3 px-3 text-sm text-gray-800 text-right border-r border-gray-300"
                                            >
                                                GRAND TOTAL:
                                            </td>
                                            <td className="py-3 px-3 text-sm text-gray-800 text-right border-r border-gray-300">
                                                {totalQty.toLocaleString(
                                                    "id-ID",
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-sm text-gray-800 text-right border-r border-gray-300"></td>
                                            <td className="py-3 px-3 text-sm text-gray-800 text-right border-r border-gray-300">
                                                {formatCurrency(totalNilai)}
                                            </td>
                                            <td className="py-3 px-3"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Summary Footer */}
                            <div className="mt-4 text-sm text-gray-500">
                                Menampilkan {filteredRows.length} baris detail
                                retur pembelian
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
        </div>
    );
}

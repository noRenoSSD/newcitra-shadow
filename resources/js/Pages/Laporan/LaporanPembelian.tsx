import { useState, useMemo } from "react";
import { usePage } from "@inertiajs/react";
import { Search, Printer, FileText, Calendar } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BahanDetail {
    kode_bahan: string;
    nama_bahan: string;
    satuan_bahan: string;
    jenis_bahan?: string;
}

interface TransaksiDetail {
    qty: number;
    harga_aktual: number;
    subtotal: number;
    bahan: BahanDetail | null;
}

interface RiwayatTransaksi {
    id_transaksi: number;
    no_faktur: string;
    tanggal_transaksi: string;
    metode_pembayaran: string;
    total_tagihan: number;
    penerimaan: {
        no_penerimaan: string;
        purchase_order: {
            no_po: string;
            supplier: {
                nama_supplier: string;
            } | null;
        } | null;
    } | null;
    details: TransaksiDetail[];
}

interface LaporanRow {
    noFaktur: string;
    noPO: string;
    tanggal: string;
    kodeBahan: string;
    namaBahan: string;
    jenisBahan: string;
    supplier: string;
    jumlah: number;
    satuan: string;
    harga: number;
    subtotal: number;
    totalTagihan: number;
    isFirstRowOfTransaksi: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LaporanPembelian() {
    // Tangkap data dari Controller Laravel menggunakan gaya usePage (sama seperti LaporanProduksi)
    const { riwayatTransaksi = [] } = usePage().props as unknown as {
        riwayatTransaksi: RiwayatTransaksi[];
    };

    const [tanggalMulai, setTanggalMulai] = useState("2026-01-01");
    const [tanggalSelesai, setTanggalSelesai] = useState("2026-12-31");
    const [filterSupplier, setFilterSupplier] = useState("");
    const [filterJenisBahan, setFilterJenisBahan] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Memoize filter data (sama seperti gaya penulisan LaporanProduksi)
    const filteredData = useMemo(() => {
        return riwayatTransaksi.filter((transaksi) => {
            const tanggalTransaksi = new Date(transaksi.tanggal_transaksi);
            const mulai = new Date(tanggalMulai);
            const selesai = new Date(tanggalSelesai);

            const supplierName =
                transaksi.penerimaan?.purchase_order?.supplier?.nama_supplier ||
                "-";
            const noPO = transaksi.penerimaan?.purchase_order?.no_po || "-";

            const inDateRange =
                tanggalTransaksi >= mulai && tanggalTransaksi <= selesai;
            const matchSupplier =
                !filterSupplier ||
                supplierName
                    .toLowerCase()
                    .includes(filterSupplier.toLowerCase());

            // Cek detail untuk mencocokkan jenis bahan
            const matchJenisBahan =
                !filterJenisBahan ||
                transaksi.details.some(
                    (d) =>
                        (d.bahan?.jenis_bahan || "baku").toLowerCase() ===
                        filterJenisBahan.toLowerCase(),
                );

            const matchSearch =
                !searchTerm ||
                transaksi.no_faktur
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                noPO.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplierName.toLowerCase().includes(searchTerm.toLowerCase());

            return (
                inDateRange && matchSupplier && matchJenisBahan && matchSearch
            );
        });
    }, [
        riwayatTransaksi,
        tanggalMulai,
        tanggalSelesai,
        filterSupplier,
        filterJenisBahan,
        searchTerm,
    ]);

    // Ekstrak baris tabel
    const tableRows = useMemo(() => {
        const rows: LaporanRow[] = [];
        filteredData.forEach((transaksi) => {
            const supplierName =
                transaksi.penerimaan?.purchase_order?.supplier?.nama_supplier ||
                "-";
            const noPO = transaksi.penerimaan?.purchase_order?.no_po || "-";

            transaksi.details.forEach((item, index) => {
                rows.push({
                    noFaktur: transaksi.no_faktur,
                    noPO: noPO,
                    tanggal: transaksi.tanggal_transaksi,
                    kodeBahan: item.bahan?.kode_bahan || "-",
                    namaBahan: item.bahan?.nama_bahan || "-",
                    jenisBahan:
                        item.bahan?.jenis_bahan === "penolong"
                            ? "Bahan Penolong"
                            : "Bahan Baku",
                    supplier: supplierName,
                    jumlah: item.qty,
                    satuan: item.bahan?.satuan_bahan || "-",
                    harga: item.harga_aktual,
                    subtotal: item.subtotal,
                    totalTagihan: transaksi.total_tagihan,
                    isFirstRowOfTransaksi: index === 0,
                });
            });
        });
        return rows;
    }, [filteredData]);

    const totalPembelian = useMemo(
        () =>
            filteredData.reduce(
                (sum, transaksi) => sum + Number(transaksi.total_tagihan),
                0,
            ),
        [filteredData],
    );

    const totalTransaksi = filteredData.length;

    const uniqueSuppliers = Array.from(
        new Set(
            riwayatTransaksi
                .map(
                    (t) =>
                        t.penerimaan?.purchase_order?.supplier?.nama_supplier,
                )
                .filter(Boolean),
        ),
    ) as string[];

    const handlePrint = () => window.print();

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6 print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-red-800">
                        Laporan Pembelian
                    </h2>
                    <p className="text-sm text-red-800 mt-1">
                        Laporan rekapitulasi transaksi pembelian bahan CV New
                        Citra
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                Supplier
                            </label>
                            <select
                                value={filterSupplier}
                                onChange={(e) =>
                                    setFilterSupplier(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="">Semua Supplier</option>
                                {uniqueSuppliers.map((supplier, idx) => (
                                    <option key={idx} value={supplier}>
                                        {supplier}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Jenis Bahan
                            </label>
                            <select
                                value={filterJenisBahan}
                                onChange={(e) =>
                                    setFilterJenisBahan(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="">Semua Jenis</option>
                                <option value="baku">Bahan Baku</option>
                                <option value="penolong">Bahan Penolong</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari No Faktur, No PO, atau Supplier..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">
                                Total Transaksi
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {totalTransaksi}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">
                                Total Pembelian
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {formatCurrency(totalPembelian)}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">
                                Rata-rata per Transaksi
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {totalTransaksi > 0
                                    ? formatCurrency(
                                          totalPembelian / totalTransaksi,
                                      )
                                    : formatCurrency(0)}
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
                            Laporan Pembelian
                        </p>
                        <p className="text-sm text-gray-600">
                            Periode: {formatDate(tanggalMulai)} -{" "}
                            {formatDate(tanggalSelesai)}
                        </p>
                    </div>

                    {tableRows.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">
                                Tidak ada data pembelian untuk periode yang
                                dipilih
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-700">
                                            <th className="text-left py-3 px-3 text-sm font-semibold">
                                                No Faktur
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold">
                                                Tanggal
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold">
                                                Kode Bahan
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold">
                                                Nama Bahan
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold">
                                                Jenis Bahan
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold">
                                                Supplier
                                            </th>
                                            <th className="text-right py-3 px-3 text-sm font-semibold">
                                                Jumlah
                                            </th>
                                            <th className="text-center py-3 px-3 text-sm font-semibold">
                                                Satuan
                                            </th>
                                            <th className="text-right py-3 px-3 text-sm font-semibold">
                                                Harga Aktual
                                            </th>
                                            <th className="text-right py-3 px-3 text-sm font-semibold">
                                                Subtotal
                                            </th>
                                            <th className="text-right py-3 px-3 text-sm font-semibold">
                                                Total Tagihan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableRows.map((row, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100 font-semibold">
                                                    {row.isFirstRowOfTransaksi
                                                        ? row.noFaktur
                                                        : ""}
                                                    {row.isFirstRowOfTransaksi && (
                                                        <div className="text-xs text-gray-400 font-normal">
                                                            {row.noPO}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                    {row.isFirstRowOfTransaksi
                                                        ? formatDate(
                                                              row.tanggal,
                                                          )
                                                        : ""}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100 font-semibold">
                                                    {row.kodeBahan}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                    {row.namaBahan}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                    {row.isFirstRowOfTransaksi
                                                        ? row.jenisBahan
                                                        : ""}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                    {row.isFirstRowOfTransaksi
                                                        ? row.supplier
                                                        : ""}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 text-right border-r border-gray-100">
                                                    {row.jumlah.toLocaleString(
                                                        "id-ID",
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 text-center border-r border-gray-100">
                                                    {row.satuan}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 text-right border-r border-gray-100">
                                                    {formatCurrency(row.harga)}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 text-right border-r border-gray-100">
                                                    {formatCurrency(
                                                        row.subtotal,
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-sm font-semibold text-gray-700 text-right">
                                                    {row.isFirstRowOfTransaksi
                                                        ? formatCurrency(
                                                              row.totalTagihan,
                                                          )
                                                        : ""}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                            <td
                                                colSpan={10}
                                                className="py-3 px-3 text-sm text-gray-700 text-right border-r border-gray-300"
                                            >
                                                GRAND TOTAL:
                                            </td>
                                            <td className="py-3 px-3 text-sm text-gray-700 text-right">
                                                {formatCurrency(totalPembelian)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="mt-4 text-sm text-gray-600">
                                Total {totalTransaksi} transaksi pembelian
                                (Faktur)
                            </div>
                        </>
                    )}
                </div>
            </div>

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

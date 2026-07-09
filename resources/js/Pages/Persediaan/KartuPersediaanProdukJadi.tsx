import React from "react";
import { Printer } from "lucide-react";
import { router } from "@inertiajs/react";

// --- Interfaces yang disesuaikan dengan Controller Laravel ---
interface Mutasi {
    id: number;
    tanggal: string;
    noRef: string;
    masukUnit: number;
    masukHarga: number;
    masukTotal: number;
    keluarUnit: number;
    keluarHarga: number;
    keluarTotal: number;
    saldoUnit: number;
    saldoHarga: number;
    saldoTotal: number;
}

interface Produk {
    id_produk: number;
    kode_produk: string;
    nama_produk: string;
    satuan_produk: string; // atau satuan_produk sesuai database Anda
}

interface Props {
    listProduk: Produk[];
    mutasiData: Mutasi[];
    selectedId: string | number | null;
}

export default function KartuPersediaanProdukJadi({
    listProduk = [],
    mutasiData = [],
    selectedId,
}: Props) {
    // Mencari detail produk jadi yang sedang dipilih
    const selectedProduk =
        listProduk.find((p) => p.id_produk == selectedId) || null;

    // Mengambil stok terakhir dari baris terbawah mutasiData
    const stokGudang =
        mutasiData.length > 0 ? mutasiData[mutasiData.length - 1].saldoUnit : 0;

    // Fungsi untuk mengganti produk yang dipilih via Dropdown ke URL produk-jadi
    const handleSelectProduk = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id_produk = e.target.value;
        router.get(
            "/persediaan/produk-jadi",
            id_produk ? { id_produk: id_produk } : {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen print:bg-white print:p-0">
            {/* Page Header Area */}
            <div className="mb-6 print:hidden">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Kartu Persediaan Produk Jadi
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Pencatatan Mutasi dan Saldo Produk Jadi
                </p>
            </div>

            {/* Filter Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 print:hidden">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kode Produk
                            </label>
                            <select
                                value={selectedId || ""}
                                onChange={handleSelectProduk}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors bg-white text-gray-700"
                            >
                                <option value="">Pilih Produk Jadi</option>
                                {listProduk.map((produk) => (
                                    <option
                                        key={produk.id_produk}
                                        value={produk.id_produk}
                                    >
                                        {produk.kode_produk}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Produk
                            </label>
                            <select
                                value={selectedId || ""}
                                onChange={handleSelectProduk}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors bg-white text-gray-700"
                            >
                                <option value="">Pilih Produk Jadi</option>
                                {listProduk.map((produk) => (
                                    <option
                                        key={produk.id_produk}
                                        value={produk.id_produk}
                                    >
                                        {produk.nama_produk}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handlePrint}
                            disabled={!selectedProduk}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                                selectedProduk
                                    ? "bg-red-700 hover:bg-red-800 text-white"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            <Printer className="w-5 h-5" /> Cetak Kartu
                            Persediaan
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Card (Tabel Persediaan) */}
            {selectedProduk ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                        {/* Header Cetak */}
                        <div className="text-center mb-6 hidden print:block">
                            <h2 className="text-2xl font-bold text-gray-800">
                                CV NEW CITRA
                            </h2>
                            <p className="text-gray-600">
                                Sistem Informasi Akuntansi
                            </p>
                            <h3 className="text-xl font-semibold text-red-700 mt-4">
                                KARTU PERSEDIAAN PRODUK JADI
                            </h3>
                        </div>

                        {/* Rincian Produk Jadi Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-4 border-b border-gray-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Kode Produk
                                </label>
                                <p className="text-gray-800 font-bold">
                                    {selectedProduk.kode_produk}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Nama Produk
                                </label>
                                <p className="text-gray-800 font-bold">
                                    {selectedProduk.nama_produk}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Satuan
                                </label>
                                <p className="text-gray-800 font-bold">
                                    {selectedProduk.satuan_produk}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Stok Saat Ini
                                </label>
                                <p className="text-gray-800 font-bold text-lg">
                                    {stokGudang.toLocaleString("id-ID")}{" "}
                                    {selectedProduk.satuan_produk}
                                </p>
                            </div>
                        </div>

                        {/* Tabel Kartu Persediaan */}
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th
                                            rowSpan={2}
                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wide border-r border-gray-200"
                                        >
                                            Tanggal
                                        </th>
                                        <th
                                            rowSpan={2}
                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wide border-r border-gray-200"
                                        >
                                            No Ref
                                        </th>
                                        <th
                                            colSpan={3}
                                            className="px-4 py-2 text-center text-xs font-semibold text-gray-700 tracking-wide border-b border-r border-gray-200"
                                        >
                                            Masuk
                                        </th>
                                        <th
                                            colSpan={3}
                                            className="px-4 py-2 text-center text-xs font-semibold text-gray-700 tracking-wide border-b border-r border-gray-200"
                                        >
                                            Keluar
                                        </th>
                                        <th
                                            colSpan={3}
                                            className="px-4 py-2 text-center text-xs font-semibold text-gray-700 tracking-wide border-b border-gray-200"
                                        >
                                            Saldo
                                        </th>
                                    </tr>
                                    <tr className="bg-gray-100 border-b border-gray-200">
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 tracking-wide border-r border-gray-200">
                                            Unit
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 tracking-wide border-r border-gray-200">
                                            Harga
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 tracking-wide border-r border-gray-200">
                                            Total
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 tracking-wide border-r border-gray-200">
                                            Unit
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 tracking-wide border-r border-gray-200">
                                            Harga
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 tracking-wide border-r border-gray-200">
                                            Total
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 tracking-wide border-r border-gray-200">
                                            Unit
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 tracking-wide border-r border-gray-200">
                                            Harga
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 tracking-wide">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {mutasiData.map((mutasi) => (
                                        <tr
                                            key={mutasi.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3 text-gray-700 border-r border-gray-100 whitespace-nowrap">
                                                {mutasi.tanggal}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 font-semibold border-r border-gray-100">
                                                {mutasi.noRef}
                                            </td>

                                            {/* Kolom Masuk */}
                                            <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">
                                                {mutasi.masukUnit > 0
                                                    ? mutasi.masukUnit.toLocaleString(
                                                          "id-ID",
                                                      )
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">
                                                {mutasi.masukHarga > 0
                                                    ? formatRupiah(
                                                          mutasi.masukHarga,
                                                      )
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">
                                                {mutasi.masukTotal > 0
                                                    ? formatRupiah(
                                                          mutasi.masukTotal,
                                                      )
                                                    : "-"}
                                            </td>

                                            {/* Kolom Keluar */}
                                            <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">
                                                {mutasi.keluarUnit > 0
                                                    ? mutasi.keluarUnit.toLocaleString(
                                                          "id-ID",
                                                      )
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">
                                                {mutasi.keluarHarga > 0
                                                    ? formatRupiah(
                                                          mutasi.keluarHarga,
                                                      )
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100">
                                                {mutasi.keluarTotal > 0
                                                    ? formatRupiah(
                                                          mutasi.keluarTotal,
                                                      )
                                                    : "-"}
                                            </td>

                                            {/* Kolom Saldo */}
                                            <td className="px-4 py-3 text-right text-gray-700 font-semibold border-r border-gray-100 bg-gray-50/50">
                                                {mutasi.saldoUnit.toLocaleString(
                                                    "id-ID",
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700 border-r border-gray-100 bg-gray-50/50">
                                                {formatRupiah(
                                                    mutasi.saldoHarga,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700 font-semibold bg-gray-50/50">
                                                {formatRupiah(
                                                    mutasi.saldoTotal,
                                                )}
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Baris Total Saldo Keseluruhan */}
                                    {mutasiData.length > 0 && (
                                        <tr className="bg-gray-100 border-t-2 border-gray-300">
                                            <td
                                                colSpan={10}
                                                className="px-4 py-3 text-right font-semibold text-gray-700"
                                            >
                                                Total Inventory Balance
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-700">
                                                {formatRupiah(
                                                    mutasiData[
                                                        mutasiData.length - 1
                                                    ].saldoTotal,
                                                )}
                                            </td>
                                        </tr>
                                    )}

                                    {/* Kondisi Data Kosong */}
                                    {mutasiData.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={11}
                                                className="p-8 text-center text-gray-400 font-medium"
                                            >
                                                Belum ada riwayat mutasi
                                                keuangan pada produk jadi ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Blok Tanda Tangan Cetak (Hanya Muncul Saat Print) */}
                        <div className="mt-6 pt-4 border-t border-gray-200 hidden print:block print:mt-12">
                            <div className="grid grid-cols-3 gap-8 text-center">
                                <div>
                                    <p className="text-sm text-gray-600 mb-12">
                                        Dibuat Oleh,
                                    </p>
                                    <p className="text-sm font-semibold border-t border-gray-800 pt-1 inline-block px-8">
                                        ( _________________ )
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-12">
                                        Diperiksa Oleh,
                                    </p>
                                    <p className="text-sm font-semibold border-t border-gray-800 pt-1 inline-block px-8">
                                        ( _________________ )
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-12">
                                        Disetujui Oleh,
                                    </p>
                                    <p className="text-sm font-semibold border-t border-gray-800 pt-1 inline-block px-8">
                                        ( _________________ )
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stempel Waktu Cetak */}
                        <div className="mt-6 text-center text-sm text-gray-500 hidden print:block">
                            <p>
                                Dicetak pada:{" "}
                                {new Date().toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-12">
                        <p className="text-center text-gray-500">
                            Silakan pilih produk jadi pada kolom di atas untuk
                            menampilkan rincian kartu persediaan mutasi.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

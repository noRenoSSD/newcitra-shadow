import React, { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { router } from "@inertiajs/react";

// --- Interfaces yang disesuaikan dengan Controller Laravel ---
interface Mutasi {
    id: string | number;
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

interface BahanBaku {
    id_bahan: number;
    kode_bahan: string;
    nama_bahan: string;
    satuan_bahan: string;
    harga_beli?: number;
}

interface Props {
    listBahan: BahanBaku[];
    mutasiData: Mutasi[];
    selectedId: string | number | null;
}

export default function PersediaanBahanBaku({
    listBahan = [],
    mutasiData = [],
    selectedId,
}: Props) {
    const [selectedBahanId, setSelectedBahanId] = useState<string>(
        selectedId?.toString() || "",
    );
    const [activeBahan, setActiveBahan] = useState<BahanBaku | null>(null);

    // Sinkronisasi state bahan yang aktif saat prop selectedId atau listBahan berubah
    useEffect(() => {
        if (selectedBahanId && listBahan.length > 0) {
            const found = listBahan.find(
                (b) => b.id_bahan.toString() === selectedBahanId,
            );
            if (found) setActiveBahan(found);
        } else {
            setActiveBahan(null);
        }
    }, [selectedBahanId, listBahan]);

    // Mengambil stok terakhir dari baris terbawah data mutasi
    const stokGudang =
        mutasiData.length > 0 ? mutasiData[mutasiData.length - 1].saldoUnit : 0;

    // Fungsi untuk mengganti bahan yang dipilih (menembak ke Controller)
    const handleBahanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedBahanId(id);
        if (id) {
            // Asumsi menggunakan ziggy route() seperti pada source asli
            router.get(
                route("persediaan.baku"),
                { id_bahan: id },
                { preserveState: true, replace: true },
            );
        } else {
            router.get(route("persediaan.baku"));
        }
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
            {/* Page Header */}
            <div className="mb-6 print:hidden">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Kartu Persediaan Bahan Baku
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Pencatatan Mutasi dan Saldo Bahan Baku
                </p>
            </div>

            {/* Filter Card (Desain Figma: 2 Kolom Dropdown) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 print:hidden">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kode Bahan
                            </label>
                            <select
                                value={selectedBahanId}
                                onChange={handleBahanChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors bg-white text-gray-700"
                            >
                                <option value="">Pilih Bahan Baku</option>
                                {listBahan.map((bahan) => (
                                    <option
                                        key={bahan.id_bahan}
                                        value={bahan.id_bahan}
                                    >
                                        {bahan.kode_bahan}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Bahan
                            </label>
                            <select
                                value={selectedBahanId}
                                onChange={handleBahanChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors bg-white text-gray-700"
                            >
                                <option value="">Pilih Bahan Baku</option>
                                {listBahan.map((bahan) => (
                                    <option
                                        key={bahan.id_bahan}
                                        value={bahan.id_bahan}
                                    >
                                        {bahan.nama_bahan}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handlePrint}
                            disabled={!activeBahan}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                                activeBahan
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
            {activeBahan ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none">
                    <div className="p-6 print:p-0">
                        {/* Header Cetak (Spesifik Sistem Informasi Akuntansi CV NEW CITRA) */}
                        <div className="text-center mb-6 hidden print:block">
                            <h2 className="text-2xl font-bold text-gray-800">
                                CV NEW CITRA
                            </h2>
                            <p className="text-gray-600">
                                Sistem Informasi Akuntansi
                            </p>
                            <h3 className="text-xl font-semibold text-red-700 mt-4">
                                KARTU PERSEDIAAN BAHAN BAKU
                            </h3>
                        </div>

                        {/* Rincian Bahan Baku Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-4 border-b border-gray-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Kode Bahan
                                </label>
                                <p className="text-gray-800 font-bold">
                                    {activeBahan.kode_bahan}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Nama Bahan
                                </label>
                                <p className="text-gray-800 font-bold">
                                    {activeBahan.nama_bahan}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Satuan
                                </label>
                                <p className="text-gray-800 font-bold">
                                    {activeBahan.satuan_bahan}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Stok Saat Ini
                                </label>
                                <p className="text-gray-800 font-bold text-lg">
                                    {stokGudang.toLocaleString("id-ID")}{" "}
                                    {activeBahan.satuan_bahan}
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
                                                keuangan pada item bahan baku
                                                ini.
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
                            Silakan pilih bahan baku pada kolom di atas untuk
                            menampilkan rincian kartu persediaan mutasi.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

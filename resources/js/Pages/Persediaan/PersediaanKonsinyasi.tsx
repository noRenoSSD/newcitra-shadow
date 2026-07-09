import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import {
    ArrowLeft,
    Search,
    Package,
    TrendingUp,
    TrendingDown,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface MutasiItem {
    produk: string;
    qty: number;
    satuan: string;
}

interface MutasiKonsinyasi {
    id: string;
    tanggal: string;
    noRef: string;
    jenis: string;
    tipe: string;
    items: MutasiItem[];
    totalQty: number;
    keterangan?: string;
}

interface StokProduk {
    produk: string;
    masuk: number;
    keluar: number;
    stok: number;
}

interface MitraPersediaan {
    id: string;
    kodeMitra: string;
    namaMitra: string;
    kota: string;
    stokProduk: StokProduk[];
    mutasi: MutasiKonsinyasi[];
}

interface Props {
    listMitra: MitraPersediaan[]; // Data dinamis dari Laravel
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDate = (d: string) => {
    try {
        return new Date(d).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch (e) {
        return d;
    }
};

// ── Detail Kartu Persediaan ────────────────────────────────────────────────────

function DetailKartuPersediaan({
    mitra,
    onBack,
}: {
    mitra: MitraPersediaan;
    onBack: () => void;
}) {
    const [filter, setFilter] = useState<"Semua" | "Masuk" | "Keluar">("Semua");

    // Mengurutkan mutasi berdasarkan tanggal terbaru
    const sorted = [...mitra.mutasi].sort((a, b) =>
        b.tanggal.localeCompare(a.tanggal),
    );
    const filtered =
        filter === "Semua" ? sorted : sorted.filter((m) => m.tipe === filter);

    const totalMasuk = mitra.stokProduk.reduce((s, p) => s + p.masuk, 0);
    const totalKeluar = mitra.stokProduk.reduce((s, p) => s + p.keluar, 0);
    const totalStok = mitra.stokProduk.reduce((s, p) => s + p.stok, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
            <Head title={`Kartu Persediaan - ${mitra.namaMitra}`} />

            {/* Back + Header */}
            <div>
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-red-800 hover:text-red-900 font-medium transition-colors mb-3"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Daftar Mitra
                </button>
                <h2 className="text-2xl font-bold text-red-800">
                    Kartu Persediaan: {mitra.namaMitra}
                </h2>
                <p className="text-sm text-red-800 mt-1">
                    {mitra.kodeMitra} — {mitra.kota}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Masuk</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {totalMasuk} Unit
                            </p>
                        </div>
                        <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Keluar
                            </p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {totalKeluar} Unit
                            </p>
                        </div>
                        <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Stok di Mitra
                            </p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {totalStok} Unit
                            </p>
                        </div>
                        <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Rekap Stok per Produk */}
            <div className="bg-white rounded-lg shadow border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-red-800">
                        Rekap Stok per Produk
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Produk
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                    Masuk
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                    Keluar
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                    Stok Saat Ini
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mitra.stokProduk.map((sp, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                    <td className="py-3 px-4 text-sm font-medium text-gray-800">
                                        {sp.produk}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700 font-semibold text-center">
                                        {sp.masuk}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700 font-semibold text-center">
                                        {sp.keluar}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">
                                            {sp.stok} Pack
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Riwayat Mutasi */}
            <div className="bg-white rounded-lg shadow border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                    <h3 className="text-base font-semibold text-red-800">
                        Riwayat Mutasi
                    </h3>
                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                        {(["Semua", "Masuk", "Keluar"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    filter === f
                                        ? "bg-white text-red-800 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Tanggal
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    No. Referensi
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Jenis Mutasi
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Produk
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                    Masuk
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                    Keluar
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-8 text-center text-sm text-gray-400 italic"
                                    >
                                        Tidak ada data mutasi
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((m) =>
                                    m.items.map((item, idx) => (
                                        <tr
                                            key={`${m.id}-${idx}`}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            {idx === 0 && (
                                                <>
                                                    <td
                                                        className="py-3 px-4 text-sm text-gray-700"
                                                        rowSpan={m.items.length}
                                                    >
                                                        {formatDate(m.tanggal)}
                                                    </td>
                                                    <td
                                                        className="py-3 px-4 text-sm font-semibold text-gray-700"
                                                        rowSpan={m.items.length}
                                                    >
                                                        {m.noRef}
                                                    </td>
                                                    <td
                                                        className="py-3 px-4"
                                                        rowSpan={m.items.length}
                                                    >
                                                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                            {m.jenis}
                                                        </span>
                                                        {m.keterangan && (
                                                            <p className="text-xs text-gray-400 mt-1 max-w-[180px]">
                                                                {m.keterangan}
                                                            </p>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                            <td className="py-3 px-4 text-sm text-gray-800">
                                                {item.produk}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-center">
                                                {m.tipe === "Masuk"
                                                    ? item.qty
                                                    : "—"}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-center">
                                                {m.tipe === "Keluar"
                                                    ? item.qty
                                                    : "—"}
                                            </td>
                                        </tr>
                                    )),
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ── Komponen Utama ─────────────────────────────────────────────────────────────

export default function PersediaanKonsinyasi({ listMitra = [] }: Props) {
    const [selectedMitra, setSelectedMitra] = useState<MitraPersediaan | null>(
        null,
    );
    const [searchTerm, setSearchTerm] = useState("");

    // Jika ada mitra yang dipilih, render komponen Detail
    if (selectedMitra) {
        return (
            <DetailKartuPersediaan
                mitra={selectedMitra}
                onBack={() => setSelectedMitra(null)}
            />
        );
    }

    // Filter pencarian menggunakan listMitra dari database
    const filtered = listMitra.filter(
        (m) =>
            m.namaMitra.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.kodeMitra.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.kota.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Kalkulasi rekap dari listMitra (data database)
    const totalMitraAktif = listMitra.length;
    const totalStokSemua = listMitra.reduce(
        (s, m) => s + m.stokProduk.reduce((ss, p) => ss + p.stok, 0),
        0,
    );
    const totalMasukSemua = listMitra.reduce(
        (s, m) => s + m.stokProduk.reduce((ss, p) => ss + p.masuk, 0),
        0,
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
            <Head title="Persediaan Konsinyasi" />

            <div>
                <h2 className="text-2xl font-bold text-red-800">
                    Persediaan Konsinyasi Per Mitra
                </h2>
                <p className="text-sm text-red-800 mt-1">
                    Pantau stok dan mutasi produk konsinyasi di setiap mitra
                </p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Mitra Aktif</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {totalMitraAktif} Mitra
                            </p>
                        </div>
                        <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Stok di Mitra
                            </p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {totalStokSemua} Unit
                            </p>
                        </div>
                        <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Pernah Dikirim
                            </p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {totalMasukSemua} Unit
                            </p>
                        </div>
                        <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter + Tabel */}
            <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
                <div className="mb-5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama mitra, kode, atau kota..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Kode Mitra
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Nama Mitra
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Kota
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                    Jml. Produk
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                    Total Masuk
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                    Total Keluar
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                    Stok Saat Ini
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="py-8 text-center text-sm text-gray-400 italic"
                                    >
                                        Tidak ada data mitra
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((m) => {
                                    const totalMasuk = m.stokProduk.reduce(
                                        (s, p) => s + p.masuk,
                                        0,
                                    );
                                    const totalKeluar = m.stokProduk.reduce(
                                        (s, p) => s + p.keluar,
                                        0,
                                    );
                                    const totalStok = m.stokProduk.reduce(
                                        (s, p) => s + p.stok,
                                        0,
                                    );
                                    return (
                                        <tr
                                            key={m.id}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                                                {m.kodeMitra}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-gray-800">
                                                {m.namaMitra}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {m.kota}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                                {m.stokProduk.length} Produk
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-center">
                                                {totalMasuk}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-center">
                                                {totalKeluar}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">
                                                    {totalStok} Unit
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() =>
                                                        setSelectedMitra(m)
                                                    }
                                                    className="px-4 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Buka Kartu
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                    Menampilkan {filtered.length} dari {listMitra.length} mitra.
                </p>
            </div>
        </div>
    );
}

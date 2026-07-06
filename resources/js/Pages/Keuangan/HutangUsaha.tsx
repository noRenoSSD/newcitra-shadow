import { useState, useEffect } from "react";
import {
    Search,
    CreditCard,
    ArrowLeft,
    ChevronRight,
    DollarSign,
    AlertCircle,
    Clock,
    Eye,
    X,
} from "lucide-react";
import { router } from "@inertiajs/react";

interface Pembayaran {
    id: string;
    noBayar: string;
    tanggal: string;
    jumlahDibayar: number;
    metodePembayaran: string;
    tipe: "Bayar" | "Retur";
}

interface ItemBeli {
    kodeBahan: string;
    namaBahan: string;
    qty: number;
    satuan: string;
    harga: number;
    subtotal: number;
}

interface HutangUsahaType {
    id: string;
    noHutang: string;
    noTransaksi: string;
    supplier: string;
    totalHutang: number;
    terbayar: number;
    kurangBayar: number;
    tanggalJatuhTempo: string;
    status: "Belum Lunas" | "Lunas";
    items: ItemBeli[];
    riwayatPembayaran: Pembayaran[];
}

const formatCurrency = (v: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(v);

// ── Modal Detail Hutang ────────────────────────────────────────────────────────
function ModalDetailMutasi({
    hutang,
    onClose,
}: {
    hutang: HutangUsahaType;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-auto flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-red-800">
                            Detail Transaksi Hutang
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {hutang.noTransaksi} — {hutang.supplier}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
                    {/* Ringkasan */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">
                                Total Hutang Awal
                            </p>
                            <p className="text-sm font-bold text-gray-800">
                                {formatCurrency(hutang.totalHutang)}
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                            <p className="text-xs text-gray-500 mb-1">
                                Total Terbayar
                            </p>
                            <p className="text-sm font-bold text-green-700">
                                {formatCurrency(hutang.terbayar)}
                            </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                            <p className="text-xs text-gray-500 mb-1">
                                Sisa Hutang
                            </p>
                            <p className="text-sm font-bold text-red-700">
                                {formatCurrency(hutang.kurangBayar)}
                            </p>
                        </div>
                    </div>

                    {/* List Barang yang Dibeli */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">
                            Daftar Bahan yang Dibeli
                        </h4>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                                            Kode
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                                            Nama Bahan
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">
                                            Qty
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">
                                            Satuan
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">
                                            Harga
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {hutang.items.map((item, idx) => (
                                        <tr
                                            key={idx}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-2 text-gray-600 font-mono text-xs">
                                                {item.kodeBahan}
                                            </td>
                                            <td className="px-4 py-2 text-gray-800 font-medium">
                                                {item.namaBahan}
                                            </td>
                                            <td className="px-4 py-2 text-gray-700 text-right">
                                                {item.qty.toLocaleString(
                                                    "id-ID",
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-gray-600 text-center">
                                                {item.satuan}
                                            </td>
                                            <td className="px-4 py-2 text-gray-700 text-right">
                                                {formatCurrency(item.harga)}
                                            </td>
                                            <td className="px-4 py-2 font-semibold text-gray-800 text-right">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-100">
                                        <td
                                            colSpan={5}
                                            className="px-4 py-2 text-sm font-bold text-gray-800 text-right"
                                        >
                                            Total
                                        </td>
                                        <td className="px-4 py-2 text-sm font-bold text-gray-800 text-right">
                                            {formatCurrency(
                                                hutang.items.reduce(
                                                    (s, i) => s + i.subtotal,
                                                    0,
                                                ),
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-3 border-t border-gray-100 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Komponen Form Pembayaran ───────────────────────────────────────────────────
interface FormPembayaranProps {
    hutang: HutangUsahaType;
    onSimpan: () => void;
    onBatal: () => void;
}

function FormPembayaran({ hutang, onSimpan, onBatal }: FormPembayaranProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        tanggal: new Date().toISOString().split("T")[0],
        jumlahDibayar: 0,
        metodePembayaran: "Tunai",
        catatan: "",
    });

    const handleSimpan = () => {
        if (form.jumlahDibayar <= 0) {
            alert("Jumlah pembayaran harus lebih dari 0");
            return;
        }
        if (form.jumlahDibayar > hutang.kurangBayar) {
            alert("Jumlah tidak boleh melebihi sisa hutang");
            return;
        }

        setIsSubmitting(true);

        // Kirim data ke backend menggunakan Inertia router
        router.post(
            `/keuangan/hutang-usaha/${hutang.id}/bayar`,
            {
                jumlah_dibayar: form.jumlahDibayar,
                tanggal_pembayaran: form.tanggal,
                metode_pembayaran: form.metodePembayaran,
                catatan: form.catatan,
            },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onSimpan(); // Tutup form setelah berhasil
                },
                onError: () => {
                    setIsSubmitting(false);
                    alert("Terjadi kesalahan saat menyimpan pembayaran.");
                },
            },
        );
    };

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-red-800">
                        Form Pembayaran Hutang
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {hutang.noTransaksi} — {hutang.supplier}
                    </p>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                No. Transaksi
                            </label>
                            <p className="text-gray-800 font-bold">
                                {hutang.noTransaksi}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Supplier
                            </label>
                            <p className="text-gray-800 font-bold">
                                {hutang.supplier}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Total Hutang
                            </label>
                            <p className="text-gray-800 font-bold">
                                {formatCurrency(hutang.totalHutang)}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Sisa Hutang
                            </label>
                            <p className="text-red-700 font-bold text-lg">
                                {formatCurrency(hutang.kurangBayar)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Supplier
                            </label>
                            <input
                                type="text"
                                disabled
                                value={hutang.supplier}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={form.tanggal}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        tanggal: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Metode Pembayaran{" "}
                                <span className="text-red-600">*</span>
                            </label>
                            <select
                                required
                                value={form.metodePembayaran}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        metodePembayaran: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                            >
                                <option value="Tunai">Tunai</option>
                                <option value="Transfer">Transfer</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Jumlah Dibayar{" "}
                                <span className="text-red-600">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                                    Rp
                                </span>
                                <input
                                    type="number"
                                    required
                                    value={form.jumlahDibayar || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            jumlahDibayar: Number(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                    className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                    placeholder="0"
                                    min="0"
                                    max={hutang.kurangBayar}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Maksimal: {formatCurrency(hutang.kurangBayar)}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catatan (Opsional)
                            </label>
                            <textarea
                                value={form.catatan}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        catatan: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                placeholder="Tambahkan catatan jika perlu..."
                            ></textarea>
                        </div>
                    </div>

                    {form.jumlahDibayar > 0 && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Sisa Hutang Saat Ini
                                </p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {formatCurrency(hutang.kurangBayar)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Sisa Hutang Setelah Bayar
                                </p>
                                <p className="text-lg font-semibold text-red-700">
                                    {formatCurrency(
                                        Math.max(
                                            0,
                                            hutang.kurangBayar -
                                                form.jumlahDibayar,
                                        ),
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={onBatal}
                            disabled={isSubmitting}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSimpan}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting
                                ? "Menyimpan..."
                                : "Simpan Pembayaran"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Komponen Kartu Hutang Per Supplier ────────────────────────────────────────
interface KartuSupplierProps {
    supplier: string;
    hutangs: HutangUsahaType[];
    onBayar: (h: HutangUsahaType) => void;
    onBack: () => void;
}

function KartuSupplier({
    supplier,
    hutangs,
    onBayar,
    onBack,
}: KartuSupplierProps) {
    const [detailMutasi, setDetailMutasi] = useState<HutangUsahaType | null>(
        null,
    );
    const belumLunas = hutangs.filter((h) => h.status === "Belum Lunas");
    const totalSisa = belumLunas.reduce((s, h) => s + h.kurangBayar, 0);
    const totalHutang = hutangs.reduce((s, h) => s + h.totalHutang, 0);

    const TabelHutang = ({
        data,
        showBayar,
        emptyMsg,
    }: {
        data: HutangUsahaType[];
        showBayar: boolean;
        emptyMsg: string;
    }) => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            No. Transaksi
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                            Total Hutang
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                            Kurang Bayar
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Jatuh Tempo
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
                                colSpan={5}
                                className="py-6 text-center text-sm text-gray-400 italic"
                            >
                                {emptyMsg}
                            </td>
                        </tr>
                    ) : (
                        data.map((h) => (
                            <tr
                                key={h.id}
                                className="border-b border-gray-100 hover:bg-gray-50"
                            >
                                <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                                    {h.noTransaksi}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                    {formatCurrency(h.totalHutang)}
                                </td>
                                <td className="py-3 px-4 text-sm font-semibold text-right">
                                    <span
                                        className={
                                            h.kurangBayar > 0
                                                ? "text-red-600"
                                                : "text-green-600"
                                        }
                                    >
                                        {formatCurrency(h.kurangBayar)}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {h.tanggalJatuhTempo !== "-"
                                        ? new Date(
                                              h.tanggalJatuhTempo,
                                          ).toLocaleDateString("id-ID", {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                          })
                                        : "-"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setDetailMutasi(h)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Lihat Mutasi"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {showBayar && h.kurangBayar > 0 && (
                                            <button
                                                onClick={() => onBayar(h)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-medium transition-colors"
                                            >
                                                <CreditCard className="w-3.5 h-3.5" />
                                                Bayar
                                            </button>
                                        )}
                                    </div>
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
            {detailMutasi && (
                <ModalDetailMutasi
                    hutang={detailMutasi}
                    onClose={() => setDetailMutasi(null)}
                />
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Hutang Usaha</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-red-800 font-medium">{supplier}</span>
            </div>
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm text-red-800 hover:text-red-900 font-medium transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Supplier
            </button>

            <div>
                <h2 className="text-2xl font-bold text-red-800">
                    Kartu Hutang: {supplier}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Total Sisa Hutang:{" "}
                    <span className="font-semibold text-red-700">
                        {formatCurrency(totalSisa)}
                    </span>
                    {" · "}Total Hutang:{" "}
                    <span className="font-semibold text-gray-700">
                        {formatCurrency(totalHutang)}
                    </span>
                </p>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-red-800">
                        Daftar Hutang Belum Lunas
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Klik ikon mata untuk melihat detail bahan, klik Bayar
                        untuk melakukan pembayaran
                    </p>
                </div>
                <div className="p-6">
                    <TabelHutang
                        data={belumLunas}
                        showBayar={true}
                        emptyMsg="Semua hutang sudah lunas"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-red-800">
                        Riwayat Pembayaran Hutang
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Seluruh riwayat pembayaran dan retur dari semua
                        transaksi supplier ini
                    </p>
                </div>
                <div className="p-6 overflow-x-auto">
                    {hutangs.flatMap((h) => h.riwayatPembayaran).length ===
                    0 ? (
                        <p className="text-sm text-gray-400 italic text-center py-6">
                            Belum ada riwayat pembayaran
                        </p>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        No. Bayar
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        No. Transaksi
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Tanggal
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Metode
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Nominal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {hutangs
                                    .flatMap((h) =>
                                        h.riwayatPembayaran.map((p) => ({
                                            ...p,
                                            noTransaksi: h.noTransaksi,
                                        })),
                                    )
                                    .sort(
                                        (a, b) =>
                                            new Date(b.tanggal).getTime() -
                                            new Date(a.tanggal).getTime(),
                                    )
                                    .map((r) => (
                                        <tr
                                            key={r.id}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                                                {r.noBayar}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {r.noTransaksi}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {new Date(
                                                    r.tanggal,
                                                ).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {r.metodePembayaran !== "-"
                                                    ? r.metodePembayaran
                                                    : "—"}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-right text-gray-700">
                                                {formatCurrency(
                                                    r.jumlahDibayar,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Komponen Utama (Menerima Props dari Laravel Inertia) ───────────────────────
export default function HutangUsaha({
    dbHutang,
}: {
    dbHutang: HutangUsahaType[];
}) {
    const [hutangList, setHutangList] = useState<HutangUsahaType[]>(dbHutang);
    const [selectedSupplier, setSelectedSupplier] = useState<string | null>(
        null,
    );
    const [selectedHutang, setSelectedHutang] =
        useState<HutangUsahaType | null>(null);
    const [showPembayaran, setShowPembayaran] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Sinkronisasi jika data dari backend berubah setelah pembayaran sukses
    useEffect(() => {
        setHutangList(dbHutang);
    }, [dbHutang]);

    const handleBayar = (h: HutangUsahaType) => {
        setSelectedHutang(h);
        setShowPembayaran(true);
    };

    const handleSimpanPembayaran = () => {
        setShowPembayaran(false);
        setSelectedHutang(null);
    };

    const supplierGroups = Array.from(
        new Set(hutangList.map((h) => h.supplier)),
    ).map((supplier) => {
        const items = hutangList.filter((h) => h.supplier === supplier);
        return {
            supplier,
            totalNota: items.length,
            totalHutang: items.reduce((s, h) => s + h.totalHutang, 0),
            totalSisa: items.reduce((s, h) => s + h.kurangBayar, 0),
        };
    });

    const filteredGroups = supplierGroups.filter((g) =>
        g.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const totalHutangAll = hutangList.reduce((s, h) => s + h.totalHutang, 0);
    const totalSisaAll = hutangList.reduce((s, h) => s + h.kurangBayar, 0);
    const totalTerbayarAll = hutangList.reduce((s, h) => s + h.terbayar, 0);

    if (showPembayaran && selectedHutang) {
        return (
            <FormPembayaran
                hutang={selectedHutang}
                onSimpan={handleSimpanPembayaran}
                onBatal={() => {
                    setShowPembayaran(false);
                    setSelectedHutang(null);
                }}
            />
        );
    }

    if (selectedSupplier) {
        return (
            <KartuSupplier
                supplier={selectedSupplier}
                hutangs={hutangList.filter(
                    (h) => h.supplier === selectedSupplier,
                )}
                onBayar={handleBayar}
                onBack={() => setSelectedSupplier(null)}
            />
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-red-800">
                    Daftar Hutang Usaha
                </h2>
                <p className="text-sm text-red-800 mt-1">
                    Kelola data hutang usaha per supplier
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Hutang
                            </p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {formatCurrency(totalHutangAll)}
                            </p>
                        </div>
                        <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Terbayar
                            </p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {formatCurrency(totalTerbayarAll)}
                            </p>
                        </div>
                        <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Sisa Hutang
                            </p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {formatCurrency(totalSisaAll)}
                            </p>
                        </div>
                        <div className="w-11 h-11 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-red-800">
                        Daftar Hutang Per Supplier
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Klik Buka Kartu untuk melihat detail hutang per
                        transaksi
                    </p>
                </div>
                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama supplier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Supplier
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                        Total Nota
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Total Hutang
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Total Sisa Hutang
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGroups.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-8 text-center text-sm text-gray-400 italic"
                                        >
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGroups.map((g) => (
                                        <tr
                                            key={g.supplier}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                                                {g.supplier}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                                {g.totalNota} Nota
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">
                                                {formatCurrency(g.totalHutang)}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right">
                                                <span
                                                    className={
                                                        g.totalSisa > 0
                                                            ? "font-semibold text-red-600"
                                                            : "text-green-600"
                                                    }
                                                >
                                                    {formatCurrency(
                                                        g.totalSisa,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() =>
                                                        setSelectedSupplier(
                                                            g.supplier,
                                                        )
                                                    }
                                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    Buka Kartu
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        Menampilkan 1–{filteredGroups.length} dari{" "}
                        {filteredGroups.length} supplier.
                    </p>
                </div>
            </div>
        </div>
    );
}

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { DollarSign, ShoppingCart, TrendingUp, CreditCard } from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const recentTx = [
    {
        id: "INV-2024-001",
        tgl: "18 Mei 2026",
        tipe: "Penjualan",
        mitra: "Toko Sinar Jaya",
        jumlah: 12500000,
        status: "Lunas",
    },
    {
        id: "PO-2024-045",
        tgl: "17 Mei 2026",
        tipe: "Pembelian",
        mitra: "CV Bandeng Segar",
        jumlah: 8750000,
        status: "Pending",
    },
    {
        id: "INV-2024-002",
        tgl: "17 Mei 2026",
        tipe: "Penjualan",
        mitra: "Restoran Bahari",
        jumlah: 6300000,
        status: "Lunas",
    },
    {
        id: "KONS-2024-012",
        tgl: "16 Mei 2026",
        tipe: "Konsinyasi",
        mitra: "Minimarket Sumber Rasa",
        jumlah: 4500000,
        status: "Proses",
    },
    {
        id: "PO-2024-044",
        tgl: "15 Mei 2026",
        tipe: "Pembelian",
        mitra: "UD Bumbu Nusantara",
        jumlah: 3200000,
        status: "Lunas",
    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(n);

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
    icon,
    label,
    value,
    note,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    note: string;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-5">
                {icon}
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {label}
            </p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {value}
            </p>
            <p className="text-xs text-gray-400 mt-2">{note}</p>
        </div>
    );
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

const tipeCls: Record<string, string> = {
    Penjualan: "bg-red-50 text-red-700",
    Pembelian: "bg-stone-100 text-stone-600",
    Konsinyasi: "bg-red-100 text-red-800",
};

const statusCls: Record<string, string> = {
    Lunas: "bg-emerald-50 text-emerald-700",
    Pending: "bg-amber-50 text-amber-700",
    Proses: "bg-stone-100 text-stone-500",
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
    return (
        <div className="space-y-5">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-red-800 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-red-800 mt-0.5">
                        Ringkasan kinerja keuangan CV New Citra
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-gray-500">
                        Periode: Jan – Jun 2026
                    </span>
                </div>
            </div>

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={<DollarSign className="w-5 h-5 text-red-600" />}
                    label="Total Penjualan"
                    value="Rp 328 Jt"
                    note="Januari – Juni 2026"
                />
                <KpiCard
                    icon={<ShoppingCart className="w-5 h-5 text-red-600" />}
                    label="Total Pembelian"
                    value="Rp 194 Jt"
                    note="Januari – Juni 2026"
                />
                <KpiCard
                    icon={<TrendingUp className="w-5 h-5 text-red-600" />}
                    label="Total Pendapatan"
                    value="Rp 93,85 Jt"
                    note="Januari 2026"
                />
                <KpiCard
                    icon={<CreditCard className="w-5 h-5 text-red-600" />}
                    label="Total Piutang"
                    value="Rp 38,25 Jt"
                    note="Per 31 Januari 2026"
                />
            </div>

            {/* ── Recent Transactions ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">
                            Transaksi Terbaru
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            5 transaksi terakhir sistem
                        </p>
                    </div>
                    <button className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors">
                        Lihat Semua →
                    </button>
                </div>

                <div className="px-6 pb-6 overflow-x-auto">
                    <div className="rounded-none overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700">
                                    {[
                                        "No. Transaksi",
                                        "Tanggal",
                                        "Tipe",
                                        "Mitra / Supplier",
                                        "Jumlah",
                                        "Status",
                                    ].map((h, i) => (
                                        <th
                                            key={h}
                                            className={`px-6 py-3 text-sm font-semibold tracking-wider text-gray-700 ${i >= 4 ? "text-left" : "text-left"}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentTx.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className="hover:bg-gray-50/70 transition-colors"
                                    >
                                        <td className="px-6 py-3.5">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {tx.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-sm text-gray-400 whitespace-nowrap">
                                            {tx.tgl}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span
                                                className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full ${tipeCls[tx.tipe] ?? "bg-gray-100 text-gray-600"}`}
                                            >
                                                {tx.tipe}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-sm font-medium text-gray-700">
                                            {tx.mitra}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm font-semibold text-gray-900 text-left tabular-nums whitespace-nowrap">
                                            {fmt(tx.jumlah)}
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <span
                                                className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${statusCls[tx.status] ?? "bg-gray-100 text-gray-600"}`}
                                            >
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
Dashboard.layout = (page: React.ReactNode) => (
    <AuthenticatedLayout children={page} />
);

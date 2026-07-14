import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Database,
    Factory,
    ShoppingCart,
    Package,
    DollarSign,
    Handshake,
    Wallet,
    BookOpen,
    FileText,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
} from "lucide-react";

// Logo - sesuaikan path nya ya!
// Taruh logo di public/images/logo-citra.jpg
const logoImage = "/images/logo-citra.jpg";

interface SubMenuItem {
    label: string;
    path: string;
    roles?: string[];
}

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    path?: string;
    subMenus?: SubMenuItem[];
    roles?: string[];
}

const SA = "super_admin";
const AK = "admin_akuntansi";
const APR = "admin_produksi";
const APB = "admin_pembelian";
const APJ = "admin_penjualan";
const MNG = "manajer";

const menuItems: MenuItem[] = [
    {
        label: "Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        path: "/dashboard",
        // Dashboard bisa diakses semua role
    },
    {
        label: "Data Master",
        icon: <Database className="w-5 h-5" />,
        roles: [SA, AK, APR, APB, APJ], // minimal ada 1 submenu yg bisa diakses
        subMenus: [
            { label: "Data Supplier", path: "/supplier", roles: [SA, APB] },
            { label: "Data Mitra", path: "/mitra", roles: [SA, APJ] },
            { label: "Data Divisi", path: "/divisi", roles: [SA, APR] },
            { label: "Data Bahan Baku", path: "/bahan-baku", roles: [SA, APR, APB] },
            { label: "Data Bahan Penolong", path: "/bahan-penolong", roles: [SA, APR, APB] },
            { label: "Data Produk Jadi", path: "/produk", roles: [SA, APR, APJ] },
            { label: "Data Kebutuhan Material", path: "/kebutuhan-material", roles: [SA, APR] },
            { label: "Data Overhead", path: "/overhead", roles: [SA, APR] },
            { label: "Data Aset Tetap", path: "/aset", roles: [SA, AK] },
            { label: "Data Akun", path: "/akun", roles: [SA, AK] },
            { label: "Data User", path: "/master/user", roles: [SA] },
        ],
    },
    {
        label: "Produksi",
        icon: <Factory className="w-5 h-5" />,
        roles: [SA, APR, AK],
        subMenus: [
            { label: "Jadwal Produksi", path: "/jadwal-produksi", roles: [SA, APR] },
            { label: "Persetujuan Jadwal Produksi", path: "/persetujuan-jadwal", roles: [SA, APR] },
            { label: "Hasil Produksi", path: "/produksi/hasil-produksi", roles: [SA, APR] },
            { label: "Harga Pokok Produksi", path: "/produksi/hpp", roles: [SA, APR, AK] },
        ],
    },
    {
        label: "Pembelian",
        icon: <ShoppingCart className="w-5 h-5" />,
        roles: [SA, APB, AK],
        subMenus: [
            { label: "Permintaan Pembelian", path: "/pembelian/permintaan", roles: [SA, APB] },
            { label: "Pesanan Pembelian", path: "/pembelian/pesanan", roles: [SA, APB] },
            { label: "Penerimaan Bahan", path: "/pembelian/penerimaan-bahan", roles: [SA, APB] },
            { label: "Transaksi Pembelian", path: "/pembelian/transaksi-pembelian", roles: [SA, AK] },
            { label: "Retur Pembelian", path: "/pembelian/retur-pembelian", roles: [SA, APB] },
        ],
    },
    {
        label: "Persediaan",
        icon: <Package className="w-5 h-5" />,
        roles: [SA, APR, APB, APJ],
        subMenus: [
            { label: "Persediaan Bahan Baku", path: "/persediaan/bahan-baku", roles: [SA, APR, APB, APJ] },
            { label: "Persediaan Bahan Penolong", path: "/persediaan/bahan-penolong", roles: [SA, APR, APB, APJ] },
            { label: "Persediaan Produk Jadi", path: "/persediaan/produk-jadi", roles: [SA, APR, APB, APJ] },
            { label: "Stock Opname", path: "/persediaan/stock-opname", roles: [SA, APR, APB, APJ] },
            { label: "Persetujuan Pemakaian Bahan", path: "/approval-pemakaian-bahan", roles: [SA, APR, AK] },
            { label: "Persediaan Konsinyasi", path: "/persediaan/konsinyasi", roles: [SA, APR, APB, APJ] },
        ],
    },
    {
        label: "Penjualan",
        icon: <DollarSign className="w-5 h-5" />,
        roles: [SA, APJ, AK],
        subMenus: [
            { label: "Pesanan Penjualan", path: "/pesanan", roles: [SA, APJ] },
            { label: "Penjualan", path: "/transaksi-penjualan", roles: [SA, APJ] },
            { label: "Surat Jalan", path: "/surat-jalan", roles: [SA, APJ] },
            { label: "Retur Penjualan", path: "/retur-penjualan", roles: [SA, APJ] },
            { label: "Perpanjangan Jatuh Tempo Piutang", path: "/penjualan/perpanjangan", roles: [SA, AK, APJ] },
        ],
    },
    {
        label: "Konsinyasi",
        icon: <Handshake className="w-5 h-5" />,
        roles: [SA, APJ],
        subMenus: [
            { label: "Produk Konsinyasi Keluar", path: "/konsinyasi-keluar", roles: [SA, APJ] },
            { label: "Penjualan Konsinyasi", path: "/konsinyasi-penjualan", roles: [SA, APJ] },
            { label: "Retur Konsinyasi", path: "/konsinyasi-retur", roles: [SA, APJ] },
        ],
    },
    {
        label: "Pengeluaran lain-lain",
        icon: <Wallet className="w-5 h-5" />,
        path: "/transaksi-pengeluaran",
        roles: [SA, AK],
    },
    {
        label: "Keuangan",
        icon: <BookOpen className="w-5 h-5" />,
        roles: [SA, AK, APJ],
        subMenus: [
            { label: "Approval Pesanan Pembelian", path: "/keuangan/approval-po", roles: [SA, AK] },
            { label: "Piutang Usaha", path: "/piutang", roles: [SA, AK, APJ] },
            { label: "Hutang Usaha", path: "/keuangan/hutang-usaha", roles: [SA, AK] },
            { label: "Penyusutan Aset Tetap", path: "/penyusutan/aset", roles: [SA, AK] },
            { label: "Jurnal Umum", path: "/keuangan/jurnal-umum", roles: [SA, AK] },
            { label: "Jurnal Penyesuaian", path: "/keuangan/jurnal-penyesuaian", roles: [SA, AK] },
            { label: "Buku Besar", path: "/keuangan/buku-besar", roles: [SA, AK] },
        ],
    },
    {
        label: "Laporan",
        icon: <FileText className="w-5 h-5" />,
        roles: [SA, AK, APR, MNG],
        subMenus: [
            { label: "Laporan Penjualan", path: "/laporan/penjualan", roles: [SA, AK, MNG] },
            { label: "Laporan Konsinyasi", path: "/laporan/konsinyasi", roles: [SA, AK, MNG] },
            { label: "Laporan Retur Penjualan", path: "/laporan/retur-penjualan", roles: [SA, AK, MNG] },
            { label: "Laporan Retur Konsinyasi", path: "/laporan/retur-konsinyasi", roles: [SA, AK, MNG] },
            { label: "Laporan Pembelian", path: "/laporan/pembelian", roles: [SA, AK, MNG] },
            { label: "Laporan Retur Pembelian", path: "/laporan/retur-pembelian", roles: [SA, AK, MNG] },
            { label: "Laporan Piutang", path: "/laporan/piutang", roles: [SA, AK, MNG] },
            { label: "Laporan Hutang", path: "/laporan/hutang-usaha", roles: [SA, AK, MNG] },
            { label: "Laporan Persediaan Bahan Baku", path: "/laporan/persediaan-bahan-baku", roles: [SA, AK, MNG] },
            { label: "Laporan Persediaan Bahan Penolong", path: "/laporan/persediaan-bahan-penolong", roles: [SA, AK, MNG] },
            { label: "Laporan Pemakaian Bahan", path: "/laporan/pemakaian-bahan", roles: [SA, AK, MNG] },
            { label: "Laporan Persediaan Produk Jadi", path: "/laporan/persediaan-produk-jadi", roles: [SA, AK, MNG] },
            { label: "Laporan Persediaan Konsinyasi", path: "/laporan/persediaan-konsinyasi", roles: [SA, AK, MNG] },
            { label: "Laporan Pengeluaran Lain-lain", path: "/laporan/pengeluaran-lain", roles: [SA, AK, MNG] },
            { label: "Laporan Produksi", path: "/laporan-produksi", roles: [SA, AK, APR, MNG] },
            { label: "Laporan Harga Pokok Produksi", path: "/laporan-hpp", roles: [SA, AK, APR, MNG] },
            { label: "Laporan Aset Tetap", path: "/laporan/aset-tetap", roles: [SA, AK, MNG] },
            { label: "Laporan Posisi Keuangan", path: "/laporan/posisi-keuangan", roles: [SA, AK, MNG] },
            { label: "Laporan Laba Rugi", path: "/laporan/laba-rugi", roles: [SA, AK, MNG] },
            { label: "Catatan atas Laporan Keuangan", path: "/laporan/calk", roles: [SA, AK, MNG] },
        ],
    },
];

export default function Sidebar() {
    const { url, props } = usePage<any>();
    const userRole = props.auth?.user?.role || "super_admin";
    const [expandedMenus, setExpandedMenus] = useState<string[]>(["Dashboard"]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleMenu = (label: string) => {
        setExpandedMenus((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label],
        );
    };

    // Cek apakah path aktif
    const isActive = (path: string) => {
        return url === path || url.startsWith(path + "/");
    };

    return (
        <>
            {/* Tombol Menu Mobile */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-linear-to-r from-red-700 to-red-600 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200"
            >
                {isMobileOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <Menu className="w-6 h-6" />
                )}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-red-800 shadow-2xl transition-transform duration-300 ${
                    isMobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="h-full flex flex-col">
                    {/* Header / Logo */}
                    <div className="p-6 border-b border-red-600/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-lg p-1 ring-2 ring-yellow-400/50">
                                <img
                                    src={logoImage}
                                    alt="CV New Citra Logo"
                                    className="w-full h-full rounded-lg object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">
                                    CV New Citra
                                </h1>
                            </div>
                        </div>
                        <p className="text-sm text-yellow-100 font-medium">
                            Sistem Informasi Akuntansi
                        </p>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-1">
                            {menuItems
                                .filter((item) => !item.roles || item.roles.includes(userRole))
                                .map((item) => (
                                <li key={item.label}>
                                    {item.subMenus ? (
                                        <div>
                                            <button
                                                onClick={() =>
                                                    toggleMenu(item.label)
                                                }
                                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-red-700/50 transition-all duration-200 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-yellow-400 group-hover:text-yellow-300 transition-colors">
                                                        {item.icon}
                                                    </span>
                                                    <span className="text-sm font-semibold text-white group-hover:text-yellow-50 transition-colors">
                                                        {item.label}
                                                    </span>
                                                </div>
                                                {expandedMenus.includes(
                                                    item.label,
                                                ) ? (
                                                    <ChevronDown className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                                                )}
                                            </button>
                                            {expandedMenus.includes(
                                                item.label,
                                            ) && (
                                                <ul className="mt-1 ml-4 space-y-1">
                                                    {item.subMenus
                                                        .filter((subItem) => !subItem.roles || subItem.roles.includes(userRole))
                                                        .map(
                                                        (subItem) => (
                                                            <li
                                                                key={
                                                                    subItem.path
                                                                }
                                                            >
                                                                <Link
                                                                    href={
                                                                        subItem.path
                                                                    }
                                                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200 block ${
                                                                        isActive(
                                                                            subItem.path,
                                                                        )
                                                                            ? "bg-linear-to-r from-yellow-400 to-yellow-500 text-red-900 font-semibold shadow-lg"
                                                                            : "text-red-50 hover:bg-red-700/50 hover:text-white hover:pl-5"
                                                                    }`}
                                                                >
                                                                    {
                                                                        subItem.label
                                                                    }
                                                                </Link>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.path!}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                                isActive(item.path!)
                                                    ? "bg-linear-to-r from-yellow-400 to-yellow-500 text-red-900 shadow-lg font-semibold"
                                                    : "text-white hover:bg-red-700/50"
                                            }`}
                                        >
                                            <span
                                                className={
                                                    isActive(item.path!)
                                                        ? "text-red-900"
                                                        : "text-yellow-400"
                                                }
                                            >
                                                {item.icon}
                                            </span>
                                            <span className="text-sm font-semibold">
                                                {item.label}
                                            </span>
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Overlay untuk mobile */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                />
            )}
        </>
    );
}

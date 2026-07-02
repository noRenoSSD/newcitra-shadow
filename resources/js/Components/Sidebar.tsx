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
}

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    path?: string;
    subMenus?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
    {
        label: "Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        path: "/dashboard",
    },
    {
        label: "Data Master",
        icon: <Database className="w-5 h-5" />,
        subMenus: [
            { label: "Data Supplier", path: "/supplier" },
            { label: "Data Mitra", path: "/mitra" },
            { label: "Data Divisi", path: "/divisi" },
            { label: "Data Bahan Baku", path: "/bahan-baku" },
            { label: "Data Bahan Penolong", path: "/bahan-penolong" },
            { label: "Data Produk Jadi", path: "/produk" },
            { label: "Data Kebutuhan Material", path: "/kebutuhan-material" },
            { label: "Data Overhead", path: "/overhead" },
            {
                label: "Data Jenis Pengeluaran",
                path: "/jenis-pengeluaran",
            },
            { label: "Data Aset Tetap", path: "/aset" },
            { label: "Data Akun", path: "/akun" },
            { label: "Data User", path: "/master/user" },
        ],
    },
    {
        label: "Produksi",
        icon: <Factory className="w-5 h-5" />,
        subMenus: [
            // UBAH BARIS INI
            { label: "Jadwal Produksi", path: "/jadwal-produksi" },
            {
                label: "Persetujuan Jadwal Produksi",
                path: "/persetujuan-jadwal",
            },
            { label: "Hasil Produksi", path: "/produksi/hasil-produksi" },
            { label: "Harga Pokok Produksi", path: "/produksi/hpp" },
        ],
    },
    {
        label: "Pembelian",
        icon: <ShoppingCart className="w-5 h-5" />,
        subMenus: [
            { label: "Permintaan Pembelian", path: "/pembelian/permintaan" },
            { label: "Pesanan Pembelian", path: "/pembelian/pesanan" },
            { label: "Penerimaan Bahan", path: "/pembelian/penerimaan-bahan" },
            { label: "Transaksi Pembelian", path: "/pembelian/transaksi" },
            { label: "Retur Pembelian", path: "/pembelian/retur-pembelian" },
            { label: "Hutang Usaha", path: "/pembelian/hutang" },
        ],
    },
    {
        label: "Persediaan",
        icon: <Package className="w-5 h-5" />,
        subMenus: [
            { label: "Persediaan Bahan Baku", path: "/persediaan/bahan-baku" },
            {
                label: "Persediaan Bahan Penolong",
                path: "/persediaan/bahan-penolong",
            },
            // { label: "Hasil Produksi", path: "/persediaan/hasil-produksi" },
            {
                label: "Persediaan Produk Jadi",
                path: "/persediaan/produk-jadi",
            },
            { label: "Stok Opname", path: "/persediaan/stok-opname" },
            {
                label: "Persetujuan Pemakaian Bahan",
                path: "/persediaan/approval-pemakaian",
            },
        ],
    },
    {
        label: "Penjualan",
        icon: <DollarSign className="w-5 h-5" />,
        subMenus: [
            { label: "Pesanan Penjualan", path: "/pesanan" },
            { label: "Penjualan", path: "/transaksi-penjualan" },
            { label: "Surat Jalan", path: "/surat-jalan" },
            { label: "Retur Penjualan", path: "/retur-penjualan" },
            { label: "Piutang", path: "/penjualan/piutang" },
            {
                label: "Perpanjangan Jatuh Tempo Piutang",
                path: "/penjualan/perpanjangan",
            },
        ],
    },
    {
        label: "Konsinyasi",
        icon: <Handshake className="w-5 h-5" />,
        subMenus: [
            { label: "Produk Konsinyasi Keluar", path: "/konsinyasi/keluar" },
            { label: "Penjualan Konsinyasi", path: "/konsinyasi/penjualan" },
            { label: "Retur Konsinyasi", path: "/konsinyasi/retur" },
        ],
    },
    {
        label: "Pengeluaran lain-lain",
        icon: <Wallet className="w-5 h-5" />,
        path: "/transaksi-pengeluaran",
    },
    {
        label: "Keuangan",
        icon: <BookOpen className="w-5 h-5" />,
        subMenus: [
            {
                label: "Approval Pesanan Pembelian",
                path: "/keuangan/approval-po",
            },
            { label: "Kartu Piutang", path: "/keuangan/kartu-piutang" },
            { label: "Penyusutan Aset Tetap", path: "/penyusutan/aset" },
            { label: "Jurnal Umum", path: "/keuangan/jurnal-umum" },
            {
                label: "Jurnal Penyesuaian",
                path: "/keuangan/jurnal-penyesuaian",
            },
            { label: "Buku Besar", path: "/keuangan/buku-besar" },
        ],
    },
    {
        label: "Laporan",
        icon: <FileText className="w-5 h-5" />,
        subMenus: [
            { label: "Laporan Penjualan", path: "/laporan/penjualan" },
            { label: "Laporan Konsinyasi", path: "/laporan/konsinyasi" },
            {
                label: "Laporan Retur Penjualan",
                path: "/laporan/retur-penjualan",
            },
            {
                label: "Laporan Retur Konsinyasi",
                path: "/laporan/retur-konsinyasi",
            },
            { label: "Laporan Pembelian", path: "/laporan/pembelian" },
            {
                label: "Laporan Retur Pembelian",
                path: "/laporan/retur-pembelian",
            },
            { label: "Laporan Piutang", path: "/laporan/piutang" },
            { label: "Laporan Hutang", path: "/laporan/hutang" },
            {
                label: "Laporan Persediaan Bahan Baku",
                path: "/laporan/persediaan-bahan-baku",
            },
            {
                label: "Laporan Persediaan Bahan Penolong",
                path: "/laporan/persediaan-bahan-penolong",
            },
            {
                label: "Laporan Pemakaian Bahan",
                path: "/laporan/pemakaian-bahan",
            },
            {
                label: "Laporan Persediaan Produk Jadi",
                path: "/laporan/persediaan-produk-jadi",
            },
            {
                label: "Laporan Persediaan Konsinyasi",
                path: "/laporan/persediaan-konsinyasi",
            },
            {
                label: "Laporan Pengeluaran Lain-lain",
                path: "/laporan/pengeluaran-lain",
            },
            { label: "Laporan Produksi", path: "/laporan/produksi" },
            { label: "Laporan Harga Pokok Produksi", path: "/laporan/hpp" },
            { label: "Laporan Aset Tetap", path: "/laporan/aset-tetap" },
            {
                label: "Laporan Posisi Keuangan",
                path: "/laporan/posisi-keuangan",
            },
            { label: "Laporan Laba Rugi", path: "/laporan/laba-rugi" },
            { label: "Catatan atas Laporan Keuangan", path: "/laporan/calk" },
        ],
    },
];

export default function Sidebar() {
    const { url } = usePage();
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
                className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200"
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
                            {menuItems.map((item) => (
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
                                                    {item.subMenus.map(
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
                                                                            ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-red-900 font-semibold shadow-lg"
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
                                                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-red-900 shadow-lg font-semibold"
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

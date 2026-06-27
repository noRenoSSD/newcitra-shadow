import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import { Plus, Trash2, ChevronDown, Eye, Printer, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Bahan {
    id_bahan: number;
    kode_bahan: string;
    nama_bahan: string;
    jenis_bahan: "baku" | "penolong";
    satuan_bahan: string;
    stok_min: number;
}

interface SoDetail {
    id_so_detail: number;
    id_bahan: number;
    qty_sistem: number;
    qty_fisik: number;
    qty_kadaluarsa: number;
    selisih: number;
    bahan: Bahan;
}

interface StockOpname {
    id_so: number;
    no_so: string;
    tgl_so: string;
    details: SoDetail[];
}

interface ItemForm {
    tempId: string;
    id_bahan: number;
    kode_bahan: string;
    nama_bahan: string;
    satuan_bahan: string;
    qty_sistem: number;
    qty_fisik: number;
    qty_kadaluarsa: number;
}

interface Props {
    stockOpnames: StockOpname[];
    bahans: Bahan[];
    nextNoSo: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function StockOpname({ stockOpnames, bahans, nextNoSo }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [itemList, setItemList] = useState<ItemForm[]>([]);
    const [tglSo, setTglSo] = useState("");
    const [searchKode, setSearchKode] = useState("");
    const [searchNama, setSearchNama] = useState("");
    const [showDropdownKode, setShowDropdownKode] = useState(false);
    const [showDropdownNama, setShowDropdownNama] = useState(false);
    const [selectedBahan, setSelectedBahan] = useState<Bahan | null>(null);
    const [qtySistem, setQtySistem] = useState<number>(0);
    const [qtyFisik, setQtyFisik] = useState<number>(0);
    const [qtyKadaluarsa, setQtyKadaluarsa] = useState<number>(0);
    const [selectedSo, setSelectedSo] = useState<StockOpname | null>(null);

    const dropdownKodeRef = useRef<HTMLDivElement>(null);
    const dropdownNamaRef = useRef<HTMLDivElement>(null);
    const inputKodeRef = useRef<HTMLInputElement>(null);
    const inputNamaRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownKodeRef.current &&
                !dropdownKodeRef.current.contains(event.target as Node)
            )
                setShowDropdownKode(false);
            if (
                dropdownNamaRef.current &&
                !dropdownNamaRef.current.contains(event.target as Node)
            )
                setShowDropdownNama(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ── Filter dropdown ──────────────────────────────────────────────────────

    const filteredByKode = searchKode
        ? bahans.filter((b) =>
              b.kode_bahan.toLowerCase().includes(searchKode.toLowerCase()),
          )
        : bahans;

    const filteredByNama = searchNama
        ? bahans.filter((b) =>
              b.nama_bahan.toLowerCase().includes(searchNama.toLowerCase()),
          )
        : bahans;

    // ── Handlers ─────────────────────────────────────────────────────────────

    const resetPilihBahan = () => {
        setSelectedBahan(null);
        setSearchKode("");
        setSearchNama("");
        setQtySistem(0);
        setQtyFisik(0);
        setQtyKadaluarsa(0);
    };

    const handleSelectBahan = (bahan: Bahan) => {
        setSelectedBahan(bahan);
        setSearchKode(bahan.kode_bahan);
        setSearchNama(bahan.nama_bahan);
        setQtySistem(0);
        setQtyFisik(0);
        setQtyKadaluarsa(0);
        setShowDropdownKode(false);
        setShowDropdownNama(false);
    };

    const handleAddItem = () => {
        if (!selectedBahan) {
            alert("Pilih bahan terlebih dahulu");
            return;
        }
        if (qtyFisik <= 0) {
            alert("Stok fisik harus diisi");
            return;
        }
        if (itemList.some((i) => i.id_bahan === selectedBahan.id_bahan)) {
            alert("Bahan ini sudah ditambahkan");
            return;
        }
        setItemList((prev) => [
            ...prev,
            {
                tempId: Date.now().toString(),
                id_bahan: selectedBahan.id_bahan,
                kode_bahan: selectedBahan.kode_bahan,
                nama_bahan: selectedBahan.nama_bahan,
                satuan_bahan: selectedBahan.satuan_bahan,
                qty_sistem: qtySistem,
                qty_fisik: qtyFisik,
                qty_kadaluarsa: qtyKadaluarsa,
            },
        ]);
        resetPilihBahan();
    };

    const handleRemoveItem = (tempId: string) => {
        setItemList((prev) => prev.filter((i) => i.tempId !== tempId));
    };

    const handleSimpan = () => {
        if (!tglSo) {
            alert("Tanggal harus diisi");
            return;
        }
        if (itemList.length === 0) {
            alert("Minimal 1 item harus ditambahkan");
            return;
        }
        router.post(
            "/persediaan/stok-opname",
            {
                tgl_so: tglSo,
                details: itemList.map((i) => ({
                    id_bahan: i.id_bahan,
                    qty_sistem: i.qty_sistem,
                    qty_fisik: i.qty_fisik,
                    qty_kadaluarsa: i.qty_kadaluarsa,
                })),
            },
            { onSuccess: () => handleBatal() },
        );
    };

    const handleBatal = () => {
        setShowForm(false);
        setItemList([]);
        setTglSo("");
        resetPilihBahan();
    };

    const handlePrint = (so: StockOpname) => {
        const printWindow = window.open("", "_blank", "width=700,height=600");
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Stok Opname - ${so.no_so}</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 13px; }
                        .center { text-align: center; }
                        .bold { font-weight: bold; }
                        .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th { background: #f3f4f6; padding: 6px 8px; text-align: left; font-size: 12px; }
                        td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
                        .right { text-align: right; }
                    </style>
                </head>
                <body>
                    <div class="center bold" style="font-size:16px;">STOK OPNAME</div>
                    <div class="center">CV New Citra</div>
                    <div class="line"></div>
                    <table style="width:auto;">
                        <tr><td>No. Opname</td><td>: <b>${so.no_so}</b></td></tr>
                        <tr><td>Tanggal</td><td>: ${new Date(so.tgl_so).toLocaleDateString("id-ID")}</td></tr>
                    </table>
                    <div class="line"></div>
                    <table>
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Nama Bahan</th>
                                <th class="right">Stok Sistem</th>
                                <th class="right">Stok Fisik</th>
                                <th class="right">Kadaluarsa</th>
                                <th class="right">Selisih</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${so.details
                                .map(
                                    (d) => `
                                <tr>
                                    <td>${d.bahan.kode_bahan}</td>
                                    <td>${d.bahan.nama_bahan}</td>
                                    <td class="right">${d.qty_sistem} ${d.bahan.satuan_bahan}</td>
                                    <td class="right">${d.qty_fisik} ${d.bahan.satuan_bahan}</td>
                                    <td class="right">${d.qty_kadaluarsa > 0 ? d.qty_kadaluarsa + " " + d.bahan.satuan_bahan : "-"}</td>
                                    <td class="right">${d.selisih > 0 ? "+" : ""}${d.selisih} ${d.bahan.satuan_bahan}</td>
                                </tr>
                            `,
                                )
                                .join("")}
                        </tbody>
                    </table>
                    <div class="line"></div>
                    <div class="center" style="margin-top:20px;">-- CV New Citra --</div>
                    <script>window.onload = function() { window.print(); window.close(); }</script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    // ── FORM VIEW ─────────────────────────────────────────────────────────────

    if (showForm) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-red-800">
                            Form Hasil Stok Opname
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    No. Opname
                                </label>
                                <input
                                    type="text"
                                    value={nextNoSo}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={tglSo}
                                    onChange={(e) => setTglSo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                />
                            </div>
                        </div>

                        {/* Input item */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">
                                Tambah Item Stok Opname
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                {/* Dropdown Kode */}
                                <div className="relative" ref={dropdownKodeRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kode Bahan
                                    </label>
                                    <div className="relative">
                                        <input
                                            ref={inputKodeRef}
                                            type="text"
                                            value={searchKode}
                                            onChange={(e) => {
                                                setSearchKode(e.target.value);
                                                setShowDropdownKode(true);
                                                setShowDropdownNama(false);
                                                if (!e.target.value)
                                                    resetPilihBahan();
                                            }}
                                            onFocus={() => {
                                                setShowDropdownKode(true);
                                                setShowDropdownNama(false);
                                            }}
                                            className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                            placeholder="Pilih atau ketik kode..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDropdownKode((v) => !v);
                                                setShowDropdownNama(false);
                                                inputKodeRef.current?.focus();
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                                        >
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-400 transition-transform ${showDropdownKode ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                    </div>
                                    {showDropdownKode &&
                                        filteredByKode.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredByKode.map((b) => (
                                                    <div
                                                        key={b.id_bahan}
                                                        onClick={() =>
                                                            handleSelectBahan(b)
                                                        }
                                                        className="px-3 py-2 hover:bg-red-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                                                    >
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {b.kode_bahan}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {b.nama_bahan}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                </div>

                                {/* Dropdown Nama */}
                                <div className="relative" ref={dropdownNamaRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Bahan
                                    </label>
                                    <div className="relative">
                                        <input
                                            ref={inputNamaRef}
                                            type="text"
                                            value={searchNama}
                                            onChange={(e) => {
                                                setSearchNama(e.target.value);
                                                setShowDropdownNama(true);
                                                setShowDropdownKode(false);
                                                if (!e.target.value)
                                                    resetPilihBahan();
                                            }}
                                            onFocus={() => {
                                                setShowDropdownNama(true);
                                                setShowDropdownKode(false);
                                            }}
                                            className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                            placeholder="Pilih atau ketik nama..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDropdownNama((v) => !v);
                                                setShowDropdownKode(false);
                                                inputNamaRef.current?.focus();
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                                        >
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-400 transition-transform ${showDropdownNama ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                    </div>
                                    {showDropdownNama &&
                                        filteredByNama.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredByNama.map((b) => (
                                                    <div
                                                        key={b.id_bahan}
                                                        onClick={() =>
                                                            handleSelectBahan(b)
                                                        }
                                                        className="px-3 py-2 hover:bg-red-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                                                    >
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {b.kode_bahan}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {b.nama_bahan}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stok Sistem
                                    </label>
                                    <input
                                        type="number"
                                        value={qtySistem || ""}
                                        onChange={(e) =>
                                            setQtySistem(Number(e.target.value))
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                        placeholder="Input manual"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stok Fisik
                                    </label>
                                    <input
                                        type="number"
                                        value={qtyFisik || ""}
                                        onChange={(e) =>
                                            setQtyFisik(Number(e.target.value))
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                        placeholder="Input manual"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kadaluarsa
                                    </label>
                                    <input
                                        type="number"
                                        value={qtyKadaluarsa || ""}
                                        onChange={(e) =>
                                            setQtyKadaluarsa(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                        placeholder="Input manual"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="w-full px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                                    >
                                        Tambah
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tabel item sementara */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Kode Bahan
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Nama Bahan
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                            Stok Sistem
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                            Stok Fisik
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                            Kadaluarsa
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                            Selisih
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemList.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-6 text-center text-gray-500"
                                            >
                                                Belum ada item stok opname
                                            </td>
                                        </tr>
                                    ) : (
                                        itemList.map((item) => {
                                            const selisih =
                                                item.qty_fisik -
                                                item.qty_sistem;
                                            return (
                                                <tr
                                                    key={item.tempId}
                                                    className="border-b border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                        {item.kode_bahan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        {item.nama_bahan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                        {item.qty_sistem}{" "}
                                                        {item.satuan_bahan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                        {item.qty_fisik}{" "}
                                                        {item.satuan_bahan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-right">
                                                        {item.qty_kadaluarsa >
                                                        0 ? (
                                                            <span className="text-gray-700 font-semibold">
                                                                {
                                                                    item.qty_kadaluarsa
                                                                }{" "}
                                                                {
                                                                    item.satuan_bahan
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-700">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-right">
                                                        <span className="font-semibold text-gray-700">
                                                            {selisih > 0
                                                                ? "+"
                                                                : ""}
                                                            {selisih}{" "}
                                                            {item.satuan_bahan}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveItem(
                                                                    item.tempId,
                                                                )
                                                            }
                                                            className="p-2 text-gray-700 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleBatal}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSimpan}
                                className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── LIST VIEW ─────────────────────────────────────────────────────────────

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-red-800">
                        Daftar Stock Opname
                    </h2>
                    <p className="text-sm text-red-800 mt-1">
                        Kelola data stock opname
                    </p>
                </div>
                <button
                    onClick={() => {
                        setTglSo(new Date().toISOString().split("T")[0]);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Stok Opname
                </button>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        No. Opname
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Tanggal
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Kode Bahan
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Nama Bahan
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Stok Sistem
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Stok Fisik
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Kadaluarsa
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Selisih
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockOpnames.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            Belum ada data stok opname
                                        </td>
                                    </tr>
                                ) : (
                                    stockOpnames.map((so) =>
                                        so.details.map((detail, idx) => (
                                            <tr
                                                key={detail.id_so_detail}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                    {idx === 0 ? so.no_so : ""}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {idx === 0
                                                        ? new Date(
                                                              so.tgl_so,
                                                          ).toLocaleDateString(
                                                              "id-ID",
                                                          )
                                                        : ""}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                    {detail.bahan.kode_bahan}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {detail.bahan.nama_bahan}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                    {detail.qty_sistem}{" "}
                                                    {detail.bahan.satuan_bahan}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                    {detail.qty_fisik}{" "}
                                                    {detail.bahan.satuan_bahan}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-right">
                                                    {detail.qty_kadaluarsa >
                                                    0 ? (
                                                        <span className="text-gray-700 font-semibold">
                                                            {
                                                                detail.qty_kadaluarsa
                                                            }{" "}
                                                            {
                                                                detail.bahan
                                                                    .satuan_bahan
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-700">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-right">
                                                    <span className="font-semibold text-gray-700">
                                                        {detail.selisih > 0
                                                            ? "+"
                                                            : ""}
                                                        {detail.selisih}{" "}
                                                        {
                                                            detail.bahan
                                                                .satuan_bahan
                                                        }
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {idx === 0 && (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    setSelectedSo(
                                                                        so,
                                                                    )
                                                                }
                                                                className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                                                title="Detail"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handlePrint(
                                                                        so,
                                                                    )
                                                                }
                                                                className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                                                                title="Print"
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
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

            {/* Modal Detail */}
            {selectedSo && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">
                                Detail Stok Opname — {selectedSo.no_so}
                            </h3>
                            <button
                                onClick={() => setSelectedSo(null)}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">
                                        No. Opname
                                    </span>
                                    <span className="text-sm font-semibold text-gray-800">
                                        {selectedSo.no_so}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">
                                        Tanggal
                                    </span>
                                    <span className="text-sm text-gray-800">
                                        {new Date(
                                            selectedSo.tgl_so,
                                        ).toLocaleDateString("id-ID")}
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                                                Kode
                                            </th>
                                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                                                Nama Bahan
                                            </th>
                                            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">
                                                Stok Sistem
                                            </th>
                                            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">
                                                Stok Fisik
                                            </th>
                                            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">
                                                Kadaluarsa
                                            </th>
                                            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">
                                                Selisih
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedSo.details.map((d) => (
                                            <tr
                                                key={d.id_so_detail}
                                                className="border-b border-gray-100"
                                            >
                                                <td className="py-2 px-3 text-sm font-semibold text-gray-700">
                                                    {d.bahan.kode_bahan}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700">
                                                    {d.bahan.nama_bahan}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 text-right">
                                                    {d.qty_sistem}{" "}
                                                    {d.bahan.satuan_bahan}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 text-right">
                                                    {d.qty_fisik}{" "}
                                                    {d.bahan.satuan_bahan}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-right">
                                                    {d.qty_kadaluarsa > 0
                                                        ? `${d.qty_kadaluarsa} ${d.bahan.satuan_bahan}`
                                                        : "-"}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-right font-semibold text-gray-700">
                                                    {d.selisih > 0 ? "+" : ""}
                                                    {d.selisih}{" "}
                                                    {d.bahan.satuan_bahan}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                            <button
                                onClick={() => handlePrint(selectedSo)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                            >
                                <Printer className="w-4 h-4" /> Print
                            </button>
                            <button
                                onClick={() => setSelectedSo(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors text-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

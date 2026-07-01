import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle } from "lucide-react";
import { usePage, router } from "@inertiajs/react";

interface ItemPO {
    idBahan: number; // TAMBAHAN: Menangkap ID Bahan untuk database
    kodeBahan: string;
    namaBahan: string;
    qtyPO: number;
    satuan: string;
}

interface PesananPO {
    id: string;
    noPO: string;
    supplier: string;
    tanggal: string;
    items: ItemPO[];
}

interface ItemPenerimaan {
    idBahan: number; // TAMBAHAN: Menangkap ID Bahan
    kodeBahan: string;
    namaBahan: string;
    qtyPO: number;
    qtyDiterima: number;
    qtyRetur: number;
    satuan: string;
    kondisi: "Baik" | "Retur";
    catatan: string;
}

interface PenerimaanBahan {
    id: string;
    noPenerimaan: string;
    tanggal: string;
    supplier: string;
    noPO: string;
    items: ItemPenerimaan[];
}

export default function PenerimaanBahan() {
    const { pesananPO = [], riwayatPenerimaan = [] } = usePage<any>().props;

    const [pesananList, setPesananList] = useState<PesananPO[]>([]);
    const [penerimaanList, setPenerimaanList] = useState<PenerimaanBahan[]>([]);

    useEffect(() => {
        // 1. Sinkronisasi Data PO dari Database
        const mappedPO: PesananPO[] = pesananPO.map((po: any) => ({
            id: String(po.id_po || po.id),
            noPO: po.no_po || "",
            supplier:
                po.supplier?.nama_supplier ||
                po.supplier ||
                "Tidak Ada Supplier",
            tanggal: po.tgl_po || po.tanggal_po || po.tanggal || "",
            // CATATAN: Kita coba baca relasi detail_po, details, atau detail_pesanan
            items: (po.detail_po || po.detail_pesanan || po.details || []).map(
                (d: any) => ({
                    idBahan: Number(d.id_bahan || d.bahan?.id_bahan || 0),
                    kodeBahan: d.bahan?.kode_bahan || "",
                    namaBahan: d.bahan?.nama_bahan || "",
                    // CATATAN: Kita tebak nama kolom kuantitasnya (qty_po, qty, jumlah, dll)
                    qtyPO: Number(
                        d.qty_po || d.qty || d.jumlah || d.kuantitas || 0,
                    ),
                    satuan: d.bahan?.satuan || "",
                }),
            ),
        }));

        // 2. Sinkronisasi Data Riwayat Penerimaan dari Database
        const mappedRiwayat: PenerimaanBahan[] = riwayatPenerimaan.map(
            (trm: any) => {
                const poRelation = trm.purchase_order || trm.purchaseOrder;
                // CATATAN: Coba tangkap berbagai nama relasi detail penerimaan
                const detailsRelation =
                    trm.detail_penerimaan_bahan ||
                    trm.detail_penerimaan ||
                    trm.detailPenerimaan ||
                    [];

                // Cari baris ini di dalam mappedRiwayat:
                const items = detailsRelation.map((d: any) => {
                    // 1. Ambil array detail PO dari relasi yang baru saja kita panggil di controller
                    const poDetails = poRelation?.details || [];

                    // 2. Cari item PO yang id_bahan-nya sama dengan id_bahan di detail penerimaan ini
                    const originalPoItem = poDetails.find(
                        (poItem: any) => poItem.id_bahan === d.id_bahan,
                    );

                    return {
                        idBahan: Number(d.id_bahan || 0),
                        kodeBahan: d.bahan?.kode_bahan || "",
                        namaBahan: d.bahan?.nama_bahan || "",

                        // 3. Ambil Qty PO dari originalPoItem (bukan dari 'd' / tabel penerimaan)
                        qtyPO: Number(originalPoItem?.qty_po || 0), // 🔥 Perbaikan utama di sini

                        qtyDiterima: Number(
                            d.qty_diterima ||
                                d.qty_terima ||
                                d.jumlah_diterima ||
                                0,
                        ),
                        qtyRetur: Number(d.qty_retur || d.jumlah_retur || 0),
                        satuan: d.bahan?.satuan || "",
                        kondisi: d.kondisi || "Baik",
                        catatan: d.catatan || "",
                    };
                });

                return {
                    id: String(trm.id_penerimaan || trm.id),
                    noPenerimaan: trm.no_penerimaan || "",
                    tanggal: trm.tgl_penerimaan || trm.tanggal_penerimaan || "",
                    supplier: poRelation?.supplier?.nama_supplier || "-",
                    noPO: poRelation?.no_po || "-",
                    items: items,
                };
            },
        );

        setPesananList(mappedPO);
        setPenerimaanList(mappedRiwayat);
    }, [pesananPO, riwayatPenerimaan]);

    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedPO, setSelectedPO] = useState<PesananPO | null>(null);
    const [selectedPenerimaan, setSelectedPenerimaan] =
        useState<PenerimaanBahan | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        noPenerimaan: "",
        tanggal: "",
    });

    const [itemsPenerimaan, setItemsPenerimaan] = useState<ItemPenerimaan[]>(
        [],
    );

    const handleBuatPenerimaan = (po: PesananPO) => {
        const today = new Date().toISOString().split("T")[0];
        const noPenerimaan = `TRM-${new Date().getFullYear()}-${String(penerimaanList.length + 1).padStart(3, "0")}`;

        setFormData({
            noPenerimaan: noPenerimaan,
            tanggal: today,
        });

        const items: ItemPenerimaan[] = po.items.map((item) => ({
            idBahan: item.idBahan, // MASUKKAN ID BAHAN
            kodeBahan: item.kodeBahan,
            namaBahan: item.namaBahan,
            qtyPO: item.qtyPO,
            qtyDiterima: item.qtyPO,
            qtyRetur: 0,
            satuan: item.satuan,
            kondisi: "Baik",
            catatan: "",
        }));

        setItemsPenerimaan(items);
        setSelectedPO(po);
        setShowForm(true);
    };

    const handleVerifikasi = (penerimaan: PenerimaanBahan) => {
        setSelectedPenerimaan(penerimaan);
        setShowDetail(true);
    };

    const handleUpdateItem = (
        index: number,
        field: keyof ItemPenerimaan,
        value: any,
    ) => {
        const updatedItems = [...itemsPenerimaan];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setItemsPenerimaan(updatedItems);
    };

    const handleSimpan = () => {
        if (!selectedPO) return;

        router.post(
            "/pembelian/penerimaan-bahan",
            {
                id_po: selectedPO.id,
                no_penerimaan: formData.noPenerimaan,
                tanggal_penerimaan: formData.tanggal,
                items: itemsPenerimaan.map((item) => ({
                    id_bahan: item.idBahan, // PENTING: Controller Laravel butuh 'id_bahan'
                    qty_po: item.qtyPO,
                    qty_diterima: item.qtyDiterima,
                    qty_retur: item.qtyRetur,
                    kondisi: item.kondisi,
                    catatan: item.catatan,
                })),
            },
            {
                onSuccess: () => {
                    handleBatal();
                    alert("Data penerimaan berhasil disimpan ke database!");
                },
                onError: (errors) => {
                    // PENTING: Tangkap error agar tidak cuma refresh diam-diam
                    console.error(errors);
                    alert(
                        "Gagal menyimpan! Coba periksa apakah inputan ada yang kosong atau salah.",
                    );
                },
            },
        );
    };

    const handleBatal = () => {
        setShowForm(false);
        setSelectedPO(null);
        setFormData({ noPenerimaan: "", tanggal: "" });
        setItemsPenerimaan([]);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const filteredPesanan = pesananList.filter(
        (po) =>
            po.noPO.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const filteredPenerimaan = penerimaanList.filter(
        (trm) =>
            trm.noPenerimaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trm.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trm.noPO.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // =============================================================
    // TAMPILAN 1: FORM INPUT PENERIMAAN BAHAN
    // =============================================================
    if (showForm && selectedPO) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-red-800">
                            Form Penerimaan Bahan
                        </h3>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No Penerimaan
                                </label>
                                <input
                                    type="text"
                                    value={formData.noPenerimaan}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Masuk
                                </label>
                                <input
                                    type="date"
                                    value={formData.tanggal}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tanggal: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Supplier
                                </label>
                                <input
                                    type="text"
                                    value={selectedPO.supplier}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No PO (Sumber Data)
                                </label>
                                <input
                                    type="text"
                                    value={selectedPO.noPO}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-medium text-gray-800 mb-3">
                                Tabel Kuantitas Barang
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Kode Bahan
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Nama Bahan
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Qty PO
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Qty Diterima
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Qty Retur
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Kondisi
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                Catatan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itemsPenerimaan.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold border-r border-gray-100">
                                                    {item.kodeBahan}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 border-r border-gray-100">
                                                    {item.namaBahan}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-right border-r border-gray-100">
                                                    {item.qtyPO} {item.satuan}
                                                </td>

                                                <td className="py-3 px-4 border-r border-gray-100">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.qtyDiterima}
                                                        onChange={(e) =>
                                                            handleUpdateItem(
                                                                index,
                                                                "qtyDiterima",
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-200 rounded text-right outline-none focus:border-red-400"
                                                    />
                                                </td>

                                                <td className="py-3 px-4 border-r border-gray-100">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.qtyRetur}
                                                        onChange={(e) =>
                                                            handleUpdateItem(
                                                                index,
                                                                "qtyRetur",
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-200 rounded text-right outline-none focus:border-red-400"
                                                    />
                                                </td>

                                                <td className="py-3 px-4 border-r border-gray-100">
                                                    <select
                                                        value={item.kondisi}
                                                        onChange={(e) =>
                                                            handleUpdateItem(
                                                                index,
                                                                "kondisi",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-red-400"
                                                    >
                                                        <option value="Baik">
                                                            Baik
                                                        </option>
                                                        <option value="Retur">
                                                            Retur
                                                        </option>
                                                    </select>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <input
                                                        type="text"
                                                        value={item.catatan}
                                                        onChange={(e) =>
                                                            handleUpdateItem(
                                                                index,
                                                                "catatan",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-red-400"
                                                        placeholder="Keterangan..."
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={handleBatal}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSimpan}
                                className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                            >
                                Simpan Penerimaan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =============================================================
    // TAMPILAN 2: DETAIL RIWAYAT PENERIMAAN (VIEW ONLY)
    // =============================================================
    if (showDetail && selectedPenerimaan) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-red-800">
                            Detail Penerimaan Bahan
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No Penerimaan
                                </label>
                                <input
                                    type="text"
                                    value={selectedPenerimaan.noPenerimaan}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Terima
                                </label>
                                <input
                                    type="text"
                                    value={formatDate(
                                        selectedPenerimaan.tanggal,
                                    )}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Supplier
                                </label>
                                <input
                                    type="text"
                                    value={selectedPenerimaan.supplier}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No PO Asal
                                </label>
                                <input
                                    type="text"
                                    value={selectedPenerimaan.noPO}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-medium text-gray-800 mb-3">
                                Tabel Barang Masuk
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Kode Bahan
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Nama Bahan
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Qty PO
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Qty Diterima
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Qty Retur
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Kondisi
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                Catatan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPenerimaan.items.map(
                                            (item, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-b border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="py-3 px-4 text-sm text-gray-700 font-semibold border-r border-gray-100">
                                                        {item.kodeBahan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 border-r border-gray-100">
                                                        {item.namaBahan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 text-right border-r border-gray-100">
                                                        {item.qtyPO}{" "}
                                                        {item.satuan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 text-right border-r border-gray-100 text-green-700 font-medium">
                                                        {item.qtyDiterima}{" "}
                                                        {item.satuan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 text-right border-r border-gray-100 text-red-600 font-medium">
                                                        {item.qtyRetur}{" "}
                                                        {item.satuan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 border-r border-gray-100">
                                                        <span
                                                            className={`px-2 py-1 text-xs rounded-full ${item.kondisi === "Baik" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                                                        >
                                                            {item.kondisi}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        {item.catatan || "-"}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowDetail(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Kembali
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =============================================================
    // TAMPILAN 3: HALAMAN UTAMA (LIST VIEW TABEL)
    // =============================================================
    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-red-800">
                    Daftar Penerimaan Bahan
                </h2>
                <p className="text-sm text-red-800 mt-1">
                    Kelola data penerimaan bahan masuk
                </p>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari penerimaan atau PO..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                        />
                    </div>

                    {/* Tabel PO Siap Diterima */}
                    <div className="mb-8">
                        <h4 className="font-medium text-gray-800 mb-3">
                            Pesanan Pembelian (Siap Diterima)
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            No PO
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Tanggal PO
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Supplier
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPesanan.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="py-4 text-center text-sm text-gray-500"
                                            >
                                                Tidak ada PO berstatus disetujui
                                                yang siap diterima.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPesanan.map((po) => (
                                            <tr
                                                key={po.id}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                    {po.noPO}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {formatDate(po.tanggal)}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {po.supplier}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={() =>
                                                                handleBuatPenerimaan(
                                                                    po,
                                                                )
                                                            }
                                                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors shadow-sm"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />{" "}
                                                            Buat Penerimaan
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tabel Riwayat Penerimaan */}
                    <div>
                        <h4 className="font-medium text-gray-800 mb-3">
                            Daftar Penerimaan (Riwayat)
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            No Penerimaan
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Tanggal Terima
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Supplier
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            No PO
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPenerimaan.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-4 text-center text-sm text-gray-500"
                                            >
                                                Belum ada riwayat transaksi
                                                penerimaan bahan.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPenerimaan.map((trm) => (
                                            <tr
                                                key={trm.id}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                    {trm.noPenerimaan}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {formatDate(trm.tanggal)}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {trm.supplier}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                    {trm.noPO}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={() =>
                                                                handleVerifikasi(
                                                                    trm,
                                                                )
                                                            }
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

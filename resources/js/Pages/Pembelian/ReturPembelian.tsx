import { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import {
    Search,
    Plus,
    Eye,
    PackageX,
    AlertCircle,
    Printer,
} from "lucide-react";

interface ItemPenerimaan {
    idBahan: number;
    kodeBahan: string;
    namaBahan: string;
    jenisBahan: string;
    qtyDiterima: number;
    qtyRetur: number;
    satuan: string;
    kondisi: "Baik" | "Retur";
    catatan: string;
    harga: number;
}

interface PenerimaanBahan {
    id: string;
    noPenerimaan: string;
    tanggal: string;
    supplier: string;
    noPO: string;
    jenisPembayaran: string;
    items: ItemPenerimaan[];
    totalNilai: number;
}

interface ItemRetur {
    idBahan: number;
    kodeBahan: string;
    namaBahan: string;
    jenisBahan: string;
    qtyDiterima: number;
    qtyRetur: number;
    satuan: string;
    kondisi: "Baik" | "Retur";
    catatan: string;
    harga: number;
    alasan: string;
}

interface ReturPembelian {
    id: string;
    noRetur: string;
    supplier: string;
    referensiPenerimaan: string;
    tanggalRetur: string;
    jenisPembayaran: string;
    items: ItemRetur[];
    totalNilai: number;
}

export default function ReturPembelian() {
    const { pesananPenerimaan = [], riwayatRetur = [] } = usePage<any>().props;

    const [dataPenerimaan, setDataPenerimaan] = useState<PenerimaanBahan[]>([]);
    const [dataRetur, setDataRetur] = useState<ReturPembelian[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedPenerimaan, setSelectedPenerimaan] =
        useState<PenerimaanBahan | null>(null);
    const [selectedRetur, setSelectedRetur] = useState<ReturPembelian | null>(
        null,
    );
    const [itemsRetur, setItemsRetur] = useState<ItemRetur[]>([]);
    const [formData, setFormData] = useState({
        noRetur: "",
        tanggalRetur: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        // Mapping Data Penerimaan dari Database
        const mappedPenerimaan: PenerimaanBahan[] = pesananPenerimaan.map(
            (p: any) => ({
                id: p.id_penerimaan.toString(),
                noPenerimaan: p.no_penerimaan,
                tanggal: p.tanggal_penerimaan,
                supplier: p.purchase_order?.supplier?.nama_supplier || "-",
                noPO: p.purchase_order?.no_po || "-",
                jenisPembayaran: p.purchase_order?.metode_beli || "-",
                totalNilai: 0,
                items: (p.detail_penerimaan || [])
                    .filter((d: any) => Number(d.qty_retur) > 0)
                    .map((d: any) => {
                        return {
                            idBahan: d.id_bahan,
                            kodeBahan: d.bahan?.kode_bahan || "",
                            namaBahan: d.bahan?.nama_bahan || "",
                            jenisBahan: "Bahan",
                            qtyDiterima: Number(d.qty_diterima || 0),
                            qtyRetur: Number(d.qty_retur || 0),
                            satuan: d.bahan?.satuan || "",
                            kondisi: d.kondisi || "Retur",
                            catatan: d.catatan || "",
                            // 🔥 KUNCI PERBAIKAN UTAMA: Menggunakan harga_aktual dari controller
                            harga: Number(d.harga_aktual || 0),
                        };
                    }),
            }),
        );

        // Mapping Data Riwayat Retur dari Database
        const mappedRetur: ReturPembelian[] = riwayatRetur.map((r: any) => ({
            id: r.id_retur.toString(),
            noRetur: r.no_retur,
            supplier:
                r.penerimaan?.purchase_order?.supplier?.nama_supplier || "-",
            referensiPenerimaan: r.penerimaan?.no_penerimaan || "-",
            tanggalRetur: r.tanggal_retur,
            jenisPembayaran: r.penerimaan?.purchase_order?.metode_beli || "-",
            totalNilai: Number(r.total_nilai),
            items: (r.details || []).map((d: any) => ({
                idBahan: d.id_bahan,
                kodeBahan: d.bahan?.kode_bahan || "",
                namaBahan: d.bahan?.nama_bahan || "",
                jenisBahan: "Bahan",
                qtyDiterima: 0,
                qtyRetur: Number(d.qty_retur),
                satuan: d.bahan?.satuan || "",
                kondisi: "Retur",
                catatan: "",
                harga: Number(d.harga_satuan),
                alasan: d.alasan || "-",
            })),
        }));

        setDataPenerimaan(mappedPenerimaan);
        setDataRetur(mappedRetur);
    }, [pesananPenerimaan, riwayatRetur]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const generateNoRetur = () => {
        const year = new Date().getFullYear();
        const lastNumber = dataRetur.length + 1;
        return `RT-${year}-${String(lastNumber).padStart(3, "0")}`;
    };

    const handleBuatRetur = (penerimaan: PenerimaanBahan) => {
        setSelectedPenerimaan(penerimaan);
        setFormData({
            noRetur: generateNoRetur(),
            tanggalRetur: new Date().toISOString().split("T")[0],
        });

        const returItems = penerimaan.items.filter((item) => item.qtyRetur > 0);
        const initialItems: ItemRetur[] = returItems.map((item) => ({
            ...item,
            qtyRetur: item.qtyRetur,
            alasan: item.catatan || "",
        }));

        setItemsRetur(initialItems);
        setShowForm(true);
    };

    const handleQtyReturChange = (index: number, value: string) => {
        const numValue = parseInt(value) || 0;
        const maxQty = itemsRetur[index].qtyDiterima;

        if (numValue > maxQty) {
            alert(`Qty retur tidak boleh melebihi qty diterima (${maxQty})`);
            return;
        }

        const newItems = [...itemsRetur];
        newItems[index].qtyRetur = numValue;
        setItemsRetur(newItems);
    };

    const handleAlasanChange = (index: number, value: string) => {
        const newItems = [...itemsRetur];
        newItems[index].alasan = value;
        setItemsRetur(newItems);
    };

    const handleSimpan = () => {
        if (!selectedPenerimaan) return;

        const itemsWithRetur = itemsRetur.filter((item) => item.qtyRetur > 0);

        if (itemsWithRetur.length === 0) {
            alert("Minimal harus ada 1 item yang diretur!");
            return;
        }

        const itemsWithoutReason = itemsWithRetur.filter(
            (item) => !item.alasan.trim(),
        );
        if (itemsWithoutReason.length > 0) {
            alert("Semua item yang diretur harus memiliki alasan!");
            return;
        }

        router.post(
            route("retur-pembelian.store"),
            {
                id_penerimaan: selectedPenerimaan.id,
                no_retur: formData.noRetur,
                tanggal_retur: formData.tanggalRetur,
                items: itemsWithRetur.map((item) => ({
                    idBahan: item.idBahan,
                    qtyRetur: item.qtyRetur,
                    harga: item.harga, // Ini otomatis mengirimkan harga aktual (178)
                    alasan: item.alasan,
                })),
            },
            {
                onSuccess: () => {
                    setShowForm(false);
                    setSelectedPenerimaan(null);
                    setItemsRetur([]);
                    alert("Data Retur berhasil disimpan!");
                },
                onError: (errors) => {
                    console.error(errors);
                    alert("Gagal menyimpan data retur.");
                },
            },
        );
    };

    const handleBatal = () => {
        setShowForm(false);
        setSelectedPenerimaan(null);
        setItemsRetur([]);
    };

    const handleLihatDetail = (retur: ReturPembelian) => {
        setSelectedRetur(retur);
        setShowDetail(true);
    };

    const handleCetak = (retur: ReturPembelian) => {
        const tanggal = formatDate(retur.tanggalRetur);
        const itemRows = retur.items
            .map(
                (item) => `
      <tr>
        <td style="border:1px solid #ccc;padding:6px 10px;">${item.kodeBahan}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;">${item.namaBahan}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;">${item.jenisBahan}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;text-align:right;">${item.qtyRetur} ${item.satuan}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;text-align:right;">${formatCurrency(item.harga)}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;text-align:right;">${formatCurrency(item.qtyRetur * item.harga)}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;">${item.alasan}</td>
      </tr>`,
            )
            .join("");

        const win = window.open("", "_blank", "width=1000,height=700");
        if (!win) return;
        win.document
            .write(`<!DOCTYPE html><html><head><title>Cetak Retur - ${retur.noRetur}</title>
      <style>body{font-family:Arial,sans-serif;font-size:13px;margin:30px;}h2{color:#7f1d1d;margin-bottom:4px;}
      table{border-collapse:collapse;width:100%;}th{text-align:left;background:#f3f4f6;}
      .info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px 24px;margin-bottom:16px;}
      .info-item label{font-size:11px;color:#666;display:block;}.info-item p{font-weight:600;margin:2px 0;}
      .footer{margin-top:40px;display:flex;justify-content:space-between;}
      .ttd{text-align:center;width:200px;}.ttd .line{margin-top:60px;border-top:1px solid #333;}
      @media print{button{display:none!important;}}</style></head><body>
      <div style="text-align:center;margin-bottom:16px;">
        <h2>CV NEW CITRA</h2>
        <p style="margin:0;font-size:12px;color:#555;">Produksi Olahan Bandeng</p>
        <hr style="border-color:#7f1d1d;margin:8px 0;">
        <h3 style="margin:4px 0;">NOTA RETUR PEMBELIAN</h3>
      </div>
      <div class="info-grid">
        <div class="info-item"><label>No. Retur</label><p>${retur.noRetur}</p></div>
        <div class="info-item"><label>Tanggal Retur</label><p>${tanggal}</p></div>
        <div class="info-item"><label>Supplier</label><p>${retur.supplier}</p></div>
        <div class="info-item"><label>Ref. Penerimaan</label><p>${retur.referensiPenerimaan}</p></div>
        <div class="info-item"><label>Jenis Pembayaran</label><p>${retur.jenisPembayaran}</p></div>
      </div>
      <table><thead><tr>
        <th style="border:1px solid #ccc;padding:6px 10px;">Kode Bahan</th>
        <th style="border:1px solid #ccc;padding:6px 10px;">Nama Bahan</th>
        <th style="border:1px solid #ccc;padding:6px 10px;">Jenis Bahan</th>
        <th style="border:1px solid #ccc;padding:6px 10px;text-align:right;">Qty Retur</th>
        <th style="border:1px solid #ccc;padding:6px 10px;text-align:right;">Harga Satuan</th>
        <th style="border:1px solid #ccc;padding:6px 10px;text-align:right;">Nilai Retur</th>
        <th style="border:1px solid #ccc;padding:6px 10px;">Alasan</th>
      </tr></thead><tbody>${itemRows}
        <tr style="background:#fef2f2;"><td colspan="6" style="border:1px solid #ccc;padding:8px 10px;text-align:right;font-weight:700;">TOTAL NILAI RETUR</td>
          <td style="border:1px solid #ccc;padding:8px 10px;text-align:right;font-weight:700;color:#7f1d1d;">${formatCurrency(retur.totalNilai)}</td>
          <td style="border:1px solid #ccc;"></td></tr>
      </tbody></table>
      <div class="footer">
        <div class="ttd"><div class="line">Dibuat Oleh</div></div>
        <div class="ttd"><div class="line">Disetujui Oleh</div></div>
      </div>
      <script>window.onload=()=>{window.print();}<\/script></body></html>`);
        win.document.close();
    };

    const filteredPenerimaan = dataPenerimaan.filter((penerimaan) => {
        const matchesSearch =
            penerimaan.noPenerimaan
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            penerimaan.supplier
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            penerimaan.noPO.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const filteredRetur = dataRetur.filter(
        (retur) =>
            retur.noRetur.toLowerCase().includes(searchTerm.toLowerCase()) ||
            retur.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            retur.referensiPenerimaan
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    // TAMPILAN DETAIL RETUR
    if (showDetail && selectedRetur) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <PackageX className="w-6 h-6 text-red-600" />
                                <h3 className="text-lg font-bold text-red-800">
                                    Detail Retur Pembelian
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Kembali
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    No Retur
                                </label>
                                <p className="text-gray-900">
                                    {selectedRetur.noRetur}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Retur
                                </label>
                                <p className="text-gray-900">
                                    {formatDate(selectedRetur.tanggalRetur)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Supplier
                                </label>
                                <p className="text-gray-900">
                                    {selectedRetur.supplier}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Referensi Penerimaan
                                </label>
                                <p className="text-gray-900">
                                    {selectedRetur.referensiPenerimaan}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Jenis Pembayaran
                                </label>
                                <p className="text-gray-900">
                                    {selectedRetur.jenisPembayaran}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Nilai Retur
                                </label>
                                <p className="text-gray-700 font-medium">
                                    {formatCurrency(selectedRetur.totalNilai)}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="font-medium text-gray-900 mb-3">
                                Detail Item Retur
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-700">
                                            <th className="text-left py-3 px-3 text-sm font-semibold ">
                                                Nama Bahan
                                            </th>
                                            <th className="text-center py-3 px-3 text-sm font-semibold">
                                                Qty Retur
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold ">
                                                Alasan
                                            </th>
                                            <th className="text-right py-3 px-3 text-sm font-semibold">
                                                Nilai Retur
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedRetur.items.map(
                                            (item, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-b border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                        {item.namaBahan}
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-red-600 font-medium text-center border-r border-gray-100">
                                                        {item.qtyRetur}{" "}
                                                        {item.satuan}
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                        {item.alasan}
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-700 text-right">
                                                        {formatCurrency(
                                                            item.qtyRetur *
                                                                item.harga,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-100 font-bold">
                                            <td
                                                colSpan={3}
                                                className="py-3 px-3 text-sm text-gray-700 text-right border-r border-gray-300"
                                            >
                                                TOTAL NILAI RETUR:
                                            </td>
                                            <td className="py-3 px-3 text-sm text-gray-700 text-right">
                                                {formatCurrency(
                                                    selectedRetur.totalNilai,
                                                )}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // TAMPILAN FORM RETUR BARU
    if (showForm && selectedPenerimaan) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-red-800">
                            Form Retur Pembelian
                        </h3>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No Retur *
                                </label>
                                <input
                                    type="text"
                                    value={formData.noRetur}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Retur *
                                </label>
                                <input
                                    type="date"
                                    value={formData.tanggalRetur}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tanggalRetur: e.target.value,
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
                                    value={selectedPenerimaan.supplier}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Referensi Penerimaan
                                </label>
                                <input
                                    type="text"
                                    value={selectedPenerimaan.noPenerimaan}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jenis Pembayaran
                                </label>
                                <input
                                    type="text"
                                    value={selectedPenerimaan.jenisPembayaran}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="font-medium text-gray-900 mb-3">
                                Detail Item Retur
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-700">
                                            <th className="text-left py-3 px-3 text-sm font-semibold">
                                                Nama Bahan
                                            </th>
                                            <th className="text-center py-3 px-3 text-sm font-semibold">
                                                Qty Diterima
                                            </th>
                                            <th className="text-center py-3 px-3 text-sm font-semibold">
                                                Qty Retur
                                            </th>
                                            <th className="text-right py-3 px-3 text-sm font-semibold">
                                                Harga Satuan
                                            </th>
                                            <th className="text-right py-3 px-3 text-sm font-semibold">
                                                Subtotal Retur
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold">
                                                Alasan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itemsRetur.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                    {item.namaBahan}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 text-center border-r border-gray-100">
                                                    {item.qtyDiterima}{" "}
                                                    {item.satuan}
                                                </td>
                                                <td className="py-2 px-3 border-r border-gray-100">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={item.qtyDiterima}
                                                        value={
                                                            item.qtyRetur || ""
                                                        }
                                                        onChange={(e) =>
                                                            handleQtyReturChange(
                                                                index,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full px-2 py-1 border border-gray-200 rounded text-center outline-none focus:border-red-400"
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 text-right border-r border-gray-100">
                                                    {formatCurrency(item.harga)}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 font-medium text-right border-r border-gray-100">
                                                    {item.qtyRetur > 0
                                                        ? formatCurrency(
                                                              item.qtyRetur *
                                                                  item.harga,
                                                          )
                                                        : "-"}
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="text"
                                                        value={item.alasan}
                                                        onChange={(e) =>
                                                            handleAlasanChange(
                                                                index,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full px-2 py-1 border border-gray-200 rounded outline-none focus:border-red-400"
                                                        placeholder="Masukkan alasan retur"
                                                        disabled={
                                                            item.qtyRetur === 0
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-100 font-bold">
                                            <td
                                                colSpan={4}
                                                className="py-3 px-3 text-sm text-gray-700 text-right border-r border-gray-300"
                                            >
                                                TOTAL RETUR:
                                            </td>
                                            <td className="py-3 px-3 text-sm text-gray-700 text-right border-r border-gray-300">
                                                {formatCurrency(
                                                    itemsRetur.reduce(
                                                        (sum, item) =>
                                                            sum +
                                                            item.qtyRetur *
                                                                item.harga,
                                                        0,
                                                    ),
                                                )}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={handleBatal}
                                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSimpan}
                                className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                            >
                                Simpan Retur
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // TAMPILAN UTAMA (TABEL)
    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-red-800">
                    Daftar Retur Pembelian
                </h2>
                <p className="text-sm text-red-800 mt-1">
                    Kelola data retur pembelian bahan
                </p>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari No Penerimaan, Supplier, atau No PO..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">
                            Daftar Penerimaan Bahan (Siap Retur)
                        </h4>
                        {filteredPenerimaan.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Tidak ada penerimaan dengan kondisi retur
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                No Penerimaan
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Tanggal
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Supplier
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                No PO
                                            </th>
                                            <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                                Kondisi
                                            </th>
                                            <th className="text-center py-3 px-3 text-sm font-semibold text-gray-700">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPenerimaan.map(
                                            (penerimaan) => (
                                                <tr
                                                    key={penerimaan.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="py-2 px-3 text-sm text-gray-700 font-semibold border-r border-gray-100">
                                                        {
                                                            penerimaan.noPenerimaan
                                                        }
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                        {formatDate(
                                                            penerimaan.tanggal,
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                        {penerimaan.supplier}
                                                    </td>
                                                    <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                        {penerimaan.noPO}
                                                    </td>
                                                    <td className="py-2 px-3 border-r border-gray-100">
                                                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                                                            Retur
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-3 text-center">
                                                        <button
                                                            onClick={() =>
                                                                handleBuatRetur(
                                                                    penerimaan,
                                                                )
                                                            }
                                                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors mx-auto"
                                                            title="Buat Retur"
                                                        >
                                                            <PackageX className="w-4 h-4" />
                                                            Buat Retur
                                                        </button>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-gray-900 mb-3">
                            Daftar Retur Pembelian
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                            No Retur
                                        </th>
                                        <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                            Tanggal
                                        </th>
                                        <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                            Supplier
                                        </th>
                                        <th className="text-right py-3 px-3 text-sm font-semibold text-gray-700 border-r border-gray-100">
                                            Total Retur
                                        </th>
                                        <th className="text-center py-3 px-3 text-sm font-semibold text-gray-700">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRetur.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-8 text-center text-gray-500 text-sm"
                                            >
                                                Belum ada data riwayat retur
                                                pembelian
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRetur.map((retur) => (
                                            <tr
                                                key={retur.id}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-2 px-3 text-sm text-gray-700 font-semibold border-r border-gray-100">
                                                    {retur.noRetur}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                    {formatDate(
                                                        retur.tanggalRetur,
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 border-r border-gray-100">
                                                    {retur.supplier}
                                                </td>
                                                <td className="py-2 px-3 text-sm text-gray-700 font-medium text-right border-r border-gray-100">
                                                    {formatCurrency(
                                                        retur.totalNilai,
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() =>
                                                                handleLihatDetail(
                                                                    retur,
                                                                )
                                                            }
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleCetak(
                                                                    retur,
                                                                )
                                                            }
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Cetak"
                                                        >
                                                            <Printer className="w-5 h-5" />
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

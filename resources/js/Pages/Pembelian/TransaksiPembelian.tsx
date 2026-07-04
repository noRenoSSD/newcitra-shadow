import { useState, useEffect } from "react";
import { Search, Eye, X, ClipboardList, Printer } from "lucide-react";
import { usePage, router } from "@inertiajs/react";

// Helper untuk format Rupiah
const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value || 0);

export default function TransaksiPembelian() {
    // --- Data dari Database (Inertia) ---
    const { penerimaanPending = [], riwayatTransaksi = [] } =
        usePage<any>().props;

    // --- States ---
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedPenerimaan, setSelectedPenerimaan] = useState<any>(null);
    const [selectedTransaksi, setSelectedTransaksi] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // State Form Transaksi
    const [form, setForm] = useState({
        id_penerimaan: "",
        no_faktur: "",
        tanggal_transaksi: new Date().toISOString().split("T")[0],
        metode_pembayaran: "Tunai",
        jatuh_tempo: "",
        subtotal_barang: 0,
        diskon: 0,
        ongkos_kirim: 0,
        pajak: 0,
        total_tagihan: 0,
        items: [] as any[],
    });

    // --- Handlers ---

    // 1. Buka form input dari tombol "Input Pembelian"
    const handleInputPembelian = (penerimaan: any) => {
        setSelectedPenerimaan(penerimaan);

        const initialItems =
            penerimaan.detail_penerimaan?.map((item: any) => {
                const poDetails =
                    penerimaan.purchase_order?.details ||
                    penerimaan.purchase_order?.detail_po ||
                    [];
                const poItem = poDetails.find(
                    (d: any) => d.id_bahan === item.id_bahan,
                );
                const hargaPO = Number(
                    poItem?.harga_satuan || poItem?.harga || 0,
                );

                return {
                    id_detail_penerimaan: item.id_detail_penerimaan,
                    id_bahan: item.id_bahan,
                    kodeBahan: item.bahan?.kode_bahan || "-",
                    namaBahan: item.bahan?.nama_bahan || "-",
                    qty: item.qty_diterima,
                    satuan:
                        item.bahan?.satuan_bahan || item.bahan?.satuan || "-",
                    hargaPO: hargaPO,
                    harga_aktual: hargaPO,
                    subtotal: item.qty_diterima * hargaPO,
                };
            }) || [];

        const initialSubtotal = initialItems.reduce(
            (sum: number, item: any) => sum + Number(item.subtotal),
            0,
        );

        setForm({
            ...form,
            id_penerimaan: penerimaan.id_penerimaan,
            no_faktur: "",
            tanggal_transaksi: new Date().toISOString().split("T")[0],
            metode_pembayaran: "Tunai",
            jatuh_tempo: "",
            subtotal_barang: initialSubtotal,
            diskon: 0,
            ongkos_kirim: 0,
            pajak: 0,
            total_tagihan: initialSubtotal,
            items: initialItems,
        });

        setShowForm(true);
    };

    // 2. Update Harga Aktual per Item
    const handleUpdateItem = (index: number, value: string) => {
        const newItems = [...form.items];
        const harga = Number(value) || 0;
        newItems[index].harga_aktual = harga;
        newItems[index].subtotal = harga * newItems[index].qty;
        setForm({ ...form, items: newItems });
    };

    // 3. Kalkulasi Otomatis (Subtotal & Total)
    useEffect(() => {
        const subtotalBarang = form.items.reduce(
            (sum, item) => sum + Number(item.subtotal),
            0,
        );
        const total =
            subtotalBarang -
            Number(form.diskon) +
            Number(form.ongkos_kirim) +
            Number(form.pajak);

        setForm((prev) => ({
            ...prev,
            subtotal_barang: subtotalBarang,
            total_tagihan: total,
        }));
    }, [form.items, form.diskon, form.ongkos_kirim, form.pajak]);

    // 4. Submit Data
    // 4. Submit Data
    const handleSubmit = () => {
        // Pengecekan dasar di frontend
        if (!form.no_faktur) {
            alert("No Faktur tidak boleh kosong!");
            return;
        }

        router.post(route("transaksi-pembelian.store"), form, {
            onSuccess: () => {
                setShowForm(false);
                alert("Transaksi berhasil dicatat ke keuangan!");
            },
            onError: (errors) => {
                console.error("Error dari Laravel:", errors);
                // Menangkap pesan error asli dari backend
                const errorMessages = Object.values(errors).join("\n- ");
                alert(
                    "Data ditolak oleh database karena:\n\n- " + errorMessages,
                );
            },
        });
    };
    // 5. Hitung Total PO (Pengaman jika Kolom Header kosong)
    const hitungTotalPO = (p: any) => {
        const po = p.purchaseOrder || p.purchase_order;
        if (!po) return 0;

        const totalDariHeader =
            po.total_po ?? po.total ?? po.total_harga ?? po.grand_total;
        if (totalDariHeader && Number(totalDariHeader) > 0) {
            return Number(totalDariHeader);
        }

        const detailPo = po.details || po.detail_po || po.detailPo;
        if (detailPo && Array.isArray(detailPo)) {
            return detailPo.reduce((sum: number, item: any) => {
                const qty = item.qty ?? item.qty_po ?? item.jumlah ?? 0;
                const harga =
                    item.harga ?? item.harga_satuan ?? item.harga_po ?? 0;
                return sum + Number(qty) * Number(harga);
            }, 0);
        }

        return 0;
    };

    // 6. FUNGSI CETAK (PRINT) INVOICE
    const handlePrint = (transaksi: any) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert("Popup diblokir oleh browser. Izinkan popup untuk mencetak.");
            return;
        }

        const itemsDetail =
            transaksi.details ||
            transaksi.detail_transaksi ||
            transaksi.items ||
            [];
        const totalTagihan =
            transaksi.total_tagihan ||
            transaksi.grand_total ||
            transaksi.total ||
            0;

        let itemsHtml = "";
        itemsDetail.forEach((item: any) => {
            const kode = item.bahan?.kode_bahan || "-";
            const nama = item.bahan?.nama_bahan || item.namaBahan || "-";
            const qty = item.qty || item.qty_diterima || 0;
            const satuan = item.bahan?.satuan_bahan || item.satuan || "-";
            const harga = formatCurrency(item.harga_aktual || 0);
            const subtotal = formatCurrency(item.subtotal || 0);

            itemsHtml += `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${kode}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${nama}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${qty} ${satuan}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${harga}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${subtotal}</td>
            </tr>
        `;
        });

        // Desain Template HTML untuk Print
        const htmlContent = `
        <html>
            <head>
                <title>Cetak Transaksi - ${transaksi.no_faktur}</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: auto; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #b91c1c; padding-bottom: 15px; }
                    .header h2 { margin: 0; color: #b91c1c; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;}
                    .header p { margin: 5px 0 0; color: #666; font-size: 14px;}

                    .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f9fafb; padding: 15px; border-radius: 8px; }
                    .info-box p { margin: 6px 0; font-size: 14px; }
                    .info-box strong { display: inline-block; width: 140px; color: #4b5563; }

                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
                    th { background-color: #f3f4f6; padding: 12px 10px; text-align: left; border-bottom: 2px solid #d1d5db; color: #374151; }
                    .text-right { text-align: right; }

                    .total-section { margin-left: auto; width: 350px; background: #f9fafb; padding: 15px; border-radius: 8px; }
                    .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;}
                    .total-row:last-child { border-bottom: none; }
                    .total-row.grand { font-weight: bold; font-size: 18px; padding-top: 15px; margin-top: 5px; border-top: 2px solid #b91c1c; color: #b91c1c;}

                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }

                    @media print {
                        body { padding: 0; margin: 0; max-width: 100%; }
                        button { display: none; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>BUKTI TRANSAKSI PEMBELIAN</h2>
                    <p>Faktur Tagihan: <strong>${transaksi.no_faktur}</strong></p>
                </div>

                <div class="info-grid">
                    <div class="info-box">
                        <p><strong>Tanggal Transaksi</strong>: ${new Date(transaksi.tanggal_transaksi).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
                        <p><strong>No. Penerimaan</strong>: ${transaksi.penerimaan?.no_penerimaan || "-"}</p>
                        <p><strong>No. PO</strong>: ${transaksi.penerimaan?.purchase_order?.no_po || "-"}</p>
                    </div>
                    <div class="info-box">
                        <p><strong>Supplier</strong>: ${transaksi.penerimaan?.purchase_order?.supplier?.nama_supplier || "-"}</p>
                        <p><strong>Metode Pembayaran</strong>: ${transaksi.metode_pembayaran}</p>
                        ${transaksi.jatuh_tempo ? `<p><strong>Jatuh Tempo</strong>: ${new Date(transaksi.jatuh_tempo).toLocaleDateString("id-ID")}</p>` : ""}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Kode Bahan</th>
                            <th>Nama Bahan</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Harga Aktual</th>
                            <th class="text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="total-section">
                    <div class="total-row">
                        <span>Subtotal Barang</span>
                        <span>${formatCurrency(transaksi.subtotal_barang)}</span>
                    </div>
                    <div class="total-row">
                        <span>Diskon</span>
                        <span>(${formatCurrency(transaksi.diskon)})</span>
                    </div>
                    <div class="total-row">
                        <span>Biaya Kirim</span>
                        <span>${formatCurrency(transaksi.ongkos_kirim)}</span>
                    </div>
                    <div class="total-row">
                        <span>Pajak</span>
                        <span>${formatCurrency(transaksi.pajak)}</span>
                    </div>
                    <div class="total-row grand">
                        <span>TOTAL TAGIHAN</span>
                        <span>${formatCurrency(totalTagihan)}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>Dicetak otomatis oleh Sistem Informasi pada ${new Date().toLocaleString("id-ID")}</p>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    }
                </script>
            </body>
        </html>
    `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    // --- Filter Pencarian Riwayat ---
    const filteredTransaksi = riwayatTransaksi.filter((t: any) => {
        const noFaktur = (t.no_faktur || "").toLowerCase();
        const supplier = (
            t.penerimaan?.purchase_order?.supplier?.nama_supplier || ""
        ).toLowerCase();
        const noPO = (t.penerimaan?.purchase_order?.no_po || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        return (
            noFaktur.includes(search) ||
            supplier.includes(search) ||
            noPO.includes(search)
        );
    });

    // ── VIEW 1: MODAL DETAIL TRANSAKSI ─────────────────────────────────────────
    if (showDetail && selectedTransaksi) {
        const d = selectedTransaksi;
        const itemsDetail = d.details || d.detail_transaksi || d.items || [];
        const detailTotalTagihan =
            d.total_tagihan || d.grand_total || d.total || 0;

        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-red-800">
                            Detail Transaksi Pembelian
                        </h3>
                        <div className="flex gap-2">
                            {/* Tombol Print di Detail Modal */}
                            <button
                                onClick={() => handlePrint(d)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Printer className="w-4 h-4" /> Cetak
                            </button>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    No. Faktur (Invoice)
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {d.no_faktur}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Tanggal Transaksi
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {new Date(
                                        d.tanggal_transaksi,
                                    ).toLocaleDateString("id-ID")}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    No. Penerimaan
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {d.penerimaan?.no_penerimaan || "-"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    No. PO
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {d.penerimaan?.purchase_order?.no_po || "-"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Supplier
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {d.penerimaan?.purchase_order?.supplier
                                        ?.nama_supplier || "-"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Metode Pembayaran
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {d.metode_pembayaran}
                                </p>
                            </div>

                            {d.jatuh_tempo && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Tanggal Jatuh Tempo
                                    </label>
                                    <p className="text-gray-800 font-medium">
                                        {new Date(
                                            d.jatuh_tempo,
                                        ).toLocaleDateString("id-ID", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pt-6 overflow-x-auto">
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
                                            Qty Diterima
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                            Satuan
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                            Harga Aktual
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsDetail.map(
                                        (item: any, idx: number) => (
                                            <tr
                                                key={idx}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                    {item.bahan?.kode_bahan ||
                                                        "-"}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {item.bahan?.nama_bahan ||
                                                        item.namaBahan ||
                                                        "-"}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                    {item.qty ||
                                                        item.qty_diterima ||
                                                        0}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                                    {item.bahan?.satuan_bahan ||
                                                        item.satuan ||
                                                        "-"}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                    {formatCurrency(
                                                        item.harga_aktual || 0,
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-right font-semibold">
                                                    {formatCurrency(
                                                        item.subtotal || 0,
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    )}

                                    <tr className="bg-gray-50">
                                        <td
                                            colSpan={5}
                                            className="py-2 px-4 text-sm font-semibold text-gray-700 text-right"
                                        >
                                            Subtotal
                                        </td>
                                        <td className="py-2 px-4 text-sm font-semibold text-gray-700 text-right">
                                            {formatCurrency(d.subtotal_barang)}
                                        </td>
                                    </tr>
                                    {Number(d.diskon) > 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-2 px-4 text-sm text-gray-700 text-right"
                                            >
                                                Diskon
                                            </td>
                                            <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                                ({formatCurrency(d.diskon)})
                                            </td>
                                        </tr>
                                    )}
                                    {Number(d.ongkos_kirim) > 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-2 px-4 text-sm text-gray-700 text-right"
                                            >
                                                Biaya Kirim
                                            </td>
                                            <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                                {formatCurrency(d.ongkos_kirim)}
                                            </td>
                                        </tr>
                                    )}
                                    {Number(d.pajak) > 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-2 px-4 text-sm text-gray-700 text-right"
                                            >
                                                Pajak
                                            </td>
                                            <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                                {formatCurrency(d.pajak)}
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="bg-red-50 border-b-2 border-red-200">
                                        <td
                                            colSpan={5}
                                            className="py-3 px-4 text-sm font-bold text-gray-800 text-right"
                                        >
                                            Total Tagihan
                                        </td>
                                        <td className="py-3 px-4 text-sm font-bold text-red-700 text-right">
                                            {formatCurrency(detailTotalTagihan)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── VIEW 2: FORM TRANSAKSI BARU ──────────────────────────────────────────
    if (showForm) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-red-800">
                            Form Transaksi Pembelian
                        </h3>
                        <button
                            onClick={() => setShowForm(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {/* No Faktur - User Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No. Faktur (Invoice){" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Masukkan nomor faktur/invoice..."
                                    value={form.no_faktur}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            no_faktur: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-red-400"
                                />
                            </div>

                            {/* No Penerimaan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No. Penerimaan
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={
                                        selectedPenerimaan?.no_penerimaan || ""
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-semibold"
                                />
                            </div>

                            {/* No PO */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No. PO
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={
                                        selectedPenerimaan?.purchase_order
                                            ?.no_po || ""
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                />
                            </div>

                            {/* Tanggal Transaksi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Transaksi{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={form.tanggal_transaksi}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            tanggal_transaksi: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                />
                            </div>

                            {/* Supplier */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Supplier
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={
                                        selectedPenerimaan?.purchase_order
                                            ?.supplier?.nama_supplier || ""
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                />
                            </div>

                            {/* Metode Pembayaran */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Metode Pembayaran{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.metode_pembayaran}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            metode_pembayaran: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white"
                                >
                                    <option value="Tunai">Tunai</option>
                                    <option value="Kredit">Kredit</option>
                                </select>
                            </div>

                            {/* Tanggal Jatuh Tempo */}
                            {form.metode_pembayaran === "Kredit" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal Jatuh Tempo{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={form.jatuh_tempo}
                                        min={form.tanggal_transaksi}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                jatuh_tempo: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Tabel Detail Pemakaian & Harga Aktual */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold text-gray-800">
                                    Detail Item Pembelian
                                </h4>
                                <p className="text-xs text-gray-500">
                                    Harga default disalin dari PO. Ubah jika
                                    faktur tagihan aktual berbeda.
                                </p>
                            </div>

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
                                                Qty Diterima
                                            </th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                                Satuan
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                                Harga PO
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                                Harga Aktual
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {form.items.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="py-8 text-center text-gray-400 italic"
                                                >
                                                    Tidak ada detail bahan untuk
                                                    penerimaan ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            form.items.map((item, idx) => (
                                                <tr
                                                    key={idx}
                                                    className="border-b border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                        {item.kodeBahan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        {item.namaBahan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                        {item.qty}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                                        {item.satuan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-500 text-right">
                                                        {formatCurrency(
                                                            item.hargaPO,
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                item.harga_aktual
                                                            }
                                                            onChange={(e) =>
                                                                handleUpdateItem(
                                                                    idx,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-32 px-2 py-1 border border-gray-200 rounded text-right outline-none focus:border-red-400 text-sm"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 text-right font-semibold">
                                                        {formatCurrency(
                                                            item.subtotal,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}

                                        {/* Kalkulasi Bagian Bawah Form */}
                                        {form.items.length > 0 && (
                                            <>
                                                <tr className="bg-gray-50">
                                                    <td
                                                        colSpan={6}
                                                        className="py-2 px-4 text-sm font-semibold text-gray-700 text-right"
                                                    >
                                                        Subtotal Barang
                                                    </td>
                                                    <td className="py-2 px-4 text-sm font-semibold text-gray-700 text-right">
                                                        {formatCurrency(
                                                            form.subtotal_barang,
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-gray-100">
                                                    <td
                                                        colSpan={6}
                                                        className="py-2 px-4 text-sm text-gray-700 text-right"
                                                    >
                                                        Diskon
                                                    </td>
                                                    <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <span className="text-gray-400 text-xs">
                                                                Rp
                                                            </span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    form.diskon ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    setForm({
                                                                        ...form,
                                                                        diskon: Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    })
                                                                }
                                                                className="w-28 px-2 py-1 border border-gray-200 rounded text-right outline-none focus:border-red-400 text-sm"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-gray-100">
                                                    <td
                                                        colSpan={6}
                                                        className="py-2 px-4 text-sm text-gray-700 text-right"
                                                    >
                                                        Biaya Kirim / Ongkir
                                                    </td>
                                                    <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <span className="text-gray-400 text-xs">
                                                                Rp
                                                            </span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    form.ongkos_kirim ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    setForm({
                                                                        ...form,
                                                                        ongkos_kirim:
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                    })
                                                                }
                                                                className="w-28 px-2 py-1 border border-gray-200 rounded text-right outline-none focus:border-red-400 text-sm"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-gray-100">
                                                    <td
                                                        colSpan={6}
                                                        className="py-2 px-4 text-sm text-gray-700 text-right"
                                                    >
                                                        Pajak
                                                    </td>
                                                    <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <span className="text-gray-400 text-xs">
                                                                Rp
                                                            </span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    form.pajak ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    setForm({
                                                                        ...form,
                                                                        pajak: Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    })
                                                                }
                                                                className="w-28 px-2 py-1 border border-gray-200 rounded text-right outline-none focus:border-red-400 text-sm"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className="bg-red-50 border-b-2 border-red-200">
                                                    <td
                                                        colSpan={6}
                                                        className="py-3 px-4 text-sm font-bold text-gray-800 text-right"
                                                    >
                                                        Total Tagihan Transaksi
                                                    </td>
                                                    <td className="py-3 px-4 text-sm font-bold text-red-700 text-right">
                                                        {formatCurrency(
                                                            form.total_tagihan,
                                                        )}
                                                    </td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={form.items.length === 0}
                                className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:opacity-40"
                            >
                                Simpan Transaksi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── VIEW 3: HALAMAN UTAMA (LIST RIWAYAT & PENDING) ───────────────────────
    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-red-800">
                    Transaksi Pembelian
                </h2>
                <p className="text-sm text-red-800 mt-1">
                    Catat tagihan dan transaksi pembelian aktual berdasarkan PO
                    & Penerimaan Bahan
                </p>
            </div>

            {/* Tabel 1: Daftar Penerimaan yang Belum Ditransaksikan */}
            <div className="bg-white rounded-lg shadow border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-red-800">
                        Daftar Penerimaan Siap Diinput Transaksi
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Penerimaan bahan yang telah diverifikasi dan belum
                        dibuatkan transaksi tagihan (Invoice)
                    </p>
                </div>
                <div className="p-6 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    No. Penerimaan
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    No. PO
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Supplier
                                </th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                    Total PO
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {penerimaanPending.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-8 text-center text-sm text-gray-400 italic"
                                    >
                                        Semua penerimaan sudah diinput transaksi
                                        / Tidak ada penerimaan pending.
                                    </td>
                                </tr>
                            ) : (
                                penerimaanPending.map((p: any) => {
                                    const noPO = p.purchase_order?.no_po || "-";
                                    const supplierName =
                                        p.purchase_order?.supplier
                                            ?.nama_supplier || "-";
                                    const totalPO = hitungTotalPO(p);

                                    return (
                                        <tr
                                            key={p.id_penerimaan}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                                                {p.no_penerimaan}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                                                {noPO}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {supplierName}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">
                                                {formatCurrency(totalPO)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() =>
                                                        handleInputPembelian(p)
                                                    }
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-medium transition-colors mx-auto"
                                                >
                                                    <ClipboardList className="w-3.5 h-3.5" />
                                                    Input Transaksi
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabel 2: Riwayat Transaksi */}
            <div className="bg-white rounded-lg shadow border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-red-800">
                        Riwayat Transaksi Pembelian
                    </h3>
                </div>
                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari No Faktur, Supplier, atau No PO..."
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
                                        No. Faktur (Inv)
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Tanggal
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        No. PO
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        No. Penerimaan
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Supplier
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Metode
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Total Tagihan
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransaksi.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-8 text-center text-gray-400 italic text-sm"
                                        >
                                            Belum ada riwayat transaksi
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransaksi.map((t: any) => {
                                        const tableTotalTagihan =
                                            t.total_tagihan ||
                                            t.grand_total ||
                                            t.total ||
                                            0;

                                        return (
                                            <tr
                                                key={t.id_transaksi || t.id}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                    {t.no_faktur}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {new Date(
                                                        t.tanggal_transaksi,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                    {t.penerimaan
                                                        ?.purchase_order
                                                        ?.no_po || "-"}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {t.penerimaan
                                                        ?.no_penerimaan || "-"}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {t.penerimaan
                                                        ?.purchase_order
                                                        ?.supplier
                                                        ?.nama_supplier || "-"}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {t.metode_pembayaran}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">
                                                    {formatCurrency(
                                                        tableTotalTagihan,
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* TOMBOL PRINT BARU */}
                                                        <button
                                                            onClick={() =>
                                                                handlePrint(t)
                                                            }
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Cetak Transaksi"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTransaksi(
                                                                    t,
                                                                );
                                                                setShowDetail(
                                                                    true,
                                                                );
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState } from "react";
import { router } from "@inertiajs/react";
import { Search, Eye, ShoppingCart, Printer, Pencil } from "lucide-react";

// --- INTERFACES TYPESCRIPT ---
interface Supplier {
    id: number;
    kode_supplier: string;
    nama_supplier: string;
    kontak_supplier: string;
    alamat_supplier: string;
}

interface Bahan {
    id_bahan: number;
    kode_bahan: string;
    nama_bahan: string;
    satuan_bahan: string;
    harga_beli: number;
}

interface DetailPP {
    id_detail_pp: number;
    id_bahan: number;
    qty_kebutuhan: number;
    qty_diminta: number;
    bahan: Bahan;
}

interface PermintaanPembelian {
    id_pp: number;
    no_pp: string;
    tgl_pp: string;
    jenis_bahan: "baku" | "penolong" | "tambahan";
    status: "diajukan" | "disetujui";
    catatan: string | null;
    detail_jadwal: {
        kode_produksi: string;
        produk: { nama_produk: string };
    } | null;
    details: DetailPP[];
}

interface DetailPO {
    id_detail_po: number;
    id_bahan: number;
    qty_po: number;
    harga_satuan: number;
    subtotal: number;
    bahan: Bahan;
}

interface PurchaseOrder {
    id_po: number;
    no_po: string;
    tgl_po: string;
    metode_beli: "tunai" | "tempo_30";
    catatan: string | null;
    status: "diajukan" | "perlu_revisi" | "disetujui";
    catatan_finance: string | null;
    permintaan: PermintaanPembelian;
    supplier: Supplier;
    details: DetailPO[];
}

interface Props {
    purchaseOrders: PurchaseOrder[];
    permintaans: PermintaanPembelian[];
    suppliers: Supplier[];
    nextNoPo: string;
}

export default function PesananPembelian({
    purchaseOrders = [],
    permintaans = [],
    suppliers = [],
    nextNoPo,
}: Props) {
    // State manajemen tampilan halaman
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedPesanan, setSelectedPesanan] =
        useState<PurchaseOrder | null>(null);

    // State pencarian data tabel
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermPermintaan, setSearchTermPermintaan] = useState("");

    // State local untuk Form Pembuatan PO / Revisi PO
    const [selectedPP, setSelectedPP] = useState<PermintaanPembelian | null>(
        null,
    );
    const [tglPo, setTglPo] = useState(new Date().toISOString().split("T")[0]);
    const [selectedSupplierId, setSelectedSupplierId] = useState("");
    const [selectedTermin, setSelectedTermin] = useState<"tunai" | "tempo_30">(
        "tunai",
    );
    const [catatan, setCatatan] = useState("");

    // Melacak nomor PO dan ID PO yang sedang diedit agar sinkron dengan Figma
    const [editPoId, setEditPoId] = useState<number | null>(null);
    const [editNoPo, setEditNoPo] = useState<string>("");

    // State local reaktif khusus untuk baris item barang belanjaan
    const [formDetails, setFormDetails] = useState<
        {
            id_bahan: number;
            kode_bahan: string;
            nama_bahan: string;
            satuan_bahan: string;
            qty: number;
            harga: number;
        }[]
    >([]);

    // Format Mata Uang Rupiah IDR
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    // Menangani perubahan input pengetikan Qty & Harga secara Real-Time
    const handleItemChange = (
        idBahan: number,
        field: "qty" | "harga",
        value: number,
    ) => {
        setFormDetails((prev) =>
            prev.map((item) =>
                item.id_bahan === idBahan ? { ...item, [field]: value } : item,
            ),
        );
    };

    // Handler memicu form pembuatan PO berdasarkan PP terpilih
    const handleBuatPembelian = (permintaan: PermintaanPembelian) => {
        setSelectedPP(permintaan);
        setTglPo(new Date().toISOString().split("T")[0]);
        setSelectedSupplierId("");
        setSelectedTermin("tunai");
        setCatatan("");
        setEditPoId(null);
        setEditNoPo("");

        // Set item bawaan dari PR asal
        setFormDetails(
            (permintaan.details || []).map((d) => ({
                id_bahan: d.id_bahan,
                kode_bahan: d.bahan?.kode_bahan || "",
                nama_bahan: d.bahan?.nama_bahan || "",
                satuan_bahan: d.bahan?.satuan_bahan || "",
                qty: d.qty_diminta,
                harga: d.bahan?.harga_beli || 0,
            })),
        );
        setShowForm(true);
    };

    // Handler memicu form revisi/edit PO
    const handleEdit = (pesanan: PurchaseOrder) => {
        if (!pesanan.permintaan) {
            alert("Data permintaan tidak ditemukan, tidak dapat mengedit.");
            return;
        }

        setSelectedPP(pesanan.permintaan);
        setTglPo(pesanan.tgl_po);
        setSelectedSupplierId(pesanan.supplier?.id?.toString() || "");
        setSelectedTermin(pesanan.metode_beli || "tunai");
        setCatatan(pesanan.catatan || "");

        // SINKRONISASI FIGMA: Pasang No. PO asli dokumen yang sedang diedit
        setEditPoId(pesanan.id_po);
        setEditNoPo(pesanan.no_po);

        // Ambil data Qty dan Harga terakhir yang tersimpan di PO, bukan balik ke PR awal
        setFormDetails(
            (pesanan.details || []).map((poDetail) => ({
                id_bahan: poDetail.id_bahan,
                kode_bahan: poDetail.bahan?.kode_bahan || "",
                nama_bahan: poDetail.bahan?.nama_bahan || "",
                satuan_bahan: poDetail.bahan?.satuan_bahan || "",
                qty: poDetail.qty_po,
                harga: poDetail.harga_satuan,
            })),
        );
        setShowForm(true);
    };

    // Handler melihat detail PO
    const handleDetail = (pesanan: PurchaseOrder) => {
        setSelectedPesanan(pesanan);
        setShowDetail(true);
    };

    // Reset form & batal
    const handleCancel = () => {
        setShowForm(false);
        setShowDetail(false);
        setSelectedPesanan(null);
        setSelectedPP(null);
        setTglPo(new Date().toISOString().split("T")[0]);
        setSelectedSupplierId("");
        setSelectedTermin("tunai");
        setCatatan("");
        setEditPoId(null);
        setEditNoPo("");
        setFormDetails([]);
    };

    // Mengirim data form PO baru / Revisi ke Backend
    const handleFormSubmit = () => {
        if (!selectedPP) return;
        if (!selectedSupplierId) return alert("Supplier harus dipilih!");

        if (editPoId) {
            // --- SAAT REVISI: Bersih dari manipulasi DOM ---
            const payload = {
                id_pp: selectedPP.id_pp,
                tgl_po: tglPo,
                id_supplier: selectedSupplierId,
                metode_beli: selectedTermin,
                catatan: catatan,
                items: formDetails.map((item) => ({
                    id_bahan: item.id_bahan,
                    qty: item.qty,
                    harga: item.harga,
                })),
            };

            router.put(`/pembelian/pesanan/${editPoId}`, payload, {
                onSuccess: () => {
                    alert("Revisi PO berhasil disimpan & diajukan ulang!");
                    handleCancel();
                },
                onError: (errors) => {
                    alert(
                        "Gagal menyimpan revisi! Alasan: " +
                            JSON.stringify(errors),
                    );
                },
            });
        } else {
            // --- SAAT BUAT BARU ---
            const payload = {
                id_pp: selectedPP.id_pp,
                tgl_po: tglPo,
                id_supplier: selectedSupplierId,
                metode_beli: selectedTermin,
                catatan: catatan,
            };

            router.post("/pembelian/pesanan", payload, {
                onSuccess: () => {
                    alert("Pesanan Pembelian (PO) baru berhasil dibuat!");
                    handleCancel();
                },
                onError: (errors) => {
                    alert(
                        "Gagal membuat PO baru! Alasan: " +
                            JSON.stringify(errors),
                    );
                },
            });
        }
    };

    // Fungsi Cetak Window Pop-Up Purchase Order
    const handleCetak = (pesanan: PurchaseOrder) => {
        const tanggalFormatted = new Date(pesanan.tgl_po).toLocaleDateString(
            "id-ID",
            { day: "2-digit", month: "long", year: "numeric" },
        );
        const totalPO = pesanan.details.reduce(
            (sum, item) => sum + item.qty_po * item.harga_satuan,
            0,
        );
        const itemRows = pesanan.details
            .map(
                (item) => `
      <tr>
        <td style="border:1px solid #ccc;padding:6px 10px;">${item.bahan?.kode_bahan || "-"}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;">${item.bahan?.nama_bahan || "-"}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;text-align:right;">${item.qty_po}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;text-align:center;">${item.bahan?.satuan_bahan || ""}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;text-align:right;">${formatCurrency(item.harga_satuan)}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;text-align:right;">${formatCurrency(item.qty_po * item.harga_satuan)}</td>
      </tr>`,
            )
            .join("");

        const win = window.open("", "_blank", "width=900,height=700");
        if (!win) return;
        win.document
            .write(`<!DOCTYPE html><html><head><title>Cetak PO - ${pesanan.no_po}</title>
      <style>body{font-family:Arial,sans-serif;font-size:13px;margin:30px;}h2{color:#7f1d1d;margin-bottom:4px;}
      table{border-collapse:collapse;width:100%;margin-top:16px;}th{text-align:left;background:#f3f4f6;border:1px solid #ccc;padding:8px 10px;}
      .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin-bottom:16px;}
      .info-item label{font-size:11px;color:#666;display:block;}.info-item p{font-weight:600;margin:2px 0;}
      .footer{margin-top:40px;display:flex;justify-content:space-between;}
      .ttd{text-align:center;width:200px;}.ttd .line{margin-top:60px;border-top:1px solid #333;}
      @media print{button{display:none!important;}}</style></head><body>
      <div style="text-align:center;margin-bottom:24px;">
        <h2>PURCHASE ORDER - CV New Citra</h2>
        <p style="margin:4px 0;color:#555;">Sistem Informasi Manajemen Pembelian</p>
      </div>
      <hr style="border:0;border-top:2px solid #7f1d1d;margin-bottom:20px;"/>
      <div class="info-grid">
        <div>
          <div class="info-item"><label>No. Purchase Order</label><p>${pesanan.no_po}</p></div>
          <div class="info-item"><label>Tanggal PO</label><p>${tanggalFormatted}</p></div>
          <div class="info-item"><label>No. Permintaan (PR)</label><p>${pesanan.permintaan?.no_pp || "-"}</p></div>
        </div>
        <div>
          <div class="info-item"><label>Supplier</label><p>${pesanan.supplier?.nama_supplier || "-"}</p></div>
          <div class="info-item"><label>Termin Pembayaran</label><p>${pesanan.metode_beli === "tunai" ? "Tunai" : "Tempo 30 Hari"}</p></div>
          <div class="info-item"><label>Status Dokumen</label><p>${pesanan.status.toUpperCase()}</p></div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Kode Bahan</th>
            <th>Nama Bahan</th>
            <th style="text-align:right;">Qty</th>
            <th style="text-align:center;">Satuan</th>
            <th style="text-align:right;">Harga Satuan</th>
            <th style="text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          <tr style="background:#f9fafb;font-weight:bold;">
            <td colSpan="5" style="border:1px solid #ccc;padding:8px 10px;text-align:right;">Total PO</td>
            <td style="border:1px solid #ccc;padding:8px 10px;text-align:right;">${formatCurrency(totalPO)}</td>
          </tr>
        </tbody>
      </table>
      <div class="footer">
        <div class="ttd">
          <p>Dibuat Oleh,</p>
          <div class="line"></div>
          <p>Purchasing Staff</p>
        </div>
        <div class="ttd">
          <p>Disetujui Oleh,</p>
          <div class="line"></div>
          <p>Finance Manager</p>
        </div>
      </div>
      <script>window.onload = function(){ window.print(); }</script>
      </body></html>`);
        win.document.close();
    };

    // Filter List Data Pencarian
    const filteredPermintaan = permintaans.filter(
        (item) =>
            item.no_pp
                .toLowerCase()
                .includes(searchTermPermintaan.toLowerCase()) ||
            item.jenis_bahan
                .toLowerCase()
                .includes(searchTermPermintaan.toLowerCase()),
    );

    const filteredPO = purchaseOrders.filter(
        (po) =>
            po.no_po.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.supplier?.nama_supplier
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    // --- RENDERING TAMPILAN FORM ---
    if (showForm) {
        return (
            <div className="p-6 bg-gray-50/50 min-h-screen">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-white">
                        <h3 className="text-lg font-bold text-gray-800 tracking-wide">
                            {editPoId
                                ? "Form Revisi Pesanan Pembelian"
                                : "Form Pesanan Pembelian"}
                        </h3>
                    </div>
                    <div className="p-6">
                        {/* Grid Identitas Form Utama */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    No. Pembelian
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={editPoId ? editNoPo : nextNoPo}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium shadow-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={tglPo}
                                    onChange={(e) => setTglPo(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium shadow-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    No. Permintaan (PR)
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={selectedPP?.no_pp || ""}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium shadow-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Jenis Bahan
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={
                                        selectedPP?.jenis_bahan === "baku"
                                            ? "Bahan Baku"
                                            : selectedPP?.jenis_bahan ===
                                                "penolong"
                                              ? "Bahan Penolong"
                                              : "Bahan Tambahan"
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium shadow-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Supplier
                                </label>
                                <select
                                    value={selectedSupplierId}
                                    onChange={(e) =>
                                        setSelectedSupplierId(e.target.value)
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium shadow-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all bg-white"
                                >
                                    <option value="">
                                        -- Pilih Supplier --
                                    </option>
                                    {suppliers.map((supplier) => (
                                        <option
                                            key={supplier.id}
                                            value={supplier.id}
                                        >
                                            {supplier.nama_supplier}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Termin Pembayaran
                                </label>
                                <select
                                    value={selectedTermin}
                                    onChange={(e) =>
                                        setSelectedTermin(
                                            e.target.value as
                                                | "tunai"
                                                | "tempo_30",
                                        )
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium shadow-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all bg-white"
                                >
                                    <option value="tunai">Tunai</option>
                                    <option value="tempo_30">
                                        Tempo 30 Hari
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Catatan
                            </label>
                            <textarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium shadow-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-gray-400"
                                placeholder="Tambahkan catatan khusus purchasing..."
                            ></textarea>
                        </div>

                        {/* Bagian Tabel Daftar Item Pembelian Figma Grade */}
                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="text-sm font-bold text-gray-800 mb-4 tracking-wide">
                                Daftar Item Pembelian
                            </h4>
                            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                                <table className="w-full text-left border-collapse bg-white">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Kode Bahan
                                            </th>
                                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Nama Bahan
                                            </th>
                                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-32">
                                                Qty
                                            </th>
                                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center w-24">
                                                Satuan
                                            </th>
                                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-44">
                                                Harga Satuan
                                            </th>
                                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-40">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {formDetails.map((item) => {
                                            const subtotalRow =
                                                item.qty * item.harga;
                                            return (
                                                <tr
                                                    key={item.id_bahan}
                                                    className="hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <td className="py-3.5 px-4 text-sm font-semibold text-gray-700">
                                                        {item.kode_bahan}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-sm text-gray-600">
                                                        {item.nama_bahan}
                                                    </td>

                                                    {/* KOLOM REAKTIF INPUT QTY */}
                                                    <td className="py-2 px-4 text-right">
                                                        {editPoId ? (
                                                            <input
                                                                type="number"
                                                                value={
                                                                    item.qty ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleItemChange(
                                                                        item.id_bahan,
                                                                        "qty",
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                                min="1"
                                                                className="w-full px-3 py-1.5 text-right border border-gray-300 rounded-lg bg-white text-gray-800 text-sm font-medium shadow-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-gray-700 font-semibold px-2">
                                                                {item.qty}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-3.5 px-4 text-sm text-gray-500 text-center font-medium">
                                                        {item.satuan_bahan}
                                                    </td>

                                                    {/* KOLOM REAKTIF INPUT HARGA */}
                                                    <td className="py-2 px-4 text-right">
                                                        {editPoId ? (
                                                            <input
                                                                type="number"
                                                                value={
                                                                    item.harga ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleItemChange(
                                                                        item.id_bahan,
                                                                        "harga",
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                                min="0"
                                                                className="w-full px-3 py-1.5 text-right border border-gray-300 rounded-lg bg-white text-gray-800 text-sm font-medium shadow-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-gray-600 px-2">
                                                                {formatCurrency(
                                                                    item.harga,
                                                                )}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* SUBTOTAL LANGSUNG BERUBAH DETIK ITU JUGA */}
                                                    <td className="py-3.5 px-4 text-sm text-gray-900 text-right font-bold">
                                                        {formatCurrency(
                                                            subtotalRow,
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {/* BARIS TOTAL PO REAL-TIME SINKRON FIGMA */}
                                        <tr className="bg-gray-50/50 font-bold border-t border-gray-200">
                                            <td
                                                colSpan={5}
                                                className="py-4 px-4 text-sm font-semibold text-gray-600 text-right"
                                            >
                                                Total PO
                                            </td>
                                            <td className="py-4 px-4 text-base font-bold text-red-800 text-right">
                                                {formatCurrency(
                                                    formDetails.reduce(
                                                        (sum, item) =>
                                                            sum +
                                                            item.qty *
                                                                item.harga,
                                                        0,
                                                    ),
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Tombol Navigasi Bawah */}
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleFormSubmit}
                                className="px-5 py-2.5 bg-red-800 text-white text-sm font-semibold rounded-xl hover:bg-red-900 shadow-sm shadow-red-800/10 transition-colors"
                            >
                                {editPoId ? "Simpan Revisi" : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDERING TAMPILAN DETAIL DOKUMEN PO ---
    if (showDetail && selectedPesanan) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-red-800">
                            Detail Pesanan Pembelian
                        </h3>
                        <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                selectedPesanan.status === "disetujui"
                                    ? "bg-green-100 text-green-700"
                                    : selectedPesanan.status === "perlu_revisi"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                            {selectedPesanan.status === "disetujui"
                                ? "Disetujui"
                                : selectedPesanan.status === "perlu_revisi"
                                  ? "Perlu Revisi"
                                  : "Diajukan"}
                        </span>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase">
                                    No. Purchase Order
                                </span>
                                <span className="text-sm font-bold text-gray-800">
                                    {selectedPesanan.no_po}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase">
                                    Tanggal PO
                                </span>
                                <span className="text-sm font-semibold text-gray-800">
                                    {new Date(
                                        selectedPesanan.tgl_po,
                                    ).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase">
                                    No. Permintaan (PR)
                                </span>
                                <span className="text-sm font-semibold text-gray-800">
                                    {selectedPesanan.permintaan?.no_pp}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase">
                                    Jenis Bahan
                                </span>
                                <span className="text-sm font-semibold text-gray-800">
                                    {selectedPesanan.permintaan?.jenis_bahan ===
                                    "baku"
                                        ? "Bahan Baku"
                                        : selectedPesanan.permintaan
                                                ?.jenis_bahan === "penolong"
                                          ? "Bahan Penolong"
                                          : "Bahan Tambahan"}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase">
                                    Supplier
                                </span>
                                <span className="text-sm font-semibold text-gray-800">
                                    {selectedPesanan.supplier?.nama_supplier}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase">
                                    Termin Pembayaran
                                </span>
                                <span className="text-sm font-semibold text-gray-800">
                                    {selectedPesanan.metode_beli === "tunai"
                                        ? "Tunai"
                                        : "Tempo 30 Hari"}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-xs font-medium text-gray-500 uppercase">
                                    Catatan Purchasing
                                </span>
                                <span className="text-sm text-gray-700">
                                    {selectedPesanan.catatan || "-"}
                                </span>
                            </div>
                        </div>

                        {selectedPesanan.status === "perlu_revisi" && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <span className="block text-xs font-bold text-red-800 uppercase mb-1">
                                    Catatan Keuangan (Alasan Revisi)
                                </span>
                                <p className="text-sm text-red-700 font-medium">
                                    {selectedPesanan.catatan_finance ||
                                        "Tidak ada catatan."}
                                </p>
                            </div>
                        )}

                        <div className="mt-6">
                            <h4 className="text-sm font-bold text-gray-800 mb-3">
                                Daftar Item PO
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="py-2.5 px-4 text-xs font-semibold text-gray-600">
                                                Kode Bahan
                                            </th>
                                            <th className="py-2.5 px-4 text-xs font-semibold text-gray-600">
                                                Nama Bahan
                                            </th>
                                            <th className="py-2.5 px-4 text-xs font-semibold text-gray-600 text-right">
                                                Qty PO
                                            </th>
                                            <th className="py-2.5 px-4 text-xs font-semibold text-gray-600 text-center">
                                                Satuan
                                            </th>
                                            <th className="py-2.5 px-4 text-xs font-semibold text-gray-600 text-right">
                                                Harga Satuan
                                            </th>
                                            <th className="py-2.5 px-4 text-xs font-semibold text-gray-600 text-right">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPesanan.details.map((item) => (
                                            <tr
                                                key={item.id_detail_po}
                                                className="border-b border-gray-200"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {item.bahan?.kode_bahan}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {item.bahan?.nama_bahan}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-right font-medium">
                                                    {item.qty_po}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-500 text-center">
                                                    {item.bahan?.satuan_bahan}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                    {formatCurrency(
                                                        item.harga_satuan,
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-right font-semibold">
                                                    {formatCurrency(
                                                        item.qty_po *
                                                            item.harga_satuan,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-100 font-bold">
                                            <td
                                                colSpan={5}
                                                className="py-3 px-4 text-sm text-gray-800 text-right"
                                            >
                                                Total PO
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-800 text-right">
                                                {formatCurrency(
                                                    selectedPesanan.details.reduce(
                                                        (sum, item) =>
                                                            sum +
                                                            item.qty_po *
                                                                item.harga_satuan,
                                                        0,
                                                    ),
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => handleCetak(selectedPesanan)}
                                className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
                            >
                                <Printer className="w-4 h-4" /> Print
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDERING TAMPILAN INDEKS UTAMA ---
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-red-800">
                        Daftar Pesanan Pembelian
                    </h2>
                    <p className="text-sm text-red-800 mt-1">
                        Kelola data pembelian bahan
                    </p>
                </div>
            </div>

            {/* CARD 1: Daftar Permintaan untuk Buat PO */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-red-800">
                        Daftar Permintaan untuk Buat PO
                    </h3>
                </div>
                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari permintaan berdasarkan nomor atau jenis..."
                            value={searchTermPermintaan}
                            onChange={(e) =>
                                setSearchTermPermintaan(e.target.value)
                            }
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                                        No. PR
                                    </th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                                        Jenis Bahan
                                    </th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                                        Tanggal
                                    </th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                                        Status
                                    </th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPermintaan.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-4 text-center text-gray-500"
                                        >
                                            Tidak ada data permintaan pembelian
                                            yang diajukan
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPermintaan.map((permintaan) => (
                                        <tr
                                            key={permintaan.id_pp}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4 text-sm font-medium text-gray-800">
                                                {permintaan.no_pp}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {permintaan.jenis_bahan ===
                                                "baku"
                                                    ? "Bahan Baku"
                                                    : permintaan.jenis_bahan ===
                                                        "penolong"
                                                      ? "Bahan Penolong"
                                                      : "Bahan Tambahan"}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {new Date(
                                                    permintaan.tgl_pp,
                                                ).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 capitalize">
                                                    {permintaan.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() =>
                                                        handleBuatPembelian(
                                                            permintaan,
                                                        )
                                                    }
                                                    className="px-3 py-1.5 bg-red-800 text-white text-xs font-medium rounded-lg hover:bg-red-900 transition-colors flex items-center gap-1 mx-auto"
                                                >
                                                    <ShoppingCart className="w-3.5 h-3.5" />{" "}
                                                    Buat Pembelian
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* CARD 2: Daftar Pesanan Pembelian */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-red-800">
                        Daftar Pesanan Pembelian (PO)
                    </h3>
                </div>
                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nomor PO atau nama supplier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                                        No. PO
                                    </th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                                        Tanggal
                                    </th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                                        No. PR
                                    </th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                                        Supplier
                                    </th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">
                                        Total
                                    </th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-center">
                                        Status
                                    </th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPO.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-4 text-center text-gray-500"
                                        >
                                            Tidak ada data dokumen pesanan
                                            pembelian
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPO.map((pesanan) => {
                                        const totalPO = pesanan.details.reduce(
                                            (sum, item) =>
                                                sum +
                                                item.qty_po * item.harga_satuan,
                                            0,
                                        );
                                        return (
                                            <tr
                                                key={pesanan.id_po}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4 text-sm font-medium text-gray-800">
                                                    {pesanan.no_po}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {new Date(
                                                        pesanan.tgl_po,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {pesanan.permintaan?.no_pp}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {
                                                        pesanan.supplier
                                                            ?.nama_supplier
                                                    }
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-right font-semibold">
                                                    {formatCurrency(totalPO)}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            pesanan.status ===
                                                            "disetujui"
                                                                ? "bg-green-100 text-green-700"
                                                                : pesanan.status ===
                                                                    "perlu_revisi"
                                                                  ? "bg-red-100 text-red-700"
                                                                  : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                    >
                                                        {pesanan.status ===
                                                        "disetujui"
                                                            ? "Disetujui"
                                                            : pesanan.status ===
                                                                "perlu_revisi"
                                                              ? "Perlu Revisi"
                                                              : "Diajukan"}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleDetail(
                                                                    pesanan,
                                                                )
                                                            }
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        {/* IKON PENSIL HANYA MUNCUL SAAT PERLU REVISI */}
                                                        {pesanan.status ===
                                                            "perlu_revisi" && (
                                                            <button
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        pesanan,
                                                                    )
                                                                }
                                                                className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                                                                title="Revisi & Ajukan Ulang"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() =>
                                                                handleCetak(
                                                                    pesanan,
                                                                )
                                                            }
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Cetak"
                                                        >
                                                            <Printer className="w-4 h-4" />
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

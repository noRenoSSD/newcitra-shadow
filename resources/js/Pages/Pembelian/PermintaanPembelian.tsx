import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Plus, Search, Eye, Trash2, X, Printer } from "lucide-react";
import axios from "axios";

// --- INTERFACES DARI BACKEND ---
interface Bahan {
    id_bahan: number;
    kode_bahan: number;
    nama_bahan: string;
    jenis_bahan: string;
    satuan_bahan: string;
}

interface DetailPP {
    id_detail_pp?: number;
    id_bahan: number;
    kode_bahan: number;
    qty_kebutuhan: number;
    qty_diminta: number;
    bahan?: Bahan;
}

interface PermintaanPembelian {
    id_pp: number;
    no_pp: string;
    tgl_pp: string;
    id_produksi: number | null;
    jenis_bahan: "baku" | "penolong" | "tambahan";
    status: string;
    catatan: string | null;
    details: DetailPP[];
    detail_jadwal?: {
        id_produksi: number;
        kode_produksi?: string;
        jadwal_produksi?: {
            kode_produksi: string;
        };
        produk: {
            id_produk: number;
            nama_produk: string;
        };
    };
}

// --- INTERFACE TAMBAHAN ---
interface KebutuhanMingguanItem {
    id_bahan: number;
    kode_bahan: string;
    nama_bahan: string;
    satuan_bahan: string;
    qty_kebutuhan: number;
}

type TabType = "baku" | "tambahan";

export default function PermintaanPembelian({
    permintaans = [],
    jadwals = [],
    bahans = [],
    nextNoPp = {},
    stokBahan = {}, // <-- UPDATE: Tangkap props stokBahan dari Backend
}: any) {
    const [activeTab, setActiveTab] = useState<TabType>("baku");
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedPermintaan, setSelectedPermintaan] =
        useState<PermintaanPembelian | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // --- STATE TAMBAHAN UNTUK MODE MINGGUAN ---
    const [modePembelian, setModePembelian] = useState<
        "per_produksi" | "mingguan"
    >("per_produksi");
    const [tglMulaiPeriode, setTglMulaiPeriode] = useState("");
    const [tglAkhirPeriode, setTglAkhirPeriode] = useState("");
    const [kodeProduksiCovered, setKodeProduksiCovered] = useState<string[]>(
        [],
    );
    const [idProduksiAnchor, setIdProduksiAnchor] = useState<number | null>(
        null,
    );
    const [isLoadingMingguan, setIsLoadingMingguan] = useState(false);

    const [formData, setFormData] = useState({
        tgl_pp: "",
        id_produksi: "",
        catatan: "",
    });

    const [kebutuhanList, setKebutuhanList] = useState<any[]>([]);
    const [newKebutuhan, setNewKebutuhan] = useState({
        id_bahan: "",
        kode_bahan: "",
        nama_bahan: "",
        jenis_bahan: "",
        satuan_bahan: "",
    });

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setSearchTerm("");
        if (tab !== "baku") {
            setModePembelian("per_produksi");
        }
    };

    const handleModePembelianChange = (mode: "per_produksi" | "mingguan") => {
        setModePembelian(mode);
        setKebutuhanList([]);
        setFormData({ ...formData, id_produksi: "", catatan: "" });
        setTglMulaiPeriode("");
        setTglAkhirPeriode("");
        setKodeProduksiCovered([]);
        setIdProduksiAnchor(null);
    };

    const handleAdd = () => {
        const today = new Date().toISOString().split("T")[0];
        setFormData({
            tgl_pp: today,
            id_produksi: "",
            catatan: "",
        });
        setKebutuhanList([]);
        setNewKebutuhan({
            id_bahan: "",
            kode_bahan: "",
            nama_bahan: "",
            jenis_bahan: "",
            satuan_bahan: "",
        });

        setModePembelian("per_produksi");
        setTglMulaiPeriode("");
        setTglAkhirPeriode("");
        setKodeProduksiCovered([]);
        setIdProduksiAnchor(null);

        setShowForm(true);
    };

    // Fungsi handle dropdown jadwal untuk Mode "Per Produksi"
    const handleJadwalProduksiChange = (idProduksi: string) => {
        if (idProduksi === "") {
            setKebutuhanList([]);
            setFormData({ ...formData, id_produksi: "" });
            return;
        }

        const jadwalDetail = jadwals.find(
            (j: any) => j.id_produksi.toString() === idProduksi,
        );
        if (!jadwalDetail) {
            setKebutuhanList([]);
            setFormData({ ...formData, id_produksi: idProduksi });
            return;
        }

        setFormData({ ...formData, id_produksi: idProduksi });

        const filteredMaterial =
            jadwalDetail.kebutuhan_bahan?.filter(
                (m: any) => m.detail_bom?.bahan?.jenis_bahan === activeTab,
            ) || [];

        const kebutuhanData = filteredMaterial.map((m: any, idx: number) => ({
            id_list: `${Date.now()}-${idx}`,
            id_bahan: m.detail_bom.bahan.id_bahan,
            kode_bahan: m.detail_bom.bahan.kode_bahan,
            nama_bahan: m.detail_bom.bahan.nama_bahan,
            jenis_bahan: m.detail_bom.bahan.jenis_bahan,
            kebutuhan: m.qty_kebutuhan,
            // UPDATE: Otomatis membaca dictionary stokBahan, fallback 0 jika tidak ada
            stok_gudang: stokBahan[m.detail_bom.bahan.id_bahan] || 0,
            diminta: 0,
            satuan_bahan: m.detail_bom.bahan.satuan_bahan,
        }));

        setKebutuhanList(kebutuhanData);
    };

    // Fungsi Fetch Kebutuhan Mingguan via API axios
    const handleGenerateMingguan = async () => {
        if (!tglMulaiPeriode || !tglAkhirPeriode) {
            alert(
                "Silakan pilih Tanggal Mulai dan Tanggal Akhir periode terlebih dahulu!",
            );
            return;
        }

        setIsLoadingMingguan(true);
        try {
            const response = await axios.get(
                "/pembelian/permintaan/kebutuhan-mingguan",
                {
                    params: {
                        tgl_mulai: tglMulaiPeriode,
                        tgl_akhir: tglAkhirPeriode,
                    },
                },
            );

            const data = response.data;

            if (!data.kebutuhan || data.kebutuhan.length === 0) {
                alert(
                    "Tidak ada data kebutuhan bahan tahan lama (non_perishable) pada rentang tanggal tersebut.",
                );
                setKebutuhanList([]);
                setKodeProduksiCovered([]);
                setIdProduksiAnchor(null);
                setFormData({ ...formData, id_produksi: "", catatan: "" });
                return;
            }

            setKodeProduksiCovered(data.kodeProduksi || []);
            setIdProduksiAnchor(data.idProduksiAnchor || null);

            const kebutuhanData = data.kebutuhan.map(
                (item: KebutuhanMingguanItem, idx: number) => ({
                    id_list: `mingguan-${Date.now()}-${idx}`,
                    id_bahan: item.id_bahan,
                    kode_bahan: item.kode_bahan,
                    nama_bahan: item.nama_bahan,
                    jenis_bahan: "baku",
                    kebutuhan: item.qty_kebutuhan,
                    // UPDATE: Sama, baca dari props untuk Mingguan
                    stok_gudang: stokBahan[item.id_bahan] || 0,
                    diminta: 0,
                    satuan_bahan: item.satuan_bahan,
                }),
            );

            setKebutuhanList(kebutuhanData);

            setFormData({
                ...formData,
                id_produksi: data.idProduksiAnchor?.toString() || "",
                catatan: `Periode: ${tglMulaiPeriode} s/d ${tglAkhirPeriode}. Mencakup Produksi: ${(data.kodeProduksi || []).join(", ")}`,
            });
        } catch (error: any) {
            console.error("Gagal menarik data kebutuhan mingguan:", error);
            alert(
                "Terjadi kesalahan. Pastikan rentang tanggal valid atau periksa koneksi backend.",
            );
        } finally {
            setIsLoadingMingguan(false);
        }
    };

    const handleDetail = (permintaan: PermintaanPembelian) => {
        setSelectedPermintaan(permintaan);
        setShowDetail(true);
    };

    const handleAddKebutuhan = () => {
        if (!newKebutuhan.id_bahan) {
            alert("Bahan harus dipilih");
            return;
        }

        if (
            kebutuhanList.some(
                (k) =>
                    k.id_bahan.toString() === newKebutuhan.id_bahan.toString(),
            )
        ) {
            alert("Bahan sudah ada dalam daftar");
            return;
        }

        setKebutuhanList([
            ...kebutuhanList,
            {
                id_list: Date.now().toString(),
                ...newKebutuhan,
                kebutuhan: 0,
                // UPDATE: Menarik stok gudang saat input manual di tab Bahan Tambahan
                stok_gudang: stokBahan[newKebutuhan.id_bahan] || 0,
                diminta: 0,
            },
        ]);

        setNewKebutuhan({
            id_bahan: "",
            kode_bahan: "",
            nama_bahan: "",
            jenis_bahan: "",
            satuan_bahan: "",
        });
    };

    const handleRemoveKebutuhan = (id_list: string) => {
        setKebutuhanList(kebutuhanList.filter((k) => k.id_list !== id_list));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (kebutuhanList.length === 0) {
            alert("Minimal harus ada 1 kebutuhan bahan");
            return;
        }

        if (activeTab !== "tambahan" && !formData.id_produksi) {
            alert(
                modePembelian === "mingguan"
                    ? "Silakan Generate Kebutuhan Mingguan terlebih dahulu!"
                    : "Jadwal Produksi harus dipilih",
            );
            return;
        }

        router.post(
            "/pembelian/permintaan",
            {
                jenis_bahan: activeTab,
                tgl_pp: formData.tgl_pp,
                catatan: formData.catatan,
                id_produksi:
                    activeTab === "tambahan" ? null : formData.id_produksi,
                tgl_mulai_periode:
                    activeTab === "baku" && modePembelian === "mingguan"
                        ? tglMulaiPeriode
                        : null,
                tgl_akhir_periode:
                    activeTab === "baku" && modePembelian === "mingguan"
                        ? tglAkhirPeriode
                        : null,
                details: kebutuhanList.map((item) => ({
                    id_bahan: item.id_bahan,
                    kode_bahan: item.kode_bahan,
                    qty_kebutuhan: item.kebutuhan || 0,
                    qty_diminta: item.diminta || 0,
                })),
            },
            {
                onSuccess: () => handleCancel(),
            },
        );
    };

    const handleCancel = () => {
        setShowForm(false);
        setShowDetail(false);
        setSelectedPermintaan(null);
        setKebutuhanList([]);
        setFormData({
            tgl_pp: "",
            id_produksi: "",
            catatan: "",
        });
        setNewKebutuhan({
            id_bahan: "",
            kode_bahan: "",
            nama_bahan: "",
            jenis_bahan: "",
            satuan_bahan: "",
        });
        setModePembelian("per_produksi");
        setTglMulaiPeriode("");
        setTglAkhirPeriode("");
        setKodeProduksiCovered([]);
        setIdProduksiAnchor(null);
    };

    const handleCetak = (permintaan: PermintaanPembelian) => {
        const isTambahan = permintaan.jenis_bahan === "tambahan";
        const isBahanPenolong = permintaan.jenis_bahan === "penolong";
        const tanggal = new Date(permintaan.tgl_pp).toLocaleDateString(
            "id-ID",
            { day: "2-digit", month: "long", year: "numeric" },
        );

        const itemRows = (permintaan.details || [])
            .map(
                (item: any) => `
        <tr>
          ${isBahanPenolong || isTambahan ? `<td style="border:1px solid #ccc;padding:6px 10px;">${item.bahan?.kode_bahan || "-"}</td>` : ""}
          ${isTambahan ? `<td style="border:1px solid #ccc;padding:6px 10px;">${item.bahan?.jenis_bahan || "-"}</td>` : ""}
          <td style="border:1px solid #ccc;padding:6px 10px;">${item.bahan?.nama_bahan || "-"}</td>
          ${!isTambahan ? `<td style="border:1px solid #ccc;padding:6px 10px;text-align:right;">${item.qty_kebutuhan ?? "-"}</td>` : ""}
          <td style="border:1px solid #ccc;padding:6px 10px;text-align:right;">${stokBahan[item.id_bahan] || 0}</td>
          <td style="border:1px solid #ccc;padding:6px 10px;text-align:right;">${item.qty_diminta}</td>
          <td style="border:1px solid #ccc;padding:6px 10px;text-align:center;">${item.bahan?.satuan_bahan || "-"}</td>
        </tr>`,
            )
            .join("");

        const headerCols = `
        ${isBahanPenolong || isTambahan ? '<th style="border:1px solid #ccc;padding:6px 10px;background:#f3f4f6;">Kode Bahan</th>' : ""}
        ${isTambahan ? '<th style="border:1px solid #ccc;padding:6px 10px;background:#f3f4f6;">Jenis Bahan</th>' : ""}
        <th style="border:1px solid #ccc;padding:6px 10px;background:#f3f4f6;">Nama Bahan</th>
        ${!isTambahan ? '<th style="border:1px solid #ccc;padding:6px 10px;background:#f3f4f6;">Kebutuhan</th>' : ""}
        <th style="border:1px solid #ccc;padding:6px 10px;background:#f3f4f6;">Stok Gudang</th>
        <th style="border:1px solid #ccc;padding:6px 10px;background:#f3f4f6;">Diminta</th>
        <th style="border:1px solid #ccc;padding:6px 10px;background:#f3f4f6;">Satuan</th>`;

        const win = window.open("", "_blank", "width=900,height=700");
        if (!win) return;
        win.document
            .write(`<!DOCTYPE html><html><head><title>Cetak Permintaan Pembelian</title>
        <style>body{font-family:Arial,sans-serif;font-size:13px;margin:30px;}h2{color:#7f1d1d;margin-bottom:4px;}
        table{border-collapse:collapse;width:100%;}th{text-align:left;}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin-bottom:16px;}
        .info-item label{font-size:11px;color:#666;display:block;}
        .info-item p{font-weight:600;margin:2px 0;}
        .footer{margin-top:40px;display:flex;justify-content:space-between;}
        .ttd{text-align:center;width:200px;}
        .ttd .line{margin-top:60px;border-top:1px solid #333;}
        @media print{button{display:none!important;}}</style></head><body>
        <div style="text-align:center;margin-bottom:16px;">
          <h2>CV NEW CITRA</h2>
          <p style="margin:0;font-size:12px;color:#555;">Produksi Olahan Bandeng</p>
          <hr style="border-color:#7f1d1d;margin:8px 0;">
          <h3 style="margin:4px 0;">SURAT PERMINTAAN PEMBELIAN</h3>
        </div>
        <div class="info-grid">
          <div class="info-item"><label>No. Permintaan</label><p>${permintaan.no_pp}</p></div>
          <div class="info-item"><label>Tanggal</label><p>${tanggal}</p></div>
          ${
              !isTambahan
                  ? `<div class="info-item"><label>Kode Produksi</label><p>${permintaan.id_produksi || "-"}</p></div>
          <div class="info-item"><label>Produk / Catatan</label><p>${permintaan.detail_jadwal?.produk?.nama_produk || permintaan.catatan || "-"}</p></div>`
                  : `<div class="info-item"><label>Keterangan</label><p>${permintaan.catatan || "-"}</p></div>`
          }
          <div class="info-item"><label>Status</label><p>${permintaan.status}</p></div>
        </div>
        <table><thead><tr>${headerCols}</tr></thead><tbody>${itemRows}</tbody></table>
        <div class="footer">
          <div class="ttd"><div class="line">Dibuat Oleh</div></div>
          <div class="ttd"><div class="line">Disetujui Oleh</div></div>
        </div>
        <script>window.onload=()=>{window.print();}</script></body></html>`);
        win.document.close();
    };

    const currentList = permintaans.filter(
        (p: PermintaanPembelian) => p.jenis_bahan === activeTab,
    );

    const filteredPermintaan = currentList.filter((p: PermintaanPembelian) => {
        const search = searchTerm.toLowerCase();
        return (
            p.no_pp.toLowerCase().includes(search) ||
            (p.detail_jadwal?.produk?.nama_produk &&
                p.detail_jadwal.produk.nama_produk
                    .toLowerCase()
                    .includes(search)) ||
            (p.catatan && p.catatan.toLowerCase().includes(search))
        );
    });

    const availableJadwals = jadwals.filter((j: any) =>
        j.kebutuhan_bahan?.some(
            (kb: any) => kb.detail_bom?.bahan?.jenis_bahan === activeTab,
        ),
    );

    const availableBahanTambahan = bahans.filter(
        (b: any) => b.jenis_bahan === "baku" || b.jenis_bahan === "penolong",
    );

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "diajukan":
                return "bg-yellow-100 text-yellow-700";
            case "disetujui":
                return "bg-green-100 text-green-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (showForm) {
        const formTitle =
            activeTab === "baku"
                ? "Permintaan Bahan Baku"
                : "Permintaan Bahan Tambahan";

        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-red-800">
                            Tambah {formTitle}
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {activeTab === "baku" && (
                            <div className="mb-6 flex p-1 bg-gray-100 rounded-lg w-fit">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleModePembelianChange(
                                            "per_produksi",
                                        )
                                    }
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        modePembelian === "per_produksi"
                                            ? "bg-white text-red-800 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Per Produksi (Mudah Rusak)
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleModePembelianChange("mingguan")
                                    }
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        modePembelian === "mingguan"
                                            ? "bg-white text-red-800 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Mingguan (Tahan Lama)
                                </button>
                            </div>
                        )}

                        <div
                            className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 ${
                                activeTab !== "tambahan"
                                    ? "lg:grid-cols-4"
                                    : "lg:grid-cols-3"
                            }`}
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No. Permintaan{" "}
                                    <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled
                                    value={nextNoPp[activeTab] || ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal PP{" "}
                                    <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.tgl_pp}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tgl_pp: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-red-500"
                                />
                            </div>

                            {activeTab !== "tambahan" && (
                                <>
                                    {activeTab !== "baku" ||
                                    modePembelian === "per_produksi" ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Kode Produksi{" "}
                                                    <span className="text-red-600">
                                                        *
                                                    </span>
                                                </label>
                                                <select
                                                    required
                                                    value={formData.id_produksi}
                                                    onChange={(e) =>
                                                        handleJadwalProduksiChange(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white"
                                                >
                                                    <option value="">
                                                        -- Pilih Produksi --
                                                    </option>
                                                    {availableJadwals.map(
                                                        (jadwal: any) => (
                                                            <option
                                                                key={
                                                                    jadwal.id_produksi
                                                                }
                                                                value={
                                                                    jadwal.id_produksi
                                                                }
                                                            >
                                                                {jadwal.kode_produksi ||
                                                                    jadwal
                                                                        .jadwal_produksi
                                                                        ?.kode_produksi ||
                                                                    jadwal.id_produksi}{" "}
                                                                -{" "}
                                                                {
                                                                    jadwal
                                                                        .produk
                                                                        ?.nama_produk
                                                                }
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Produk
                                                </label>
                                                <input
                                                    type="text"
                                                    disabled
                                                    value={
                                                        formData.id_produksi
                                                            ? jadwals.find(
                                                                  (j: any) =>
                                                                      j.id_produksi.toString() ===
                                                                      formData.id_produksi.toString(),
                                                              )?.produk
                                                                  ?.nama_produk ||
                                                              ""
                                                            : ""
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                                    placeholder="Terisi otomatis"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tgl Mulai Periode{" "}
                                                    <span className="text-red-600">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={tglMulaiPeriode}
                                                    onChange={(e) =>
                                                        setTglMulaiPeriode(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-red-500"
                                                />
                                            </div>
                                            <div className="flex gap-2 items-end">
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Tgl Akhir Periode{" "}
                                                        <span className="text-red-600">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={tglAkhirPeriode}
                                                        onChange={(e) =>
                                                            setTglAkhirPeriode(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-red-500"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={isLoadingMingguan}
                                                    onClick={
                                                        handleGenerateMingguan
                                                    }
                                                    className="px-4 py-2 h-[42px] bg-red-800 text-white text-sm font-medium rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50 whitespace-nowrap"
                                                >
                                                    {isLoadingMingguan
                                                        ? "Loading..."
                                                        : "Generate"}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {activeTab === "tambahan" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Keterangan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.catatan}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                catatan: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                        placeholder="Keperluan bahan operasional"
                                    />
                                </div>
                            )}

                            {activeTab === "baku" &&
                                modePembelian === "mingguan" && (
                                    <div className="md:col-span-2 lg:col-span-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Keterangan Produksi Ter-cover
                                            (Otomatis)
                                        </label>
                                        <textarea
                                            readOnly
                                            value={formData.catatan}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 outline-none text-gray-600"
                                            rows={2}
                                            placeholder="Daftar kode produksi otomatis muncul setelah klik Generate..."
                                        />
                                    </div>
                                )}
                        </div>

                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-md font-semibold text-gray-800">
                                    Tabel Kebutuhan Bahan
                                    {activeTab !== "tambahan" && (
                                        <span className="ml-2 text-sm font-normal text-gray-600">
                                            -{" "}
                                            {activeTab === "baku"
                                                ? modePembelian ===
                                                  "per_produksi"
                                                    ? "Bahan Mudah Rusak"
                                                    : "Bahan Tahan Lama"
                                                : ""}
                                        </span>
                                    )}
                                </h4>
                                {activeTab !== "tambahan" &&
                                    formData.id_produksi &&
                                    modePembelian === "per_produksi" && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                            Auto-filled dari Produksi:{" "}
                                            {formData.id_produksi}
                                        </span>
                                    )}
                            </div>

                            {activeTab === "tambahan" && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        <div>
                                            <select
                                                value={newKebutuhan.id_bahan}
                                                onChange={(e) => {
                                                    const selected =
                                                        availableBahanTambahan.find(
                                                            (b: any) =>
                                                                b.id_bahan.toString() ===
                                                                e.target.value,
                                                        );
                                                    if (selected) {
                                                        setNewKebutuhan({
                                                            ...newKebutuhan,
                                                            id_bahan:
                                                                selected.id_bahan.toString(),
                                                            jenis_bahan:
                                                                selected.jenis_bahan,
                                                            kode_bahan:
                                                                selected.kode_bahan,
                                                            nama_bahan:
                                                                selected.nama_bahan,
                                                            satuan_bahan:
                                                                selected.satuan_bahan,
                                                        });
                                                    } else {
                                                        setNewKebutuhan({
                                                            id_bahan: "",
                                                            kode_bahan: "",
                                                            nama_bahan: "",
                                                            jenis_bahan: "",
                                                            satuan_bahan: "",
                                                        });
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white"
                                            >
                                                <option value="">
                                                    -- Pilih Bahan Tambahan --
                                                </option>
                                                {availableBahanTambahan.map(
                                                    (b: any) => (
                                                        <option
                                                            key={b.id_bahan}
                                                            value={b.id_bahan}
                                                        >
                                                            {b.nama_bahan}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={handleAddKebutuhan}
                                                className="w-full px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                                            >
                                                Tambah
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "tambahan" && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-800">
                                        💡 Silakan tentukan jumlah yang{" "}
                                        <strong>diminta</strong> secara manual,
                                        karena tidak ada data tarikan kebutuhan.
                                    </p>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3">
                                                Kode Bahan
                                            </th>
                                            {activeTab === "tambahan" && (
                                                <th className="px-6 py-3">
                                                    Jenis Bahan
                                                </th>
                                            )}
                                            <th className="px-6 py-3">
                                                Nama Bahan
                                            </th>
                                            {activeTab !== "tambahan" && (
                                                <th className="px-6 py-3 text-right">
                                                    Kebutuhan Produksi
                                                </th>
                                            )}
                                            <th className="px-6 py-3 text-right">
                                                Stok Gudang
                                            </th>
                                            <th className="px-6 py-3 text-right text-red-700">
                                                Diminta
                                            </th>
                                            <th className="px-6 py-3 text-center">
                                                Satuan
                                            </th>
                                            <th className="px-6 py-3 text-center">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {kebutuhanList.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-6 py-8 text-center text-gray-500"
                                                >
                                                    Tidak ada data kebutuhan
                                                    bahan
                                                </td>
                                            </tr>
                                        ) : (
                                            kebutuhanList.map((item, index) => (
                                                <tr
                                                    key={item.id_list}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {item.kode_bahan}
                                                    </td>
                                                    {activeTab ===
                                                        "tambahan" && (
                                                        <td className="px-6 py-4 capitalize">
                                                            {item.jenis_bahan}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 font-medium">
                                                        {item.nama_bahan}
                                                    </td>
                                                    {activeTab !==
                                                        "tambahan" && (
                                                        <td className="px-6 py-4 text-right bg-blue-50 font-semibold text-blue-700">
                                                            {item.kebutuhan}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                item.stok_gudang
                                                            }
                                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-right bg-gray-100"
                                                            disabled // Dibuat disabled karena data sudah ditarik otomatis dari database persediaan
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.diminta}
                                                            onChange={(e) => {
                                                                const newList =
                                                                    [
                                                                        ...kebutuhanList,
                                                                    ];
                                                                newList[
                                                                    index
                                                                ].diminta =
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0;
                                                                setKebutuhanList(
                                                                    newList,
                                                                );
                                                            }}
                                                            className="w-24 px-2 py-1 border border-red-300 rounded text-right focus:border-red-500 bg-red-50 text-red-900 font-bold"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {item.satuan_bahan}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveKebutuhan(
                                                                    item.id_list,
                                                                )
                                                            }
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 justify-end">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900"
                            >
                                Simpan Permintaan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // === TAMPILAN DETAIL MODAL ===
    if (showDetail && selectedPermintaan) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Detail Permintaan Pembelian
                        </h1>
                        <p className="text-sm text-gray-500">
                            Lihat rincian data permintaan
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleCetak(selectedPermintaan)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900 transition-colors"
                        >
                            <Printer className="w-4 h-4" /> Cetak PDF
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <X className="w-5 h-5" /> Tutup
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    No. PP
                                </label>
                                <p className="font-semibold text-gray-900">
                                    {selectedPermintaan.no_pp}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Tanggal
                                </label>
                                <p className="font-semibold text-gray-900">
                                    {selectedPermintaan.tgl_pp}
                                </p>
                            </div>

                            {selectedPermintaan.jenis_bahan !== "tambahan" ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Kode Produksi
                                        </label>
                                        <p className="font-semibold text-gray-900">
                                            {selectedPermintaan.id_produksi}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Produk / Catatan
                                        </label>
                                        <p className="font-semibold text-gray-900">
                                            {selectedPermintaan.detail_jadwal
                                                ?.produk?.nama_produk ||
                                                selectedPermintaan.catatan ||
                                                "-"}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Keterangan
                                    </label>
                                    <p className="font-semibold text-gray-900">
                                        {selectedPermintaan.catatan || "-"}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Status
                                </label>
                                <span
                                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                        selectedPermintaan.status,
                                    )}`}
                                >
                                    {selectedPermintaan.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <h4 className="text-md font-semibold text-gray-800 mb-4 border-l-4 border-red-800 pl-3">
                            Rincian Bahan Diminta
                        </h4>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        {["penolong", "tambahan"].includes(
                                            selectedPermintaan.jenis_bahan,
                                        ) && (
                                            <th className="px-6 py-3">
                                                Kode Bahan
                                            </th>
                                        )}
                                        {selectedPermintaan.jenis_bahan ===
                                            "tambahan" && (
                                            <th className="px-6 py-3">
                                                Jenis Bahan
                                            </th>
                                        )}
                                        <th className="px-6 py-3">
                                            Nama Bahan
                                        </th>
                                        {selectedPermintaan.jenis_bahan !==
                                            "tambahan" && (
                                            <th className="px-6 py-3 text-right">
                                                Kebutuhan Produksi
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-right">
                                            Stok Gudang
                                        </th>
                                        <th className="px-6 py-3 text-right">
                                            Qty Diminta
                                        </th>
                                        <th className="px-6 py-3 text-center">
                                            Satuan
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {selectedPermintaan.details.map(
                                        (detail) => (
                                            <tr
                                                key={detail.id_detail_pp}
                                                className="hover:bg-gray-50"
                                            >
                                                {[
                                                    "penolong",
                                                    "tambahan",
                                                ].includes(
                                                    selectedPermintaan.jenis_bahan,
                                                ) && (
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {detail.bahan
                                                            ?.kode_bahan || "-"}
                                                    </td>
                                                )}
                                                {selectedPermintaan.jenis_bahan ===
                                                    "tambahan" && (
                                                    <td className="px-6 py-4 capitalize">
                                                        {detail.bahan
                                                            ?.jenis_bahan ||
                                                            "-"}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-gray-900">
                                                    {detail.bahan?.nama_bahan ||
                                                        "-"}
                                                </td>
                                                {selectedPermintaan.jenis_bahan !==
                                                    "tambahan" && (
                                                    <td className="px-6 py-4 text-right text-gray-600">
                                                        {detail.qty_kebutuhan}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-right text-gray-600">
                                                    {/* UPDATE: Stok real time juga di detail modal (ditarik dari array) */}
                                                    {stokBahan[
                                                        detail.id_bahan
                                                    ] || 0}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-red-700">
                                                    {detail.qty_diminta}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {detail.bahan
                                                        ?.satuan_bahan || "-"}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // === TAMPILAN TABEL UTAMA (LISTING) ===
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Permintaan Pembelian
                    </h1>
                    <p className="text-sm text-gray-500">
                        Kelola dan buat Surat Permintaan Pembelian (PP)
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900 transition-colors"
                >
                    <Plus className="w-5 h-5" /> Buat Permintaan Pembelian
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-8 px-6">
                        {(["baku", "tambahan"] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab
                                        ? "border-red-800 text-red-800"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                Permintaan Bahan{" "}
                                {tab === "baku" ? "Baku" : "Tambahan"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Cari berdasarkan No. PP ${activeTab !== "tambahan" ? "atau Nama Produk" : ""}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">
                                        No. PP
                                    </th>
                                    <th className="px-6 py-3 font-semibold">
                                        Tanggal PP
                                    </th>
                                    {activeTab !== "tambahan" && (
                                        <th className="px-6 py-3 font-semibold">
                                            Kode Produksi
                                        </th>
                                    )}
                                    <th className="px-6 py-3 font-semibold">
                                        {activeTab === "tambahan"
                                            ? "Catatan Keperluan"
                                            : "Produk / Keterangan"}
                                    </th>
                                    <th className="px-6 py-3 font-semibold">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPermintaan.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                activeTab === "tambahan" ? 5 : 6
                                            }
                                            className="px-6 py-8 text-center text-gray-500"
                                        >
                                            <p className="font-medium text-gray-600 mb-1">
                                                Tidak ada data ditemukan
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Coba cari dengan kata kunci lain
                                                atau tambahkan data baru.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPermintaan.map(
                                        (permintaan: PermintaanPembelian) => (
                                            <tr
                                                key={permintaan.id_pp}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 font-bold text-red-800">
                                                    {permintaan.no_pp}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {permintaan.tgl_pp}
                                                </td>
                                                {activeTab !== "tambahan" && (
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 border border-gray-200">
                                                            {
                                                                permintaan.id_produksi
                                                            }
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                                    {permintaan.jenis_bahan ===
                                                    "tambahan"
                                                        ? permintaan.catatan ||
                                                          "-"
                                                        : permintaan
                                                              .detail_jadwal
                                                              ?.produk
                                                              ?.nama_produk ||
                                                          permintaan.catatan ||
                                                          "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                            permintaan.status,
                                                        )}`}
                                                    >
                                                        {permintaan.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleDetail(
                                                                    permintaan,
                                                                )
                                                            }
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleCetak(
                                                                    permintaan,
                                                                )
                                                            }
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Cetak PDF"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Plus, Search, Eye, Trash2, X, Printer } from "lucide-react";

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
        kode_produksi?: string; // Langsung di sini
        jadwal_produksi?: {
            // Tetap sediakan untuk jaga-jaga struktur aslinya
            kode_produksi: string;
        };
        produk: {
            id_produk: number;
            nama_produk: string;
        };
    };
}

type TabType = "baku" | "penolong" | "tambahan";

export default function PermintaanPembelian({
    permintaans = [],
    jadwals = [],
    bahans = [],
    nextNoPp = {},
}: any) {
    console.log("Data Permintaan:", permintaans);
    console.log("Data Jadwal:", jadwals);
    console.log("Data Semua Bahan:", bahans); // <--- TAMBAHKAN INI
    const [activeTab, setActiveTab] = useState<TabType>("baku");
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedPermintaan, setSelectedPermintaan] =
        useState<PermintaanPembelian | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

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
        setShowForm(true);
    };

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

        // Filter kebutuhan_bahan berdasarkan tab aktif
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
            stok_gudang: 0, // Nilai default sementara
            diminta: 0,
            satuan_bahan: m.detail_bom.bahan.satuan_bahan,
        }));

        setKebutuhanList(kebutuhanData);
    };

    const handleDetail = (permintaan: PermintaanPembelian) => {
        setSelectedPermintaan(permintaan);
        setShowDetail(true);
    };

    const handleDelete = (id: number) => {
        if (
            window.confirm("Apakah Anda yakin ingin menghapus permintaan ini?")
        ) {
            router.delete(`/pembelian/permintaan/${id}`);
        }
    };

    const handleAddKebutuhan = () => {
        if (!newKebutuhan.id_bahan) {
            alert("Bahan harus dipilih");
            return;
        }

        // Cegah duplikasi
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
                stok_gudang: 0,
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
            alert("Jadwal Produksi harus dipilih");
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
// KODE BARU (YANG BENAR):
${isBahanPenolong || isTambahan ? `<td style="border:1px solid #ccc;padding:6px 10px;">${item.bahan?.kode_bahan || "-"}</td>` : ""}        ${isTambahan ? `<td style="border:1px solid #ccc;padding:6px 10px;">${item.bahan?.jenis_bahan || "-"}</td>` : ""}
        <td style="border:1px solid #ccc;padding:6px 10px;">${item.bahan?.nama_bahan || "-"}</td>
        ${!isTambahan ? `<td style="border:1px solid #ccc;padding:6px 10px;text-align:right;">${item.qty_kebutuhan ?? "-"}</td>` : ""}
        <td style="border:1px solid #ccc;padding:6px 10px;text-align:right;">0</td>
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
        <div class="info-item"><label>Produk</label><p>${permintaan.detail_jadwal?.produk?.nama_produk || "-"}</p></div>`
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

    // Filter List Utama
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

    // Filter Dropdown Jadwal & Bahan
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
                : activeTab === "penolong"
                  ? "Permintaan Bahan Penolong"
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
                        <div
                            className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 ${activeTab !== "tambahan" ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
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

                            <input
                                type="date"
                                value={formData.tgl_pp}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        tgl_pp: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-red-500"
                            />

                            {activeTab !== "tambahan" && (
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
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                        >
                                            <option value="">
                                                -- Pilih Produksi --
                                            </option>
                                            {availableJadwals.map(
                                                (jadwal: any) => (
                                                    <option
                                                        key={jadwal.id_produksi}
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
                                                            jadwal.produk
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
                                                      )?.produk?.nama_produk ||
                                                      ""
                                                    : ""
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                            placeholder="Terisi otomatis"
                                        />
                                    </div>
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
                        </div>

                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-md font-semibold text-gray-800">
                                    Tabel Kebutuhan Bahan
                                    {activeTab !== "tambahan" && (
                                        <span className="ml-2 text-sm font-normal text-gray-600">
                                            -{" "}
                                            {activeTab === "baku"
                                                ? "Bahan Baku"
                                                : "Bahan Penolong"}
                                        </span>
                                    )}
                                </h4>
                                {activeTab !== "tambahan" &&
                                    formData.id_produksi && (
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
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
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
                                        <strong>Info:</strong> Pilih bahan
                                        operasional dari dropdown, lalu klik
                                        Tambah untuk memasukkan ke tabel. Isi
                                        jumlah yang diminta pada kolom Diminta.
                                    </p>
                                </div>
                            )}

                            {formData.id_produksi !== "" &&
                                kebutuhanList.length > 0 &&
                                activeTab !== "tambahan" && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-blue-800">
                                            <strong>Info:</strong> Kebutuhan
                                            bahan terisi otomatis berdasarkan
                                            produksi yang dipilih. Stok gudang
                                            akan diupdate setelah integrasi
                                            kartu persediaan selesai.
                                        </p>
                                    </div>
                                )}

                            {formData.id_produksi !== "" &&
                                kebutuhanList.length === 0 &&
                                activeTab !== "tambahan" && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Perhatian:</strong> Tidak
                                            ada kebutuhan{" "}
                                            {activeTab === "baku"
                                                ? "Bahan Baku"
                                                : "Bahan Penolong"}{" "}
                                            pada produksi ini.
                                        </p>
                                    </div>
                                )}

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            {(activeTab === "penolong" ||
                                                activeTab === "tambahan") && (
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                    Kode Bahan
                                                </th>
                                            )}
                                            {activeTab === "tambahan" && (
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                    Jenis Bahan
                                                </th>
                                            )}
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                Nama Bahan
                                            </th>
                                            {activeTab !== "tambahan" && (
                                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                                    Kebutuhan
                                                </th>
                                            )}
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                                Stok Gudang
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                                Diminta
                                            </th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                                Satuan
                                            </th>
                                            {/* Tampilkan kolom Aksi untuk SEMUA tab per instruksi */}
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kebutuhanList.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        activeTab === "tambahan"
                                                            ? 7
                                                            : activeTab ===
                                                                "penolong"
                                                              ? 7
                                                              : 6
                                                    }
                                                    className="py-6 text-center text-gray-500"
                                                >
                                                    {activeTab === "tambahan"
                                                        ? "Pilih kode bahan dari dropdown untuk menambahkan kebutuhan"
                                                        : `Pilih Produksi untuk mengisi kebutuhan ${activeTab === "baku" ? "Bahan Baku" : "Bahan Penolong"} secara otomatis`}
                                                </td>
                                            </tr>
                                        ) : (
                                            kebutuhanList.map(
                                                (item: any, idx: number) => (
                                                    <tr
                                                        key={item.id_list}
                                                        className="border-b border-gray-100 hover:bg-gray-50"
                                                    >
                                                        {(activeTab ===
                                                            "penolong" ||
                                                            activeTab ===
                                                                "tambahan") && (
                                                            <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                                                                {
                                                                    item.kode_bahan
                                                                }
                                                            </td>
                                                        )}
                                                        {activeTab ===
                                                            "tambahan" && (
                                                            <td className="py-3 px-4 text-sm text-gray-700 capitalize">
                                                                {
                                                                    item.jenis_bahan
                                                                }
                                                            </td>
                                                        )}
                                                        <td className="py-3 px-4 text-sm text-gray-700">
                                                            {item.nama_bahan}
                                                        </td>
                                                        {activeTab !==
                                                            "tambahan" && (
                                                            <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                                {item.kebutuhan}
                                                            </td>
                                                        )}
                                                        <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                            {item.stok_gudang}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                required
                                                                value={
                                                                    item.diminta
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const updatedList =
                                                                        [
                                                                            ...kebutuhanList,
                                                                        ];
                                                                    updatedList[
                                                                        idx
                                                                    ].diminta =
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                    setKebutuhanList(
                                                                        updatedList,
                                                                    );
                                                                }}
                                                                className="w-24 px-2 py-1 border border-gray-200 rounded text-right outline-none focus:border-red-400"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                                            {item.satuan_bahan}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveKebutuhan(
                                                                        item.id_list,
                                                                    )
                                                                }
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (showDetail && selectedPermintaan) {
        const detailTitle =
            activeTab === "baku"
                ? "Detail Permintaan Bahan Baku"
                : activeTab === "penolong"
                  ? "Detail Permintaan Bahan Penolong"
                  : "Detail Permintaan Bahan Tambahan";

        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-red-800">
                            {detailTitle}
                        </h3>
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div
                            className={`grid grid-cols-1 gap-6 mb-6 ${activeTab !== "tambahan" ? "md:grid-cols-4" : "md:grid-cols-3"}`}
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    No. Permintaan
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {selectedPermintaan.no_pp}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Tanggal
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {new Date(
                                        selectedPermintaan.tgl_pp,
                                    ).toLocaleDateString("id-ID")}
                                </p>
                            </div>

                            {activeTab !== "tambahan" ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Kode Produksi
                                        </label>
                                        <p className="text-gray-800 font-medium">
                                            {selectedPermintaan.detail_jadwal
                                                ?.kode_produksi ||
                                                selectedPermintaan.detail_jadwal
                                                    ?.jadwal_produksi
                                                    ?.kode_produksi ||
                                                selectedPermintaan.id_produksi}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Produk
                                        </label>
                                        <p className="text-gray-800 font-medium">
                                            {selectedPermintaan.detail_jadwal
                                                ?.produk?.nama_produk || "-"}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Keterangan
                                    </label>
                                    <p className="text-gray-800 font-medium">
                                        {selectedPermintaan.catatan || "-"}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Status
                            </label>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedPermintaan.status)}`}
                            >
                                {selectedPermintaan.status}
                            </span>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-md font-semibold text-gray-800 mb-4">
                                Kebutuhan Bahan
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            {(activeTab === "penolong" ||
                                                activeTab === "tambahan") && (
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                    Kode Bahan
                                                </th>
                                            )}
                                            {activeTab === "tambahan" && (
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                    Jenis Bahan
                                                </th>
                                            )}
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                Nama Bahan
                                            </th>
                                            {activeTab !== "tambahan" && (
                                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                                    Kebutuhan
                                                </th>
                                            )}
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                                Stok Gudang
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                                Diminta
                                            </th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                                Satuan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPermintaan.details.map(
                                            (item: any) => (
                                                <tr
                                                    key={item.id_detail_pp}
                                                    className="border-b border-gray-100 hover:bg-gray-50"
                                                >
                                                    {(activeTab ===
                                                        "penolong" ||
                                                        activeTab ===
                                                            "tambahan") && (
                                                        <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                                                            {
                                                                item.bahan
                                                                    ?.kode_bahan
                                                            }
                                                        </td>
                                                    )}
                                                    {activeTab ===
                                                        "tambahan" && (
                                                        <td className="py-3 px-4 text-sm text-gray-700 capitalize">
                                                            {
                                                                item.bahan
                                                                    ?.jenis_bahan
                                                            }
                                                        </td>
                                                    )}
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        {item.bahan?.nama_bahan}
                                                    </td>
                                                    {activeTab !==
                                                        "tambahan" && (
                                                        <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                            {item.qty_kebutuhan}
                                                        </td>
                                                    )}
                                                    <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                        0
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-right">
                                                        <span
                                                            className={
                                                                item.qty_diminta >
                                                                0
                                                                    ? "font-semibold text-red-600"
                                                                    : "text-gray-700"
                                                            }
                                                        >
                                                            {item.qty_diminta}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                                        {
                                                            item.bahan
                                                                ?.satuan_bahan
                                                        }
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-red-800">
                    Daftar Permintaan Pembelian
                </h2>
                <p className="text-sm text-red-800 mt-1">
                    Kelola data permintaan pembelian bahan
                </p>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleTabChange("baku")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === "baku"
                                    ? "bg-red-800 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Permintaan Bahan Baku
                        </button>
                        <button
                            onClick={() => handleTabChange("penolong")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === "penolong"
                                    ? "bg-red-800 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Permintaan Bahan Penolong
                        </button>
                        <button
                            onClick={() => handleTabChange("tambahan")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === "tambahan"
                                    ? "bg-red-800 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Permintaan Bahan Tambahan
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari permintaan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                            />
                        </div>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors ml-4"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Permintaan
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        No. Permintaan
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-800">
                                        Tanggal
                                    </th>
                                    {activeTab !== "tambahan" ? (
                                        <>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-800">
                                                Kode Produksi
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-800">
                                                Produk
                                            </th>
                                        </>
                                    ) : (
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-800">
                                            Keterangan
                                        </th>
                                    )}
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-800">
                                        Status
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-800">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPermintaan.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            Tidak ada data permintaan
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPermintaan.map(
                                        (permintaan: PermintaanPembelian) => (
                                            <tr
                                                key={permintaan.id_pp}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                                                    {permintaan.no_pp}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {new Date(
                                                        permintaan.tgl_pp,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                    )}
                                                </td>
                                                {activeTab !== "tambahan" ? (
                                                    <>
                                                        <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                                                            {permintaan
                                                                .detail_jadwal
                                                                ?.kode_produksi ||
                                                                permintaan
                                                                    .detail_jadwal
                                                                    ?.jadwal_produksi
                                                                    ?.kode_produksi ||
                                                                permintaan.id_produksi}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-700">
                                                            {permintaan
                                                                .detail_jadwal
                                                                ?.produk
                                                                ?.nama_produk ||
                                                                "-"}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        {permintaan.catatan ||
                                                            "-"}
                                                    </td>
                                                )}
                                                <td className="py-3 px-4 text-center">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(permintaan.status)}`}
                                                    >
                                                        {permintaan.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
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
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Cetak"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    permintaan.id_pp,
                                                                )
                                                            }
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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

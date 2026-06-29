import React, { useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, X } from "lucide-react";
import { router } from "@inertiajs/react";

// Sesuaikan dengan struktur kolom di database kamu
interface Bahan {
    id_bahan: number;
    kode_bahan: string;
    nama_bahan: string;
    satuan_bahan: string;
    stok_min: number;
    harga_beli: number; // <-- Tambahkan field harga_beli
}

interface Props {
    bahans: Bahan[];
}

export default function BahanPenolong({ bahans }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedBahan, setSelectedBahan] = useState<Bahan | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        kode_bahan: "",
        nama_bahan: "",
        satuan_bahan: "",
        stok_min: 0,
        harga_beli: 0, // <-- Tambahkan state harga_beli
    });

    // Helper untuk format Rupiah
    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(angka || 0);
    };

    const handleAdd = () => {
        setFormData({
            kode_bahan: "",
            nama_bahan: "",
            satuan_bahan: "",
            stok_min: 0,
            harga_beli: 0,
        });
        setEditMode(false);
        setShowForm(true);
    };

    const handleEdit = (bahan: Bahan) => {
        setFormData({
            kode_bahan: bahan.kode_bahan,
            nama_bahan: bahan.nama_bahan,
            satuan_bahan: bahan.satuan_bahan,
            stok_min: bahan.stok_min,
            harga_beli: bahan.harga_beli, // <-- Isi data harga saat edit
        });
        setSelectedBahan(bahan);
        setEditMode(true);
        setShowForm(true);
    };

    const handleDetail = (bahan: Bahan) => {
        setSelectedBahan(bahan);
        setShowDetail(true);
    };

    // Logika Hapus ke Backend
    const handleDelete = (id: number) => {
        if (
            window.confirm(
                "Apakah Anda yakin ingin menghapus data bahan penolong ini?",
            )
        ) {
            router.delete(`/bahan/${id}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            jenis_bahan: "penolong",
        };

        if (editMode && selectedBahan) {
            router.put(`/bahan/${selectedBahan.id_bahan}`, payload, {
                onSuccess: () => {
                    setShowForm(false);
                    setSelectedBahan(null);
                    alert("Data berhasil diperbarui!");
                },
            });
        } else {
            router.post(`/bahan`, payload, {
                onSuccess: () => {
                    setShowForm(false);
                    alert("Data berhasil disimpan!");
                },
            });
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setShowDetail(false);
        setSelectedBahan(null);
    };

    // Fitur Pencarian Data
    const filteredBahanPenolong = bahans.filter(
        (bahan) =>
            (bahan.kode_bahan || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (bahan.nama_bahan || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    // ================= TAMPILAN FORM TAMBAH/EDIT =================
    if (showForm) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {editMode
                            ? "Edit Bahan Penolong"
                            : "Tambah Bahan Penolong Baru"}
                    </h1>
                    <p className="text-gray-500">
                        Kelola data bahan penolong produksi
                    </p>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Kode Bahan Penolong{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.kode_bahan}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                kode_bahan: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                        placeholder="Contoh: BP-001"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Nama Bahan Penolong{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nama_bahan}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                nama_bahan: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                        placeholder="Nama bahan penolong"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Satuan{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.satuan_bahan}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                satuan_bahan: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                        placeholder="Contoh: Kg, Liter, Pcs"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Stok Minimal{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.stok_min}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                stok_min: Number(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>

                                {/* INPUT HARGA BELI */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Harga Beli Satuan (Rp){" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.harga_beli}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                harga_beli: Number(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                        placeholder="Contoh: 5000"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white transition-colors bg-red-900 rounded-lg hover:bg-red-800"
                                >
                                    {editMode ? "Update" : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ================= TAMPILAN MODAL/HALAMAN DETAIL =================
    if (showDetail && selectedBahan) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Detail Bahan Penolong
                        </h1>
                        <p className="text-gray-500">
                            Informasi lengkap data bahan penolong
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <X className="w-5 h-5" /> Tutup
                    </button>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-500">
                                    Kode Bahan Penolong
                                </label>
                                <p className="font-medium text-gray-800">
                                    {selectedBahan.kode_bahan}
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-500">
                                    Nama Bahan Penolong
                                </label>
                                <p className="font-medium text-gray-800">
                                    {selectedBahan.nama_bahan}
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-500">
                                    Satuan
                                </label>
                                <p className="font-medium text-gray-800">
                                    {selectedBahan.satuan_bahan}
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-500">
                                    Stok Minimal
                                </label>
                                <p className="font-medium text-gray-800">
                                    {selectedBahan.stok_min}
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-500">
                                    Harga Beli Satuan
                                </label>
                                <p className="font-semibold text-green-700">
                                    {formatRupiah(selectedBahan.harga_beli)}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => {
                                    setShowDetail(false);
                                    handleEdit(selectedBahan);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-amber-500 hover:bg-amber-600"
                            >
                                <Pencil className="w-4 h-4" /> Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ================= TAMPILAN UTAMA (TABEL) =================
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Master Bahan Penolong
                    </h1>
                    <p className="text-gray-500">
                        Kelola data bahan penolong produksi
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-900 rounded-lg hover:bg-red-800"
                >
                    <Plus className="w-5 h-5" /> Tambah Bahan Penolong
                </button>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                            type="text"
                            placeholder="Cari bahan penolong..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 border-collapse">
                            <thead className="text-xs text-gray-700 uppercase border-b bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">
                                        Kode
                                    </th>
                                    <th className="px-6 py-3 font-semibold">
                                        Nama Bahan
                                    </th>
                                    <th className="px-6 py-3 font-semibold">
                                        Satuan
                                    </th>
                                    <th className="px-6 py-3 font-semibold">
                                        Harga Beli
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-center">
                                        Stok Min
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBahanPenolong.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            Tidak ada data bahan penolong
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBahanPenolong.map((bahan) => (
                                        <tr
                                            key={bahan.id_bahan}
                                            className="bg-white border-b hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                {bahan.kode_bahan}
                                            </td>
                                            <td className="px-6 py-4">
                                                {bahan.nama_bahan}
                                            </td>
                                            <td className="px-6 py-4">
                                                {bahan.satuan_bahan}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-green-700">
                                                {formatRupiah(bahan.harga_beli)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {bahan.stok_min}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleDetail(bahan)
                                                        }
                                                        className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                                        title="Detail"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(bahan)
                                                        }
                                                        className="p-2 transition-colors rounded-lg text-amber-600 hover:bg-amber-50"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                bahan.id_bahan,
                                                            )
                                                        }
                                                        className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
    );
}

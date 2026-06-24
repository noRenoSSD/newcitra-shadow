import React, { useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, X } from "lucide-react";
import { router } from "@inertiajs/react";

interface Supplier {
    id_supplier: number;
    kode_supplier: string;
    nama_supplier: string;
    kontak_supplier: string;
    alamat_supplier: string;
}

interface Props {
    suppliers: Supplier[];
}

export default function Supplier({ suppliers = [] }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
        null,
    );
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        kode_supplier: "",
        nama_supplier: "",
        kontak_supplier: "",
        alamat_supplier: "",
    });

    const handleAdd = () => {
        setFormData({
            kode_supplier: "",
            nama_supplier: "",
            kontak_supplier: "",
            alamat_supplier: "",
        });
        setEditMode(false);
        setShowForm(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setFormData({
            kode_supplier: supplier.kode_supplier,
            nama_supplier: supplier.nama_supplier,
            kontak_supplier: supplier.kontak_supplier,
            alamat_supplier: supplier.alamat_supplier,
        });
        setSelectedSupplier(supplier);
        setEditMode(true);
        setShowForm(true);
    };

    const handleDetail = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setShowDetail(true);
    };

    const handleDelete = (id: number) => {
        if (
            window.confirm(
                "Apakah Anda yakin ingin menghapus data supplier ini?",
            )
        ) {
            router.delete(`/supplier/${id}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode && selectedSupplier) {
            router.put(`/supplier/${selectedSupplier.id_supplier}`, formData, {
                onSuccess: () => handleCancel(),
            });
        } else {
            router.post("/supplier", formData, {
                onSuccess: () => handleCancel(),
            });
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setShowDetail(false);
        setSelectedSupplier(null);
        setFormData({
            kode_supplier: "",
            nama_supplier: "",
            kontak_supplier: "",
            alamat_supplier: "",
        });
    };

    const filteredSupplier = suppliers.filter(
        (sup) =>
            (sup.kode_supplier || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (sup.nama_supplier || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    // ================= VIEW FORM (TAMBAH / EDIT) =================
    if (showForm) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {editMode ? "Edit Supplier" : "Tambah Supplier Baru"}
                    </h1>
                    <p className="text-gray-500">
                        Kelola data supplier perusahaan
                    </p>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kode Supplier *
                                </label>
                                {/* INPUT KODE AKTIF (BISA DIKETIK / DIUBAH MANUAL) */}
                                <input
                                    type="text"
                                    required
                                    value={formData.kode_supplier}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            kode_supplier: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                    placeholder="Contoh: SUP-01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Supplier *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nama_supplier}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nama_supplier: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                    placeholder="Nama supplier"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kontak / No. Telp *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.kontak_supplier}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            kontak_supplier: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                    placeholder="Contoh: 0812345678"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alamat *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.alamat_supplier}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            alamat_supplier: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                    placeholder="Alamat lengkap"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-white bg-red-900 rounded-lg hover:bg-red-800 transition-colors"
                            >
                                {editMode ? "Update" : "Simpan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // ================= VIEW DETAIL =================
    if (showDetail && selectedSupplier) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Detail Supplier
                        </h1>
                        <p className="text-gray-500">
                            Informasi lengkap data supplier
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <X className="w-5 h-5" /> Tutup
                    </button>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-gray-500 text-sm block mb-1">
                                Kode Supplier
                            </label>
                            <p className="font-semibold text-gray-900">
                                {selectedSupplier.kode_supplier}
                            </p>
                        </div>
                        <div>
                            <label className="text-gray-500 text-sm block mb-1">
                                Nama Supplier
                            </label>
                            <p className="font-semibold text-gray-900">
                                {selectedSupplier.nama_supplier}
                            </p>
                        </div>
                        <div>
                            <label className="text-gray-500 text-sm block mb-1">
                                Kontak / No. Telp
                            </label>
                            <p className="font-semibold text-gray-900">
                                {selectedSupplier.kontak_supplier}
                            </p>
                        </div>
                        <div>
                            <label className="text-gray-500 text-sm block mb-1">
                                Alamat
                            </label>
                            <p className="font-semibold text-gray-900">
                                {selectedSupplier.alamat_supplier}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Tutup
                        </button>
                        <button
                            onClick={() => {
                                setShowDetail(false);
                                handleEdit(selectedSupplier);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            <Pencil className="w-4 h-4" /> Edit
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ================= VIEW UTAMA (TABEL) =================
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Master Supplier
                    </h1>
                    <p className="text-gray-500">
                        Kelola data rekanan supplier
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-red-900 rounded-lg hover:bg-red-800 transition-colors"
                >
                    <Plus className="w-5 h-5" /> Tambah Supplier
                </button>
            </div>
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari data supplier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-semibold">
                                    Kode Supplier
                                </th>
                                <th className="px-6 py-3 font-semibold">
                                    Nama Supplier
                                </th>
                                <th className="px-6 py-3 font-semibold">
                                    Kontak
                                </th>
                                <th className="px-6 py-3 font-semibold">
                                    Alamat
                                </th>
                                <th className="px-6 py-3 text-center font-semibold">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSupplier.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-8 text-center text-gray-500"
                                    >
                                        Tidak ada data supplier
                                    </td>
                                </tr>
                            ) : (
                                filteredSupplier.map((sup) => (
                                    <tr
                                        key={sup.id_supplier}
                                        className="border-b bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {sup.kode_supplier}
                                        </td>
                                        <td className="px-6 py-4 text-gray-800">
                                            {sup.nama_supplier}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {sup.kontak_supplier}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {sup.alamat_supplier}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleDetail(sup)
                                                    }
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEdit(sup)
                                                    }
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            sup.id_supplier,
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

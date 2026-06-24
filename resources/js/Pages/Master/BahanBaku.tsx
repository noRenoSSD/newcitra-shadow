import React, { useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, X } from "lucide-react";
import { useForm, router } from "@inertiajs/react";

interface Bahan {
    id_bahan: number;
    kode_bahan: string;
    nama_bahan: string;
    satuan_bahan: string;
    stok_min: number;
    jenis_bahan: "baku";
}

interface Props {
    bahans: Bahan[];
}

export default function BahanBaku({ bahans }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedBahan, setSelectedBahan] = useState<Bahan | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { data, setData, post, put, processing, reset } = useForm({
        jenis_bahan: "baku",
        kode_bahan: "",
        nama_bahan: "",
        satuan_bahan: "",
        stok_min: "",
    });

    const handleAdd = () => {
        reset();
        setData("jenis_bahan", "baku");
        setEditMode(false);
        setShowForm(true);
    };

    const handleEdit = (bahan: Bahan) => {
        setData({
            jenis_bahan: "baku",
            kode_bahan: bahan.kode_bahan,
            nama_bahan: bahan.nama_bahan,
            satuan_bahan: bahan.satuan_bahan,
            stok_min: bahan.stok_min.toString(),
        });
        setSelectedBahan(bahan);
        setEditMode(true);
        setShowForm(true);
    };

    const handleDetail = (bahan: Bahan) => {
        setSelectedBahan(bahan);
        setShowDetail(true);
    };

    const handleDelete = (id: number) => {
        if (
            window.confirm(
                "Apakah Anda yakin ingin menghapus data bahan baku ini?",
            )
        ) {
            router.delete(`/bahan/${id}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode && selectedBahan) {
            put(`/bahan/${selectedBahan.id_bahan}`, {
                onSuccess: () => handleCancel(),
            });
        } else {
            post("/bahan", { onSuccess: () => handleCancel() });
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setShowDetail(false);
        setSelectedBahan(null);
        reset();
    };

    const filteredBahan = bahans.filter(
        (bahan) =>
            bahan.kode_bahan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bahan.nama_bahan.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // === TAMPILAN FORM TAMBAH / EDIT ===
    if (showForm) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {editMode
                                ? "Edit Bahan Baku"
                                : "Tambah Bahan Baku Baru"}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Kelola data bahan baku produksi
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kode Bahan Baku
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.kode_bahan}
                                    onChange={(e) =>
                                        setData("kode_bahan", e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Contoh: BHN-01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Bahan Baku{" "}
                                    <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.nama_bahan}
                                    onChange={(e) =>
                                        setData("nama_bahan", e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Nama bahan..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Satuan{" "}
                                    <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.satuan_bahan}
                                    onChange={(e) =>
                                        setData("satuan_bahan", e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Contoh: Kg, Liter"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stok Minimal{" "}
                                    <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    min="0"
                                    value={data.stok_min}
                                    onChange={(e) =>
                                        setData("stok_min", e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900 disabled:opacity-50"
                            >
                                {processing
                                    ? "Menyimpan..."
                                    : editMode
                                      ? "Update"
                                      : "Simpan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // === TAMPILAN DETAIL ===
    if (showDetail && selectedBahan) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Detail Bahan Baku
                        </h1>
                        <p className="text-sm text-gray-500">
                            Informasi lengkap data bahan baku
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <X className="w-5 h-5" /> Tutup
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Kode Bahan Baku
                            </label>
                            <p className="text-gray-800 font-medium">
                                {selectedBahan.kode_bahan}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Nama Bahan Baku
                            </label>
                            <p className="text-gray-800 font-medium">
                                {selectedBahan.nama_bahan}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Satuan
                            </label>
                            <p className="text-gray-800 font-medium">
                                {selectedBahan.satuan_bahan}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Stok Minimal
                            </label>
                            <p className="text-gray-800 font-medium">
                                {selectedBahan.stok_min}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Tutup
                        </button>
                        <button
                            onClick={() => {
                                setShowDetail(false);
                                handleEdit(selectedBahan);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
                        >
                            <Pencil className="w-4 h-4" /> Edit
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // === TAMPILAN UTAMA (TABEL DATA) ===
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Master Bahan Baku
                    </h1>
                    <p className="text-sm text-gray-500">
                        Kelola data bahan baku perusahaan
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900"
                >
                    <Plus className="w-5 h-5" /> Tambah Bahan Baku
                </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari bahan baku..."
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
                                    Kode Bahan Baku
                                </th>
                                <th className="px-6 py-3 font-semibold">
                                    Nama Bahan Baku
                                </th>
                                <th className="px-6 py-3 font-semibold">
                                    Satuan
                                </th>
                                <th className="px-6 py-3 font-semibold">
                                    Stok Minimal
                                </th>
                                <th className="px-6 py-3 font-semibold text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredBahan.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-8 text-center text-gray-500"
                                    >
                                        Tidak ada data bahan baku
                                    </td>
                                </tr>
                            ) : (
                                filteredBahan.map((bahan) => (
                                    <tr
                                        key={bahan.id_bahan}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {bahan.kode_bahan}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {bahan.nama_bahan}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {bahan.satuan_bahan}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {bahan.stok_min}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleDetail(bahan)
                                                    }
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEdit(bahan)
                                                    }
                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
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
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

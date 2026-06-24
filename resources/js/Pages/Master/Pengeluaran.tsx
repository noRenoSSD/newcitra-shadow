import React, { useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, X } from "lucide-react";
import { router } from "@inertiajs/react";

interface Pengeluaran {
    id_pengeluaran: number;
    kode_pengeluaran: string;
    nama_pengeluaran: string;
    keterangan: string | null; // Tambahan kolom keterangan
}

interface Props {
    pengeluarans: Pengeluaran[];
}

export default function Pengeluaran({ pengeluarans = [] }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedJenis, setSelectedJenis] = useState<Pengeluaran | null>(
        null,
    );
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        kode_pengeluaran: "",
        nama_pengeluaran: "",
        keterangan: "", // Tambahan di state form
    });

    const handleAdd = () => {
        setFormData({
            kode_pengeluaran: "",
            nama_pengeluaran: "",
            keterangan: "",
        });
        setEditMode(false);
        setShowForm(true);
    };

    const handleEdit = (jenis: Pengeluaran) => {
        setFormData({
            kode_pengeluaran: jenis.kode_pengeluaran,
            nama_pengeluaran: jenis.nama_pengeluaran,
            keterangan: jenis.keterangan || "",
        });
        setSelectedJenis(jenis);
        setEditMode(true);
        setShowForm(true);
    };

    const handleDetail = (jenis: Pengeluaran) => {
        setSelectedJenis(jenis);
        setShowDetail(true);
    };

    const handleDelete = (id: number) => {
        if (
            window.confirm(
                "Apakah Anda yakin ingin menghapus data jenis pengeluaran ini?",
            )
        ) {
            router.delete(`/jenis-pengeluaran/${id}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editMode && selectedJenis) {
            router.put(
                `/jenis-pengeluaran/${selectedJenis.id_pengeluaran}`,
                formData,
                {
                    onSuccess: () => handleCancel(),
                },
            );
        } else {
            router.post("/jenis-pengeluaran", formData, {
                onSuccess: () => handleCancel(),
            });
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setShowDetail(false);
        setSelectedJenis(null);
        setFormData({
            kode_pengeluaran: "",
            nama_pengeluaran: "",
            keterangan: "",
        });
    };

    const filteredJenisPengeluaran = pengeluarans.filter(
        (jenis) =>
            (jenis.kode_pengeluaran || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (jenis.nama_pengeluaran || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (jenis.keterangan || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    // ================= TAMPILAN FORM =================
    if (showForm) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {editMode
                            ? "Edit Jenis Pengeluaran"
                            : "Tambah Jenis Pengeluaran Baru"}
                    </h1>
                    <p className="text-gray-500">
                        Kelola jenis pengeluaran perusahaan
                    </p>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kode Jenis Pengeluaran{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.kode_pengeluaran}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                kode_pengeluaran:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                        placeholder="Contoh: JP-001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Jenis Pengeluaran{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nama_pengeluaran}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                nama_pengeluaran:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                        placeholder="Nama jenis pengeluaran"
                                    />
                                </div>

                                {/* Tambahan Input Keterangan (Full Width) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Keterangan
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.keterangan}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                keterangan: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                        placeholder="Tambahkan keterangan opsional di sini..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
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

    // ================= TAMPILAN DETAIL =================
    if (showDetail && selectedJenis) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Detail Jenis Pengeluaran
                        </h1>
                        <p className="text-gray-500">
                            Informasi lengkap jenis pengeluaran
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Kode Jenis Pengeluaran
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {selectedJenis.kode_pengeluaran}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Nama Jenis Pengeluaran
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {selectedJenis.nama_pengeluaran}
                                </p>
                            </div>

                            {/* Tambahan Detail Keterangan */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Keterangan
                                </label>
                                <p className="text-gray-800 font-medium whitespace-pre-line">
                                    {selectedJenis.keterangan || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => {
                                    setShowDetail(false);
                                    handleEdit(selectedJenis);
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
                        Master Jenis Pengeluaran
                    </h1>
                    <p className="text-gray-500">
                        Kelola jenis pengeluaran perusahaan
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-900 rounded-lg hover:bg-red-800"
                >
                    <Plus className="w-5 h-5" /> Tambah Pengeluaran
                </button>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari jenis pengeluaran..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 border-collapse">
                            <thead className="text-xs text-gray-700 uppercase border-b bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">
                                        Kode Jenis Pengeluaran
                                    </th>
                                    <th className="px-6 py-3 font-semibold">
                                        Nama Jenis Pengeluaran
                                    </th>
                                    <th className="px-6 py-3 font-semibold">
                                        Keterangan
                                    </th>{" "}
                                    {/* Tambahan Kolom */}
                                    <th className="px-6 py-3 font-semibold text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJenisPengeluaran.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            Tidak ada data jenis pengeluaran
                                        </td>
                                    </tr>
                                ) : (
                                    filteredJenisPengeluaran.map((jenis) => (
                                        <tr
                                            key={jenis.id_pengeluaran}
                                            className="bg-white border-b hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                {jenis.kode_pengeluaran}
                                            </td>
                                            <td className="px-6 py-4">
                                                {jenis.nama_pengeluaran}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate">
                                                {jenis.keterangan || "-"}
                                            </td>{" "}
                                            {/* Potong teks jika terlalu panjang */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleDetail(jenis)
                                                        }
                                                        className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                                        title="Detail"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(jenis)
                                                        }
                                                        className="p-2 transition-colors rounded-lg text-amber-600 hover:bg-amber-50"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                jenis.id_pengeluaran,
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

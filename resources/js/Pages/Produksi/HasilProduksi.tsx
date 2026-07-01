import { useState } from "react";
import { Plus, Search, Eye, X } from "lucide-react";
import { usePage, router } from "@inertiajs/react";

type FormStep = "list" | "produk-jadi" | "pemakaian-bahan";

export default function HasilProduksi() {
    // 1. Mengambil data asli dari database via Inertia
    const { hasilProduksi = [], jadwalProduksi = [] } = usePage<any>().props;

    const [currentStep, setCurrentStep] = useState<FormStep>("list");
    const [showDetail, setShowDetail] = useState(false);
    const [selectedProduksi, setSelectedProduksi] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [formProdukJadi, setFormProdukJadi] = useState({
        id_produksi: null as number | null,
        tanggal: "",
        noProduksi: "",
        kodeProduk: "",
        namaProduk: "",
        targetOutput: 0,
        outputAktual: 0,
        tanggalKadaluarsa: "",
        satuan: "Pack",
    });

    const [pemakaianBahanList, setPemakaianBahanList] = useState<any[]>([]);

    // --- HANDLERS ---
    const handleTambahProduksi = () => {
        const today = new Date().toISOString().split("T")[0];

        setFormProdukJadi({
            id_produksi: null,
            tanggal: today,
            noProduksi: "",
            kodeProduk: "",
            namaProduk: "",
            targetOutput: 0,
            outputAktual: 0,
            tanggalKadaluarsa: "",
            satuan: "Pack",
        });
        setPemakaianBahanList([]);
        setCurrentStep("produk-jadi");
    };

    const handleNoProduksiChange = (id_produksi: string) => {
        if (!id_produksi) {
            setFormProdukJadi({
                ...formProdukJadi,
                id_produksi: null,
                noProduksi: "",
                kodeProduk: "",
                namaProduk: "",
                targetOutput: 0,
                satuan: "Pack",
            });
            setPemakaianBahanList([]);
            return;
        }

        // Mencari jadwal asli dari database
        const jadwalDetail = jadwalProduksi.find(
            (j: any) => String(j.id_produksi || j.id) === String(id_produksi),
        );
        if (!jadwalDetail) return;

        // Auto-populate data produk jadi
        setFormProdukJadi({
            ...formProdukJadi,
            id_produksi: jadwalDetail.id_produksi || jadwalDetail.id,
            noProduksi:
                jadwalDetail.kode_produksi || jadwalDetail.no_produksi || "-",
            kodeProduk: jadwalDetail.produk?.kode_produk || "-",
            namaProduk: jadwalDetail.produk?.nama_produk || "-",
            targetOutput: Number(
                jadwalDetail.qty_rencana ||
                    jadwalDetail.target_output ||
                    jadwalDetail.jumlah ||
                    0,
            ),
            satuan: jadwalDetail.produk?.satuan || "Pack",
        });

        // Auto-populate daftar pemakaian bahan dari relasi database
        const kebutuhan =
            jadwalDetail.kebutuhan_bahan ||
            jadwalDetail.kebutuhanBahan ||
            jadwalDetail.detail_bom ||
            [];

        const pemakaianData = kebutuhan.map((m: any, idx: number) => {
            // PERBAIKAN UTAMA: Jalur relasi diubah menjadi detail_bom (snake_case)
            const bahanInfo = m.detail_bom?.bahan || m.bahan || {};
            const qtyKebutuhan = Number(m.qty_kebutuhan || m.jumlah || 0);

            // Ambil id bahan dari relasi terdekat
            const idBahan =
                m.detail_bom?.id_bahan ||
                bahanInfo.id_bahan ||
                m.id_bahan ||
                null;

            return {
                id: `${Date.now()}-${idx}`,
                id_bahan: idBahan,
                kodeBahan: bahanInfo.kode_bahan || "-", // <-- Sekarang akan terbaca!
                namaBahan: bahanInfo.nama_bahan || "-", // <-- Sekarang akan terbaca!
                kalkulasiPemakaian: qtyKebutuhan,
                pemakaianAktual: qtyKebutuhan,
                selisih: 0,
                satuan: bahanInfo.satuan_bahan || bahanInfo.satuan || "Gr",
            };
        });

        setPemakaianBahanList(pemakaianData);
    };

    const handleSimpanProdukJadi = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formProdukJadi.id_produksi) {
            alert("Pilih jadwal produksi terlebih dahulu!");
            return;
        }
        if (formProdukJadi.outputAktual <= 0) {
            alert("Output aktual harus lebih dari 0");
            return;
        }
        if (pemakaianBahanList.length === 0) {
            alert(
                "Pilih jadwal produksi terlebih dahulu untuk mengisi daftar pemakaian bahan",
            );
            return;
        }

        setCurrentStep("pemakaian-bahan");
    };

    const handleKonfirmasi = () => {
        if (pemakaianBahanList.length === 0) {
            alert("Minimal harus ada 1 pemakaian bahan");
            return;
        }

        const hasEmptyAktual = pemakaianBahanList.some(
            (item) => item.pemakaianAktual < 0,
        );
        if (hasEmptyAktual) {
            alert("Semua pemakaian aktual tidak boleh kurang dari 0");
            return;
        }

        // Mengirim ke database Laravel (DIPERBAIKI DI SINI)
        router.post(
            "/produksi/hasil-produksi",
            {
                id_produksi: formProdukJadi.id_produksi,
                output_aktual: formProdukJadi.outputAktual,
                tanggal_produksi: formProdukJadi.tanggal,
                tanggal_kadaluarsa: formProdukJadi.tanggalKadaluarsa,
                items: pemakaianBahanList.map((item) => ({
                    id_bahan: item.id_bahan,
                    kalkulasi_standar: item.kalkulasiPemakaian, // <-- INI YANG DIMINTA LARAVEL
                    qty_aktual: item.pemakaianAktual,
                    selisih: item.selisih, // <-- Tambahan aman jika Laravel juga butuh selisihnya
                })),
            },
            {
                onSuccess: () => {
                    alert("Data Hasil Produksi berhasil disimpan!");
                    handleBatal();
                },
                onError: (errors) => {
                    console.error(errors);
                    alert("Gagal menyimpan! Periksa kembali inputan Anda.");
                },
            },
        );
    };

    const handleBatal = () => {
        setCurrentStep("list");
        setPemakaianBahanList([]);
    };

    const handleDetail = (produksi: any) => {
        setSelectedProduksi(produksi);
        setShowDetail(true);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedProduksi(null);
    };

    // Filter pencarian
    const filteredProduksi = hasilProduksi.filter((p: any) => {
        const no = (p.detail_jadwal?.kode_produksi || "").toLowerCase();
        const nama = (p.detail_jadwal?.produk?.nama_produk || "").toLowerCase();
        const q = searchTerm.toLowerCase();
        return no.includes(q) || nama.includes(q);
    });

    // --- VIEW 1: MODAL DETAIL ---
    if (showDetail && selectedProduksi) {
        const detailTglProduksi =
            selectedProduksi.tanggal_produksi || selectedProduksi.tanggal;
        const detailTglKadaluarsa =
            selectedProduksi.tanggal_kadaluarsa ||
            selectedProduksi.tanggalKadaluarsa;
        const detailNoProduksi =
            selectedProduksi.detail_jadwal?.kode_produksi || "-";
        const detailKodeProduk =
            selectedProduksi.detail_jadwal?.produk?.kode_produk || "-";
        const detailNamaProduk =
            selectedProduksi.detail_jadwal?.produk?.nama_produk || "-";
        const detailTarget = selectedProduksi.detail_jadwal?.qty_rencana || 0;
        const detailSatuan =
            selectedProduksi.detail_jadwal?.produk?.satuan || "Pack";

        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-red-800">
                            Detail Hasil Produksi
                        </h3>
                        <button
                            onClick={handleCloseDetail}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Tanggal Produksi
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {new Date(
                                        detailTglProduksi,
                                    ).toLocaleDateString("id-ID")}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    No Produksi
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {detailNoProduksi}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Tanggal Kadaluarsa
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {new Date(
                                        detailTglKadaluarsa,
                                    ).toLocaleDateString("id-ID")}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Kode Produk
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {detailKodeProduk}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Nama Produk
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {detailNamaProduk}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Target Output
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {detailTarget} {detailSatuan}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Output Aktual
                                </label>
                                <p className="text-gray-800 font-bold text-lg">
                                    {selectedProduksi.output_aktual}{" "}
                                    {detailSatuan}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-md font-semibold text-gray-800 mb-4">
                                Pemakaian Bahan
                            </h4>
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
                                                Kalkulasi
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                                Aktual
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                                Selisih
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedProduksi.pemakaian_bahan?.map(
                                            (item: any, idx: number) => {
                                                const kode =
                                                    item.bahan?.kode_bahan ||
                                                    "-";
                                                const nama =
                                                    item.bahan?.nama_bahan ||
                                                    item.namaBahan ||
                                                    "-";
                                                const kalkulasi = Number(
                                                    item.kalkulasi_standar || 0,
                                                );
                                                const aktual = Number(
                                                    item.qty_aktual || 0,
                                                );
                                                const selisih = Number(
                                                    item.selisih ||
                                                        aktual - kalkulasi,
                                                );
                                                const satuan =
                                                    item.satuan ||
                                                    item.bahan?.satuan_bahan ||
                                                    "Gr";

                                                return (
                                                    <tr
                                                        key={idx}
                                                        className="border-b border-gray-100 hover:bg-gray-50"
                                                    >
                                                        <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                            {kode}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-700">
                                                            {nama}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                            {kalkulasi} {satuan}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                            {aktual} {satuan}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-right">
                                                            <span
                                                                className={`font-semibold ${selisih > 0 ? "text-red-600" : selisih < 0 ? "text-green-600" : "text-gray-700"}`}
                                                            >
                                                                {selisih > 0
                                                                    ? "+"
                                                                    : ""}
                                                                {selisih}{" "}
                                                                {satuan}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            },
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleCloseDetail}
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

    // --- VIEW 2: FORM STEP 1 (PRODUK JADI) ---
    if (currentStep === "produk-jadi") {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-red-800">
                            Form Produk Jadi
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Langkah 1 dari 2 - Input Data Produksi
                        </p>
                    </div>

                    <form onSubmit={handleSimpanProdukJadi} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Produksi{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formProdukJadi.tanggal}
                                    onChange={(e) =>
                                        setFormProdukJadi({
                                            ...formProdukJadi,
                                            tanggal: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No Produksi{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formProdukJadi.id_produksi || ""}
                                    onChange={(e) =>
                                        handleNoProduksiChange(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                >
                                    <option value="">
                                        -- Pilih No Produksi --
                                    </option>
                                    {jadwalProduksi.map((jadwal: any) => (
                                        <option
                                            key={jadwal.id_produksi}
                                            value={jadwal.id_produksi}
                                        >
                                            {jadwal.kode_produksi} -{" "}
                                            {jadwal.produk?.nama_produk}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kode Produk
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={formProdukJadi.kodeProduk}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Produk
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={formProdukJadi.namaProduk}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Output
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={
                                        formProdukJadi.targetOutput
                                            ? `${formProdukJadi.targetOutput} ${formProdukJadi.satuan}`
                                            : ""
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Output Aktual{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formProdukJadi.outputAktual || ""}
                                    onChange={(e) =>
                                        setFormProdukJadi({
                                            ...formProdukJadi,
                                            outputAktual: Number(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                    placeholder="0"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Kadaluarsa{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formProdukJadi.tanggalKadaluarsa}
                                    onChange={(e) =>
                                        setFormProdukJadi({
                                            ...formProdukJadi,
                                            tanggalKadaluarsa: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleBatal}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                            >
                                Simpan & Lanjutkan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // --- VIEW 3: FORM STEP 2 (PEMAKAIAN BAHAN) ---
    if (currentStep === "pemakaian-bahan") {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-red-800">
                            Form Pemakaian Bahan
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Langkah 2 dari 2 - Input Pemakaian Bahan untuk{" "}
                            {formProdukJadi.namaProduk}
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        No Produksi
                                    </label>
                                    <p className="text-gray-800 font-semibold">
                                        {formProdukJadi.noProduksi}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Produk
                                    </label>
                                    <p className="text-gray-800 font-semibold">
                                        {formProdukJadi.namaProduk}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Target
                                    </label>
                                    <p className="text-gray-800 font-semibold">
                                        {formProdukJadi.targetOutput}{" "}
                                        {formProdukJadi.satuan}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Output Aktual
                                    </label>
                                    <p className="text-gray-800 font-bold">
                                        {formProdukJadi.outputAktual}{" "}
                                        {formProdukJadi.satuan}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Kode Bahan
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Nama Bahan
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                            Kalkulasi Standar
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                            Pemakaian Aktual
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                            Selisih
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pemakaianBahanList.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-6 text-center text-gray-500"
                                            >
                                                Tidak ada kebutuhan bahan.
                                            </td>
                                        </tr>
                                    ) : (
                                        pemakaianBahanList.map((item, idx) => {
                                            const selisih =
                                                item.pemakaianAktual -
                                                item.kalkulasiPemakaian;
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                        {item.kodeBahan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        {item.namaBahan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                        {
                                                            item.kalkulasiPemakaian
                                                        }{" "}
                                                        {item.satuan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                        <input
                                                            type="number"
                                                            value={
                                                                item.pemakaianAktual
                                                            }
                                                            onChange={(e) => {
                                                                const updatedList =
                                                                    [
                                                                        ...pemakaianBahanList,
                                                                    ];
                                                                const newAktual =
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                updatedList[
                                                                    idx
                                                                ].pemakaianAktual =
                                                                    newAktual;
                                                                updatedList[
                                                                    idx
                                                                ].selisih =
                                                                    newAktual -
                                                                    item.kalkulasiPemakaian;
                                                                setPemakaianBahanList(
                                                                    updatedList,
                                                                );
                                                            }}
                                                            className="w-24 px-2 py-1 border border-gray-200 rounded text-right outline-none focus:border-red-400"
                                                            min="0"
                                                            step="0.01"
                                                        />{" "}
                                                        {item.satuan}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-right">
                                                        <span
                                                            className={`font-semibold ${selisih > 0 ? "text-red-600" : selisih < 0 ? "text-green-600" : "text-gray-700"}`}
                                                        >
                                                            {selisih > 0
                                                                ? "+"
                                                                : ""}
                                                            {selisih.toFixed(2)}{" "}
                                                            {item.satuan}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setCurrentStep("produk-jadi")}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Kembali
                            </button>
                            <button
                                type="button"
                                onClick={handleKonfirmasi}
                                className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                            >
                                Konfirmasi & Simpan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 4: HALAMAN UTAMA (LIST VIEW) ---
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-red-800">
                        Daftar Hasil Produksi
                    </h2>
                    <p className="text-sm text-red-800 mt-1">
                        Kelola data hasil produksi dan pemakaian aktual bahan
                    </p>
                </div>
                <button
                    onClick={handleTambahProduksi}
                    className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Produksi
                </button>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari no produksi atau nama produk..."
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
                                        Tanggal
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        No Produksi
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Produk
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Target
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Output
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Kadaluarsa
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProduksi.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            Belum ada data hasil produksi yang
                                            terekap.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProduksi.map((produksi: any) => {
                                        const noProduksi =
                                            produksi.detail_jadwal
                                                ?.kode_produksi || "-";
                                        const namaProduk =
                                            produksi.detail_jadwal?.produk
                                                ?.nama_produk || "-";
                                        const targetOutput =
                                            produksi.detail_jadwal
                                                ?.qty_rencana || 0;
                                        const satuan =
                                            produksi.detail_jadwal?.produk
                                                ?.satuan || "Pack";

                                        return (
                                            <tr
                                                key={
                                                    produksi.id_hasil_produksi ||
                                                    produksi.id
                                                }
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {new Date(
                                                        produksi.tanggal_produksi ||
                                                            produksi.tanggal,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                                    {noProduksi}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {namaProduk}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-right">
                                                    {targetOutput} {satuan}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700 text-right font-semibold">
                                                    {produksi.output_aktual}{" "}
                                                    {satuan}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {new Date(
                                                        produksi.tanggal_kadaluarsa ||
                                                            produksi.tanggalKadaluarsa,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={() =>
                                                                handleDetail(
                                                                    produksi,
                                                                )
                                                            }
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Detail"
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

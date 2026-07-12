import React, { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { Search, Plus, X, Eye, Printer, CheckCircle2 } from "lucide-react";

// ─── Interfaces ─────────────────────────────────────────────────────────
interface Akun {
  id_akun: number;
  kode_akun: string;
  nama_akun: string;
  kategori?: string;
}

interface Utang {
  id_utang: number;
  id_cogm: number;
  jenis: string;
  sisa: number;
  label: string;
}

interface TransaksiPengeluaran {
  id_transaksi: number;
  no_transaksi: string;
  tgl_transaksi: string;
  jenis_pengeluaran: string;
  nominal_bayar: number;
  metode_bayar: string;
  catatan: string | null;
  akun?: Akun;
}

interface Props {
  transaksis: TransaksiPengeluaran[];
  akuns: Akun[];
  utangs: Utang[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const inputCls    = "w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-100 bg-white text-gray-800 disabled:bg-gray-50 disabled:text-gray-400";
const readonlyCls = "w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed font-semibold";
const labelCls    = "block text-sm font-medium text-gray-700 mb-1.5";

// ─── Main Component ──────────────────────────────────────────────────────
export default function PengeluaranLain({ transaksis = [], akuns = [], utangs = [] }: Props) {
  const { flash } = usePage().props as any;
  const [showForm,       setShowForm]       = useState(false);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [selectedDetail, setSelectedDetail] = useState<TransaksiPengeluaran | null>(null);

  const { data, setData, post, processing, reset, errors } = useForm({
    no_transaksi:      "",
    tgl_transaksi:     "",
    jenis_pengeluaran: "",
    id_akun:           "",
    jenis_utang:       null as string | null,
    nominal_bayar:     "",
    metode_bayar:      "",
    catatan:           "",
    _sisaUtang:        0, // Total sisa utang yang belum dibayar
  });

  const generateNoTransaksi = () => {
    const year  = new Date().getFullYear();
    const count = transaksis.length + 1;
    return `PL-${year}-${String(count).padStart(3, "0")}`;
  };

  const handleTambah = () => {
    reset();
    setData({
      no_transaksi:      generateNoTransaksi(),
      tgl_transaksi:     new Date().toISOString().split("T")[0],
      jenis_pengeluaran: "",
      id_akun:           "",
      jenis_utang:       null,
      nominal_bayar:     "",
      metode_bayar:      "",
      catatan:           "",
      _sisaUtang:        0,
    });
    setShowForm(true);
  };

  const handleBatal = () => {
    setShowForm(false);
    reset();
  };

  // Saat jenis pengeluaran berubah — reset field terkait
  const handleJenisPengeluaranChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setData({
      no_transaksi:      data.no_transaksi,
      tgl_transaksi:     data.tgl_transaksi,
      jenis_pengeluaran: value,
      id_akun:           "",
      jenis_utang:       null,
      nominal_bayar:     "",
      metode_bayar:      data.metode_bayar,
      catatan:           data.catatan,
      _sisaUtang:        0,
    });
  };

  // LOGIKA BARU: Saat Akun Dipilih, otomatis hitung Sisa Terutang Global
  const handleAkunChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const akunPilih = akuns.find(a => a.id_akun.toString() === selectedId);

    let totalSisa = 0;
    let jenisUtang = null;

    if (data.jenis_pengeluaran === "Pembayaran Utang Produksi" && akunPilih) {
      const kode = String(akunPilih.kode_akun).replace(/\s+/g, "");
      
      // Jika yang dipilih adalah HUTANG GAJI PRODUKSI
      if (kode === "2001002" || akunPilih.nama_akun.toUpperCase().includes("GAJI")) {
        jenisUtang = "BTKL";
        totalSisa = utangs.filter(u => u.jenis === "BTKL").reduce((sum, u) => sum + Number(u.sisa), 0);
      } 
      // Jika yang dipilih adalah HUTANG OVERHEAD PRODUKSI
      else if (kode === "2001003" || akunPilih.nama_akun.toUpperCase().includes("OVERHEAD")) {
        jenisUtang = "BOP";
        totalSisa = utangs.filter(u => u.jenis === "BOP").reduce((sum, u) => sum + Number(u.sisa), 0);
      }
    }

    setData({
      ...data,
      id_akun: selectedId,
      jenis_utang: jenisUtang,
      _sisaUtang: totalSisa,
      nominal_bayar: "", // Reset nominal saat ganti akun
    });
  };

  // Filter akun berdasarkan jenis pengeluaran
  const getFilteredAkuns = () => {
    if (data.jenis_pengeluaran === "Pembayaran Utang Produksi") {
      return akuns.filter(a => {
        const kode = String(a.kode_akun || "").replace(/\s+/g, "");
        const nama = String(a.nama_akun || "").toUpperCase();
        return kode === "2001002" || kode === "2001003" || nama.includes("HUTANG GAJI") || nama.includes("HUTANG OVERHEAD");
      });
    }
    if (data.jenis_pengeluaran === "Operasional") {
      return akuns.filter(a => {
        const kode = String(a.kode_akun || "").replace(/\s+/g, "");
        const nama = String(a.nama_akun || "").toUpperCase();
        return kode.startsWith("6") || kode.startsWith("9") || nama.includes("BEBAN");
      });
    }
    return [];
  };

  const filteredAkuns = getFilteredAkuns();

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    post("/transaksi-pengeluaran", {
      onSuccess: () => {
        setShowForm(false);
        reset();
      },
    });
  };

  // ── Print Nota ──
  const handlePrint = (transaksi: TransaksiPengeluaran) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>Nota - ${transaksi.no_transaksi}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 14px; color: #000; }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 4px 0; }
            .total { font-size: 16px; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="text-center bold" style="font-size:16px;">BUKTI PENGELUARAN KAS</div>
          <div class="text-center">${transaksi.no_transaksi}</div>
          <div class="line"></div>
          <table>
            <tr><td>Tanggal</td><td>: ${new Date(transaksi.tgl_transaksi).toLocaleDateString("id-ID")}</td></tr>
            <tr><td>Jenis</td><td>: ${transaksi.jenis_pengeluaran}</td></tr>
            <tr><td>Akun</td><td>: ${transaksi.akun?.nama_akun || "-"}</td></tr>
            <tr><td>Metode</td><td>: ${transaksi.metode_bayar}</td></tr>
            <tr><td valign="top">Catatan</td><td>: ${transaksi.catatan || "-"}</td></tr>
          </table>
          <div class="line"></div>
          <div class="total">TOTAL: ${formatRupiah(transaksi.nominal_bayar)}</div>
          <div class="line"></div>
          <div class="text-center" style="margin-top:20px;">-- Disimpan Oleh Sistem --</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Filter tabel
  const filtered = transaksis.filter(p =>
    p.no_transaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.jenis_pengeluaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.akun?.nama_akun || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ═══════════════════════════════════════════════
  // VIEW 1: FORM
  // ═══════════════════════════════════════════════
  if (showForm) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-red-800">Form Pengeluaran Lain-lain</h3>
              <p className="text-xs text-gray-500 mt-0.5">Isi detail transaksi pengeluaran atau pembayaran utang</p>
            </div>
            <button onClick={handleBatal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSimpan} className="space-y-5">

              {/* No. Transaksi & Tanggal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>
                    No. Transaksi <span className="text-gray-400 font-normal text-xs">(Otomatis)</span>
                  </label>
                  <input type="text" value={data.no_transaksi} disabled className={readonlyCls + " font-mono"} />
                </div>
                <div>
                  <label className={labelCls}>Tanggal <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={data.tgl_transaksi}
                    onChange={(e) => setData("tgl_transaksi", e.target.value)}
                    className={inputCls}
                  />
                  {errors.tgl_transaksi && <span className="text-red-500 text-xs">{errors.tgl_transaksi}</span>}
                </div>
              </div>

              {/* Jenis Pengeluaran */}
              <div>
                <label className={labelCls}>Jenis Pengeluaran <span className="text-red-500">*</span></label>
                <select
                  value={data.jenis_pengeluaran}
                  onChange={handleJenisPengeluaranChange}
                  className={inputCls}
                >
                  <option value="">-- Pilih Jenis Pengeluaran --</option>
                  <option value="Operasional">Beban Operasional</option>
                  <option value="Pembayaran Utang Produksi">Pembayaran Utang Produksi</option>
                </select>
                {errors.jenis_pengeluaran && <span className="text-red-500 text-xs">{errors.jenis_pengeluaran}</span>}
              </div>

              {/* Pilih Akun & Sisa Terutang */}
              <div className={data.jenis_pengeluaran === "Pembayaran Utang Produksi" ? "grid grid-cols-1 md:grid-cols-2 gap-5 bg-red-50/50 p-4 rounded-lg border border-red-100" : ""}>
                <div>
                  <label className={labelCls}>Pilih Akun Terkait <span className="text-red-500">*</span></label>
                  <select
                    value={data.id_akun}
                    onChange={handleAkunChange} // Menggunakan handleAkunChange yang baru
                    className={inputCls}
                    disabled={!data.jenis_pengeluaran}
                  >
                    <option value="">
                      {!data.jenis_pengeluaran
                        ? "-- Pilih Jenis Pengeluaran Dahulu --"
                        : "-- Pilih Akun --"}
                    </option>
                    {filteredAkuns.map((a) => (
                      <option key={a.id_akun} value={a.id_akun}>
                        {a.kode_akun} — {a.nama_akun}
                      </option>
                    ))}
                  </select>
                  {errors.id_akun && <span className="text-red-500 text-xs">{errors.id_akun}</span>}
                </div>

                {/* Sisa Terutang Total Muncul Disini */}
                {data.jenis_pengeluaran === "Pembayaran Utang Produksi" && (
                  <div>
                    <label className={labelCls}>
                      Total Sisa Terutang <span className="text-gray-500 font-normal text-[10px]">(Semua Tagihan)</span>
                    </label>
                    <input
                      type="text"
                      value={data.id_akun && data._sisaUtang !== null ? formatRupiah(data._sisaUtang) : "-"}
                      readOnly
                      className={readonlyCls + " text-red-700"}
                    />
                  </div>
                )}
              </div>

              {/* Nominal & Metode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Nominal Dibayar (Rp) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={data.nominal_bayar}
                    onChange={(e) => setData("nominal_bayar", e.target.value)}
                    placeholder="0"
                    min="1"
                    className={inputCls}
                  />
                  {errors.nominal_bayar && <span className="text-red-500 text-xs">{errors.nominal_bayar}</span>}
                  
                  {/* Peringatan Melebihi Batas Total Utang */}
                  {data.jenis_pengeluaran === "Pembayaran Utang Produksi" &&
                    data._sisaUtang > 0 &&
                    Number(data.nominal_bayar) > data._sisaUtang && (
                      <span className="text-red-500 text-xs mt-1 block font-semibold">
                        Peringatan: Nominal pembayaran melebihi total utang yang ada!
                      </span>
                    )}
                </div>
                <div>
                  <label className={labelCls}>Metode Pembayaran <span className="text-red-500">*</span></label>
                  <select
                    value={data.metode_bayar}
                    onChange={(e) => setData("metode_bayar", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">-- Pilih Metode --</option>
                    <option value="Cash">Tunai (Cash)</option>
                    <option value="Transfer">Transfer Bank</option>
                  </select>
                  {errors.metode_bayar && <span className="text-red-500 text-xs">{errors.metode_bayar}</span>}
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className={labelCls}>Keterangan Tambahan</label>
                <textarea
                  value={data.catatan}
                  onChange={(e) => setData("catatan", e.target.value)}
                  placeholder="Opsional..."
                  rows={3}
                  className={inputCls + " resize-none"}
                />
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={processing || !data.jenis_pengeluaran || !data.nominal_bayar || !data.id_akun}
                  className="flex-1 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors bg-red-800 hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Menyimpan..." : "Simpan Transaksi"}
                </button>
                <button
                  type="button"
                  onClick={handleBatal}
                  className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // VIEW 2: TABEL
  // ═══════════════════════════════════════════════
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-red-800">Pengeluaran Lain-lain</h2>
          <p className="text-sm text-red-800 mt-1">Kelola data transaksi pengeluaran operasional dan utang produksi</p>
        </div>
        <button
          onClick={handleTambah}
          className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors text-sm font-medium"
        >
          <Plus className="w-5 h-5" /> Tambah Pengeluaran
        </button>
      </div>

      {/* Flash Success */}
      {flash?.success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3.5 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-800">{flash.success}</p>
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-lg shadow border border-gray-100">
        <div className="p-5">
          {/* Search */}
          <div className="relative mb-5 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari no. transaksi, akun, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-800"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">No. Transaksi</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Jenis</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Akun Terkait</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Metode</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">Nominal Dibayar</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-400 italic">
                      Tidak ada data transaksi.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id_transaksi} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">{p.no_transaksi}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {new Date(p.tgl_transaksi).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.jenis_pengeluaran === "Operasional"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
                        }`}>
                          {p.jenis_pengeluaran}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{p.akun?.nama_akun || "-"}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          {p.metode_bayar}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-800 whitespace-nowrap">
                        {formatRupiah(p.nominal_bayar)}
                      </td>
                      <td className="py-3 px-4 text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedDetail(p)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(p)}
                          className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                          title="Print Nota"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-100 border-t-2 border-gray-200">
                    <td colSpan={5} className="py-3 px-4 text-sm font-bold text-gray-800 text-right">
                      Total Pengeluaran:
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-red-700 text-right whitespace-nowrap">
                      {formatRupiah(filtered.reduce((s, p) => s + Number(p.nominal_bayar), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Detail Transaksi</h3>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">No Transaksi</span>
                <span className="text-sm font-semibold text-gray-800">{selectedDetail.no_transaksi}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Tanggal</span>
                  <span className="text-sm text-gray-800">
                    {new Date(selectedDetail.tgl_transaksi).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Metode</span>
                  <span className="text-sm text-gray-800">{selectedDetail.metode_bayar}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Jenis Pengeluaran</span>
                <span className="text-sm text-gray-800 font-medium">{selectedDetail.jenis_pengeluaran}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Akun Terkait</span>
                <span className="text-sm text-gray-800 font-medium">{selectedDetail.akun?.nama_akun || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Catatan</span>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1 whitespace-pre-line">
                  {selectedDetail.catatan || (
                    <span className="text-gray-400 italic">Tidak ada catatan</span>
                  )}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Nominal Dibayar</span>
                <span className="text-xl font-bold text-red-700">{formatRupiah(selectedDetail.nominal_bayar)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
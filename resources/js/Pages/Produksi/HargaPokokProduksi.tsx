import { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import {
  ChevronLeft,
  Search,
  Calculator,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BahanBakuHPP {
  kode_material: string;
  nama_material: string;
  qty_pemakaian: number;
  satuan: string;
  harga_satuan: number;
  total_biaya: number;
}

interface TenagaKerjaHPP {
  id: string;
  nama_divisi: string;
  jumlah_orang: number;
  tarif_per_hari: number;
}

interface OverheadHPP {
  nama_overhead: string;
  biaya: number;
}

interface HPPRecord {
  id: string;
  no_produksi: string;
  tanggal_produksi: string;
  kode_produk: string;
  nama_produk: string;
  qty_rencana: number;
  satuan: string;
  catatan: string;
  status_hpp: "Belum Input" | "Sudah Input";
  bahan_baku: BahanBakuHPP[];
  tenaga_kerja: TenagaKerjaHPP[];
  overhead: OverheadHPP[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rp = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso: string) => {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const genId = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

// ─── COGM Summary (shared) ────────────────────────────────────────────────────

function CogmSummary({
  totalBB,
  totalTK,
  totalOH,
  qty,
  satuan,
}: {
  totalBB: number;
  totalTK: number;
  totalOH: number;
  qty: number;
  satuan: string;
}) {
  const totalCOGM = totalBB + totalTK + totalOH;
  const cogmPerPcs = qty > 0 ? Math.round(totalCOGM / qty) : 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="w-4 h-4" /> Ringkasan Total COGM
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label: "Total Bahan Baku (BBB)", value: rp(totalBB) },
            { label: "Total Tenaga Kerja (BTKL)", value: rp(totalTK) },
            { label: "Total Overhead (BOP)", value: rp(totalOH) },
            { label: "Total COGM", value: rp(totalCOGM) },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="font-bold text-sm text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-gray-100 flex items-center gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total COGM / pcs (otomatis)</p>
            <div className="px-4 py-2.5 bg-gray-100 border-2 border-gray-300 rounded-lg inline-flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-gray-800">{rp(cogmPerPcs)}</span>
              <span className="text-xs text-gray-500">/ {satuan}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 max-w-56 leading-relaxed">
            Dihitung otomatis dari total semua komponen biaya dibagi jumlah produksi.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Header Info Card (shared) ────────────────────────────────────────────────

function HeaderCard({ record }: { record: HPPRecord }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Informasi Produksi
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-400 mb-1">Kode Produksi</p>
            <p className="text-sm font-semibold text-gray-700">{record.no_produksi}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-400 mb-1">Produk</p>
            <p className="text-sm font-semibold text-gray-700">{record.nama_produk}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-400 mb-1">Jumlah Produksi</p>
            <p className="text-sm font-semibold text-gray-700">
              {record.qty_rencana?.toLocaleString("id-ID") ?? 0} {record.satuan}
            </p>
          </div>
        </div>
        {record.catatan && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs font-medium text-yellow-700 mb-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Catatan Pemakaian Bahan
            </p>
            <p className="text-sm text-yellow-900">{record.catatan}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── View HPP (read-only) ─────────────────────────────────────────────────────

function ViewHPP({ record, onBack }: { record: HPPRecord; onBack: () => void; }) {
  const [activeTab, setActiveTab] = useState<"bahan-baku" | "tenaga-kerja" | "overhead">("bahan-baku");

  const totalBB = record.bahan_baku?.reduce((s, b) => s + Number(b.total_biaya), 0) || 0;
  const totalTK = record.tenaga_kerja?.reduce((s, t) => s + (Number(t.jumlah_orang) * Number(t.tarif_per_hari)), 0) || 0;
  const totalOH = record.overhead?.reduce((s, o) => s + Number(o.biaya), 0) || 0;

  return (
    <div className="p-6 space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-red-700 hover:text-red-900 font-medium">
        <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar HPP
      </button>
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Detail Harga Pokok Produksi</h2>
          <p className="text-sm text-gray-500 mt-0.5">Data HPP sudah tersimpan dan tidak dapat diubah</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Input
        </span>
      </div>

      <HeaderCard record={record} />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button onClick={() => setActiveTab("bahan-baku")} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "bahan-baku" ? "bg-red-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              Biaya Bahan Baku
            </button>
            <button onClick={() => setActiveTab("tenaga-kerja")} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "tenaga-kerja" ? "bg-red-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              Biaya Tenaga Kerja (BTKL)
            </button>
            <button onClick={() => setActiveTab("overhead")} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "overhead" ? "bg-red-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              Biaya Overhead (BOP)
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "bahan-baku" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Bahan</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {record.bahan_baku?.map((b, i) => (
                    <tr key={b.kode_material || i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 text-gray-700">{b.nama_material}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{rp(b.total_biaya)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan={2} className="px-4 py-3 text-right font-bold text-gray-700 uppercase">Total Biaya Bahan Baku</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{rp(totalBB)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {activeTab === "tenaga-kerja" && (
            <div className="overflow-x-auto">
              {!record.tenaga_kerja || record.tenaga_kerja.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">Tidak ada data tenaga kerja.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Divisi</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Jumlah Orang</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Tarif / Hari</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Subtotal BTKL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {record.tenaga_kerja.map((t, i) => (
                      <tr key={t.id || i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-700">{t.nama_divisi}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{t.jumlah_orang} Orang</td>
                        <td className="px-4 py-3 text-right text-gray-700">{rp(t.tarif_per_hari)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{rp(t.jumlah_orang * t.tarif_per_hari)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-700 uppercase">Total Biaya Tenaga Kerja</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">{rp(totalTK)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}

          {activeTab === "overhead" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Jenis Overhead</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {record.overhead?.map((o, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 text-gray-700">{o.nama_overhead}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{rp(o.biaya)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan={2} className="px-4 py-3 text-right font-bold text-gray-700 uppercase">Total Biaya Overhead</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{rp(totalOH)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      <CogmSummary totalBB={totalBB} totalTK={totalTK} totalOH={totalOH} qty={record.qty_rencana} satuan={record.satuan} />

      <div className="flex justify-end">
        <button onClick={onBack} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
          Tutup
        </button>
      </div>
    </div>
  );
}

// ─── Form Input HPP (editable) ────────────────────────────────────────────────

function FormInputHPP({
  record,
  divisiOptions,
  overheadDefaults,
  onSave,
  onBack,
  isProcessing
}: {
  record: HPPRecord;
  divisiOptions: string[];
  overheadDefaults: OverheadHPP[];
  onSave: (r: HPPRecord) => void;
  onBack: () => void;
  isProcessing: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"bahan-baku" | "tenaga-kerja" | "overhead">("bahan-baku");
  
  // Tenaga kerja diinisiasi langsung mem-map semua divisi yang ada di master divisi (default 0)
  const [tenagaKerja, setTenagaKerja] = useState<TenagaKerjaHPP[]>(
    record.tenaga_kerja && record.tenaga_kerja.length > 0 
      ? record.tenaga_kerja 
      : divisiOptions.map((divisiName) => ({
          id: genId(),
          nama_divisi: divisiName,
          jumlah_orang: 0,
          tarif_per_hari: 0
        }))
  );

  const [overhead, setOverhead] = useState<OverheadHPP[]>(
    record.overhead && record.overhead.length > 0 ? record.overhead : overheadDefaults
  );

  const totalBB = record.bahan_baku?.reduce((s, b) => s + Number(b.total_biaya), 0) || 0;
  const totalTK = tenagaKerja.reduce((s, t) => s + (Number(t.jumlah_orang) * Number(t.tarif_per_hari)), 0);
  const totalOH = overhead.reduce((s, o) => s + Number(o.biaya), 0);

  const updateTK = (id: string, field: keyof TenagaKerjaHPP, val: string | number) =>
    setTenagaKerja((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: val } : t)));
    
  const updateOH = (i: number, val: number) => setOverhead((prev) => prev.map((o, idx) => (idx === i ? { ...o, biaya: val } : o)));

  return (
    <div className="p-6 space-y-5">
      <button onClick={onBack} disabled={isProcessing} className="inline-flex items-center gap-1.5 text-sm text-red-700 hover:text-red-900 font-medium disabled:opacity-50">
        <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar HPP
      </button>
      <div>
        <h2 className="text-lg font-bold text-gray-800">Input Harga Pokok Produksi</h2>
        <p className="text-sm text-gray-500 mt-0.5">Masukkan komponen biaya untuk menghitung COGM</p>
      </div>

      <HeaderCard record={record} />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button onClick={() => setActiveTab("bahan-baku")} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "bahan-baku" ? "bg-red-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              Biaya Bahan Baku
            </button>
            <button onClick={() => setActiveTab("tenaga-kerja")} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "tenaga-kerja" ? "bg-red-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              Biaya Tenaga Kerja (BTKL)
            </button>
            <button onClick={() => setActiveTab("overhead")} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "overhead" ? "bg-red-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              Biaya Overhead (BOP)
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "bahan-baku" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Bahan</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {record.bahan_baku?.map((b, i) => (
                    <tr key={b.kode_material || i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 text-gray-700">{b.nama_material}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{rp(b.total_biaya)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan={2} className="px-4 py-3 text-right font-bold text-gray-700 uppercase">Total Biaya Bahan Baku</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{rp(totalBB)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {activeTab === "tenaga-kerja" && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Masukkan jumlah pekerja dan tarif harian untuk masing-masing divisi. <br/>
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Divisi</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Jumlah Orang</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Tarif / Hari</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Total (Subtotal BTKL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tenagaKerja.map((t, i) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {t.nama_divisi}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number" 
                            min={0} 
                            value={t.jumlah_orang}
                            onChange={(e) => updateTK(t.id, "jumlah_orang", Number(e.target.value))}
                            className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-red-500 ml-auto block"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number" 
                            min={0} 
                            step={1000} 
                            value={t.tarif_per_hari}
                            onChange={(e) => updateTK(t.id, "tarif_per_hari", Number(e.target.value))}
                            className="w-32 px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-red-500 ml-auto block"
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 font-bold">
                          {rp(t.jumlah_orang * t.tarif_per_hari)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-700 uppercase tracking-wide">Total Biaya Tenaga Kerja</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">{rp(totalTK)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}

          {activeTab === "overhead" && (
            <>
              <p className="text-sm text-gray-600 mb-4">Masukkan biaya overhead produksi. Data dapat disesuaikan dari nilai default.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Jenis Overhead</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Biaya (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {overhead.map((o, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-700">{o.nama_overhead}</td>
                        <td className="px-4 py-3 text-right">
                          <input type="number" min={0} step={1000} value={o.biaya} onChange={(e) => updateOH(i, Number(e.target.value))}
                            className="w-40 px-3 py-1.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-red-500 ml-auto block" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td colSpan={2} className="px-4 py-3 text-right font-bold text-gray-700 uppercase tracking-wide">Total Biaya Overhead</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">{rp(totalOH)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <CogmSummary totalBB={totalBB} totalTK={totalTK} totalOH={totalOH} qty={record.qty_rencana} satuan={record.satuan} />

      <div className="flex items-center justify-end gap-3">
        <button onClick={onBack} disabled={isProcessing} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50">
          Batal
        </button>
        <button
          disabled={isProcessing}
          onClick={() => onSave({ ...record, tenaga_kerja: tenagaKerja, overhead })}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-700 text-white hover:bg-red-800 text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-4 h-4" /> 
          {isProcessing ? "Menyimpan..." : "Simpan HPP"}
        </button>
      </div>
    </div>
  );
}

// ─── List HPP ─────────────────────────────────────────────────────────────────

function ProduksiTable({ rows, onAction, isSudahInput }: { rows: HPPRecord[]; onAction: (r: HPPRecord) => void; isSudahInput: boolean; }) {
  if (rows.length === 0) return <div className="py-10 text-center text-gray-400 text-sm">Tidak ada data.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-left">
            {["No", "Kode Produksi", "Tanggal Produksi", "Produk", "Jumlah Produksi", "Aksi"].map((h) => (
              <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => (
            <tr key={r.id || i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-400">{i + 1}</td>
              <td className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{r.no_produksi}</td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(r.tanggal_produksi)}</td>
              <td className="px-4 py-3 text-gray-700">{r.nama_produk}</td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {r.qty_rencana?.toLocaleString("id-ID") ?? 0} {r.satuan}
              </td>
              <td className="px-4 py-3">
                {isSudahInput ? (
                  <button onClick={() => onAction(r)} title="Lihat Detail HPP" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => onAction(r)} title="Input HPP" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <FileText className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListHPP({ data, onSelect }: { data: HPPRecord[]; onSelect: (r: HPPRecord) => void; }) {
  const [searchBelum, setSearchBelum] = useState("");
  const [searchSudah, setSearchSudah] = useState("");

  const matchBelum = (r: HPPRecord) => !searchBelum || r.no_produksi?.toLowerCase().includes(searchBelum.toLowerCase()) || r.nama_produk?.toLowerCase().includes(searchBelum.toLowerCase());
  const matchSudah = (r: HPPRecord) => !searchSudah || r.no_produksi?.toLowerCase().includes(searchSudah.toLowerCase()) || r.nama_produk?.toLowerCase().includes(searchSudah.toLowerCase());

  const belum = data.filter((r) => r.status_hpp === "Belum Input" && matchBelum(r));
  const sudah = data.filter((r) => r.status_hpp === "Sudah Input" && matchSudah(r));

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-red-800">Harga Pokok Produksi</h2>
        <p className="text-sm text-red-800 mt-1">Perhitungan Harga Pokok Produksi (COGM)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center mb-3">
            <div className="text-yellow-600"><Clock className="w-3 h-3" /></div>
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Belum Input HPP</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{belum.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <div className="text-green-600"><CheckCircle2 className="w-3 h-3" /></div>
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Sudah Input HPP</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{sudah.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-bold text-red-800">Belum Input HPP</h3></div>
        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Cari kode produksi atau produk..." value={searchBelum} onChange={(e) => setSearchBelum(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400" />
          </div>
          <ProduksiTable rows={belum} onAction={onSelect} isSudahInput={false} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-bold text-red-800">Sudah Input HPP</h3></div>
        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Cari kode produksi atau produk..." value={searchSudah} onChange={(e) => setSearchSudah(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400" />
          </div>
          <ProduksiTable rows={sudah} onAction={onSelect} isSudahInput={true} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HargaPokokProduksi() {
  // Mengambil props dinamis dari Laravel Controller
  const { hppData = [], masterDivisi = [], masterOverhead = [] } = usePage().props as any;
  
  // Jika props master kosong, sediakan fallback sementara agar UI tidak pecah
  const defaultDivisi = masterDivisi.length > 0 ? masterDivisi : ["Divisi Produksi"];
  const defaultOH = masterOverhead.length > 0 ? masterOverhead : [{ nama_overhead: "Overhead Pabrik", biaya: 0 }];

  const [data, setData] = useState<HPPRecord[]>(hppData);
  const [selected, setSelected] = useState<HPPRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync state dengan Inertia Props (Berguna bila data di database berubah setelah request POST)
  useEffect(() => {
    setData(hppData);
  }, [hppData]);

  const handleSave = (updatedRecord: HPPRecord) => {
    setIsProcessing(true);
    
    // Injeksi state via Inertia Router ke Back-End
    router.post('/produksi/hpp', updatedRecord as any, {
      preserveScroll: true,
      onSuccess: () => {
        setSelected(null); // Menutup form otomatis ketika transaksi SQL berhasil
      },
      onFinish: () => {
        setIsProcessing(false);
      }
    });
  };

  if (selected) {
    return selected.status_hpp === "Sudah Input" ? (
      <ViewHPP record={selected} onBack={() => setSelected(null)} />
    ) : (
      <FormInputHPP 
        record={selected} 
        divisiOptions={defaultDivisi}
        overheadDefaults={defaultOH}
        onSave={handleSave} 
        onBack={() => setSelected(null)} 
        isProcessing={isProcessing}
      />
    );
  }

  return <ListHPP data={data} onSelect={setSelected} />;
}
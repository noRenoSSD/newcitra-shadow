import { useState } from 'react';
import { Plus, Eye, Pencil, Trash2, Search, Package, X, AlertCircle, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';

// ─── Types ───────────────────────────────────────────────────────────────────
type StatusJadwal = 'Draft' | 'Pending Approval' | 'Revision Required' | 'Approved';

// Data kebutuhan bahan yang sudah tersimpan di DB
interface KebutuhanBahanDB {
  id_kebutuhan_bahan: number;
  id_produksi: number;
  id_detail_bom: number;
  qty_bahan_snapshot: number;
  qty_kebutuhan: number;
  tanggal_generate: string;
  detail_bom?: {
    id_detail_bom: number;
    id_bahan: number;
    bahan?: { kode_bahan: string; nama_bahan: string; jenis_bahan: string; satuan_bahan: string };
  };
}

interface DetailJadwalProduksi {
  id_produksi?: number;
  kode_produksi: string;
  tanggal_produksi: string;
  id_produk: number | string;
  id_bom: number | string;
  qty_rencana: number | string;
  catatan: string | null;
  produk?: { id_produk: number; kode_produk: string; nama_produk: string };
  bom?: { id_bom: number; kode_bom: string; nama_resep: string; qty_batch: number; satuan_batch?: string; satuan?: string };
  kebutuhan_bahan?: KebutuhanBahanDB[]; // ← relasi ke t_kebutuhan_bahan
}

interface GeneratedMaterial {
  id_detail_bom: number; // ← dibutuhkan untuk simpan ke DB
  kode_bahan: string;
  nama_bahan: string;
  jenis_bahan: string;
  satuan_bahan: string;
  qty_standar: number;
  qty_kebutuhan: number;
}

interface JadwalProduksi {
  id_jadwal?: number;
  kode_jadwal: string;
  periode: string;
  tanggal_dibuat: string;
  jumlah_produksi: number;
  status_jadwal: StatusJadwal;
  komentar_owner?: string | null; // ← field komentar dari owner/approver
  detail_produksi: DetailJadwalProduksi[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '-');
const today = () => new Date().toISOString().split('T')[0];

const bulanOptions = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const currentGlobalYear = new Date().getFullYear();
const tahunOptions = Array.from({ length: 6 }, (_, i) => String(currentGlobalYear + i));

const statusBadge: Record<StatusJadwal, { label: string; className: string; icon: React.ReactNode }> = {
  Draft:              { label: 'Draft',                 className: 'text-gray-600',                                   icon: <Clock className="w-3.5 h-3.5" /> },
  'Pending Approval': { label: 'Menunggu Persetujuan',  className: 'bg-yellow-50 text-yellow-700 border-yellow-200',  icon: <AlertCircle className="w-3.5 h-3.5" /> },
  'Revision Required':{ label: 'Revisi',                className: 'bg-orange-50 text-orange-700 border-orange-200',  icon: <XCircle className="w-3.5 h-3.5" /> },
  Approved:           { label: 'Disetujui',             className: 'bg-green-50 text-green-700 border-green-200',     icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

function StatusBadge({ status }: { status: StatusJadwal }) {
  const s = statusBadge[status] || statusBadge['Draft'];
  if (status === 'Draft') {
    return <span className={`inline-flex items-center gap-1 text-sm font-medium ${s.className}`}>{s.icon} {s.label}</span>;
  }
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${s.className}`}>{s.icon} {s.label}</span>;
}

// ─── View Kebutuhan Material ──────────────────────────────────────────────────
function ViewKebutuhanMaterial({
  detail,
  jadwal,
  masterBom,
  masterBahan,
  onBack,
}: {
  detail: DetailJadwalProduksi;
  jadwal: JadwalProduksi;
  masterBom: any[];
  masterBahan: any[];
  onBack: () => void;
}) {
  const isApproved   = jadwal.status_jadwal === 'Approved';
  const existingData = detail.kebutuhan_bahan ?? [];
  const sudahGenerate = existingData.length > 0;

  // Inisialisasi tabel dari data DB jika sudah pernah digenerate
  const initMaterials: GeneratedMaterial[] = existingData.map((k) => {
    const bahan = k.detail_bom?.bahan;
    return {
      id_detail_bom: k.id_detail_bom,
      kode_bahan:    bahan?.kode_bahan    ?? '-',
      nama_bahan:    bahan?.nama_bahan    ?? '-',
      jenis_bahan:   bahan?.jenis_bahan   ?? '-',
      satuan_bahan:  bahan?.satuan_bahan  ?? '-',
      qty_standar:   Number(k.qty_bahan_snapshot),
      qty_kebutuhan: Number(k.qty_kebutuhan),
    };
  });

  const [generatedMaterials, setGeneratedMaterials] = useState<GeneratedMaterial[]>(initMaterials);
  const [isGenerated, setIsGenerated]   = useState(sudahGenerate);
  const [isSaving,    setIsSaving]      = useState(false);

  const handleGenerate = () => {
    if (!isApproved || isGenerated || isSaving) return;

    const fullBom    = masterBom?.find((b: any) => String(b.id_bom || b.id) === String(detail.id_bom));
    const qtyBatch   = fullBom?.qty_batch || detail.bom?.qty_batch || 1;
    const qtyRencana = Number(detail.qty_rencana) || 0;
    const rasio      = qtyRencana / qtyBatch;
    const rawDetails = fullBom?.details || fullBom?.detail_boms || fullBom?.detailBoms || fullBom?.detail_bom || [];

    if (rawDetails.length === 0) {
      alert('⚠️ Gagal: Detail bahan kosong. Pastikan JadwalProduksiController memuat relasi BOM menggunakan with().');
      return;
    }

    const materials: GeneratedMaterial[] = rawDetails.map((m: any) => {
      const targetIdBahan = m.kodeMaterial || m.id_bahan;
      const matInfo       = masterBahan?.find((mb: any) => String(mb.id_bahan || mb.id) === String(targetIdBahan));
      const qtyStandar    = Number(m.jumlahBahan || m.jumlah_bahan || 0);
      return {
        id_detail_bom: Number(m.id_detail_bom),  // wajib ada di controller
        kode_bahan:    matInfo?.kode_bahan    || targetIdBahan || '-',
        nama_bahan:    matInfo?.nama_bahan    || m.namaMaterial || 'Bahan tidak ditemukan',
        jenis_bahan:   matInfo?.jenis_bahan   || (String(matInfo?.kode_bahan || targetIdBahan).startsWith('BB') ? 'Bahan Baku' : 'Bahan Penolong'),
        satuan_bahan:  matInfo?.satuan_bahan  || m.satuan || '-',
        qty_standar:   qtyStandar,
        qty_kebutuhan: qtyStandar * rasio,
      };
    });

    setIsSaving(true);

    // Simpan ke database via Inertia POST
    router.post('/kebutuhan-bahan', {
      id_produksi:     detail.id_produksi,
      tanggal_generate: today(),
      items: materials.map((m) => ({
        id_detail_bom:      m.id_detail_bom,
        qty_bahan_snapshot: m.qty_standar,
        qty_kebutuhan:      m.qty_kebutuhan,
      })),
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setGeneratedMaterials(materials);
        setIsGenerated(true);
        setIsSaving(false);
      },
      onError: () => {
        alert('❌ Gagal menyimpan kebutuhan bahan. Silakan coba lagi.');
        setIsSaving(false);
      },
    });
  };

  const formatNumber = (num: number) =>
    num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const satuanResep = detail.bom?.satuan_batch || detail.bom?.satuan || 'Pcs';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kebutuhan Material — {detail.kode_produksi}</h2>
          <p className="text-sm text-gray-500 mt-1">{detail.produk?.nama_produk} ({jadwal.kode_jadwal})</p>
        </div>
        <button onClick={onBack} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors inline-flex items-center gap-2">
          <X className="w-4 h-4" /> Kembali
        </button>
      </div>

      {/* Info Ringkas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Kode Produksi',     value: detail.kode_produksi },
          { label: 'Produk',            value: detail.produk?.nama_produk || '-' },
          { label: 'Nama Resep',        value: detail.bom?.nama_resep || '-' },
          { label: 'Kuantitas Batch',   value: `${detail.bom?.qty_batch || 0} ${satuanResep}` },
          { label: 'Kuantitas Rencana', value: `${detail.qty_rencana} ${satuanResep}` },
          { label: 'Satuan',            value: satuanResep },
          { label: 'Tanggal Produksi',  value: formatDate(detail.tanggal_produksi) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
            <p className="text-sm font-semibold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Generate Kebutuhan Material */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Generate Kebutuhan Material</p>
            {!isApproved && (
              <p className="text-xs text-orange-500 mt-1">⚠️ Generate hanya tersedia setelah jadwal disetujui.</p>
            )}
          </div>

          {/* Tombol: disabled jika belum Approved, sedang menyimpan, atau sudah pernah digenerate */}
          {isGenerated ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-not-allowed">
              <CheckCircle2 className="w-4 h-4" /> Sudah Digenerate
            </span>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!isApproved || isSaving}
              className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 text-sm font-medium inline-flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? 'Menyimpan...' : 'Generate Kebutuhan'}
            </button>
          )}
        </div>

        {isGenerated && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hasil Generate Kebutuhan Material</p>
              {sudahGenerate && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Tersimpan di Database</span>
              )}
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="p-3 font-semibold text-center w-12">No</th>
                    <th className="p-3 font-semibold">Kode Bahan</th>
                    <th className="p-3 font-semibold">Nama Bahan</th>
                    <th className="p-3 font-semibold">Jenis Bahan</th>
                    <th className="p-3 font-semibold">Satuan Bahan</th>
                    <th className="p-3 font-semibold text-right">Kuantitas Standar</th>
                    <th className="p-3 font-semibold text-right">Kuantitas Kebutuhan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {generatedMaterials.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-3 text-center text-gray-500">{i + 1}</td>
                      <td className="p-3 font-medium text-gray-700">{m.kode_bahan}</td>
                      <td className="p-3 text-gray-800">{m.nama_bahan}</td>
                      <td className="p-3 text-gray-500">{m.jenis_bahan}</td>
                      <td className="p-3 text-gray-600">{m.satuan_bahan}</td>
                      <td className="p-3 text-right text-gray-700">{formatNumber(m.qty_standar)}</td>
                      <td className="p-3 text-right font-bold text-red-700">{formatNumber(m.qty_kebutuhan)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── View Detail Jadwal ───────────────────────────────────────────────────────
function ViewDetail({ jadwal, masterBom, masterBahan, onBack }: {
  jadwal: JadwalProduksi;
  masterBom: any[];
  masterBahan: any[];
  onBack: () => void;
}) {
  const [materialDetail, setMaterialDetail] = useState<DetailJadwalProduksi | null>(null);

  if (materialDetail) {
    return (
      <ViewKebutuhanMaterial
        detail={materialDetail}
        jadwal={jadwal}
        masterBom={masterBom}
        masterBahan={masterBahan}
        onBack={() => setMaterialDetail(null)}
      />
    );
  }

  const isApproved  = jadwal.status_jadwal === 'Approved';
  const isRevisi    = jadwal.status_jadwal === 'Revision Required';
  const isPending   = jadwal.status_jadwal === 'Pending Approval';
  const hasKomentar = !!jadwal.komentar_owner;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Detail Jadwal Produksi</h2>
        <button onClick={onBack} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
          Kembali ke Daftar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* ── Informasi Jadwal ── */}
        <div className="p-6 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Informasi Jadwal</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-50/80 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-medium text-gray-400 mb-1">Kode Jadwal</p>
              <p className="text-sm font-semibold text-gray-800">{jadwal.kode_jadwal}</p>
            </div>
            <div className="bg-slate-50/80 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-medium text-gray-400 mb-1">Periode</p>
              <p className="text-sm font-semibold text-gray-800">{jadwal.periode}</p>
            </div>
            <div className="bg-slate-50/80 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-medium text-gray-400 mb-1">Tanggal Dibuat</p>
              <p className="text-sm font-semibold text-gray-800">{formatDate(jadwal.tanggal_dibuat)}</p>
            </div>
          </div>

          {/* Status Jadwal */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-gray-100 inline-block min-w-[180px]">
            <p className="text-xs font-medium text-gray-400 mb-2">Status Jadwal</p>
            <StatusBadge status={jadwal.status_jadwal} />
          </div>

          {/* ── Catatan Persetujuan (Approved) ── */}
          {isApproved && hasKomentar && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1.5">
                Catatan Persetujuan
              </p>
              <p className="text-sm text-green-800">{jadwal.komentar_owner}</p>
            </div>
          )}

          {/* ── Catatan Revisi (Revision Required) ── */}
          {isRevisi && hasKomentar && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1.5">
                Catatan Revisi
              </p>
              <p className="text-sm text-orange-800">{jadwal.komentar_owner}</p>
            </div>
          )}

          {/* ── Menunggu persetujuan ── */}
          {isPending && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-1.5">
                Status Pengajuan
              </p>
              <p className="text-sm text-yellow-800">
                Jadwal ini sedang menunggu persetujuan dari owner. Harap tunggu konfirmasi.
              </p>
            </div>
          )}
        </div>

        {/* ── Detail Jadwal Produksi ── */}
        <div>
          <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detail Jadwal Produksi</p>
          </div>
          <div className="overflow-x-auto">
            {!jadwal.detail_produksi?.length ? (
              <div className="py-12 text-center text-gray-400">Belum ada item produksi</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-gray-500 border-b border-gray-100 bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Kode Produksi</th>
                    <th className="py-3 px-4 font-semibold">Tanggal Produksi</th>
                    <th className="py-3 px-4 font-semibold">Produk</th>
                    <th className="py-3 px-4 font-semibold">Resep/BOM</th>
                    <th className="py-3 px-4 font-semibold">Qty Rencana</th>
                    <th className="py-3 px-4 font-semibold">Satuan</th>
                    <th className="py-3 px-4 font-semibold">Keterangan</th>
                    <th className="py-3 px-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jadwal.detail_produksi.map((d, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                      <td className="py-3 px-4 font-medium text-gray-800">{d.kode_produksi}</td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{formatDate(d.tanggal_produksi)}</td>
                      <td className="py-3 px-4 text-gray-800">{d.produk?.nama_produk || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{d.bom?.nama_resep || '-'}</td>
                      <td className="py-3 px-4 text-gray-800">{Number(d.qty_rencana).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-gray-600">{d.bom?.satuan_batch || d.bom?.satuan || 'Pack'}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{d.catatan || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setMaterialDetail(d)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Package className="w-3.5 h-3.5" /> Kebutuhan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2.5 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Kembali
        </button>

        {isApproved && (
          <button
            disabled
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-100 text-green-600 text-sm font-medium rounded-lg cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" /> Sudah Disetujui
          </button>
        )}
        {isRevisi && (
          <button
            disabled
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-100 text-orange-500 text-sm font-medium rounded-lg cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" /> Menunggu Revisi
          </button>
        )}
        {isPending && (
          <button
            disabled
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-lg cursor-not-allowed"
          >
            <AlertCircle className="w-4 h-4" /> Menunggu Persetujuan
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Modal Tambah Produksi ────────────────────────────────────────────────────
function ModalTambahProduksi({ masterProduk, masterBom, onSimpan, onBatal, nextKode }: any) {
  const [form, setForm] = useState({
    tanggal_produksi: today(),
    id_produk: '',
    id_bom: '',
    qty_rencana: '' as string | number,
    catatan: '',
  });

  const safeProduk  = Array.isArray(masterProduk) ? masterProduk : [];
  const safeBom     = Array.isArray(masterBom) ? masterBom : [];
  const selectedBOM = safeBom.find((b: any) => String(b.id_bom) === String(form.id_bom));
  const selectedProduk = safeProduk.find((p: any) => String(p.id_produk) === String(form.id_produk));

  const handleSimpan = () => {
    if (!form.id_produk || !form.id_bom || !form.qty_rencana) return;
    onSimpan({
      kode_produksi:    nextKode,
      tanggal_produksi: form.tanggal_produksi,
      id_produk:        parseInt(form.id_produk),
      id_bom:           parseInt(form.id_bom),
      qty_rencana:      Number(form.qty_rencana),
      catatan:          form.catatan,
      produk:           selectedProduk,
      bom:              selectedBOM,
    });
  };

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-800 to-red-900 px-6 py-4 text-white font-semibold">
          Tambah Item Produksi
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kode Produksi</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold">{nextKode}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Produksi *</label>
            <input type="date" value={form.tanggal_produksi} onChange={e => setForm({ ...form, tanggal_produksi: e.target.value })} className="input-form text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Produk *</label>
            <select value={form.id_produk} onChange={e => setForm({ ...form, id_produk: e.target.value })} className="input-form text-sm">
              <option value="">-- Pilih Produk --</option>
              {safeProduk.map((p: any) => <option key={p.id_produk} value={p.id_produk}>{p.kode_produk} - {p.nama_produk}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Resep/BOM *</label>
            <select value={form.id_bom} onChange={e => setForm({ ...form, id_bom: e.target.value })} className="input-form text-sm">
              <option value="">-- Pilih Resep/BOM --</option>
              {safeBom.map((b: any) => <option key={b.id_bom} value={b.id_bom}>{b.kode_bom} - {b.nama_resep}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Qty Rencana *</label>
              <input type="number" min={1} value={form.qty_rencana} onChange={e => setForm({ ...form, qty_rencana: e.target.value === '' ? '' : Number(e.target.value) })} className="input-form text-sm text-right" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Satuan</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-bold h-[38px] flex items-center">
                {selectedBOM ? (selectedBOM.satuan_batch || selectedBOM.satuan || 'Pcs') : '-'}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Keterangan</label>
            <input type="text" placeholder="Tambahkan keterangan..." value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} className="input-form text-sm" />
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
          <button onClick={onBatal} className="btn-secondary text-sm">Batal</button>
          <button
            onClick={handleSimpan}
            disabled={!form.id_produk || !form.id_bom || !form.qty_rencana || Number(form.qty_rencana) <= 0}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Simpan Item
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Form (Create / Edit) ────────────────────────────────────────────────
function ViewForm({ jadwal, allJadwal, onSave, onCancel, masterProduk, masterBom, nextKodeJadwal, nextProduksiNumber, currentYear }: any) {
  const isEdit = !!jadwal;

  const fallbackKode    = `JDW-${currentGlobalYear}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`;
  const kodeJadwalTampil = isEdit ? jadwal.kode_jadwal : (nextKodeJadwal || fallbackKode);

  const defaultBulan = bulanOptions[new Date().getMonth()];
  const defaultTahun = String(currentGlobalYear);

  const [bulan,        setBulan]        = useState(jadwal?.periode?.split(' ')[0] || defaultBulan);
  const [tahun,        setTahun]        = useState(jadwal?.periode?.split(' ')[1] || defaultTahun);
  const [tanggalDibuat,setTanggalDibuat]= useState(jadwal?.tanggal_dibuat ?? today());
  const [selectedRefNo,setSelectedRefNo]= useState('-');
  const [details,      setDetails]      = useState<DetailJadwalProduksi[]>(jadwal?.detail_produksi ?? []);
  const [showModal,    setShowModal]    = useState(false);

  const safeJadwal = Array.isArray(allJadwal)    ? allJadwal    : [];
  const safeProduk = Array.isArray(masterProduk)  ? masterProduk : [];
  const safeBom    = Array.isArray(masterBom)     ? masterBom    : [];

  const formDate     = new Date(parseInt(tahun), bulanOptions.indexOf(bulan), 1);
  const availableRefs = safeJadwal
    .filter((j: any) => {
      if (j.id_jadwal === jadwal?.id_jadwal || j.status_jadwal !== 'Approved' || !j.periode) return false;
      const [jBulan, jTahun] = j.periode.split(' ');
      const jDate = new Date(parseInt(jTahun), bulanOptions.indexOf(jBulan), 1);
      const diffMonths = (formDate.getFullYear() - jDate.getFullYear()) * 12 + (formDate.getMonth() - jDate.getMonth());
      return diffMonths > 0 && diffMonths <= 12;
    })
    .sort((a: any, b: any) => {
      const toDate = (p: string) => { const [m, y] = p.split(' '); return new Date(parseInt(y), bulanOptions.indexOf(m), 1).getTime(); };
      return toDate(b.periode) - toDate(a.periode);
    });

  const getNextKodeProduksi = (offset = 0) => {
    let maxCurrent = 0;
    details.forEach(d => {
      if (d.kode_produksi?.startsWith(`PRD-${currentYear}-`)) {
        const num = parseInt(d.kode_produksi.split('-')[2]);
        if (num > maxCurrent) maxCurrent = num;
      }
    });
    const startNum = Math.max(nextProduksiNumber || 1, maxCurrent + 1);
    return `PRD-${currentYear}-${String(startNum + offset).padStart(3, '0')}`;
  };

  const handleTerapkan = () => {
    if (selectedRefNo === '-') return;
    const ref = safeJadwal.find((j: any) => j.kode_jadwal === selectedRefNo);
    if (!ref?.detail_produksi) return;
    const copiedDetails = ref.detail_produksi.map((d: any, idx: number) => ({
      ...d,
      id_produksi:  undefined,
      kode_produksi: getNextKodeProduksi(idx),
    }));
    setDetails(prev => [...prev, ...copiedDetails]);
  };

  const updateDetailRow = (index: number, field: keyof DetailJadwalProduksi, value: any) => {
    const updated = [...details];
    if (field === 'id_produk') {
      updated[index].id_produk = value;
      updated[index].produk    = safeProduk.find((p: any) => String(p.id_produk) === String(value));
    } else if (field === 'id_bom') {
      updated[index].id_bom = value;
      updated[index].bom    = safeBom.find((b: any) => String(b.id_bom) === String(value));
    } else {
      (updated[index][field] as any) = value;
    }
    setDetails(updated);
  };

  const handleSimpan = (status: StatusJadwal) => {
    const payload = {
      kode_jadwal:      kodeJadwalTampil,
      periode:          `${bulan} ${tahun}`,
      tanggal_dibuat:   tanggalDibuat,
      jumlah_produksi:  details.length,
      status_jadwal:    status,
      komentar_owner:   '',
      detail_produksi:  details,
    };
    onSave(payload, isEdit);
  };

  return (
    <>
      {showModal && (
        <ModalTambahProduksi
          masterProduk={masterProduk}
          masterBom={masterBom}
          nextKode={getNextKodeProduksi(0)}
          onBatal={() => setShowModal(false)}
          onSimpan={(row: any) => { setDetails([...details, row]); setShowModal(false); }}
        />
      )}

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Jadwal Produksi' : 'Tambah Jadwal Produksi'}</h1>
            <p className="text-gray-500 mt-1">Isi informasi jadwal dan detail produksi</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Form Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Kode Jadwal</label>
              <input type="text" value={kodeJadwalTampil} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Tanggal Dibuat <span className="text-red-500">*</span></label>
              <input type="date" value={tanggalDibuat} onChange={e => setTanggalDibuat(e.target.value)} className="input-form text-sm py-2" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Bulan <span className="text-red-500">*</span></label>
              <select value={bulan} onChange={e => setBulan(e.target.value)} className="input-form text-sm py-2">
                <option value="">-- Pilih --</option>
                {bulanOptions.map((b: string) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Tahun <span className="text-red-500">*</span></label>
              <select value={tahun} onChange={e => setTahun(e.target.value)} className="input-form text-sm py-2">
                <option value="">-- Pilih --</option>
                {tahunOptions.map((t: string) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Card Status Jadwal — hanya tampil saat edit */}
            {isEdit && (
              <div className="sm:col-span-2 lg:col-span-4 mt-2">
                <div className="bg-slate-50/80 rounded-xl p-4 border border-gray-100 inline-block min-w-[200px]">
                  <p className="text-xs font-medium text-gray-400 mb-2">Status Jadwal</p>
                  <StatusBadge status={jadwal.status_jadwal} />
                </div>
              </div>
            )}

            {/* Catatan Revisi — hanya tampil saat status Revision Required */}
            {isEdit && jadwal.status_jadwal === 'Revision Required' && jadwal.komentar_owner && (
              <div className="sm:col-span-2 lg:col-span-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1.5">Catatan Revisi dari Owner</p>
                  <p className="text-sm text-orange-800">{jadwal.komentar_owner}</p>
                </div>
              </div>
            )}

            {/* Generate dari jadwal sebelumnya — HANYA tampil saat buat baru atau edit Draft */}
            {(!isEdit || jadwal.status_jadwal === 'Draft') && (
              <div className="sm:col-span-2 lg:col-span-4 mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  <span className="inline-flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Generate dari Jadwal Sebelumnya</span>
                </label>
                <div className="flex gap-2 items-stretch">
                  <select value={selectedRefNo} onChange={e => setSelectedRefNo(e.target.value)} className="flex-1 input-form text-sm">
                    <option value="-">-- Pilih Periode 12 Bulan Terakhir --</option>
                    {availableRefs.map((j: any) => (
                      <option key={j.id_jadwal} value={j.kode_jadwal}>{j.periode} ({j.kode_jadwal})</option>
                    ))}
                  </select>
                  <button
                    type="button" onClick={handleTerapkan} disabled={selectedRefNo === '-'}
                    className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Terapkan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Detail Table */}
          <div className="flex items-center justify-between mb-4 border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-700 text-sm">Detail Jadwal Produksi</h3>
            <button
              onClick={() => setShowModal(true)} type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Baris
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            {details.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 bg-gray-50/50">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">Belum ada baris detail produksi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 whitespace-nowrap">
                    <tr>
                      <th className="p-3 font-semibold">Kode Produksi</th>
                      <th className="p-3 font-semibold">Tanggal Produksi</th>
                      <th className="p-3 font-semibold">Produk</th>
                      <th className="p-3 font-semibold">Resep/BOM</th>
                      <th className="p-3 font-semibold text-right">Qty Rencana</th>
                      <th className="p-3 font-semibold">Satuan</th>
                      <th className="p-3 font-semibold">Keterangan</th>
                      <th className="p-3 font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {details.map((d, i) => (
                      <tr key={i} className={`border-t border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/50' : ''} hover:bg-gray-50`}>
                        <td className="p-3 font-medium text-gray-700 whitespace-nowrap">{d.kode_produksi}</td>
                        <td className="p-2">
                          <input type="date" value={d.tanggal_produksi} onChange={e => updateDetailRow(i, 'tanggal_produksi', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded focus:border-red-500 outline-none text-sm" />
                        </td>
                        <td className="p-2">
                          <select value={d.id_produk} onChange={e => updateDetailRow(i, 'id_produk', e.target.value)} className="w-48 px-2 py-1.5 border border-gray-300 rounded focus:border-red-500 outline-none text-sm">
                            <option value="">-- Pilih --</option>
                            {safeProduk.map((p: any) => <option key={p.id_produk} value={p.id_produk}>{p.nama_produk}</option>)}
                          </select>
                        </td>
                        <td className="p-2">
                          <select value={d.id_bom} onChange={e => updateDetailRow(i, 'id_bom', e.target.value)} className="w-48 px-2 py-1.5 border border-gray-300 rounded focus:border-red-500 outline-none text-sm">
                            <option value="">-- Pilih --</option>
                            {safeBom.map((b: any) => <option key={b.id_bom} value={b.id_bom}>{b.nama_resep}</option>)}
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="number" min={1} value={d.qty_rencana} onChange={e => updateDetailRow(i, 'qty_rencana', e.target.value === '' ? '' : Number(e.target.value))} className="w-24 px-2 py-1.5 border border-gray-300 rounded focus:border-red-500 outline-none text-sm text-right" />
                        </td>
                        <td className="p-3 text-gray-500 text-sm whitespace-nowrap">
                          {d.bom?.satuan_batch || d.bom?.satuan || 'Pcs'}
                        </td>
                        <td className="p-2">
                          <input type="text" value={d.catatan || ''} onChange={e => updateDetailRow(i, 'catatan', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded focus:border-red-500 outline-none text-sm" placeholder="Keterangan..." />
                        </td>
                        <td className="p-3 text-center">
                          <button type="button" onClick={() => setDetails(details.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button onClick={onCancel} className="btn-secondary text-sm">Batal</button>

            {/* Simpan Revisi jika status Revision Required ATAU sudah ada komentar owner */}
            {isEdit && (jadwal.status_jadwal === 'Revision Required' || !!jadwal.komentar_owner) ? (
              <button
                onClick={() => handleSimpan('Revision Required')} type="button"
                className="px-5 py-2 rounded-lg border border-orange-400 bg-orange-50 text-orange-800 hover:bg-orange-100 text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <XCircle className="w-3.5 h-3.5" /> Simpan Revisi
              </button>
            ) : (
              <button
                onClick={() => handleSimpan('Draft')} type="button"
                className="px-5 py-2 rounded-lg border border-yellow-400 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 text-sm font-medium transition-colors"
              >
                Simpan Draft
              </button>
            )}

            <button onClick={() => handleSimpan('Pending Approval')} className="btn-primary text-sm">
              Minta Persetujuan
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── View List ────────────────────────────────────────────────────────────────
function ViewList({ data, onAdd, onDetail, onEdit, onDelete }: any) {
  const [search,        setSearch]        = useState('');
  const [filterPeriode, setFilterPeriode] = useState('');
  const [filterStatus,  setFilterStatus]  = useState('');

  const safeData = Array.isArray(data) ? data : [];

  const filtered = safeData.filter((j: JadwalProduksi) => {
    if (filterPeriode && j.periode !== filterPeriode) return false;
    if (filterStatus  && j.status_jadwal !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!j.kode_jadwal.toLowerCase().includes(q) && !j.periode.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Jadwal Produksi</h1>
          <p className="text-gray-500 mt-1">Kelola jadwal master alokasi produksi bulanan</p>
        </div>
        <button onClick={onAdd} className="btn-primary text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Jadwal Produksi
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kode jadwal atau periode..." className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:border-red-400 outline-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Periode</label>
            <select value={filterPeriode} onChange={e => setFilterPeriode(e.target.value)} className="input-form text-sm">
              <option value="">Semua Periode</option>
              {Array.from(new Set(safeData.map((j: JadwalProduksi) => j.periode))).map(p => (
                <option key={String(p)} value={String(p)}>{String(p)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-form text-sm">
              <option value="">Semua Status</option>
              <option value="Draft">Draft</option>
              <option value="Pending Approval">Menunggu Persetujuan</option>
              <option value="Approved">Disetujui</option>
              <option value="Revision Required">Ditolak / Revisi</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Kode Jadwal</th>
                <th className="px-4 py-3 font-semibold">Periode</th>
                <th className="px-4 py-3 font-semibold">Tanggal Dibuat</th>
                <th className="px-4 py-3 font-semibold text-center">Jumlah Item</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">Tidak ada data ditemukan</td></tr>
              ) : filtered.map((j: JadwalProduksi, idx) => (
                <tr key={j.id_jadwal} className={`border-t border-gray-100 ${idx % 2 === 1 ? 'bg-gray-50' : ''} hover:bg-gray-50`}>
                  <td className="px-4 py-2.5 font-semibold whitespace-nowrap text-gray-700">{j.kode_jadwal}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-gray-700">{j.periode}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-gray-700">{formatDate(j.tanggal_dibuat)}</td>
                  <td className="px-4 py-2.5 text-center font-semibold text-gray-700">{j.detail_produksi?.length || 0}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={j.status_jadwal} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => onDetail(j)} className="p-1.5 rounded text-blue-600 hover:bg-blue-100 transition-colors" title="Lihat Detail">
                        <Eye className="w-4 h-4" />
                      </button>
                      {(j.status_jadwal === 'Draft' || j.status_jadwal === 'Revision Required') && (
                        <button onClick={() => onEdit(j)} className="p-1.5 rounded text-yellow-600 hover:bg-yellow-100 transition-colors" title="Edit Formula">
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {j.status_jadwal === 'Draft' && (
                        <button onClick={() => onDelete(j.id_jadwal!)} className="p-1.5 rounded text-red-500 hover:bg-red-100 transition-colors" title="Hapus Master">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function JadwalProduksi() {
  const {
    jadwals = [], masterProduk = [], masterBom = [], masterBahan = [],
    nextKodeJadwal, nextProduksiNumber, currentYear,
  } = usePage().props as any;

  const [view,     setView]     = useState<'list' | 'form' | 'detail'>('list');
  const [selected, setSelected] = useState<JadwalProduksi | null>(null);

  const handleSave = (payload: any, isEdit: boolean) => {
    if (isEdit && selected?.id_jadwal) {
      router.put(`/jadwal-produksi/${selected.id_jadwal}`, payload, {
        onSuccess: () => { setSelected(null); setView('list'); },
      });
    } else {
      router.post('/jadwal-produksi', payload, {
        onSuccess: () => { setSelected(null); setView('list'); },
      });
    }
  };

  const handleDelete = (id_jadwal: number) => {
    if (window.confirm('Yakin ingin menghapus seluruh bundle jadwal produksi ini?')) {
      router.delete(`/jadwal-produksi/${id_jadwal}`);
    }
  };

  if (view === 'form') return (
    <ViewForm
      jadwal={selected}
      allJadwal={jadwals}
      masterProduk={masterProduk}
      masterBom={masterBom}
      nextKodeJadwal={selected?.kode_jadwal || nextKodeJadwal}
      nextProduksiNumber={nextProduksiNumber}
      currentYear={currentYear}
      onSave={handleSave}
      onCancel={() => setView('list')}
    />
  );

  if (view === 'detail' && selected) return (
    <ViewDetail
      jadwal={selected}
      masterBom={masterBom}
      masterBahan={masterBahan}
      onBack={() => setView('list')}
    />
  );

  return (
    <ViewList
      data={jadwals}
      onAdd={() => { setSelected(null); setView('form'); }}
      onDetail={(j: any) => { setSelected(j); setView('detail'); }}
      onEdit={(j: any) => { setSelected(j); setView('form'); }}
      onDelete={handleDelete}
    />
  );
}
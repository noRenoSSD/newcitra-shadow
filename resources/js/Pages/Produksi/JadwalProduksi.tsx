import { useState } from 'react';
import {
  Plus, Eye, Pencil, Trash2, Search,
  Package, X, AlertCircle, CheckCircle2, Clock, XCircle, RefreshCw, ClipboardList
} from 'lucide-react';
import { usePage, router } from '@inertiajs/react';

// ─── Types (Mengikuti Database Laravel) ───────────────────────────────────────

type StatusJadwal = 'Draft' | 'Pending Approval' | 'Revision Required' | 'Approved';

interface DetailJadwalProduksi {
  id_produksi?: number;
  kode_produksi: string;
  tanggal_produksi: string;
  id_produk: number;
  id_bom: number;
  qty_rencana: number;
  catatan: string | null;
  produk?: { id_produk: number; kode_produk: string; nama_produk: string };
  bom?: { id_bom: number; kode_bom: string; nama_resep: string; qty_batch: number; satuan_batch?: string; satuan?: string };
}

interface JadwalProduksi {
  id_jadwal?: number;
  kode_jadwal: string;
  periode: string;
  tanggal_dibuat: string;
  jumlah_produksi: number;
  status_jadwal: StatusJadwal;
  komentar_owner: string | null;
  detail_produksi: DetailJadwalProduksi[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusBadge: Record<StatusJadwal, { label: string; className: string; icon: React.ReactNode }> = {
  'Draft': { label: 'Draft', className: 'bg-gray-100 text-gray-700', icon: <Clock className="w-3 h-3" /> },
  'Pending Approval': { label: 'Menunggu Persetujuan', className: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle className="w-3 h-3" /> },
  'Revision Required': { label: 'Revisi', className: 'bg-orange-100 text-orange-700', icon: <XCircle className="w-3 h-3" /> },
  'Approved': { label: 'Disetujui', className: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
};

const formatDate = (iso: string) => {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const today = () => new Date().toISOString().split('T')[0];

const bulanOptions = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const tahunOptions = ['2024', '2025', '2026', '2027'];

function StatusBadge({ status }: { status: StatusJadwal }) {
  const s = statusBadge[status] || statusBadge['Draft'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function ViewKebutuhanMaterial({ detail, jadwal, onBack }: { detail: DetailJadwalProduksi; jadwal: JadwalProduksi; onBack: () => void; }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Kebutuhan Material — {detail.kode_produksi}</h1>
          <p className="text-gray-500 mt-1">{detail.produk?.nama_produk} ({jadwal.kode_jadwal})</p>
        </div>
        <button onClick={onBack} className="btn-secondary inline-flex items-center gap-2">
          <X className="w-5 h-5" /> Kembali
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Informasi Produksi</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-xs text-gray-400 mb-1">Kode Produksi</p><p className="text-sm font-semibold">{detail.kode_produksi}</p></div>
          <div className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-xs text-gray-400 mb-1">Produk</p><p className="text-sm font-semibold">{detail.produk?.nama_produk}</p></div>
          <div className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-xs text-gray-400 mb-1">Nama Resep</p><p className="text-sm font-semibold">{detail.bom?.nama_resep}</p></div>
          <div className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-xs text-gray-400 mb-1">Kuantitas Rencana</p><p className="text-sm font-semibold">{detail.qty_rencana} {detail.bom?.satuan_batch || detail.bom?.satuan}</p></div>
          <div className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-xs text-gray-400 mb-1">Tanggal Produksi</p><p className="text-sm font-semibold">{formatDate(detail.tanggal_produksi)}</p></div>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Generate Kebutuhan Material</p>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-sm font-medium transition-colors">
            <RefreshCw className="w-4 h-4" /> Generate Kebutuhan
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
           <Package className="w-10 h-10 text-gray-300 mb-3" />
           <p className="text-sm font-medium text-gray-500">Fitur Generate Material Backend</p>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button onClick={onBack} className="btn-secondary">Tutup</button>
        </div>
      </div>
    </div>
  );
}

function ViewDetail({ jadwal, onBack }: { jadwal: JadwalProduksi; onBack: () => void; }) {
  const [materialDetail, setMaterialDetail] = useState<DetailJadwalProduksi | null>(null);

  if (materialDetail) return <ViewKebutuhanMaterial detail={materialDetail} jadwal={jadwal} onBack={() => setMaterialDetail(null)} />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Detail Jadwal Produksi — {jadwal.kode_jadwal}</h1>
          <p className="text-gray-500 mt-1">Periode {jadwal.periode}</p>
        </div>
        <button onClick={onBack} className="btn-secondary inline-flex items-center gap-2">
          <X className="w-5 h-5" /> Tutup
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Informasi Jadwal</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-xs text-gray-400 mb-1">Kode Jadwal</p><p className="text-sm font-semibold text-gray-700">{jadwal.kode_jadwal}</p></div>
          <div className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-xs text-gray-400 mb-1">Periode</p><p className="text-sm font-semibold text-gray-700">{jadwal.periode}</p></div>
          <div className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-xs text-gray-400 mb-1">Tanggal Dibuat</p><p className="text-sm font-semibold text-gray-700">{formatDate(jadwal.tanggal_dibuat)}</p></div>
          <div className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-xs text-gray-400 mb-1">Status Jadwal</p><StatusBadge status={jadwal.status_jadwal} /></div>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Detail Jadwal Produksi</p>
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          {jadwal.detail_produksi?.length === 0 || !jadwal.detail_produksi ? (
            <div className="py-12 text-center text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Belum ada detail produksi</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 text-left">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Kode Produksi</th>
                  <th className="px-4 py-2.5 font-semibold">Tanggal</th>
                  <th className="px-4 py-2.5 font-semibold">Produk</th>
                  <th className="px-4 py-2.5 font-semibold">Resep/BOM</th>
                  <th className="px-4 py-2.5 font-semibold">Qty Rencana</th>
                  <th className="px-4 py-2.5 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jadwal.detail_produksi.map((d, index) => (
                  <tr key={index} className={`border-t border-gray-100 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                    <td className="px-4 py-2.5 font-semibold text-gray-700">{d.kode_produksi}</td>
                    <td className="px-4 py-2.5 text-gray-700">{formatDate(d.tanggal_produksi)}</td>
                    <td className="px-4 py-2.5 text-gray-700">{d.produk?.nama_produk}</td>
                    <td className="px-4 py-2.5 text-gray-700">{d.bom?.nama_resep}</td>
                    <td className="px-4 py-2.5 text-gray-700">{d.qty_rencana.toLocaleString('id-ID')} {d.bom?.satuan_batch || d.bom?.satuan}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => setMaterialDetail(d)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">
                        <Package className="w-3.5 h-3.5" /> Kebutuhan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button onClick={onBack} className="btn-secondary">Tutup</button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Tambah Produksi (BOM Independen & Satuan Auto Muncul) ───────────────

function ModalTambahProduksi({ masterProduk, masterBom, onSimpan, onBatal, nextKode }: any) {
  const [form, setForm] = useState({ tanggal_produksi: today(), id_produk: '', id_bom: '', qty_rencana: 0, catatan: '' });

  const safeProduk = Array.isArray(masterProduk) ? masterProduk : [];
  const safeBom = Array.isArray(masterBom) ? masterBom : [];

  // PENCARIAN SATUAN: Mencari BOM berdasarkan apa yang dipilih di dropdown BOM
  const selectedBOM = safeBom.find((b: any) => String(b.id_bom) === String(form.id_bom));
  const selectedProduk = safeProduk.find((p: any) => String(p.id_produk) === String(form.id_produk));

  const handleSimpan = () => {
    if (!form.id_produk || !form.id_bom || !form.qty_rencana) return;
    onSimpan({
      kode_produksi: nextKode,
      tanggal_produksi: form.tanggal_produksi,
      id_produk: parseInt(form.id_produk),
      id_bom: parseInt(form.id_bom),
      qty_rencana: form.qty_rencana,
      catatan: form.catatan,
      produk: selectedProduk,
      bom: selectedBOM
    });
  };

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-700 to-red-800 px-6 py-4 flex items-center gap-3">
          <Plus className="w-5 h-5 text-yellow-400" />
          <div>
            <h3 className="text-white font-semibold text-base">Tambah Produksi</h3>
            <p className="text-red-200 text-xs">Isi detail item produksi baru</p>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kode Produksi</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700">
              {nextKode}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Generate otomatis</p>
          </div>

          <div><label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Produksi <span className="text-red-500">*</span></label><input type="date" value={form.tanggal_produksi} onChange={e => setForm({ ...form, tanggal_produksi: e.target.value })} className="input-form text-sm" /></div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Produk <span className="text-red-500">*</span></label>
            <select value={form.id_produk} onChange={e => setForm({ ...form, id_produk: e.target.value })} className="input-form text-sm">
              <option value="">-- Pilih Produk --</option>
              {safeProduk.map((p: any) => (<option key={p.id_produk} value={p.id_produk}>{p.kode_produk} - {p.nama_produk}</option>))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Resep/BOM <span className="text-red-500">*</span></label>
            <select value={form.id_bom} onChange={e => setForm({ ...form, id_bom: e.target.value })} className="input-form text-sm">
              <option value="">-- Pilih Resep/BOM --</option>
              {/* Tampilkan semua master BOM tanpa filter produk */}
              {safeBom.map((b: any) => (<option key={b.id_bom} value={b.id_bom}>{b.kode_bom} - {b.nama_resep}</option>))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kuantitas Rencana <span className="text-red-500">*</span></label>
              <input type="number" min={1} value={form.qty_rencana} onChange={e => setForm({ ...form, qty_rencana: Number(e.target.value) })} className="input-form text-sm text-right" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Satuan</label>
              {/* SATUAN OTOMATIS MUNCUL BERDASARKAN BOM YANG DIPILIH */}
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 h-[38px] flex items-center">
                {selectedBOM 
                  ? (selectedBOM.satuan_batch || selectedBOM.satuan || selectedBOM.satuan_produksi || '?? cek field')
                  : <span className="text-gray-400 italic">Pilih BOM dulu</span>
                }
              </div>
            </div>
          </div>
          
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Keterangan</label><input type="text" placeholder="Tambahkan keterangan..." value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} className="input-form text-sm" /></div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onBatal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium transition-colors">Batal</button>
          <button onClick={handleSimpan} disabled={!form.id_produk || !form.id_bom || !form.qty_rencana} className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">Simpan</button>
        </div>
      </div>
    </div>
  );
}

// ─── View: Form Jadwal (KODE MATI & AUTO GENERATE) ────────────────────────────

function ViewForm({ jadwal, allJadwal, onSave, onCancel, masterProduk, masterBom, nextKodeJadwal }: any) {
  const isEdit = !!jadwal;
  
  const kodeJadwalTampil = isEdit ? jadwal.kode_jadwal : (nextKodeJadwal ?? 'Loading...');
  
  const [bulan, setBulan] = useState(jadwal?.periode?.split(' ')[0] || '');
  const [tahun, setTahun] = useState(jadwal?.periode?.split(' ')[1] || '');
  const [tanggalDibuat, setTanggalDibuat] = useState(jadwal?.tanggal_dibuat ?? today());
  const [selectedRefNo, setSelectedRefNo] = useState('-');
  const [details, setDetails] = useState<DetailJadwalProduksi[]>(jadwal?.detail_produksi ?? []);
  const [showModal, setShowModal] = useState(false);

  const safeJadwal = Array.isArray(allJadwal) ? allJadwal : [];
  const availableRefs = safeJadwal.filter(j => j.id_jadwal !== jadwal?.id_jadwal && j.status_jadwal === 'Approved');

  const handleTerapkan = () => {
    if (selectedRefNo === '-') return;
    const ref = safeJadwal.find(j => j.kode_jadwal === selectedRefNo);
    if (!ref || !ref.detail_produksi) return;

    const copiedDetails = ref.detail_produksi.map((d: any, idx: number) => ({
      ...d,
      id_produksi: undefined, 
      kode_produksi: `PRD-${new Date().getFullYear()}-${String(details.length + idx + 1).padStart(3, '0')}`,
    }));
    setDetails(prev => [...prev, ...copiedDetails]);
  };

  const handleSimpan = (status: StatusJadwal) => {
    const payload = {
      kode_jadwal: kodeJadwalTampil,
      periode: `${bulan} ${tahun}`,
      tanggal_dibuat: tanggalDibuat,
      jumlah_produksi: details.length,
      status_jadwal: status,
      komentar_owner: '',
      detail_produksi: details
    };
    onSave(payload, isEdit);
  };

  return (
    <>
      {showModal && (
        <ModalTambahProduksi 
          masterProduk={masterProduk} 
          masterBom={masterBom} 
          nextKode={`PRD-${new Date().getFullYear()}-${String(details.length + 1).padStart(3, '0')}`} 
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Kode Jadwal</label>
                {/* FIELD MATI / DISABLE */}
                <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed">
                    {kodeJadwalTampil}
                </div>
            </div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Tanggal Dibuat <span className="text-red-500">*</span></label><input type="date" value={tanggalDibuat} onChange={e => setTanggalDibuat(e.target.value)} className="input-form text-sm p-2" /></div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Bulan <span className="text-red-500">*</span></label>
              <select value={bulan} onChange={e => setBulan(e.target.value)} className="input-form text-sm p-2"><option value="">-- Pilih Bulan --</option>{bulanOptions.map(b => <option key={b} value={b}>{b}</option>)}</select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Tahun <span className="text-red-500">*</span></label>
              <select value={tahun} onChange={e => setTahun(e.target.value)} className="input-form text-sm p-2"><option value="">-- Pilih Tahun --</option>{tahunOptions.map(t => <option key={t} value={t}>{t}</option>)}</select>
            </div>
            
            <div className="sm:col-span-2 lg:col-span-4 mt-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <span className="inline-flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Generate dari Jadwal Sebelumnya</span>
              </label>
              <div className="flex gap-2 items-stretch">
                <select value={selectedRefNo} onChange={e => setSelectedRefNo(e.target.value)} className="flex-1 input-form text-sm">
                  <option value="-">-- Pilih Periode Sebelumnya --</option>
                  {availableRefs.map((j: any) => (
                    <option key={j.id_jadwal} value={j.kode_jadwal}>{j.kode_jadwal} – {j.periode}</option>
                  ))}
                </select>
                <button type="button" onClick={handleTerapkan} disabled={selectedRefNo === '-'} className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Terapkan
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Pilih jadwal yang disetujui lalu klik Terapkan untuk mengisi detail otomatis</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-700 text-sm">Detail Jadwal Produksi</h3>
            <button onClick={() => setShowModal(true)} type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
              <Plus className="w-3.5 h-3.5"/> Tambah Produksi
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            {details.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 bg-gray-50/50">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Belum ada detail produksi</p>
                  <p className="text-xs text-gray-400">Klik "Tambah Produksi" untuk memasukkan item produksi.</p>
                </div>
            ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-3 font-semibold">Kode</th>
                      <th className="p-3 font-semibold">Tgl Produksi</th>
                      <th className="p-3 font-semibold">Produk</th>
                      <th className="p-3 font-semibold">Resep</th>
                      <th className="p-3 font-semibold text-right">Qty Rencana</th>
                      <th className="p-3 font-semibold text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {details.map((d, i) => (
                      <tr key={i} className={`border-t border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/50' : ''} hover:bg-gray-50`}>
                        <td className="p-3 font-medium text-gray-700">{d.kode_produksi}</td>
                        <td className="p-3">{formatDate(d.tanggal_produksi)}</td>
                        <td className="p-3">{d.produk?.nama_produk}</td>
                        <td className="p-3">{d.bom?.nama_resep}</td>
                        <td className="p-3 text-right">{d.qty_rencana} {d.bom?.satuan_batch || d.bom?.satuan}</td>
                        <td className="p-3 text-center">
                          <button type="button" onClick={() => setDetails(details.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Hapus baris">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button onClick={onCancel} className="btn-secondary text-sm">Batal</button>
            <button onClick={() => handleSimpan('Draft')} type="button" className="px-5 py-2 rounded-lg border border-yellow-400 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 text-sm font-medium transition-colors">Simpan Draft</button>
            <button onClick={() => handleSimpan('Pending Approval')} className="btn-primary text-sm">Minta Persetujuan</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── View: Main List ──────────────────────────────────────────────────────────

function ViewList({ data, onAdd, onDetail, onEdit, onDelete }: any) {
  const [search, setSearch] = useState('');
  const [filterPeriode, setFilterPeriode] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const safeData = Array.isArray(data) ? data : [];

  const filtered = safeData.filter((j: JadwalProduksi) => {
    if (filterPeriode && j.periode !== filterPeriode) return false;
    if (filterStatus && j.status_jadwal !== filterStatus) return false;
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
          <p className="text-gray-500 mt-1">Kelola jadwal produksi bulanan</p>
        </div>
        <button onClick={onAdd} className="btn-primary text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Jadwal Produksi
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['Draft', 'Pending Approval', 'Approved'] as StatusJadwal[]).map(s => {
          const count = safeData.filter((j: JadwalProduksi) => j.status_jadwal === s).length;
          const badge = statusBadge[s];
          const iconBg = s === 'Draft' ? 'bg-gray-50' : s === 'Pending Approval' ? 'bg-yellow-50' : 'bg-green-50';
          const iconColor = s === 'Draft' ? 'text-gray-600' : s === 'Pending Approval' ? 'text-yellow-600' : 'text-green-600';
          
          return (
            <div key={s} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
              <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
                <div className={iconColor}>{badge.icon}</div>
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{badge.label}</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{count}</p>
            </div>
          );
        })}
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
                <option value="Revision Required">Ditolak</option>
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
                <th className="px-4 py-3 font-semibold text-center">Jumlah Produksi</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
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
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium min-w-8">
                      {j.detail_produksi?.length || 0}
                    </span>
                  </td>
                  <td className="px-4 py-2.5"><StatusBadge status={j.status_jadwal} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      <button onClick={() => onDetail(j)} className="p-1.5 rounded text-blue-600 hover:bg-blue-100 transition-colors" title="Detail"><Eye className="w-4 h-4"/></button>
                      {(j.status_jadwal === 'Draft' || j.status_jadwal === 'Revision Required') && (
                        <button onClick={() => onEdit(j)} className="p-1.5 rounded text-yellow-600 hover:bg-yellow-100 transition-colors" title="Edit"><Pencil className="w-4 h-4"/></button>
                      )}
                      {j.status_jadwal === 'Draft' && (
                        <button onClick={() => onDelete(j.id_jadwal!)} className="p-1.5 rounded text-red-500 hover:bg-red-100 transition-colors" title="Hapus"><Trash2 className="w-4 h-4"/></button>
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
  const { jadwals = [], masterProduk = [], masterBom = [], nextKodeJadwal } = usePage().props as any;
  
  const [view, setView] = useState<'list'|'form'|'detail'>('list');
  const [selected, setSelected] = useState<JadwalProduksi | null>(null);

  const handleSave = (payload: any, isEdit: boolean) => {
    if (isEdit && selected?.id_jadwal) {
      router.put(`/produksi/jadwal/${selected.id_jadwal}`, payload, { onSuccess: () => setView('list') });
    } else {
      router.post('/produksi/jadwal', payload, { onSuccess: () => setView('list') });
    }
  };

  const handleDelete = (id_jadwal: number) => {
    if (window.confirm('Yakin ingin menghapus jadwal ini?')) {
      router.delete(`/produksi/jadwal/${id_jadwal}`);
    }
  };

  if (view === 'form') return <ViewForm jadwal={selected} allJadwal={jadwals} masterProduk={masterProduk} masterBom={masterBom} nextKodeJadwal={nextKodeJadwal} onSave={handleSave} onCancel={() => setView('list')} />;
  if (view === 'detail' && selected) return <ViewDetail jadwal={selected} onBack={() => setView('list')} />;
  
  return <ViewList data={jadwals} onAdd={() => { setSelected(null); setView('form'); }} onDetail={(j: any) => { setSelected(j); setView('detail'); }} onEdit={(j: any) => { setSelected(j); setView('form'); }} onDelete={handleDelete} />;
}
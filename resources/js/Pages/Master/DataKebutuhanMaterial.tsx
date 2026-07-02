import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus, Search, Eye, Pencil, Trash2, X,
  Package, AlertCircle
} from 'lucide-react';
import { router } from '@inertiajs/react';

// ── TYPES
interface DetailBOM {
  id: string;
  kodeMaterial: string | number;
  namaMaterial: string;
  jumlahBahan: number;
  satuan: string;
}

interface BOM {
  id: string | number;
  kodeBOM: string;
  kodeProduk: string | number;
  namaProduk: string;
  namaResep: string;
  qtyBatch: number;
  satuanBatch: string;
  details: DetailBOM[];
  lastUpdated: string;
}

interface OptionItem {
  id: string;
  kode: string;
  nama: string;
  satuan?: string;
}

// ── Searchable select combobox
function Combobox<T extends OptionItem>({
  options, value, onChange, placeholder, disabled
}: {
  options: T[];
  value: string | number;
  onChange: (item: T) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => String(o.id) === String(value));
  const filtered = query
    ? options.filter(o =>
        String(o.kode).toLowerCase().includes(query.toLowerCase()) ||
        o.nama.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center border rounded-lg px-3 py-2 bg-white cursor-pointer ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-red-400'}`}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        <span className="flex-1 text-sm text-gray-700 truncate">
          {selected ? <><span className="font-semibold">{selected.kode}</span>{` - ${selected.nama}`}</> : <span className="text-gray-400">{placeholder}</span>}
        </span>
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-auto">
          <div className="p-2 border-b">
            <input
              autoFocus
              className="w-full text-sm px-2 py-1 border border-gray-200 rounded outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
              placeholder="Cari kode atau nama..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-400 text-center">Tidak ditemukan</div>
          ) : (
            filtered.map(o => (
              <div
                key={o.id}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-red-50 ${String(o.id) === String(value) ? 'bg-red-50 text-red-800 font-medium' : 'text-gray-700'}`}
                onClick={() => { onChange(o); setOpen(false); setQuery(''); }}
              >
                <span className="font-medium">{o.kode}</span> — {o.nama}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE = 10;

// ══════════════════════════════════════════════
//  LIST VIEW
// ══════════════════════════════════════════════
function ListBOM({
  data, produkList, onAdd, onEdit, onDetail, onDelete,
}: {
  data: BOM[];
  produkList: OptionItem[];
  onAdd: () => void;
  onEdit: (b: BOM) => void;
  onDetail: (b: BOM) => void;
  onDelete: (id: string | number) => void;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  const getProdukDisplay = (idProduk: string | number, fallbackNama: string) => {
    const p = produkList.find(x => String(x.id) === String(idProduk));
    return p ? <span><span className="font-semibold text-gray-800">{p.kode}</span> - {p.nama}</span> : fallbackNama;
  };

  const filtered = data.filter(b =>
    String(b.kodeProduk).toLowerCase().includes(search.toLowerCase()) ||
    b.namaProduk.toLowerCase().includes(search.toLowerCase()) ||
    b.kodeBOM.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Kebutuhan Material</h1>
          <p className="text-sm text-gray-500">Kelola kebutuhan material atau Bill of Material (BOM) setiap produk</p>
        </div>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900">
          <Plus className="w-4 h-4" /> Tambah BOM
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            placeholder="Cari kode BOM atau nama produk..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Kode BOM</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Nama Produk</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Nama Resep</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Qty Batch</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Satuan Batch</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Jumlah Bahan</th>
                <th className="px-4 py-3 font-semibold text-gray-900 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">Tidak ada data ditemukan</td></tr>
              ) : (
                paged.map(bom => (
                  <tr key={bom.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{bom.kodeBOM}</td>
                    <td className="px-4 py-3 text-gray-700">{getProdukDisplay(bom.kodeProduk, bom.namaProduk)}</td>
                    <td className="px-4 py-3 text-gray-700">{bom.namaResep}</td>
                    <td className="px-4 py-3 text-gray-700">{bom.qtyBatch}</td>
                    <td className="px-4 py-3 text-gray-700">{bom.satuanBatch}</td>
                    <td className="px-4 py-3 text-gray-700">{bom.details?.length || 0} Bahan</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => onDetail(bom)} title="Detail" className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => onEdit(bom)} title="Edit" className="p-1.5 rounded hover:bg-yellow-100 text-yellow-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(bom.id)} title="Hapus" className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 mt-4">
            <span className="text-xs text-gray-500">
              {`${(page-1)*PAGE_SIZE+1}–${Math.min(page*PAGE_SIZE, filtered.length)} dari ${filtered.length} data`}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Sebelumnya</button>
              {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 text-xs border rounded transition ${p === page ? 'bg-red-800 text-white border-red-800' : 'border-gray-200 hover:bg-white'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Berikutnya</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  DETAIL VIEW (read-only)
// ══════════════════════════════════════════════
function DetailBOMView({ bom, produkList, materialList, onBack }: {
  bom: BOM;
  produkList: OptionItem[];
  materialList: OptionItem[];
  onBack: () => void;
}) {
  const getProdukDisplay = (idProduk: string | number, fallbackNama: string) => {
    const p = produkList.find(x => String(x.id) === String(idProduk));
    return p ? `${p.kode} - ${p.nama}` : fallbackNama;
  };

  const getMaterialDisplay = (idMaterial: string | number, fallbackNama: string) => {
    const m = materialList.find(x => String(x.id) === String(idMaterial));
    return m ? <span><span className="font-semibold text-gray-800">{m.kode}</span> - {m.nama}</span> : fallbackNama;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail BOM — {bom.kodeBOM}</h1>
          <p className="text-sm text-gray-500">Last updated: {bom.lastUpdated}</p>
        </div>
        <button onClick={onBack} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"><X className="w-5 h-5" /></button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Informasi BOM</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Kode BOM',    value: bom.kodeBOM },
            { label: 'Nama Produk', value: getProdukDisplay(bom.kodeProduk, bom.namaProduk) },
            { label: 'Nama Resep',  value: bom.namaResep },
            { label: 'Qty Batch',   value: `${bom.qtyBatch} ${bom.satuanBatch}` },
          ].map(f => (
            <div key={f.label} className="bg-gray-50 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">{f.label}</p>
              <p className="text-sm font-semibold text-gray-800">{f.value}</p>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Detail Bahan</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-left border-b border-gray-200">
                <th className="px-4 py-2.5 font-semibold">Bahan</th>
                <th className="px-4 py-2.5 font-semibold text-right">Jumlah Bahan</th>
              </tr>
            </thead>
            <tbody>
              {bom.details.map((d, idx) => (
                <tr key={d.id || idx} className={`border-b border-gray-100 ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
                  <td className="px-4 py-2.5 text-gray-700">{getMaterialDisplay(d.kodeMaterial, d.namaMaterial)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-700">{d.jumlahBahan} {d.satuan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border border-amber-200 bg-amber-50 flex items-center justify-end mt-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-gray-600">Total Bahan:</span>
            <span className="text-sm font-bold text-amber-700">{bom.details?.length || 0} Bahan</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Tutup</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  FORM VIEW (tambah / edit)
// ══════════════════════════════════════════════
interface RowDraft {
  rowId: string;      // id_detail_bom untuk baris lama, "new-{ts}" untuk baris baru
  idMaterial: string;
  jumlahBahan: string;
}

function FormBOM({
  editTarget, produkList, materialList, nextKodeBOM, onSave, onCancel,
}: {
  editTarget: BOM | null;
  produkList: OptionItem[];
  materialList: OptionItem[];
  nextKodeBOM: string;
  onSave: (bom: any) => void;
  onCancel: () => void;
}) {
  const isEdit = !!editTarget;

  const [kodeBOM,      setKodeBOM]      = useState(editTarget?.kodeBOM ?? nextKodeBOM);
  const [idProduk,     setIdProduk]     = useState(String(editTarget?.kodeProduk ?? ''));
  const [namaResep,    setNamaResep]    = useState(editTarget?.namaResep ?? '');
  const [qtyBatch,     setQtyBatch]     = useState(editTarget?.qtyBatch?.toString() ?? '');
  const [satuanBatch,  setSatuanBatch]  = useState(editTarget?.satuanBatch ?? '');
  const [rows,         setRows]         = useState<RowDraft[]>(
    editTarget
      ? editTarget.details.map(d => ({
          rowId:      String(d.id),           // ← id_detail_bom dari DB
          idMaterial: String(d.kodeMaterial),
          jumlahBahan: String(d.jumlahBahan),
        }))
      : []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addRow    = () => setRows(r => [...r, { rowId: `new-${Date.now()}`, idMaterial: '', jumlahBahan: '' }]);
  const removeRow = (rowId: string) => setRows(r => r.filter(x => x.rowId !== rowId));
  const updateRow = (rowId: string, field: keyof RowDraft, val: string) =>
    setRows(r => r.map(x => x.rowId === rowId ? { ...x, [field]: val } : x));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!kodeBOM.trim())  e['kodeBOM']    = 'Kode BOM wajib diisi';
    if (!idProduk)        e['produk']     = 'Pilih produk terlebih dahulu';
    if (!namaResep.trim())e['namaResep']  = 'Nama resep harus diisi';
    if (!qtyBatch || isNaN(Number(qtyBatch)) || Number(qtyBatch) <= 0) e['qtyBatch'] = 'Qty batch harus > 0';
    if (!satuanBatch.trim()) e['satuanBatch'] = 'Satuan batch harus diisi';
    if (rows.length === 0)   e['rows']    = 'Tambahkan minimal satu bahan';
    rows.forEach((row, i) => {
      if (!row.idMaterial) e[`mat-${i}`] = 'Pilih bahan';
      if (!row.jumlahBahan || isNaN(Number(row.jumlahBahan)) || Number(row.jumlahBahan) <= 0)
        e[`qty-${i}`] = 'Jumlah harus > 0';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const details = rows.map(row => ({
      id:          row.rowId.startsWith('new-') ? null : parseInt(row.rowId, 10),
      kodeMaterial: row.idMaterial,
      jumlahBahan:  parseFloat(row.jumlahBahan),
    }));

    onSave({ id: editTarget?.id, kodeBOM, kodeProduk: idProduk, namaResep, qtyBatch: parseFloat(qtyBatch), satuanBatch, details, isEdit });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Kebutuhan Material' : 'Tambah Kebutuhan Material'}</h1>
        <p className="text-sm text-gray-500">Isi informasi BOM dan detail bahan</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Kode BOM *</label>
            <input type="text" disabled value={kodeBOM} className="w-full px-3 py-2 border border-gray-200 bg-gray-100 cursor-not-allowed rounded-lg text-sm outline-none" placeholder="Contoh: BOM-001" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Produk *</label>
            <Combobox options={produkList} value={idProduk} onChange={p => { setIdProduk(String(p.id)); setErrors(e => ({ ...e, produk: '' })); }} placeholder="Pilih produk" />
            {errors['produk'] && <p className="text-xs text-red-500 mt-1">{errors['produk']}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Resep *</label>
            <input type="text" value={namaResep} onChange={e => { setNamaResep(e.target.value); setErrors(v => ({ ...v, namaResep: '' })); }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400" placeholder="Masukkan nama resep" />
            {errors['namaResep'] && <p className="text-xs text-red-500 mt-1">{errors['namaResep']}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Qty Batch *</label>
            <input type="number" min={0} step="0.01" value={qtyBatch} onChange={e => { setQtyBatch(e.target.value); setErrors(v => ({ ...v, qtyBatch: '' })); }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400" placeholder="0" />
            {errors['qtyBatch'] && <p className="text-xs text-red-500 mt-1">{errors['qtyBatch']}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Satuan Batch *</label>
            <input type="text" value={satuanBatch} onChange={e => { setSatuanBatch(e.target.value); setErrors(v => ({ ...v, satuanBatch: '' })); }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400" placeholder="Kg, Pcs, dll" />
            {errors['satuanBatch'] && <p className="text-xs text-red-500 mt-1">{errors['satuanBatch']}</p>}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700">Detail Bahan</p>
            <button type="button" onClick={addRow} className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 text-xs font-medium rounded-lg transition-colors border border-gray-200 hover:border-red-200">
              <Plus className="w-3.5 h-3.5" /> Tambah Baris
            </button>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">Belum ada bahan ditambahkan</p>
              <p className="text-xs text-gray-400">Klik tombol tambah baris untuk menambahkan bahan.</p>
              {errors['rows'] && <p className="text-xs text-red-500">{errors['rows']}</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white text-gray-600 text-left border-b border-gray-100">
                    <th className="px-4 py-2.5 font-semibold">Bahan</th>
                    <th className="px-4 py-2.5 font-semibold">Jumlah Bahan</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const mat = materialList.find(m => String(m.id) === String(row.idMaterial));
                    return (
                      <tr key={row.rowId} className={`border-b border-gray-100 ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
                        <td className="px-4 py-2">
                          <Combobox options={materialList} value={row.idMaterial} onChange={m => updateRow(row.rowId, 'idMaterial', String(m.id))} placeholder="Pilih bahan" />
                          {errors[`mat-${idx}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`mat-${idx}`]}</p>}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <input type="number" min={0} step="0.01" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400" placeholder="0" value={row.jumlahBahan} onChange={e => updateRow(row.rowId, 'jumlahBahan', e.target.value)} />
                            <span className="text-sm text-gray-500 min-w-[60px]">{mat?.satuan ?? '—'}</span>
                          </div>
                          {errors[`qty-${idx}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`qty-${idx}`]}</p>}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button type="button" onClick={() => removeRow(row.rowId)} className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors" title="Hapus baris">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {rows.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-200 bg-amber-50 flex items-center justify-end">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-600">Total Bahan:</span>
                <span className="text-sm font-bold text-amber-700">{rows.length} Bahan</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
          <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900">{isEdit ? 'Update' : 'Simpan'}</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  DELETE MODAL
// ══════════════════════════════════════════════
function DeleteModal({ bom, onConfirm, onCancel, error }: { bom: BOM; onConfirm: () => void; onCancel: () => void; error?: string | null }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">Hapus Data BOM</h3>
          <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        
        {error ? (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 mb-1">Apakah Anda yakin ingin menghapus data BOM berikut?</p>
        )}

        <div className="my-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
          <span className="font-semibold text-gray-700">{bom.kodeBOM}</span> — {bom.namaProduk}
        </div>
        
        {!error && <p className="text-xs text-gray-400 mb-4">Tindakan ini tidak dapat dibatalkan.</p>}
        
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Tutup</button>
          {!error && (
            <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-lg hover:bg-red-900">Hapus</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  ROOT EXPORT
// ══════════════════════════════════════════════
type ViewMode = 'list' | 'form' | 'detail';

export default function DataKebutuhanMaterial({ boms = [], produkList = [], materialList = [] }: any) {
  const [view,          setView]         = useState<ViewMode>('list');
  const [selected,      setSelected]     = useState<BOM | null>(null);
  const [deleteTarget,  setDeleteTarget] = useState<BOM | null>(null);
  const [deleteError,   setDeleteError]  = useState<string | null>(null);

  const generateNextKode = () => {
    if (!boms || boms.length === 0) return 'BOM-001';
    let maxNum = 0;
    boms.forEach((item: BOM) => {
      const match = item.kodeBOM.match(/\d+$/);
      if (match) { const num = parseInt(match[0], 10); if (num > maxNum) maxNum = num; }
    });
    return `BOM-${(maxNum + 1).toString().padStart(3, '0')}`;
  };

  const mappedProduk = useMemo(() => produkList.map((p: any) => ({
    id:   String(p.id_produk),
    kode: p.kode_produk ? String(p.kode_produk) : String(p.id_produk),
    nama: p.nama_produk,
  })), [produkList]);

  const mappedMaterial = useMemo(() => materialList.map((m: any) => ({
    id:     String(m.id_bahan),
    kode:   m.kode_bahan ? String(m.kode_bahan) : String(m.id_bahan),
    nama:   m.nama_bahan,
    satuan: m.satuan_bahan,
  })), [materialList]);

  const handleAdd    = () => { setSelected(null); setView('form'); };
  const handleEdit   = (b: BOM) => { setSelected(b); setView('form'); };
  const handleDetail = (b: BOM) => { setSelected(b); setView('detail'); };

  const handleSave = (bomData: any) => {
    const payload = {
      kode_bom:     bomData.kodeBOM,
      id_produk:    bomData.kodeProduk,
      nama_resep:   bomData.namaResep,
      qty_batch:    bomData.qtyBatch,
      satuan_batch: bomData.satuanBatch,
      details: bomData.details.map((d: any) => ({
        id:           d.id ?? null,
        id_bahan:     d.kodeMaterial,
        jumlah_bahan: d.jumlahBahan,
      })),
    };

    if (bomData.isEdit) {
      router.put(`/kebutuhan-material/${bomData.id}`, payload, { onSuccess: () => setView('list') });
    } else {
      router.post('/kebutuhan-material', payload, { onSuccess: () => setView('list') });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleteError(null);

    router.delete(`/kebutuhan-material/${deleteTarget.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setDeleteTarget(null);
        setDeleteError(null);
      },
      onError: (err) => {
        if (err.delete) {
          setDeleteError(err.delete);
        }
      }
    });
  };

  return (
    <div className="min-h-full bg-gray-50/50 pb-10">
      {view === 'list' && (
        <ListBOM
          data={boms}
          produkList={mappedProduk}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDetail={handleDetail}
          onDelete={id => setDeleteTarget(boms.find((b: BOM) => b.id === id) ?? null)}
        />
      )}
      {view === 'form' && (
        <FormBOM
          editTarget={selected}
          produkList={mappedProduk}
          materialList={mappedMaterial}
          nextKodeBOM={generateNextKode()}
          onSave={handleSave}
          onCancel={() => setView('list')}
        />
      )}
      {view === 'detail' && selected && (
        <DetailBOMView bom={selected} produkList={mappedProduk} materialList={mappedMaterial} onBack={() => setView('list')} />
      )}
      {deleteTarget && (
        <DeleteModal 
          bom={deleteTarget} 
          onConfirm={handleDelete} 
          onCancel={() => { setDeleteTarget(null); setDeleteError(null); }} 
          error={deleteError}
        />
      )}
    </div>
  );
}
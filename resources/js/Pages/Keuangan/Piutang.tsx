import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Search, CreditCard, CheckCircle2, Users, AlertCircle, ArrowLeft, Eye, X, Plus, Clock, Calendar, AlertTriangle } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface InvoiceItem {
  produk: string;
  qty: number;
  harga: number;
  diskon: number;
  subtotal: number;
}

interface InvoiceDetail {
  noInvoice: string;
  tanggal: string;
  pelanggan: string;
  alamat: string;
  jenisPenjualan: string;
  metodePembayaran: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiskon: number;
  ppn: number;
  grandTotal: number;
}

interface LogPerpanjangan {
  id_perpanjangan?: number;
  id_piutang: number;
  nominal: number;
  jt_lama: string;
  jt_baru: string;
  alasan: string;
  created_at: string;
}

interface NotaPiutang {
  id_piutang: number;
  no_invoice: string;
  no_piutang: string;
  tgl_piutang: string;
  total_piutang: number;
  terbayar: number;
  sisa_piutang: number;
  jt_piutang: string;
  status_piutang: string;
  keterangan: string;
  nominal_diperpanjang?: number; 
  bayar?: number;         
  metodeBayar?: string;   
  invoice?: InvoiceDetail;
  riwayat_perpanjangan?: LogPerpanjangan[];
}

interface RiwayatBayar {
  id_pelunasan: number;
  no_pelunasan: string;
  tgl_pelunasan: string;
  id_piutang: number;
  nominal_bayar: number;
  metode_bayar: string;
  keterangan: string;
}

interface MitraPiutang {
  id: number;
  kodeMitra: string;
  namaMitra: string;
  totalNota: number;
  totalSisaPiutang: number;
  notas: NotaPiutang[];
  riwayat: RiwayatBayar[];
}

// ── Helper format ─────────────────────────────────────────────────────────────

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const formatDate = (d: string) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ── Modal Detail Invoice ───────────────────────────────────────────────────────

function ModalDetailInvoice({ invoice, onClose }: { invoice: InvoiceDetail; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-auto">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Detail Penjualan</h3>
            <p className="text-sm text-gray-500 mt-0.5">{invoice.noInvoice}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">No. Invoice</p>
              <p className="text-base font-medium text-gray-900">{invoice.noInvoice}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tanggal Penjualan</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(invoice.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pelanggan</p>
              <p className="text-base font-medium text-gray-900">{invoice.pelanggan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Alamat</p>
              <p className="text-base font-medium text-gray-900">{invoice.alamat}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jenis Penjualan</p>
              <p className="text-base font-medium text-gray-900">{invoice.jenisPenjualan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Metode Pembayaran</p>
              <p className="text-base font-medium text-gray-900">{invoice.metodePembayaran}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100">
          <div className="px-6 py-3 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-800">Item Produk</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Produk</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Qty</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Harga</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700">Diskon</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items && invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">{item.produk}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">{item.qty} Unit</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">{formatCurrency(item.harga)}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-center">{item.diskon}%</td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.totalDiskon > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Diskon</span>
              <span className="font-medium text-red-600">({formatCurrency(invoice.totalDiskon)})</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">PPN (11%)</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.ppn)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
            <span className="text-gray-800">Grand Total</span>
            <span className="text-red-700">{formatCurrency(invoice.grandTotal)}</span>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Input Saldo Awal Piutang ───────────────────────────────────────────

function ModalSaldoAwal({ mitras, onClose, onSave }: { mitras: MitraPiutang[]; onClose: () => void; onSave: (data: any) => void }) {
  const [selectedMitraId, setSelectedMitraId] = useState('');
  const [noInvoice, setNoInvoice] = useState(`INV-SA-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-001`);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jtTanggal, setJtTanggal] = useState('');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('Saldo Awal Piutang');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMitraId || !nominal || !jtTanggal) {
      alert('Mohon lengkapi data wajib yang bertanda bintang (*)!');
      return;
    }
    onSave({
      mitraId: selectedMitraId,
      noInvoice,
      tanggal,
      jtTanggal,
      nominal: Number(nominal),
      keterangan
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Input Saldo Awal Piutang</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Mitra <span className="text-red-500">*</span></label>
            <select
              value={selectedMitraId}
              onChange={e => setSelectedMitraId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 text-sm bg-white"
            >
              <option value="">-- Pilih Mitra --</option>
              {mitras.map(m => (
                <option key={m.id} value={m.id}>{m.kodeMitra} - {m.namaMitra}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Invoice / Referensi</label>
              <input
                type="text"
                value={noInvoice}
                onChange={e => setNoInvoice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Piutang (Rp) <span className="text-red-500">*</span></label>
              <input
                type="number"
                placeholder="0"
                value={nominal}
                onChange={e => setNominal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 text-sm text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Piutang</label>
              <input
                type="date"
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jatuh Tempo <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={jtTanggal}
                onChange={e => setJtTanggal(e.target.value)}
                min={tanggal}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
            <textarea
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
              Simpan Saldo Awal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Komponen Detail Kartu Piutang ──────────────────────────────────────────────

function DetailKartuPiutang({ mitra, onBack }: { mitra: MitraPiutang; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'nota' | 'riwayat'>('nota');
  const [notas, setNotas] = useState<NotaPiutang[]>([]);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceDetail | null>(null);

  useEffect(() => {
    if (mitra.notas) {
      setNotas(mitra.notas.map(n => ({ 
        ...n, 
        bayar: 0, 
        metodeBayar: 'Tunai' 
      })));
    }
  }, [mitra]);

  const handleBayarChange = (id_piutang: number, val: string) => {
    setNotas(notas.map(n => n.id_piutang === id_piutang ? { ...n, bayar: Number(val) || 0 } : n));
  };

  const handleMetodeChange = (id_piutang: number, val: string) => {
    setNotas(notas.map(n => n.id_piutang === id_piutang ? { ...n, metodeBayar: val } : n));
  };

  const handleSimpanPiutang = (nota: NotaPiutang) => {
    if (!nota.bayar || nota.bayar <= 0) {
      alert('Masukkan nominal cicilan terlebih dahulu!');
      return;
    }
    if (nota.bayar > nota.sisa_piutang) {
      alert('Nominal bayar tidak boleh melebihi sisa piutang!');
      return;
    }

    router.post('/piutang/bayar', {
      id_piutang: nota.id_piutang,
      nominal_bayar: nota.bayar,
      metode_bayar: nota.metodeBayar || 'Tunai',
      keterangan: `Cicilan untuk nota ${nota.no_invoice || nota.no_piutang}`
    }, {
      onSuccess: () => {
        alert('Pembayaran cicilan piutang berhasil disimpan!');
        onBack();
      },
      onError: (errors) => {
        alert('Gagal menyimpan: ' + Object.values(errors).join(', '));
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      {viewingInvoice && (
        <ModalDetailInvoice invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
      )}

      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-red-800 hover:text-red-900 font-medium transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Mitra
        </button>
        <h2 className="text-2xl font-bold text-red-800">
          Kartu Piutang: {mitra.namaMitra} ({mitra.kodeMitra})
        </h2>
        <div className="text-sm text-gray-600 mt-1">
          {activeTab === 'nota' ? (
            <p>
              Jumlah Sisa Piutang Berjalan:{' '}
              <span className="font-semibold text-red-700">{formatCurrency(mitra.totalSisaPiutang)}</span>
            </p>
          ) : (
            <p>
              Jumlah Piutang Terbayar:{' '}
              <span className="font-semibold text-green-700">
                {formatCurrency(mitra.riwayat ? mitra.riwayat.reduce((sum, r) => sum + r.nominal_bayar, 0) : 0)}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-200 gap-1">
        <button onClick={() => setActiveTab('nota')} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === 'nota' ? 'border-red-600 text-red-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Nota Belum Lunas
        </button>
        <button onClick={() => setActiveTab('riwayat')} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === 'riwayat' ? 'border-red-600 text-red-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Riwayat Pembayaran
        </button>
      </div>

      {activeTab === 'nota' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Petunjuk:</span> Masukkan nominal cicilan, pilih metode bayar, kemudian klik tombol <span className="font-semibold">Bayar</span> di kolom kanan nota.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">No. Invoice</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal Nota</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Sisa Piutang</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Bayar / Cicil (Rp)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Metode Bayar</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-gray-400 italic">Tidak ada nota aktif</td>
                  </tr>
                ) : (
                  notas.map((nota) => (
                    <tr key={nota.id_piutang} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-700">{nota.no_invoice || nota.no_piutang}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{formatDate(nota.tgl_piutang)}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">{formatCurrency(nota.sisa_piutang)}</td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          min="0"
                          max={nota.sisa_piutang}
                          value={nota.bayar || ''}
                          onChange={e => handleBayarChange(nota.id_piutang, e.target.value)}
                          placeholder="0"
                          className="w-36 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-red-400"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={nota.metodeBayar || 'Tunai'}
                          onChange={e => handleMetodeChange(nota.id_piutang, e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 bg-white"
                        >
                          <option value="Tunai">Tunai</option>
                          <option value="Transfer">Transfer Bank</option>
                          <option value="Giro">Giro</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 flex items-center justify-center gap-2">
                        {nota.invoice && (
                          <button onClick={() => setViewingInvoice(nota.invoice!)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail Invoice">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleSimpanPiutang(nota)} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors">
                          Bayar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">No. Bukti Pelunasan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal Bayar</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Nominal</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Metode Bayar</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!mitra.riwayat || mitra.riwayat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-400 italic">Belum ada riwayat pembayaran</td>
                </tr>
              ) : (
                mitra.riwayat.map((r) => (
                  <tr key={r.id_pelunasan} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-semibold text-gray-700">{r.no_pelunasan}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{formatDate(r.tgl_pelunasan)}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-green-700 text-right">{formatCurrency(r.nominal_bayar)}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{r.metode_bayar}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{r.keterangan || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── SUB-KOMPONEN: Perpanjangan Tab ─────────────────────────────────────────────

function PerpanjanganTab({ dataMitra = [] }: { dataMitra: MitraPiutang[] }) {
  const [selectedMitra, setSelectedMitra] = useState<MitraPiutang | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNota, setSelectedNota] = useState<NotaPiutang | null>(null);
  const [newJtDate, setNewJtDate] = useState('');
  const [nominalPerpanjangan, setNominalPerpanjangan] = useState(''); 
  const [alasanPerpanjangan, setAlasanPerpanjangan] = useState('Perpanjangan parsial masa tenggang piutang');
  const [expandedNotaId, setExpandedNotaId] = useState<number | null>(null);

  const toggleExpandNota = (id: number) => {
    setExpandedNotaId(expandedNotaId === id ? null : id);
  };

  const handleSimpanPerpanjangan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNota || !newJtDate || !nominalPerpanjangan) return;

    const nominalValue = Number(nominalPerpanjangan);
    if (nominalValue <= 0 || nominalValue > selectedNota.sisa_piutang) {
      alert(`Nominal tidak valid! Maksimal nominal piutang yang diperpanjang adalah ${formatCurrency(selectedNota.sisa_piutang)}`);
      return;
    }

    router.post('/piutang/perpanjang', {
      id_piutang: selectedNota.id_piutang,
      nominal: nominalValue,
      jt_lama: selectedNota.jt_piutang, 
      jt_baru: newJtDate,
      alasan: alasanPerpanjangan 
    }, {
      onSuccess: () => {
        alert('Data perpanjangan piutang parsial berhasil disimpan!');
        
        if (selectedMitra) {
          const updatedNotas = selectedMitra.notas.map(n => {
            if (n.id_piutang === selectedNota.id_piutang) {
              const rPerpanjangan = n.riwayat_perpanjangan || [];
              return { 
                ...n, 
                jt_piutang: newJtDate,
                riwayat_perpanjangan: [
                  {
                    id_piutang: n.id_piutang,
                    nominal: nominalValue,
                    jt_lama: n.jt_piutang,
                    jt_baru: newJtDate,
                    alasan: alasanPerpanjangan,
                    created_at: new Date().toISOString()
                  },
                  ...rPerpanjangan
                ]
              };
            }
            return n;
          });
          setSelectedMitra({ ...selectedMitra, notas: updatedNotas });
        }

        setExpandedNotaId(selectedNota.id_piutang);
        setSelectedNota(null);
        setNewJtDate('');
        setNominalPerpanjangan('');
      },
      onError: (errors) => {
        alert('Gagal memperpanjang: ' + Object.values(errors).join(', '));
      }
    });
  };

  const filteredMitra = dataMitra.filter(m => {
    const punyaPiutang = m.totalSisaPiutang > 0;
    const cocokSearch = m.namaMitra.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        m.kodeMitra.toLowerCase().includes(searchTerm.toLowerCase());
    return punyaPiutang && cocokSearch;
  });

  if (selectedMitra) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => { setSelectedMitra(null); setExpandedNotaId(null); }} className="flex items-center gap-1.5 text-sm text-red-800 hover:text-red-900 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Perpanjangan
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-xs text-gray-500">{selectedMitra.kodeMitra}</p>
            <h3 className="text-lg font-bold text-gray-800">{selectedMitra.namaMitra}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Nota Aktif</p>
            <p className="text-sm font-bold text-gray-800">{selectedMitra.notas.length} Invoice</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="w-12 text-center py-3"></th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">No. Invoice</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal Nota</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Sisa Pokok</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Jatuh Tempo (Terakhir)</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedMitra.notas.map((nota) => {
                const isOverdue = new Date(nota.jt_piutang) < new Date();
                const isExpanded = expandedNotaId === nota.id_piutang;
                const riwayatPerpanjangan = nota.riwayat_perpanjangan || [];

                return (
                  <React.Fragment key={nota.id_piutang}>
                    <tr className={`hover:bg-gray-50/80 transition-colors ${isExpanded ? 'bg-amber-50/30 font-medium' : ''}`}>
                      <td className="py-3 text-center">
                        <button 
                          type="button"
                          onClick={() => toggleExpandNota(nota.id_piutang)}
                          className="text-gray-400 hover:text-gray-700 transition-transform font-mono text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          {isExpanded ? '▼ ' : '►'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <span>{nota.no_invoice || nota.no_piutang}</span>
                          {/* {riwayatPerpanjangan.length > 0 && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                              {riwayatPerpanjangan.length}x Perpanjangan
                            </span>
                          )} */}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{formatDate(nota.tgl_piutang)}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">{formatCurrency(nota.sisa_piutang)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold ${isOverdue ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                          {isOverdue && <AlertTriangle className="w-3 h-3" />} {formatDate(nota.jt_piutang)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => { 
                            setSelectedNota(nota); 
                            setNewJtDate(nota.jt_piutang);
                            setNominalPerpanjangan(nota.sisa_piutang.toString());
                          }} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" /> Atur Perpanjangan
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gray-50/60 border-l-4 border-amber-500">
                        <td colSpan={6} className="p-4 bg-gray-50/40">
                          <div className="space-y-2 max-w-4xl mx-auto">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                                Log Riwayat Perpanjangan Masa Tenggang
                              </h4>
                              <span className="text-xs text-gray-500 font-medium">No. Invoice: {nota.no_invoice || nota.no_piutang}</span>
                            </div>
                            
                            {riwayatPerpanjangan.length === 0 ? (
                              <div className="text-center py-4 bg-white rounded-lg border border-gray-100 shadow-sm text-xs text-gray-400 italic">
                                Belum ada riwayat perpanjangan pada invoice ini. Semua nominal mengikuti jatuh tempo asli.
                              </div>
                            ) : (
                              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-gray-100/80 text-gray-600 font-semibold text-xs border-b border-gray-200">
                                      <th className="p-2.5">Tanggal Diubah</th>
                                      <th className="p-2.5 text-right">Nominal Diperpanjang</th>
                                      <th className="p-2.5 text-center">Jatuh Tempo Lama</th>
                                      <th className="p-2.5 text-center">Jatuh Tempo Baru</th>
                                      <th className="p-2.5">Alasan Perubahan</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                    {riwayatPerpanjangan.map((log, index) => (
                                      <tr key={index} className="hover:bg-gray-50/50">
                                        <td className="p-2.5 font-medium text-gray-500">{formatDate(log.created_at)}</td>
                                        <td className="p-2.5 text-right font-bold">{formatCurrency(log.nominal)}</td>
                                        <td className="p-2.5 text-center text-gray-400 line-through">{formatDate(log.jt_lama)}</td>
                                        <td className="p-2.5 text-center">{formatDate(log.jt_baru)}</td>
                                        <td className="p-2.5 text-gray-600 max-w-xs truncate" title={log.alasan}>{log.alasan || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedNota && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-600" /> Form Perpanjangan Piutang</h3>
                <button type="button" onClick={() => setSelectedNota(null)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">✕</button>
              </div>
              <form onSubmit={handleSimpanPerpanjangan} className="p-6 space-y-4">
                <div>
                  <span className="text-xs text-gray-400 block font-medium uppercase">No. Invoice</span>
                  <span className="text-sm font-bold text-gray-800">{selectedNota.no_invoice || selectedNota.no_piutang}</span>
                  <span className="text-xs text-gray-500 block mt-1">Total Sisa Piutang: <strong>{formatCurrency(selectedNota.sisa_piutang)}</strong></span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nominal Yang Diperpanjang (Rp) *</label>
                  <input 
                    type="number" 
                    required
                    max={selectedNota.sisa_piutang}
                    value={nominalPerpanjangan} 
                    onChange={(e) => setNominalPerpanjangan(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium outline-none focus:border-amber-500" 
                    placeholder="Masukkan nominal..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Jatuh Tempo Lama</label>
                    <input type="text" disabled value={formatDate(selectedNota.jt_piutang)} className="w-full px-3 py-2 border bg-gray-50 text-gray-500 rounded-lg text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Jatuh Tempo Baru *</label>
                    <input type="date" required min={selectedNota.tgl_piutang} value={newJtDate} onChange={(e) => setNewJtDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Alasan / Keterangan</label>
                  <textarea value={alasanPerpanjangan} onChange={(e) => setAlasanPerpanjangan(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-amber-500 resize-none" placeholder="Alasan pengajuan perpanjangan..." />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setSelectedNota(null)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm transition-colors">Simpan Perubahan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama atau kode mitra..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-amber-400 text-sm"
        />
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kode Mitra</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nama Mitra</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Jumlah Nota Aktif</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Sisa Piutang</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredMitra.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-400 italic">Tidak ada data mitra piutang aktif</td>
              </tr>
            ) : (
              filteredMitra.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-semibold text-gray-700">{m.kodeMitra}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">{m.namaMitra}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-center">{m.totalNota} Nota</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-800 text-right">{formatCurrency(m.totalSisaPiutang)}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => setSelectedMitra(m)} className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
                      Pilih Nota
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Komponen Utama KartuPiutang ──────────────────────────────────────────────

interface KartuPiutangProps {
  dataMitra?: MitraPiutang[];
  totalOmsetBulanIni?: number; 
  totalPiutang?: number;
  jumlahMitraJatuhTempo?: number;
}

export default function KartuPiutang({ 
  dataMitra = [], 
  totalOmsetBulanIni = 0, 
  totalPiutang = 0,
  jumlahMitraJatuhTempo = 0 
}: KartuPiutangProps) {
  const [currentTab, setCurrentTab] = useState<'pembayaran' | 'perpanjangan'>('pembayaran');
  const [selectedMitra, setSelectedMitra] = useState<MitraPiutang | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (selectedMitra) {
    return <DetailKartuPiutang mitra={selectedMitra} onBack={() => setSelectedMitra(null)} />;
  }

  const filtered = dataMitra.filter(m => {
    const cocokSearch = m.namaMitra.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.kodeMitra.toLowerCase().includes(searchTerm.toLowerCase());
    return cocokSearch;
  });

  const handleSaveSaldoAwal = (data: any) => {
    router.post('/piutang/saldo-awal', {
      id_mitra: data.mitraId,
      no_invoice: data.noInvoice,
      tgl_piutang: data.tanggal,
      jt_piutang: data.jtTanggal,
      total_piutang: data.nominal,
      keterangan: data.keterangan
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        alert('Saldo awal piutang berhasil disimpan.');
      },
      onError: (errors) => {
        alert('Gagal menyimpan: ' + Object.values(errors).join(', '));
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      {isModalOpen && (
        <ModalSaldoAwal mitras={dataMitra} onClose={() => setIsModalOpen(false)} onSave={handleSaveSaldoAwal} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-red-800">Manajemen Piutang Toko</h2>
          <p className="text-sm text-red-800 mt-1">Kelola pencatatan saldo awal, pelunasan cicilan, dan masa jatuh tempo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Piutang Tertagih (Bulan Ini)</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalOmsetBulanIni)}</p>
            </div>
            <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Piutang Berjalan</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalPiutang)}</p>
            </div>
            <div className="w-11 h-11 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Jumlah Mitra Jatuh Tempo</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{jumlahMitraJatuhTempo} Mitra</p>
            </div>
            <div className="w-11 h-11 bg-red-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 gap-1">
        <button onClick={() => setCurrentTab('pembayaran')} className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all -mb-[2px] ${currentTab === 'pembayaran' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Daftar & Pembayaran Piutang
        </button>
        <button onClick={() => setCurrentTab('perpanjangan')} className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all -mb-[2px] ${currentTab === 'perpanjangan' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Perpanjangan Jatuh Tempo
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        {currentTab === 'pembayaran' ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Cari nama mitra..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 text-sm" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 text-sm bg-white text-gray-700">
                <option value="">Semua Status</option>
                <option value="Jatuh Tempo">Jatuh Tempo</option>
                <option value="Berjalan">Berjalan</option>
              </select>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Tambah Saldo Awal
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kode Mitra</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nama Mitra</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Total Nota Belum Lunas</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Sisa Piutang</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-gray-400 italic">Tidak ada data mitra</td>
                    </tr>
                  ) : (
                    filtered.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-semibold text-gray-700">{m.kodeMitra}</td>
                        <td className="py-3 px-4 text-sm text-gray-800 font-medium">{m.namaMitra}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 text-center">{m.totalNota} Nota</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-800 text-right">{formatCurrency(m.totalSisaPiutang)}</td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => setSelectedMitra(m)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                            Buka Kartu
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-4">Menampilkan 1–{filtered.length} dari {filtered.length} data mitra.</p>
          </div>
        ) : (
          <PerpanjanganTab dataMitra={dataMitra} />
        )}
      </div>
    </div>
  );
}
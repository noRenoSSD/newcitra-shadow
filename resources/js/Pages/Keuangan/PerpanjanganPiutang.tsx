import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Search, Calendar, AlertTriangle, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';

interface NotaPiutang {
  id_piutang: number;
  no_invoice: string;
  no_piutang: string;
  tgl_piutang: string;
  total_piutang: number;
  sisa_piutang: number;
  jt_piutang: string;
  status_piutang: string;
}

interface MitraPiutang {
  id: number;
  kodeMitra: string;
  namaMitra: string;
  totalNotaOverdue: number;
  notas: NotaPiutang[];
}

interface PerpanjanganTabProps {
  dataMitra: MitraPiutang[];
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const formatDate = (d: string) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function PerpanjanganTab({ dataMitra = [] }: PerpanjanganTabProps) {
  const [selectedMitra, setSelectedMitra] = useState<MitraPiutang | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State modal perpanjangan
  const [selectedNota, setSelectedNota] = useState<NotaPiutang | null>(null);
  const [newJtDate, setNewJtDate] = useState('');
  const [keterangan, setKeterangan] = useState('Perpanjangan masa tenggang piutang');

  const handleSimpanPerpanjangan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNota || !newJtDate) return;

    router.post('/piutang/perpanjang', {
      id_piutang: selectedNota.id_piutang,
      tgl_jatuh_tempo_baru: newJtDate,
      keterangan: keterangan
    }, {
      onSuccess: () => {
        alert('Tanggal jatuh tempo berhasil diperpanjang!');
        
        // Update local state instan agar layar langsung sinkron tanpa kedip
        if (selectedMitra) {
          const updatedNotas = selectedMitra.notas.map(n => 
            n.id_piutang === selectedNota.id_piutang ? { ...n, jt_piutang: newJtDate } : n
          );
          setSelectedMitra({ ...selectedMitra, notas: updatedNotas });
        }
        
        setSelectedNota(null);
        setNewJtDate('');
      },
      onError: (errors) => {
        alert('Gagal memperpanjang: ' + Object.values(errors).join(', '));
      }
    });
  };

  const filteredMitra = dataMitra.filter(m => {
    const cocokSearch = m.namaMitra.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        m.kodeMitra.toLowerCase().includes(searchTerm.toLowerCase());
    return m.notas && m.notas.length > 0 && cocokSearch;
  });

  // TAMPILAN SUB-TABEL DETAIL NOTA PER MITRA
  if (selectedMitra) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMitra(null)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Mitra
          </button>
          <span className="text-xs bg-amber-50 text-amber-700 font-medium px-3 py-1 rounded-full border border-amber-200">
            Mode Perpanjangan Jatuh Tempo
          </span>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-xs text-gray-500 font-mono">{selectedMitra.kodeMitra}</p>
            <h3 className="text-lg font-bold text-gray-800">{selectedMitra.namaMitra}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Nota Aktif</p>
            <p className="text-sm font-bold text-gray-800">{selectedMitra.notas.length} Invoice</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">No. Invoice / Nota</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Tgl Piutang</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Sisa Piutang</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Jatuh Tempo Saat Ini</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedMitra.notas.map((nota) => {
                const isOverdue = new Date(nota.jt_piutang) < new Date();
                return (
                  <tr key={nota.id_piutang} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-sm font-semibold text-gray-800">{nota.no_invoice || nota.no_piutang}</td>
                    <td className="py-3.5 px-4 text-sm text-gray-600">{formatDate(nota.tgl_piutang)}</td>
                    <td className="py-3.5 px-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(nota.sisa_piutang)}</td>
                    <td className="py-3.5 px-4 text-sm text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold ${
                        isOverdue ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {isOverdue && <AlertTriangle className="w-3 h-3" />}
                        {formatDate(nota.jt_piutang)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedNota(nota);
                          setNewJtDate(nota.jt_piutang);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Ubah Jatuh Tempo
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MODAL RESCHEDULE */}
        {selectedNota && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Reschedule Jatuh Tempo
                </h3>
                <button onClick={() => setSelectedNota(null)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">✕</button>
              </div>
              <form onSubmit={handleSimpanPerpanjangan} className="p-6 space-y-4">
                <div>
                  <span className="text-xs text-gray-400 block font-medium uppercase">No. Invoice</span>
                  <span className="text-sm font-bold text-gray-800">{selectedNota.no_invoice || selectedNota.no_piutang}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal Lama</label>
                    <input type="text" disabled value={formatDate(selectedNota.jt_piutang)} className="w-full px-3 py-2 border bg-gray-50 text-gray-500 rounded-lg text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tanggal Baru *</label>
                    <input
                      type="date"
                      required
                      min={selectedNota.tgl_piutang}
                      value={newJtDate}
                      onChange={(e) => setNewJtDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Alasan Perpanjangan</label>
                  <textarea
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                    placeholder="Contoh: Mitra meminta tenggang waktu tambahan"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setSelectedNota(null)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors">Simpan Perubahan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // TAMPILAN UTAMA LIST MITRA (PERSIS SEPERTI STRUKTUR KARTU PIUTANG)
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama atau kode mitra..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm shadow-sm"
        />
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Kode Mitra</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Nama Mitra</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Jumlah Nota Aktif</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Status Overdue</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredMitra.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-gray-400 italic">
                  Tidak ada data mitra dengan piutang aktif yang cocok
                </td>
              </tr>
            ) : (
              filteredMitra.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-sm font-mono text-gray-600">{m.kodeMitra}</td>
                  <td className="py-3.5 px-4 text-sm font-bold text-gray-800">{m.namaMitra}</td>
                  <td className="py-3.5 px-4 text-sm text-gray-700 text-center font-medium">{m.notas.length} Nota</td>
                  <td className="py-3.5 px-4 text-center">
                    {m.totalNotaOverdue > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        {m.totalNotaOverdue} Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        Aman
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setSelectedMitra(m)}
                      className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      Pilih Nota &rarr;
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
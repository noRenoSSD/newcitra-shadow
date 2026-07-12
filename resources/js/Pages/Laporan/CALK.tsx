import { useState } from 'react';
import { Printer, Calendar } from 'lucide-react';
// Sesuaikan import layout di bawah ini dengan nama file layout di projectmu
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; 

// ── Helpers ───────────────────────────────────────────────────────────────────

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Math.abs(n));

const BULAN: Record<number, string> = {
  1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
  5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
  9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember',
};

// ── Data types & Dataset ──────────────────────────────────────────────────────
// (Bagian interface PeriodeData dan const DATA tidak saya ubah, sama persis seperti kodemu)
interface PeriodeData {
  tanggal: string;
  kas: { tunai: number; bankGiro: number; tabungan: number };
  piutang: { tokoSinarJaya: number; restoranBahari: number; kopasiNelayan: number; konsinyasi: number };
  persediaan: { bahanBaku: number; bahanPenolong: number; produkJadi: number; konsinyasi: number };
  biayaDibayarDimuka: number;
  perlengkapan: number;
  akumulasiPenyusutan: number;
  hutangUsaha: { cvBandeng: number; udBumbu: number; ptKemasan: number; lainnya: number };
  hutangBankJP: number;
  biayaAkrual: number;
  hutangPajak: number;
  hutangBankJPanjang: number;
  ekuitas: { modal: number; labaDitahan: number; labaBerjalan: number };
  pendapatan: { presto: number; konsinyasi: number; lainLain: number };
  hpp: { bbAwal: number; pembelianBB: number; bbAkhir: number; bahanPenolong: number; tkl: number; bop: number; pjAwal: number; pjAkhir: number };
  beban: { gaji: number; listrik: number; penyusutan: number; pemeliharaan: number; bbm: number; kemasan: number; lainLain: number };
  bebanLain: { bunga: number; adminBank: number };
  tarifPajak: number;
}

const DATA: Record<string, PeriodeData> = {
  '1-2026': {
    tanggal: '31 Januari 2026',
    kas:        { tunai: 8600000, bankGiro: 32000000, tabungan: 5000000 },
    piutang:    { tokoSinarJaya: 12500000, restoranBahari: 9750000, kopasiNelayan: 7200000, konsinyasi: 8800000 },
    persediaan: { bahanBaku: 22400000, bahanPenolong: 5800000, produkJadi: 31500000, konsinyasi: 8750000 },
    biayaDibayarDimuka: 6000000, perlengkapan: 2100000,
    akumulasiPenyusutan: -55678125,
    hutangUsaha: { cvBandeng: 8500000, udBumbu: 4200000, ptKemasan: 3100000, lainnya: 2700000 },
    hutangBankJP: 15000000, biayaAkrual: 8200000, hutangPajak: 3650000,
    hutangBankJPanjang: 150000000,
    ekuitas: { modal: 305000000, labaDitahan: 37543750, labaBerjalan: 3628125 },
    pendapatan: { presto: 75600000, konsinyasi: 15750000, lainLain: 2500000 },
    hpp: { bbAwal: 20000000, pembelianBB: 27650000, bbAkhir: 22400000, bahanPenolong: 8200000, tkl: 12600000, bop: 11800000, pjAwal: 28500000, pjAkhir: 31500000 },
    beban: { gaji: 18500000, listrik: 4700000, penyusutan: 1654167, pemeliharaan: 800000, bbm: 1500000, kemasan: 1800000, lainLain: 1250000 },
    bebanLain: { bunga: 2100000, adminBank: 150000 },
    tarifPajak: 0.22,
  },
  '2-2026': {
    tanggal: '28 Februari 2026',
    kas:        { tunai: 9800000, bankGiro: 38500000, tabungan: 4500000 },
    piutang:    { tokoSinarJaya: 13800000, restoranBahari: 10500000, kopasiNelayan: 8200000, konsinyasi: 8800000 },
    persediaan: { bahanBaku: 24100000, bahanPenolong: 6200000, produkJadi: 34200000, konsinyasi: 9500000 },
    biayaDibayarDimuka: 6000000, perlengkapan: 1950000,
    akumulasiPenyusutan: -57332292,
    hutangUsaha: { cvBandeng: 9200000, udBumbu: 4800000, ptKemasan: 3600000, lainnya: 2500000 },
    hutangBankJP: 15000000, biayaAkrual: 9100000, hutangPajak: 4250000,
    hutangBankJPanjang: 145000000,
    ekuitas: { modal: 305000000, labaDitahan: 41171875, labaBerjalan: 4495541 },
    pendapatan: { presto: 84200000, konsinyasi: 18400000, lainLain: 1800000 },
    hpp: { bbAwal: 22400000, pembelianBB: 30900000, bbAkhir: 24100000, bahanPenolong: 8900000, tkl: 13500000, bop: 12300000, pjAwal: 31500000, pjAkhir: 34200000 },
    beban: { gaji: 18500000, listrik: 4900000, penyusutan: 1654167, pemeliharaan: 1200000, bbm: 1650000, kemasan: 2100000, lainLain: 980000 },
    bebanLain: { bunga: 2100000, adminBank: 150000 },
    tarifPajak: 0.22,
  },
};

const ASET_DETAIL = [
  { nama: 'Mesin Presto Bandeng',        harga: 85000000,  umur: 10, nilaiSisa: 8500000  },
  { nama: 'Kendaraan Operasional Pick Up', harga: 120000000, umur: 8,  nilaiSisa: 12000000 },
  { nama: 'Mesin Pengasap Otomatis',       harga: 65000000,  umur: 8,  nilaiSisa: 6500000  },
  { nama: 'Peralatan Packaging Vakum',     harga: 45000000,  umur: 5,  nilaiSisa: 4500000  },
  { nama: 'Peralatan Uji Kualitas Lab',    harga: 30000000,  umur: 5,  nilaiSisa: 3000000  },
] as const;
const TOTAL_PEROLEHAN = ASET_DETAIL.reduce((s, a) => s + a.harga, 0);

// ── Document sub-components ───────────────────────────────────────────────────

function SectionHeading({ letter, title }: { letter: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="shrink-0 w-8 h-8 rounded-full bg-red-800 text-white text-sm font-bold flex items-center justify-center">
        {letter}
      </span>
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
    </div>
  );
}

function DocPara({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-700 leading-relaxed">{children}</p>;
}

function DocTable({ rows }: { rows: { label: string; value: string; bold?: boolean }[] }) {
  return (
    <table className="w-full text-sm border-collapse mt-3">
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className={`py-2.5 px-4 border border-gray-200 w-2/3 ${row.bold ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
              {row.label}
            </td>
            <td className={`py-2.5 px-4 border border-gray-200 text-right tabular-nums ${row.bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AccountCard({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="w-6 h-6 rounded-full bg-red-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
// PERUBAHAN: export default
export default function Calk() {
  const [bulan, setBulan] = useState(2);
  const [tahun, setTahun] = useState(2026);
  const [displayed, setDisplayed] = useState({ bulan: 2, tahun: 2026 });

  const key = `${displayed.bulan}-${displayed.tahun}`;
  const d   = DATA[key];
  const periodeLabel = `${BULAN[displayed.bulan]} ${displayed.tahun}`;

  const totalKas   = d ? d.kas.tunai + d.kas.bankGiro + d.kas.tabungan : 0;
  const totalPersd = d ? d.persediaan.bahanBaku + d.persediaan.bahanPenolong + d.persediaan.produkJadi + d.persediaan.konsinyasi : 0;
  const nilaiBuku  = d ? TOTAL_PEROLEHAN + d.akumulasiPenyusutan : 0;
  const totalPend  = d ? d.pendapatan.presto + d.pendapatan.konsinyasi + d.pendapatan.lainLain : 0;
  const totalBeban = d ? d.beban.gaji + d.beban.listrik + d.beban.penyusutan + d.beban.pemeliharaan + d.beban.bbm + d.beban.kemasan + d.beban.lainLain : 0;

  return (
    <div className="p-6 space-y-6">
      {/* ── HEADER OUTSIDE CARD ── */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-red-800">Catatan Atas Laporan Keuangan</h2>
          <p className="text-sm text-red-800 mt-1">Penjelasan rinci komponen laporan keuangan per periode</p>
        </div>
        <button
          onClick={() => window.print()}
          disabled={!d}
          className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Printer className="w-5 h-5" />
          Cetak Laporan
        </button>
      </div>

      {/* ── CARD FILTER & ACTIONS ── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Bulan
            </label>
            <select
              value={bulan}
              onChange={e => setBulan(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-w-40"
            >
              {Object.entries(BULAN).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
            <select
              value={tahun}
              onChange={e => setTahun(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-w-32"
            >
              {[2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <button
              onClick={() => setDisplayed({ bulan, tahun })}
              className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Tampilkan
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD LAPORAN ── */}
      {!d ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center text-gray-400 text-sm">
          Data catatan untuk periode <span className="font-medium">{periodeLabel}</span> belum tersedia.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 text-center">
            <h1 className="text-2xl font-bold text-gray-800">CV NEW CITRA</h1>
            <p className="text-sm text-gray-600 mt-1">Catatan Atas Laporan Keuangan</p>
            <p className="text-sm text-gray-600">Untuk Periode yang Berakhir {d.tanggal}</p>
            <p className="text-xs text-gray-400 mt-0.5">(Disajikan dalam Rupiah penuh)</p>
          </div>

          <div className="p-6 lg:p-12 space-y-10 max-w-5xl mx-auto">
            <section>
              <SectionHeading letter="A" title="Informasi Umum Perusahaan" />
              <DocPara>
                CV New Citra merupakan perusahaan manufaktur yang bergerak dalam bidang produksi
                pengolahan dan distribusi ikan bandeng, termasuk produk bandeng presto, bandeng asap,
                dan produk turunan lainnya. Laporan keuangan ini disusun untuk periode yang berakhir pada{' '}
                <strong>{d.tanggal}</strong>.
              </DocPara>
            </section>

            <section>
              <SectionHeading letter="B" title="Dasar Penyusunan Laporan Keuangan" />
              <DocPara>
                Laporan keuangan disusun berdasarkan Standar Akuntansi Keuangan Entitas Mikro,
                Kecil, dan Menengah (SAK EMKM).
              </DocPara>
            </section>

            <section>
              <SectionHeading letter="C" title="Kebijakan Akuntansi" />
              <ul className="space-y-3 mt-3">
                {[
                  'Persediaan dicatat dan dinilai menggunakan metode FIFO (First In, First Out).',
                  'Aset tetap dicatat berdasarkan harga perolehan.',
                  'Penyusutan aset tetap dihitung menggunakan metode garis lurus (straight-line method) tanpa nilai residu.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                    <span className="shrink-0 w-5 h-5 rounded-full border-2 border-red-800 text-red-800 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionHeading letter="D" title="Penjelasan Akun Utama" />
              <div className="space-y-6 mt-4">
                <AccountCard number={1} title="Kas dan Setara Kas">
                  <DocTable rows={[
                    { label: 'Kas Tunai',                    value: idr(d.kas.tunai)     },
                    { label: 'Bank BRI – Rekening Giro',     value: idr(d.kas.bankGiro)  },
                    { label: 'Bank BRI – Rekening Tabungan', value: idr(d.kas.tabungan)  },
                    { label: 'Jumlah Kas dan Setara Kas',    value: idr(totalKas), bold: true },
                  ]} />
                </AccountCard>

                <AccountCard number={2} title="Persediaan">
                  <DocTable rows={[
                    { label: 'Bahan Baku – Ikan Bandeng Segar',        value: idr(d.persediaan.bahanBaku)    },
                    { label: 'Bahan Penolong – Bumbu, Garam, Kemasan', value: idr(d.persediaan.bahanPenolong) },
                    { label: 'Produk Jadi – Bandeng Presto & Asap',    value: idr(d.persediaan.produkJadi)   },
                    { label: 'Persediaan Barang Konsinyasi',           value: idr(d.persediaan.konsinyasi)   },
                    { label: 'Jumlah Persediaan',                      value: idr(totalPersd), bold: true },
                  ]} />
                </AccountCard>

                <AccountCard number={3} title="Aset Tetap">
                  <div className="overflow-x-auto mt-3">
                    <table className="w-full text-sm border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-2.5 px-4 text-left font-semibold text-gray-700 border-r border-gray-200">Nama Aset</th>
                          <th className="py-2.5 px-4 text-right font-semibold text-gray-700 border-r border-gray-200">Harga Perolehan</th>
                          <th className="py-2.5 px-4 text-center font-semibold text-gray-700 border-r border-gray-200">Umur (Th)</th>
                          <th className="py-2.5 px-4 text-right font-semibold text-gray-700">Penyusutan/Tahun</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ASET_DETAIL.map((a, i) => (
                          <tr key={a.nama} className={i % 2 === 0 ? 'bg-white border-t border-gray-200' : 'bg-gray-50 border-t border-gray-200'}>
                            <td className="py-2.5 px-4 border-r border-gray-200 text-gray-700">{a.nama}</td>
                            <td className="py-2.5 px-4 border-r border-gray-200 text-right tabular-nums text-gray-700">{idr(a.harga)}</td>
                            <td className="py-2.5 px-4 border-r border-gray-200 text-center text-gray-700">{a.umur}</td>
                            <td className="py-2.5 px-4 text-right tabular-nums text-gray-700">
                              {idr(Math.round((a.harga - a.nilaiSisa) / a.umur))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 border-t-2 border-gray-300">
                          <td colSpan={2} className="py-3 px-4 font-bold text-gray-800 text-right border-r border-gray-200">
                            Harga Perolehan (Kotor)
                          </td>
                          <td className="py-3 px-4 border-r border-gray-200" />
                          <td className="py-3 px-4 text-right font-bold text-gray-900 tabular-nums">
                            {idr(TOTAL_PEROLEHAN)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <DocTable rows={[
                    { label: 'Harga Perolehan (Kotor)',        value: idr(TOTAL_PEROLEHAN) },
                    { label: 'Akumulasi Penyusutan',           value: `(${idr(d.akumulasiPenyusutan)})` },
                    { label: 'Nilai Buku Aset Tetap (Neto)',   value: idr(nilaiBuku), bold: true },
                  ]} />
                </AccountCard>

                <AccountCard number={4} title="Pendapatan">
                  <DocTable rows={[
                    { label: 'Penjualan Bandeng Presto (Langsung)', value: idr(d.pendapatan.presto)     },
                    { label: 'Penjualan Produk Konsinyasi',         value: idr(d.pendapatan.konsinyasi) },
                    { label: 'Pendapatan Lain-lain',                value: idr(d.pendapatan.lainLain)  },
                    { label: 'Jumlah Pendapatan',                   value: idr(totalPend), bold: true  },
                  ]} />
                </AccountCard>

                <AccountCard number={5} title="Beban Usaha">
                  <DocTable rows={[
                    { label: 'Biaya Gaji & Tunjangan Karyawan', value: idr(d.beban.gaji)         },
                    { label: 'Biaya Listrik, Air & PDAM',       value: idr(d.beban.listrik)       },
                    { label: 'Biaya Penyusutan Aset Tetap',     value: idr(d.beban.penyusutan)    },
                    { label: 'Biaya Pemeliharaan Mesin',        value: idr(d.beban.pemeliharaan)  },
                    { label: 'Biaya Bahan Bakar',               value: idr(d.beban.bbm)           },
                    { label: 'Biaya Kemasan & Distribusi',      value: idr(d.beban.kemasan)       },
                    { label: 'Biaya Lain-lain',                 value: idr(d.beban.lainLain)      },
                    { label: 'Jumlah Beban Usaha',              value: idr(totalBeban), bold: true },
                  ]} />
                </AccountCard>
              </div>
            </section>
          </div>
          
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 text-center">
            <p className="text-xs text-gray-500">
              Catatan ini merupakan bagian tak terpisahkan dari laporan keuangan CV New Citra untuk periode yang berakhir {d.tanggal}.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          .bg-white.rounded-lg.shadow-sm.border.border-gray-200.overflow-hidden,
          .bg-white.rounded-lg.shadow-sm.border.border-gray-200.overflow-hidden * { visibility: visible; }
          .bg-white.rounded-lg.shadow-sm.border.border-gray-200.overflow-hidden {
            position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}

// PERUBAHAN: Tambahkan Layout persistent di sini (Opsional tapi disarankan agar sidebar tidak hilang)
// Hapus komentar di bawah ini jika kamu sudah meng-import AuthenticatedLayout di atas.
/* 
Calk.layout = (page: React.ReactNode) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
); 
*/
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TransaksiPengeluaran;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransaksiPengeluaranController extends Controller
{
    public function index()
    {
        // 1. Ambil data transaksi beserta relasi nama akunnya
        $transaksis = TransaksiPengeluaran::with('akun')->orderBy('tgl_transaksi', 'desc')->get();

        // 2. Ambil data Akun untuk dropdown
        $akuns = DB::table('t_akun')->get();

        // 3. Ambil data Utang Produksi yang masih 'blm lunas'
        // Data ini tetap dikirim ke React agar React bisa menjumlahkan total sisanya
        $utangs = DB::table('t_utang_produksi')
            ->join('t_cogm', 't_utang_produksi.id_cogm', '=', 't_cogm.id_cogm')
            ->where('status', 'blm lunas')
            ->select('t_utang_produksi.*', 't_cogm.total_btkl', 't_cogm.total_bop')
            ->get()
            ->map(function($u) {
                // Hitung sisa tagihan utang per item (Total - Nominal Terbayar)
                $totalUtang = $u->jenis === 'BTKL' ? $u->total_btkl : $u->total_bop;
                $sisaUtang = $totalUtang - $u->nominal_terbayar;
                
                return [
                    'id_utang' => $u->id_utang,
                    'id_cogm'  => $u->id_cogm,
                    'jenis'    => $u->jenis,
                    'sisa'     => $sisaUtang,
                    'label'    => "Utang " . $u->jenis . " (COGM ID: " . $u->id_cogm . ") - Sisa: Rp " . number_format($sisaUtang, 0, ',', '.')
                ];
            });

        // 4. Lempar data ke komponen React
        return Inertia::render('TransaksiPengeluaran', [
            'transaksis' => $transaksis,
            'akuns'      => $akuns,
            'utangs'     => $utangs
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validasi Input (id_cogm sudah dihapus dari validasi karena ini pembayaran global)
        $request->validate([
            'id_akun'           => 'required',
            'jenis_pengeluaran' => 'required|in:Operasional,Pembayaran Utang Produksi',
            'no_transaksi'      => 'required|string|max:20',
            'tgl_transaksi'     => 'required|date',
            'nominal_bayar'     => 'required|numeric|min:1',
            'metode_bayar'      => 'required|in:Cash,Transfer',
            'catatan'           => 'nullable|string',
        ]);

        // Gunakan DB Transaction untuk menjaga integritas data keuangan
        DB::beginTransaction();
        try {
            // 2. Simpan Transaksi Pengeluaran ke Database
            TransaksiPengeluaran::create([
                'id_akun'           => $request->id_akun,
                'id_cogm'           => null, // Sengaja dikosongkan karena pembayaran akumulasi/global
                'jenis_pengeluaran' => $request->jenis_pengeluaran,
                'jenis_utang'       => $request->jenis_utang, 
                'no_transaksi'      => $request->no_transaksi,
                'tgl_transaksi'     => $request->tgl_transaksi,
                'nominal_bayar'     => $request->nominal_bayar,
                'metode_bayar'      => $request->metode_bayar,
                'catatan'           => $request->catatan,
            ]);

            // 3. LOGIKA OTOMATIS: POTONG UTANG (METODE FIFO - First In First Out)
            if ($request->jenis_pengeluaran === 'Pembayaran Utang Produksi' && $request->jenis_utang) {
                
                // Cari semua utang dengan jenis tsb (BTKL/BOP) yang belum lunas, urutkan dari yang paling TUA
                $utangs = DB::table('t_utang_produksi')
                    ->where('jenis', $request->jenis_utang)
                    ->where('status', 'blm lunas')
                    ->orderBy('id_utang', 'asc') 
                    ->get();

                $sisaUangBayar = $request->nominal_bayar;

                foreach ($utangs as $u) {
                    if ($sisaUangBayar <= 0) break; // Jika uang bayar sudah habis tersalurkan, hentikan perulangan

                    // Cari tahu total tagihan asli dari tabel COGM
                    $cogm = DB::table('t_cogm')->where('id_cogm', $u->id_cogm)->first();
                    $totalTagihan = $u->jenis === 'BTKL' ? $cogm->total_btkl : $cogm->total_bop;
                    
                    // Hitung sisa yang masih harus dibayar khusus untuk item tagihan ini
                    $sisaTagihanItem = $totalTagihan - $u->nominal_terbayar;

                    if ($sisaUangBayar >= $sisaTagihanItem) {
                        // Skenario A: Uang cukup untuk melunasi penuh item tagihan ini
                        DB::table('t_utang_produksi')->where('id_utang', $u->id_utang)->update([
                            'nominal_terbayar' => $totalTagihan,
                            'status'           => 'lunas'
                        ]);
                        $sisaUangBayar -= $sisaTagihanItem; // Uang sisa dikurangi tagihan item ini
                    } else {
                        // Skenario B: Uang hanya cukup untuk mencicil sebagian item tagihan ini
                        DB::table('t_utang_produksi')->where('id_utang', $u->id_utang)->update([
                            'nominal_terbayar' => $u->nominal_terbayar + $sisaUangBayar,
                            'status'           => 'blm lunas'
                        ]);
                        $sisaUangBayar = 0; // Uang habis
                    }
                }
            }

            // ======== 4. PENCATATAN JURNAL AKUNTANSI OTOMATIS ========
            
            // Generate Nomor Jurnal (Contoh: JU-202607-001)
            $prefixJU = 'JU-' . date('Ym', strtotime($request->tgl_transaksi)) . '-';
            $lastJurnal = DB::table('t_jurnal')
                ->where('kode_jurnal', 'like', $prefixJU . '%')
                ->orderBy('kode_jurnal', 'desc')
                ->first();
            
            $nextNum = 1;
            if ($lastJurnal) {
                $parts = explode('-', $lastJurnal->kode_jurnal);
                $nextNum = (int) end($parts) + 1;
            }
            $kodeJurnal = $prefixJU . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

            // Insert Header Jurnal
            $idJurnal = DB::table('t_jurnal')->insertGetId([
                'kode_jurnal'    => $kodeJurnal,
                'tanggal'        => $request->tgl_transaksi,
                'keterangan'     => "Pengeluaran Kas/Bank: " . ($request->catatan ?? $request->jenis_pengeluaran) . " (" . $request->no_transaksi . ")",
                'jenis_jurnal'   => 'umum',
                'kode_referensi' => $request->no_transaksi,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            // Tentukan ID Akun Kredit (Sumber Dana) berdasarkan pilihan "Metode Pembayaran"
            // Kode Akun 1001001 = KAS, 1001002 = BANK (Sesuai Seeder Anda)
            $kodeAkunKredit = $request->metode_bayar === 'Cash' ? '1001001' : '1001002';
            $idAkunKredit = DB::table('t_akun')->where('kode_akun', $kodeAkunKredit)->value('id_akun');

            // (A) DEBIT: Akun Utang / Beban Operasional yang dipilih oleh user
            DB::table('t_jurnal_detail')->insert([
                'id_jurnal'  => $idJurnal,
                'id_akun'    => $request->id_akun,
                'debit'      => $request->nominal_bayar,
                'kredit'     => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // (B) KREDIT: Akun Kas / Bank tempat uang keluar
            DB::table('t_jurnal_detail')->insert([
                'id_jurnal'  => $idJurnal,
                'id_akun'    => $idAkunKredit,
                'debit'      => 0,
                'kredit'     => $request->nominal_bayar,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Transaksi pengeluaran berhasil disimpan, utang dipotong, dan Jurnal telah dicatat!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan transaksi: ' . $e->getMessage()]);
        }
    }
}
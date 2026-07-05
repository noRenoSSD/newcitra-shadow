<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class BukuBesarController extends Controller
{
    public function index()
    {
        // 1. Tarik Master Akun
        $masterAkun = DB::table('t_akun')
            ->select(
                'kode_akun as kode', 
                'nama_akun as nama', 
                DB::raw("IF(saldo_normal = 'Debit', true, false) as normalDebit"),
                'saldo_awal as saldoAwal'
            )
            ->orderBy('kode_akun', 'asc')
            ->get();

        // 2. Tarik Transaksi Jurnal (Header + Detail)
        $transaksiRaw = DB::table('t_jurnal as j')
            ->join('t_jurnal_detail as dj', 'j.id_jurnal', '=', 'dj.id_jurnal') // Menggunakan t_jurnal_detail
            ->join('t_akun as a', 'dj.id_akun', '=', 'a.id_akun')
            ->select(
                'a.kode_akun',
                'j.id_jurnal as id',
                'j.tanggal as tanggalISO',
                'j.kode_jurnal as noJurnal',
                'j.keterangan',
                'dj.debit',
                'dj.kredit'
            )
            ->orderBy('j.tanggal', 'asc')
            ->orderBy('j.id_jurnal', 'asc')
            ->get();

        // 3. Mapping Transaksi ke Format LedgerData
        $ledgerData = $masterAkun->map(function ($akun) use ($transaksiRaw) {
            $txAkun = $transaksiRaw->where('kode_akun', $akun->kode)->values()->map(function ($tx) {
                // Konversi tanggal ke format Indonesia
                $bln = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
                $parsedDate = Carbon::parse($tx->tanggalISO);
                $tanggalIndo = $parsedDate->format('d') . ' ' . $bln[(int)$parsedDate->format('m')] . ' ' . $parsedDate->format('Y');

                return [
                    'id'         => $tx->id . '-' . uniqid(), // Mencegah duplikasi key di React
                    'tanggalISO' => $tx->tanggalISO,
                    'tanggal'    => $tanggalIndo,
                    'noJurnal'   => $tx->noJurnal,
                    'keterangan' => $tx->keterangan,
                    'debit'      => (float) $tx->debit,
                    'kredit'     => (float) $tx->kredit,
                ];
            })->toArray();

            return [
                'kodeAkun'     => $akun->kode,
                'saldoAwal'    => (float) $akun->saldoAwal,
                'transactions' => $txAkun,
            ];
        })->toArray();

        return Inertia::render('Keuangan/BukuBesar', [
            'masterAkun' => $masterAkun,
            'ledgerData' => $ledgerData
        ]);
    }
}
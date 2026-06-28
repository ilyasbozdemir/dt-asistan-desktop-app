import React, { useState } from 'react'
import {
  FileText,
  BarChart2,
  TrendingUp,
  Wallet,
  Calendar,
  ChevronRight,
  Download,
  Printer,
  Filter
} from 'lucide-react'

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_KAYIT_FORMU_ROWS = [
  {
    id: 1,
    tarih: '03.01.2024',
    firma: 'Ofis Dünyası Ltd. Şti.',
    kalem: 'Roller Kalem (Siyah) x50',
    tutar: 1250.0,
    durum: 'Tamamlandı'
  },
  {
    id: 2,
    tarih: '11.01.2024',
    firma: 'Temizlik A.Ş.',
    kalem: 'Genel Temizlik Hizmeti (Ocak)',
    tutar: 8400.0,
    durum: 'Tamamlandı'
  },
  {
    id: 3,
    tarih: '15.01.2024',
    firma: 'Bilişim Sistemleri Ltd.',
    kalem: 'Yazıcı Toner Kartuşu x5',
    tutar: 3750.0,
    durum: 'Tamamlandı'
  },
  {
    id: 4,
    tarih: '22.01.2024',
    firma: 'Kırtasiye Plus',
    kalem: 'A4 Kâğıt (80gr) 10 Koli',
    tutar: 2200.0,
    durum: 'Tamamlandı'
  },
  {
    id: 5,
    tarih: '05.02.2024',
    firma: 'Teknik Servis A.Ş.',
    kalem: 'Klima Bakım Hizmeti',
    tutar: 5600.0,
    durum: 'Tamamlandı'
  },
  {
    id: 6,
    tarih: '14.02.2024',
    firma: 'Ofis Dünyası Ltd. Şti.',
    kalem: 'Zımba Teli x10 Kutu',
    tutar: 480.0,
    durum: 'Tamamlandı'
  },
  {
    id: 7,
    tarih: '20.02.2024',
    firma: 'Güvenlik Sistemleri A.Ş.',
    kalem: 'Güvenlik Kamera Bakımı',
    tutar: 12000.0,
    durum: 'Tamamlandı'
  },
  {
    id: 8,
    tarih: '01.03.2024',
    firma: 'Temizlik A.Ş.',
    kalem: 'Genel Temizlik Hizmeti (Mart)',
    tutar: 8400.0,
    durum: 'Devam Ediyor'
  },
  {
    id: 9,
    tarih: '07.03.2024',
    firma: 'Dijital Çözümler Ltd.',
    kalem: 'Yazılım Lisans Yenileme',
    tutar: 18500.0,
    durum: 'Devam Ediyor'
  },
  {
    id: 10,
    tarih: '12.03.2024',
    firma: 'Kırtasiye Plus',
    kalem: 'Dosya Klasörü x100',
    tutar: 1500.0,
    durum: 'Devam Ediyor'
  }
]

const MOCK_AYLIK_OZET = [
  { ay: 'Ocak', harcama: 15600, islem: 4 },
  { ay: 'Şubat', harcama: 18080, islem: 3 },
  { ay: 'Mart', harcama: 28400, islem: 3 },
  { ay: 'Nisan', harcama: 0, islem: 0 },
  { ay: 'Mayıs', harcama: 0, islem: 0 },
  { ay: 'Haziran', harcama: 0, islem: 0 },
  { ay: 'Temmuz', harcama: 0, islem: 0 },
  { ay: 'Ağustos', harcama: 0, islem: 0 },
  { ay: 'Eylül', harcama: 0, islem: 0 },
  { ay: 'Ekim', harcama: 0, islem: 0 },
  { ay: 'Kasım', harcama: 0, islem: 0 },
  { ay: 'Aralık', harcama: 0, islem: 0 }
]

const MOCK_BUTCE = {
  yillikLimit: 250000,
  kullanilanButce: 62080,
  kalanButce: 187920,
  gerceklesmePct: 24.8,
  genel: { limit: 150000, kullanilan: 40000 },
  ozel: { limit: 60000, kullanilan: 18000 },
  dis: { limit: 40000, kullanilan: 4080 }
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
type RaporTipi = 'kayit-formu' | 'aylik-ozet' | 'yillik-ozet' | 'butce'

const RAPOR_TIPLERI: { id: RaporTipi; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'kayit-formu',
    label: 'Doğrudan Temin Kayıt Formu',
    icon: <FileText className="w-5 h-5" />,
    desc: 'Seçilen dönem için tüm doğrudan temin kayıtlarının listesi'
  },
  {
    id: 'aylik-ozet',
    label: 'Aylık Özet Raporu',
    icon: <BarChart2 className="w-5 h-5" />,
    desc: 'Aylık harcama ve işlem adedi özeti'
  },
  {
    id: 'yillik-ozet',
    label: 'Yıllık Özet Raporu',
    icon: <TrendingUp className="w-5 h-5" />,
    desc: 'Seçilen yıla ait toplam harcama ve istatistikler'
  },
  {
    id: 'butce',
    label: 'Bütçe Durum Raporu',
    icon: <Wallet className="w-5 h-5" />,
    desc: 'Genel, özel ve dış bütçe kullanım durumu'
  }
]

const AYLAR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık'
]

const YILLAR = ['2022', '2023', '2024', '2025']

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'

// ─── SUB-VIEWS ───────────────────────────────────────────────────────────────
function KayitFormuView({ ay, yil }: { ay: string; yil: string }) {
  const ayNo = (AYLAR.indexOf(ay) + 1).toString().padStart(2, '0')
  const filtered = MOCK_KAYIT_FORMU_ROWS.filter((r) => r.tarih.includes(`${ayNo}.${yil.slice(2)}`))
  const toplam = filtered.reduce((s, r) => s + r.tutar, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Doğrudan Temin Kayıt Formu
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {ay} {yil} • {filtered.length} kayıt
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Printer className="w-3.5 h-3.5" /> Yazdır
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs text-white transition-colors">
            <Download className="w-3.5 h-3.5" /> Dışa Aktar
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-600 text-sm">
          Bu dönem için kayıt bulunamadı.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Tarih</th>
                  <th className="px-4 py-3 text-left">Firma</th>
                  <th className="px-4 py-3 text-left">Kalem / Açıklama</th>
                  <th className="px-4 py-3 text-right">Tutar</th>
                  <th className="px-4 py-3 text-center">Durum</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-t border-slate-100 dark:border-slate-700/50 ${
                      i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/30'
                    } hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors`}
                  >
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-600 font-mono">
                      {row.id}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {row.tarih}
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">
                      {row.firma}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.kalem}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {fmt(row.tutar)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          row.durum === 'Tamamlandı'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {row.durum}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/60">
                  <td
                    colSpan={4}
                    className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300 text-sm"
                  >
                    TOPLAM
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {fmt(toplam)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function AylikOzetView({ yil }: { yil: string }) {
  const maxHarcama = Math.max(...MOCK_AYLIK_OZET.map((r) => r.harcama), 1)
  const toplam = MOCK_AYLIK_OZET.reduce((s, r) => s + r.harcama, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Aylık Özet Raporu
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {yil} Yılı • Aylık harcama dağılımı
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs text-white transition-colors">
          <Download className="w-3.5 h-3.5" /> Dışa Aktar
        </button>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Yıllık Toplam</div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">
            {fmt(toplam)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Aylık Ortalama</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
            {fmt(toplam / 12)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Toplam İşlem</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {MOCK_AYLIK_OZET.reduce((s, r) => s + r.islem, 0)} adet
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Aylık Harcama (₺)
        </div>
        <div className="flex items-end gap-2 h-36">
          {MOCK_AYLIK_OZET.map((row) => {
            const pct = (row.harcama / maxHarcama) * 100
            return (
              <div key={row.ay} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {row.harcama > 0 ? (row.harcama / 1000).toFixed(0) + 'k' : ''}
                </div>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    row.harcama > 0
                      ? 'bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500'
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
                <div className="text-[9px] text-slate-400 dark:text-slate-500">
                  {row.ay.slice(0, 3)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Ay</th>
              <th className="px-4 py-3 text-right">Harcama (₺)</th>
              <th className="px-4 py-3 text-right">İşlem Adedi</th>
              <th className="px-4 py-3 text-right">Ort. İşlem Tutarı</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_AYLIK_OZET.map((row, i) => (
              <tr
                key={row.ay}
                className={`border-t border-slate-100 dark:border-slate-700/50 ${
                  i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                  {row.ay}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-200">
                  {row.harcama > 0 ? (
                    fmt(row.harcama)
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                  {row.islem > 0 ? row.islem : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                  {row.islem > 0 ? fmt(row.harcama / row.islem) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/60">
              <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">TOPLAM</td>
              <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {fmt(toplam)}
              </td>
              <td className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
                {MOCK_AYLIK_OZET.reduce((s, r) => s + r.islem, 0)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function YillikOzetView({ yil }: { yil: string }) {
  const toplam = MOCK_AYLIK_OZET.reduce((s, r) => s + r.harcama, 0)
  const islemSayisi = MOCK_AYLIK_OZET.reduce((s, r) => s + r.islem, 0)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Yıllık Özet Raporu
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{yil} Yılı Geneli</div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs text-white transition-colors">
          <Download className="w-3.5 h-3.5" /> Dışa Aktar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: 'Toplam Harcama',
            value: fmt(toplam),
            color: 'text-emerald-600 dark:text-emerald-400'
          },
          {
            label: 'İşlem Sayısı',
            value: `${islemSayisi} adet`,
            color: 'text-blue-600 dark:text-blue-400'
          },
          {
            label: 'Ortalama İşlem Tutarı',
            value: fmt(islemSayisi > 0 ? toplam / islemSayisi : 0),
            color: 'text-purple-600 dark:text-purple-400'
          },
          {
            label: 'En Yüksek Aylık Harcama',
            value: fmt(Math.max(...MOCK_AYLIK_OZET.map((r) => r.harcama))),
            color: 'text-orange-600 dark:text-orange-400'
          }
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{item.label}</div>
            <div className={`text-2xl font-bold font-mono ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          En Çok İşlem Yapılan Firmalar
        </div>
        {['Temizlik A.Ş.', 'Ofis Dünyası Ltd. Şti.', 'Kırtasiye Plus'].map((firma, i) => (
          <div
            key={firma}
            className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0"
          >
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
              {i + 1}
            </span>
            <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{firma}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{3 - i} işlem</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ButceView({ yil }: { yil: string }) {
  const { yillikLimit, kullanilanButce, kalanButce, gerceklesmePct, genel, ozel, dis } = MOCK_BUTCE
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Bütçe Durum Raporu
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {yil} Yılı Bütçe Kullanımı
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs text-white transition-colors">
          <Download className="w-3.5 h-3.5" /> Dışa Aktar
        </button>
      </div>

      {/* Genel Durum */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Toplam Bütçe Kullanımı</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono">
              {fmt(kullanilanButce)}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              / {fmt(yillikLimit)} yıllık limit
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              %{gerceklesmePct}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">gerçekleşme oranı</div>
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
            style={{ width: `${gerceklesmePct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Kullanılan: <strong className="text-red-500">{fmt(kullanilanButce)}</strong>
          </span>
          <span>
            Kalan: <strong className="text-emerald-500">{fmt(kalanButce)}</strong>
          </span>
        </div>
      </div>

      {/* Bütçe Tipleri */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Genel Bütçe', ...genel, color: 'from-blue-500 to-blue-600' },
          { label: 'Özel Bütçe', ...ozel, color: 'from-purple-500 to-purple-600' },
          { label: 'Dış Bütçe', ...dis, color: 'from-orange-500 to-orange-600' }
        ].map((b) => {
          const pct = Math.round((b.kullanilan / b.limit) * 100)
          return (
            <div
              key={b.label}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3"
            >
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {b.label}
              </div>
              <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">
                {fmt(b.kullanilan)}
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${b.color} rounded-full`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span>%{pct} kullanıldı</span>
                <span>Limit: {fmt(b.limit)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function RaporlarScreen() {
  const [seciliTip, setSeciliTip] = useState<RaporTipi>('kayit-formu')
  const [seciliYil, setSeciliYil] = useState('2024')
  const [seciliAy, setSeciliAy] = useState('Ocak')
  const [raporAktif, setRaporAktif] = useState(false)
  const [raporYil, setRaporYil] = useState('2024')
  const [raporAy, setRaporAy] = useState('Ocak')

  const handleRaporla = () => {
    setRaporYil(seciliYil)
    setRaporAy(seciliAy)
    setRaporAktif(true)
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Raporlar</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Harcama ve bütçe raporları</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sol Panel – Rapor Seçimi & Filtreler */}
        <div className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-1">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 px-2 mb-2">
              Rapor Türü
            </div>
            {RAPOR_TIPLERI.map((tip) => (
              <button
                key={tip.id}
                onClick={() => {
                  setSeciliTip(tip.id)
                  setRaporAktif(false)
                }}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  seciliTip === tip.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span
                  className={`mt-0.5 ${seciliTip === tip.id ? 'text-primary' : 'text-slate-400'}`}
                >
                  {tip.icon}
                </span>
                <div>
                  <div className="text-sm font-medium leading-tight">{tip.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">
                    {tip.desc}
                  </div>
                </div>
                {seciliTip === tip.id && (
                  <ChevronRight className="w-4 h-4 ml-auto mt-0.5 text-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Filtreler */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-3 mt-auto">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Dönem Seçimi
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Yıl
              </label>
              <select
                value={seciliYil}
                onChange={(e) => {
                  setSeciliYil(e.target.value)
                  setRaporAktif(false)
                }}
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {YILLAR.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>

            {(seciliTip === 'kayit-formu' || seciliTip === 'aylik-ozet') && (
              <div className="space-y-2">
                <label className="block text-xs text-slate-500 dark:text-slate-400">Ay</label>
                <select
                  value={seciliAy}
                  onChange={(e) => {
                    setSeciliAy(e.target.value)
                    setRaporAktif(false)
                  }}
                  className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {AYLAR.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleRaporla}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors shadow-sm"
            >
              <BarChart2 className="w-4 h-4" /> Raporla
            </button>
          </div>
        </div>

        {/* Sağ Panel – Rapor İçeriği */}
        <div className="flex-1 overflow-y-auto p-6">
          {!raporAktif ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-slate-400 dark:text-slate-600">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <BarChart2 className="w-8 h-8" />
              </div>
              <div>
                <div className="font-semibold text-slate-500 dark:text-slate-500">
                  Rapor Önizlemesi
                </div>
                <div className="text-xs mt-1">
                  Sol panelden rapor türü ve dönemi seçerek
                  <br />
                  "Raporla" butonuna basın.
                </div>
              </div>
            </div>
          ) : (
            <>
              {seciliTip === 'kayit-formu' && <KayitFormuView ay={raporAy} yil={raporYil} />}
              {seciliTip === 'aylik-ozet' && <AylikOzetView yil={raporYil} />}
              {seciliTip === 'yillik-ozet' && <YillikOzetView yil={raporYil} />}
              {seciliTip === 'butce' && <ButceView yil={raporYil} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { FileText, ExternalLink, Search, Copy, Check } from 'lucide-react'
import {
  EKONOMIK_KODLAR,
  FONKSIYONEL_KODLAR,
  FINANSMAN_KODLARI,
  GELIR_KODLARI
} from '../../../constants/butce-kodlari'

export function ButceKodlariTab(): React.JSX.Element {
  const [butceSearch, setButceSearch] = useState('')
  const [copiedText, setCopiedText] = useState('')

  const handleCopy = (text: string): void => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(''), 1500)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Analitik Bütçe Sınıflandırması (ABS)</p>
            <p>
              Kurumunuzda ve ödeme emri belgelerinde kullanılacak standart bütçe kodları listesidir.
              Ayarlar ekranından kurumunuza özel olanları seçebilirsiniz.
            </p>
          </div>
        </div>
        <a
          href="https://www.sbb.gov.tr/butce-cagrisi-ve-butce-hazirlama-rehberleri/"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          SBB Bütçe Rehberi
        </a>
      </div>

      {/* Arama Barı */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
        <input
          type="text"
          placeholder="Bütçe kodlarında arayın (örn: Personel, 03, Cari, Vergi)..."
          value={butceSearch}
          onChange={(e) => setButceSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fonksiyonel */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
            Fonksiyonel Kodlar
          </h3>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {FONKSIYONEL_KODLAR.filter(
              (item) =>
                item.kod.includes(butceSearch) ||
                item.aciklama.toLowerCase().includes(butceSearch.toLowerCase())
            ).map((item) => (
              <div
                key={item.kod}
                className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-slate-100/50 dark:hover:bg-slate-800/30 group transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450 w-8 shrink-0">
                    {item.kod}
                  </span>
                  <span
                    className="text-slate-700 dark:text-slate-300 truncate"
                    title={item.aciklama}
                  >
                    {item.aciklama}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(item.kod)}
                  className="text-slate-400 hover:text-emerald-500 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  title="Kodu kopyala"
                >
                  {copiedText === item.kod ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Finansman */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
            Finansman Tipi Kodları
          </h3>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {FINANSMAN_KODLARI.filter(
              (item) =>
                item.kod.includes(butceSearch) ||
                item.aciklama.toLowerCase().includes(butceSearch.toLowerCase())
            ).map((item) => (
              <div
                key={item.kod}
                className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-slate-100/50 dark:hover:bg-slate-800/30 group transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450 w-6 shrink-0">
                    {item.kod}
                  </span>
                  <span
                    className="text-slate-700 dark:text-slate-300 truncate"
                    title={item.aciklama}
                  >
                    {item.aciklama}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(item.kod)}
                  className="text-slate-400 hover:text-emerald-500 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  title="Kodu kopyala"
                >
                  {copiedText === item.kod ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ekonomik (Gider) */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
            Ekonomik Kodlar (Gider)
          </h3>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {EKONOMIK_KODLAR.filter(
              (item) =>
                item.kod.includes(butceSearch) ||
                item.aciklama.toLowerCase().includes(butceSearch.toLowerCase())
            ).map((item) => (
              <div
                key={item.kod}
                className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-slate-100/50 dark:hover:bg-slate-800/30 group transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450 w-8 shrink-0">
                    {item.kod}
                  </span>
                  <span
                    className="text-slate-700 dark:text-slate-300 truncate"
                    title={item.aciklama}
                  >
                    {item.aciklama}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(item.kod)}
                  className="text-slate-400 hover:text-emerald-500 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  title="Kodu kopyala"
                >
                  {copiedText === item.kod ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Gelir */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
            Gelir Kodları
          </h3>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {GELIR_KODLARI.filter(
              (item) =>
                item.kod.includes(butceSearch) ||
                item.aciklama.toLowerCase().includes(butceSearch.toLowerCase())
            ).map((item) => (
              <div
                key={item.kod}
                className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-slate-100/50 dark:hover:bg-slate-800/30 group transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450 w-8 shrink-0">
                    {item.kod}
                  </span>
                  <span
                    className="text-slate-700 dark:text-slate-300 truncate"
                    title={item.aciklama}
                  >
                    {item.aciklama}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(item.kod)}
                  className="text-slate-400 hover:text-emerald-500 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  title="Kodu kopyala"
                >
                  {copiedText === item.kod ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

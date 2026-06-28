import React, { useState } from 'react'
import { Info } from 'lucide-react'
import { cn } from '../../../utils/cn'
import {
  MADDE_22_BENTLERI,
  MADDE_3_ISTISNA_BENTLERI,
  SIKKULLANILANLAR
} from '../../../constants/madde-22-bentleri'

export function BentlerTab(): React.JSX.Element {
  const [subTab, setSubTab] = useState<'madde22' | 'madde3'>('madde22')

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 mb-4 overflow-x-auto">
        <button
          onClick={() => setSubTab('madde22')}
          className={cn(
            'pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
            subTab === 'madde22'
              ? 'border-purple-500 text-purple-650 dark:text-purple-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          Madde 22 (Doğrudan Temin)
        </button>
        <button
          onClick={() => setSubTab('madde3')}
          className={cn(
            'pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
            subTab === 'madde3'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          Madde 3 (İstisnalar)
        </button>
      </div>

      {subTab === 'madde22' ? (
        <>
          <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-xl border border-purple-100 dark:border-purple-800/50">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-purple-500" />
            <div className="text-sm">
              <p className="font-semibold mb-1">4734 Sayılı KİK - Madde 22 Bentleri</p>
              <p>
                Aşağıda belirtilen hallerde ihtiyaçların ilân yapılmaksızın ve teminat alınmaksızın
                doğrudan temin usulüyle karşılanması mümkündür.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MADDE_22_BENTLERI.map((bent) => {
              const isSikKullanilan = SIKKULLANILANLAR.includes(bent.bent)
              return (
                <div
                  key={bent.bent}
                  className={cn(
                    'p-4 rounded-xl border transition-all hover:shadow-md hover:border-purple-300 dark:hover:border-purple-800',
                    isSikKullanilan
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-purple-200 dark:border-purple-900/50'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      {bent.bent.toUpperCase()}
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{bent.kisaAd}</h3>
                    {isSikKullanilan && (
                      <span className="ml-auto text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full shrink-0">
                        SIK KULLANILAN
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {bent.aciklama}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{bent.detay}</p>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-800/50">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
            <div className="text-sm">
              <p className="font-semibold mb-1">4734 Sayılı KİK - Madde 3 İstisnaları</p>
              <p>
                Kanun kapsamındaki idarelerin yapacağı ve niteliği gereği Kamu İhale Kanunu
                hükümlerinden kısmen veya tamamen istisna tutulan alım bentleridir.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MADDE_3_ISTISNA_BENTLERI.map((bent) => (
              <div
                key={bent.bent}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    {bent.bent.toUpperCase()}
                  </span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">{bent.kisaAd}</h3>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {bent.aciklama}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{bent.detay}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

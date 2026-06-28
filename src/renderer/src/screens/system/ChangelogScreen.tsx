import React, { useState, useEffect } from 'react'
import { Megaphone, History } from 'lucide-react'

export default function ChangelogScreen(): React.JSX.Element {
  const [changelog, setChangelog] = useState<
    { version: string; notes: string; schema_max: number }[]
  >([])

  useEffect(() => {
    window.electron?.ipcRenderer
      .invoke('get-changelog')
      .then((res) => setChangelog(res))
      .catch((e) => console.error(e))
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <Megaphone className="w-8 h-8 text-amber-500" />
            Güncellemeler ve Sürüm Notları
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            DT Asistan uygulamasına gelen yenilikleri, düzeltmeleri ve değişiklikleri takip edin.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
        <div className="flex-1 space-y-8">
          {changelog.map((log, index) => (
            <div key={index} className="relative pl-8">
              <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/20"></div>
              {index !== changelog.length - 1 && (
                <div className="absolute left-[5px] top-5 bottom-[-32px] w-0.5 bg-slate-100 dark:bg-slate-800"></div>
              )}
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-3">
                Versiyon {log.version}
                {index === 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 font-bold uppercase tracking-wider">
                    En Yeni Sürüm
                  </span>
                )}
              </h4>
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                {log.notes}
              </div>
            </div>
          ))}

          {changelog.length === 0 && (
            <div className="text-center text-slate-500 dark:text-slate-400 py-12 text-sm flex flex-col items-center">
              <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
              Henüz bir sürüm notu bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

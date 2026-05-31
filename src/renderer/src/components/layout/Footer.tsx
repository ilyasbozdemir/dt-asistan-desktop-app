import React, { useState, useRef, useEffect } from 'react'
import { Info, ExternalLink, Bug, Star } from 'lucide-react'
import packageJson from '../../../../../package.json'

export function Footer(): React.JSX.Element {
  const [showAbout, setShowAbout] = useState(false)
  const aboutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(event.target as Node)) {
        setShowAbout(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openExternal = (url: string) => {
    const electron = window.electron as any
    if (electron && electron.shell && typeof electron.shell.openExternal === 'function') {
      electron.shell.openExternal(url)
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <footer className="h-8 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 text-xs text-slate-500 dark:text-slate-400 z-50">
      <div className="flex items-center space-x-4">
        <span>Doğrudan Temin Yönetim Sistemi</span>
        <span className="w-px h-3 bg-slate-300 dark:bg-slate-700"></span>
        <span>Hazır</span>
      </div>

      <div className="flex items-center space-x-2 relative" ref={aboutRef}>
        <span>v{packageJson.version}</span>

        <button
          onClick={() => setShowAbout(!showAbout)}
          className="flex items-center space-x-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
          title="Geliştirici & Destek"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Hakkında</span>
        </button>

        {showAbout && (
          <div className="absolute bottom-full right-0 mb-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden transition-all origin-bottom-right z-50">
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h4 className="text-slate-800 dark:text-white font-bold text-sm">
                DT Asistan (Doğrudan Temin)
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Sürüm {packageJson.version}</p>
            </div>
            
            <div className="p-3 text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-750/60 leading-relaxed font-medium">
              ⚠️ <strong>Sorumluluk Sınırı:</strong> Bu uygulama resmi bir ihale veya karar organı değildir ve yasal sorumluluk üstlenmez. 
              Süreçlerinizi kolaylaştıracak şablonlar sunan, firma/malzeme/hizmet bilgilerini tekrar tekrar yazmanızı önleyen akıllı bir yardımcı asistandır.
            </div>

            <div className="p-1.5 flex flex-col gap-0.5">
              <button
                onClick={() => openExternal('https://github.com/ilyasbozdemir/dt-desktop-app')}
                className="flex items-center gap-2 w-full p-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors font-semibold cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                <span className="flex-1 text-left text-xs font-bold text-slate-700 dark:text-slate-200">GitHub Reposu (Yıldız Ver ⭐)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
              
              <button
                onClick={() => openExternal('https://ilyasbozdemir.dev')}
                className="flex items-center gap-2 w-full p-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-blue-500 dark:text-blue-450 shrink-0" />
                <span className="flex-1 text-left text-xs">Geliştirici: İlyas Bozdemir</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
              
              <button
                onClick={() =>
                  openExternal('https://github.com/ilyasbozdemir/dt-desktop-app/issues')
                }
                className="flex items-center gap-2 w-full p-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                <Bug className="w-3.5 h-3.5 text-rose-500 dark:text-rose-455 shrink-0" />
                <span className="flex-1 text-left text-xs">Hata Bildir / Destek</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}

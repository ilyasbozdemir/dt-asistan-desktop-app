import React, { useState, useRef, useEffect } from 'react'
import { Info, ExternalLink, Bug, Star, Wifi } from 'lucide-react'
import packageJson from '../../../../../package.json'
import { NetworkSyncModal } from '../network/NetworkSyncModal'
import { useWorkspaceStore } from '../../store/workspaceStore'

export function Footer(): React.JSX.Element {
  const { activeMeta } = useWorkspaceStore()
  const [showAbout, setShowAbout] = useState(false)
  const [showNetwork, setShowNetwork] = useState(false)
  const [appVersion, setAppVersion] = useState(packageJson.version)
  const [localIp, setLocalIp] = useState<string | null>(null)
  const aboutRef = useRef<HTMLDivElement>(null)

  const fetchVersion = () => {
    if ((window as any).api?.getAppVersion) {
      ;(window as any).api
        .getAppVersion()
        .then((v: string) => {
          if (v) setAppVersion(v)
        })
        .catch(console.error)
    }
  }

  useEffect(() => {
    fetchVersion()

    // Start local server to get IP
    if ((window as any).electron?.ipcRenderer) {
      ;(window as any).electron.ipcRenderer
        .invoke('network:start-express', 4000)
        .then((res: any) => {
          if (res && res.success) {
            setLocalIp(`${res.ip}:${res.port}`)
          }
        })
        .catch(console.error)
    }

    window.addEventListener('app-version-changed', fetchVersion)
    return () => window.removeEventListener('app-version-changed', fetchVersion)
  }, [])

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
        {activeMeta?.updated_at && (
          <>
            <span className="w-px h-3 bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-600 dark:text-slate-400">
              Son Güncelleme:{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {new Date(activeMeta.updated_at).toLocaleString('tr-TR')}
              </span>
            </span>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2 relative" ref={aboutRef}>
        <span>v{appVersion}</span>

        <button
          onClick={() => setShowNetwork(true)}
          className="flex items-center space-x-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-500 font-medium"
          title="Ağ Senkronizasyonu"
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Ağ Paylaşımı {localIp && `(${localIp})`}</span>
        </button>

        <button
          onClick={() => setShowAbout(!showAbout)}
          className="flex items-center space-x-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
          title="Geliştirici & Destek"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Hakkında</span>
        </button>

        {showAbout && (
          <div className="absolute bottom-full right-0 mb-2 w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden transition-all origin-bottom-right z-50">
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-start">
              <div>
                <h4 className="text-slate-800 dark:text-white font-bold text-sm">
                  DT Asistan (Doğrudan Temin)
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Sürüm {packageJson.version}
                </p>
              </div>
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                Ücretsiz Sürüm
              </span>
            </div>

            <div className="p-3 text-[11px] text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 leading-relaxed">
              <p className="mb-2">
                Bu sürüm <strong>tek kullanıcılı</strong> ve yerel{' '}
                <strong>SQLite tabanlı (.dtal)</strong> olarak çalışan ücretsiz sürümdür.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 p-2.5 rounded-lg">
                <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Kurumsal Çözümler İçin
                </p>
                <p className="text-[10px] text-blue-700/80 dark:text-blue-300/80 leading-snug">
                  Kurum içi harici sunucu kurulumu, rol bazlı yetkilendirme (Role-Based Access
                  Control), gelişmiş çoklu kullanıcı senkronizasyonu ve log yönetimi gibi
                  profesyonel ihtiyaçlarınız için geliştiriciyle iletişime geçebilirsiniz.
                </p>
              </div>
            </div>

            <div className="p-1.5 flex flex-col gap-0.5 bg-slate-50/50 dark:bg-slate-800/20">
              <button
                onClick={() =>
                  openExternal('https://github.com/ilyasbozdemir/dt-asistan-desktop-app')
                }
                className="flex items-center gap-2 w-full p-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all font-semibold cursor-pointer group"
              >
                <Star className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
                <span className="flex-1 text-left text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  Projeyi beğendin mi? Github&apos;da Yıldızla! ⭐
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() => openExternal('https://ilyasbozdemir.dev')}
                className="flex items-center gap-2 w-full p-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                <span className="flex-1 text-left text-[11px] font-medium">
                  Geliştirici ile İletişime Geç
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() =>
                  openExternal('https://github.com/ilyasbozdemir/dt-asistan-desktop-app/issues')
                }
                className="flex items-center gap-2 w-full p-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Bug className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                <span className="flex-1 text-left text-[11px] font-medium">
                  Hata Bildir / Destek Talebi
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showNetwork && <NetworkSyncModal onClose={() => setShowNetwork(false)} />}
    </footer>
  )
}

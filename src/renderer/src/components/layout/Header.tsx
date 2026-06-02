import React from 'react'
import { Bell, Moon, Sun, Minus, Square, X, DownloadCloud } from 'lucide-react'
import { useTheme } from '../providers/ThemeProvider'
import { TeminSelector } from './TeminSelector'

export function Header(): React.JSX.Element {
  const { theme, setTheme } = useTheme()
  const [updateStatus, setUpdateStatus] = React.useState<{status: string, version?: string} | null>(null)

  React.useEffect(() => {
    const removeListener = window.electron?.ipcRenderer.on('updater:status', (_event, data) => {
      setUpdateStatus(data as any)
    })
    return () => {
      if (removeListener) removeListener()
    }
  }, [])

  const handleMinimize = () => window.electron?.ipcRenderer.send('window-minimize')
  const handleMaximize = () => window.electron?.ipcRenderer.send('window-maximize')
  const handleClose = () => window.electron?.ipcRenderer.send('window-close')

  return (
    <header
      className="h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-50 shadow-sm transition-all duration-300"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex-1 flex items-center gap-6">
        <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <TeminSelector />
        </div>
      </div>

      <div className="flex items-center space-x-1 pr-32">
        <button
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
          title="Tema Değiştir"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {updateStatus && (updateStatus.status === 'available' || updateStatus.status === 'downloaded') && (
          <button
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            onClick={() => {
              if (updateStatus.status === 'downloaded') {
                window.electron?.ipcRenderer.send('install-update')
              } else {
                alert('Güncelleme arka planda indiriliyor, lütfen bekleyin...')
              }
            }}
            className="relative p-2 text-blue-500 hover:text-blue-600 transition-all rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30"
            title={updateStatus.status === 'downloaded' ? `Yeni sürüm hazır: ${updateStatus.version} (Kurmak için tıkla)` : `Yeni sürüm iniyor: ${updateStatus.version}...`}
          >
            <DownloadCloud className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></span>
          </button>
        )}

        <button
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 relative mr-2"
          title="Bildirimler"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></span>
        </button>
      </div>

      {/* Native-style Window Controls */}
      <div
        className="absolute top-0 right-0 flex items-center h-8"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="h-full w-12 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-none"
          title="Simge Durumuna Küçült"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-full w-12 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-none"
          title="Ekranı Kapla"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleClose}
          className="h-full w-12 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#e81123] transition-none"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}

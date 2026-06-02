import { useEffect } from 'react'
import { Outlet, useRouterState, useNavigate } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { TabsBar } from './TabsBar'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useTabStore, getTabLabel } from '../../store/tabStore'
import LauncherScreen from '../../screens/launcher/index.screen'
import LockScreen from './LockScreen'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeftToLine, Minus, Square, X } from 'lucide-react'

export function PageWrapper(): React.ReactNode {
  const routerState = useRouterState()
  const navigate = useNavigate()

  useEffect(() => {
    const path = routerState.location.pathname
    let title = 'DT Asistan'

    if (path === '/') title += ' — Gösterge Paneli'
    else if (path.startsWith('/dosyalar')) title += ' — Doğrudan Teminler'
    else if (path.startsWith('/firmalar')) title += ' — Firmalar'
    else if (path.startsWith('/personel')) title += ' — Personel'
    else if (path.startsWith('/mevzuat')) title += ' — Mevzuat & Limitler'
    else if (path.startsWith('/ayarlar')) title += ' — Ayarlar'
    else if (path.startsWith('/birimler')) title += ' — Birim Yönetimi'
    else if (path.startsWith('/ambar')) title += ' - Ambar Tanımları'
    else if (path.startsWith('/olcubirimleri')) title += ' - Ölçü Birimleri'
    else if (path.startsWith('/malzemeler/yeni')) title += ' - Yeni Kayıt (Mal/Hizmet/Yapım İşi)'
    else if (path.startsWith('/malzemeler')) title += ' - Kayıtlı Mal / Hizmet / Yapım İşleri Listesi'
    else if (path.startsWith('/kurum')) title += ' - Kurum Bilgileri'
    else if (path.startsWith('/profil')) title += ' — Kullanıcı Profili'

    document.title = title
  }, [routerState.location.pathname])

  const { activeFilePath, openWorkspace, isAuthenticated, loadActiveMeta } = useWorkspaceStore()
  const { loadSettings } = useSettingsStore()
  const { addTab, clearTabs } = useTabStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (activeFilePath && isAuthenticated) {
      loadSettings()
      loadActiveMeta()
    }
  }, [activeFilePath, isAuthenticated, loadSettings, loadActiveMeta])

  // Sync route with tab store
  useEffect(() => {
    if (activeFilePath && isAuthenticated) {
      addTab(routerState.location.href)
    }
  }, [routerState.location.href, activeFilePath, isAuthenticated, addTab])

  // Reset tabs when workspace/auth is closed
  useEffect(() => {
    if (!activeFilePath || !isAuthenticated) {
      clearTabs()
    }
  }, [activeFilePath, isAuthenticated, clearTabs])

  // Listen for db change invalidations from main process
  useEffect(() => {
    if (!window.electron) return
    const removeListener = window.electron.ipcRenderer.on('db:invalidated', () => {
      queryClient.invalidateQueries()
    })
    return () => {
      if (removeListener) removeListener()
    }
  }, [queryClient])

  // Listen for tabs returned from detached windows
  useEffect(() => {
    if (!window.electron) return
    const removeListener = window.electron.ipcRenderer.on(
      'tab:returned-from-window',
      (_, data: { path: string }) => {
        addTab(data.path)
        navigate({ to: data.path })
      }
    )
    return () => {
      if (removeListener) removeListener()
    }
  }, [addTab, navigate])

  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const isWindowMode = searchParams.get('mode') === 'window' || hashParams.get('mode') === 'window'

  // When opened as a detached window, restore workspace context from URL params
  useEffect(() => {
    if (!isWindowMode) return
    const wpFromSearch = searchParams.get('wp')
    const wpFromHash = hashParams.get('wp')
    const workspacePath = wpFromSearch || wpFromHash
    if (workspacePath) {
      const decodedPath = decodeURIComponent(workspacePath)
      // Set sessionStorage so the workspace store picks it up
      sessionStorage.setItem('workspace_path', decodedPath)
      sessionStorage.setItem('workspace_auth', 'true')
      // Open the workspace in the main process (it may already be open, which is fine)
      openWorkspace(decodedPath).then((result) => {
        if (result.success) {
          // Mark as authenticated since parent was already authenticated
          useWorkspaceStore.getState().setIsAuthenticated(true)
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount

  useEffect(() => {
    // Initial fetch of DB name if any (in case backend already has an open DB on soft reload)
    window.electron?.ipcRenderer.invoke('db:get-settings').then(async (res) => {
      const dbIsOpen = res && res.institutionName && !res.institutionName.includes('Hata')
      if (!dbIsOpen && activeFilePath) {
        const result = await openWorkspace(activeFilePath)
        if (result.success) queryClient.clear()
      }
    })

    const handleDteFileOpen = async (filePath: string) => {
      const currentActivePath = useWorkspaceStore.getState().activeFilePath
      if (!currentActivePath) {
        alert(
          `Dışarıdan veri aktarım dosyası (.dte) algılandı, ancak aktif bir kurum dosyası açık değil.\nLütfen önce bir çalışma dosyası (.dtm) açın veya oluşturun.`
        )
        return
      }

      const fileBaseName = filePath.split('\\').pop()?.split('/').pop() || 'veri'
      const confirmImport = confirm(
        `"${fileBaseName}" veri dosyasındaki kayıtları aktif kurumunuza aktarmak istiyor musunuz?`
      )
      
      if (!confirmImport) return

      try {
        const res = await window.electron.ipcRenderer.invoke('db:import-dte', filePath)
        if (res.success) {
          let msg = ''
          if (res.importedFirmsCount > 0) msg += `${res.importedFirmsCount} adet firma `
          if (res.importedItemsCount > 0) msg += `${msg ? 've ' : ''}${res.importedItemsCount} adet malzeme/hizmet kalemi `
          
          if (!msg) {
            msg = 'Aktarılacak yeni kayıt bulunamadı veya atlandı.'
          } else {
            msg += 'başarıyla içe aktarıldı.'
          }

          if (res.warnings && res.warnings.length > 0) {
            msg += `\n(Uyarılar: ${res.warnings.join(', ')})`
          }

          alert(msg)
          queryClient.clear()
        } else {
          alert(`İçe aktarma başarısız oldu!\nHata: ${res.error || 'Bilinmeyen hata'}`)
        }
      } catch (err: any) {
        alert(`İçe aktarma sırasında hata oluştu!\nHata: ${err.message}`)
      }
    }

    // Check if app was launched by double clicking a file
    window.electron?.ipcRenderer.invoke('get-initial-file').then(async (filePath) => {
      if (filePath) {
        if (filePath.toLowerCase().endsWith('.dte')) {
          handleDteFileOpen(filePath)
        } else {
          const result = await openWorkspace(filePath)
          if (result.success) queryClient.clear()
        }
      }
    })

    // Listen for files opened while app is already running
    const removeListener = window.electron?.ipcRenderer.on(
      'open-external-file',
      async (_, filePath) => {
        if (filePath) {
          if (filePath.toLowerCase().endsWith('.dte')) {
            handleDteFileOpen(filePath)
          } else {
            const result = await openWorkspace(filePath)
            if (result.success) queryClient.clear()
          }
        }
      }
    )



    return () => {
      if (removeListener) removeListener()
    }
  }, [openWorkspace, queryClient])

  if (isWindowMode) {
    // Extract the real path from the hash (strip mode=window param)
    const rawPath = routerState.location.pathname || '/'
    const windowTitle = getTabLabel(rawPath)

    const handleReturnToParent = () => {
      window.electron?.ipcRenderer.send('tab:return-to-parent', { path: rawPath })
    }

    const handleMinimize = () => window.electron?.ipcRenderer.send('window-minimize')
    const handleMaximize = () => window.electron?.ipcRenderer.send('window-maximize')
    const handleClose = () => window.electron?.ipcRenderer.send('window-close')

    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col">
        {/* Window Title Bar */}
        <div
          className="h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center px-3 shrink-0 gap-2"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
          {/* Return to Parent button */}
          <button
            onClick={handleReturnToParent}
            title="Ana Pencereye Dön (Sekme Olarak)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-all cursor-pointer"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <ArrowLeftToLine className="w-3.5 h-3.5" />
            <span>Sekmeye Dön</span>
          </button>

          {/* Title */}
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate flex-1 ml-2">
            {windowTitle}
          </span>

          {/* Window controls */}
          <div
            className="flex items-center"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <button
              onClick={handleMinimize}
              className="h-8 w-10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-none"
              title="Simge Durumuna Küçült"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className="h-8 w-10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-none"
              title="Ekranı Kapla"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={handleClose}
              className="h-8 w-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#e81123] transition-none"
              title="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    )
  }

  if (!activeFilePath) {
    return <LauncherScreen />
  }

  if (!isAuthenticated) {
    return <LockScreen />
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <TabsBar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}


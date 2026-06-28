import React, { useState, useEffect } from 'react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  Database,
  FileJson,
  FolderOpen,
  FileArchive,
  ArrowLeft,
  Copy,
  Check,
  Info,
  Layers,
  Calendar,
  Building,
  Cpu,
  AlertTriangle,
  RefreshCw,
  Upload,
  Download,
  Target,
  FileText,
  ShoppingCart,
  CheckCircle,
  PlusCircle,
  ListTodo,
  ChevronDown,
  ChevronUp,
  Play
} from 'lucide-react'

interface TableStat {
  tableName: string
  label: string
  count: number
  description: string
}

type PackageFile = 'meta.json' | 'database.sqlite' | 'attachments/'

export default function DosyaScreen(): React.JSX.Element {
  const { activeMeta, activeFilePath, fileName } = useWorkspaceStore()
  const [selectedFile, setSelectedFile] = useState<PackageFile>('meta.json')
  const [copied, setCopied] = useState(false)

  const queryClient = useQueryClient()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [changelog, setChangelog] = useState<
    { version: string; notes: string; schema_max: number }[]
  >([])

  // Süreç Yönetimi States
  const [processStats, setProcessStats] = useState({
    asama1: 0,
    asama2: 0,
    asama3: 0,
    asama4: 0,
    tamamlandi: 0
  })
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)

  useEffect(() => {
    if (!window.electron) return
    window.electron.ipcRenderer
      .invoke('get-changelog')
      .then((log) => setChangelog(log))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!window.electron || !activeFilePath) return
    const fetchProcessStats = async () => {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT durum_asama_id, COUNT(*) as count FROM DATA_TeminDosyasi GROUP BY durum_asama_id'
        )
        if (res.success && res.data) {
          const stats = { asama1: 0, asama2: 0, asama3: 0, asama4: 0, tamamlandi: 0 }
          res.data.forEach((row: any) => {
            const asama = row.durum_asama_id || 1
            if (asama === 1) stats.asama1 += row.count
            else if (asama === 2) stats.asama2 += row.count
            else if (asama === 3) stats.asama3 += row.count
            else if (asama === 4) stats.asama4 += row.count
            else if (asama === 5) stats.tamamlandi += row.count
          })
          setProcessStats(stats)
        }
      } catch (e) {
        console.error('Süreç istatistikleri alınamadı', e)
      }
    }
    fetchProcessStats()
  }, [activeFilePath, refreshTrigger])

  // DTE Data Transfer States
  const [dteContentType, setDteContentType] = useState<'firms' | 'items' | 'all'>('firms')
  const [dteStatus, setDteStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const [dteLoading, setDteLoading] = useState(false)

  const handleExportDte = async (): Promise<void> => {
    setDteLoading(true)
    setDteStatus(null)
    try {
      const res = await window.electron.ipcRenderer.invoke('db:export-dte', dteContentType)
      if (res.success) {
        setDteStatus({
          type: 'success',
          message: `Veriler başarıyla dışa aktarıldı. (${res.recordCount} kayıt)`
        })
      } else {
        if (res.error !== 'İptal edildi') {
          setDteStatus({
            type: 'error',
            message: `Dışa aktarma hatası: ${res.error}`
          })
        }
      }
    } catch (err: any) {
      setDteStatus({
        type: 'error',
        message: err.message || 'Dışa aktarım sırasında beklenmedik hata.'
      })
    } finally {
      setDteLoading(false)
    }
  }

  const handleImportDte = async (): Promise<void> => {
    setDteLoading(true)
    setDteStatus(null)
    try {
      const res = await window.electron.ipcRenderer.invoke('db:import-dte')
      if (res.success) {
        let msg = ''
        if (res.importedFirmsCount > 0) msg += `${res.importedFirmsCount} adet firma `
        if (res.importedItemsCount > 0)
          msg += `${msg ? 've ' : ''}${res.importedItemsCount} adet malzeme/hizmet kalemi `

        if (res.totalImportedCount > 0 && !msg) {
          msg = `Toplam ${res.totalImportedCount} adet kayıt `
        }

        if (!msg && res.totalImportedCount === 0) {
          msg = 'Aktarılacak yeni kayıt bulunamadı veya atlandı.'
        } else {
          msg += 'başarıyla içe aktarıldı.'
        }

        if (res.warnings && res.warnings.length > 0) {
          msg += ` (Uyarı: ${res.warnings.join(', ')})`
        }

        setDteStatus({
          type: 'success',
          message: msg
        })

        // Invalidate react-query cache
        queryClient.invalidateQueries()
        // Refresh local stats
        setRefreshTrigger((prev) => prev + 1)
      } else {
        if (res.error !== 'İptal edildi') {
          setDteStatus({
            type: 'error',
            message: `İçe aktarma hatası: ${res.error}`
          })
        }
      }
    } catch (err: any) {
      setDteStatus({
        type: 'error',
        message: err.message || 'İçe aktarım sırasında beklenmedik hata.'
      })
    } finally {
      setDteLoading(false)
    }
  }

  // Database stats state
  const [dbStats, setDbStats] = useState<TableStat[]>([])
  const [loadingStats, setLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Auto-Updater States
  const [updaterStatus, setUpdaterStatus] = useState<string>('idle') // idle, checking, available, not-available, downloaded, error
  const [updateVersion, setUpdateVersion] = useState<string>('')
  const [updaterError, setUpdaterError] = useState<string>('')

  useEffect(() => {
    if (!window.electron) return

    const removeListener = window.electron.ipcRenderer.on(
      'updater:status',
      (_, data: { status: string; version?: string; error?: string }) => {
        setUpdaterStatus(data.status)
        if (data.version) setUpdateVersion(data.version)
        if (data.error) setUpdaterError(data.error)
      }
    )

    return () => {
      if (removeListener) removeListener()
    }
  }, [])

  const handleCheckUpdates = async (): Promise<void> => {
    setUpdaterStatus('checking')
    setUpdaterError('')
    try {
      const res = await window.electron.ipcRenderer.invoke('updater:check')
      if (!res.success) {
        setUpdaterStatus('error')
        setUpdaterError(res.error || 'Güncelleme kontrolü başarısız.')
      }
    } catch (err: any) {
      setUpdaterStatus('error')
      setUpdaterError(err.message || 'Hata oluştu.')
    }
  }

  const handleQuitAndInstall = async (): Promise<void> => {
    try {
      await window.electron.ipcRenderer.invoke('updater:quit-and-install')
    } catch (err: any) {
      alert('Güncelleme yüklenirken hata oluştu: ' + err.message)
    }
  }

  // Fetch SQLite stats when workspace changes or database.sqlite is selected
  useEffect(() => {
    if (!window.electron || !activeFilePath) return

    const fetchStats = async (): Promise<void> => {
      setLoadingStats(true)
      setStatsError(null)
      try {
        const tables = [
          {
            name: 'DATA_TeminDosyasi',
            label: 'Doğrudan Temin Dosyaları',
            desc: 'Süreçteki doğrudan temin dosyaları ve ihale teklifleri'
          },
          {
            name: 'TANIM_Birim',
            label: 'Kurum Birimleri',
            desc: 'Bütçe harcaması yapan belediye müdürlükleri/birimleri'
          },
          {
            name: 'TANIM_Personel',
            label: 'Personel Havuzu',
            desc: 'Evraklarda imza yetkilisi olan kurum çalışanları'
          },
          {
            name: 'TANIM_Mevzuat',
            label: 'Mevzuat ve Limitler',
            desc: 'Yıllara göre doğrudan temin bütçe ve KDV limitleri'
          },
          {
            name: 'TANIM_Firma',
            label: 'Kayıtlı Firmalar',
            desc: 'Sistemde kayıtlı tedarikçiler ve firmalar havuzu'
          },
          {
            name: 'TANIM_Kalem',
            label: 'Malzeme/Hizmet Kütüphanesi',
            desc: 'Yaklaşık maliyet kalem kütüphanesi'
          },
          {
            name: 'settings',
            label: 'Sistem Ayarları',
            desc: 'Uygulamanın yerel yapılandırma anahtar-değer çiftleri'
          }
        ]

        const statsPromises = tables.map(async (table) => {
          const res = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT COUNT(*) as row_count FROM ${table.name}`
          )
          if (res.success && res.data && res.data.length > 0) {
            return {
              tableName: table.name,
              label: table.label,
              count: res.data[0].row_count,
              description: table.desc
            }
          }
          return {
            tableName: table.name,
            label: table.label,
            count: 0,
            description: table.desc
          }
        })

        const results = await Promise.all(statsPromises)
        setDbStats(results)
      } catch (err: any) {
        console.error('Veritabanı istatistikleri alınamadı:', err)
        setStatsError(err.message || 'İstatistikler okunamadı.')
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
  }, [activeFilePath, refreshTrigger])

  const handleCopyPath = (): void => {
    if (!activeFilePath) return
    navigator.clipboard.writeText(activeFilePath)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Prettified JSON representation of activeMeta
  const rawJson = activeMeta
    ? JSON.stringify(
        {
          dtal_version: activeMeta.dtal_version,
          app_version: activeMeta.app_version,
          created_at: activeMeta.created_at,
          institution: activeMeta.institution,
          schema_version: activeMeta.schema_version
        },
        null,
        2
      )
    : ''

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      {/* Üst Başlık Bölümü */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 hover:shadow-sm active:scale-95 transition-all"
            title="Gösterge Paneline Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
              <FileArchive className="w-7 h-7 text-amber-500" />
              Aktif Çalışma Dosyası (.dtal)
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
              Uygulamanın veri alışverişi yaptığı sıkıştırılmış veritabanı arşiv paketinin
              detayları.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Uyarılar (Varsa) */}
        {activeMeta?.warnings && activeMeta.warnings.length > 0 && (
          <div className="lg:col-span-12 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 flex flex-col gap-3 shadow-sm mb-2 animate-in slide-in-from-top-2">
            {activeMeta.warnings.map((warn, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-rose-700 dark:text-rose-400 text-xs font-bold"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{warn}</p>
              </div>
            ))}
          </div>
        )}

        {/* SÜREÇ YÖNETİMİ (İŞ AKIŞI) */}
        <div className="lg:col-span-12 mb-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Süreç Yönetim Panosu
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  Aktif çalışma dosyasındaki mevcut ihale/temin dosyalarının süreç bazlı dağılımı.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/dosyalar/yeni"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  Yeni İhale Başlat
                </Link>
                <Link
                  to="/dosyalar"
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold py-2 px-4 text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <ListTodo className="w-4 h-4" />
                  Tüm İşleri Gör
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Aşama 1 */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex flex-col justify-between group hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-500">
                    {processStats.asama1}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-amber-900 dark:text-amber-400">
                    1. İhtiyaç & Başlangıç
                  </h3>
                  <p className="text-[10px] text-amber-700/70 dark:text-amber-500/70 mt-1 line-clamp-2">
                    Teknik şartname ve yaklaşık maliyet öncesi.
                  </p>
                </div>
              </div>
              {/* Aşama 2 */}
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 flex flex-col justify-between group hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-2xl font-black text-blue-700 dark:text-blue-500">
                    {processStats.asama2}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-blue-900 dark:text-blue-400">
                    2. Fiyat Araştırması
                  </h3>
                  <p className="text-[10px] text-blue-700/70 dark:text-blue-500/70 mt-1 line-clamp-2">
                    Piyasa tekliflerinin toplanması ve komisyon süreci.
                  </p>
                </div>
              </div>
              {/* Aşama 3 */}
              <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 rounded-2xl p-4 flex flex-col justify-between group hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <span className="text-2xl font-black text-purple-700 dark:text-purple-500">
                    {processStats.asama3}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-purple-900 dark:text-purple-400">
                    3. Sipariş & Sözleşme
                  </h3>
                  <p className="text-[10px] text-purple-700/70 dark:text-purple-500/70 mt-1 line-clamp-2">
                    Onay belgesi ve firmaya işin tebliğ edilmesi.
                  </p>
                </div>
              </div>
              {/* Aşama 4 */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-4 flex flex-col justify-between group hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-500">
                    {processStats.asama4}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-emerald-900 dark:text-emerald-400">
                    4. Kabul & Ödeme
                  </h3>
                  <p className="text-[10px] text-emerald-700/70 dark:text-emerald-500/70 mt-1 line-clamp-2">
                    Muayene kabul ve ödeme emri belgelerinin kesimi.
                  </p>
                </div>
              </div>
              {/* Tamamlandı */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between group hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <span className="text-2xl font-black text-slate-700 dark:text-slate-400">
                    {processStats.tamamlandi}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    Arşivlenen İşler
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Süreci tamamlanıp arşive kaldırılan teminler.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AYIRICI VE TEKNİK DETAY AÇ/KAPA */}
        <div className="lg:col-span-12">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-400 transition-colors">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Sistem ve Teknik Detaylar
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Arşiv yapısı, veritabanı yedeği (DTE) ve sistem güncellemeleri
                </p>
              </div>
            </div>
            {showTechnicalDetails ? (
              <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            )}
          </button>
        </div>

        {showTechnicalDetails && (
          <>
            {/* SOL KOLON: PAKET YAPISI VE İÇERİK GÖRSELLEŞTİRME */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Paket Yapısı Kartı */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Paket Arşiv Yapısı (ZIP)
                </h2>

                <div className="space-y-3 font-mono text-xs select-none">
                  {/* Root zip file node */}
                  <div className="flex items-center gap-2 font-bold text-slate-850 dark:text-slate-100 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850">
                    <span className="text-base">📦</span>
                    <span className="truncate max-w-[280px]" title={fileName}>
                      {fileName}
                    </span>
                  </div>

                  {/* Files inside zip */}
                  <div className="pl-4 border-l-2 border-dashed border-slate-200 dark:border-slate-800 ml-4 space-y-2 py-1">
                    {/* meta.json */}
                    <button
                      onClick={() => setSelectedFile('meta.json')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        selectedFile === 'meta.json'
                          ? 'bg-blue-50/70 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400 font-bold shadow-sm'
                          : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">├──</span>
                        <FileJson
                          className={`w-4 h-4 ${selectedFile === 'meta.json' ? 'text-blue-600' : 'text-slate-500'}`}
                        />
                        <span>meta.json</span>
                      </div>
                      <span className="text-[9px] bg-blue-100/60 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded font-bold font-sans">
                        JSON Meta
                      </span>
                    </button>

                    {/* database.sqlite */}
                    <button
                      onClick={() => setSelectedFile('database.sqlite')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        selectedFile === 'database.sqlite'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-450 font-bold shadow-sm'
                          : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">├──</span>
                        <Database
                          className={`w-4 h-4 ${selectedFile === 'database.sqlite' ? 'text-emerald-600' : 'text-slate-500'}`}
                        />
                        <span>database.sqlite</span>
                      </div>
                      <span className="text-[9px] bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-600 px-1.5 py-0.5 rounded font-bold font-sans">
                        SQLite DB
                      </span>
                    </button>

                    {/* attachments/ */}
                    <button
                      onClick={() => setSelectedFile('attachments/')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        selectedFile === 'attachments/'
                          ? 'bg-amber-50/70 border-amber-200 text-amber-700 dark:bg-amber-955/20 dark:border-amber-900/45 dark:text-amber-450 font-bold shadow-sm'
                          : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">└──</span>
                        <FolderOpen
                          className={`w-4 h-4 ${selectedFile === 'attachments/' ? 'text-amber-500' : 'text-slate-500'}`}
                        />
                        <span>attachments/</span>
                      </div>
                      <span className="text-[9px] bg-amber-100/60 dark:bg-amber-900/30 text-amber-600 px-1.5 py-0.5 rounded font-bold font-sans">
                        Klasör
                      </span>
                    </button>
                  </div>
                </div>

                <div className="mt-5 p-3.5 bg-blue-50/45 dark:bg-blue-955/10 border border-blue-100/30 dark:border-blue-900/20 rounded-2xl flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-450 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                    Sol taraftaki dosya yapısından bir dosyaya tıklayarak içeriğini ve o dosyanın
                    format ayrıntılarını sağ taraftaki panele yükleyebilirsiniz.
                  </p>
                </div>
              </div>

              {/* Veri Alışverişi (.dte) Kartı */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-500" />
                  Veri İçe/Dışa Aktar (.dte)
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-normal font-medium">
                  Firma listesi ve malzeme/hizmet kütüphanesi kayıtlarını başka çalışma dosyalarıyla
                  paylaşmak için <strong>.dte</strong> formatını kullanın.
                </p>

                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 p-3.5 rounded-2xl">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Dışa Aktarılacak Veri Türü
                    </label>
                    <select
                      value={dteContentType}
                      onChange={(e) => setDteContentType(e.target.value as any)}
                      title="Dışa Aktarılacak Veri Türü Seçin"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-1.5 px-3 text-slate-855 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="firms">Yalnızca Firmalar / Tedarikçiler</option>
                      <option value="items">Yalnızca Malzeme &amp; Hizmet Kalemleri</option>
                      <option value="birimler">Kurum Birimleri</option>
                      <option value="personel">Personel Havuzu</option>
                      <option value="mevzuat">Mevzuat ve Limitler</option>
                      <option value="all">Tüm Tanımlı Veriler (Temel Tanımlar)</option>
                      <option value="full_backup">
                        Tam Veritabanı Yedeği (İhale/Loglar Dahil)
                      </option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleExportDte}
                      disabled={dteLoading}
                      className="flex-1 bg-white hover:bg-slate-50 disabled:bg-slate-100 border border-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-850 dark:border-slate-800 dark:text-slate-200 font-bold py-2 px-3 text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      Dışa Aktar
                    </button>

                    <button
                      type="button"
                      onClick={handleImportDte}
                      disabled={dteLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-2 px-3 text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-white/90" />
                      İçe Aktar (.dte)
                    </button>
                  </div>
                </div>

                {dteStatus && (
                  <div
                    className={`p-3 rounded-xl border text-[11px] leading-relaxed animate-in slide-in-from-top-2 duration-200 ${
                      dteStatus.type === 'success'
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-850 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450'
                        : 'bg-rose-50/50 border-rose-200 text-rose-855 dark:bg-rose-955/20 dark:border-rose-900/30 dark:text-rose-450'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Info
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${dteStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}
                      />
                      <span>{dteStatus.message}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Hızlı Bilgi Bilgisi */}

              <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Dosya Değişiklik Davranışı
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium">
                  Uygulama çalışırken SQLite veritabanında yaptığınız tüm işlemler anlık kaydedilir.
                  Uygulamadan çıkış yaparken veya dosya kapatılırken tüm veriler ve ekler otomatik
                  olarak tekrar sıkıştırılıp tek bir <strong>.dtal</strong> arşiv dosyası olarak
                  paketlenir.
                </p>
              </div>
            </div>

            {/* SAĞ KOLON: SEÇİLEN DOSYANIN INTERAKTIF DETAYI */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[460px] flex flex-col justify-between">
              <div className="space-y-5 flex-1 flex flex-col">
                {/* Header of selected file detail */}
                <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {selectedFile === 'meta.json' && <FileJson className="w-5 h-5 text-blue-600" />}
                    {selectedFile === 'database.sqlite' && (
                      <Database className="w-5 h-5 text-emerald-600" />
                    )}
                    {selectedFile === 'attachments/' && (
                      <FolderOpen className="w-5 h-5 text-amber-500" />
                    )}
                    <div>
                      <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 font-mono">
                        {selectedFile}
                      </h3>
                      <p className="text-xs text-slate-450 dark:text-slate-500">
                        {selectedFile === 'meta.json' &&
                          'Dosya sürüm ve yapılandırma bilgileri (Üst Veri)'}
                        {selectedFile === 'database.sqlite' &&
                          'İhale/temin verilerini barındıran yerel SQLite veritabanı'}
                        {selectedFile === 'attachments/' &&
                          'Teklif mektupları, teknik şartnameler ve diğer resmi ekler dizini'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content of selected file detail */}
                <div className="flex-1 flex flex-col justify-center">
                  {selectedFile === 'meta.json' && (
                    <div className="space-y-4 animate-in fade-in duration-200 flex-1 flex flex-col justify-between">
                      {/* JSON Code block */}
                      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 font-mono text-[11px] bg-slate-950 text-slate-300 p-4 shadow-inner relative mt-2 flex-1">
                        <div className="absolute top-2.5 right-2.5 text-[10px] text-slate-600 dark:text-slate-500 font-sans font-semibold uppercase select-none">
                          read-only view
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                          {rawJson}
                        </pre>
                      </div>

                      {/* Meta Table info summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
                        <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl">
                          <Building className="w-5 h-5 text-blue-500 shrink-0" />
                          <div className="overflow-hidden">
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                              Kurum
                            </span>
                            <span
                              className="text-xs font-bold text-slate-700 dark:text-slate-350 truncate block"
                              title={activeMeta?.institution}
                            >
                              {activeMeta?.institution || 'Belirtilmemiş'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl">
                          <Cpu className="w-5 h-5 text-indigo-500 shrink-0" />
                          <div>
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                              Uygulama Sürümü
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
                              v{activeMeta?.app_version || '1.0.0'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl">
                          <Layers className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div>
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                              DB Şema Sürümü
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
                              v{activeMeta?.schema_version || '1'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl">
                          <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
                          <div>
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                              Oluşturulma
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
                              {activeMeta?.created_at || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedFile === 'database.sqlite' && (
                    <div className="space-y-4 animate-in fade-in duration-200 flex-1 flex flex-col justify-between mt-2">
                      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-955/5 shadow-inner">
                        <div className="grid grid-cols-12 border-b border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 font-bold text-xs text-slate-650 dark:text-slate-400">
                          <div className="col-span-5">Tablo Adı</div>
                          <div className="col-span-3 text-center">Kayıt Sayısı</div>
                          <div className="col-span-4">Açıklama</div>
                        </div>

                        {loadingStats ? (
                          <div className="p-8 text-center text-xs text-slate-400 italic">
                            İstatistikler okunuyor...
                          </div>
                        ) : statsError ? (
                          <div className="p-6 text-center text-xs text-rose-500 font-semibold flex items-center justify-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {statsError}
                          </div>
                        ) : dbStats.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-400 italic">
                            Tablo bilgisi bulunamadı.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-56 overflow-y-auto custom-scrollbar">
                            {dbStats.map((stat) => (
                              <div
                                key={stat.tableName}
                                className="grid grid-cols-12 p-3 text-xs items-center hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                              >
                                <div
                                  className="col-span-5 font-mono font-bold text-slate-700 dark:text-slate-300 truncate"
                                  title={stat.tableName}
                                >
                                  {stat.tableName}
                                </div>
                                <div className="col-span-3 text-center">
                                  <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-100/40 dark:border-emerald-900/20 font-mono text-[10px]">
                                    {stat.count.toLocaleString('tr-TR')} satır
                                  </span>
                                </div>
                                <div
                                  className="col-span-4 text-[10px] text-slate-500 dark:text-slate-450 truncate"
                                  title={stat.description}
                                >
                                  {stat.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-250/30 dark:border-emerald-900/30 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-350">
                        <Database className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-slate-800 dark:text-slate-200 mb-0.5">
                            SQLite Veritabanı Sağlığı
                          </span>
                          Veritabanı yapısı en güncel şema sürümü olan{' '}
                          <strong>v{activeMeta?.schema_version || '1'}</strong> sürümündedir. Veri
                          bütünlüğü ve ACID işlemleri kararlı durumdadır.
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedFile === 'attachments/' && (
                    <div className="space-y-4 animate-in fade-in duration-200 mt-2">
                      <div className="border border-dashed border-slate-250 dark:border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center bg-slate-50/40 dark:bg-slate-950/10">
                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-955/20 rounded-2xl flex items-center justify-center text-amber-500 mb-3 shadow-inner">
                          <FolderOpen className="w-7 h-7" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Ek Dokümanlar Dizini
                        </h4>
                        <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-2 max-w-sm leading-relaxed">
                          Doğrudan temin dosyalarınıza yüklediğiniz piyasa teklif mektupları,
                          yaklaşık maliyet cetvelleri, teknik şartnameler veya onay belgeleri bu
                          dizinde saklanır.
                        </p>
                      </div>

                      <div className="p-4 bg-amber-50/40 dark:bg-amber-955/10 border border-amber-250/35 dark:border-amber-900/30 rounded-2xl flex gap-2.5 text-xs text-slate-650 dark:text-slate-400">
                        <Info className="w-4 h-4 text-amber-550 shrink-0 mt-0.5" />
                        <span>
                          Ekler, dosya açıldığında geçici olarak işletim sisteminin geçici dizinine
                          (Temp) çıkarılır ve üzerinde işlem yapılır. Dosya kapatıldığında ise tüm
                          ekler verilerinizle birlikte sıkıştırılarak <strong>.dtal</strong>{' '}
                          dosyasına gömülür.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dosya Konumu ve Kopyalama Bölümü */}
              {activeFilePath && (
                <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-6 space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">
                    Disk Üzerindeki Dosya Konumu
                  </label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner">
                    <span
                      className="text-[10px] font-mono text-slate-500 dark:text-slate-400 break-all select-all flex-1 px-1"
                      title={activeFilePath}
                    >
                      {activeFilePath}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPath}
                      className={`p-2 rounded-xl transition-all border shrink-0 flex items-center justify-center ${
                        copied
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-800/40'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850'
                      }`}
                      title="Yolu Panoya Kopyala"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sürüm Geçmişi (Changelog) */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-6 my-2">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5 uppercase tracking-wider mb-6">
          <Layers className="w-4 h-4 text-purple-500" />
          Veritabanı Sürüm Geçmişi
        </h3>

        <div className="space-y-6 relative pl-2">
          {changelog.map((log, index) => {
            // Aktif dosyanın sürüm tespiti (schema_version tabanlı kesin tespit)
            const isActive = log.schema_max === activeMeta?.schema_version

            return (
              <div key={log.version} className="relative pl-6">
                <div
                  className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ring-4 ${isActive ? 'bg-purple-500 ring-purple-50 dark:ring-purple-900/20' : 'bg-slate-300 ring-slate-50 dark:bg-slate-600 dark:ring-slate-800/50'}`}
                ></div>
                {index !== changelog.length - 1 && (
                  <div className="absolute left-[3px] top-4 bottom-[-24px] w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                )}

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                  Versiyon {log.version}
                  {isActive && (
                    <span className="text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                      Aktif Dosya Sürümü
                    </span>
                  )}
                  {index === 0 && !isActive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 font-bold">
                      EN YENİ
                    </span>
                  )}
                </h4>

                <div
                  className={`text-xs leading-relaxed whitespace-pre-wrap p-4 rounded-2xl border ${isActive ? 'bg-purple-50/50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/60 text-purple-900 dark:text-purple-100 shadow-sm' : 'bg-slate-50/30 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800/60 text-slate-600 dark:text-slate-400'}`}
                >
                  {log.notes}
                </div>
              </div>
            )
          })}
          {changelog.length === 0 && (
            <div className="text-sm text-slate-500 italic">Sürüm geçmişi bulunamadı.</div>
          )}
        </div>
      </div>

      {/* Güncelleme Bölümü */}
      <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-blue-600" />
          Uygulama Güncelleme Yönetimi (Auto-Updater)
        </h3>

        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
              Mevcut Sürüm:
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                {activeMeta?.app_version ? `v${activeMeta.app_version}` : 'Bilinmiyor'}
              </span>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal max-w-2xl font-medium">
              Kurumsal bilgisayarlardaki internet kotaları düşünülerek, güncellemeler GitHub
              üzerinden <strong>.blockmap</strong> teknolojisiyle sadece değişen paketleri (delta)
              indirerek kota tasarrufu sağlar.
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {updaterStatus === 'downloaded' ? (
              <button
                onClick={handleQuitAndInstall}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 text-xs rounded-xl shadow-md shadow-emerald-500/10 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                Kapat ve Yükle (Hazır)
              </button>
            ) : (
              <button
                onClick={handleCheckUpdates}
                disabled={updaterStatus === 'checking'}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-2 px-4 text-xs rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${updaterStatus === 'checking' ? 'animate-spin' : ''}`}
                />
                {updaterStatus === 'checking' ? 'Denetleniyor...' : 'Güncellemeleri Denetle'}
              </button>
            )}
          </div>
        </div>

        {/* Güncelleme Durum Bildirimleri */}
        {updaterStatus !== 'idle' && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-2.5 text-xs animate-in slide-in-from-top-2 duration-200 ${
              updaterStatus === 'checking'
                ? 'bg-slate-50/50 border-slate-200 text-slate-700 dark:bg-slate-900/30 dark:border-slate-800/80 dark:text-slate-350'
                : updaterStatus === 'available'
                  ? 'bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-450'
                  : updaterStatus === 'downloaded'
                    ? 'bg-emerald-50/50 border-emerald-250 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450 font-semibold'
                    : updaterStatus === 'not-available'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-700 dark:bg-slate-900/30 dark:border-slate-800/80 dark:text-slate-350'
                      : 'bg-rose-50/50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450'
            }`}
          >
            <Info className="w-4.5 h-4.5 text-blue-600 dark:text-blue-450 shrink-0 mt-0.5" />
            <div>
              {updaterStatus === 'checking' && (
                <span>Uzak sunucudan yeni yayınlar ve `.blockmap` verileri sorgulanıyor...</span>
              )}
              {updaterStatus === 'available' && (
                <span>
                  Yeni bir sürüm bulundu ({updateVersion || 'Bilinmiyor'}). Arka planda indirme
                  işlemi başlatıldı.
                </span>
              )}
              {updaterStatus === 'not-available' && (
                <span>
                  Harika! En güncel sürümü kullanıyorsunuz, herhangi bir güncelleme bulunmuyor.
                </span>
              )}
              {updaterStatus === 'downloaded' && (
                <span>
                  Güncelleme başarıyla indirildi. Kurulumu tamamlamak için lütfen &quot;Kapat ve
                  Yükle&quot; butonuna basın.
                </span>
              )}
              {updaterStatus === 'error' && (
                <span>
                  Güncelleme kontrolü sırasında bir hata oluştu: <strong>{updaterError}</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

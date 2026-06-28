import React, { useState, useEffect } from 'react'
import {
  Wifi,
  Search,
  Download,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  Server
} from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'

interface NetworkSyncModalProps {
  onClose: () => void
}

interface ServerInfo {
  success: boolean
  meta: {
    institution: string
    schema_version: number
    updated_at: string
  }
  fileSize: number
  error?: string
}

export function NetworkSyncModal({ onClose }: NetworkSyncModalProps): React.JSX.Element {
  const { activeMeta } = useWorkspaceStore()
  const [ipAddress, setIpAddress] = useState('')
  const [port, setPort] = useState('4000')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)

  const [, setLocalServerActive] = useState(false)
  const [localIp, setLocalIp] = useState('')
  const [canUndo, setCanUndo] = useState(false)
  const [backupTime, setBackupTime] = useState<string | null>(null)

  const electron = window.electron?.ipcRenderer

  const checkCanUndo = async () => {
    if (electron?.invoke) {
      try {
        const res = await electron.invoke('network:can-undo-sync')
        if (res.canUndo) {
          setCanUndo(true)
          setBackupTime(res.mtime)
        } else {
          setCanUndo(false)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  useEffect(() => {
    checkCanUndo()
  }, [])

  useEffect(() => {
    if (electron?.invoke) {
      electron
        .invoke('network:start-express', 4000)
        .then((res: { success: boolean; ip: string; port: number; error?: string }) => {
          if (res && res.success) {
            setLocalServerActive(true)
            setLocalIp(res.ip)
            setPort(res.port.toString())
          }
        })
        .catch(console.error)
    }

    const onPulled = () => {
      setStatus('success')
      setMessage('Dosya başarıyla çekildi. Arayüz güncelleniyor...')
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }

    const onPushed = () => {
      // Local DB was overwritten by another peer!
      alert('UYARI: Ağdaki başka bir cihaz tarafından dosyanız güncellendi. Sayfa yenilenecek.')
      window.location.reload()
    }

    window.electron?.ipcRenderer?.on('network:db-pulled', onPulled)
    window.electron?.ipcRenderer?.on('network:db-pushed', onPushed)

    return () => {
      window.electron?.ipcRenderer?.removeListener('network:db-pulled', onPulled)
      window.electron?.ipcRenderer?.removeListener('network:db-pushed', onPushed)
    }
  }, [])

  const handleUndo = async () => {
    if (
      !confirm(
        'DİKKAT: En son senkronizasyon öncesindeki veritabanı yedeğiniz (.syncbak) geri yüklenecektir. Bu işlem mevcut verilerinizi ezecektir. Devam etmek istiyor musunuz?'
      )
    )
      return

    setStatus('loading')
    setMessage('Yedek geri yükleniyor...')
    try {
      const res = await electron.invoke('network:undo-sync')
      if (res.success) {
        setStatus('success')
        setMessage('Yedek başarıyla geri yüklendi, sistem yenileniyor...')
        setTimeout(() => window.location.reload(), 2000)
      } else {
        throw new Error(res.error)
      }
    } catch (err: unknown) {
      setStatus('error')
      setMessage((err as Error).message)
    }
  }

  const getCleanUrl = (rawIp: string) => {
    let cleanIp = rawIp.trim()
    // Başındaki http:// veya https:// protokollerini kaldır (büyük/küçük harf duyarsız)
    cleanIp = cleanIp.replace(/^(https?:\/\/)/i, '')

    // Eğer sonda port varsa (:3000, :4000 gibi) ayıkla, yoksa varsayılan portu kullan
    let targetPort = port
    const portMatch = cleanIp.match(/:(\d+)$/)
    if (portMatch) {
      targetPort = portMatch[1]
      cleanIp = cleanIp.substring(0, cleanIp.lastIndexOf(':'))
    }
    return `http://${cleanIp}:${targetPort}`
  }

  const handleConnect = async () => {
    if (!ipAddress) return
    setStatus('loading')
    setMessage('Bağlanılıyor...')
    try {
      const url = getCleanUrl(ipAddress)
      const response = await fetch(`${url}/api/network/info`)
      if (!response.ok) throw new Error('Sunucuya ulaşılamadı.')

      const data = await response.json()
      if (data.success) {
        setServerInfo(data)
        setStatus('success')
        setMessage('Bağlantı başarılı.')
      } else {
        throw new Error(data.error || 'Bilinmeyen hata')
      }
    } catch (err: unknown) {
      setStatus('error')
      setMessage((err as Error).message || 'Bağlantı hatası.')
      setServerInfo(null)
    }
  }

  const handlePull = async () => {
    if (
      !confirm(
        'DİKKAT: Karşı taraftan dosya çekmek (Pull), sizin mevcut verilerinizi tamamen EZECEKTİR! Devam etmek istediğinize emin misiniz?'
      )
    )
      return

    setStatus('loading')
    setMessage('Dosya çekiliyor...')
    try {
      const url = getCleanUrl(ipAddress)
      const res = await electron.invoke('network:pull-db', url)
      if (res.success) {
        setStatus('success')
        setMessage('Dosya çekildi, sistem yenileniyor...')
        setTimeout(() => window.location.reload(), 2000)
      } else {
        throw new Error(res.error)
      }
    } catch (err: unknown) {
      setStatus('error')
      setMessage((err as Error).message)
    }
  }

  const handlePush = async () => {
    if (
      !confirm(
        'DİKKAT: Dosyanızı karşı tarafa göndermek (Push), karşı tarafın mevcut verilerini tamamen EZECEKTİR! Devam etmek istediğinize emin misiniz?'
      )
    )
      return

    setStatus('loading')
    setMessage('Dosya gönderiliyor...')
    try {
      const url = getCleanUrl(ipAddress)
      const res = await electron.invoke('network:push-db', url)
      if (res.success) {
        setStatus('success')
        setMessage('Dosya karşı tarafa başarıyla gönderildi ve kaydedildi.')
      } else {
        throw new Error(res.error)
      }
    } catch (err: unknown) {
      setStatus('error')
      setMessage((err as Error).message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Ağ Senkronizasyonu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aynı ağdaki başka bir cihazla veri paylaşın
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Local Server Info */}
          <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                  Paylaşım Aktif
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500">
                  IP Adresiniz:{' '}
                  <span className="font-mono bg-white dark:bg-slate-950 px-1 py-0.5 rounded shadow-sm">
                    {localIp}:{port}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Connect Form */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Karşı Cihazın IP Adresi
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Örn: 192.168.1.55"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              />
              <button
                onClick={handleConnect}
                disabled={!ipAddress || status === 'loading'}
                className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {status === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Bağlan
              </button>
            </div>
          </div>

          {/* Status Message */}
          {message && status !== 'idle' && (
            <div
              className={`p-3 rounded-lg text-sm flex items-center gap-2 ${status === 'error' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'}`}
            >
              {status === 'error' ? (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              ) : (
                <InfoIcon className="w-4 h-4 shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          {/* Connected Server Info & Actions */}
          {serverInfo && (
            <div className="flex flex-col gap-4 p-4 border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5 rounded-xl">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-500" />
                Veri Karşılaştırması
              </h3>

              <div className="grid grid-cols-2 gap-4 mt-2">
                {/* Local Info */}
                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col gap-1">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                    Yerel Cihaz (Siz)
                  </span>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {activeMeta?.institution || 'Açık Dosya Yok'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Son Güncelleme:
                    <br />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {activeMeta?.updated_at
                        ? new Date(activeMeta.updated_at).toLocaleString('tr-TR')
                        : 'Bilinmiyor'}
                    </span>
                  </div>
                </div>

                {/* Remote Info */}
                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col gap-1">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    Karşı Cihaz
                  </span>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {serverInfo.meta.institution}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Son Güncelleme:
                    <br />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {serverInfo.meta.updated_at
                        ? new Date(serverInfo.meta.updated_at).toLocaleString('tr-TR')
                        : 'Bilinmiyor'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Comparison Info */}
              {(() => {
                const localTime = activeMeta?.updated_at
                  ? new Date(activeMeta.updated_at).getTime()
                  : 0
                const remoteTime = serverInfo.meta.updated_at
                  ? new Date(serverInfo.meta.updated_at).getTime()
                  : 0

                if (localTime > remoteTime) {
                  return (
                    <div className="text-xs p-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 rounded-lg font-medium">
                      ⚠️ Sizin yerel verileriniz karşı cihazdaki verilerden daha güncel. Gönder
                      (Push) yapabilirsiniz.
                    </div>
                  )
                } else if (remoteTime > localTime) {
                  return (
                    <div className="text-xs p-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-lg font-medium">
                      💡 Karşı cihazdaki veriler sizinkinden daha güncel! Çek (Pull) yapmanız
                      önerilir.
                    </div>
                  )
                } else {
                  return (
                    <div className="text-xs p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-medium">
                      ✓ Her iki cihazın verileri de aynı güncellikte.
                    </div>
                  )
                }
              })()}

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={handlePull}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-500/30 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all cursor-pointer group"
                >
                  <Download className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Çek (Pull)
                  </span>
                  <span className="text-[10px] text-slate-500 text-center">
                    Karşıdaki veriyi alıp
                    <br />
                    sizin verinizi ezer
                  </span>
                </button>

                <button
                  onClick={handlePush}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all cursor-pointer group"
                >
                  <Upload className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Gönder (Push)
                  </span>
                  <span className="text-[10px] text-slate-500 text-center">
                    Sizin verinizi gönderip
                    <br />
                    karşının verisini ezer
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Undo Sync Section */}
          {canUndo && (
            <div className="flex items-center justify-between p-4 bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/20 rounded-xl">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
                  Geri Yükleme Noktası
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Senkronizasyon öncesi yedek:{' '}
                  {backupTime ? new Date(backupTime).toLocaleString('tr-TR') : ''}
                </span>
              </div>
              <button
                onClick={handleUndo}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Senkronizasyonu Geri Al
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return <CheckCircle2 {...props} />
}

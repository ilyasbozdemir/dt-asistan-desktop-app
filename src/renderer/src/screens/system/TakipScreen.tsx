/* eslint-disable */
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  ClipboardList, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  ShieldCheck,
  Building,
  Layers,
  ChevronRight,
  Upload,
  FileCheck,
  Bell
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useDosyalarHooks } from '../dosyalar/dosyalar.hooks'
import { Button } from '../../components/ui/Button'
import { useEffect, useState } from 'react'

export function TakipScreen(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const { dosyalar } = useDosyalarHooks()

  // 1. Fetch active dossier details
  const activeDosya = dosyalar.find((d) => d.id === activeDosyaId)
  const [notificationSent, setNotificationSent] = useState(false)

  // Fetch Documents generated for this dossier
  const { data: dbBelgeler = [], refetch: refetchBelgeler } = useQuery<any[]>({
    queryKey: ['takip_belgeler', activeDosyaId],
    queryFn: async () => {
      if (!activeDosyaId) return []
      const res = await window.electron.ipcRenderer.invoke(
        'db:query', 
        `SELECT * FROM DATA_TeminBelge WHERE temin_dosya_id = ${activeDosyaId}`
      )
      if (!res.success) return []
      return res.data
    },
    enabled: !!activeDosyaId
  })

  // 2. Fetch stages from DB
  const { data: dbAsamalar = [] } = useQuery<any[]>({
    queryKey: ['takip_asamalar'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke('db:query', 'SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC')
      if (!res.success) return []
      return res.data
    }
  })

  // 3. Fetch Alım Türü configs (to know required documents list)
  const { data: dbAlimTurleri = [] } = useQuery<any[]>({
    queryKey: ['takip_alim_turleri'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke('db:query', 'SELECT * FROM TANIM_AlimTuru WHERE aktif_mi = 1')
      if (!res.success) return []
      return res.data.map((d: any) => {
        let parsedBelgeler = []
        try {
          parsedBelgeler = typeof d.belgeler === 'string' ? JSON.parse(d.belgeler) : (d.belgeler || [])
        } catch(e) {
          console.error(e)
        }
        return {
          id: d.id,
          ad: d.tur_adi,
          belgeler: parsedBelgeler
        }
      })
    }
  })

  const activeAlimTuru = activeDosya
    ? dbAlimTurleri.find((t) => {
        const fileTur = activeDosya.tur?.toLowerCase()
        const dbTur = t.ad?.toLowerCase() || ''
        if (fileTur === 'mal' && dbTur.includes('mal')) return true
        if (fileTur === 'hizmet' && dbTur.includes('hizmet')) return true
        if (fileTur === 'yapim_isi' && (dbTur.includes('yapım') || dbTur.includes('yapim'))) return true
        if (fileTur === 'danismanlik' && (dbTur.includes('danışmanlık') || dbTur.includes('danismanlik'))) return true
        return dbTur === fileTur
      })
    : null

  // Fallback stages if db is empty
  const stages = dbAsamalar.length > 0 ? dbAsamalar : [
    { asama_sira: 1, asama_adi: 'İhtiyaç Tespiti & Başlangıç', aciklama: 'İhtiyacın belirlendiği ve sürecin başlatıldığı ilk adım.' },
    { asama_sira: 2, asama_adi: 'Piyasa Fiyat Araştırması', aciklama: 'Tekliflerin toplandığı ve yaklaşık maliyetin belirlendiği aşama.' },
    { asama_sira: 3, asama_adi: 'Sipariş & Sözleşme', aciklama: 'Sözleşme/sipariş onayı ve kazanan firma atama aşaması.' },
    { asama_sira: 4, asama_adi: 'Kabul & Ödeme İşlemleri', aciklama: 'Mal/hizmet teslimatı, muayene kabulü ve fatura ödeme adımı.' }
  ]

  const currentAsamaSira = activeDosya?.durum_asama_id || 1

  // Format Currency Helper
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(value)
  }

  // Determine dynamic completion of documents/actions
  const getDocumentStatus = (docName: string) => {
    if (!activeDosya) return 'bekliyor'
    
    const lowerName = docName.toLowerCase()
    
    // Smart checks on real database values
    if (lowerName.includes('yaklaşık maliyet') || lowerName.includes('fiyat araştırma')) {
      return activeDosya.yaklasik_maliyet > 0 ? 'tamamlandi' : 'aktif'
    }
    if (lowerName.includes('onay')) {
      return activeDosya.durum_asama_id && activeDosya.durum_asama_id >= 3 ? 'tamamlandi' : 'aktif'
    }
    if (lowerName.includes('fatura') || lowerName.includes('ödeme') || lowerName.includes('teslim')) {
      return activeDosya.durum_asama_id && activeDosya.durum_asama_id >= 4 ? 'tamamlandi' : 'bekliyor'
    }
    if (activeDosya.firma_id && (lowerName.includes('sözleşme') || lowerName.includes('firma'))) {
      return 'tamamlandi'
    }

    return 'bekliyor'
  }

  // Handle file upload / mark as signed
  const handleSignDocument = async (belgeId: number) => {
    try {
      // In a real scenario, this could open a file dialog. For now, we simulate marking it as signed.
      const res = await window.electron.ipcRenderer.invoke(
        'db:execute',
        `UPDATE DATA_TeminBelge SET is_signed = 1 WHERE id = ${belgeId}`
      )
      if (res.success) {
        refetchBelgeler()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Smart Desktop Notifications
  useEffect(() => {
    if (activeDosya && !notificationSent) {
      let missingCount = dbBelgeler.filter((b) => !b.is_signed).length
      
      // Calculate deadline warning
      let deadlineMsg = ''
      if (activeDosya.son_teklif_verme_tarihi) {
        const diffMs = new Date(activeDosya.son_teklif_verme_tarihi).getTime() - Date.now()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        if (diffDays <= 2 && diffDays >= 0) {
          deadlineMsg = `Son teklif verme tarihine ${diffDays} gün kaldı! `
        } else if (diffDays < 0) {
          deadlineMsg = `Son teklif verme süresi doldu! `
        }
      }

      if (deadlineMsg || missingCount > 0) {
        const notification = new window.Notification('DT Asistan - Akıllı Hatırlatıcı', {
          body: `${deadlineMsg}${missingCount > 0 ? `İmzası eksik ${missingCount} evrakınız bulunuyor.` : ''}`,
          icon: '/icon.png' // Use default app icon if possible
        })
        notification.onclick = () => {
          window.focus()
        }
        setNotificationSent(true)
      }
    }
  }, [activeDosya, dbBelgeler, notificationSent])

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Süreç Takip & Durum Paneli
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Doğrudan temin dosyalarınızın yasal işlem adımlarını ve belge tamamlama durumlarını buradan izleyebilirsiniz.
          </p>
        </div>
      </div>

      {activeDosya ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: STEPPER & STAGE TIMELINE */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ACTIVE FILE SUMMARY INFO */}
            <div className="p-6 rounded-3xl bg-linear-to-r from-blue-650/10 via-indigo-650/5 to-transparent border border-blue-500/10 dark:border-blue-500/5 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-450 uppercase tracking-widest bg-blue-100/40 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-500/15">
                    {activeDosya.temin_no || 'Dosya No Belirtilmedi'}
                  </span>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{activeDosya.konu}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    Tür: <span className="font-semibold text-slate-700 dark:text-slate-350">{activeDosya.tur} Alımı</span> | Birim: <span className="font-semibold text-slate-700 dark:text-slate-350">{activeDosya.birim_adi || 'Birim Belirtilmedi'}</span>
                  </p>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Yaklaşık Maliyet</span>
                  <span className="text-xl font-mono font-extrabold text-slate-850 dark:text-slate-100">
                    {formatCurrency(activeDosya.yaklasik_maliyet || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* PROCESS PROGRESS BAR */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 mb-6 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                İşlem Aşaması İlerleme Durumu
              </h3>

              {/* Progress Line stepper */}
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-4 mt-4">
                {/* Horizontal connection line */}
                <div className="absolute top-5 left-5 right-5 h-1 bg-slate-100 dark:bg-slate-800 hidden md:block z-0" />
                
                {stages.map((asama) => {
                  const isCompleted = asama.asama_sira < currentAsamaSira
                  const isActive = asama.asama_sira === currentAsamaSira

                  return (
                    <div key={asama.asama_sira} className="flex md:flex-col items-start md:items-center text-left md:text-center flex-1 relative z-10 gap-3 md:gap-2 group">
                      {/* Step node */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                          : isActive 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-110' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <span className="text-xs font-bold">{asama.asama_sira}</span>
                        )}
                      </div>

                      {/* Step Labels */}
                      <div className="flex flex-col md:items-center mt-1">
                        <span className={`text-xs font-extrabold transition-colors duration-300 ${
                          isActive 
                            ? 'text-blue-600 dark:text-blue-450' 
                            : isCompleted 
                              ? 'text-emerald-600 dark:text-emerald-500' 
                              : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {asama.asama_adi}
                        </span>
                        <p className="text-[10px] text-slate-450 mt-1 max-w-[160px] line-clamp-2 md:block hidden">
                          {asama.aciklama}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* DETAIL CARDS FOR STAGES */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aşama Detayları ve Açıklamalar</h3>
              
              {stages.map((asama) => {
                const isActive = asama.asama_sira === currentAsamaSira
                const isCompleted = asama.asama_sira < currentAsamaSira

                return (
                  <div 
                    key={asama.asama_sira} 
                    className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                      isActive 
                        ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50 shadow-xs' 
                        : isCompleted
                          ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 opacity-80'
                          : 'bg-slate-50/40 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900/50 opacity-60'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : isCompleted 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <Layers className="w-4 h-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {asama.asama_sira}. Aşama: {asama.asama_adi}
                        </h4>
                        {isActive && (
                          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-500/10 uppercase tracking-wider">
                            Aktif İşlem Aşaması
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-100/50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase tracking-wider">
                            Tamamlandı
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                        {asama.aciklama || 'Bu aşama için bir açıklama girilmemiş.'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>

          {/* RIGHT: DYNAMIC DOCUMENT CHECKLIST */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Gerekli Belgeler Rehberi</h3>
                  <p className="text-[10px] text-slate-500 capitalize">
                    {activeDosya.tur} Alımı Süreç Belgeleri
                  </p>
                </div>
              </div>

              {activeAlimTuru ? (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-450 mb-2">
                    Bu alım türü için mevzuata göre dosyada bulunması gereken evraklar ve dinamik durumları:
                  </p>
                  
                  {activeAlimTuru.belgeler.map((b: any, idx: number) => {
                    const documentName = typeof b === 'string' ? b : (b?.ad || '')
                    const status = getDocumentStatus(documentName)

                    return (
                      <div key={idx} className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/35 border border-slate-100/50 dark:border-slate-850/50 transition-colors">
                        <div className="flex gap-2.5">
                          <div className="mt-0.5 shrink-0">
                            {status === 'tamamlandi' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                            ) : status === 'aktif' ? (
                              <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-755 dark:text-slate-300 block leading-tight">
                              {documentName}
                            </span>
                            <span className="text-[9px] text-slate-450 mt-0.5 block capitalize">
                              {status === 'tamamlandi' ? 'Veri Kaydı Var / Hazır' : status === 'aktif' ? 'Veri Girişi Bekleniyor' : 'Aşama Bekliyor'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Bu alım türü için ("{activeDosya.tur}") tanımlı bir belge rehberi şablonu bulunamadı. Mevzuat ve Sistem ayarlarından rehber tanımlayabilirsiniz.
                  </span>
                </div>
              )}

              {/* UPLOAD SIGNED DOCUMENTS SECTION */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <FileCheck className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Üretilen Belgeler ve İmza Takibi</h3>
                    <p className="text-[10px] text-slate-500">Sistemden üretilmiş dosyaların ıslak imzalı kopyalarını buradan takip edebilirsiniz.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {dbBelgeler.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 text-center italic bg-slate-50 dark:bg-slate-900 rounded-lg">
                      Henüz bu dosya için belge üretilmemiş.
                    </div>
                  ) : (
                    dbBelgeler.map((belge) => (
                      <div key={belge.id} className={`flex items-center justify-between p-2.5 rounded-lg border ${belge.is_signed ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30' : 'bg-slate-50/50 border-slate-200 dark:bg-slate-900 dark:border-slate-800'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${belge.is_signed ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {belge.belge_adi}
                          </span>
                        </div>
                        {belge.is_signed ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            İmzalandı
                          </span>
                        ) : (
                          <Button 
                            onClick={() => handleSignDocument(belge.id)}
                            className="h-7 px-3 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-none"
                          >
                            İmzalandı İşaretle
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link to="/dosyalar">
                  <Button className="w-full text-xs font-semibold py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-150 border-0 flex items-center justify-center gap-1">
                    Dosya Detayına Git
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* NO ACTIVE DOSSIER SELECTED STATE */
        <div className="p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center max-w-2xl mx-auto my-10 flex flex-col items-center justify-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-450 flex items-center justify-center">
            <ClipboardList className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-105">Takip Edilecek Aktif Dosya Seçilmedi</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
              Süreçlerin aşama aşama takibini ve evrak kontrolünü görmek için lütfen önce sol menüden veya doğrudan temin listesinden bir dosya seçerek aktif hale getirin.
            </p>
          </div>

          <Link to="/dosyalar">
            <Button className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold py-2 px-5 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Temin Dosyası Seç / Aç
            </Button>
          </Link>
        </div>
      )}

    </div>
  )
}

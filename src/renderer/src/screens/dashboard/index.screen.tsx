import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  Calendar,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Building,
  Briefcase,
  Megaphone,
  Database,
  Info
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useSettingsStore } from '../../store/settingsStore'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { Button } from '../../components/ui/Button'
import { useDashboardStats, useActiveDosyaSummary } from './dashboard.hooks'
// Types for Mock Data
interface ActiveProcurement {
  id: string
  dosyaNo: string
  baslik: string
  birim: string
  tur: 'Mal' | 'Hizmet' | 'Yapım'
  butceKodu: string
  yaklasikMaliyet: number
  olusturmaTarihi: string
  asama: 1 | 2 | 3 | 4 | 5 // 1: Hazırlık, 2: P.F.A. (Piyasa Fiyat Araştırması), 3: Teklif Toplama, 4: Karar/Onay, 5: Fatura/Ödeme
}

export default function DashboardScreen(): React.JSX.Element {
  const { institutionName, limitType, institutionType } = useSettingsStore()
  const { activeDosyaId } = useWorkspaceStore()
  const { stats, isLoading } = useDashboardStats()
  
  // Dynamic Greeting based on time
  const [greeting, setGreeting] = useState('İyi Günler')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const hours = new Date().getHours()
    if (hours >= 6 && hours < 12) setGreeting('Günaydın')
    else if (hours >= 12 && hours < 18) setGreeting('İyi Günler')
    else if (hours >= 18 && hours < 23) setGreeting('İyi Akşamlar')
    else setGreeting('İyi Geceler')

    const formatter = new Intl.DateTimeFormat('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    setCurrentDate(formatter.format(new Date()))
  }, [])

  // Kurum Türü Mapping
  const getInstitutionTypeLabel = (type: string) => {
    switch (type) {
      case 'belediye': return 'Belediye / Mahalli İdare'
      case 'genel_butce': return 'Bakanlık / Genel Bütçe'
      case 'ozel_butce': return 'Üniversite / Özel Bütçe'
      case 'duzenleyici': return 'Düzenleyici / Denetleyici Kurum'
      case 'diger': return 'Diğer Kurum'
      default: return 'Kurum Tipi Belirtilmedi'
    }
  }
  const kurumTuruLabel = getInstitutionTypeLabel(institutionType || '')

  const { summary: activeSummary, isLoading: isActiveSummaryLoading } = useActiveDosyaSummary(activeDosyaId, institutionName, kurumTuruLabel)

  // Mock Data for Active Procurements
  const [activeFiles] = useState<ActiveProcurement[]>([
    {
      id: 'dosya-1',
      dosyaNo: 'DT-2026/012',
      baslik: 'Park Bahçeler Müdürlüğü Bank ve Çöp Kovası Alımı',
      birim: 'Park ve Bahçeler Müdürlüğü',
      tur: 'Mal',
      butceKodu: '06.1.1.01',
      yaklasikMaliyet: 485000,
      olusturmaTarihi: '2026-05-18',
      asama: 3
    },
    {
      id: 'dosya-2',
      dosyaNo: 'DT-2026/015',
      baslik: 'Belediye Hizmet Binası Klima Bakım ve Onarım Hizmeti',
      birim: 'Destek Hizmetleri Müdürlüğü',
      tur: 'Hizmet',
      butceKodu: '03.2.1.02',
      yaklasikMaliyet: 185000,
      olusturmaTarihi: '2026-05-22',
      asama: 2
    },
    {
      id: 'dosya-3',
      dosyaNo: 'DT-2026/016',
      baslik: 'Fen İşleri Şantiyesi İstinat Duvarı Yapım İşi',
      birim: 'Fen İşleri Müdürlüğü',
      tur: 'Yapım',
      butceKodu: '06.5.7.08',
      yaklasikMaliyet: 890000,
      olusturmaTarihi: '2026-05-25',
      asama: 1
    },
    {
      id: 'dosya-4',
      dosyaNo: 'DT-2026/009',
      baslik: 'Kültür İşleri Broşür ve Afiş Basım Hizmet Alımı',
      birim: 'Kültür ve Sosyal İşler Müdürlüğü',
      tur: 'Hizmet',
      butceKodu: '03.5.1.01',
      yaklasikMaliyet: 120000,
      olusturmaTarihi: '2026-05-10',
      asama: 4
    },
    {
      id: 'dosya-5',
      dosyaNo: 'DT-2026/006',
      baslik: 'Bilgi İşlem Merkezi Server Yedek Parça Alımı',
      birim: 'Bilgi İşlem Müdürlüğü',
      tur: 'Mal',
      butceKodu: '06.1.2.02',
      yaklasikMaliyet: 320000,
      olusturmaTarihi: '2026-05-02',
      asama: 5
    }
  ])

  // Limit States (Turkish Municipalities 10% Budget Limit Rule)
  // Total direct procurement cannot exceed 10% of the institution's total budget.
  const totalBudgetLimit = 15000000 // 15 Milyon TL
  const totalBudgetSpent = 9642000  // 9.6 Milyon TL
  const spentPercent = (totalBudgetSpent / totalBudgetLimit) * 100

  // Category breakdown for charts
  const categoryData = {
    Mal: 4338900,
    Hizmet: 3374700,
    Yapım: 1928400
  }

  // Monthly trends (fake data)
  const monthlyData = [
    { ay: 'Ocak', tutar: 1100000 },
    { ay: 'Şubat', tutar: 1800000 },
    { ay: 'Mart', tutar: 2200000 },
    { ay: 'Nisan', tutar: 2500000 },
    { ay: 'Mayıs', tutar: 2042000 }
  ]

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(value)
  }

  const fetchAsamalar = async () => {
    const res = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC'
    )
    if (!res.success) throw new Error(res.error)
    return res.data
  }

  const { data: asamalar = [] } = useQuery({
    queryKey: ['asamalar_dashboard'],
    queryFn: fetchAsamalar
  })

  const getAsamaDetails = (asamaSira: number) => {
    const asama = asamalar.find((a: any) => a.asama_sira === asamaSira)
    if (asama) {
      const colorMap: Record<string, string> = {
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450 border-amber-500/10',
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-450 border-blue-500/10',
        purple: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-450 border-indigo-500/10',
        emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border-emerald-500/10'
      }
      return { name: asama.asama_adi, color: colorMap[asama.rozet_rengi] || colorMap['blue'] }
    }
    
    // Fallback if db not loaded
    switch (asamaSira) {
      case 1:
        return { name: 'Hazırlık Aşaması', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-500/10' }
      case 2:
        return { name: 'Piyasa Araştırması', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450 border-amber-500/10' }
      case 3:
        return { name: 'Teklif Toplama', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-450 border-blue-500/10' }
      case 4:
        return { name: 'Karar & Onay', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-450 border-indigo-500/10' }
      case 5:
        return { name: 'Fatura / Ödeme', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border-emerald-500/10' }
      default:
        return { name: 'Belirsiz Aşama', color: 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400' }
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. HERO HEADER */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-blue-600/10 via-indigo-600/5 to-transparent border border-blue-500/10 dark:border-blue-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-450 uppercase tracking-widest bg-blue-100/40 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-500/15">
              {institutionName || 'Kurum Adı Bekleniyor...'}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-100/40 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-500/15">
              {kurumTuruLabel}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">
            {greeting}, Kontrol Paneline Hoş Geldiniz.
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            {currentDate}
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/dosyalar">
            <Button className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold py-2 px-4 shadow-md shadow-blue-500/10 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Yeni Temin Dosyası
            </Button>
          </Link>
          <Link to="/mevzuat">
            <Button variant="outline" className="text-xs font-semibold py-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
              Limitleri Gör
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Files */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-450 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-500/10">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              +3 bu hafta
            </span>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Aktif Temin Dosyaları</div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-baseline gap-1">
              {activeFiles.length} <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Dosya</span>
            </div>
          </div>
        </div>

        {/* Card 2: Combined Estimated Volume */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-500/10">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              +12% aylık
            </span>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Toplam Yaklaşık Maliyet</div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
              {formatCurrency(2340000)}
            </div>
          </div>
        </div>

        {/* Card 3: Budget Consumption Gauge */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-450 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-500/10">
              Dosya Limiti: {limitType === 'buyuksehir' ? '1.021.827 ₺' : '340.391 ₺'}
            </span>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Doğrudan Temin Tüketim Oranı</div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">
                %{spentPercent.toFixed(1)}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {formatCurrency(totalBudgetSpent)} / 15M TL
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${spentPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Average Duration */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-450 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-500/10">
              <ArrowDownRight className="w-3 h-3 mr-0.5 text-emerald-600" />
              -1.4 gün
            </span>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Ortalama Temin Süresi</div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-baseline gap-1">
              8.4 <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Gün</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE FILE SUMMARY WIDGET */}
      {activeDosyaId && (
        <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Çalışılan Aktif İhale Dosyası</h3>
              <p className="text-[10px] text-slate-500">Şu anda üzerinde işlem yaptığınız dosyanın özet bilgileri</p>
            </div>
          </div>

          {isActiveSummaryLoading ? (
            <div className="h-24 flex items-center justify-center text-xs font-semibold text-slate-500 animate-pulse">Yükleniyor...</div>
          ) : activeSummary ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-stretch">
              
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-800/50">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Kurum Adı</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-2">{activeSummary.kurumAdi}</span>
              </div>
              
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-800/50">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Kurum Türü</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{activeSummary.kurumTuru}</span>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-800/50">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Dosya Adı & No</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-blue-600 dark:text-blue-450">{activeSummary.dosyaNo}</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1" title={activeSummary.konu}>{activeSummary.konu}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-800/50">
                <span className="text-[9px] font-bold text-slate-400 uppercase">İhale & Alım Türü</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">{activeSummary.tur} Alımı</span>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30">
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 uppercase">Seçilen Firma</span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 line-clamp-2">{activeSummary.secilenFirma}</span>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30">
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-500 uppercase">Katılan Firmalar</span>
                <span className="text-lg font-extrabold text-indigo-700 dark:text-indigo-400">{activeSummary.katilanFirmaSayisi} <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-600">Firma</span></span>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30">
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase">Malzeme Sayısı</span>
                <span className="text-lg font-extrabold text-amber-700 dark:text-amber-400">{activeSummary.malzemeSayisi} <span className="text-[10px] font-semibold text-amber-500 dark:text-amber-600">Kalem</span></span>
              </div>

            </div>
          ) : (
             <div className="h-16 flex items-center justify-center text-xs font-semibold text-slate-500">Aktif dosya bilgisi bulunamadı.</div>
          )}
        </div>
      )}

      {/* NEW STATS & DUYURULAR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* STATS CARDS */}
        <div className="lg:col-span-8">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              Kurum Genel Bilgileri
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              Bu istatistikler aktif olan tekil bir temin dosyasına (sürece) göre değil, kurumun tüm veritabanı geneline (tüm dosyalar, tüm firmalar, tüm personeller vb.) göre hesaplanmıştır.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* İhale Dosya Sayısı */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-450 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">İhale Dosya Sayısı</div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {isLoading ? '-' : stats.ihaleDosyaSayisi}
              </div>
            </div>
          </div>

          {/* İhalelere Seçilen Firma Sayısı */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">İhalelere Seçilen Firma Sayısı</div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {isLoading ? '-' : stats.ihalelereSecilenFirmaSayisi}
              </div>
            </div>
          </div>

          {/* İhalelere Katılan Firma Sayısı */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-450 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">İhalelere Katılan Firma Sayısı</div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {isLoading ? '-' : stats.ihalelereKatilanFirmaSayisi}
              </div>
            </div>
          </div>

          {/* İhale Edilen Malzeme Sayısı */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-450 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">İhale Edilen Malzeme Sayısı</div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {isLoading ? '-' : stats.ihaleEdilenMalzemeSayisi}
              </div>
            </div>
          </div>

          {/* Kurumda Kayıtlı İstekli Firma Sayısı */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-450 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Kayıtlı İstekli Firma Sayısı</div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {isLoading ? '-' : stats.kayitliFirmaSayisi}
              </div>
            </div>
          </div>

          {/* Kurumda Kayıtlı Personel Sayısı */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-pink-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-450 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Kayıtlı Personel Sayısı</div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {isLoading ? '-' : stats.kayitliPersonelSayisi}
              </div>
            </div>
          </div>
          
          </div>
        </div>

        {/* DUYURULAR / BİLDİRİMLER PANOSU */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Megaphone className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Duyurular ve Güncellemeler</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              
              {/* Duyuru 1 */}
              <div className="flex gap-3">
                <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full shrink-0 shadow-sm shadow-blue-500/50"></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Yeni Versiyon Yayınlandı! (v1.0.0-alpha.3)</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Sistem teması baştan tasarlandı ve yeni birim özellikleri eklendi. Geri bildirimleriniz için teşekkür ederiz.
                  </p>
                  <span className="text-[9px] text-slate-400 font-medium mt-1 block">28 Mayıs 2026</span>
                </div>
              </div>

              {/* Duyuru 2 */}
              <div className="flex gap-3">
                <div className="mt-1 w-2 h-2 bg-emerald-500 rounded-full shrink-0 shadow-sm shadow-emerald-500/50"></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">KİK 2026 Limitleri Güncellendi</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    22/d Doğrudan Temin limitleri 2026 yılı için güncellenmiştir. Limit kontrolünü Mevzuat ekranından takip edebilirsiniz.
                  </p>
                  <span className="text-[9px] text-slate-400 font-medium mt-1 block">15 Ocak 2026</span>
                </div>
              </div>

              {/* Duyuru 3 */}
              <div className="flex gap-3">
                <div className="mt-1 w-2 h-2 bg-indigo-500 rounded-full shrink-0 shadow-sm shadow-indigo-500/50"></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">EBYS Entegrasyonu Hazırlıkları</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Kurum EBYS sistemine tam entegrasyon için altyapı çalışmaları başlatıldı. İlerleyen güncellemelerde duyurulacaktır.
                  </p>
                  <span className="text-[9px] text-slate-400 font-medium mt-1 block">10 Mayıs 2026</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Spend Trend Chart (SVG) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aylık Harcama Hacmi</h3>
              <p className="text-[11px] text-slate-450 mt-0.5">Yıl genelinde doğrudan temin kalemlerine yapılan harcamalar</p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl text-slate-700 dark:text-slate-350">
              2026 (Toplam: {formatCurrency(totalBudgetSpent)})
            </span>
          </div>

          {/* Line Chart Component via Pure SVG */}
          <div className="h-64 relative w-full flex flex-col justify-end">
            <svg viewBox="0 0 700 200" className="w-full h-full text-blue-600" fill="none">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="700" y2="50" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
              <line x1="0" y1="100" x2="700" y2="100" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
              <line x1="0" y1="150" x2="700" y2="150" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />

              {/* Area Gradient */}
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.00" />
                </linearGradient>
              </defs>
              <path
                d="M 50 170 Q 170 140 200 130 T 350 110 T 500 90 T 655 110 L 655 190 L 50 190 Z"
                fill="url(#spendGrad)"
              />

              {/* Smooth Spline Path */}
              <path
                d="M 50 170 Q 170 140 200 130 T 350 110 T 500 90 T 655 110"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Chart Points */}
              <circle cx="50" cy="170" r="5" className="fill-white dark:fill-slate-900" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="200" cy="130" r="5" className="fill-white dark:fill-slate-900" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="350" cy="110" r="5" className="fill-white dark:fill-slate-900" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="500" cy="90" r="5" className="fill-white dark:fill-slate-900" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="655" cy="110" r="5" className="fill-white dark:fill-slate-900" stroke="currentColor" strokeWidth="2.5" />

              {/* Tooltip Indicators */}
              <text x="50" y="150" fontSize="9" fontWeight="bold" className="fill-slate-500" textAnchor="middle">1.1M</text>
              <text x="200" y="110" fontSize="9" fontWeight="bold" className="fill-slate-500" textAnchor="middle">1.8M</text>
              <text x="350" y="90" fontSize="9" fontWeight="bold" className="fill-slate-500" textAnchor="middle">2.2M</text>
              <text x="500" y="70" fontSize="9" fontWeight="bold" className="fill-slate-500" textAnchor="middle">2.5M</text>
              <text x="655" y="90" fontSize="9" fontWeight="bold" className="fill-slate-500" textAnchor="middle">2.0M</text>
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between items-center px-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
              {monthlyData.map((item) => (
                <span key={item.ay}>{item.ay}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Spend Distribution (SVG Donut) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Kategori Dağılımı</h3>
            <p className="text-[11px] text-slate-450 mt-0.5">Yaklaşık maliyetlerin mal, hizmet ve yapım türlerine oranı</p>
          </div>

          {/* Donut Chart */}
          <div className="relative flex items-center justify-center my-4 h-40">
            <svg width="150" height="150" viewBox="0 0 42 42" className="transform -rotate-90">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="currentColor" strokeOpacity="0.05" strokeWidth="4" />
              
              {/* Mal Alımı (%45) */}
              <circle 
                cx="21" 
                cy="21" 
                r="15.915" 
                fill="transparent" 
                stroke="#3b82f6" 
                strokeWidth="4" 
                strokeDasharray="45 55" 
                strokeDashoffset="0" 
              />
              {/* Hizmet Alımı (%35) */}
              <circle 
                cx="21" 
                cy="21" 
                r="15.915" 
                fill="transparent" 
                stroke="#10b981" 
                strokeWidth="4" 
                strokeDasharray="35 65" 
                strokeDashoffset="-45" 
              />
              {/* Yapım İşleri (%20) */}
              <circle 
                cx="21" 
                cy="21" 
                r="15.915" 
                fill="transparent" 
                stroke="#f59e0b" 
                strokeWidth="4" 
                strokeDasharray="20 80" 
                strokeDashoffset="-80" 
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                %100
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dağılım</span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Mal Alımı</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-105">
                {formatCurrency(categoryData.Mal)} (%45)
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Hizmet Alımı</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-105">
                {formatCurrency(categoryData.Hizmet)} (%35)
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Yapım İşi</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-105">
                {formatCurrency(categoryData.Yapım)} (%20)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE FILES PIPELINE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aktif Temin Süreçleri ve Aşamaları</h3>
            <p className="text-[11px] text-slate-450 mt-0.5">Sistemde devam eden doğrudan temin dosyalarının işlem adımları</p>
          </div>
          <Link to="/dosyalar">
            <Button variant="ghost" size="sm" className="text-xs font-bold text-blue-600 dark:text-blue-450 hover:bg-blue-50 dark:hover:bg-blue-950/20 flex items-center gap-1">
              Tüm Dosyaları Gör
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3">
                <th className="py-3 px-4">Dosya Bilgisi</th>
                <th className="py-3 px-4">Birim & Tür</th>
                <th className="py-3 px-4 text-right">Yaklaşık Maliyet</th>
                <th className="py-3 px-4">Süreç Aşaması</th>
                <th className="py-3 px-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {activeFiles.map((file) => {
                const asamaInfo = getAsamaDetails(file.asama)
                return (
                  <tr key={file.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-450 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded w-max border border-blue-500/10">
                          {file.dosyaNo}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {file.baslik}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                          {file.birim}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          Süreç Türü: {file.tur} Alımı
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100">
                        {formatCurrency(file.yaklasikMaliyet)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-max ${asamaInfo?.color}`}>
                          {asamaInfo?.name}
                        </span>
                        {/* Process Step Visual indicator */}
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((step) => (
                            <div 
                              key={step} 
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                step < file.asama 
                                  ? 'bg-emerald-500 w-4' 
                                  : step === file.asama 
                                    ? 'bg-blue-500 w-6 animate-pulse' 
                                    : 'bg-slate-200 dark:bg-slate-850 w-2.5'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Link to="/dosyalar">
                        <Button variant="ghost" size="sm" className="h-8 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1">
                          Detay
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

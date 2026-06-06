import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  TrendingUp,
  Clock,
  ChevronRight,
  ChevronDown,
  Plus,
  Calendar,
  Landmark,
  Users,
  Building,
  Briefcase,
  Megaphone,
  Database,
  Info,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Mail
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Link } from '@tanstack/react-router'
import { cn } from '../../utils/cn'
import { useSettingsStore } from '../../store/settingsStore'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { Button } from '../../components/ui/Button'
import { useDashboardStats, useActiveDosyaSummary, useAnnouncements } from './dashboard.hooks'
import { useDosyalarHooks } from '../dosyalar/dosyalar.hooks'
import { AITextGeneratorModal } from '../../components/ui/AITextGeneratorModal'
import { TakipScreen } from '../system/TakipScreen'
import { useAyarlarHooks } from '../ayarlar/ayarlar.hooks'

export default function DashboardScreen(): React.JSX.Element {
  const {
    institutionName,
    limitType,
    institutionType,
    kurumsalKod,
    fonksiyonelKod,
    muhasebeBirimKodu,
    muhasebeBirimAdi,
    harcamaBirimKodu,
    harcamaBirimAdi,
    adminName,
    adminTitle,
    institutionCode
  } = useSettingsStore()
  const { activeDosyaId } = useWorkspaceStore()
  const { stats, isLoading } = useDashboardStats()
  const { announcements, isLoading: isAnnouncementsLoading } = useAnnouncements()
  const { dosyalar } = useDosyalarHooks()
  const { settings } = useAyarlarHooks()
  const isMailConfigured = !!settings.smtp_host
  
  const [showAIModal, setShowAIModal] = useState(false)
  const [selectedFileForAI, setSelectedFileForAI] = useState<any>(null)
  
  // Dynamic Greeting based on time
  const greeting = (() => {
    const hours = new Date().getHours()
    if (hours >= 6 && hours < 12) return 'Günaydın'
    if (hours >= 12 && hours < 18) return 'İyi Günler'
    if (hours >= 18 && hours < 23) return 'İyi Akşamlar'
    return 'İyi Geceler'
  })()

  const currentDate = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date())

  const [isActivePopoverOpen, setIsActivePopoverOpen] = useState(false)

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

  // Use real database files for listing (last 5 files)
  const activeFiles = dosyalar.slice(0, 5)

  // Active dossier consumption ratio against single KİK limit
  const activeDossierLimit = limitType === 'buyuksehir' ? 1021827 : 340391
  const activeDossierSpent = activeSummary?.yaklasikMaliyet || 0
  const activeSpentPercent = Math.min(100, (activeDossierSpent / activeDossierLimit) * 100)

  // Category breakdown for charts (from database stats)
  const categoryData = {
    Mal: stats.malYaklasikMaliyet || 0,
    Hizmet: stats.hizmetYaklasikMaliyet || 0,
    Yapım: stats.yapimYaklasikMaliyet || 0
  }

  const totalCat = categoryData.Mal + categoryData.Hizmet + categoryData.Yapım || 1
  const malPct = Math.round((categoryData.Mal / totalCat) * 100)
  const hizmetPct = Math.round((categoryData.Hizmet / totalCat) * 100)
  const yapimPct = Math.max(0, 100 - malPct - hizmetPct)

  // Monthly trends from database
  const monthlyData = stats.aylikHarcamalar && stats.aylikHarcamalar.length > 0 ? stats.aylikHarcamalar : [
    { ay: 'Ocak', tutar: 0 },
    { ay: 'Şubat', tutar: 0 },
    { ay: 'Mart', tutar: 0 },
    { ay: 'Nisan', tutar: 0 },
    { ay: 'Mayıs', tutar: 0 }
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

  if (activeDosyaId) {
    return <TakipScreen />
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. HERO HEADER */}
      {!isMailConfigured && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-amber-700 dark:text-amber-500">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Mail (SMTP) Ayarları Yapılandırılmamış</h4>
              <p className="text-xs mt-0.5 opacity-90">Sistem üzerinden şifre sıfırlama veya onay mailleri alabilmeniz için posta sunucunuzu ayarlamanız gerekmektedir. Şifrenizi unutursanız sisteme erişiminizi kaybedebilirsiniz!</p>
            </div>
          </div>
          <Link to="/ayarlar" search={{ tab: 'smtp' }}>
            <Button className="shrink-0 text-xs py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm">
              <Mail className="w-4 h-4 mr-1.5" />
              Ayarları Yapılandır
            </Button>
          </Link>
        </div>
      )}

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
        
        <div className="flex items-center gap-3 shrink-0 relative">
          {activeSummary && (
            <div className="relative">
              <Button 
                onClick={() => setIsActivePopoverOpen(!isActivePopoverOpen)}
                variant="outline"
                className="text-xs font-bold py-2 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-450 flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Aktif Dosya
                <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${isActivePopoverOpen ? 'rotate-180' : ''}`} />
              </Button>
              {isActivePopoverOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Çalışılan Aktif Dosya</h4>
                      <p className="text-[9px] text-slate-400">Şu anda üzerinde işlem yapılan doğrudan temin dosyası</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">No & Konu</span>
                        <span className="font-mono text-blue-650 dark:text-blue-450 font-bold block">{activeSummary.dosyaNo}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-350 truncate block mt-0.5" title={activeSummary.konu}>{activeSummary.konu}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Maliyet & KDV</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">{formatCurrency(activeSummary.yaklasikMaliyet)}</span>
                        <span className="text-slate-450 block mt-0.5">KDV: %{activeSummary.kdv}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Birim & Tür</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-305 block truncate">{activeSummary.birimAdi}</span>
                        <span className="text-slate-450 capitalize block mt-0.5">{activeSummary.tur} Alımı</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Yüklenici Firma</span>
                        <span className="font-semibold text-emerald-650 dark:text-emerald-450 block truncate" title={activeSummary.secilenFirma}>{activeSummary.secilenFirma}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30">
                        <span className="font-bold text-indigo-600">Firmalar:</span>
                        <span className="font-bold text-indigo-700 dark:text-indigo-400">{activeSummary.katilanFirmaSayisi} Firma</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30">
                        <span className="font-bold text-amber-600">Kalemler:</span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">{activeSummary.malzemeSayisi} Kalem</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
      <div className={cn("grid grid-cols-1 gap-4", activeDosyaId ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-4")}>
        {!activeDosyaId && (
          <>
        {/* Card 1: Total Dossiers (Genel) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-450 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-full border border-blue-500/10">
              Genel Metrik
            </span>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Toplam Temin Dosyası (Genel)</div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-baseline gap-1">
              {isLoading ? '-' : stats.ihaleDosyaSayisi} <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Dosya</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Estimated Volume (Genel) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
              Genel Toplam
            </span>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Toplam Yaklaşık Maliyet (Genel)</div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
              {isLoading ? '-' : formatCurrency(stats.toplamYaklasikMaliyet)}
            </div>
          </div>
        </div>
          </>
        )}

        {activeDosyaId && (
          <>
        {/* Card 3: Active Dossier Cost (Aktif) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-450 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-0.5 rounded-full border border-indigo-500/10">
              Aktif Dosya
            </span>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Aktif Dosya Maliyeti</div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 truncate">
              {isActiveSummaryLoading ? 'Yükleniyor...' : activeSummary ? formatCurrency(activeSummary.yaklasikMaliyet) : 'Dosya Seçilmedi'}
            </div>
          </div>
        </div>

        {/* Card 4: Active Dossier KİK Limit Consumption (Aktif) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36 group hover:border-amber-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-450 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-full border border-amber-500/10">
              Yasal Limit Etkisi
            </span>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Aktif Dosya Limit Tüketim Oranı</div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">
                {activeSummary ? `%${activeSpentPercent.toFixed(1)}` : '-%'}
              </span>
              <span className="text-[9px] font-semibold text-slate-400">
                Limit: {formatCurrency(activeDossierLimit)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-indigo-650 h-full rounded-full transition-all duration-500" 
                style={{ width: `${activeSummary ? activeSpentPercent : 0}%` }}
              />
            </div>
          </div>
        </div>
          </>
        )}
      </div>
                 {/* NEW STATS & RIGHT PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* STATS CARDS */}
        {!activeDosyaId && (
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
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-450 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">İhale Dosya Sayısı</div>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {isLoading ? '-' : stats.ihaleDosyaSayisi}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[8px] bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded text-blue-650 dark:text-blue-400 font-bold">Mal: {stats.malDosyaSayisi}</span>
                  <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-450 font-bold">Hizmet: {stats.hizmetDosyaSayisi}</span>
                  <span className="text-[8px] bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-450 font-bold">Yapım: {stats.yapimDosyaSayisi}</span>
                  {stats.danismanlikDosyaSayisi > 0 && (
                    <span className="text-[8px] bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400 font-bold">Danış: {stats.danismanlikDosyaSayisi}</span>
                  )}
                </div>
              </div>
            </div>

            {/* İhale Süreç Dağılımı */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-cyan-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Aktif & Tamamlanan</div>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {isLoading ? '-' : stats.ihaleDosyaSayisi}
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-450 mt-2 flex flex-col gap-0.5 font-semibold">
                  <div className="flex justify-between">
                    <span>Aktif Süreç:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{stats.aktifDosyaSayisi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamamlanan:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.tamamlananDosyaSayisi}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* İhalelere Katılan Firma Sayısı */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-450 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">İhalelere Katılan Firma Sayısı</div>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {isLoading ? '-' : stats.ihalelereKatilanFirmaSayisi}
                </div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
                  Dosyalarda teklif veren veya davet edilen tekil firmalar.
                </div>
              </div>
            </div>

            {/* İhalelere Seçilen Firma Sayısı */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">İhalelere Seçilen Firma Sayısı</div>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {isLoading ? '-' : stats.ihalelereSecilenFirmaSayisi}
                </div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
                  Satın alma yapılması kararlaştırılan kazanan firma sayısı.
                </div>
              </div>
            </div>

            {/* En Çok İhale Alan İstekli */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 rounded-full border border-violet-500/10">Lider Tedarikçi</span>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">En Çok Tercih Edilen</div>
                <div className="text-xs font-black text-slate-850 dark:text-slate-100 mt-1 truncate" title={stats.enCokSecilenFirma?.unvan || 'Veri Yok'}>
                  {stats.enCokSecilenFirma?.unvan || 'Kayıt Bulunamadı'}
                </div>
                {stats.enCokSecilenFirma && (
                  <div className="text-[10px] text-violet-600 dark:text-violet-400 font-bold mt-1">
                    {stats.enCokSecilenFirma.count} Dosya İhalesi
                  </div>
                )}
              </div>
            </div>

            {/* En Çok Harcama Yapan Birim */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-pink-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-650 dark:text-pink-400 flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold text-pink-600 dark:text-pink-450 bg-pink-50 dark:bg-pink-950/30 px-2 py-0.5 rounded-full border border-pink-500/10">Lider Birim</span>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">En Çok Harcama Yapan</div>
                <div className="text-xs font-black text-slate-850 dark:text-slate-100 mt-1 truncate" title={stats.enCokHarcamaYapanBirim?.birim_adi || 'Veri Yok'}>
                  {stats.enCokHarcamaYapanBirim?.birim_adi || 'Kayıt Bulunamadı'}
                </div>
                {stats.enCokHarcamaYapanBirim && (
                  <div className="text-[10px] text-pink-650 dark:text-pink-400 font-bold mt-1">
                    {formatCurrency(stats.enCokHarcamaYapanBirim.total)}
                  </div>
                )}
              </div>
            </div>

            {/* İhale Edilen Malzeme Sayısı */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-450 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">İhale Edilen Kalem Sayısı</div>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {isLoading ? '-' : stats.ihaleEdilenMalzemeSayisi}
                </div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
                  Tüm dosyalarda talep edilen toplam kalem miktarı.
                </div>
              </div>
            </div>

            {/* Kurumda Kayıtlı İstekli Firma Sayısı */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-purple-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-450 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Kayıtlı Tedarikçi Havuzu</div>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {isLoading ? '-' : stats.kayitliFirmaSayisi}
                </div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
                  Sistem havuzuna kayıtlı olan toplam tedarikçi firma.
                </div>
              </div>
            </div>

            {/* Kurumda Kayıtlı Personel Sayısı */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-pink-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-650 dark:text-pink-450 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Kayıtlı Personel Sayısı</div>
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {isLoading ? '-' : stats.kayitliPersonelSayisi}
                </div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
                  Süreçlerde görev alabilecek toplam personel sayısı.
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* RIGHT SIDE PANEL: IDENTITY CARD & ANNOUNCEMENTS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Institution Identity Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Kurum Kimlik Kartı</h3>
            </div>
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase">Kurum Adı</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{institutionName || 'Belirtilmemiş'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase">Kurum Türü</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{kurumTuruLabel}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase">Limit Grubu</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {limitType === 'buyuksehir' ? 'Büyükşehir Limitleri' : 'Diğer İdare Limitleri'}
                  </span>
                </div>
              </div>
              {institutionCode && (
                <div>
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase">Kurum Kodu</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{institutionCode}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {kurumsalKod && (
                  <div>
                    <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase">Kurumsal Kod</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{kurumsalKod}</span>
                  </div>
                )}
                {fonksiyonelKod && (
                  <div>
                    <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase">Fonksiyonel Kod</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{fonksiyonelKod}</span>
                  </div>
                )}
              </div>
              {(harcamaBirimAdi || harcamaBirimKodu) && (
                <div>
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase">Harcama Birimi</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block truncate" title={harcamaBirimAdi}>
                    {harcamaBirimKodu ? `[${harcamaBirimKodu}] ` : ''}{harcamaBirimAdi || 'Belirtilmemiş'}
                  </span>
                </div>
              )}
              {(muhasebeBirimAdi || muhasebeBirimKodu) && (
                <div>
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase">Muhasebe Birimi</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block truncate" title={muhasebeBirimAdi}>
                    {muhasebeBirimKodu ? `[${muhasebeBirimKodu}] ` : ''}{muhasebeBirimAdi || 'Belirtilmemiş'}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                <div>
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase">Birim Sayısı</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{stats.kayitliBirimSayisi} Birim</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase">Ambar Sayısı</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{stats.kayitliAmbarSayisi} Depo</span>
                </div>
              </div>
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-850">
                <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase">Harcama Yetkilisi</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-450">{adminName}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">{adminTitle}</span>
              </div>
            </div>
          </div>

          {/* DUYURULAR / BİLDİRİMLER PANOSU */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col max-h-[360px] overflow-hidden">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <Megaphone className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Duyurular ve İşlem Logları</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0 custom-scrollbar">
              {isAnnouncementsLoading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                  Duyurular yükleniyor...
                </div>
              ) : announcements.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                  Aktif duyuru bulunmuyor.
                </div>
              ) : (
                announcements.map((ann) => {
                  let DotIcon = Info
                  let colorClass = 'bg-blue-500 text-white'
                  
                  if (ann.type === 'success') {
                    DotIcon = CheckCircle2
                    colorClass = 'bg-emerald-500 text-white'
                  } else if (ann.type === 'warning') {
                    DotIcon = AlertTriangle
                    colorClass = 'bg-amber-500 text-white'
                  } else if (ann.type === 'error') {
                    DotIcon = ShieldAlert
                    colorClass = 'bg-red-500 text-white'
                  }

                  return (
                    <div key={ann.id} className="flex gap-3 items-start">
                      <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <DotIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{ann.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {ann.content}
                        </p>
                        <span className="text-[9px] text-slate-400 font-medium mt-1 block">{ann.date}</span>
                      </div>
                    </div>
                  )
                })
              )}
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
              2026 (Toplam: {formatCurrency(stats.toplamYaklasikMaliyet)})
            </span>
          </div>

          {/* Line Chart Component via Recharts */}
          <div className="h-64 relative w-full flex flex-col justify-end mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTutar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis 
                  dataKey="ay" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  tickFormatter={(val) => val > 0 ? `${(val/1000).toFixed(0)}K` : '0'} 
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value as number), 'Harcama']}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tutar" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorTutar)" 
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Spend Distribution (SVG Donut) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Kategori Dağılımı</h3>
            <p className="text-[11px] text-slate-450 mt-0.5">Yaklaşık maliyetlerin mal, hizmet ve yapım türlerine oranı</p>
          </div>

          {/* Donut Chart via Recharts */}
          <div className="relative flex items-center justify-center my-4 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Mal Alımı', value: categoryData.Mal, color: '#3b82f6' },
                    { name: 'Hizmet Alımı', value: categoryData.Hizmet, color: '#10b981' },
                    { name: 'Yapım İşi', value: categoryData.Yapım, color: '#f59e0b' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {
                    [
                      { name: 'Mal Alımı', value: categoryData.Mal, color: '#3b82f6' },
                      { name: 'Hizmet Alımı', value: categoryData.Hizmet, color: '#10b981' },
                      { name: 'Yapım İşi', value: categoryData.Yapım, color: '#f59e0b' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  }
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value as number)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                %{totalCat > 1 ? 100 : 0}
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
                {formatCurrency(categoryData.Mal)} (%{malPct})
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Hizmet Alımı</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-105">
                {formatCurrency(categoryData.Hizmet)} (%{hizmetPct})
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Yapım İşi</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-850 dark:text-slate-105">
                {formatCurrency(categoryData.Yapım)} (%{yapimPct})
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
                const asamaInfo = getAsamaDetails(file.durum_asama_id || 1)
                return (
                  <tr key={file.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-450 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded w-max border border-blue-500/10">
                          {file.temin_no}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {file.konu}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                          {file.birim_adi || 'Birim Belirtilmedi'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          Süreç Türü: {file.tur} Alımı
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100">
                        {formatCurrency(file.yaklasik_maliyet)}
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
                                step < (file.durum_asama_id || 1) 
                                  ? 'bg-emerald-500 w-4' 
                                  : step === (file.durum_asama_id || 1) 
                                    ? 'bg-blue-500 w-6 animate-pulse' 
                                    : 'bg-slate-200 dark:bg-slate-850 w-2.5'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Link to="/dosyalar">
                          <Button variant="ghost" size="sm" className="h-8 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1">
                            Detay
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => {
                            setSelectedFileForAI(file)
                            setShowAIModal(true)
                          }}
                          className="h-8 px-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles size={12} className="animate-pulse" />
                          AI
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* AI Assistant Modal */}
      {showAIModal && selectedFileForAI && (
        <AITextGeneratorModal
          isOpen={true}
          isAdvisorMode={true}
          fieldName="Süreç Tavsiyesi"
          title={`Akıllı Asistan - Dosya: ${selectedFileForAI.temin_no || 'Belirtilmemiş'}`}
          initialPrompt={`Aşağıdaki detaylara sahip dosya üzerinde çalışıyorum:\n- Konu: ${selectedFileForAI.konu}\n- Yaklaşık Maliyet: ${formatCurrency(selectedFileForAI.yaklasik_maliyet || 0)}\n\nLütfen bu dosya için bana sonraki adımlar, dikkat edilecekler ve süreç tavsiyesi ver.`}
          onClose={() => setShowAIModal(false)}
          onApply={(text) => {
            console.log('AI Response:', text)
            setShowAIModal(false)
          }}
          systemInstruction="Sen yetkin bir Doğrudan Temin ve Kamu İhale (4734 Sayılı Kanun) uzmanısın. ÖNEMLİ GİZLİLİK KURALI: Eğer kullanıcıdan gelen metin içinde belirli bir Kurum Adı, Belediye, Kişi Adı-Soyadı, TC No veya açık adres geçiyorsa; cevabında bu özel isimleri asla açıkça kullanma, '[İlgili Kurum]' veya '[İlgili Kişi]' şeklinde sansürle (maskele). Fakat ihale malzemelerini tarif eden teknik özellikleri (boyut, renk, adet, cins vb.) aynen kullan."
        />
      )}
    </div>
  )
}

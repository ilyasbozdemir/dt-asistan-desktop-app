import React, { useState, useEffect } from 'react'
import {
  Scale,
  Calculator,
  FileText,
  Info,
  Save,
  AlertCircle,
  CheckCircle2,
  Building2,
  Briefcase,
  HardHat,
  BookOpen,
  Search,
  Copy,
  ExternalLink,
  Check,
  FileCode,
  X,
  Plus,
  ListPlus
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '../../utils/cn'
import { useAyarlarHooks } from '../ayarlar/ayarlar.hooks'
import { useSettingsStore } from '../../store/settingsStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface CodeItem {
  code: string
  description: string
}

interface PresetItem {
  kod: string
  aciklama: string
}

interface CodeListEditorProps {
  title: string
  description: string
  codes: CodeItem[]
  onChange: (newCodes: CodeItem[]) => void
  placeholderCode?: string
  placeholderDesc?: string
  presets?: PresetItem[]
  presetsLabel?: string
}

function CodeListEditor({
  title,
  description,
  codes,
  onChange,
  placeholderCode,
  placeholderDesc,
  presets,
  presetsLabel
}: CodeListEditorProps): React.JSX.Element {
  const [newCode, setNewCode] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const handleAdd = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!newCode.trim()) return
    const trimmedCode = newCode.trim()
    const trimmedDesc = newDesc.trim()

    if (!codes.some((item) => item.code === trimmedCode)) {
      onChange([...codes, { code: trimmedCode, description: trimmedDesc }])
    }
    setNewCode('')
    setNewDesc('')
  }

  const handleLoadPresets = (): void => {
    if (!presets) return
    const existingCodes = new Set(codes.map((c) => c.code))
    const newItems = presets
      .filter((p) => !existingCodes.has(p.kod))
      .map((p) => ({ code: p.kod, description: p.aciklama }))
    if (newItems.length > 0) {
      onChange([...codes, ...newItems])
    }
  }

  const handleRemove = (indexToRemove: number): void => {
    onChange(codes.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <div className="border border-slate-150 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-955/20 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 mb-0.5">{title}</h3>
          <p className="text-[10px] text-slate-450 dark:text-slate-500">{description}</p>
        </div>
        {presets && presets.length > 0 && (
          <button
            type="button"
            onClick={handleLoadPresets}
            className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 rounded-lg px-2 py-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer"
            title={presetsLabel || 'ABS hazır kodlarını yükle'}
          >
            <ListPlus className="w-3 h-3" />
            {presetsLabel || 'Hazır Kodları Yükle'}
          </button>
        )}
      </div>

      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-4">
          <Input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder={placeholderCode || 'Kod...'}
            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-8 w-full"
          />
        </div>
        <div className="sm:col-span-6">
          <Input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder={placeholderDesc || 'Açıklama (Örn: Mal Alımı)...'}
            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-8 w-full"
          />
        </div>
        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 h-8 w-full rounded-lg shrink-0 flex items-center justify-center gap-1 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Ekle
          </Button>
        </div>
      </form>

      {codes.length === 0 ? (
        <div className="text-[10px] text-slate-450 dark:text-slate-500 italic p-3 text-center bg-slate-100/50 dark:bg-slate-900/30 rounded-lg">
          Kayıtlı kod bulunmuyor.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto p-1 custom-scrollbar">
          {codes.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-750 dark:text-slate-350 shadow-sm"
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-450 shrink-0 bg-blue-50 dark:bg-blue-955/40 px-1.5 py-0.5 rounded border border-blue-100/30 dark:border-blue-900/20">
                  {item.code}
                </span>
                {item.description && (
                  <span
                    className="text-slate-500 dark:text-slate-400 truncate"
                    title={item.description}
                  >
                    — {item.description}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-all shrink-0 cursor-pointer"
                title="Sil"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import {
  FONKSIYONEL_KODLAR,
  FINANSMAN_KODLARI,
  EKONOMIK_KODLAR,
  GELIR_KODLARI
} from '../../constants/butce-kodlari'
import {
  MADDE_22_BENTLERI,
  MADDE_3_ISTISNA_BENTLERI,
  SIKKULLANILANLAR
} from '../../constants/madde-22-bentleri'
import {
  MADDE_22D_KATEGORILER,
  AKTIF_DONEM,
  ISLEM_TURLERI
} from '../../constants/madde-22d-limitler'

interface Asama {
  id: number
  asama_sira: number
  asama_adi: string
  aciklama: string
  rozet_rengi: string
}

const fetchAsamalar = async (): Promise<Asama[]> => {
  const res = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC'
  )
  if (!res.success) throw new Error(res.error)
  return res.data
}

export function MevzuatScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<
    'limitler' | 'oranlar' | 'mali' | 'butcekodlari' | 'asamalar' | 'bentler' | 'rehber'
  >('limitler')
  const [subTab, setSubTab] = useState<'madde22' | 'madde3'>('madde22')
  const [isSaving, setIsSaving] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [butceSearch, setButceSearch] = useState('')
  const [copiedText, setCopiedText] = useState('')

  // Mali & Kurumsal Kodlar States
  const [kurumsalKod1, setKurumsalKod1] = useState('')
  const [kurumsalKod2, setKurumsalKod2] = useState('')
  const [kurumsalKod3, setKurumsalKod3] = useState('')
  const [kurumsalKod4, setKurumsalKod4] = useState('')
  const [institutionType, setInstitutionType] = useState('belediye')

  const handleInstitutionTypeChange = (type: string) => {
    setInstitutionType(type)
    if (type === 'belediye') {
      setFinansalKod('5')
      if (!kurumsalKod1) setKurumsalKod1('30')
    } else if (type === 'genel_butce') {
      setFinansalKod('1')
      if (kurumsalKod1 === '30') setKurumsalKod1('')
    } else if (type === 'ozel_butce') {
      setFinansalKod('2')
      if (kurumsalKod1 === '30') setKurumsalKod1('')
    } else if (type === 'duzenleyici') {
      setFinansalKod('3')
      if (kurumsalKod1 === '30') setKurumsalKod1('')
    } else if (type === 'diger') {
      setFinansalKod('8')
      if (kurumsalKod1 === '30') setKurumsalKod1('')
    }
  }

  const [fonksiyonelKod1, setFonksiyonelKod1] = useState('')
  const [fonksiyonelKod2, setFonksiyonelKod2] = useState('')
  const [fonksiyonelKod3, setFonksiyonelKod3] = useState('')
  const [fonksiyonelKod4, setFonksiyonelKod4] = useState('')

  const [finansalKod, setFinansalKod] = useState('')
  const [birimKodu, setBirimKodu] = useState('')
  const [economicCodes, setEconomicCodes] = useState<CodeItem[]>([])

  const [accountingCode, setAccountingCode] = useState('')
  const [accountingName, setAccountingName] = useState('')
  const [expenseCode, setExpenseCode] = useState('')
  const [expenseName, setExpenseName] = useState('')
  const [taxOffice, setTaxOffice] = useState('')
  const [taxNumber, setTaxNumber] = useState('')

  const { settings, isLoadingSettings, saveSettings } = useAyarlarHooks()
  const { loadSettings: reloadSettingsStore } = useSettingsStore()
  const [savingMali, setSavingMali] = useState(false)

  useEffect(() => {
    if (settings) {
      const normalizeCodes = (raw: unknown): CodeItem[] => {
        if (!raw) return []
        try {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
          if (Array.isArray(parsed)) {
            return parsed
              .map((item) => {
                if (typeof item === 'string') {
                  return { code: item, description: '' }
                }
                if (item && typeof item === 'object') {
                  return {
                    code: (item.code || '').toString(),
                    description: (item.description || '').toString()
                  }
                }
                return null
              })
              .filter((item): item is CodeItem => item !== null && item.code !== '')
          }
        } catch (e) {
          console.error('Error normalizing codes:', e)
        }
        return []
      }

      setKurumsalKod1(settings.kurumsalKod1 || '')
      setKurumsalKod2(settings.kurumsalKod2 || '')
      setKurumsalKod3(settings.kurumsalKod3 || '')
      setKurumsalKod4(settings.kurumsalKod4 || '')

      setFonksiyonelKod1(settings.fonksiyonelKod1 || '01')
      setFonksiyonelKod2(settings.fonksiyonelKod2 || '')
      setFonksiyonelKod3(settings.fonksiyonelKod3 || '')
      setFonksiyonelKod4(settings.fonksiyonelKod4 || '')

      setFinansalKod(settings.finansalKod || settings.financialCode || '5')
      setBirimKodu(settings.birimKodu || settings.departmentCode || '')
      setInstitutionType(settings.institutionType || 'belediye')

      try {
        const parsed = settings.ekonomikKodlarList ? JSON.parse(settings.ekonomikKodlarList) : []
        const normalized = normalizeCodes(parsed)
        if (normalized.length === 0) {
          setEconomicCodes(
            EKONOMIK_KODLAR.map((item) => ({ code: item.kod, description: item.aciklama }))
          )
        } else {
          setEconomicCodes(normalized)
        }
      } catch {
        setEconomicCodes(
          EKONOMIK_KODLAR.map((item) => ({ code: item.kod, description: item.aciklama }))
        )
      }

      setAccountingCode(settings.accountingCode || '')
      setAccountingName(settings.accountingName || '')
      setExpenseCode(settings.expenseCode || '')
      setExpenseName(settings.expenseName || '')
      setTaxOffice(settings.taxOffice || '')
      setTaxNumber(settings.taxNumber || '')
    }
  }, [settings])

  const handleSaveMali = async (): Promise<void> => {
    setSavingMali(true)
    try {
      const dataToSave: Record<string, string> = {
        kurumsalKod1,
        kurumsalKod2,
        kurumsalKod3,
        kurumsalKod4,
        institutionalCode: [kurumsalKod1, kurumsalKod2, kurumsalKod3, kurumsalKod4]
          .filter(Boolean)
          .join('.'),
        fonksiyonelKod1,
        fonksiyonelKod2,
        fonksiyonelKod3,
        fonksiyonelKod4,
        finansalKod,
        financialCode: finansalKod,
        birimKodu,
        departmentCode: birimKodu,
        ekonomikKodlarList: JSON.stringify(economicCodes),
        accountingCode,
        institutionType,
        accountingName,
        expenseCode,
        expenseName,
        taxOffice,
        taxNumber
      }

      await saveSettings(dataToSave)
      await reloadSettingsStore()
      alert('Mali ve kurumsal kodlar başarıyla kaydedildi.')
    } catch {
      alert('Kaydetme hatası!')
    } finally {
      setSavingMali(false)
    }
  }

  const handleCopy = (text: string): void => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(''), 1500)
  }

  // Mock State for Settings (This would normally come from a global store/db)
  const [limits, setLimits] = useState({
    buyuksehir: '1.021.827,00',
    diger: '340.391,00',
    yil: new Date().getFullYear().toString()
  })

  const [rates, setRates] = useState({
    kdv1: '1',
    kdv2: '10',
    kdv3: '20',
    damgaVergisi: '9,48',
    kararPulu: '5,69'
  })

  const { data: asamalar = [], isLoading: isLoadingAsamalar } = useQuery({
    queryKey: ['asamalar'],
    queryFn: fetchAsamalar
  })

  // Reset confirmation checkbox on value changes
  React.useEffect(() => {
    setIsConfirmed(false)
  }, [limits, rates])

  const handleSave = (): void => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 800)
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-500" />
            Mevzuat ve Sistem Parametreleri
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Uygulama genelinde kullanılacak 4734 Sayılı K.İ.K yasal limitlerini ve oranları buradan yönetebilirsiniz.
          </p>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          {(activeTab === 'limitler' || activeTab === 'oranlar') && (
            <>
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-650 border-slate-300 dark:border-slate-850 focus:ring-blue-500 cursor-pointer"
                />
                <span>Değerlerin doğruluğunu onaylıyorum</span>
              </label>

              <button
                onClick={handleSave}
                disabled={isSaving || !isConfirmed}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Kaydedildi' : 'Değişiklikleri Kaydet'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 min-h-0">
        {/* SOL MENÜ */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('limitler')}
            className={cn(
              'flex items-center gap-3 w-full text-left py-2.5 px-4 text-xs font-bold rounded-xl transition-all border border-transparent cursor-pointer',
              activeTab === 'limitler'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span>4734 Sayılı Kanun Limitleri</span>
          </button>
          <button
            onClick={() => setActiveTab('oranlar')}
            className={cn(
              'flex items-center gap-3 w-full text-left py-2.5 px-4 text-xs font-bold rounded-xl transition-all border border-transparent cursor-pointer',
              activeTab === 'oranlar'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            <Calculator className="w-4 h-4 shrink-0" />
            <span>Vergi & Kesinti Oranları</span>
          </button>
          <button
            onClick={() => setActiveTab('mali')}
            className={cn(
              'flex items-center gap-3 w-full text-left py-2.5 px-4 text-xs font-bold rounded-xl transition-all border border-transparent cursor-pointer',
              activeTab === 'mali'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            <FileCode className="w-4 h-4 shrink-0" />
            <span>Mali & Kurumsal Kodlar</span>
          </button>
          <button
            onClick={() => setActiveTab('rehber')}
            className={cn(
              'flex items-center gap-3 w-full text-left py-2.5 px-4 text-xs font-bold rounded-xl transition-all border border-transparent cursor-pointer',
              activeTab === 'rehber'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Alım Türü Rehberi</span>
          </button>
          <button
            onClick={() => setActiveTab('asamalar')}
            className={cn(
              'flex items-center gap-3 w-full text-left py-2.5 px-4 text-xs font-bold rounded-xl transition-all border border-transparent cursor-pointer',
              activeTab === 'asamalar'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>İşlem Aşamaları (Status)</span>
          </button>
          <button
            onClick={() => setActiveTab('bentler')}
            className={cn(
              'flex items-center gap-3 w-full text-left py-2.5 px-4 text-xs font-bold rounded-xl transition-all border border-transparent cursor-pointer',
              activeTab === 'bentler'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Madde 22 Bentleri</span>
          </button>
          <button
            onClick={() => setActiveTab('butcekodlari')}
            className={cn(
              'flex items-center gap-3 w-full text-left py-2.5 px-4 text-xs font-bold rounded-xl transition-all border border-transparent cursor-pointer',
              activeTab === 'butcekodlari'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Bütçe Kodları (ABS)</span>
          </button>
        </div>

        {/* SAĞ PANEL */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar flex-1">
          {activeTab === 'limitler' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Doğrudan Temin (Madde 22/d) Hakkında</p>
                <p>
                  Bu maddedeki sınırlar içerisinde kalan ihtiyaçlar, ilan yapılmaksızın ve teminat
                  alınmaksızın idarelerce uygun görülen kişilerden piyasa fiyat araştırması
                  yapılarak temin edilebilir. Limitler Kamu İhale Kurumu tarafından her yıl
                  güncellenir.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Geçerli Yıl (Bkz. {AKTIF_DONEM.gecerlilik_baslangic} -{' '}
                    {AKTIF_DONEM.gecerlilik_bitis})
                  </label>
                  <input
                    type="text"
                    value={limits.yil}
                    onChange={(e) => setLimits({ ...limits, yil: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 line-clamp-1"
                    title={MADDE_22D_KATEGORILER.BUYUKSEHIR_SINIRI_DAHIL.aciklama}
                  >
                    {MADDE_22D_KATEGORILER.BUYUKSEHIR_SINIRI_DAHIL.aciklama} (₺)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={limits.buyuksehir}
                      onChange={(e) => setLimits({ ...limits, buyuksehir: e.target.value })}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      ₺
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 line-clamp-1"
                    title={MADDE_22D_KATEGORILER.DIGER_IDARELER.aciklama}
                  >
                    {MADDE_22D_KATEGORILER.DIGER_IDARELER.aciklama} (₺)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={limits.diger}
                      onChange={(e) => setLimits({ ...limits, diger: e.target.value })}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      ₺
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Doğrudan Temin İşlem Türleri
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {ISLEM_TURLERI.map((islem) => (
                  <span
                    key={islem.kod}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700"
                  >
                    {islem.aciklama}
                  </span>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Uygulama İçi Uyarı Davranışı
              </h3>
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      Limit Aşımında Uyar
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Yeni bir dosya oluşturulurken tahmini bedel veya yaklaşık maliyet belirtilen
                      limitleri aştığında sistem otomatik olarak uyarı verir.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'oranlar' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
              <Calculator className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Vergi ve Tevkifat Oranları</p>
                <p>
                  Burada belirlediğiniz oranlar, hakediş ve ödeme emri belgeleri oluşturulurken
                  otomatik hesaplamalarda varsayılan değer olarak kullanılır.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">
                  Kesinti Oranları (Binde)
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-32">
                      Damga Vergisi
                    </label>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={rates.damgaVergisi}
                        onChange={(e) => setRates({ ...rates, damgaVergisi: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
                        ‰
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-32">
                      Karar Pulu
                    </label>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={rates.kararPulu}
                        onChange={(e) => setRates({ ...rates, kararPulu: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
                        ‰
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">
                  Geçerli KDV Oranları (%)
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={rates.kdv1}
                        onChange={(e) => setRates({ ...rates, kdv1: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={rates.kdv2}
                        onChange={(e) => setRates({ ...rates, kdv2: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={rates.kdv3}
                        onChange={(e) => setRates({ ...rates, kdv3: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mali' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                Mali ve Kurumsal Kod Yönetimi
              </h2>
              <p className="text-xs text-slate-500">
                Maliye ve muhasebe süreçlerinde kullanılan kod listelerini yönetin. Kod
                ekleyerek listeleri genişletebilirsiniz.
              </p>
            </div>

            {isLoadingSettings ? (
              <div className="flex items-center justify-center p-8 text-sm text-slate-500">
                Yükleniyor...
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {/* Kurum Tipi Selector */}
                  <div className="border border-slate-150 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-955/20">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5">
                      Kurum Tipi (Bütçeleme Şablonu)
                    </label>
                    <select
                      value={institutionType}
                      onChange={(e) => handleInstitutionTypeChange(e.target.value)}
                      title="Kurum Tipi Seçin"
                      className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="belediye">Belediye / Mahalli İdare (Finansman Kodu: 5)</option>
                      <option value="genel_butce">Bakanlık / İl-İlçe Müdürlüğü / Genel Bütçe (Finansman Kodu: 1)</option>
                      <option value="ozel_butce">Üniversite / Özel Bütçeli İdare (Finansman Kodu: 2)</option>
                      <option value="duzenleyici">Düzenleyici ve Denetleyici Kurum (Finansman Kodu: 3)</option>
                      <option value="diger">Diğer İdareler / Kamu İktisadi Teşebbüsü (Finansman Kodu: 8)</option>
                    </select>

                    {institutionType === 'belediye' && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                        💡 Mahalli İdare şablonu aktif. 5018 sayılı kanun gereği kurumsal kod prefixi <strong>"30"</strong> (Mahalli İdareler) ve finansal kod <strong>"5"</strong> olmalıdır.
                        <br />Örnek Kurumsal Kod Yapısı: <strong>30 . [İl Kodu] . [Belediye Kodu] . [Müdürlük/Birim Kodu]</strong> (Örn: 30.06.01.30)
                      </div>
                    )}
                    {institutionType === 'genel_butce' && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                        💡 Genel Bütçe şablonu aktif. Finansal kod <strong>"1"</strong> (Genel Bütçe) olmalıdır. Kurumsal Kod1 alanına ilgili Bakanlık / İdare kodu yazılmalıdır.
                        <br />Örnek Kurumsal Kod Yapısı: <strong>[Bakanlık Kodu] . [Genel Müdürlük] . [İl Kodu] . [İlçe/Birim]</strong> (Örn: 18.01.06.00 - Sağlık Bakanlığı)
                      </div>
                    )}
                    {institutionType === 'ozel_butce' && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                        💡 Özel Bütçe şablonu aktif. Özel Bütçeli İdareler (Örn: Üniversiteler) için finansal kod <strong>"2"</strong> olmalıdır. Üniversiteler için kurumsal kod prefixi <strong>"38"</strong> ile başlar.
                        <br />Örnek Kurumsal Kod Yapısı: <strong>38 . [Üniversite Kodu] . [Fakülte/Bölüm] . [Birim]</strong> (Örn: 38.08.01.00)
                      </div>
                    )}
                  </div>
                  {/* Kurumsal Kod — 4 düzey hiyerarşik */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Kurumsal Kod
                      <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-2">
                        4 düzey hiyerarşi (KOD1 . KOD2 . KOD3 . KOD4)
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={kurumsalKod1}
                        onChange={(e) => setKurumsalKod1(e.target.value)}
                        placeholder="KOD1"
                        className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-center font-mono w-24"
                      />
                      <span className="text-slate-400 font-bold">.</span>
                      <Input
                        value={kurumsalKod2}
                        onChange={(e) => setKurumsalKod2(e.target.value)}
                        placeholder="KOD2"
                        className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-center font-mono w-20"
                      />
                      <span className="text-slate-400 font-bold">.</span>
                      <Input
                        value={kurumsalKod3}
                        onChange={(e) => setKurumsalKod3(e.target.value)}
                        placeholder="KOD3"
                        className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-center font-mono w-20"
                      />
                      <span className="text-slate-400 font-bold">.</span>
                      <Input
                        value={kurumsalKod4}
                        onChange={(e) => setKurumsalKod4(e.target.value)}
                        placeholder="KOD4"
                        className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-center font-mono w-20"
                      />
                    </div>
                  </div>

                  {/* Birim Kodu — tek input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Birim Kodu
                    </label>
                    <Input
                      value={birimKodu}
                      onChange={(e) => setBirimKodu(e.target.value)}
                      placeholder="Birim Kodu"
                      className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 max-w-sm"
                    />
                  </div>

                  {/* Fonksiyonel Kod — 4 düzey hiyerarşik */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Fonksiyonel Kod (Düzey 1 ve Alt Düzeyler)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <select
                        value={fonksiyonelKod1}
                        onChange={(e) => setFonksiyonelKod1(e.target.value)}
                        title="Fonksiyonel Kod Düzey 1"
                        className="bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 w-full sm:w-64"
                      >
                        {FONKSIYONEL_KODLAR.map((item) => (
                          <option key={item.kod} value={item.kod}>
                            {item.kod} - {item.aciklama}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <span className="text-slate-400 font-bold hidden sm:inline">.</span>
                        <Input
                          value={fonksiyonelKod2}
                          onChange={(e) => setFonksiyonelKod2(e.target.value)}
                          placeholder="KOD2"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-center font-mono w-16"
                        />
                        <span className="text-slate-400 font-bold">.</span>
                        <Input
                          value={fonksiyonelKod3}
                          onChange={(e) => setFonksiyonelKod3(e.target.value)}
                          placeholder="KOD3"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-center font-mono w-16"
                        />
                        <span className="text-slate-400 font-bold">.</span>
                        <Input
                          value={fonksiyonelKod4}
                          onChange={(e) => setFonksiyonelKod4(e.target.value)}
                          placeholder="KOD4"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-center font-mono w-16"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Finansal Kod — tek input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Finansal Kod (Finansman Tipi)
                    </label>
                    <select
                      value={finansalKod}
                      onChange={(e) => setFinansalKod(e.target.value)}
                      title="Finansal Kod"
                      className="bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 w-full max-w-sm"
                    >
                      {FINANSMAN_KODLARI.map((item) => (
                        <option key={item.kod} value={item.kod}>
                          {item.kod} - {item.aciklama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Gider Ekonomik Kodları */}
                <div className="mt-6">
                  <CodeListEditor
                    title="Ekonomik Kodlar (Gider)"
                    description="Mal ve hizmet alım gider kodları (Örn: 03.2.1.01 - Kırtasiye)"
                    codes={economicCodes}
                    onChange={setEconomicCodes}
                    placeholderCode="Kod..."
                    placeholderDesc="Ekonomik Gider Açıklaması..."
                    presets={EKONOMIK_KODLAR}
                  />
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Muhasebe ve Vergi Detayları
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Muhasebe Birim Kodu
                      </label>
                      <Input
                        value={accountingCode}
                        onChange={(e) => setAccountingCode(e.target.value)}
                        placeholder="Muhasebe Kodu"
                        className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Muhasebe Birim Adı
                      </label>
                      <Input
                        value={accountingName}
                        onChange={(e) => setAccountingName(e.target.value)}
                        placeholder="Muhasebe Birim Adı"
                        className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Harcama Birim Kodu
                      </label>
                      <Input
                        value={expenseCode}
                        onChange={(e) => setExpenseCode(e.target.value)}
                        placeholder="Harcama Birim Kodu"
                        className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Harcama Birim Adı
                      </label>
                      <Input
                        value={expenseName}
                        onChange={(e) => setExpenseName(e.target.value)}
                        placeholder="Harcama Birim Adı"
                        className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Vergi Dairesi
                      </label>
                      <Input
                        value={taxOffice}
                        onChange={(e) => setTaxOffice(e.target.value)}
                        placeholder="Vergi Dairesi"
                        className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Vergi Numarası
                      </label>
                      <Input
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        placeholder="Vergi Numarası"
                        className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                  <Button
                    onClick={handleSaveMali}
                    disabled={savingMali}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-5 text-sm font-semibold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Mali Kodları Kaydet
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'rehber' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Alım Türlerine Göre Belge Rehberi
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Doğrudan temin ile yapılacak alımlarda, alımın türüne göre dosyada bulunması gereken
              asgari belgeler.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mal Alımı */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Mal Alımı</h3>
                <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Onay Belgesi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Piyasa Fiyat Araştırması Tutanağı</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Muayene ve Kabul Komisyonu Tutanağı</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Fatura / e-Arşiv Fatura</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Taşınır İşlem Fişi (TİF)</span>
                  </li>
                </ul>
              </div>

              {/* Hizmet Alımı */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                  Hizmet Alımı
                </h3>
                <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Onay Belgesi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Piyasa Fiyat Araştırması Tutanağı</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Hizmet İşleri Kabul Tutanağı</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Fatura / e-Arşiv Fatura</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-400">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="italic">Gerekirse hakediş raporu</span>
                  </li>
                </ul>
              </div>

              {/* Yapım İşi */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
                  <HardHat className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Yapım İşi</h3>
                <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Yaklaşık Maliyet Hesap Cetveli</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Onay Belgesi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Piyasa Fiyat Araştırması Tutanağı</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Yapım İşleri Kabul Tutanağı</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Sözleşme (İdare Gerekli Görürse)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'asamalar' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Varsayılan İşlem Aşamaları (Status)
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-2xl">
                  Sistemdeki doğrudan temin dosyaları varsayılan olarak aşağıdaki iş akışını takip
                  eder. Dosyanın durumuna göre sol menüdeki rozet renkleri ve kullanılabilecek
                  belgeler değişiklik gösterir.
                </p>
              </div>
            </div>

            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 md:ml-6 space-y-8 pb-4">
              {isLoadingAsamalar ? (
                <div className="text-sm text-slate-500 py-4 pl-8">Aşamalar yükleniyor...</div>
              ) : asamalar.length === 0 ? (
                <div className="text-sm text-slate-500 py-4 pl-8">Kayıtlı aşama bulunamadı.</div>
              ) : (
                asamalar.map((asama) => {
                  // Map database color codes to tailwind classes
                  const colorMap: Record<
                    string,
                    {
                      bg: string
                      text: string
                      border: string
                      shadow: string
                      pillBg: string
                      pillText: string
                    }
                  > = {
                    amber: {
                      bg: 'bg-amber-100',
                      text: 'text-amber-700',
                      border: 'border-amber-500',
                      shadow: 'shadow-amber-500/20',
                      pillBg: 'bg-amber-100 dark:bg-amber-900/30',
                      pillText: 'text-amber-700 dark:text-amber-400'
                    },
                    blue: {
                      bg: 'bg-blue-100',
                      text: 'text-blue-700',
                      border: 'border-blue-500',
                      shadow: 'shadow-blue-500/20',
                      pillBg: 'bg-blue-100 dark:bg-blue-900/30',
                      pillText: 'text-blue-700 dark:text-blue-400'
                    },
                    purple: {
                      bg: 'bg-purple-100',
                      text: 'text-purple-700',
                      border: 'border-purple-500',
                      shadow: 'shadow-purple-500/20',
                      pillBg: 'bg-purple-100 dark:bg-purple-900/30',
                      pillText: 'text-purple-700 dark:text-purple-400'
                    },
                    emerald: {
                      bg: 'bg-emerald-100',
                      text: 'text-emerald-700',
                      border: 'border-emerald-500',
                      shadow: 'shadow-emerald-500/20',
                      pillBg: 'bg-emerald-100 dark:bg-emerald-900/30',
                      pillText: 'text-emerald-700 dark:text-emerald-400'
                    }
                  }

                  const colors = colorMap[asama.rozet_rengi] || colorMap['blue']

                  return (
                    <div key={asama.id} className="relative pl-8 md:pl-10">
                      <div
                        className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border-4 ${colors.border} shadow-sm ${colors.shadow}`}
                      ></div>
                      <div
                        className={`bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-${asama.rozet_rengi}-300 dark:hover:border-${asama.rozet_rengi}-700 transition-all`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full ${colors.pillBg} ${colors.pillText} text-xs font-bold tracking-wide`}
                          >
                            AŞAMA {asama.asama_sira}
                          </span>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                            {asama.asama_adi}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                          {asama.aciklama}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'bentler' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Alt Sekmeler (Madde 22 ve Madde 3) */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 mb-4">
              <button
                onClick={() => setSubTab('madde22')}
                className={cn(
                  'pb-3 text-sm font-semibold border-b-2 transition-all',
                  subTab === 'madde22'
                    ? 'border-purple-500 text-purple-650 dark:text-purple-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                Madde 22 (Doğrudan Temin)
              </button>
              <button
                onClick={() => setSubTab('madde3')}
                className={cn(
                  'pb-3 text-sm font-semibold border-b-2 transition-all',
                  subTab === 'madde3'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                Madde 3 (İstisnalar)
              </button>
            </div>

            {subTab === 'madde22' ? (
              <>
                <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-xl border border-purple-100 dark:border-purple-800/50">
                  <Info className="w-5 h-5 shrink-0 mt-0.5 text-purple-500" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">4734 Sayılı KİK - Madde 22 Bentleri</p>
                    <p>
                      Aşağıda belirtilen hallerde ihtiyaçların ilân yapılmaksızın ve teminat
                      alınmaksızın doğrudan temin usulüyle karşılanması mümkündür.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MADDE_22_BENTLERI.map((bent) => {
                    const isSikKullanilan = SIKKULLANILANLAR.includes(bent.bent)
                    return (
                      <div
                        key={bent.bent}
                        className={cn(
                          'p-4 rounded-xl border transition-all hover:shadow-md hover:border-purple-300 dark:hover:border-purple-800',
                          isSikKullanilan
                            ? 'bg-slate-50 dark:bg-slate-900/50 border-purple-200 dark:border-purple-900/50'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                            {bent.bent.toUpperCase()}
                          </span>
                          <h3 className="font-bold text-slate-800 dark:text-slate-200">
                            {bent.kisaAd}
                          </h3>
                          {isSikKullanilan && (
                            <span className="ml-auto text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                              SIK KULLANILAN
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {bent.aciklama}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{bent.detay}</p>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-800/50">
                  <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">4734 Sayılı KİK - Madde 3 İstisnaları</p>
                    <p>
                      Kanun kapsamındaki idarelerin yapacağı ve niteliği gereği Kamu İhale Kanunu
                      hükümlerinden kısmen veya tamamen istisna tutulan alım bentleridir.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MADDE_3_ISTISNA_BENTLERI.map((bent) => (
                    <div
                      key={bent.bent}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                          {bent.bent.toUpperCase()}
                        </span>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">
                          {bent.kisaAd}
                        </h3>
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {bent.aciklama}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{bent.detay}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'butcekodlari' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Analitik Bütçe Sınıflandırması (ABS)</p>
                  <p>
                    Kurumunuzda ve ödeme emri belgelerinde kullanılacak standart bütçe kodları
                    listesidir. Ayarlar ekranından kurumunuza özel olanları seçebilirsiniz.
                  </p>
                </div>
              </div>
              <a
                href="https://www.sbb.gov.tr/butce-cagrisi-ve-butce-hazirlama-rehberleri/"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                SBB Bütçe Rehberi
              </a>
            </div>

            {/* Arama Barı */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Bütçe kodlarında arayın (örn: Personel, 03, Cari, Vergi)..."
                value={butceSearch}
                onChange={(e) => setButceSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Fonksiyonel */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
                  Fonksiyonel Kodlar
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {FONKSIYONEL_KODLAR.filter(
                    (item) =>
                      item.kod.includes(butceSearch) ||
                      item.aciklama.toLowerCase().includes(butceSearch.toLowerCase())
                  ).map((item) => (
                    <div
                      key={item.kod}
                      className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-slate-100/50 dark:hover:bg-slate-800/30 group transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450 w-8 shrink-0">
                          {item.kod}
                        </span>
                        <span
                          className="text-slate-700 dark:text-slate-300 truncate"
                          title={item.aciklama}
                        >
                          {item.aciklama}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.kod)}
                        className="text-slate-400 hover:text-emerald-500 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Kodu kopyala"
                      >
                        {copiedText === item.kod ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Finansman */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
                  Finansman Tipi Kodları
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {FINANSMAN_KODLARI.filter(
                    (item) =>
                      item.kod.includes(butceSearch) ||
                      item.aciklama.toLowerCase().includes(butceSearch.toLowerCase())
                  ).map((item) => (
                    <div
                      key={item.kod}
                      className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-slate-100/50 dark:hover:bg-slate-800/30 group transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450 w-6 shrink-0">
                          {item.kod}
                        </span>
                        <span
                          className="text-slate-700 dark:text-slate-300 truncate"
                          title={item.aciklama}
                        >
                          {item.aciklama}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.kod)}
                        className="text-slate-400 hover:text-emerald-500 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Kodu kopyala"
                      >
                        {copiedText === item.kod ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ekonomik (Gider) */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
                  Ekonomik Kodlar (Gider)
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {EKONOMIK_KODLAR.filter(
                    (item) =>
                      item.kod.includes(butceSearch) ||
                      item.aciklama.toLowerCase().includes(butceSearch.toLowerCase())
                  ).map((item) => (
                    <div
                      key={item.kod}
                      className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-slate-100/50 dark:hover:bg-slate-800/30 group transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450 w-8 shrink-0">
                          {item.kod}
                        </span>
                        <span
                          className="text-slate-700 dark:text-slate-300 truncate"
                          title={item.aciklama}
                        >
                          {item.aciklama}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.kod)}
                        className="text-slate-400 hover:text-emerald-500 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Kodu kopyala"
                      >
                        {copiedText === item.kod ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gelir */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
                  Gelir Kodları
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {GELIR_KODLARI.filter(
                    (item) =>
                      item.kod.includes(butceSearch) ||
                      item.aciklama.toLowerCase().includes(butceSearch.toLowerCase())
                  ).map((item) => (
                    <div
                      key={item.kod}
                      className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-slate-100/50 dark:hover:bg-slate-800/30 group transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450 w-8 shrink-0">
                          {item.kod}
                        </span>
                        <span
                          className="text-slate-700 dark:text-slate-300 truncate"
                          title={item.aciklama}
                        >
                          {item.aciklama}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.kod)}
                        className="text-slate-400 hover:text-emerald-500 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Kodu kopyala"
                      >
                        {copiedText === item.kod ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}

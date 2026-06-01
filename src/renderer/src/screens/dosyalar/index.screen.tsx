import React, { useState, useEffect } from 'react'
import { useDosyalarHooks, TeminDosyasi } from './dosyalar.hooks'
import { useTabStore } from '../../store/tabStore'
import { useRouterState } from '@tanstack/react-router'
import {
  Search,
  Plus,
  FileText,
  ChevronRight,
  Filter,
  Trash2,
  Edit,
  Save,
  X,
  Package,
  Wrench,
  Activity,
  Calendar,
  Building,
  ExternalLink
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { FONKSIYONEL_KODLAR, EKONOMIK_KODLAR } from '../../constants/butce-kodlari'

export default function DosyalarScreen(): React.ReactNode {
  const { dosyalar, isLoadingDosyalar, addDosya, updateDosya, deleteDosya } = useDosyalarHooks()
  const { activeDosyaId, setActiveDosyaId, isCreatingDosya, setIsCreatingDosya } = useWorkspaceStore()
  const { updateTabLabel } = useTabStore()
  const routerState = useRouterState()
  
  const searchParams = new URLSearchParams(window.location.search)
  const isWindowMode = searchParams.get('mode') === 'window'
  const urlId = searchParams.get('id')

  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Form states
  const [formTeminNo, setFormTeminNo] = useState('')
  const [formKonu, setFormKonu] = useState('')
  const [formTur, setFormTur] = useState('mal')
  const [formYaklasikMaliyet, setFormYaklasikMaliyet] = useState('')
  const [formButceKodu, setFormButceKodu] = useState('')
  const [formNotlar, setFormNotlar] = useState('')
  const [formFonksiyonelKod, setFormFonksiyonelKod] = useState('')
  const [formEkonomikKod, setFormEkonomikKod] = useState('')

  const fileId = urlId ? parseInt(urlId, 10) : activeDosyaId
  const selectedDosya = dosyalar.find((d) => d.id === fileId)

  // Dynamically update the tab label with the active file's topic
  useEffect(() => {
    if (isWindowMode) return
    const currentHref = routerState.location.href
    if (selectedDosya) {
      updateTabLabel(currentHref, `DT: ${selectedDosya.konu}`)
    } else {
      updateTabLabel(currentHref, 'Doğrudan Temin')
    }
  }, [selectedDosya, routerState.location.href, updateTabLabel, isWindowMode])

  const handleOpenInNewWindow = () => {
    if (!selectedDosya) return
    window.electron?.ipcRenderer.send('window:open-secondary', {
      path: '/dosyalar',
      search: `?id=${selectedDosya.id}&mode=window`,
      title: `DT: ${selectedDosya.konu}`
    })
  }

  const clearForm = (): void => {
    setFormTeminNo('')
    setFormKonu('')
    setFormTur('mal')
    setFormYaklasikMaliyet('')
    setFormButceKodu('')
    setFormNotlar('')
    setFormFonksiyonelKod('')
    setFormEkonomikKod('')
  }

  const handleStartCreate = (): void => {
    setIsCreating(true)
    setIsEditing(false)
    setActiveDosyaId(null)
    clearForm()
  }

  // Listen to global create trigger (e.g. from header selector)
  useEffect(() => {
    if (isCreatingDosya) {
      handleStartCreate()
      setIsCreatingDosya(false)
    }
  }, [isCreatingDosya, setIsCreatingDosya])

  // Sync form state when selection changes
  useEffect(() => {
    if (selectedDosya) {
      setFormTeminNo(selectedDosya.temin_no || '')
      setFormKonu(selectedDosya.konu || '')
      setFormTur(selectedDosya.tur || 'mal')
      setFormYaklasikMaliyet(selectedDosya.yaklasik_maliyet ? selectedDosya.yaklasik_maliyet.toString() : '')
      setFormButceKodu(selectedDosya.butce_kodu || '')
      setFormNotlar(selectedDosya.notlar || '')
      setFormFonksiyonelKod(selectedDosya.fonksiyonel_kod || '')
      setFormEkonomikKod(selectedDosya.ekonomik_kod || '')
      setIsCreating(false)
      setIsEditing(false)
    } else if (!isCreating) {
      clearForm()
    }
  }, [selectedDosya, isCreating])

  const handleStartEdit = (): void => {
    if (selectedDosya) {
      setFormTeminNo(selectedDosya.temin_no || '')
      setFormKonu(selectedDosya.konu || '')
      setFormTur(selectedDosya.tur || 'mal')
      setFormYaklasikMaliyet(selectedDosya.yaklasik_maliyet ? selectedDosya.yaklasik_maliyet.toString() : '')
      setFormButceKodu(selectedDosya.butce_kodu || '')
      setFormNotlar(selectedDosya.notlar || '')
      setFormFonksiyonelKod(selectedDosya.fonksiyonel_kod || '')
      setFormEkonomikKod(selectedDosya.ekonomik_kod || '')
      setIsEditing(true)
      setIsCreating(false)
    }
  }

  const handleCancel = (): void => {
    setIsCreating(false)
    setIsEditing(false)
    if (selectedDosya) {
      setFormTeminNo(selectedDosya.temin_no || '')
      setFormKonu(selectedDosya.konu || '')
      setFormTur(selectedDosya.tur || 'mal')
      setFormYaklasikMaliyet(selectedDosya.yaklasik_maliyet ? selectedDosya.yaklasik_maliyet.toString() : '')
      setFormButceKodu(selectedDosya.butce_kodu || '')
      setFormNotlar(selectedDosya.notlar || '')
      setFormFonksiyonelKod(selectedDosya.fonksiyonel_kod || '')
      setFormEkonomikKod(selectedDosya.ekonomik_kod || '')
    } else {
      clearForm()
    }
  }

  const handleSaveForm = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!formKonu.trim()) {
      alert('Lütfen dosya konusunu girin.')
      return
    }

    const rawMaliyet = parseFloat(formYaklasikMaliyet)
    const maliyet = isNaN(rawMaliyet) ? 0 : rawMaliyet

    const dosyaData: Partial<TeminDosyasi> = {
      temin_no: formTeminNo.trim(),
      konu: formKonu.trim(),
      tur: formTur,
      yaklasik_maliyet: maliyet,
      butce_kodu: formButceKodu.trim(),
      notlar: formNotlar.trim(),
      fonksiyonel_kod: formFonksiyonelKod,
      ekonomik_kod: formEkonomikKod
    }

    try {
      if (isCreating) {
        const res = await addDosya(dosyaData)
        if (res && res.lastInsertRowid) {
          setActiveDosyaId(Number(res.lastInsertRowid))
        }
        setIsCreating(false)
        alert('Dosya başarıyla oluşturuldu.')
      } else if (isEditing && selectedDosya) {
        await updateDosya({ ...dosyaData, id: selectedDosya.id })
        setIsEditing(false)
        alert('Dosya başarıyla güncellendi.')
      }
    } catch (error) {
      console.error(error)
      alert('Kaydetme hatası!')
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    if (confirm('Bu dosyayı silmek istediğinize emin misiniz?')) {
      await deleteDosya(id)
      if (activeDosyaId === id) setActiveDosyaId(null)
    }
  }

  const filteredDosyalar = dosyalar.filter(
    (d) =>
      d.konu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.temin_no?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const procurementTypes = [
    { value: 'mal', label: 'Mal Alımı', icon: Package, desc: 'Malzeme, araç-gereç veya tüketim ürünleri.' },
    { value: 'hizmet', label: 'Hizmet Alımı', icon: Wrench, desc: 'Bakım, danışmanlık, temizlik vb. hizmetler.' },
    { value: 'yapim_isi', label: 'Yapım İşi', icon: Building, desc: 'İnşaat, tadilat, onarım ve altyapı işleri.' }
  ]

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* SOL: LİSTE (Master) */}
      {!isWindowMode && (
        <div className="w-full lg:w-1/3 lg:min-w-[320px] lg:max-w-[400px] h-[300px] lg:h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Dosyalar
            </h2>
            <button
              onClick={handleStartCreate}
              className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
              title="Yeni Dosya Ekle"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Dosya no veya konu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-655 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {isLoadingDosyalar ? (
            <div className="p-4 text-center text-sm text-slate-500">Yükleniyor...</div>
          ) : filteredDosyalar.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              {searchQuery ? 'Aranan kriterde dosya bulunamadı.' : 'Henüz doğrudan temin dosyası tanımlanmamış.'}
              {!searchQuery && (
                <button
                  onClick={handleStartCreate}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  Yeni Dosya Tanımla
                </button>
              )}
            </div>
          ) : (
            filteredDosyalar.map((dosya) => (
              <button
                key={dosya.id}
                onClick={() => {
                  setActiveDosyaId(dosya.id)
                  setIsCreating(false)
                  setIsEditing(false)
                }}
                className={cn(
                  'w-full flex items-start justify-between p-3 rounded-xl transition-all text-left border group',
                  activeDosyaId === dosya.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-800'
                )}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400 truncate">
                      {dosya.temin_no || 'No Bekliyor'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {dosya.tur === 'mal'
                        ? 'Mal'
                        : dosya.tur === 'hizmet'
                          ? 'Hizmet'
                          : 'Yapım'}
                    </span>
                  </div>
                  <h3
                    className={cn(
                      'text-sm font-semibold truncate',
                      activeDosyaId === dosya.id
                        ? 'text-blue-750 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-200'
                    )}
                  >
                    {dosya.konu}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(dosya.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-center h-full gap-2">
                  <ChevronRight
                    className={cn(
                      'w-5 h-5 shrink-0 transition-colors',
                      activeDosyaId === dosya.id
                        ? 'text-blue-500'
                        : 'text-slate-350 group-hover:text-slate-400'
                    )}
                  />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      )}

      {/* SAĞ: DETAY VEYA DÜZENLEME FORMU (Detail) */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden relative min-h-[500px]">
        {isCreating || isEditing ? (
          /* FORMU GÖSTER (CREATE / EDIT MODE) */
          <form onSubmit={handleSaveForm} className="flex-1 flex flex-col justify-between p-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Edit className="w-5 h-5 text-blue-600" />
                    {isCreating ? 'Yeni Doğrudan Temin Tanımlama' : 'Dosya Detaylarını Düzenle'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Doğrudan temin dosyasının resmi bilgilerini ve bütçe kodunu bu alandan tanımlayın.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="p-1.5 text-slate-450 hover:text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                    Temin / Dosya Konusu *
                  </label>
                  <Input
                    required
                    value={formKonu}
                    onChange={(e) => setFormKonu(e.target.value)}
                    placeholder="Alımın konusunu açıklayıcı şekilde girin (Örn: Fen İşleri Kırtasiye Alımı)"
                    className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 py-2 h-10 w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                    Kurum Temin Numarası
                  </label>
                  <Input
                    value={formTeminNo}
                    onChange={(e) => setFormTeminNo(e.target.value)}
                    placeholder="Örn: 2026/DT-005"
                    className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 py-2 h-10 w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                    Yaklaşık Maliyet (KDV Hariç ₺)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formYaklasikMaliyet}
                    onChange={(e) => setFormYaklasikMaliyet(e.target.value)}
                    placeholder="Örn: 145000.00"
                    className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 py-2 h-10 w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                    Bütçe Kodu / Harcama Tertibi
                  </label>
                  <Input
                    value={formButceKodu}
                    onChange={(e) => setFormButceKodu(e.target.value)}
                    placeholder="Örn: 01.3.9.00-5-03.2.1.01"
                    className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 py-2 h-10 w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                    Fonksiyonel Kod (ABS)
                  </label>
                  <select
                    value={formFonksiyonelKod}
                    onChange={(e) => setFormFonksiyonelKod(e.target.value)}
                    title="Fonksiyonel Kod Seçin"
                    className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2.5 px-3 h-10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seçilmedi</option>
                    {FONKSIYONEL_KODLAR.map((f) => (
                      <option key={f.kod} value={f.kod}>
                        {f.kod} — {f.aciklama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                    Ekonomik Kod (ABS)
                  </label>
                  <select
                    value={formEkonomikKod}
                    onChange={(e) => setFormEkonomikKod(e.target.value)}
                    title="Ekonomik Kod Seçin"
                    className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2.5 px-3 h-10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seçilmedi</option>
                    {EKONOMIK_KODLAR.map((e) => (
                      <option key={e.kod} value={e.kod}>
                        {e.kod} — {e.aciklama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ALIM TÜRÜ SEÇİM KARTLARI */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450">
                    Alım / İhale Türü
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {procurementTypes.map((type) => {
                      const Icon = type.icon
                      const isSelected = formTur === type.value
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormTur(type.value)}
                          className={cn(
                            'p-3 border rounded-xl flex flex-col items-start text-left transition-all relative cursor-pointer',
                            isSelected
                              ? 'border-blue-600 bg-blue-50/20 dark:border-blue-800 dark:bg-blue-900/10'
                              : 'border-slate-200 hover:border-slate-350 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20'
                          )}
                        >
                          <div className={cn(
                            'p-1.5 rounded-lg mb-2 flex items-center justify-center shrink-0',
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">{type.label}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-450 leading-normal">{type.desc}</span>
                          {isSelected && (
                            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                    Notlar & Açıklama
                  </label>
                  <textarea
                    rows={4}
                    value={formNotlar}
                    onChange={(e) => setFormNotlar(e.target.value)}
                    placeholder="Dosya ile ilgili önemli notlar veya ek açıklamalar..."
                    className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-850 dark:text-white leading-normal resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 mt-6">
              <Button
                type="button"
                onClick={handleCancel}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl py-2 px-5 text-sm font-semibold transition-all"
              >
                İptal Et
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-6 text-sm font-semibold transition-all shadow-md shadow-blue-500/10 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Dosyayı Kaydet
              </Button>
            </div>
          </form>
        ) : !selectedDosya ? (
          /* DOSYA SEÇİLMEDİ GÖRÜNÜMÜ */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-20 h-20 bg-slate-50/50 dark:bg-slate-800/30 rounded-full flex items-center justify-center mb-6 border border-slate-100/50 dark:border-slate-800/30">
              <FileText className="w-10 h-10 text-slate-350 dark:text-slate-655" />
            </div>
            <h3 className="text-xl font-bold text-slate-655 dark:text-slate-300 mb-2">
              Doğrudan Temin Dosyası Seçilmedi
            </h3>
            <p className="max-w-md text-xs leading-relaxed text-slate-500 mb-6">
              İşlem yapmak, belgelerini düzenlemek veya detaylarını görmek istediğiniz dosyayı sol taraftaki listeden seçin ya da hemen yeni bir dosya oluşturun.
            </p>
            <Button
              onClick={handleStartCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-6 text-sm font-semibold transition-all shadow-md shadow-blue-500/10 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Yeni Dosya Tanımla
            </Button>
          </div>
        ) : (
          /* SEÇİLİ DOSYA DETAY GÖRÜNÜMÜ (READ-ONLY) */
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide uppercase border border-blue-100/30 dark:border-blue-900/20">
                      AŞAMA {selectedDosya.durum_asama_id || 1}
                    </span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedDosya.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-850 dark:text-white mb-2 leading-tight">
                    {selectedDosya.konu}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Temin No: {selectedDosya.temin_no || 'Belirlenmedi'}</span>
                    <span>•</span>
                    <span className="font-semibold uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 rounded">
                      {selectedDosya.tur === 'mal' ? 'Mal Alımı' : selectedDosya.tur === 'hizmet' ? 'Hizmet Alımı' : 'Yapım İşi'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  {!isWindowMode && (
                    <button
                      onClick={handleOpenInNewWindow}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Bu dosyayı yeni bağımsız pencerede aç"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Yeni Pencerede Aç
                    </button>
                  )}
                  <button
                    onClick={handleStartEdit}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" /> Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(selectedDosya.id)}
                    className="px-4 py-2 border border-red-200 dark:border-red-950/20 hover:bg-red-50 dark:hover:bg-red-955/10 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Sil
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
                    Temel Bilgiler
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5 block">
                        Yaklaşık Maliyet (KDV Hariç)
                      </label>
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        ₺{' '}
                        {selectedDosya.yaklasik_maliyet.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5 block">
                        Bütçe Kodu / Harcama Tertibi
                      </label>
                      <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-450 bg-blue-50/30 dark:bg-blue-900/10 px-2.5 py-1.5 rounded-lg border border-blue-100/10 dark:border-blue-900/10 inline-block">
                        {selectedDosya.butce_kodu || 'Tanımlanmadı'}
                      </div>
                    </div>
                    {selectedDosya.fonksiyonel_kod && (
                      <div>
                        <label className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5 block">
                          Fonksiyonel Kod (ABS)
                        </label>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                          <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded mr-1.5">{selectedDosya.fonksiyonel_kod}</span>
                          {FONKSIYONEL_KODLAR.find(f => f.kod === selectedDosya.fonksiyonel_kod)?.aciklama}
                        </div>
                      </div>
                    )}
                    {selectedDosya.ekonomik_kod && (
                      <div>
                        <label className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-0.5 block">
                          Ekonomik Kod (ABS)
                        </label>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                          <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded mr-1.5">{selectedDosya.ekonomik_kod}</span>
                          {EKONOMIK_KODLAR.find(e => e.kod === selectedDosya.ekonomik_kod)?.aciklama}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                      İş Akışı Durum & Aşama
                    </h4>
                    <p className="text-xs text-slate-550 dark:text-slate-400 leading-normal">
                      Bu temin dosyasının onay formları, teklif mektupları ve iş akış adımları yakında bu panel üzerinden dinamik olarak yönetilecektir.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-450">
                    <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span>Aktif Takip Modu</span>
                  </div>
                </div>

                {selectedDosya.notlar && (
                  <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                      Özel Notlar & Açıklama
                    </h4>
                    <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                      {selectedDosya.notlar}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 flex justify-between items-center text-xs text-slate-450 font-medium">
              <span>Sistem Benzersiz Kimliği (UUID): #{selectedDosya.id}</span>
              <span>Son Güncelleme: {new Date(selectedDosya.created_at).toLocaleTimeString('tr-TR')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

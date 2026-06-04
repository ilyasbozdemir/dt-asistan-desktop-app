import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Save,
  FileText,
  Building2,
  DollarSign,
  User,
  HelpCircle,
  Copy,
  Search,
  Sparkles,
  Loader2,
  ChevronRight
} from 'lucide-react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useDosyalarHooks, TeminDosyasi } from './dosyalar.hooks'
import { useTabStore } from '../../store/tabStore'
import { cn } from '../../utils/cn'
import { AIFormFillModal, AIFilledValues } from '../../components/ui/AIFormFillModal'
import { AITextGeneratorModal } from '../../components/ui/AITextGeneratorModal'

interface DBBirim {
  id: number
  birim_adi: string
  antet_ek_satir?: string
  sunum_makami?: string
  ihtiyac_yeri_eki?: string
  kurumsal_kod?: string
}

interface DBPersonel {
  id: number
  ad_soyad: string
  unvan?: string
  birim?: string
  harcama_yetkilisi_mi?: number
}

interface DBKodSozlugu {
  id: number
  tur: string
  kod: string
  aciklama?: string
}

export default function YeniDosyaScreen(): React.JSX.Element {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const { dosyalar, addDosya, updateDosya } = useDosyalarHooks()
  const { updateTabLabel } = useTabStore()

  const [showKonuSuggestions, setShowKonuSuggestions] = useState(false)

  // Get query params
  const searchParams = new URLSearchParams(window.location.search)
  const editIdStr = searchParams.get('id')
  const editId = editIdStr ? parseInt(editIdStr, 10) : null
  const isEdit = editId !== null && !isNaN(editId)

  // Title & Tab title
  useEffect(() => {
    document.title = isEdit ? 'İhale Dosyası Düzenle - DT' : 'Yeni İhale Dosyası Ekle - DT'
    const currentHref = routerState.location.href
    updateTabLabel(currentHref, isEdit ? 'DT Dosyasını Düzenle' : 'Yeni DT Dosyası Ekle')
  }, [isEdit, routerState.location.href, updateTabLabel])

  // DB Collections state
  const [birimler, setBirimler] = useState<DBBirim[]>([])
  const [personeller, setPersoneller] = useState<DBPersonel[]>([])
  const [kodSozlugu, setKodSozlugu] = useState<DBKodSozlugu[]>([])
  const [loadingDb, setLoadingDb] = useState(true)

  // Form State
  const [formData, setFormData] = useState<Partial<TeminDosyasi>>({
    temin_no: '',
    dosya_acilis_tarihi: new Date().toISOString().split('T')[0],
    butce_yili: new Date().getFullYear(),
    butce_tipi: 'Genel Bütçe',
    konu: '',
    isin_aciklamasi: '',
    birim_id: null,
    antet_ek_satir: '',
    sunulacak_makam: '',
    ihtiyac_yeri: '',
    kurumsal_kod: '',
    fonksiyonel_kod: '',
    muhasebe_birimi: '',
    harcama_birimi: '',
    finansman_kodu: '1',
    ekonomik_kod: '',
    talep_tarihi: '',
    talep_sayisi: '',
    ihale_tipi: 'Doğrudan Temin',
    tur: 'mal',
    ihale_sekli: '22/d*',
    teklif_sozlesme_turu: 'Birim Fiyat',
    alt_yuklenici_olacak_mi: 0,
    kismi_teklif_verilecek_mi: 0,
    fiyat_farki_dayanagi: '',
    yatirim_proje_no: '',
    avans_verilecek_mi: 0,
    yaklasik_maliyet_hesaplamasi: '',
    kdv: '20',
    hesaplama_esasi: '',
    komisyon_takdiri: '',
    tibbi_cihaz_alimi_mi: 0,
    irtibat_yetkilisi_id: null,
    son_teklif_verme_tarihi: '',
    teslim_tarihi: '',
    yaklasik_maliyet: 0,
    butce_kodu: '',
    notlar: ''
  })

  // Load Database values
  useEffect(() => {
    async function loadData() {
      setLoadingDb(true)
      try {
        const resBirim = await window.electron.ipcRenderer.invoke('db:query', 'SELECT * FROM TANIM_Birim WHERE aktif_mi = 1')
        const resPers = await window.electron.ipcRenderer.invoke('db:query', 'SELECT * FROM TANIM_Personel WHERE aktif_mi = 1')
        const resKod = await window.electron.ipcRenderer.invoke('db:query', 'SELECT * FROM TANIM_KodSozlugu WHERE aktif_mi = 1')
        
        if (resBirim.success) setBirimler(resBirim.data)
        if (resPers.success) setPersoneller(resPers.data)
        if (resKod.success) setKodSozlugu(resKod.data)

        // Load existing document if in Edit Mode
        if (isEdit) {
          const resDoc = await window.electron.ipcRenderer.invoke(
            'db:query',
            'SELECT * FROM DATA_TeminDosyasi WHERE id = ?',
            [editId]
          )
          if (resDoc.success && resDoc.data.length > 0) {
            const doc = resDoc.data[0]
            // Format dates for html input tags
            const formatForInput = (val: any) => {
              if (!val) return ''
              return val.includes('T') ? val.split('T')[0] : val
            }
            setFormData({
              ...doc,
              dosya_acilis_tarihi: formatForInput(doc.dosya_acilis_tarihi),
              talep_tarihi: formatForInput(doc.talep_tarihi),
              son_teklif_verme_tarihi: doc.son_teklif_verme_tarihi ? doc.son_teklif_verme_tarihi.replace(' ', 'T') : '',
              teslim_tarihi: formatForInput(doc.teslim_tarihi)
            })
          }
        }
      } catch (err) {
        console.error('Veritabanı yüklenirken hata oluştu:', err)
      } finally {
        setLoadingDb(false)
      }
    }
    loadData()
  }, [isEdit, editId])

  // Active Tab
  const [activeTab, setActiveTab] = useState<'genel' | 'mali' | 'ihale' | 'sorumlular'>('genel')

  // Search states for custom select/autocomplete dropdowns
  const [showBirimSearch, setShowBirimSearch] = useState(false)
  const [birimSearchQuery, setBirimSearchQuery] = useState('')
  const [showPersonelSearch, setShowPersonelSearch] = useState<'irtibat' | 'hazirlayan' | 'onay' | null>(null)
  const [personelSearchQuery, setPersonelSearchQuery] = useState('')

  // Filtered lists
  const filteredBirimler = birimler.filter(b => 
    b.birim_adi.toLowerCase().includes(birimSearchQuery.toLowerCase())
  )

  const filteredPersoneller = personeller.filter(p => 
    p.ad_soyad.toLowerCase().includes(personelSearchQuery.toLowerCase()) || 
    (p.unvan || '').toLowerCase().includes(personelSearchQuery.toLowerCase())
  )

  // Copy Konu (İşin Adı) to Açıklama
  const handleCopyKonuToAciklama = () => {
    setFormData(prev => ({
      ...prev,
      isin_aciklamasi: prev.konu
    }))
  }

  // AI Description Generator (single field)
  const [isAiGeneratingDesc, setIsAiGeneratingDesc] = useState(false)

  // AI Form Fill Modal
  const [showAIModal, setShowAIModal] = useState(false)

  // Reusable AI Text Generator Modal
  const [textGenConfig, setTextGenConfig] = useState<{
    isOpen: boolean
    title: string
    fieldName: string
    targetField: keyof TeminDosyasi
    systemInstruction?: string
  }>({
    isOpen: false,
    title: '',
    fieldName: '',
    targetField: 'isin_aciklamasi'
  })

  const openTextGenerator = (targetField: keyof TeminDosyasi, title: string, fieldName: string, systemInstruction?: string) => {
    setTextGenConfig({
      isOpen: true,
      title,
      fieldName,
      targetField,
      systemInstruction
    })
  }

  const getAIFormContext = () => {
    const selectedBirim = birimler.find(b => b.id === formData.birim_id)
    return {
      formTitle: 'Yeni Doğrudan Temin İhale Dosyası',
      kurumBilgisi: {
        birimAdi: selectedBirim?.birim_adi,
        sunulacakMakam: formData.sunulacak_makam || selectedBirim?.sunum_makami,
        antetEkSatir: formData.antet_ek_satir || selectedBirim?.antet_ek_satir,
        ihtiyacYeri: formData.ihtiyac_yeri || selectedBirim?.ihtiyac_yeri_eki,
        kurumAdi: selectedBirim?.birim_adi
      },
      mevcutDegerler: {
        konu: formData.konu,
        temin_no: formData.temin_no,
        sunulacak_makam: formData.sunulacak_makam,
        birim: selectedBirim?.birim_adi,
        butce_yili: formData.butce_yili
      },
      doldurulacakAlanlar: [
        { alan: 'konu', etiket: 'İhale / Dosya Konusu', tip: 'text' as const, zorunlu: true, ornekDeger: 'Fen İşleri Kırtasiye Malzemesi Alımı' },
        { alan: 'isin_aciklamasi', etiket: 'İşin Açıklaması / Kapsamı', tip: 'textarea' as const },
        { alan: 'temin_no', etiket: 'Doğrudan Temin Numarası', tip: 'text' as const, ornekDeger: '2026/DT-001' },
        { alan: 'sunulacak_makam', etiket: 'Evrakın Sunulacağı Makam', tip: 'text' as const, ornekDeger: 'BAŞKANLIK MAKAMINA' },
        { alan: 'ihtiyac_yeri', etiket: 'İhtiyaç Yeri', tip: 'text' as const },
        { alan: 'antet_ek_satir', etiket: 'İdari Antet Ek Satır', tip: 'text' as const },
        { alan: 'yaklasik_maliyet', etiket: 'Yaklaşık Maliyet (₺)', tip: 'number' as const },
        { alan: 'komisyon_takdiri', etiket: 'Komisyon Takdir Yazısı', tip: 'text' as const },
        { alan: 'hesaplama_esasi', etiket: 'Hesaplama Esası', tip: 'text' as const }
      ]
    }
  }

  const handleAIApply = (values: AIFilledValues) => {
    setFormData(prev => ({
      ...prev,
      ...(values.konu !== undefined && { konu: String(values.konu) }),
      ...(values.isin_aciklamasi !== undefined && { isin_aciklamasi: String(values.isin_aciklamasi) }),
      ...(values.temin_no !== undefined && { temin_no: String(values.temin_no) }),
      ...(values.sunulacak_makam !== undefined && { sunulacak_makam: String(values.sunulacak_makam) }),
      ...(values.ihtiyac_yeri !== undefined && { ihtiyac_yeri: String(values.ihtiyac_yeri) }),
      ...(values.antet_ek_satir !== undefined && { antet_ek_satir: String(values.antet_ek_satir) }),
      ...(values.yaklasik_maliyet !== undefined && { yaklasik_maliyet: Number(values.yaklasik_maliyet) }),
      ...(values.komisyon_takdiri !== undefined && { komisyon_takdiri: String(values.komisyon_takdiri) }),
      ...(values.hesaplama_esasi !== undefined && { hesaplama_esasi: String(values.hesaplama_esasi) })
    }))
  }
  const handleAiDescGenerate = () => {
    openTextGenerator(
      'isin_aciklamasi',
      'İşin Açıklamasını Üret',
      'İşin Açıklaması',
      `Şu ihale konusu için resmi ve profesyonel bir "İşin Kapsamı ve Tanımı" metni oluştur. İhale/İş Adı: "${formData.konu || ''}". Metin kurumsal bir dilde olmalı, gereksiz yorum içermemeli ve doğrudan idari şartname açıklaması formatında olmalı. Eğer metinde ihale makamı vb. geçecekse yer tutucu olarak köşeli parantez ([KURUM ADI] vb.) kullan, gerçek isim verme.`
    )
  }

  const handleAiKomisyonGenerate = () => {
    openTextGenerator(
      'komisyon_takdiri',
      'Komisyon Takdiri Metni Üret',
      'Komisyon Takdiri',
      `Kamu ihale doğrudan temin süreci için komisyon karar takdiri veya görevlendirme yazısı metni oluştur. İhale/İş Adı: "${formData.konu || ''}". Resmi ve hukuki bir dil kullan.`
    )
  }

  // Handle Birim Selection and autofill antet fields
  const handleSelectBirim = (birim: any) => {
    setFormData(prev => ({
      ...prev,
      birim_id: birim.id,
      antet_ek_satir: birim.antet_ek_satir || prev.antet_ek_satir,
      sunulacak_makam: birim.sunum_makami || prev.sunulacak_makam,
      ihtiyac_yeri: birim.ihtiyac_yeri_eki || prev.ihtiyac_yeri,
      kurumsal_kod: birim.kurumsal_kod || prev.kurumsal_kod
    }))
    setShowBirimSearch(false)
    setBirimSearchQuery('')
  }

  // Handle Form Submission
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.konu?.trim()) {
      alert('Lütfen dosya konusunu (İşin Adı) giriniz.')
      return
    }

    const normalizeTr = (s: string) => s.trim().toLocaleLowerCase('tr-TR')
    const targetKonu = normalizeTr(formData.konu || '')
    const matches = dosyalar.filter(d => normalizeTr(d.konu) === targetKonu && (!isEdit || d.id !== editId))
    let nextTekrarNo = 1
    if (matches.length > 0) {
      const maxNo = Math.max(...matches.map(d => d.tekrar_no || 1))
      nextTekrarNo = maxNo + 1
    }

    const payload = {
      ...formData,
      tekrar_no: nextTekrarNo
    }

    try {
      if (isEdit) {
        await updateDosya({ ...payload, id: editId! })
        alert('İhale dosyası başarıyla güncellendi.')
      } else {
        await addDosya(payload)
        alert('Yeni ihale dosyası başarıyla eklendi.')
      }
      navigate({ to: '/dosyalar' })
    } catch (error) {
      console.error(error)
      alert('Kaydetme sırasında bir hata oluştu: ' + (error as Error).message)
    }
  }

  // Descriptions for Ihale Sekli (22/d*, 22/d**)
  const getIhaleSekliExplanation = (sekil: string | null | undefined) => {
    switch (sekil) {
      case '22/d*':
        return 'Büyükşehir belediyesi sınırları içindeki doğrudan temin limiti.'
      case '22/d**':
        return 'Diğer belediyeler ve idareler için doğrudan temin limiti.'
      case '22/a':
        return 'İhtiyacın sadece gerçek veya tüzel tek kişi tarafından karşılanabilmesi.'
      case '22/b':
        return 'Özel bir hakka sahip gerçek veya tüzel tek kişinin olması.'
      case '22/c':
        return 'Mevcut mal, ekipman, teknoloji veya hizmetlerle uyumun sağlanması için yapılacak alımlar.'
      default:
        return 'Doğrudan temin mevzuat maddesi.'
    }
  }

  // Turkish lowercase normalization helper
  const normalizeTr = (str: string) => (str || '').trim().toLocaleLowerCase('tr-TR')

  // Collect unique previous subjects
  const uniqueKonular = Array.from(new Set(dosyalar.map(d => d.konu).filter(Boolean)))
  const matchedSuggestions = formData.konu
    ? uniqueKonular.filter(k => 
        normalizeTr(k).includes(normalizeTr(formData.konu || '')) &&
        normalizeTr(k) !== normalizeTr(formData.konu || '')
      ).slice(0, 5)
    : []

  const exactMatchCount = formData.konu
    ? dosyalar.filter(d => 
        normalizeTr(d.konu) === normalizeTr(formData.konu || '') && 
        (!isEdit || d.id !== editId)
      ).length
    : 0

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* HEADER */}
      <div className="flex-none p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dosyalar"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <FileText className="text-blue-600" size={24} />
              {isEdit ? 'İhale Dosyası Detaylarını Düzenle' : 'Yeni Doğrudan Temin İhale Dosyası'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tüm idari, mali, hukuki ve komisyon alanlarını bu panel üzerinden yönetin.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* AI Asistan Butonu */}
          <button
            type="button"
            onClick={() => setShowAIModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={14} />
            AI Asistan
          </button>
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  temin_no: '2026/DT-084',
                  dosya_acilis_tarihi: '2026-06-03',
                  butce_yili: 2026,
                  butce_tipi: 'Genel Bütçe',
                  konu: 'Park Bahçeler Müdürlüğü Elektrik Kablosu ve Aydınlatma Armatürü Alımı',
                  isin_aciklamasi: 'X Belediyesi Park Bahçeler Müdürlüğü tarafından yeşil alanlar ve çocuk oyun parklarının aydınlatılmasında kullanılmak üzere elektrik kablosu ve aydınlatma armatürü alımı işi.',
                  birim_id: birimler[0]?.id || null,
                  antet_ek_satir: 'Fen İşleri Dairesi Başkanlığı',
                  sunulacak_makam: 'BAŞKANLIK MAKAMINA',
                  ihtiyac_yeri: 'X Belediyesi Merkez Şantiyesi',
                  kurumsal_kod: '30.11.01.22',
                  fonksiyonel_kod: '01.3.9.00',
                  muhasebe_birimi: '30.06.01',
                  harcama_birimi: '30.11.01',
                  finansman_kodu: '5',
                  ekonomik_kod: '03.2.1.01',
                  butce_kodu: '46.30.11.23-01.3.9.00-5-03.2.1.01',
                  talep_tarihi: '2026-06-03',
                  talep_sayisi: 'E-2026-456',
                  ihale_tipi: 'Doğrudan Temin',
                  tur: 'mal',
                  ihale_sekli: '22/d*',
                  teklif_sozlesme_turu: 'Birim Fiyat',
                  alt_yuklenici_olacak_mi: 0,
                  kismi_teklif_verilecek_mi: 0,
                  fiyat_farki_dayanagi: '',
                  yatirim_proje_no: '',
                  avans_verilecek_mi: 0,
                  yaklasik_maliyet_hesaplamasi: 'Piyasa Fiyat Araştırması',
                  kdv: '20',
                  hesaplama_esasi: '',
                  komisyon_takdiri: 'GÜNEY YURT BELEDİYE BAŞKANLIĞI ONAYI',
                  tibbi_cihaz_alimi_mi: 0,
                  irtibat_yetkilisi_id: personeller[0]?.id || null,
                  onay_personel_id: personeller.find(p => p.harcama_yetkilisi_mi === 1)?.id || personeller[1]?.id || null,
                  hazirlayan_personel_id: personeller[0]?.id || null,
                  son_teklif_verme_tarihi: '2026-06-10T14:00',
                  teslim_tarihi: '2026-06-30',
                  yaklasik_maliyet: 145005
                })
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-605 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Test Verisi Doldur
            </button>
          )}
          <Link
            to="/dosyalar"
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            İptal
          </Link>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} />
            {isEdit ? 'Dosyayı Güncelle' : 'Dosyayı Kaydet'}
          </button>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-2 overflow-x-auto scrollbar-none flex gap-2">
        <button
          onClick={() => setActiveTab('genel')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer flex items-center gap-2',
            activeTab === 'genel'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          )}
        >
          <FileText size={14} />
          Genel Bilgiler & Antet
        </button>
        <button
          onClick={() => setActiveTab('mali')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer flex items-center gap-2',
            activeTab === 'mali'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          )}
        >
          <DollarSign size={14} />
          Bütçe & Muhasebe Kodları
        </button>
        <button
          onClick={() => setActiveTab('ihale')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer flex items-center gap-2',
            activeTab === 'ihale'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          )}
        >
          <Building2 size={14} />
          İhale, Teklif & Hesaplama
        </button>
        <button
          onClick={() => setActiveTab('sorumlular')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer flex items-center gap-2',
            activeTab === 'sorumlular'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          )}
        >
          <User size={14} />
          Sorumlular, Tarih & Komisyon
        </button>
      </div>

      {/* FORM BODY */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <form onSubmit={handleSave} className="max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          
          {loadingDb ? (
            <div className="p-8 text-center text-sm text-slate-500 italic">Bilgiler yükleniyor...</div>
          ) : (
            <>
              {/* TAB 1: GENEL BİLGİLER */}
              {activeTab === 'genel' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <FileText className="text-blue-500 w-5 h-5" />
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Genel Bilgiler & İdari Antet Yapısı</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 relative">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        İhale / Dosya Konusu (İşin Adı) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.konu || ''}
                        onChange={e => {
                          setFormData({ ...formData, konu: e.target.value })
                          setShowKonuSuggestions(true)
                        }}
                        onFocus={() => setShowKonuSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => setShowKonuSuggestions(false), 200)
                        }}
                        placeholder="Alımın konusunu resmi dilde açıklayıcı şekilde girin (Örn: Fen İşleri Kırtasiye Malzemesi Alımı)"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                      />
                      {exactMatchCount > 0 && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1.5 flex items-center gap-1 animate-in fade-in duration-200">
                          ⚠️ Bu isimde daha önce {exactMatchCount} adet dosya açılmış. Kaydedildiğinde otomatik olarak &quot;({exactMatchCount + 1})&quot; son eki eklenecektir.
                        </p>
                      )}
                      {showKonuSuggestions && matchedSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/50 text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            Önceki İhale Konuları
                          </div>
                          <ul className="max-h-48 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                            {matchedSuggestions.map((suggestion, index) => (
                              <li key={index}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, konu: suggestion }))
                                    setShowKonuSuggestions(false)
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent"
                                >
                                  <FileText className="text-slate-400 w-3.5 h-3.5" />
                                  <span>{suggestion}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-455">
                          İşin Açıklaması / Kapsamı
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleAiDescGenerate}
                            disabled={isAiGeneratingDesc}
                            title="İşin adına göre yapay zeka ile profesyonel açıklama metni oluştur"
                            className="text-[10px] text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded disabled:opacity-50"
                          >
                            {isAiGeneratingDesc ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                            AI ile Üret
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyKonuToAciklama}
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/10 px-2 py-1 rounded"
                          >
                            <Copy size={11} />
                            İşin Adını Kopyala
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={3}
                        value={formData.isin_aciklamasi || ''}
                        onChange={e => setFormData({ ...formData, isin_aciklamasi: e.target.value })}
                        placeholder="İşin detaylı açıklaması veya şartnamedeki kapsam açıklaması..."
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-white leading-normal resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        Doğrudan Temin Numarası
                      </label>
                      <input
                        type="text"
                        value={formData.temin_no || ''}
                        onChange={e => setFormData({ ...formData, temin_no: e.target.value })}
                        placeholder="Örn: 2026/DT-001 (Opsiyonel)"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                     <div className="md:col-span-2">
                       <div className="flex items-center justify-between mb-1.5">
                         <label className="block text-xs font-bold text-slate-600 dark:text-slate-455">
                           Komisyon Karar Takdiri
                         </label>
                         <button
                           type="button"
                           onClick={handleAiKomisyonGenerate}
                           className="text-[10px] text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded"
                         >
                           <Sparkles size={11} />
                           AI ile Üret
                         </button>
                       </div>
                       <input
                         type="text"
                         value={formData.komisyon_takdiri || ''}
                         onChange={e => setFormData({ ...formData, komisyon_takdiri: e.target.value })}
                         placeholder="Resmi kurul kararı veya yetki belgesi referansı..."
                         className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                       />
                     </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        Dosya Açılış Tarihi
                      </label>
                      <input
                        type="date"
                        value={formData.dosya_acilis_tarihi || ''}
                        onChange={e => setFormData({ ...formData, dosya_acilis_tarihi: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        İhalesi Yapılacak Birim / Müdürlük
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowBirimSearch(!showBirimSearch)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 hover:bg-slate-100/50 text-left"
                        >
                          <span>
                            {formData.birim_id
                              ? birimler.find(b => b.id === formData.birim_id)?.birim_adi
                              : 'Birim Seçiniz...'}
                          </span>
                          <Search size={14} className="text-slate-400" />
                        </button>

                        {showBirimSearch && (
                          <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                            <input
                              type="text"
                              placeholder="Birim ara..."
                              value={birimSearchQuery}
                              onChange={e => setBirimSearchQuery(e.target.value)}
                              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                              autoFocus
                            />
                            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5">
                              {filteredBirimler.length === 0 ? (
                                <div className="p-3 text-center text-xs text-slate-450">Birim bulunamadı.</div>
                              ) : (
                                filteredBirimler.map(b => (
                                  <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => handleSelectBirim(b)}
                                    className={cn(
                                      'w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors',
                                      formData.birim_id === b.id && 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 font-bold'
                                    )}
                                  >
                                    {b.birim_adi}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Birim seçildiğinde antet, sunum makamı ve bütçe kodları otomatik doldurulur.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        İdari Antet Ek Satır
                      </label>
                      <input
                        type="text"
                        value={formData.antet_ek_satir || ''}
                        onChange={e => setFormData({ ...formData, antet_ek_satir: e.target.value })}
                        placeholder="Örn: Fen İşleri Dairesi Başkanlığı"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        Evrakın Sunulacağı Makam
                      </label>
                      <input
                        type="text"
                        value={formData.sunulacak_makam || ''}
                        onChange={e => setFormData({ ...formData, sunulacak_makam: e.target.value })}
                        placeholder="Örn: BAŞKANLIK MAKAMINA veya MÜDÜRLÜK MAKAMINA"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        İhtiyaç Yeri (Lüzum Birimi)
                      </label>
                      <input
                        type="text"
                        value={formData.ihtiyac_yeri || ''}
                        onChange={e => setFormData({ ...formData, ihtiyac_yeri: e.target.value })}
                        placeholder="Örn: Fen İşleri Şantiyesi"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MALİ & BÜTÇE KODLARI */}
              {activeTab === 'mali' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <DollarSign className="text-emerald-500 w-5 h-5" />
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Mali Analiz & Bütçe Harcama Kodları</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                        Bütçe Yılı
                      </label>
                      <input
                        type="number"
                        value={formData.butce_yili || new Date().getFullYear()}
                        onChange={e => setFormData({ ...formData, butce_yili: parseInt(e.target.value, 10) })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                        Bütçe Tipi
                      </label>
                      <select
                        value={formData.butce_tipi || 'Genel Bütçe'}
                        onChange={e => setFormData({ ...formData, butce_tipi: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      >
                        <option value="Genel Bütçe">Genel Bütçe</option>
                        <option value="Döner Sermaye">Döner Sermaye</option>
                        <option value="Özel Bütçe">Özel Bütçe</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                        Finansman Kodu
                      </label>
                      <input
                        type="text"
                        value={formData.finansman_kodu || ''}
                        onChange={e => setFormData({ ...formData, finansman_kodu: e.target.value })}
                        placeholder="Örn: 2, 5 veya 8"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                        Bütçe Kodu / Harcama Tertibi
                      </label>
                      <input
                        type="text"
                        value={formData.butce_kodu || ''}
                        onChange={e => setFormData({ ...formData, butce_kodu: e.target.value })}
                        placeholder="Örn: 46.30.11.23-01.3.9.00-5-03.2.1.01"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850 dark:text-slate-200 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Mevzuat ve Sistem Parametreleri</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                          Kurumsal Kod (Düzey 1-2-3-4)
                        </label>
                        <select
                          value={formData.kurumsal_kod || ''}
                          onChange={e => setFormData({ ...formData, kurumsal_kod: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 focus:outline-none text-slate-800 dark:text-slate-200"
                        >
                          <option value="">Seçiniz...</option>
                          {kodSozlugu.filter(k => k.tur === 'kurumsal').map(k => (
                            <option key={k.id} value={k.kod}>{k.kod} - {k.aciklama}</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">Eksik kodları <Link to="/mevzuat" className="text-blue-600 underline font-semibold">Mevzuat & Kodlar</Link> ekranından ekleyebilirsiniz.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                          Fonksiyonel Kod (Düzey 1-2-3-4)
                        </label>
                        <select
                          value={formData.fonksiyonel_kod || ''}
                          onChange={e => setFormData({ ...formData, fonksiyonel_kod: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 focus:outline-none text-slate-800 dark:text-slate-200"
                        >
                          <option value="">Seçiniz...</option>
                          {kodSozlugu.filter(k => k.tur === 'fonksiyonel').map(k => (
                            <option key={k.id} value={k.kod}>{k.kod} - {k.aciklama}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                          Muhasebe Birimi (Birim Kodu & Adı)
                        </label>
                        <select
                          value={formData.muhasebe_birimi || ''}
                          onChange={e => setFormData({ ...formData, muhasebe_birimi: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 focus:outline-none text-slate-800 dark:text-slate-200"
                        >
                          <option value="">Seçiniz...</option>
                          {kodSozlugu.filter(k => k.tur === 'muhasebe_birimi').map(k => (
                            <option key={k.id} value={k.kod}>{k.kod} - {k.aciklama}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                          Harcama Birimi (Birim Kodu & Adı)
                        </label>
                        <select
                          value={formData.harcama_birimi || ''}
                          onChange={e => setFormData({ ...formData, harcama_birimi: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 focus:outline-none text-slate-800 dark:text-slate-200"
                        >
                          <option value="">Seçiniz...</option>
                          {kodSozlugu.filter(k => k.tur === 'harcama_birimi').map(k => (
                            <option key={k.id} value={k.kod}>{k.kod} - {k.aciklama}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: İHALE, TEKLİF & HESAPLAMA */}
              {activeTab === 'ihale' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <Building2 className="text-indigo-500 w-5 h-5" />
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">İhale Koşulları, Teklif ve Finansal Detaylar</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        İhale Tipi
                      </label>
                      <input
                        type="text"
                        disabled
                        value={formData.ihale_tipi || 'Doğrudan Temin'}
                        className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        Alım / İhale Türü
                      </label>
                      <select
                        value={formData.tur || 'mal'}
                        onChange={e => setFormData({ ...formData, tur: e.target.value })}
                        title="Alım / İhale Türü"
                        className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      >
                        <option value="mal">Mal Alımı</option>
                        <option value="hizmet">Hizmet Alımı</option>
                        <option value="yapim_isi">Yapım İşi</option>
                        <option value="danismanlik">Danışmanlık Alımı</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5 flex items-center gap-1">
                        Doğrudan Temin Maddesi (İhale Şekli)
                        <span title={getIhaleSekliExplanation(formData.ihale_sekli)}>
                          <HelpCircle size={13} className="text-slate-450 cursor-help" />
                        </span>
                      </label>
                      <select
                        title="Doğrudan Temin Maddesi Seçin"
                        value={formData.ihale_sekli || '22/d*'}
                        onChange={e => setFormData({ ...formData, ihale_sekli: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      >
                        <option value="22/d*">22/d* (Büyükşehir)</option>
                        <option value="22/d**">22/d** (Diğer İdareler)</option>
                        <option value="22/a">22/a (Tek Yetkili)</option>
                        <option value="22/b">22/b (Özel Hak)</option>
                        <option value="22/c">22/c (Uyum Alımı)</option>
                      </select>
                      <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 leading-normal">
                        {getIhaleSekliExplanation(formData.ihale_sekli)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        Teklif / Sözleşme Türü
                      </label>
                      <select
                        value={formData.teklif_sozlesme_turu || 'Birim Fiyat'}
                        onChange={e => setFormData({ ...formData, teklif_sozlesme_turu: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      >
                        <option value="Birim Fiyat">Birim Fiyatlı Teklif</option>
                        <option value="Götürü Bedel">Götürü Bedel Teklif</option>
                        <option value="Sözleşmesiz">Sözleşme Yapılmayacak</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        KDV Oranı (%)
                      </label>
                      <select
                        value={formData.kdv || '20'}
                        onChange={e => setFormData({ ...formData, kdv: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      >
                        <option value="0">KDV Hariç (%0)</option>
                        <option value="1">KDV (%1)</option>
                        <option value="10">KDV (%10)</option>
                        <option value="20">KDV (%20)</option>
                        <option value="Tevkifat">Tevkifatlı KDV</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        Tahmini Yaklaşık Maliyet (KDV Hariç ₺)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.yaklasik_maliyet || 0}
                        onChange={e => setFormData({ ...formData, yaklasik_maliyet: parseFloat(e.target.value) || 0 })}
                        placeholder="₺ 0.00"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                        Fiyat Farkı Dayanağı (Varsa)
                      </label>
                      <input
                        type="text"
                        value={formData.fiyat_farki_dayanagi || ''}
                        onChange={e => setFormData({ ...formData, fiyat_farki_dayanagi: e.target.value })}
                        placeholder="Örn: 2026/123 Fiyat Farkı Kararnamesi"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                        Yatırım Proje Numarası
                      </label>
                      <input
                        type="text"
                        value={formData.yatirim_proje_no || ''}
                        onChange={e => setFormData({ ...formData, yatirim_proje_no: e.target.value })}
                        placeholder="Örn: 2026-03-Y-12"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                        Yaklaşık Maliyet Hesaplama Esası
                      </label>
                      <input
                        type="text"
                        value={formData.yaklasik_maliyet_hesaplamasi || ''}
                        onChange={e => setFormData({ ...formData, yaklasik_maliyet_hesaplamasi: e.target.value })}
                        placeholder="Örn: Piyasa Fiyat Araştırması"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-55 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="alt_yuklenici"
                        checked={formData.alt_yuklenici_olacak_mi === 1}
                        onChange={e => setFormData({ ...formData, alt_yuklenici_olacak_mi: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="alt_yuklenici" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Alt Yüklenici Olabilir
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="kismi_teklif"
                        checked={formData.kismi_teklif_verilecek_mi === 1}
                        onChange={e => setFormData({ ...formData, kismi_teklif_verilecek_mi: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="kismi_teklif" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Kısmi Teklife Açık
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="avans"
                        checked={formData.avans_verilecek_mi === 1}
                        onChange={e => setFormData({ ...formData, avans_verilecek_mi: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="avans" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Avans Ödemesi Var
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="tibbi_cihaz"
                        checked={formData.tibbi_cihaz_alimi_mi === 1}
                        onChange={e => setFormData({ ...formData, tibbi_cihaz_alimi_mi: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 text-blue-600 border-slate-350 dark:border-slate-800 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="tibbi_cihaz" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Tıbbi Cihaz Alımı
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SORUMLULAR, TARİH & KOMİSYON */}
              {activeTab === 'sorumlular' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <User className="text-purple-500 w-5 h-5" />
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Yetkililer, Süreç Tarihleri ve İdari Kayıtlar</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* İRTİBAT YETKİLİSİ AUTOCOMPLETE */}
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        İrtibat Yetkilisi (Personel)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPersonelSearch(showPersonelSearch === 'irtibat' ? null : 'irtibat')}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left"
                      >
                        <span>
                          {formData.irtibat_yetkilisi_id
                            ? personeller.find(p => p.id === formData.irtibat_yetkilisi_id)?.ad_soyad
                            : 'İrtibat Personeli Seçin...'}
                        </span>
                        <Search size={14} className="text-slate-400" />
                      </button>

                      {showPersonelSearch === 'irtibat' && (
                        <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                          <input
                            type="text"
                            placeholder="Personel ara..."
                            value={personelSearchQuery}
                            onChange={e => setPersonelSearchQuery(e.target.value)}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                            autoFocus
                          />
                          <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                            {filteredPersoneller.length === 0 ? (
                              <div className="p-3 text-center text-xs text-slate-450">Personel bulunamadı.</div>
                            ) : (
                              filteredPersoneller.map(p => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, irtibat_yetkilisi_id: p.id }))
                                    setShowPersonelSearch(null)
                                    setPersonelSearchQuery('')
                                  }}
                                  className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                >
                                  {p.ad_soyad} - <span className="text-[10px] text-slate-400">{p.unvan || 'Unvansız'}</span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* HAZIRLAYAN PERSONEL */}
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                        Dosyayı Hazırlayan Personel
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPersonelSearch(showPersonelSearch === 'hazirlayan' ? null : 'hazirlayan')}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left"
                      >
                        <span>
                          {formData.hazirlayan_personel_id
                            ? personeller.find(p => p.id === formData.hazirlayan_personel_id)?.ad_soyad
                            : 'Hazırlayan Seçin...'}
                        </span>
                        <Search size={14} className="text-slate-400" />
                      </button>

                      {showPersonelSearch === 'hazirlayan' && (
                        <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
                          <input
                            type="text"
                            placeholder="Personel ara..."
                            value={personelSearchQuery}
                            onChange={e => setPersonelSearchQuery(e.target.value)}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                            autoFocus
                          />
                          <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                            {filteredPersoneller.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, hazirlayan_personel_id: p.id }))
                                  setShowPersonelSearch(null)
                                  setPersonelSearchQuery('')
                                }}
                                className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                              >
                                {p.ad_soyad}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* HARCAMA YETKİLİSİ (ONAY VEREN) */}
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                        Harcama Yetkilisi (Onaylayan)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPersonelSearch(showPersonelSearch === 'onay' ? null : 'onay')}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left"
                      >
                        <span>
                          {formData.onay_personel_id
                            ? personeller.find(p => p.id === formData.onay_personel_id)?.ad_soyad
                            : 'Harcama Yetkilisi Seçin...'}
                        </span>
                        <Search size={14} className="text-slate-400" />
                      </button>

                      {showPersonelSearch === 'onay' && (
                        <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
                          <input
                            type="text"
                            placeholder="Personel ara..."
                            value={personelSearchQuery}
                            onChange={e => setPersonelSearchQuery(e.target.value)}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                            autoFocus
                          />
                          <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                            {filteredPersoneller.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, onay_personel_id: p.id }))
                                  setShowPersonelSearch(null)
                                  setPersonelSearchQuery('')
                                }}
                                className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                              >
                                {p.ad_soyad} {p.harcama_yetkilisi_mi === 1 && '⭐'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        Talep Tarihi
                      </label>
                      <input
                        type="date"
                        value={formData.talep_tarihi || ''}
                        onChange={e => setFormData({ ...formData, talep_tarihi: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
                        Talep Sayısı (Evrak No)
                      </label>
                      <input
                        type="text"
                        value={formData.talep_sayisi || ''}
                        onChange={e => setFormData({ ...formData, talep_sayisi: e.target.value })}
                        placeholder="Örn: E-12345"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                        Son Teklif Verme Tarih &amp; Saati
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.son_teklif_verme_tarihi || ''}
                        onChange={e => setFormData({ ...formData, son_teklif_verme_tarihi: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                        Tahmini İşi Bitiş / Teslim Tarihi
                      </label>
                      <input
                        type="date"
                        value={formData.teslim_tarihi || ''}
                        onChange={e => setFormData({ ...formData, teslim_tarihi: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
                        Komisyon Karar Takdiri
                      </label>
                      <input
                        type="text"
                        value={formData.komisyon_takdiri || ''}
                        onChange={e => setFormData({ ...formData, komisyon_takdiri: e.target.value })}
                        placeholder="Resmi kurul kararı veya yetki belgesi referansı..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB CONTINUATION ACTION BUTTONS */}
          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-5 mt-6">
            <div className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">
              {isEdit ? `Dosya ID: #${editId}` : 'Yeni Kayıt Yapılıyor'}
            </div>
            
            <div className="flex gap-3">
              {activeTab !== 'genel' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'mali') setActiveTab('genel')
                    if (activeTab === 'ihale') setActiveTab('mali')
                    if (activeTab === 'sorumlular') setActiveTab('ihale')
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Geri Git
                </button>
              )}

              {activeTab !== 'sorumlular' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'genel') setActiveTab('mali')
                    else if (activeTab === 'mali') setActiveTab('ihale')
                    else if (activeTab === 'ihale') setActiveTab('sorumlular')
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  Sonraki Adım
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* AI Form Fill Modal */}
      <AIFormFillModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        context={getAIFormContext()}
        onApply={handleAIApply}
      />

      {/* AI Text Generator Modal */}
      <AITextGeneratorModal
        isOpen={textGenConfig.isOpen}
        onClose={() => setTextGenConfig(prev => ({ ...prev, isOpen: false }))}
        title={textGenConfig.title}
        fieldName={textGenConfig.fieldName}
        initialSubject={formData.konu}
        systemInstruction={textGenConfig.systemInstruction}
        onApply={(text) => {
          setFormData(prev => ({
            ...prev,
            [textGenConfig.targetField]: text
          }))
        }}
      />
    </div>
  )
}

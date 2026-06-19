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
  ChevronRight,
  ChevronDown,
  Bot,
  Loader2,
  Info
} from 'lucide-react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useDosyalarHooks, TeminDosyasi } from './dosyalar.hooks'
import { useTabStore } from '../../store/tabStore'
import { useSettingsStore } from '../../store/settingsStore'
import { cn } from '../../utils/cn'
import { AIFormFillModal, AIFilledValues } from '../../components/ui/AIFormFillModal'
import { AITextGeneratorModal } from '../../components/ui/AITextGeneratorModal'
import { logActivity } from '../../utils/logger'
import { EskiDosyaKopyalaModal } from './components/EskiDosyaKopyalaModal'
import { useKikLimitDonemleri } from '../system/kik-limitleri.hooks'

interface DBBirim {
  id: number
  birim_adi: string
  antet_ek_satir?: string
  sunum_makami?: string
  ihtiyac_yeri_eki?: string
  e_butce?: string
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
  const { institutionName, limitType } = useSettingsStore()
  const { donemTanimsizMi } = useKikLimitDonemleri()

  const [isDescLoading, setIsDescLoading] = useState(false)
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
    e_butce: '',
    fonksiyonel_kod: '',
    muhasebe_birimi: '',
    harcama_birimi: '',
    finansman_kodu: '1',
    ekonomik_kod: '',
    talep_tarihi: '',
    talep_sayisi: '',
    ihale_tipi: 'Doğrudan Temin',
    tur: 'mal',
    ihale_sekli: limitType === 'buyuksehir' ? '22/d*' : '22/d**',
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

  // Otomatik Temin Numarası (DT2026/01) Oluşturma
  useEffect(() => {
    if (!isEdit && !formData.temin_no && !loadingDb) {
      const year = new Date().getFullYear()
      const yearStr = year.toString()
      
      const yearDosyalar = dosyalar.filter(d => 
        d.temin_no && d.temin_no.startsWith(`DT${yearStr}/`)
      )
      
      let maxSeq = 0
      yearDosyalar.forEach(d => {
        const no = d.temin_no!
        let seqStr = no.split('/')[1]
        
        if (seqStr) {
          const seq = parseInt(seqStr, 10)
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq
          }
        }
      })
      
      const nextSeq = String(maxSeq + 1).padStart(2, '0')
      setFormData(prev => ({
        ...prev,
        temin_no: `DT${yearStr}/${nextSeq}`
      }))
    }
  }, [isEdit, formData.temin_no, loadingDb, dosyalar])

  // Active Tab (Stepper)
  const [activeTab, setActiveTab] = useState<'genel' | 'ihtiyac' | 'teknik'>('genel')

  // Kopyalama (Şablon) State
  const [showKopyalaModal, setShowKopyalaModal] = useState(false)

  const handleCopyDosya = (eskiDosya: TeminDosyasi) => {
    setFormData({
      ...formData,
      // %80 dolu gelsin (kalemler hariç)
      konu: eskiDosya.konu,
      isin_aciklamasi: eskiDosya.isin_aciklamasi,
      birim_id: eskiDosya.birim_id,
      antet_ek_satir: eskiDosya.antet_ek_satir,
      sunulacak_makam: eskiDosya.sunulacak_makam,
      ihtiyac_yeri: eskiDosya.ihtiyac_yeri,
      e_butce: eskiDosya.e_butce,
      fonksiyonel_kod: eskiDosya.fonksiyonel_kod,
      muhasebe_birimi: eskiDosya.muhasebe_birimi,
      harcama_birimi: eskiDosya.harcama_birimi,
      finansman_kodu: eskiDosya.finansman_kodu,
      ekonomik_kod: eskiDosya.ekonomik_kod,
      ihale_tipi: eskiDosya.ihale_tipi,
      tur: eskiDosya.tur,
      // ihale_sekli: eskiDosya.ihale_sekli, // Kopya yerine ayarlardan geleni koruyalım (isteğe bağlı)
      ihale_sekli: eskiDosya.ihale_sekli,
      teklif_sozlesme_turu: eskiDosya.teklif_sozlesme_turu,
      alt_yuklenici_olacak_mi: eskiDosya.alt_yuklenici_olacak_mi,
      kismi_teklif_verilecek_mi: eskiDosya.kismi_teklif_verilecek_mi,
      fiyat_farki_dayanagi: eskiDosya.fiyat_farki_dayanagi,
      yatirim_proje_no: eskiDosya.yatirim_proje_no,
      avans_verilecek_mi: eskiDosya.avans_verilecek_mi,
      yaklasik_maliyet_hesaplamasi: eskiDosya.yaklasik_maliyet_hesaplamasi,
      kdv: eskiDosya.kdv,
      hesaplama_esasi: eskiDosya.hesaplama_esasi,
      komisyon_takdiri: eskiDosya.komisyon_takdiri,
      tibbi_cihaz_alimi_mi: eskiDosya.tibbi_cihaz_alimi_mi,
      yaklasik_maliyet: eskiDosya.yaklasik_maliyet,
      butce_kodu: eskiDosya.butce_kodu,
      irtibat_yetkilisi_id: eskiDosya.irtibat_yetkilisi_id,
      hazirlayan_personel_id: eskiDosya.hazirlayan_personel_id,
      onay_personel_id: eskiDosya.onay_personel_id,
      notlar: eskiDosya.notlar,

      // Sıfırlanan / Güncellenen alanlar
      temin_no: '',
      dosya_acilis_tarihi: new Date().toISOString().split('T')[0],
      talep_tarihi: new Date().toISOString().split('T')[0],
      talep_sayisi: '',
      son_teklif_verme_tarihi: '',
      teslim_tarihi: ''
    })
    setShowKopyalaModal(false)
    alert(`"${eskiDosya.konu}" başlıklı dosyadan veriler başarıyla kopyalandı. Lütfen yeni dosya numarasını ve tarihlerini kontrol edin.`)
  }

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


  // AI Form Fill Modal
  const [showAIModal, setShowAIModal] = useState(false)
  const [showAiMenu, setShowAiMenu] = useState(false)


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

  // AI Kalem Asistanı State
  const [aiKalemConfig, setAiKalemConfig] = useState<{
    isOpen: boolean
  }>({ isOpen: false })

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
        kurumAdi: institutionName !== 'Kurum Adı Bulunamadı' ? institutionName : 'Kurum'
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
        { alan: 'dosya_acilis_tarihi', etiket: 'Dosya Açılış Tarihi', tip: 'date' as const },
        { alan: 'butce_yili', etiket: 'Bütçe Yılı', tip: 'number' as const },
        { alan: 'butce_tipi', etiket: 'Bütçe Tipi', tip: 'text' as const },
        { alan: 'sunulacak_makam', etiket: 'Evrakın Sunulacağı Makam', tip: 'text' as const, ornekDeger: 'BAŞKANLIK MAKAMINA' },
        { alan: 'ihtiyac_yeri', etiket: 'İhtiyaç Yeri', tip: 'text' as const },
        { alan: 'antet_ek_satir', etiket: 'Antet Ek Satır', tip: 'text' as const },
        { alan: 'e_butce', etiket: 'e-Bütçe Kodu', tip: 'text' as const },
        { alan: 'fonksiyonel_kod', etiket: 'Fonksiyonel Kod', tip: 'text' as const },
        { alan: 'muhasebe_birimi', etiket: 'Muhasebe Birimi Kodu', tip: 'text' as const },
        { alan: 'harcama_birimi', etiket: 'Harcama Birimi Kodu', tip: 'text' as const },
        { alan: 'finansman_kodu', etiket: 'Finansman Kodu', tip: 'text' as const },
        { alan: 'ekonomik_kod', etiket: 'Ekonomik Kod', tip: 'text' as const },
        { alan: 'talep_tarihi', etiket: 'Talep Tarihi', tip: 'date' as const },
        { alan: 'talep_sayisi', etiket: 'Talep Sayısı', tip: 'text' as const },
        { alan: 'ihale_tipi', etiket: 'İhale Tipi', tip: 'text' as const },
        { alan: 'tur', etiket: 'Tür (mal/hizmet/yapim/danismanlik)', tip: 'text' as const },
        { alan: 'ihale_sekli', etiket: 'İhale Şekli (22/d* vb.)', tip: 'text' as const },
        { alan: 'teklif_sozlesme_turu', etiket: 'Teklif/Sözleşme Türü', tip: 'text' as const },
        { alan: 'alt_yuklenici_olacak_mi', etiket: 'Alt Yüklenici (0/1)', tip: 'number' as const },
        { alan: 'kismi_teklif_verilecek_mi', etiket: 'Kısmi Teklif (0/1)', tip: 'number' as const },
        { alan: 'fiyat_farki_dayanagi', etiket: 'Fiyat Farkı Dayanağı', tip: 'text' as const },
        { alan: 'yatirim_proje_no', etiket: 'Yatırım Proje No', tip: 'text' as const },
        { alan: 'avans_verilecek_mi', etiket: 'Avans Verilecek (0/1)', tip: 'number' as const },
        { alan: 'yaklasik_maliyet_hesaplamasi', etiket: 'Yaklaşık Maliyet Hesaplama Yöntemi', tip: 'text' as const },
        { alan: 'kdv', etiket: 'KDV Oranı (%)', tip: 'text' as const },
        { alan: 'hesaplama_esasi', etiket: 'Hesaplama Esası', tip: 'text' as const },
        { alan: 'komisyon_takdiri', etiket: 'Komisyon Takdir Yazısı', tip: 'text' as const },
        { alan: 'tibbi_cihaz_alimi_mi', etiket: 'Tıbbi Cihaz Alımı (0/1)', tip: 'number' as const },
        { alan: 'son_teklif_verme_tarihi', etiket: 'Son Teklif Verme Tarihi', tip: 'date' as const },
        { alan: 'teslim_tarihi', etiket: 'Teslim Tarihi', tip: 'date' as const },
        { alan: 'yaklasik_maliyet', etiket: 'Yaklaşık Maliyet (₺)', tip: 'number' as const },
        { alan: 'butce_kodu', etiket: 'Bütçe Kodu', tip: 'text' as const },
        { alan: 'temin_tarihi', etiket: 'Temin Tarihi', tip: 'date' as const },
        { alan: 'notlar', etiket: 'Notlar', tip: 'textarea' as const }
      ]
    }
  }

  const handleAIApply = (values: AIFilledValues) => {
    // Dynamically map all fields from the returned AI JSON into formData.
    // Parse numeric fields properly if they come as string and are defined in TeminDosyasi as numbers.
    const numericFields = ['butce_yili', 'yaklasik_maliyet', 'alt_yuklenici_olacak_mi', 'kismi_teklif_verilecek_mi', 'avans_verilecek_mi', 'tibbi_cihaz_alimi_mi'];
    
    setFormData(prev => {
      const updated: any = { ...prev };
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          if (numericFields.includes(key)) {
            updated[key] = Number(values[key]) || 0;
          } else {
            updated[key] = String(values[key]);
          }
        }
      });
      return updated;
    });
  }
  const handleAiDescGenerate = async () => {
    if (!formData.konu?.trim()) {
      alert('Lütfen önce dosya konusunu (İşin Adı) giriniz.')
      return
    }
    
    setIsDescLoading(true)
    try {
      const prompt = `Şu kamu alım işi/ihalesi için sadece 1-2 cümlelik, çok kısa ve öz bir "İşin Kapsamı ve Tanımı" metni oluştur. İhale/İş Adı: "${formData.konu}". Metin kurumsal bir dilde olmalı, ancak ASLA başlık (örn: 1. İşin konusu vb.), madde imi veya uzun paragraflar KULLANMA. İdare adını anonim olarak "İdaremiz" veya "Kurumumuz" şeklinde belirt, gerçek isim verme. Sadece doğrudan açıklamayı düz metin olarak ver.`
      
      const res = await window.api.aiGenerate({ prompt, enableDatabaseAccess: false })
      if (res.success && res.data) {
        setFormData(prev => ({ ...prev, isin_aciklamasi: res.data?.trim() || '' }))
      } else {
        alert('Yapay zeka yanıt üretemedi: ' + (res.error || 'Bilinmeyen hata'))
      }
    } catch (err: any) {
      alert('Bir hata oluştu: ' + err.message)
    } finally {
      setIsDescLoading(false)
    }
  }

  const handleAiFormValidation = () => {
    const dataStr = JSON.stringify(formData, null, 2)
    openTextGenerator(
      'notlar',
      'AI Form Tutarsızlık Kontrolü',
      'Form Analiz Sonucu (İsterseniz Notlara Ekleyebilirsiniz)',
      `Sen bir Kamu İhale ve Muhasebe Uzmanısın. Kullanıcı bir Doğrudan Temin ihale dosyası oluşturuyor ancak kaydetmeden önce sana kontrol ettirmek istedi.\n\nAşağıdaki form verilerini ihale mevzuatı (özellikle 22/d vb.), muhasebe kuralları (fonksiyonel kod, ekonomik kod uyumu) ve mantıksal tutarlılık açısından incele:\n\n${dataStr}\n\nEğer KDV, bütçe, ihale şekli, teslim tarihi gibi alanlarda bir hata, eksiklik veya mevzuata aykırılık görüyorsan kullanıcıyı uyar. Her şey normalse tebrik et.`
    )
  }



  const handleAiFullFormGenerate = () => {
    setShowAIModal(true)
  }

  // Handle Birim Selection and autofill antet fields
  const handleSelectBirim = (birim: any) => {
    setFormData(prev => ({
      ...prev,
      birim_id: birim.id,
      antet_ek_satir: birim.antet_ek_satir || prev.antet_ek_satir,
      sunulacak_makam: birim.sunum_makami || prev.sunulacak_makam,
      ihtiyac_yeri: birim.ihtiyac_yeri_eki || prev.ihtiyac_yeri,
      e_butce: birim.e_butce || prev.e_butce
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
    let baseKonu = formData.konu?.trim() || ''
    
    // Eğer konu sonunda zaten (2) gibi bir ifade varsa, sadece asıl konuyu alalım
    const baseMatch = baseKonu.match(/^(.*?)\s*\(\d+\)$/)
    if (baseMatch) {
      baseKonu = baseMatch[1].trim()
    }
    
    const targetKonu = normalizeTr(baseKonu)
    
    // Aynı ismin türevlerini kullanan diğer dosyaları bul
    const matches = dosyalar.filter(d => {
      if (isEdit && d.id === editId) return false
      const dBase = (d.konu || '').trim().replace(/\s*\(\d+\)$/, '').trim()
      return normalizeTr(dBase) === targetKonu
    })
    
    let finalKonu = formData.konu?.trim() || ''
    let nextTekrarNo = 1
    
    if (matches.length > 0 && !isEdit) {
      const maxNo = Math.max(...matches.map(d => {
        const m = (d.konu || '').match(/\s*\((\d+)\)$/)
        const textualNo = m ? parseInt(m[1], 10) : 1
        return Math.max(d.tekrar_no || 1, textualNo)
      }))
      nextTekrarNo = maxNo + 1
      finalKonu = `${baseKonu} (${nextTekrarNo})`
    }

    const payload = {
      ...formData,
      konu: finalKonu,
      tekrar_no: nextTekrarNo
    }

    try {
      if (isEdit) {
        await updateDosya({ ...payload, id: editId! })
        await logActivity('Dosya Güncellendi', `${payload.konu || 'İsimsiz'} isimli dosya güncellendi.`, 'info')
        alert('İhale dosyası başarıyla güncellendi.')
      } else {
        await addDosya(payload)
        await logActivity('Yeni Dosya Eklendi', `${payload.konu || 'İsimsiz'} konusuyla yeni bir temin dosyası oluşturuldu.`, 'success')
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

  // Calculate frequencies of previous subjects (Sık Kullanılanlar)
  const konuFrequencies = dosyalar.reduce((acc, d) => {
    if (d.konu) {
      const k = d.konu.trim()
      acc[k] = (acc[k] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Sort by frequency descending
  const sortedKonular = Object.entries(konuFrequencies)
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0])

  const matchedSuggestions = formData.konu
    ? sortedKonular.filter(k => 
        normalizeTr(k).includes(normalizeTr(formData.konu || '')) &&
        normalizeTr(k) !== normalizeTr(formData.konu || '')
      ).slice(0, 8)
    : sortedKonular.slice(0, 8) // Show top 8 frequent items if empty

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
          {/* Eski Dosyadan Kopyala Butonu */}
          {!isEdit && (
            <button
              type="button"
              onClick={() => setShowKopyalaModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              title="Geçmişteki bir alımı seçerek formun %80'ini otomatik doldurun"
            >
              <Copy size={14} />
              Eski Dosyadan Kopyala
            </button>
          )}

          {/* YAPAY ZEKA MENÜSÜ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAiMenu(!showAiMenu)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} />
              Yapay Zeka
              <ChevronDown size={14} className={cn("transition-transform", showAiMenu ? "rotate-180" : "")} />
              <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-white/20 shadow-sm animate-pulse">BETA</span>
            </button>
            
            {showAiMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[100] overflow-hidden flex flex-col py-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAiMenu(false);
                    handleAiFormValidation();
                  }}
                  className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Bot size={14} className="text-teal-500" />
                  Hata ve Tutarsızlık Kontrolü
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setShowAiMenu(false);
                    handleAiFullFormGenerate();
                  }}
                  className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Sparkles size={14} className="text-indigo-500" />
                  Metinden Dosya Üret
                </button>
              </div>
            )}
          </div>

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
                  e_butce: '46.00.00.01',
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
                  komisyon_takdiri: '',
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

      {/* STEPPER UI */}
      <div className="flex-none bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-12 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex justify-between">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full z-0"></div>
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActiveTab('genel')}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all',
                  activeTab === 'genel' || activeTab === 'ihtiyac' || activeTab === 'teknik'
                    ? 'bg-blue-600 border-blue-100 dark:border-blue-900/30 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                )}
              >
                1
              </button>
              <span className={cn('mt-2 text-[11px] font-bold uppercase tracking-wider', activeTab === 'genel' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400')}>Genel Bilgiler</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActiveTab('ihtiyac')}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all',
                  activeTab === 'ihtiyac' || activeTab === 'teknik'
                    ? 'bg-blue-500 border-blue-100 dark:border-blue-900/30 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                )}
              >
                2
              </button>
              <span className={cn('mt-2 text-[11px] font-bold uppercase tracking-wider', activeTab === 'ihtiyac' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400')}>İhtiyaç Listesi</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActiveTab('teknik')}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all',
                  activeTab === 'teknik'
                    ? 'bg-blue-600 border-blue-100 dark:border-blue-900/30 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                )}
              >
                3
              </button>
              <span className={cn('mt-2 text-[11px] font-bold uppercase tracking-wider', activeTab === 'teknik' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400')}>Teknik Şart. & Ekler</span>
            </div>
          </div>
        </div>
      </div>

      {/* FORM BODY */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <form onSubmit={handleSave} className="max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          
          {loadingDb ? (
            <div className="p-8 text-center text-sm text-slate-500 italic">Bilgiler yükleniyor...</div>
          ) : (
            <>
              {donemTanimsizMi(formData.dosya_acilis_tarihi || undefined) && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg">
                      <HelpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-800 dark:text-red-300">Kritik Hata: 22/d Limit Dönemi Bulunamadı!</h3>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        Sistemde, seçtiğiniz "Dosya Açılış Tarihi" ({formData.dosya_acilis_tarihi}) ile eşleşen bir Doğrudan Temin Limit Dönemi bulunamadı. Lütfen <strong>Sistem Ayarları &gt; Mevzuat ve Parametreler</strong> bölümünden ilgili tarihe ait limiti ekleyiniz. Limit olmadan bu dosyaya tahmini bedel kontrolü yapılamaz.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: GENEL BİLGİLER */}
              {activeTab === 'genel' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <FileText className="text-blue-500 w-5 h-5" />
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Genel Bilgiler & İdari Antet Yapısı</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-450">
                          İhale / Dosya Konusu (İşin Adı) *
                        </label>
                        <button
                          type="button"
                          onClick={() => openTextGenerator('konu', 'Konuyu AI ile Üret', 'İhale Konusu', 'Verilen metin veya alım işlemine göre en uygun, resmi ve kısa ihale / doğrudan temin konusunu (İşin Adı) üret. Başka hiçbir açıklama yazma, sadece ihale adını ver.')}
                          className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border-none"
                        >
                          <Sparkles size={11} /> AI ile Üret
                        </button>
                      </div>
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
                          ⚠️ Bu isimde daha önce {exactMatchCount} adet dosya açılmış. Kaydedildiğinde otomatik olarak "({exactMatchCount + 1})" son eki eklenecektir.
                        </p>
                      )}
                      {showKonuSuggestions && matchedSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/50 text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            {formData.konu ? 'Önceki İhale Konuları' : 'Sık Kullanılan İhale Konuları'}
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
                            disabled={isDescLoading}
                            title="İşin adına göre yapay zeka ile profesyonel açıklama metni oluştur"
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded disabled:opacity-50"
                          >
                            {isDescLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                            {isDescLoading ? 'Üretiliyor...' : 'AI ile Üret'}
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

              {/* TAB 2: MALİ & BÜTÇE KODLARI (Artık Genel Bilgilerin devamı) */}
              {activeTab === 'genel' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <DollarSign className="text-blue-500 w-5 h-5" />
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-455">
                          Bütçe Kodu / Harcama Tertibi (Ekonomik Kod)
                        </label>
                        <button
                          type="button"
                          onClick={() => openTextGenerator('butce_kodu', 'Bütçe/Ekonomik Kod Tahmini', 'Bütçe Kodu', 'Alımın konusuna ve türüne göre (Örn: Mal Alımı, Hizmet Alımı) uygun bir kamu maliyesi ekonomik bütçe kodu veya harcama tertibi tahmin et. Sadece kodu yaz. (Örn: 03.2.1.01 veya 46.30.11.23-01.3.9.00-5-03.2.1.01)')}
                          className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border-none"
                        >
                          <Sparkles size={11} /> AI ile Tahmin Et
                        </button>
                      </div>
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
                          value={formData.e_butce || ''}
                          onChange={e => setFormData({ ...formData, e_butce: e.target.value })}
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

              {/* TAB 3: İHALE, TEKLİF & HESAPLAMA (Artık Genel Bilgilerin devamı) */}
              {activeTab === 'genel' && (
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
                        value={formData.ihale_sekli || (limitType === 'buyuksehir' ? '22/d*' : '22/d**')}
                        onChange={e => setFormData({ ...formData, ihale_sekli: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                      >
                        {limitType === 'buyuksehir' ? (
                          <option value="22/d*">22/d* (Büyükşehir)</option>
                        ) : (
                          <option value="22/d**">22/d** (Diğer İdareler)</option>
                        )}
                        <option value="22/a">22/a (Tek Yetkili)</option>
                        <option value="22/b">22/b (Özel Hak)</option>
                        <option value="22/c">22/c (Uyum Alımı)</option>
                      </select>
                      {formData.ihale_sekli?.startsWith('22/d') && (
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-medium bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
                          <Info className="w-3 h-3 inline-block mr-1 mb-0.5" />
                          22/d limiti, kurum ayarlarındaki "Kamu İhale Mevzuatı Limit Tipi" ({limitType === 'buyuksehir' ? 'Büyükşehir' : 'Diğer İdareler'}) ayarına göre otomatik seçilmiştir.
                        </p>
                      )}
                      {!formData.ihale_sekli?.startsWith('22/d') && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 leading-normal">
                          {getIhaleSekliExplanation(formData.ihale_sekli)}
                        </p>
                      )}
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

              {/* TAB 4: SORUMLULAR, TARİH & KOMİSYON (Artık Genel Bilgilerin devamı) */}
              {activeTab === 'genel' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <User className="text-blue-500 w-5 h-5" />
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
                                {p.ad_soyad} {p.harcama_yetkilisi_mi === 1 && '★'}
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


                  </div>
                </div>
              )}
              {/* YENİ ADIM: İHTİYAÇ LİSTESİ */}
              {activeTab === 'ihtiyac' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <FileText className="text-blue-500 w-5 h-5" />
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">İhtiyaç Listesi & Alım Kalemleri</h2>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                      <div>
                        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400">EKAP Uyumlu Kalem Tanımlama</h3>
                        <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">İhale kalemlerinizi (OKAS kodlarıyla) ekleyerek Birim Fiyat Teklif Cetveli oluşturabilirsiniz.</p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button type="button" className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full md:w-auto">
                          Manuel Kalem Ekle
                        </button>
                        <button type="button" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-colors w-full md:w-auto whitespace-nowrap">
                          + OKAS'tan Aktar
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setAiKalemConfig({ isOpen: true })}
                          title="Yapay zeka asistanı halen eğitiliyor. Çıktıları kontrol ediniz."
                          className="relative px-4 py-2 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20 transition-colors w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-1.5"
                        >
                          <Sparkles size={14} /> AI Kalem Bulucu
                          <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-white/20 shadow-sm animate-pulse">BETA</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Empty State */}
                  <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4">
                      <Search className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Henüz Kalem Eklenmedi</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">Doğrudan temin kapsamında alınacak mal, hizmet veya yapım işi kalemlerini buradan ekleyin.</p>
                  </div>

                  {/* Son Alım Fiyat Cetveli */}
                  <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-500" />
                          Son Alım Fiyat Cetveli
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Önceki ihalelerdeki benzer kalemlerin fiyat geçmişi referans amaçlıdır.</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-4 py-3 whitespace-nowrap">Malzeme Adı</th>
                            <th className="px-4 py-3 whitespace-nowrap">Özelliği</th>
                            <th className="px-4 py-3 whitespace-nowrap text-right">Miktarı</th>
                            <th className="px-4 py-3 whitespace-nowrap">Kazanan Firma</th>
                            <th className="px-4 py-3 whitespace-nowrap text-right">Fiyatı</th>
                            <th className="px-4 py-3 whitespace-nowrap text-right">Tarihi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 font-medium">A4 Fotokopi Kağıdı</td>
                            <td className="px-4 py-3 text-slate-500">80 gr, 500'lü Paket</td>
                            <td className="px-4 py-3 text-right">100 Paket</td>
                            <td className="px-4 py-3">Örnek Kırtasiye A.Ş.</td>
                            <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">95,00 ₺</td>
                            <td className="px-4 py-3 text-right text-slate-500">12.05.2026</td>
                          </tr>
                          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 font-medium">Lazer Yazıcı Toneri</td>
                            <td className="px-4 py-3 text-slate-500">Siyah, Orjinal Çipli</td>
                            <td className="px-4 py-3 text-right">20 Adet</td>
                            <td className="px-4 py-3">Bilgi Teknoloji Ltd.</td>
                            <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">1.250,00 ₺</td>
                            <td className="px-4 py-3 text-right text-slate-500">03.04.2026</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* YENİ ADIM: TEKNİK ÖZELLİKLER & EKLER */}
              {activeTab === 'teknik' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <HelpCircle className="text-blue-500 w-5 h-5" />
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Teknik Şartname & Ek Belgeler</h2>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400">EKAP Doküman Kuralları</h3>
                    <ul className="text-xs text-blue-700 dark:text-blue-500 mt-2 space-y-1 list-disc list-inside">
                      <li>Yükleyeceğiniz dosyalar zip veya rar formatında olmalıdır.</li>
                      <li>Virüs taramasından geçirilmiş olmalıdır.</li>
                      <li>Dokümanlar teknik şartname, proforma fatura örneği veya idari belgeleri içerebilir.</li>
                    </ul>
                  </div>

                  {/* File Upload UI */}
                  <div className="py-10 px-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                    <Building2 className="w-8 h-8 text-slate-400 mb-3" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Dosyaları sürükleyip bırakın veya seçin</span>
                    <span className="text-[10px] text-slate-500 mt-1">.zip, .rar, .pdf (Max: 50MB)</span>
                    <button type="button" className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      Gözat
                    </button>
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
                    if (activeTab === 'ihtiyac') setActiveTab('genel')
                    if (activeTab === 'teknik') setActiveTab('ihtiyac')
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Geri Git
                </button>
              )}

              {activeTab !== 'teknik' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'genel') setActiveTab('ihtiyac')
                    else if (activeTab === 'ihtiyac') setActiveTab('teknik')
                  }}
                  className="px-4 py-2 bg-slate-800 dark:bg-slate-100 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  Sonraki Adım
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  {isEdit ? 'Tüm Dosyayı Güncelle' : 'Dosyayı Kaydet ve Bitir'}
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

      {/* AI Kalem Asistanı Modal */}
      <AITextGeneratorModal
        isOpen={aiKalemConfig.isOpen}
        onClose={() => setAiKalemConfig({ isOpen: false })}
        title="Yapay Zeka ile Kalem Tanımlama"
        fieldName="Kalem (OKAS ve Ortak Alımlar Sözlüğü)"
        initialSubject={formData.konu}
        mode="json"
        expectedJsonFormat={'{ "kalemAdi": "Örn: A4 Fotokopi Kağıdı 80gr", "miktari": 50, "birimi": "Paket", "okasKodu": "Örn: 30197630-1" }'}
        systemInstruction={`Sen bir kamu ihale ve doğrudan temin uzmanısın. Kullanıcı bir mal, hizmet veya yapım işi için listeye kalem eklemek istiyor. 
Kullanıcının girdiği genel tanıma ve alımın konusuna (${formData.konu || formData.tur}) bakarak:
1. En uygun, resmi, şartnameye uygun "Kalem Adı"nı belirle.
2. Bu kalem için EKAP sisteminde kullanılan en uygun "OKAS Kodunu" (Ortak Alımlar Sözlüğü CPV kodu) veya Taşınır/Taşınmaz mal kodunu bul. Bulamazsan uygun bir üst kategori OKAS kodu tahmin et.
3. Uygun miktar ve ölçü birimi (Adet, Paket, Kg, Ton, Ay, Gün, m2 vb.) öner.
Yanıtını SADECE JSON formatında ver.`}
        onApply={(data) => {
          console.log('AI Kalem Verisi:', data)
          alert(`Yapay Zeka şu kalemi buldu:\n\nAdı: ${data.kalemAdi}\nOKAS Kodu: ${data.okasKodu}\nMiktar: ${data.miktari} ${data.birimi}\n\nNot: Kalem listesi altyapısı tamamlandığında bu kalem otomatik olarak listeye eklenecektir.`)
        }}
      />

      {/* Eski Dosya Kopyala Modal */}
      <EskiDosyaKopyalaModal
        isOpen={showKopyalaModal}
        onClose={() => setShowKopyalaModal(false)}
        dosyalar={dosyalar}
        onSelect={handleCopyDosya}
      />
    </div>
  )
}

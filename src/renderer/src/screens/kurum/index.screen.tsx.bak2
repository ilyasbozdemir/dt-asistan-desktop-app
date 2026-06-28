import React, { useState, useEffect } from 'react'
import { useAyarlarHooks } from '../ayarlar/ayarlar.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Building2, Save, Upload, MapPin, ImageIcon, Info, X, ExternalLink, Plus, HelpCircle, FileText } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { FINANSMAN_KODLARI } from '../../constants/butce-kodlari'
import { InnerMenu, InnerMenuItem } from '../../components/ui/InnerMenu'
import { useSettingsStore } from '../../store/settingsStore'
import { getSubInstitutionOptions } from '../../utils/kurumHelper'


type TabType = 'idari' | 'iletisim'

export default function KurumScreen(): React.JSX.Element {
  const { settings, isLoadingSettings, saveSettings } = useAyarlarHooks()
  const { loadSettings: reloadSettingsStore } = useSettingsStore()

  const [activeTab, setActiveTab] = useState<TabType>('idari')
  const [saving, setSaving] = useState(false)

  // Tab 1: İdari Bilgiler
  const [kurumAdi, setKurumAdi] = useState('')
  const [institutionLetterhead, setInstitutionLetterhead] = useState<string[]>([''])
  const [recipientTitle, setRecipientTitle] = useState('')
  const [parentInstitution, setParentInstitution] = useState('')
  const [logoLeft, setLogoLeft] = useState('')
  const [logoRight, setLogoRight] = useState('')
  const [institutionLogo, setInstitutionLogo] = useState('')
  const [limitType, setLimitType] = useState('diger')
  const [finansmanKodu, setFinansmanKodu] = useState('5')
  const [institutionType, setInstitutionType] = useState('')
  const [subInstitutionType, setSubInstitutionType] = useState('belediye')
  const [customSubInstitutionLabel, setCustomSubInstitutionLabel] = useState('')
  const [customSubInstitutionKurumumuz, setCustomSubInstitutionKurumumuz] = useState('')
  const [customSubInstitutionKurumunuz, setCustomSubInstitutionKurumunuz] = useState('')
  const [customSubInstitutionKurumu, setCustomSubInstitutionKurumu] = useState('')
  const [customSubInstitutionKurumlari, setCustomSubInstitutionKurumlari] = useState('')


  const handleInstitutionTypeChange = (type: string): void => {
    setInstitutionType(type)
    if (type === 'belediye') {
      setFinansmanKodu('5')
    } else if (type === 'genel_butce') {
      setFinansmanKodu('1')
    } else if (type === 'ozel_butce') {
      setFinansmanKodu('2')
    } else if (type === 'duzenleyici') {
      setFinansmanKodu('3')
    } else if (type === 'sosyal_guvenlik') {
      setFinansmanKodu('4')
    }
  }

  // Yeni Eklenen Mali / Bütçe Kodları
  const [eButceKodu, setEButceKodu] = useState('')
  const [say2000iKodu, setSay2000iKodu] = useState('')
  const [fonksiyonelKod, setFonksiyonelKod] = useState('')
  const [muhasebeBirimKodu, setMuhasebeBirimKodu] = useState('')
  const [muhasebeBirimAdi, setMuhasebeBirimAdi] = useState('')
  const [harcamaBirimKodu, setHarcamaBirimKodu] = useState('')
  const [harcamaBirimAdi, setHarcamaBirimAdi] = useState('')
  const [dtvtKodu, setDtvtKodu] = useState('')
  const [detsisKodu, setDetsisKodu] = useState('')
  const [konuOrtalamaSiniri, setKonuOrtalamaSiniri] = useState('true')

  const [sozlukData, setSozlukData] = useState<{ tur: string; kod: string; aciklama: string }[]>([])

  useEffect(() => {
    // Sözlük verisini çek
    window.electron.ipcRenderer.invoke('db:query', 'SELECT * FROM TANIM_KodSozlugu WHERE aktif_mi = 1')
      .then(res => {
        if (res.success && res.data) {
          setSozlukData(res.data)
        }
      })
      .catch(console.error)
  }, [])

  // Tab 2: İletişim & Konum
  const [address, setAddress] = useState('')
  const [district, setDistrict] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [fax, setFax] = useState('')
  const [instEmail, setInstEmail] = useState('')
  const [kepAddress, setKepAddress] = useState('')
  const [website, setWebsite] = useState('')

  useEffect(() => {
    if (settings) {
      setTimeout(() => {
        setKurumAdi(settings.institutionName || '')
        let parsedLetterhead = ['']
        if (settings.institutionLetterhead) {
          try {
            const parsed = JSON.parse(settings.institutionLetterhead)
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsedLetterhead = parsed
            } else {
              parsedLetterhead = [settings.institutionLetterhead]
            }
          } catch {
            parsedLetterhead = [settings.institutionLetterhead]
          }
        }
        setInstitutionLetterhead(parsedLetterhead)
        setRecipientTitle(settings.recipientTitle || '')
        setParentInstitution(settings.parentInstitution || '')
        setLogoLeft(settings.logoLeft || '')
        setLogoRight(settings.logoRight || '')
        setInstitutionLogo(settings.institutionLogo || '')
        setLimitType(settings.limitType || 'diger')
        setFinansmanKodu(settings.finansmanKodu || '5')
        setInstitutionType(settings.institutionType || '')
        setSubInstitutionType(settings.subInstitutionType || 'belediye')
        setCustomSubInstitutionLabel(settings.customSubInstitutionLabel || '')
        setCustomSubInstitutionKurumumuz(settings.customSubInstitutionKurumumuz || '')
        setCustomSubInstitutionKurumunuz(settings.customSubInstitutionKurumunuz || '')
        setCustomSubInstitutionKurumu(settings.customSubInstitutionKurumu || '')
        setCustomSubInstitutionKurumlari(settings.customSubInstitutionKurumlari || '')


        setAddress(settings.address || '')
        setDistrict(settings.district || '')
        setPostalCode(settings.postalCode || '')
        setCity(settings.city || '')
        setPhone(settings.phone || '')
        setFax(settings.fax || '')
        setInstEmail(settings.institutionEmail || '')
        setKepAddress(settings.kepAddress || '')
        setWebsite(settings.website || '')

        setEButceKodu(settings.eButceKodu || '')
        setSay2000iKodu(settings.say2000iKodu || '')
        setFonksiyonelKod(settings.fonksiyonelKod || '')
        setMuhasebeBirimKodu(settings.muhasebeBirimKodu || '')
        setMuhasebeBirimAdi(settings.muhasebeBirimAdi || '')
        setHarcamaBirimKodu(settings.harcamaBirimKodu || '')
        setHarcamaBirimAdi(settings.harcamaBirimAdi || '')
        setDtvtKodu(settings.dtvtKodu || '')
        setDetsisKodu(settings.detsisKodu || '')
        setKonuOrtalamaSiniri(settings.konuOrtalamaSiniri || 'true')
      }, 0)
    }
  }, [settings])

  // Kurum tipi veya finansman kodu değiştiğinde alt kurum türünü otomatik olarak güncelle
  useEffect(() => {
    const options = getSubInstitutionOptions(institutionType, finansmanKodu)
    if (options.length > 0) {
      const hasValidValue = options.some(opt => opt.value === subInstitutionType)
      if (!hasValidValue) {
        setSubInstitutionType(options[0].value)
      }
    }
  }, [institutionType, finansmanKodu, subInstitutionType])

  const handleSaveTab = async (tab: TabType): Promise<void> => {
    setSaving(true)
    try {
      const dataToSave: Record<string, string> = {}

      if (tab === 'idari') {
        dataToSave.institutionName = kurumAdi
        dataToSave.institutionLetterhead = JSON.stringify(institutionLetterhead.filter(l => l.trim() !== ''))
        dataToSave.recipientTitle = recipientTitle
        dataToSave.parentInstitution = parentInstitution
        dataToSave.logoLeft = logoLeft
        dataToSave.logoRight = logoRight
        dataToSave.institutionLogo = institutionLogo
        dataToSave.limitType = limitType
        dataToSave.finansmanKodu = finansmanKodu
        dataToSave.institutionType = institutionType
        dataToSave.subInstitutionType = subInstitutionType
        dataToSave.customSubInstitutionLabel = customSubInstitutionLabel
        dataToSave.customSubInstitutionKurumumuz = customSubInstitutionKurumumuz
        dataToSave.customSubInstitutionKurumunuz = customSubInstitutionKurumunuz
        dataToSave.customSubInstitutionKurumu = customSubInstitutionKurumu
        dataToSave.customSubInstitutionKurumlari = customSubInstitutionKurumlari
        dataToSave.eButceKodu = eButceKodu
        dataToSave.say2000iKodu = say2000iKodu
        dataToSave.fonksiyonelKod = fonksiyonelKod
        dataToSave.muhasebeBirimKodu = muhasebeBirimKodu
        dataToSave.muhasebeBirimAdi = muhasebeBirimAdi
        dataToSave.harcamaBirimKodu = harcamaBirimKodu
        dataToSave.harcamaBirimAdi = harcamaBirimAdi
        dataToSave.dtvtKodu = dtvtKodu
        dataToSave.detsisKodu = detsisKodu
        dataToSave.konuOrtalamaSiniri = konuOrtalamaSiniri
      } else if (tab === 'iletisim') {
        if (website && instEmail) {
          try {
            let webUrl = website.trim()
            if (!webUrl.startsWith('http://') && !webUrl.startsWith('https://')) {
              webUrl = 'http://' + webUrl
            }
            const webDomain = new URL(webUrl).hostname.replace(/^www\./, '').toLowerCase()
            const emailParts = instEmail.trim().split('@')
            
            if (emailParts.length === 2) {
              const emailDomain = emailParts[1].toLowerCase()
              if (emailDomain !== webDomain) {
                alert(`Kayıt Başarısız!\n\nKurumsal e-posta alan adı (@${emailDomain}) ile web sitesi alan adı (${webDomain}) eşleşmiyor.\nLütfen aynı etki alanına sahip bir e-posta adresi girin veya web sitesi bilgisini boş bırakın.`)
                setSaving(false)
                return
              }
            }
          } catch (e) {
            // Ignore parse errors, let standard HTML validation handle format
          }
        }

        dataToSave.address = address
        dataToSave.district = district
        dataToSave.postalCode = postalCode
        dataToSave.city = city
        dataToSave.phone = phone
        dataToSave.fax = fax
        dataToSave.institutionEmail = instEmail
        dataToSave.kepAddress = kepAddress
        dataToSave.website = website
      }

      await saveSettings(dataToSave)
      await reloadSettingsStore()
      alert('Kurum bilgileri başarıyla kaydedildi.')
    } catch {
      alert('Kaydetme hatası!')
    } finally {
      setSaving(false)
    }
  }

  const menuItems: InnerMenuItem[] = [
    { id: 'idari', label: 'İdari Bilgiler', icon: <Building2 className="w-4 h-4 shrink-0" /> },
    { id: 'iletisim', label: 'İletişim & Konum', icon: <MapPin className="w-4 h-4 shrink-0" /> }
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-200 dark:border-slate-800 pb-4 gap-4 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md z-10 pt-4 -mt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <Building2 className="w-8 h-8 text-blue-600" />
            Kurum Bilgileri
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Resmi evrak çıktılarında ve arayüzde gösterilecek idari ve iletişim bilgilerini yönetin.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => handleSaveTab(activeTab)}
            disabled={saving}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-6 text-sm font-semibold transition-all shadow-md shadow-blue-500/20 shrink-0"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL MENÜ */}
        <InnerMenu
          className="lg:col-span-3"
          items={menuItems}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as TabType)}
        />

        {/* SAĞ PANEL */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col justify-between">
          {isLoadingSettings ? (
            <div className="flex items-center justify-center flex-1 text-slate-500">
              Yükleniyor...
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {/* TAB 1: İDARİ BİLGİLER */}
                {activeTab === 'idari' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                        İdari Kurum Bilgileri
                      </h2>
                      <p className="text-xs text-slate-500">
                        Çıktılarda ve sistem genelinde kullanılan idari başlıklar.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Kurum Adı
                        </label>
                        <Input
                          value={kurumAdi}
                          onChange={(e) => setKurumAdi(e.target.value)}
                          placeholder="Kurum Adı"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                 
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                          Kurum Anteti
                          <span className="text-[9px] font-normal text-slate-400">(Örn: T.C. / X Kurumu / Y Müdürlüğü)</span>
                        </label>
                        <div className="space-y-2">
                          {institutionLetterhead.map((line, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Input
                                value={line}
                                onChange={(e) => {
                                  const newArr = [...institutionLetterhead];
                                  newArr[idx] = e.target.value;
                                  setInstitutionLetterhead(newArr);
                                }}
                                placeholder={`Antet ${idx + 1}. Satır (Örn: ${idx === 0 ? 'T.C.' : idx === 1 ? 'X BELEDİYE BAŞKANLIĞI' : 'Destek Hizmetleri'})`}
                                className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs flex-1"
                              />
                              {institutionLetterhead.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newArr = institutionLetterhead.filter((_, i) => i !== idx);
                                    setInstitutionLetterhead(newArr);
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors shrink-0"
                                  title="Satırı Sil"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setInstitutionLetterhead([...institutionLetterhead, ''])}
                            className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/40 flex items-center gap-1.5 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Yeni Satır Ekle
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Sunulacak Makam Adı (Muhatap)
                        </label>
                        <Input
                          value={recipientTitle}
                          onChange={(e) => setRecipientTitle(e.target.value)}
                          placeholder="Makam Adı"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Bağlı Olduğu Kurum
                        </label>
                        <Input
                          value={parentInstitution}
                          onChange={(e) => setParentInstitution(e.target.value)}
                          placeholder="Üst Kurum Adı"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Kurum Tipi (Bütçeleme ve Limit Şablonu) *
                        </label>
                        <select
                          value={institutionType}
                          onChange={(e) => handleInstitutionTypeChange(e.target.value)}
                          title="Kurum Tipini Seçin"
                          className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2.5 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="" disabled>Lütfen Kurum Tipini Seçin...</option>
                          <option value="belediye">Belediye / Mahalli İdare (Finansman Kaynağı: 5)</option>
                          <option value="genel_butce">Bakanlık / İl-İlçe Müdürlüğü / Genel Bütçe (Finansman Kaynağı: 1)</option>
                          <option value="ozel_butce">Üniversite / Özel Bütçeli İdare (Finansman Kaynağı: 2)</option>
                          <option value="duzenleyici">Düzenleyici ve Denetleyici Kurum (Finansman Kaynağı: 3)</option>
                          <option value="sosyal_guvenlik">SGK / Sosyal Güvenlik Kurumu (Finansman Kaynağı: 4)</option>
                          <option value="diger">Diğer İdareler / Kamu İktisadi Teşebbüsü (Finansman Kaynağı: Kuruma Göre Değişir)</option>
                        </select>
                        {(() => {
                          const options = getSubInstitutionOptions(institutionType, finansmanKodu)
                          if (options.length <= 1) return null
                          
                          return (
                            <div className="mt-3 bg-slate-100/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                                Alt Kurum Türü / Tabiri *
                              </label>
                              <select
                                value={subInstitutionType}
                                onChange={(e) => setSubInstitutionType(e.target.value)}
                                title="Alt Kurum Türünü Seçin"
                                className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2.5 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                {options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>

                              {subInstitutionType === 'diger' && (
                                <div className="mt-4 p-4 bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 rounded-xl space-y-4 shadow-inner">
                                  <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <h4 className="text-[11px] font-bold text-slate-850 dark:text-slate-150 flex items-center gap-1.5">
                                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                                      Özel Alt Kurum Sonekleri (İyelik Halleri)
                                    </h4>
                                    <p className="text-[9px] text-slate-500 mt-0.5">
                                      Kendi tanımladığınız alt kurum tabiri için şablonlarda kullanılacak dilbilgisi eklerini girin.
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Özel Alt Kurum Adı / Tanımı (Örn: Dernek, Oda, Şirket)
                                      </label>
                                      <Input
                                        value={customSubInstitutionLabel}
                                        onChange={(e) => setCustomSubInstitutionLabel(e.target.value)}
                                        placeholder="Örn: Dernek"
                                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                        Bizim (1. Çoğul Şahıs İyelik)
                                        <span className="text-[9px] font-normal text-slate-400">("kurumumuz" yerine)</span>
                                      </label>
                                      <Input
                                        value={customSubInstitutionKurumumuz}
                                        onChange={(e) => setCustomSubInstitutionKurumumuz(e.target.value)}
                                        placeholder="Örn: Derneğimiz"
                                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                        Sizin (2. Çoğul Şahıs İyelik)
                                        <span className="text-[9px] font-normal text-slate-400">("kurumunuz" yerine)</span>
                                      </label>
                                      <Input
                                        value={customSubInstitutionKurumunuz}
                                        onChange={(e) => setCustomSubInstitutionKurumunuz(e.target.value)}
                                        placeholder="Örn: Derneğiniz"
                                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                        Onun (3. Tekil Şahıs İyelik)
                                        <span className="text-[9px] font-normal text-slate-400">("kurumu" yerine)</span>
                                      </label>
                                      <Input
                                        value={customSubInstitutionKurumu}
                                        onChange={(e) => setCustomSubInstitutionKurumu(e.target.value)}
                                        placeholder="Örn: Derneği"
                                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                        Onların (3. Çoğul Şahıs İyelik)
                                        <span className="text-[9px] font-normal text-slate-400">("kurumları" yerine)</span>
                                      </label>
                                      <Input
                                        value={customSubInstitutionKurumlari}
                                        onChange={(e) => setCustomSubInstitutionKurumlari(e.target.value)}
                                        placeholder="Örn: Dernekleri"
                                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed font-medium">
                                💡 Bu seçim, şablonlardaki <strong>{`{{kurumumuz}}`}</strong> etiketinin otomatik ve doğru şekilde doldurulmasını sağlar.
                              </p>
                            </div>
                          )
                        })()}
                        {institutionType === 'belediye' && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 leading-normal font-medium">
                            💡  Kurumsal kodunuzun "46" (Mahalli İdareler) ile başlaması ve bütçe kodlarında "5" Finansman Kaynağı kullanılması tavsiye edilir.
                          </p>
                        )}
                        {institutionType === 'genel_butce' && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 leading-normal font-medium">
                            💡 Kurumsal kodunuzun ilgili Bakanlık koduyla başlaması (örn. Sağlık: 18) ve "1" Finansman Kaynağı kullanılması tavsiye edilir.
                          </p>
                        )}
                        {institutionType === 'ozel_butce' && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 leading-normal font-medium">
                            💡 Yükseköğretim ve üniversite kurumsal kodları genellikle "38" ile başlar ve "2" Finansman Kaynağı kullanılır.
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Kamu İhale Mevzuatı Limit Tipi (K.İ.K 22/d Doğrudan Temin Sınırı)
                        </label>
                        <select
                          value={limitType}
                          onChange={(e) => setLimitType(e.target.value)}
                          title="Limit Tipini Seçin"
                          className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2.5 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="buyuksehir">Büyükşehir Belediyesi Sınırları Dahilinde Bulunan İdareler</option>
                          <option value="diger">Büyükşehir Belediyesi Sınırları Dışında Kalan (Diğer) İdareler</option>
                        </select>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 leading-normal">
                          Bu seçim, doğrudan temin dosyası oluşturulurken tahmini bedel limit aşımı kontrolünü ve Gösterge Paneli bütçe uyarılarını belirler.
                        </p>
                        
                        {limitType === 'buyuksehir' ? (
                          <div className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-900/50 flex items-start gap-1.5 leading-relaxed font-medium">
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              Büyükşehir Belediyesi sınırları içerisinde yer alan Valilikler, Kaymakamlıklar, İlçe Belediyeleri, Üniversiteler ve diğer tüm kamu kurumları bu statüde değerlendirilip <strong>yüksek limite</strong> tabidir.
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-1.5 leading-relaxed font-medium">
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              Büyükşehir statüsü olmayan İller, bunlara bağlı İlçeler, Belde Belediyeleri ve diğer tüm mahalli/genel idareler 4734 Sayılı Kanuna göre "Diğer İdareler" statüsünde olup <strong>standart limite</strong> tabidir.
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Analitik Bütçe Sınıflandırması (ABS) Finansman Kaynağı *
                        </label>
                        <select
                          value={finansmanKodu}
                          onChange={(e) => setFinansmanKodu(e.target.value)}
                          title="Finansman Kodunu Seçin"
                          className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2.5 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {FINANSMAN_KODLARI.map((f) => (
                            <option key={f.kod} value={f.kod}>
                              {f.kod} — {f.aciklama}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                          Mahalli İdareler / Belediyeler için varsayılan olarak 5 (Mahalli İdareler) seçilmelidir. Bu değer resmi ödeme belgelerinde ve kurum bütçeleme çıktılarında sabit bütçe öneki olarak kullanılacaktır.
                        </p>
                      </div>

                      {/* MÜHASEBE VE BÜTÇE KODLARI */}
                      <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-500" />
                            Mali ve Muhasebe Birim Bilgileri
                          </h3>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await window.electron.ipcRenderer.invoke('db:run', `
                                    DELETE FROM TANIM_KodSozlugu 
                                    WHERE id NOT IN (
                                      SELECT MIN(id) 
                                      FROM TANIM_KodSozlugu 
                                      GROUP BY tur, kod, aciklama
                                    )
                                  `)
                                  alert('Tekrar eden kayıtlar başarıyla temizlendi. İşlemin etkili olması için lütfen uygulamayı veya bulunduğunuz ekranı yenileyin.')
                                } catch (err) {
                                  alert('Hata: ' + err)
                                }
                              }}
                              className="text-[11px] font-semibold flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30 px-2 py-1.5 rounded-lg border border-red-100 dark:border-red-800/50 transition-colors"
                            >
                              Tekrar Edenleri Temizle
                            </button>
                            <Link
                              to="/mevzuat"
                              className="text-[11px] font-semibold flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Kod Listelerini Yönet
                            </Link>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                          {/* Yeni Kurumsal Kod Öneki */}
                          <div>
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                              e-Bütçe Kodu Öneki
                              <span title="Kurumunuzun e-Bütçe sistemindeki ön ek kodudur (Örn: 38.xx.xx)"><HelpCircle className="w-3.5 h-3.5 text-blue-500 cursor-help" /></span>
                            </label>
                            <Input
                              value={eButceKodu}
                              onChange={(e) => setEButceKodu(e.target.value)}
                              placeholder="Örn: xx.yy.zz"
                              className="w-full bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                            />
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                              Birim yönetiminde alt birim kodlarının başına eklenecek ana kurum kodu öneki.
                            </p>
                          </div>

                          {/* Eski Kurumsal Kod Öneki */}
                          <div>
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                              Say2000i Kodu Öneki
                              <span title="Maliye Bakanlığı Say2000i sistemindeki ödeme kurumu kodunuz"><HelpCircle className="w-3.5 h-3.5 text-blue-500 cursor-help" /></span>
                            </label>
                            <Input
                              value={say2000iKodu}
                              onChange={(e) => setSay2000iKodu(e.target.value)}
                              placeholder="Örn: XXYY"
                              className="w-full bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                            />
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                              Birim yönetiminde alt birim kodlarının başına eklenecek Say2000i (eski sistem) öneki.
                            </p>
                          </div>

                          {/* DETSİS Kodu */}
                          <div>
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                              DETSİS Kodu
                              <a href={detsisKodu ? `https://detsis.gov.tr/birim/${detsisKodu}/${detsisKodu}/${new Date().toISOString().split('T')[0]}` : "https://www.detsis.gov.tr/"} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 ml-auto" title="Devlet Teşkilatı Merkezi Kayıt Sistemi">
                                DETSİS Sorgula <ExternalLink className="w-3 h-3" />
                              </a>
                            </label>
                            <Input
                              value={detsisKodu}
                              onChange={(e) => {
                                setDetsisKodu(e.target.value)
                                setDtvtKodu(e.target.value)
                              }}
                              placeholder="DETSİS Kodunuzu girin..."
                              className="w-full bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                            />
                            <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-100 dark:border-amber-900/50 flex flex-col gap-1.5 leading-relaxed">
                              {detsisKodu ? (
                                <div className="flex items-center gap-1.5 ml-1">
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  <a href={`https://detsis.gov.tr/birim/${detsisKodu}/${detsisKodu}/${new Date().toISOString().split('T')[0]}`} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-amber-700 dark:hover:text-amber-400">
                                    Kurum Künyesine Git
                                  </a>
                                </div>
                              ) : (
                                <div className="flex items-start gap-1.5">
                                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span>
                                    DTVT sistemi, DETSİS olarak güncellenmiştir. Kodunuzu bilmiyorsanız{' '}
                                    <a href="https://detsis.gov.tr/" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-amber-700 dark:hover:text-amber-400">
                                      DETSİS'te Arama Yapın
                                    </a>.
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Kurumsal Kod */}
                          <div>
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                              Kurumsal Kod (Düzey 1-2-3-4)
                            </label>
                            <select
                              value={fonksiyonelKod}
                              onChange={e => setFonksiyonelKod(e.target.value)}
                              title="Kurumsal Kod Seçin"
                              className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Seçiniz...</option>
                              {sozlukData.filter(d => d.tur === 'fonksiyonel').map(item => (
                                <option key={item.kod} value={item.kod}>
                                  {item.kod} — {item.aciklama}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Muhasebe Birimi */}
                          <div className="md:col-span-2 space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-350">
                              Muhasebe Birimi Bilgileri <span className="text-[10px] font-normal text-slate-400">(EKAP veri aktarımında bu bilgiler eşleştirilir)</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                  Muhasebe Birim Kodu
                                </label>
                              <Input
                                value={muhasebeBirimKodu}
                                onChange={(e) => setMuhasebeBirimKodu(e.target.value)}
                                placeholder="Örn: 38220"
                                className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                              />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                  Muhasebe Birim Adı
                                </label>
                                <Input
                                  value={muhasebeBirimAdi}
                                  onChange={(e) => setMuhasebeBirimAdi(e.target.value)}
                                  placeholder="Muhasebe Birimi Adı"
                                  className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Harcama Birimi */}
                          <div className="md:col-span-2 space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-350">
                              Harcama Birimi Bilgileri <span className="text-[10px] font-normal text-slate-400">(EKAP veri aktarımında bu bilgiler eşleştirilir)</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                  Harcama Birim Kodu
                                </label>
                              <Input
                                value={harcamaBirimKodu}
                                onChange={(e) => setHarcamaBirimKodu(e.target.value)}
                                placeholder="Örn: 38.22.00.01"
                                className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                              />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                  Harcama Birim Adı
                                </label>
                                <Input
                                  value={harcamaBirimAdi}
                                  onChange={(e) => setHarcamaBirimAdi(e.target.value)}
                                  placeholder="Harcama Birimi Adı"
                                  className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                                />
                              </div>
                            </div>
                          </div>



                        </div>
                      </div>

                      {/* RESMİ YAZIŞMA VE ŞABLON KURALLARI */}
                      <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-500" />
                            Resmi Yazışma ve Şablon Kuralları
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-5">
                          <div className="bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={konuOrtalamaSiniri === 'true'}
                                onChange={(e) => setKonuOrtalamaSiniri(e.target.checked ? 'true' : 'false')}
                                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900 w-4 h-4" 
                              />
                              <div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                  Konu Satırı Dikey Orta Hizayı Geçmesin
                                </span>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                  Resmi Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik gereği, belgenin konusu yazı alanının dikey orta hizasını geçmeyecek biçimde sınırlandırılır. Seçili olduğunda şablonlarda "Konu" metni dikey orta hizadan itibaren otomatik olarak alt satıra geçer.
                                </p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* LOGOLAR GRUBU */}
                      {/* Öneri bilgi banner'ı */}
                      <div className="md:col-span-2 flex items-start gap-2 p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-[10px] text-blue-700 dark:text-blue-400 leading-relaxed">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          <strong>Önerilen boyutlar:</strong> Uygulama Logosu için <strong>256×256 px</strong> veya <strong>512×512 px</strong> (kare, şeffaf arka planlı PNG tercih edilir).
                          Belge logoları (Sol/Sağ) için <strong>300×150 px</strong> önerilir. Maksimum dosya boyutu: <strong>2 MB</strong>.
                        </span>
                      </div>

                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* === UYGULAMA LOGOSU === */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-4 shadow-sm">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                              Uygulama Logosu
                            </label>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">
                              Giriş/Kilit ekranı ve sol menüde gösterilen genel logo.
                            </p>
                          </div>

                          {/* Büyük önizleme alanı */}
                          <label
                            className="group relative flex flex-col items-center justify-center w-full h-36 bg-white dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-200 shadow-inner"
                          >
                            {institutionLogo ? (
                              <>
                                <img
                                  src={institutionLogo}
                                  alt="Uygulama Logosu"
                                  className="w-full h-full object-contain p-3"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                  <Upload className="w-5 h-5 text-white" />
                                  <span className="text-white text-[10px] font-semibold">Değiştir</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                                <ImageIcon className="w-8 h-8" />
                                <span className="text-[10px] font-medium text-center leading-tight px-2">
                                  Logo seçmek için<br />tıklayın
                                </span>
                                <span className="text-[9px] text-slate-350 dark:text-slate-700">PNG, JPG, SVG · Maks. 2MB</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                if (file.size > 2 * 1024 * 1024) {
                                  alert('Dosya boyutu 2 MB\'ı aşmamalıdır!')
                                  return
                                }
                                const reader = new FileReader()
                                reader.onload = () => {
                                  if (typeof reader.result === 'string')
                                    setInstitutionLogo(reader.result)
                                }
                                reader.readAsDataURL(file)
                              }}
                            />
                          </label>

                          {/* Önerilen boyut ve URL Girişi */}
                          <div className="flex flex-col gap-3">
                            <Input
                              value={institutionLogo?.startsWith('http') ? institutionLogo : ''}
                              onChange={(e) => setInstitutionLogo(e.target.value)}
                              placeholder="Veya web URL'si yapıştırın (https://...)"
                              className="text-xs bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">Önerilen: 256×256 px</span>
                              {institutionLogo && (
                                <button
                                  type="button"
                                  onClick={() => setInstitutionLogo('')}
                                  className="flex items-center gap-1 py-1 px-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold transition-all"
                                >
                                  <X className="w-3 h-3" />
                                  Kaldır
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* === SOL LOGO === */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-4 shadow-sm">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                              Sol Logo (Kurum)
                            </label>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">
                              Resmi belgelerin sol üstünde yer alacak kurum logosu.
                            </p>
                          </div>

                          <label
                            className="group relative flex flex-col items-center justify-center w-full h-36 bg-white dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-200 shadow-inner"
                          >
                            {logoLeft ? (
                              <>
                                <img
                                  src={logoLeft}
                                  alt="Sol Logo"
                                  className="w-full h-full object-contain p-3"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                  <Upload className="w-5 h-5 text-white" />
                                  <span className="text-white text-[10px] font-semibold">Değiştir</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                                <ImageIcon className="w-8 h-8" />
                                <span className="text-[10px] font-medium text-center leading-tight px-2">
                                  Logo seçmek için<br />tıklayın
                                </span>
                                <span className="text-[9px] text-slate-350 dark:text-slate-700">PNG, JPG, SVG · Maks. 2MB</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                if (file.size > 2 * 1024 * 1024) {
                                  alert('Dosya boyutu 2 MB\'ı aşmamalıdır!')
                                  return
                                }
                                const reader = new FileReader()
                                reader.onload = () => {
                                  if (typeof reader.result === 'string')
                                    setLogoLeft(reader.result)
                                }
                                reader.readAsDataURL(file)
                              }}
                            />
                          </label>

                          <div className="flex flex-col gap-3">
                            <Input
                              value={logoLeft?.startsWith('http') ? logoLeft : ''}
                              onChange={(e) => setLogoLeft(e.target.value)}
                              placeholder="Veya web URL'si yapıştırın (https://...)"
                              className="text-xs bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">Önerilen: 300×150 px</span>
                              {logoLeft && (
                                <button
                                  type="button"
                                  onClick={() => setLogoLeft('')}
                                  className="flex items-center gap-1 py-1 px-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold transition-all"
                                >
                                  <X className="w-3 h-3" />
                                  Kaldır
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* === SAĞ LOGO === */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-4 shadow-sm">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                              Sağ Logo (Bakanlık)
                            </label>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">
                              Resmi belgelerin sağ üstünde yer alacak logo.
                            </p>
                          </div>

                          <label
                            className="group relative flex flex-col items-center justify-center w-full h-36 bg-white dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-200 shadow-inner"
                          >
                            {logoRight ? (
                              <>
                                <img
                                  src={logoRight}
                                  alt="Sağ Logo"
                                  className="w-full h-full object-contain p-3"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                  <Upload className="w-5 h-5 text-white" />
                                  <span className="text-white text-[10px] font-semibold">Değiştir</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                                <ImageIcon className="w-8 h-8" />
                                <span className="text-[10px] font-medium text-center leading-tight px-2">
                                  Logo seçmek için<br />tıklayın
                                </span>
                                <span className="text-[9px] text-slate-350 dark:text-slate-700">PNG, JPG, SVG · Maks. 2MB</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                if (file.size > 2 * 1024 * 1024) {
                                  alert('Dosya boyutu 2 MB\'ı aşmamalıdır!')
                                  return
                                }
                                const reader = new FileReader()
                                reader.onload = () => {
                                  if (typeof reader.result === 'string')
                                    setLogoRight(reader.result)
                                }
                                reader.readAsDataURL(file)
                              }}
                            />
                          </label>

                          <div className="flex flex-col gap-3">
                            <Input
                              value={logoRight?.startsWith('http') ? logoRight : ''}
                              onChange={(e) => setLogoRight(e.target.value)}
                              placeholder="Veya web URL'si yapıştırın (https://...)"
                              className="text-xs bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">Önerilen: 300×150 px</span>
                              {logoRight && (
                                <button
                                  type="button"
                                  onClick={() => setLogoRight('')}
                                  className="flex items-center gap-1 py-1 px-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold transition-all"
                                >
                                  <X className="w-3 h-3" />
                                  Kaldır
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: İLETİŞİM & KONUM */}
                {activeTab === 'iletisim' && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                        İletişim ve Konum Bilgileri
                      </h2>
                      <p className="text-xs text-slate-500">
                        Kurumun adres, telefon ve e-posta erişim detayları.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Adres
                        </label>
                        <Input
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Açık Adres"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                       <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Şehir / İl
                        </label>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Şehir / İl"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Semt / İlçe
                        </label>
                        <Input
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="Semt / İlçe"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Posta Kodu
                        </label>
                        <Input
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="Posta Kodu"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                     
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Telefon Numarası
                        </label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Telefon"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Faks Numarası
                        </label>
                        <Input
                          value={fax}
                          onChange={(e) => setFax(e.target.value)}
                          placeholder="Faks"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Kurumsal E-posta
                        </label>
                        <Input
                          value={instEmail}
                          onChange={(e) => setInstEmail(e.target.value)}
                          placeholder="E-posta"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          KEP Adresi
                        </label>
                        <Input
                          value={kepAddress}
                          onChange={(e) => setKepAddress(e.target.value)}
                          placeholder="KEP Adresi (Örn: kurum@hs01.kep.tr)"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Web Sitesi (URL)
                        </label>
                        <Input
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="Web Sitesi (Örn: https://www.belediye.gov.tr)"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  )
}

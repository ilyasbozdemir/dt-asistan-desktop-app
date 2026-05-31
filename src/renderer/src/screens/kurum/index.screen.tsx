import React, { useState, useEffect } from 'react'
import { useAyarlarHooks } from '../ayarlar/ayarlar.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useSettingsStore } from '../../store/settingsStore'
import { Building2, Save, Upload, MapPin, ImageIcon, Info, X } from 'lucide-react'
import { FINANSMAN_KODLARI } from '../../constants/butce-kodlari'
import { InnerMenu, InnerMenuItem } from '../../components/ui/InnerMenu'

type TabType = 'idari' | 'iletisim'

export default function KurumScreen(): React.JSX.Element {
  const { settings, isLoadingSettings, saveSettings } = useAyarlarHooks()
  const { loadSettings: reloadSettingsStore } = useSettingsStore()

  const [activeTab, setActiveTab] = useState<TabType>('idari')
  const [saving, setSaving] = useState(false)

  // Tab 1: İdari Bilgiler
  const [institutionCode, setInstitutionCode] = useState('')
  const [kurumAdi, setKurumAdi] = useState('')
  const [institutionLetterhead, setInstitutionLetterhead] = useState('')
  const [recipientTitle, setRecipientTitle] = useState('')
  const [parentInstitution, setParentInstitution] = useState('')
  const [logoLeft, setLogoLeft] = useState('')
  const [logoRight, setLogoRight] = useState('')
  const [institutionLogo, setInstitutionLogo] = useState('')
  const [limitType, setLimitType] = useState('diger')
  const [finansmanKodu, setFinansmanKodu] = useState('5')
  const [institutionType, setInstitutionType] = useState('')

  const handleInstitutionTypeChange = (type: string) => {
    setInstitutionType(type)
    if (type === 'belediye') {
      setFinansmanKodu('5')
      setLimitType('buyuksehir')
    } else if (type === 'genel_butce') {
      setFinansmanKodu('1')
      setLimitType('diger')
    } else if (type === 'ozel_butce') {
      setFinansmanKodu('2')
      setLimitType('diger')
    } else if (type === 'duzenleyici') {
      setFinansmanKodu('3')
      setLimitType('diger')
    } else if (type === 'diger') {
      setFinansmanKodu('8')
      setLimitType('diger')
    }
  }

  // Yeni Eklenen Mali / Bütçe Kodları
  const [kurumsalKod, setKurumsalKod] = useState('')
  const [fonksiyonelKod, setFonksiyonelKod] = useState('')
  const [muhasebeBirimKodu, setMuhasebeBirimKodu] = useState('')
  const [muhasebeBirimAdi, setMuhasebeBirimAdi] = useState('')
  const [harcamaBirimKodu, setHarcamaBirimKodu] = useState('')
  const [harcamaBirimAdi, setHarcamaBirimAdi] = useState('')

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
  const [website, setWebsite] = useState('')

  useEffect(() => {
    if (settings) {
      setTimeout(() => {
        setInstitutionCode(settings.institutionCode || '')
        setKurumAdi(settings.institutionName || '')
        setInstitutionLetterhead(settings.institutionLetterhead || '')
        setRecipientTitle(settings.recipientTitle || '')
        setParentInstitution(settings.parentInstitution || '')
        setLogoLeft(settings.logoLeft || '')
        setLogoRight(settings.logoRight || '')
        setInstitutionLogo(settings.institutionLogo || '')
        setLimitType(settings.limitType || 'diger')
        setFinansmanKodu(settings.finansmanKodu || '5')
        setInstitutionType(settings.institutionType || '')

        setAddress(settings.address || '')
        setDistrict(settings.district || '')
        setPostalCode(settings.postalCode || '')
        setCity(settings.city || '')
        setPhone(settings.phone || '')
        setFax(settings.fax || '')
        setInstEmail(settings.institutionEmail || '')
        setWebsite(settings.website || '')

        setKurumsalKod(settings.kurumsalKod || '')
        setFonksiyonelKod(settings.fonksiyonelKod || '')
        setMuhasebeBirimKodu(settings.muhasebeBirimKodu || '')
        setMuhasebeBirimAdi(settings.muhasebeBirimAdi || '')
        setHarcamaBirimKodu(settings.harcamaBirimKodu || '')
        setHarcamaBirimAdi(settings.harcamaBirimAdi || '')
      }, 0)
    }
  }, [settings])

  const handleSaveTab = async (tab: TabType): Promise<void> => {
    setSaving(true)
    try {
      const dataToSave: Record<string, string> = {}

      if (tab === 'idari') {
        dataToSave.institutionCode = institutionCode
        dataToSave.institutionName = kurumAdi
        dataToSave.institutionLetterhead = institutionLetterhead
        dataToSave.recipientTitle = recipientTitle
        dataToSave.parentInstitution = parentInstitution
        dataToSave.logoLeft = logoLeft
        dataToSave.logoRight = logoRight
        dataToSave.institutionLogo = institutionLogo
        dataToSave.limitType = limitType
        dataToSave.finansmanKodu = finansmanKodu
        dataToSave.institutionType = institutionType
        dataToSave.kurumsalKod = kurumsalKod
        dataToSave.fonksiyonelKod = fonksiyonelKod
        dataToSave.muhasebeBirimKodu = muhasebeBirimKodu
        dataToSave.muhasebeBirimAdi = muhasebeBirimAdi
        dataToSave.harcamaBirimKodu = harcamaBirimKodu
        dataToSave.harcamaBirimAdi = harcamaBirimAdi
      } else if (tab === 'iletisim') {
        dataToSave.address = address
        dataToSave.district = district
        dataToSave.postalCode = postalCode
        dataToSave.city = city
        dataToSave.phone = phone
        dataToSave.fax = fax
        dataToSave.institutionEmail = instEmail
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
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <Building2 className="w-8 h-8 text-blue-605" />
            Kurum Bilgileri
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Resmi evrak çıktılarında ve arayüzde gösterilecek idari ve iletişim bilgilerini yönetin.
          </p>
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
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Kurum Kodu
                        </label>
                        <Input
                          value={institutionCode}
                          onChange={(e) => setInstitutionCode(e.target.value)}
                          placeholder="Kurum Kodunu Girin (Örn: 12345)"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Kurum / Belediye Adı
                        </label>
                        <Input
                          value={kurumAdi}
                          onChange={(e) => setKurumAdi(e.target.value)}
                          placeholder="Kurum Adı"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Kurum Anteti
                        </label>
                        <Input
                          value={institutionLetterhead}
                          onChange={(e) => setInstitutionLetterhead(e.target.value)}
                          placeholder="Resmi Belge Başlığı Örn: T.C. GÜNEY YURT BELEDİYE BAŞKANLIĞI"
                          className="bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Sunulacak Makam Adı
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
                          <option value="belediye">Belediye / Mahalli İdare (Finansman Kodu: 5)</option>
                          <option value="genel_butce">Bakanlık / İl-İlçe Müdürlüğü / Genel Bütçe (Finansman Kodu: 1)</option>
                          <option value="ozel_butce">Üniversite / Özel Bütçeli İdare (Finansman Kodu: 2)</option>
                          <option value="duzenleyici">Düzenleyici ve Denetleyici Kurum (Finansman Kodu: 3)</option>
                          <option value="diger">Diğer İdareler / Kamu İktisadi Teşebbüsü (Finansman Kodu: 8)</option>
                        </select>
                        {institutionType === 'belediye' && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 leading-normal font-medium">
                            💡  Kurumsal kodunuzun "30" (Mahalli İdareler) ile başlaması ve bütçe kodlarında "5" Finansman Kodu kullanılması tavsiye edilir.
                          </p>
                        )}
                        {institutionType === 'genel_butce' && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 leading-normal font-medium">
                            💡 Kurumsal kodunuzun ilgili Bakanlık koduyla başlaması (örn. Sağlık: 18) ve "1" Finansman Kodu kullanılması tavsiye edilir.
                          </p>
                        )}
                        {institutionType === 'ozel_butce' && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 leading-normal font-medium">
                            💡 Yükseköğretim ve üniversite kurumsal kodları genellikle "38" ile başlar ve "2" Finansman Kodu kullanılır.
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
                          <option value="diger">Diğer İdareler (İlçe, Belde, İl ve Diğer Kurumlar — Limit: 340.391 ₺)</option>
                          <option value="buyuksehir">Büyükşehir Belediyesi Sınırları Dahilindeki İdareler — Limit: 1.021.827 ₺</option>
                        </select>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                          Bu seçim, doğrudan temin dosyası oluşturulurken tahmini bedel limit aşımı kontrolünü ve Gösterge Paneli bütçe uyarılarını belirler.
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                          Analitik Bütçe Sınıflandırması (ABS) Finansman Tipi *
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
                        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mb-4 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-500" />
                          Mali ve Muhasebe Birim Bilgileri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          
                          {/* Kurumsal Kod */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                              Kurumsal Kod (Düzey 1-2-3-4)
                            </label>
                            <select
                              value={kurumsalKod}
                              onChange={e => setKurumsalKod(e.target.value)}
                              className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Seçiniz...</option>
                              {sozlukData.filter(d => d.tur === 'kurumsal').map(item => (
                                <option key={item.kod} value={item.kod}>
                                  {item.kod} — {item.aciklama}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Fonksiyonel Kod */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                              Fonksiyonel Kod (Düzey 1-2-3-4)
                            </label>
                            <select
                              value={fonksiyonelKod}
                              onChange={e => setFonksiyonelKod(e.target.value)}
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
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                              Muhasebe Birimi (Birim Kodu & Adı)
                            </label>
                            <select
                              value={muhasebeBirimKodu}
                              onChange={e => {
                                const val = e.target.value;
                                setMuhasebeBirimKodu(val);
                                const selected = sozlukData.find(d => d.tur === 'muhasebe_birimi' && d.kod === val);
                                setMuhasebeBirimAdi(selected ? selected.aciklama : '');
                              }}
                              className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Seçiniz...</option>
                              {sozlukData.filter(d => d.tur === 'muhasebe_birimi').map(item => (
                                <option key={item.kod} value={item.kod}>
                                  {item.kod} — {item.aciklama}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Harcama Birimi */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                              Harcama Birimi (Birim Kodu & Adı)
                            </label>
                            <select
                              value={harcamaBirimKodu}
                              onChange={e => {
                                const val = e.target.value;
                                setHarcamaBirimKodu(val);
                                const selected = sozlukData.find(d => d.tur === 'harcama_birimi' && d.kod === val);
                                setHarcamaBirimAdi(selected ? selected.aciklama : '');
                              }}
                              className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-2 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Seçiniz...</option>
                              {sozlukData.filter(d => d.tur === 'harcama_birimi').map(item => (
                                <option key={item.kod} value={item.kod}>
                                  {item.kod} — {item.aciklama}
                                </option>
                              ))}
                            </select>
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

                          {/* Önerilen boyut etiketi */}
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

              {/* Kaydet Butonu */}
              <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                <Button
                  onClick={() => handleSaveTab(activeTab)}
                  disabled={saving}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-2.5 px-6 text-sm font-semibold transition-all shadow-md shadow-primary/20 shrink-0"
                >
                  <Save className="w-4 h-4" />
                  Değişiklikleri Kaydet
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

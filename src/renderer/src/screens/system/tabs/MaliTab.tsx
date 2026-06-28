import React, { useState, useEffect } from 'react'
import { Building2, Save, CheckCircle2 } from 'lucide-react'
import { CodeListEditor, CodeItem } from './components/CodeListEditor'
import { useAyarlarHooks } from '../../ayarlar/ayarlar.hooks'
import { useSettingsStore } from '../../../store/settingsStore'
import { useBirimlerHooks } from '../../birimler/birimler.hooks'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { EKONOMIK_KODLAR, FONKSIYONEL_KODLAR } from '../../../constants/butce-kodlari'

export function MaliTab(): React.JSX.Element {
  const { settings, isLoadingSettings, saveSettings } = useAyarlarHooks()
  const { loadSettings: reloadSettingsStore } = useSettingsStore()
  const { birimler } = useBirimlerHooks()

  const [savingMali, setSavingMali] = useState(false)
  const [institutionType, setInstitutionType] = useState('belediye')
  const [finansmanKodu, setFinansmanKodu] = useState('5')
  const [limitType, setLimitType] = useState('diger')

  const [kurumsalCodes, setKurumsalCodes] = useState<CodeItem[]>([])
  const [localBirimCodes, setLocalBirimCodes] = useState<
    { id: number; e_butce: string; say2000i: string }[]
  >([])
  const [fonksiyonelCodes, setFonksiyonelCodes] = useState<CodeItem[]>([])
  const [muhasebeBirimleri, setMuhasebeBirimleri] = useState<CodeItem[]>([])
  const [harcamaBirimleri, setHarcamaBirimleri] = useState<CodeItem[]>([])
  const [economicCodes, setEconomicCodes] = useState<CodeItem[]>([])

  const [taxOffice, setTaxOffice] = useState('')
  const [taxNumber, setTaxNumber] = useState('')

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

      window.electron.ipcRenderer
        .invoke('db:query', 'SELECT * FROM TANIM_KodSozlugu WHERE aktif_mi = 1')
        .then((res) => {
          if (res.success && res.data) {
            setFonksiyonelCodes(
              res.data
                .filter((d: any) => d.tur === 'fonksiyonel')
                .map((d: any) => ({ code: d.kod, description: d.aciklama }))
            )
            setMuhasebeBirimleri(
              res.data
                .filter((d: any) => d.tur === 'muhasebe_birimi')
                .map((d: any) => ({ code: d.kod, description: d.aciklama }))
            )
            setHarcamaBirimleri(
              res.data
                .filter((d: any) => d.tur === 'harcama_birimi')
                .map((d: any) => ({ code: d.kod, description: d.aciklama }))
            )
          }
        })
        .catch(console.error)

      queueMicrotask(() => {
        setInstitutionType(settings.institutionType || 'belediye')
        setFinansmanKodu(settings.finansmanKodu || '5')
        setLimitType(settings.limitType || 'diger')

        try {
          if (settings.ekonomikKodlarList === undefined) {
            setEconomicCodes(
              EKONOMIK_KODLAR.map((item) => ({ code: item.kod, description: item.aciklama }))
            )
          } else {
            const parsed = JSON.parse(settings.ekonomikKodlarList)
            setEconomicCodes(normalizeCodes(parsed))
          }
        } catch {
          setEconomicCodes([])
        }

        setTaxOffice(settings.taxOffice || '')
        setTaxNumber(settings.taxNumber || '')
      })
    }
  }, [settings])

  useEffect(() => {
    queueMicrotask(() => {
      if (birimler && birimler.length > 0) {
        setLocalBirimCodes(
          birimler.map((b) => ({
            id: b.id,
            e_butce: b.e_butce || '',
            say2000i: b.say2000i || ''
          }))
        )
        setKurumsalCodes(
          birimler.map((b) => ({
            code: b.e_butce || '',
            description: b.birim_adi
          }))
        )
      } else {
        setLocalBirimCodes([])
        setKurumsalCodes([])
      }
    })
  }, [birimler])

  const handleInstitutionTypeChange = (type: string): void => {
    setInstitutionType(type)
    if (type === 'belediye') {
      setFinansmanKodu('5')
      setLimitType('diger')
    } else if (type === 'genel_butce') {
      setFinansmanKodu('1')
      setLimitType('diger')
    } else if (type === 'ozel_butce') {
      setFinansmanKodu('2')
      setLimitType('diger')
    } else if (type === 'duzenleyici') {
      setFinansmanKodu('3')
      setLimitType('diger')
    } else if (type === 'sosyal_guvenlik') {
      setFinansmanKodu('4')
      setLimitType('diger')
    } else if (type === 'diger') {
      setLimitType('diger')
    }
  }

  const handleSaveMali = async (): Promise<void> => {
    setSavingMali(true)
    try {
      const dataToSave: Record<string, string> = {
        ekonomikKodlarList: JSON.stringify(economicCodes),
        institutionType,
        finansmanKodu,
        limitType,
        taxOffice,
        taxNumber
      }

      await window.electron.ipcRenderer.invoke('db:run', 'DELETE FROM TANIM_KodSozlugu')

      const insertQueries = [
        ...kurumsalCodes.map((c) => ({
          sql: 'INSERT INTO TANIM_KodSozlugu (tur, kod, aciklama) VALUES (?, ?, ?)',
          params: ['kurumsal', c.code, c.description]
        })),
        ...fonksiyonelCodes.map((c) => ({
          sql: 'INSERT INTO TANIM_KodSozlugu (tur, kod, aciklama) VALUES (?, ?, ?)',
          params: ['fonksiyonel', c.code, c.description]
        })),
        ...muhasebeBirimleri.map((c) => ({
          sql: 'INSERT INTO TANIM_KodSozlugu (tur, kod, aciklama) VALUES (?, ?, ?)',
          params: ['muhasebe_birimi', c.code, c.description]
        })),
        ...harcamaBirimleri.map((c) => ({
          sql: 'INSERT INTO TANIM_KodSozlugu (tur, kod, aciklama) VALUES (?, ?, ?)',
          params: ['harcama_birimi', c.code, c.description]
        }))
      ]

      const updateBirimQueries = [
        { sql: 'UPDATE TANIM_Birim SET e_butce = NULL, say2000i = NULL', params: [] },
        ...localBirimCodes.map((lb) => ({
          sql: 'UPDATE TANIM_Birim SET e_butce = ?, say2000i = ? WHERE id = ?',
          params: [lb.e_butce, lb.say2000i, lb.id]
        }))
      ]

      if (insertQueries.length > 0 || updateBirimQueries.length > 0) {
        await window.electron.ipcRenderer.invoke('db:transaction', [
          ...insertQueries,
          ...updateBirimQueries
        ])
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

  return (
    <div className="flex flex-col h-full relative">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 rounded-t-2xl">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Mali ve kurumsal kodları kaydedin.
        </span>
        <button
          onClick={handleSaveMali}
          disabled={savingMali}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-500/30 cursor-pointer"
        >
          {savingMali ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {savingMali ? 'Kaydedildi' : 'Kaydet'}
        </button>
      </div>

      <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
            Mali ve Kurumsal Kod Yönetimi
          </h2>
          <p className="text-xs text-slate-500">
            Maliye ve muhasebe süreçlerinde kullanılan kod listelerini yönetin. Kod ekleyerek
            listeleri genişletebilirsiniz.
          </p>
        </div>

        {isLoadingSettings ? (
          <div className="flex items-center justify-center p-8 text-sm text-slate-500">
            Yükleniyor...
          </div>
        ) : (
          <>
            <div className="space-y-5">
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
                  <option value="belediye">Belediye / Mahalli İdare (Finansman Kaynağı: 5)</option>
                  <option value="genel_butce">
                    Bakanlık / İl-İlçe Müdürlüğü / Genel Bütçe (Finansman Kaynağı: 1)
                  </option>
                  <option value="ozel_butce">
                    Üniversite / Özel Bütçeli İdare (Finansman Kaynağı: 2)
                  </option>
                  <option value="duzenleyici">
                    Düzenleyici ve Denetleyici Kurum (Finansman Kaynağı: 3)
                  </option>
                  <option value="sosyal_guvenlik">
                    SGK / Sosyal Güvenlik Kurumu (Finansman Kaynağı: 4)
                  </option>
                  <option value="diger">
                    Diğer İdareler / Kamu İktisadi Teşebbüsü (Finansman Kaynağı: Kuruma Göre
                    Değişir)
                  </option>
                </select>

                {institutionType === 'belediye' && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                    💡 Mahalli İdare şablonu aktif. 5018 sayılı kanun gereği kurumsal kod prefixi{' '}
                    <strong>"46"</strong> (Mahalli İdareler) ve finansal kod <strong>"5"</strong>{' '}
                    olmalıdır.
                    <br />
                    Örnek Kurumsal Kod Yapısı:{' '}
                    <strong>46 . [İl Kodu] . [Belediye Kodu] . [Müdürlük/Birim Kodu]</strong>
                  </div>
                )}
                {institutionType === 'genel_butce' && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                    💡 Genel Bütçe şablonu aktif. Finansal kod <strong>"1"</strong> (Genel Bütçe)
                    olmalıdır. Kurumsal Kod1 alanına ilgili Bakanlık / İdare kodu yazılmalıdır.
                    <br />
                    Örnek Kurumsal Kod Yapısı:{' '}
                    <strong>
                      [Bakanlık Kodu] . [Genel Müdürlük] . [İl Kodu] . [İlçe/Birim]
                    </strong>{' '}
                    (Örn: 18.01.06.00 - Sağlık Bakanlığı)
                  </div>
                )}
                {institutionType === 'ozel_butce' && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                    💡 Özel Bütçe şablonu aktif. Özel Bütçeli İdareler (Örn: Üniversiteler) için
                    finansal kod <strong>"2"</strong> olmalıdır. Üniversiteler için kurumsal kod
                    prefixi <strong>"38"</strong> ile başlar.
                    <br />
                    Örnek Kurumsal Kod Yapısı:{' '}
                    <strong>38 . [Üniversite Kodu] . [Fakülte/Bölüm] . [Birim]</strong> (Örn:
                    38.08.01.00)
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        Kurumsal Kodlar (Kurum Birimleri)
                      </h3>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">
                        Kurumunuza ait ana birim ve müdürlük kodları (Birim Yönetimi verileri).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {birimler.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                        Tanımlı birim bulunamadı. Lütfen önce "Birim Yönetimi" sayfasından
                        birimlerinizi ekleyin.
                      </div>
                    ) : (
                      birimler.map((birim, index) => {
                        const lbCode = localBirimCodes.find((lb) => lb.id === birim.id)
                        const currentKurumsal = lbCode ? lbCode.e_butce : birim.e_butce || ''
                        const currentEski = lbCode ? lbCode.say2000i : birim.say2000i || ''

                        return (
                          <div
                            key={birim.id || index}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800"
                          >
                            <div className="flex-1 w-full">
                              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {birim.birim_adi}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                              <div className="w-full sm:w-48">
                                <label className="text-[10px] text-slate-500 font-semibold mb-1 block">
                                  e-Bütçe Kodu
                                </label>
                                <Input
                                  value={currentKurumsal}
                                  onChange={(e) => {
                                    const newCode = e.target.value
                                    setLocalBirimCodes((prev) =>
                                      prev.map((p) =>
                                        p.id === birim.id ? { ...p, e_butce: newCode } : p
                                      )
                                    )
                                  }}
                                  placeholder="Örn: xx.yy.zz.03"
                                  className="h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full"
                                />
                              </div>
                              <div className="w-full sm:w-48">
                                <label className="text-[10px] text-slate-500 font-semibold mb-1 block">
                                  Say2000i Kodu
                                </label>
                                <Input
                                  value={currentEski}
                                  onChange={(e) => {
                                    const newCode = e.target.value
                                    setLocalBirimCodes((prev) =>
                                      prev.map((p) =>
                                        p.id === birim.id ? { ...p, say2000i: newCode } : p
                                      )
                                    )
                                  }}
                                  placeholder="Örn: XXYY"
                                  className="h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <CodeListEditor
                  title="Fonksiyonel Kodlar"
                  description="Birimlerin fonksiyonel sınıflandırma kodları (Örn: 01.1.2.00)"
                  codes={fonksiyonelCodes}
                  onChange={setFonksiyonelCodes}
                  placeholderCode="Örn: 01.1.2.00"
                  placeholderDesc="Fonksiyon Açıklaması..."
                  presets={FONKSIYONEL_KODLAR.map((k) => ({ kod: k.kod, aciklama: k.aciklama }))}
                />
              </div>

              <div className="mt-4">
                <CodeListEditor
                  title="Muhasebe Birimleri"
                  description="Muhasebe işlem fişleri (ÖEB) için kullanılacak birim kodları ve adları."
                  codes={muhasebeBirimleri}
                  onChange={setMuhasebeBirimleri}
                  placeholderCode="Kod..."
                  placeholderDesc="Muhasebe Birim Adı..."
                />
              </div>

              <div className="mt-4">
                <CodeListEditor
                  title="Harcama Birimleri"
                  description="Harcama yetkilisi birim kodları ve adları."
                  codes={harcamaBirimleri}
                  onChange={setHarcamaBirimleri}
                  placeholderCode="Kod..."
                  placeholderDesc="Harcama Birim Adı..."
                />
              </div>
            </div>

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
                <div className="md:col-span-3">
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
                <div className="md:col-span-3">
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
    </div>
  )
}

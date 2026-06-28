import React, { useState } from 'react'
import { useKurumHooks, KurumVerisi } from './kurum.hooks'
import { Button } from '../../components/ui/Button'
import { Building2, MapPin, Save } from 'lucide-react'
import { InnerMenu, InnerMenuItem } from '../../components/ui/InnerMenu'
import { IdariBilgilerTab } from './components/IdariBilgilerTab'
import { MaliBirimTab } from './components/MaliBirimTab'
import { IletisimTab } from './components/IletisimTab'
import { useSettingsStore } from '../../store/settingsStore'

type TabType = 'idari' | 'mali' | 'iletisim'

export default function KurumScreen(): React.JSX.Element {
  const { kurumData, isLoadingKurum, fetchKurum, saveKurum } = useKurumHooks()
  const { loadSettings: reloadSettingsStore } = useSettingsStore()

  const [activeTab, setActiveTab] = useState<TabType>('idari')
  const [saving, setSaving] = useState(false)

  // Local state to hold unsaved form changes
  const [localData, setLocalData] = useState<Partial<KurumVerisi>>({})
  const [institutionLetterhead, setInstitutionLetterhead] = useState<string[]>([])
  const [sozlukData, setSozlukData] = useState<any[]>([])

  // Fetch initial data
  React.useEffect(() => {
    fetchKurum()
  }, [fetchKurum])

  // Initialize form when data loads
  React.useEffect(() => {
    if (kurumData && Object.keys(localData).length === 0) {
      setLocalData(kurumData)

      let parsedLetterhead = ['']
      if (kurumData.kurum_anteti) {
        try {
          const parsed = JSON.parse(kurumData.kurum_anteti)
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedLetterhead = parsed
          } else {
            parsedLetterhead = [kurumData.kurum_anteti]
          }
        } catch {
          parsedLetterhead = [kurumData.kurum_anteti]
        }
      }
      setInstitutionLetterhead(parsedLetterhead)
    }
  }, [kurumData])

  // Load sözlük data
  React.useEffect(() => {
    window.electron.ipcRenderer
      .invoke('db:query', 'SELECT * FROM TANIM_KodSozlugu WHERE aktif_mi = 1')
      .then((res: any) => {
        if (res.success && res.data) {
          setSozlukData(res.data)
        }
      })
      .catch(console.error)
  }, [])

  const handleChange = (key: keyof KurumVerisi, value: any) => {
    setLocalData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    try {
      const dataToSave = { ...localData } as KurumVerisi
      dataToSave.kurum_anteti = JSON.stringify(institutionLetterhead.filter((l) => l.trim() !== ''))

      await saveKurum(dataToSave)
      await reloadSettingsStore() // refresh app-wide settings store if they still rely on anything here
      alert('Kurum bilgileri başarıyla kaydedildi.')
    } catch (err) {
      alert('Kaydetme hatası: ' + err)
    } finally {
      setSaving(false)
    }
  }

  const menuItems: InnerMenuItem[] = [
    {
      id: 'idari',
      label: 'İdari Bilgiler',
      icon: <Building2 className="w-4 h-4 shrink-0" />
    },
    {
      id: 'mali',
      label: 'Mali ve Bütçe Kodları',
      icon: <Building2 className="w-4 h-4 shrink-0 text-amber-600" />
    },
    {
      id: 'iletisim',
      label: 'İletişim & Konum',
      icon: <MapPin className="w-4 h-4 shrink-0" />
    }
  ]

  if (isLoadingKurum) {
    return (
      <div className="flex items-center justify-center flex-1 text-slate-500 h-full w-full">
        Kurum bilgileri yükleniyor...
      </div>
    )
  }

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
            onClick={handleSave}
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
          <div className="space-y-6">
            {activeTab === 'idari' && (
              <IdariBilgilerTab
                data={localData}
                onChange={handleChange}
                institutionLetterhead={institutionLetterhead}
                setInstitutionLetterhead={setInstitutionLetterhead}
              />
            )}
            {activeTab === 'mali' && (
              <MaliBirimTab
                data={localData}
                onChange={handleChange}
                institutionLetterhead={institutionLetterhead}
                setInstitutionLetterhead={setInstitutionLetterhead}
                sozlukData={sozlukData}
              />
            )}
            {activeTab === 'iletisim' && (
              <IletisimTab
                data={localData}
                onChange={handleChange}
                institutionLetterhead={institutionLetterhead}
                setInstitutionLetterhead={setInstitutionLetterhead}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

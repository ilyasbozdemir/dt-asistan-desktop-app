import React, { useState, useEffect } from 'react'
import { Key, LayoutTemplate, Save, RefreshCcw } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../utils/cn'
import { useSablonlar, Sablon, useDbTables, useDbColumns, useDbDictionary } from '../sablonlar.hooks'
import { subPagesMapping } from '../../../constants/surecler'
import { getDefaultMappingForProcess, ProcessMapping, TableColumnMapping } from '../../../constants/mappings'


function VariableRow({ 
  variableKey, 
  mapping, 
  onChange 
}: { 
  variableKey: string
  mapping?: TableColumnMapping
  onChange: (key: string, newMapping: TableColumnMapping) => void 
}) {
  const { data: dbDictionary = {} } = useDbDictionary()
  const { data: dbTables = [] } = useDbTables()
  const { data: dbColumns = [] } = useDbColumns(mapping?.tablo || null)

  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
      <td className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
          {`{{${variableKey}}}`}
        </span>
      </td>
      <td className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <select
          value={mapping?.tablo || ''}
          title={`Tablo Seçimi - ${variableKey}`}
          onChange={e => onChange(variableKey, { ...mapping, tablo: e.target.value, sutun: '' } as TableColumnMapping)}
          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">-- Tablo Seçin --</option>
          {dbTables.map(t => {
            const tableLabel = dbDictionary[t]?.label ? `${t} (${dbDictionary[t].label})` : t;
            return <option key={t} value={t}>{tableLabel}</option>;
          })}
        </select>
      </td>
      <td className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <select
          value={mapping?.sutun || ''}
          title={`Sütun Seçimi - ${variableKey}`}
          disabled={!mapping?.tablo}
          onChange={e => onChange(variableKey, { ...mapping, sutun: e.target.value } as TableColumnMapping)}
          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        >
          <option value="">-- Sütun Seçin --</option>
          {dbColumns.map(c => {
             const t = mapping?.tablo || '';
             const colLabel = dbDictionary[t]?.columns?.[c] ? `${c} (${dbDictionary[t].columns[c]})` : c;
             return <option key={c} value={c}>{colLabel}</option>;
          })}
        </select>
      </td>
      <td className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 truncate max-w-[200px]" title={mapping?.aciklama}>
        {mapping?.aciklama || '-'}
      </td>
    </tr>
  )
}

function TemplateBindingSettings({ sablon, templatePlaceholders }: { sablon: Sablon, templatePlaceholders: string[] | null }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingMapping, setSavingMapping] = useState(false)
  const [boundProcess, setBoundProcess] = useState<string>('')
  
  // Mapping state
  const [currentOverrides, setCurrentOverrides] = useState<ProcessMapping>({})
  const [localOverrides, setLocalOverrides] = useState<ProcessMapping>({})

  const loadSettings = async () => {
    try {
      setLoading(true)
      const res = await (window as any).electron.ipcRenderer.invoke('db:get-settings')
      let foundProcess = ''
      
      if (res) {
        for (const process of subPagesMapping) {
          const mappingKey = `MAPPING_${process.path}_SABLON_ID`
          if (res[mappingKey] === sablon.id.toString()) {
            foundProcess = process.path
            break
          }
        }
      }
      
      setBoundProcess(foundProcess)

      if (foundProcess) {
         const overridesKey = `MAPPING_${foundProcess}_PLACEHOLDERS`
         if (res && res[overridesKey]) {
            try {
               const parsedOverrides = JSON.parse(res[overridesKey])
               setCurrentOverrides(parsedOverrides)
               setLocalOverrides(parsedOverrides)
            } catch (e) {
               console.error('Placeholder override parse error', e)
            }
         } else {
            setCurrentOverrides({})
            setLocalOverrides({})
         }
      } else {
         setCurrentOverrides({})
         setLocalOverrides({})
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [sablon.id])

  // When user selects a new process from dropdown, we shouldn't show overrides of the old process
  // We handle saving separately
  const handleProcessChange = (newProcess: string) => {
     setBoundProcess(newProcess)
     setLocalOverrides({})
  }

  const handleSaveBinding = async () => {
    try {
      setSaving(true)
      const current = await (window as any).electron.ipcRenderer.invoke('db:get-settings')
      const newSettings = { ...current }
      
      for (const process of subPagesMapping) {
         const mappingKey = `MAPPING_${process.path}_SABLON_ID`
         if (newSettings[mappingKey] === sablon.id.toString()) {
            newSettings[mappingKey] = null
         }
      }
      
      if (boundProcess) {
        newSettings[`MAPPING_${boundProcess}_SABLON_ID`] = sablon.id.toString()
      }

      const res = await (window as any).electron.ipcRenderer.invoke('db:save-settings', newSettings)
      if (res.success) {
        alert('Süreç bağlaması başarıyla kaydedildi!')
        // Reload to get potential placeholder overrides of the newly bound process
        loadSettings()
      } else {
        alert('Kaydetme hatası: ' + res.error)
      }
    } catch (e: any) {
      alert('İşlem sırasında hata: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleMappingChange = (key: string, newMapping: TableColumnMapping) => {
    setLocalOverrides(prev => ({
      ...prev,
      [key]: newMapping
    }))
  }

  const handleSaveMappings = async () => {
     if (!boundProcess) return
     try {
       setSavingMapping(true)
       const current = await (window as any).electron.ipcRenderer.invoke('db:get-settings')
       const overridesKey = `MAPPING_${boundProcess}_PLACEHOLDERS`
       
       const newSettings = { ...current, [overridesKey]: JSON.stringify(localOverrides) }
       
       const res = await (window as any).electron.ipcRenderer.invoke('db:save-settings', newSettings)
       if (res.success) {
         alert('Değişken eşleşmeleri veritabanına kaydedildi!')
         setCurrentOverrides(localOverrides)
       } else {
         alert('Kaydetme hatası: ' + res.error)
       }
     } catch (e: any) {
       alert('İşlem sırasında hata: ' + e.message)
     } finally {
       setSavingMapping(false)
     }
  }

  const handleResetMappings = async () => {
     if (!boundProcess) return
     if (!confirm('Tüm özelleştirmeler silinip .ts dosyasındaki varsayılan eşleşmelere dönülecek. Onaylıyor musunuz?')) return

     try {
       setSavingMapping(true)
       const current = await (window as any).electron.ipcRenderer.invoke('db:get-settings')
       const overridesKey = `MAPPING_${boundProcess}_PLACEHOLDERS`
       
       const newSettings = { ...current, [overridesKey]: null } // Clear override
       
       const res = await (window as any).electron.ipcRenderer.invoke('db:save-settings', newSettings)
       if (res.success) {
         alert('Varsayılan eşleşmelere dönüldü!')
         setLocalOverrides({})
         setCurrentOverrides({})
       } else {
         alert('Kaydetme hatası: ' + res.error)
       }
     } catch (e: any) {
       alert('İşlem sırasında hata: ' + e.message)
     } finally {
       setSavingMapping(false)
     }
  }

  if (loading) return <div className="p-4 text-xs text-slate-500">Yükleniyor...</div>

  const defaultMappingForProcess = getDefaultMappingForProcess(boundProcess)

  return (
    <div className="flex flex-col gap-4 flex-1 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm shrink-0">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3">Bu Şablonu Bir Sürece Bağla</h3>
        
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Süreç Seçimi:</label>
          <select 
            value={boundProcess}
            title="Süreç Seçimi"
            onChange={e => handleProcessChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200"
          >
            <option value="">-- Sürece Bağlı Değil --</option>
            {subPagesMapping.map(p => (
              <option key={p.path} value={p.path}>{p.stage}. {p.name} ({p.path})</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveBinding} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 rounded-lg flex items-center gap-2">
             <Save className="w-3.5 h-3.5" />
             {saving ? 'Kaydediliyor...' : 'Bağlamayı Kaydet'}
          </Button>
        </div>
      </div>

      {boundProcess && templatePlaceholders && templatePlaceholders.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <div>
               <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Şablon Değişken Eşleştirmeleri</h3>
               <p className="text-[10px] text-slate-500 mt-1">
                 Şablondaki değişkenlerin veritabanı eşleşmeleri. <strong>Sadece bu süreç için geçerlidir.</strong>
               </p>
            </div>
            <div className="flex items-center gap-2">
               <Button onClick={handleResetMappings} disabled={savingMapping} variant="outline" className="text-xs px-3 py-1.5 text-orange-600 border-orange-200 hover:bg-orange-50 h-8">
                  <RefreshCcw className="w-3.5 h-3.5 mr-1" /> Varsayılanlara Dön
               </Button>
               <Button onClick={handleSaveMappings} disabled={savingMapping} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 h-8">
                  <Save className="w-3.5 h-3.5 mr-1" /> Eşleşmeleri Kaydet
               </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800 sticky top-0">
                <tr>
                  <th className="px-4 py-2 w-1/4">Anahtar (Key)</th>
                  <th className="px-4 py-2 w-1/4">Tablo</th>
                  <th className="px-4 py-2 w-1/4">Sütun</th>
                  <th className="px-4 py-2 w-1/4">Açıklama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {templatePlaceholders.map(key => {
                   const defaultMap = defaultMappingForProcess[key]
                   const overriddenMap = localOverrides[key]
                   const activeMap = overriddenMap || defaultMap || { tablo: '', sutun: '' }

                   return (
                     <VariableRow 
                       key={key} 
                       variableKey={key} 
                       mapping={activeMap} 
                       onChange={handleMappingChange}
                     />
                   )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export function PlaceholderYonetimi(): React.JSX.Element {
  const [selectedSablonId, setSelectedSablonId] = useState<number | null>(null)
  const { data: sablonlar = [] } = useSablonlar()
  
  const selectedSablon = sablonlar.find(s => s.id === selectedSablonId)
  
  const templatePlaceholders = React.useMemo(() => {
    if (!selectedSablon) return null
    if (selectedSablon.test_verisi) {
      try {
        const parsed = JSON.parse(selectedSablon.test_verisi)
        return Object.keys(parsed)
      } catch (e) {
        console.error('Test verisi JSON parse hatası:', e)
      }
    }
    return []
  }, [selectedSablon])

  // Automatically select the first template if none is selected
  useEffect(() => {
    if (!selectedSablonId && sablonlar.length > 0) {
      setSelectedSablonId(sablonlar[0].id)
    }
  }, [sablonlar, selectedSablonId])

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            Şablon Süreç Yönetimi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Şablonlarınızı hangi ekranlarda yazdırılacağına (süreçlere) bağlayın ve değişken eşleştirmelerini yapın.
          </p>
        </div>
      </div>

      <div className="flex h-full gap-4 overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-72 shrink-0 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
             <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">Şablon Seçimi</h3>
           </div>
           <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 custom-scrollbar">
              {sablonlar.map(s => (
                 <button 
                  key={s.id}
                  onClick={() => setSelectedSablonId(s.id)}
                  className={cn("px-3 py-2.5 text-sm text-left rounded-xl transition-all flex items-center gap-3 truncate", selectedSablonId === s.id ? "bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-900/40 dark:text-indigo-300 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}
                  title={s.ad}
                >
                  <LayoutTemplate className={cn("w-4 h-4 shrink-0", selectedSablonId === s.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} /> <span className="truncate">{s.ad}</span>
                </button>
              ))}
              {sablonlar.length === 0 && (
                <div className="text-center p-4 text-xs text-slate-500 italic">Hiç şablon bulunamadı.</div>
              )}
           </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {selectedSablon ? (
              <TemplateBindingSettings sablon={selectedSablon} templatePlaceholders={templatePlaceholders} />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex-1 flex items-center justify-center">
                 <div className="text-center text-slate-400">
                    <LayoutTemplate className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">İşlem yapmak için sol menüden bir şablon seçin</p>
                 </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

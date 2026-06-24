import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Key, LayoutTemplate, Save } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { cn } from '../../../utils/cn'
import { Placeholder, usePlaceholders, useAddPlaceholder, useUpdatePlaceholder, useDeletePlaceholder, useDbTables, useDbColumns, useSablonlar, useResetPlaceholders, Sablon } from '../sablonlar.hooks'

const UsedInCell = ({ usedIn }: { usedIn: string[] }) => {
  const [expanded, setExpanded] = useState(false)
  if (!usedIn || usedIn.length === 0) {
    return <span className="text-xs text-slate-400 italic">Kullanılmıyor</span>
  }
  
  if (usedIn.length <= 2 || expanded) {
    return (
      <div className="flex flex-wrap gap-1 max-w-[250px]">
        {usedIn.map((tName, idx) => (
          <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded truncate max-w-[200px]" title={tName}>
            {tName}
          </span>
        ))}
        {expanded && usedIn.length > 2 && (
          <button onClick={() => setExpanded(false)} className="text-[10px] text-indigo-500 hover:underline px-1.5 py-0.5 rounded">
            Gizle
          </button>
        )}
      </div>
    )
  }

  const visible = usedIn.slice(0, 2)
  const hiddenCount = usedIn.length - 2

  return (
    <div className="flex flex-wrap items-center gap-1 max-w-[250px]">
      {visible.map((tName, idx) => (
        <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded truncate max-w-[200px]" title={tName}>
          {tName}
        </span>
      ))}
      <button 
        onClick={() => setExpanded(true)}
        className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium px-1.5 py-0.5 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        title={usedIn.slice(2).join(', ')}
      >
        +{hiddenCount} daha
      </button>
    </div>
  )
}

function TemplateBindingSettings({ sablon }: { sablon: Sablon }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [boundProcess, setBoundProcess] = useState<string>('')
  const [jsonOverride, setJsonOverride] = useState<string>('')

  const loadSettings = async () => {
    try {
      setLoading(true)
      const res = await (window as any).electron.ipcRenderer.invoke('db:get-settings')
      if (res && res['MAPPING_IHTIYAC_LISTESI_SABLON_ID'] === sablon.id.toString()) {
        setBoundProcess('ihtiyac_listesi')
        setJsonOverride(res['MAPPING_IHTIYAC_LISTESI_JSON_OVERRIDE'] || '')
      } else {
        setBoundProcess('')
        setJsonOverride('')
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

  const handleSave = async () => {
    try {
      setSaving(true)
      const current = await (window as any).electron.ipcRenderer.invoke('db:get-settings')
      const newSettings = { ...current }
      
      if (boundProcess === 'ihtiyac_listesi') {
        newSettings['MAPPING_IHTIYAC_LISTESI_SABLON_ID'] = sablon.id.toString()
        newSettings['MAPPING_IHTIYAC_LISTESI_JSON_OVERRIDE'] = jsonOverride
      } else {
        if (current && current['MAPPING_IHTIYAC_LISTESI_SABLON_ID'] === sablon.id.toString()) {
           newSettings['MAPPING_IHTIYAC_LISTESI_SABLON_ID'] = null
           newSettings['MAPPING_IHTIYAC_LISTESI_JSON_OVERRIDE'] = null
        }
      }

      const res = await (window as any).electron.ipcRenderer.invoke('db:save-settings', newSettings)
      if (res.success) {
        alert('Süreç bağlaması başarıyla kaydedildi!')
      } else {
        alert('Kaydetme hatası: ' + res.error)
      }
    } catch (e: any) {
      alert('İşlem sırasında hata: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-4 text-xs text-slate-500">Yükleniyor...</div>

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3">Bu Şablonu Bir Sürece Bağla</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Süreç Seçimi:</label>
        <select 
          value={boundProcess}
          title="Süreç Seçimi"
          onChange={e => setBoundProcess(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200"
        >
          <option value="">-- Sürece Bağlı Değil --</option>
          <option value="ihtiyac_listesi">İhtiyaç Listesi Süreci (Malzeme Listesi Yazdırma)</option>
        </select>
      </div>

      {boundProcess && (
        <div className="mb-4">
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
             JSON Veri Override (İsteğe Bağlı)
           </label>
           <textarea 
              rows={4}
              value={jsonOverride}
              onChange={e => setJsonOverride(e.target.value)}
              placeholder='Örn: { "ekstraAciklama": "Özel metin..." }'
              className="w-full font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200"
           />
           <p className="text-[10px] text-slate-400 mt-1">Bu sürece ait varsayılan JSON verisinin üzerine yazılacak değerleri buraya ekleyebilirsiniz.</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 rounded-lg flex items-center gap-2">
           <Save className="w-3.5 h-3.5" />
           {saving ? 'Kaydediliyor...' : 'Bağlamayı Kaydet'}
        </Button>
      </div>
    </div>
  )
}

export function PlaceholderYonetimi(): React.JSX.Element {
  const { data: placeholders = [], isLoading } = usePlaceholders()
  const { data: dbTables = [] } = useDbTables()
  const addPlaceholder = useAddPlaceholder()
  const updatePlaceholder = useUpdatePlaceholder()
  const deletePlaceholder = useDeletePlaceholder()
  const resetPlaceholders = useResetPlaceholders()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedSablonId, setSelectedSablonId] = useState<number | null>(null)
  const { data: sablonlar = [] } = useSablonlar()
  
  // Form State
  const [anahtar, setAnahtar] = useState('')
  const [etiket, setEtiket] = useState('')
  const [kaynakTablo, setKaynakTablo] = useState<string | null>(null)
  const [kaynakSutun, setKaynakSutun] = useState<string | null>(null)
  const [varsayilan, setVarsayilan] = useState('')
  const [aciklama, setAciklama] = useState('')

  const { data: dbColumns = [] } = useDbColumns(kaynakTablo)

  const handleOpenModal = (placeholder?: Placeholder | { anahtar: string }) => {
    if (placeholder && 'id' in placeholder && placeholder.id !== 0) {
      setEditingId(placeholder.id)
      setAnahtar(placeholder.anahtar)
      setEtiket(placeholder.etiket)
      setKaynakTablo(placeholder.kaynak_tablo)
      setKaynakSutun(placeholder.kaynak_sutun)
      setVarsayilan(placeholder.varsayilan || '')
      setAciklama(placeholder.aciklama || '')
    } else {
      setEditingId(null)
      setAnahtar(placeholder && 'anahtar' in placeholder ? placeholder.anahtar : '')
      setEtiket('')
      setKaynakTablo(null)
      setKaynakSutun(null)
      setVarsayilan('')
      setAciklama('')
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!anahtar.trim() || !etiket.trim()) {
      alert('Anahtar ve Etiket alanları zorunludur.')
      return
    }

    const payload = {
      anahtar: anahtar.trim(),
      etiket: etiket.trim(),
      kaynak_tablo: kaynakTablo,
      kaynak_sutun: kaynakSutun,
      varsayilan: varsayilan.trim(),
      aciklama: aciklama.trim()
    }

    if (editingId) {
      updatePlaceholder.mutate({ id: editingId, data: payload }, {
        onSuccess: () => handleCloseModal(),
        onError: (err: any) => alert('Güncelleme hatası: ' + err.message)
      })
    } else {
      addPlaceholder.mutate(payload, {
        onSuccess: () => handleCloseModal(),
        onError: (err: any) => alert('Ekleme hatası: ' + err.message)
      })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Bu değişkeni silmek istediğinize emin misiniz?')) {
      deletePlaceholder.mutate(id, {
        onError: (err: any) => alert('Silme hatası: ' + err.message)
      })
    }
  }

  const handleResetDefaults = () => {
    if (confirm('Tüm değişkenler silinip, sistem varsayılanlarına dönülecek. Onaylıyor musunuz?')) {
      resetPlaceholders.mutate(undefined, {
        onSuccess: () => alert('Varsayılan değişkenler başarıyla yüklendi!'),
        onError: (err: any) => alert('Sıfırlama hatası: ' + err.message)
      })
    }
  }

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

  const getUsedInTemplates = (anahtar: string) => {
    return sablonlar
      .filter(s => s.icerik && s.icerik.includes(anahtar))
      .map(s => s.ad);
  }

  const displayedList = templatePlaceholders 
    ? templatePlaceholders.map(anahtar => {
        const existing = placeholders.find(p => p.anahtar === anahtar)
        return existing 
          ? { ...existing, isNew: false, usedIn: getUsedInTemplates(anahtar) } 
          : { id: 0, anahtar, etiket: '', kaynak_tablo: null, kaynak_sutun: null, varsayilan: '', aciklama: '', isNew: true, usedIn: getUsedInTemplates(anahtar) }
      })
    : placeholders.map(p => ({ ...p, isNew: false, usedIn: getUsedInTemplates(p.anahtar) }))

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            Değişkenler & Bağlamalar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Şablonlarınızı belirli süreçlere bağlayın ve kullanacağınız `{'{{değişken_adı}}'}` parametrelerini yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleResetDefaults} 
            disabled={resetPlaceholders.isPending}
            className="text-xs border-orange-200 text-orange-600 hover:bg-orange-50"
            title="Sistemdeki tüm değişkenleri silip varsayılan listeye döner"
          >
            {resetPlaceholders.isPending ? 'Sıfırlanıyor...' : 'Varsayılanlara Dön'}
          </Button>

          <Button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-md">
            <Plus className="w-4 h-4" />
            Yeni Değişken Ekle
          </Button>
        </div>
      </div>

      <div className="flex h-full gap-4 overflow-hidden">
        
        {/* SIDEBAR */}
        <div className="w-72 shrink-0 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
             <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">Şablon Seçimi</h3>
           </div>
           <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 custom-scrollbar">
              <button 
                onClick={() => setSelectedSablonId(null)}
                className={cn("px-3 py-2.5 text-sm text-left rounded-xl transition-all flex items-center gap-3", !selectedSablonId ? "bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-900/40 dark:text-indigo-300 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}
              >
                <Key className={cn("w-4 h-4", !selectedSablonId ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} /> Tüm Değişkenler
              </button>
              
              <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
              
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
           </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {selectedSablon && (
              <TemplateBindingSettings sablon={selectedSablon} />
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500 text-sm italic">Yükleniyor...</div>
              ) : displayedList.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <Key className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {selectedSablonId ? 'Bu şablonda hiç değişken kullanılmamış.' : 'Henüz hiç değişken tanımlanmamış.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar flex-1">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800 sticky top-0">
                      <tr>
                        <th className="px-6 py-3">Anahtar (Key)</th>
                        <th className="px-6 py-3">Kullanıldığı Şablonlar</th>
                        <th className="px-6 py-3">Etiket (Label)</th>
                        <th className="px-6 py-3">Veri Kaynağı</th>
                        <th className="px-6 py-3 w-full">Açıklama</th>
                        <th className="px-6 py-3 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {displayedList.map((p, index) => (
                        <tr key={p.id || `new-${index}`} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${p.isNew ? 'bg-orange-50/30 dark:bg-orange-900/10' : ''}`}>
                          <td className="px-6 py-3">
                            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                              {`{{${p.anahtar}}}`}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <UsedInCell usedIn={p.usedIn} />
                          </td>
                          <td className="px-6 py-3 text-slate-800 dark:text-slate-200">{p.etiket}</td>
                          <td className="px-6 py-3">
                            {p.isNew ? (
                              <span className="text-orange-500 text-xs italic font-semibold">Tanımlanmamış</span>
                            ) : p.kaynak_tablo ? (
                              <div className="flex flex-col text-xs">
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{p.kaynak_tablo}</span>
                                <span className="text-slate-500">{p.kaynak_sutun ? `-> ${p.kaynak_sutun}` : ''}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Manuel Giriş</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-slate-500 dark:text-slate-400 text-xs truncate max-w-[250px]">{p.aciklama || '-'}</td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {p.isNew ? (
                                <Button 
                                  variant="outline" 
                                  className="text-xs py-1 h-8 border-orange-200 text-orange-600 hover:bg-orange-50"
                                  onClick={() => handleOpenModal({ anahtar: p.anahtar })}
                                >
                                  Tanımla
                                </Button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleOpenModal(p as Placeholder)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Düzenle"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(p.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Sil"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Değişkeni Düzenle' : 'Yeni Değişken Ekle'}
        description="Şablonlarda kullanılacak eşleştirme parametrelerini tanımlayın."
      >
        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Anahtar (Key) *
            </label>
            <input
              type="text"
              required
              value={anahtar}
              onChange={(e) => setAnahtar(e.target.value)}
              placeholder="Örn: firma_adi"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800 dark:text-slate-200"
            />
            <p className="text-[10px] text-slate-400 mt-1">Şablonda <span className="font-mono">{'{{anahtar}}'}</span> olarak kullanılır.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Etiket (Label) *
            </label>
            <input
              type="text"
              required
              value={etiket}
              onChange={(e) => setEtiket(e.target.value)}
              placeholder="Örn: İstekli Firma Adı"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Kaynak Tablo
              </label>
              <select
                value={kaynakTablo || ''}
                title="Kaynak Tablo Seçimi"
                onChange={(e) => {
                  setKaynakTablo(e.target.value || null)
                  setKaynakSutun(null)
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              >
                <option value="">-- Manuel Giriş (Bağımsız) --</option>
                {dbTables.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Kaynak Sütun
              </label>
              <select
                value={kaynakSutun || ''}
                title="Kaynak Sütun Seçimi"
                onChange={(e) => setKaynakSutun(e.target.value || null)}
                disabled={!kaynakTablo}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 disabled:opacity-50"
              >
                <option value="">-- Sütun Seçin --</option>
                {dbColumns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Varsayılan Değer
            </label>
            <input
              type="text"
              value={varsayilan}
              onChange={(e) => setVarsayilan(e.target.value)}
              placeholder="Boş kalırsa kullanılacak metin..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Açıklama
            </label>
            <textarea
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Bu değişkenin ne için kullanıldığına dair notlar..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
              İptal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
              disabled={addPlaceholder.isPending || updatePlaceholder.isPending}
            >
              {addPlaceholder.isPending || updatePlaceholder.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

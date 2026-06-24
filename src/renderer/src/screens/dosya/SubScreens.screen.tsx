import React, { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  AlertCircle,
  FileText,
  Users,
  Package,
  Layers,
  Compass,
  FileCheck,
  CreditCard,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Building2,
  Printer,
  TrendingUp,
  UserPlus,
  Copy,
  Upload,
  Eye
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { Modal } from '../../components/ui/Modal'

interface SubScreenProps {
  title: string
  icon: React.ElementType
  description: string
  children?: React.ReactNode
}

export function SubScreen({ title, icon: Icon, description, children }: SubScreenProps): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const [activeDosya, setActiveDosya] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = `${title} - Doğrudan Temin`
  }, [title])

  useEffect(() => {
    if (!activeDosyaId) return
    setLoading(true)
    window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id, konu, temin_no FROM DATA_TeminDosyasi WHERE id = ?',
      [activeDosyaId]
    ).then((res) => {
      if (res.success && res.data.length > 0) {
        setActiveDosya(res.data[0])
      }
    }).finally(() => {
      setLoading(false)
    })
  }, [activeDosyaId])

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dosyalar"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            title="Dosyalara Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
              <Icon className="w-7 h-7 text-blue-600" />
              {title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVE DOSYA CONTEXT */}
      {activeDosyaId ? (
        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                İLİŞKİLİ AKTİF ÇALIŞMA DOSYASI
              </span>
              {loading ? (
                <span className="text-xs text-slate-500 italic">Yükleniyor...</span>
              ) : activeDosya ? (
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {activeDosya.temin_no || 'No Bekliyor'} — {activeDosya.konu} (ID: #{activeDosya.id})
                </h3>
              ) : (
                <span className="text-xs text-slate-500">Dosya bulunamadı (#{activeDosyaId})</span>
              )}
            </div>
          </div>
          <Link
            to="/dosyalar"
            className="px-3.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors inline-block text-center cursor-pointer shrink-0 shadow-sm"
          >
            Dosyayı Değiştir
          </Link>
        </div>
      ) : (
        <div className="bg-amber-50/50 dark:bg-amber-955/10 border border-amber-200 dark:border-amber-900/20 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-400 font-semibold shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <div>
            Aktif bir doğrudan temin dosyası seçmediniz. Bu ekranda işlem yapabilmek için lütfen önce{' '}
            <Link to="/dosyalar" className="underline font-bold text-blue-600 dark:text-blue-400">
              dosyalar listesinden
            </Link>{' '}
            bir dosya seçin.
          </div>
        </div>
      )}

      {/* CHILDREN VIEW */}
      {activeDosyaId && children}
    </div>
  )
}

// 1. MALZEME LİSTESİ SCREEN
export function MalzemeListesi(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const [items, setItems] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [libraryItems, setLibraryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [kalemAdi, setKalemAdi] = useState('')
  const [tasinirKodu, setTasinirKodu] = useState('')
  const [okasKodu, setOkasKodu] = useState('')
  const [tipi, setTipi] = useState('Mal')
  const [birim, setBirim] = useState('Adet')
  const [miktar, setMiktar] = useState(1)
  const [kdvOrani, setKdvOrani] = useState(20)
  const [aciklama, setAciklama] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'library' | 'new'>('library')
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set())
  const [itemMiktarlar, setItemMiktarlar] = useState<Record<number, number>>({})
  const [libSearchQuery, setLibSearchQuery] = useState('')

  const handleAiAçiklama = async () => {
    const name = kalemAdi.trim() || searchQuery.trim()
    if (!name) return
    setAiLoading(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('ai:generate', {
        prompt: `Bir kamu ihalesinde "${name}" malzemesi veya hizmeti alınacaktır. Bu alım için teknik şartnameye yazılabilecek, genel teknik standartları belirten, ürünün/hizmetin özelliklerini açıklayan kısa ve öz profesyonel bir metin yazar mısın? Sadece metni ver, başına sonuna bir şey ekleme.`
      })
      if (res.success && res.data) {
        setAciklama(res.data)
      } else {
        alert('AI hatası: ' + (res.error || 'Bilinmeyen hata'))
      }
    } catch (err: any) {
      alert('AI Hatası: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editMiktar, setEditMiktar] = useState(1)
  const [editBirim, setEditBirim] = useState('')
  const [editKdv, setEditKdv] = useState(20)

  const loadData = async (): Promise<void> => {
    if (!activeDosyaId) return
    setLoading(true)
    try {
      const resItems = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
        [activeDosyaId]
      )
      const resUnits = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT ad FROM TANIM_OlcuBirimi WHERE aktif_mi = 1 ORDER BY ad ASC'
      )
      const resLib = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Kalem WHERE aktif_mi = 1 ORDER BY kalem_adi ASC'
      )
      if (resItems.success) setItems(resItems.data)
      if (resUnits.success) setUnits(resUnits.data)
      if (resLib.success) setLibraryItems(resLib.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeDosyaId])

  const handleSelectSuggestion = (item: any): void => {
    setKalemAdi(item.kalem_adi)
    setTasinirKodu(item.tasinir_kodu || '')
    setOkasKodu(item.okas_kodu || '')
    setTipi(item.tipi || 'Mal')
    setBirim(item.birim || 'Adet')
    setKdvOrani(item.kdv_orani || 20)
    setSearchQuery(item.kalem_adi)
    setShowSuggestions(false)
  }

  const handleAddItem = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const nameToUse = kalemAdi.trim() || searchQuery.trim()
    if (!nameToUse) return

    try {
      // 1. Önce genel kütüphanede bu isimde kalem var mı kontrol et
      const checkRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Kalem WHERE kalem_adi = ? LIMIT 1',
        [nameToUse]
      )

      // 2. Eğer yoksa genel kütüphaneye ekle (TANIM_Kalem)
      if (checkRes.success && checkRes.data.length === 0) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Kalem (kalem_adi, tipi, birim, kdv_orani, tasinir_kodu, okas_kodu, aktif_mi)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [nameToUse, tipi, birim, kdvOrani, tasinirKodu || null, okasKodu || null]
        )
      }

      // 3. Dosyaya ekle (DATA_TeminKalem)
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO DATA_TeminKalem 
         (temin_dosya_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, miktar, kdv_orani, aciklama) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [activeDosyaId, tasinirKodu || null, okasKodu || null, nameToUse, tipi, birim, miktar, kdvOrani, aciklama || null]
      )
      if (res.success) {
        setKalemAdi('')
        setSearchQuery('')
        setTasinirKodu('')
        setOkasKodu('')
        setTipi('Mal')
        setBirim('Adet')
        setMiktar(1)
        setKdvOrani(20)
        setAciklama('')
        setIsAddModalOpen(false)
        loadData()
      } else {
        alert('Kalem eklenirken hata: ' + res.error)
      }
    } catch (err: any) {
      alert('Kalem eklenirken hata: ' + err.message)
    }
  }

  const handleDeleteItem = async (id: number): Promise<void> => {
    if (!confirm('Bu kalemi silmek istediğinize emin misiniz?')) return
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminKalem WHERE id = ?',
        [id]
      )
      if (res.success) {
        loadData()
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleStartEdit = (item: any): void => {
    setEditingId(item.id)
    setEditMiktar(item.miktar)
    setEditBirim(item.birim)
    setEditKdv(item.kdv_orani)
  }

  const handleSaveEdit = async (id: number): Promise<void> => {
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminKalem SET miktar = ?, birim = ?, kdv_orani = ? WHERE id = ?',
        [editMiktar, editBirim, editKdv, id]
      )
      if (res.success) {
        setEditingId(null)
        loadData()
      } else {
        alert(res.error)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleAddSelected = async (): Promise<void> => {
    const ids = Array.from(selectedItemIds)
    if (ids.length === 0) return
    try {
      for (const id of ids) {
        const libItem = libraryItems.find((l) => l.id === id)
        if (!libItem) continue
        const mkt = itemMiktarlar[id] ?? 1
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminKalem
           (temin_dosya_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, miktar, kdv_orani)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [activeDosyaId, libItem.tasinir_kodu || null, libItem.okas_kodu || null,
           libItem.kalem_adi, libItem.tipi, libItem.birim, mkt, libItem.kdv_orani]
        )
      }
      setSelectedItemIds(new Set())
      setItemMiktarlar({})
      setLibSearchQuery('')
      setIsAddModalOpen(false)
      loadData()
    } catch (err: any) {
      alert('Eklenirken hata: ' + err.message)
    }
  }

  const filteredSuggestions = searchQuery.trim()
    ? libraryItems.filter(item =>
        item.kalem_adi.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : []

  return (
    <SubScreen
      title="Malzeme / Hizmet Kalem Listesi"
      icon={Package}
      description="Dosya kapsamındaki malzeme, hizmet veya yapım işi ihtiyaçlarını listeleyin ve yönetin."
    >
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Yazdır / PDF Olarak Kaydet
        </button>
      </div>

      {/* ADD MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setSelectedItemIds(new Set())
          setItemMiktarlar({})
          setLibSearchQuery('')
        }}
        title="Dosyaya Kalem Ekle"
        description="Kütüphaneden seçin veya yeni bir kalem oluşturun."
      >
        {/* Sekmeler */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={cn(
              'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeTab === 'library'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            📋 Kütüphaneden Seç
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={cn(
              'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeTab === 'new'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            ✏️ Yeni Kalem
          </button>
        </div>

        {/* SEKME 1: KÜTÜPHANE LİSTESİ */}
        {activeTab === 'library' && (
          <div className="space-y-3">
            {/* Arama */}
            <input
              type="text"
              value={libSearchQuery}
              onChange={(e) => setLibSearchQuery(e.target.value)}
              placeholder="Kalem adı, tür veya kod ile arayın..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />

            {/* Seçim sayacı */}
            {selectedItemIds.size > 0 && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                  {selectedItemIds.size} kalem seçildi
                </span>
                <button
                  type="button"
                  onClick={() => { setSelectedItemIds(new Set()); setItemMiktarlar({}) }}
                  className="text-[10px] text-blue-500 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  Seçimi Temizle
                </button>
              </div>
            )}

            {/* Liste */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
              {libraryItems
                .filter((item) =>
                  !libSearchQuery.trim() ||
                  item.kalem_adi.toLowerCase().includes(libSearchQuery.toLowerCase()) ||
                  (item.tasinir_kodu || '').toLowerCase().includes(libSearchQuery.toLowerCase()) ||
                  (item.okas_kodu || '').toLowerCase().includes(libSearchQuery.toLowerCase())
                )
                .map((item) => {
                  const isSelected = selectedItemIds.has(item.id)
                  const mkt = itemMiktarlar[item.id] ?? 1
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all cursor-pointer',
                        isSelected
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      )}
                      onClick={() => {
                        setSelectedItemIds((prev) => {
                          const next = new Set(prev)
                          if (next.has(item.id)) next.delete(item.id)
                          else next.add(item.id)
                          return next
                        })
                      }}
                    >
                      {/* Checkbox */}
                      <div className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                      )}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </div>

                      {/* İçerik */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.kalem_adi}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn(
                            'text-[9px] font-black uppercase px-1 py-0.5 rounded',
                            item.tipi === 'Mal' && 'bg-blue-100 text-blue-600',
                            item.tipi === 'Hizmet' && 'bg-violet-100 text-violet-600',
                            item.tipi === 'Yapım' && 'bg-amber-100 text-amber-600',
                            item.tipi === 'Danışmanlık' && 'bg-pink-100 text-pink-600'
                          )}>{item.tipi}</span>
                          <span className="text-[9px] text-slate-400">{item.birim} · %{item.kdv_orani} KDV</span>
                          {item.tasinir_kodu && <span className="text-[9px] text-slate-400 font-mono">{item.tasinir_kodu}</span>}
                        </div>
                      </div>

                      {/* Miktar */}
                      {isSelected && (
                        <div
                          className="flex items-center gap-1 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setItemMiktarlar((prev) => ({ ...prev, [item.id]: Math.max(1, (prev[item.id] ?? 1) - 1) }))}
                            className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                          >−</button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-slate-200">{mkt}</span>
                          <button
                            type="button"
                            onClick={() => setItemMiktarlar((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 1) + 1 }))}
                            className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                          >+</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              {libraryItems.length === 0 && (
                <div className="text-center text-xs text-slate-400 py-8">
                  Kütüphanede henüz kayıtlı kalem yok. Yeni Kalem sekmesinden ekleyebilirsiniz.
                </div>
              )}
            </div>

            {/* Ekle butonu */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setSelectedItemIds(new Set())
                  setItemMiktarlar({})
                  setLibSearchQuery('')
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={selectedItemIds.size === 0}
                onClick={handleAddSelected}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {selectedItemIds.size > 0 ? `${selectedItemIds.size} Kalem Ekle` : 'Kalem Seçin'}
              </button>
            </div>
          </div>
        )}

        {/* SEKME 2: YENİ KALEM FORMU */}
        {activeTab === 'new' && (
          <form onSubmit={handleAddItem} className="space-y-3.5">
            {/* Kalem Arama / Autocomplete */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Malzeme / Hizmet Adı
              </label>
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setKalemAdi(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Kütüphaneden arayın veya yeni yazın..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {filteredSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs text-slate-700 dark:text-slate-350 font-semibold transition-colors flex flex-col"
                    >
                      <span>{item.kalem_adi}</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        Tip: {item.tipi} | KDV: %{item.kdv_orani} {item.tasinir_kodu ? `| Taşınır: ${item.tasinir_kodu}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Taşınır & OKAS Kodları */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Taşınır Kodu</label>
                <input type="text" value={tasinirKodu} onChange={(e) => setTasinirKodu(e.target.value)} placeholder="Örn: 150.01.01"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 font-mono" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">OKAS Kodu</label>
                <input type="text" value={okasKodu} onChange={(e) => setOkasKodu(e.target.value)} placeholder="Örn: 30192700"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 font-mono" />
              </div>
            </div>

            {/* Türü & Birimi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kalem Türü</label>
                <select value={tipi} onChange={(e) => setTipi(e.target.value)} title="Kalem Türü"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200">
                  <option value="Mal">Mal Alımı</option>
                  <option value="Hizmet">Hizmet Alımı</option>
                  <option value="Yapım">Yapım İşi</option>
                  <option value="Danışmanlık">Danışmanlık Alımı</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Ölçü Birimi</label>
                <select value={birim} onChange={(e) => setBirim(e.target.value)} title="Ölçü Birimi"
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200">
                  {units.map((u, idx) => (<option key={idx} value={u.ad}>{u.ad}</option>))}
                </select>
              </div>
            </div>

            {/* Miktar & KDV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Miktar</label>
                <input type="number" step="0.01" required min="0.01" value={miktar} title="Miktar"
                  onChange={(e) => setMiktar(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">KDV Oranı (%)</label>
                <select value={kdvOrani} onChange={(e) => setKdvOrani(parseInt(e.target.value, 10))} title="KDV Oranı"
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200">
                  <option value="0">%0</option>
                  <option value="1">%1</option>
                  <option value="10">%10</option>
                  <option value="20">%20</option>
                </select>
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Açıklama (Opsiyonel)</label>
                <button type="button" onClick={handleAiAçiklama} disabled={(!kalemAdi && !searchQuery) || aiLoading}
                  className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  {aiLoading ? 'Düşünüyor...' : '✨ AI Önerisi'}
                </button>
              </div>
              <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)}
                placeholder="Özellikler, marka model veya teknik şartlar..." rows={2}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer">
                İptal
              </button>
              <button type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4" />
                Kaydet ve Ekle
              </button>
            </div>
          </form>
        )}
      </Modal>

        {/* ITEMS LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Dosyadaki Kalemler
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold">{items.length}</span>
            </h3>
            <div className="flex items-center gap-3">
              {items.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full font-extrabold uppercase">
                  {items.reduce((s, i) => s + i.miktar, 0)} Toplam Miktar
                </span>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Kalem Ekle
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">Yükleniyor...</div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Package className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs">Bu dosyada henüz herhangi bir malzeme/hizmet kalemi eklenmemiş.</p>
              <p className="text-[10px] text-slate-500 mt-1">Sol taraftaki paneli kullanarak ilk kalemi ekleyebilirsiniz.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3 pl-4">Kalem Adı</th>
                    <th className="p-3">Tür</th>
                    <th className="p-3 text-center">Miktar</th>
                    <th className="p-3">Birim</th>
                    <th className="p-3 text-center">KDV (%)</th>
                    <th className="p-3 text-right pr-4">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {items.map((item) => {
                    const isEditing = editingId === item.id

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="p-3 pl-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{item.kalem_adi}</div>
                          {(item.tasinir_kodu || item.okas_kodu) && (
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {item.tasinir_kodu && `Taşınır: ${item.tasinir_kodu}`} 
                              {item.tasinir_kodu && item.okas_kodu && ' · '} 
                              {item.okas_kodu && `OKAS: ${item.okas_kodu}`}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase",
                            item.tipi === 'Mal' && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
                            item.tipi === 'Hizmet' && 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
                            item.tipi === 'Yapım' && 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
                            item.tipi === 'Danışmanlık' && 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
                          )}>
                            {item.tipi}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editMiktar}
                              onChange={(e) => setEditMiktar(parseFloat(e.target.value) || 1)}
                              className="w-16 p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded text-center text-xs font-bold"
                            />
                          ) : (
                            <span className="font-black text-slate-750 dark:text-slate-300">{item.miktar}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editBirim}
                              onChange={(e) => setEditBirim(e.target.value)}
                              className="p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-xs"
                            >
                              {units.map((u, idx) => (
                                <option key={idx} value={u.ad}>{u.ad}</option>
                              ))}
                            </select>
                          ) : (
                            <span>{item.birim}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isEditing ? (
                            <select
                              value={editKdv}
                              onChange={(e) => setEditKdv(parseInt(e.target.value, 10))}
                              className="p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-xs"
                            >
                              <option value="0">%0</option>
                              <option value="1">%1</option>
                              <option value="10">%10</option>
                              <option value="20">%20</option>
                            </select>
                          ) : (
                            <span>%{item.kdv_orani}</span>
                          )}
                        </td>
                        <td className="p-3 text-right pr-4">
                          <div className="flex justify-end gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors cursor-pointer"
                                  title="Değişiklikleri Kaydet"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/15 rounded-lg transition-colors cursor-pointer"
                                  title="İptal"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors cursor-pointer"
                                  title="Kalemi Düzenle"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/10 rounded-lg transition-colors cursor-pointer"
                                  title="Kalemi Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </SubScreen>
  )
}

// 2. İHTİYAÇ LİSTESİ & TALEP FORMU (PRINT VIEW)
export function IhtiyacListesiTalepFormu(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeDosyaId) return
    window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
      [activeDosyaId]
    ).then(res => {
      if (res.success) setItems(res.data)
    }).finally(() => setLoading(false))
  }, [activeDosyaId])

  const handlePrint = (): void => {
    window.print()
  }

  return (
    <SubScreen
      title="İhtiyaç Listesi &amp; Talep Formu"
      icon={Package}
      description="Talep formu formatında hazırlanmış, çıktı alınmaya hazır resmi ihtiyaç listesi görünümü."
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Yazdır / PDF Olarak Kaydet
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-md max-w-4xl mx-auto font-sans text-slate-850 dark:text-slate-200 print:shadow-none print:border-none print:p-0">
        {/* Printable Official Document Structure */}
        <div className="text-center font-bold uppercase space-y-1 pb-6 border-b-2 border-slate-350 dark:border-slate-850">
          <h2 className="text-sm">T.C.</h2>
          <h3 className="text-xs">KAMU KURUMU VE İDARESİ</h3>
          <h4 className="text-[10px] text-slate-500">DOĞRUDAN TEMİN İHTİYAÇ LİSTESİ VE TALEP FORMU</h4>
        </div>

        <div className="py-6 space-y-4 text-xs">
          <p className="leading-relaxed">
            İdaremizin doğrudan temin usulüyle tedarik etmek istediği ve aşağıda detaylı teknik özellikleri / miktarları belirtilen malzemelerin / hizmetlerin satın alınması hususunu arz ederim.
          </p>

          <table className="w-full border-collapse border border-slate-300 dark:border-slate-800 text-[11px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="border border-slate-300 dark:border-slate-800 p-2 text-center w-10">S.No</th>
                <th className="border border-slate-300 dark:border-slate-800 p-2">Malzeme/İş Kalemi Adı</th>
                <th className="border border-slate-300 dark:border-slate-800 p-2 text-center w-20">Miktar</th>
                <th className="border border-slate-300 dark:border-slate-800 p-2 text-center w-20">Ölçü Birimi</th>
                <th className="border border-slate-300 dark:border-slate-800 p-2 text-center w-16">KDV</th>
                <th className="border border-slate-300 dark:border-slate-800 p-2">Açıklama / Teknik Özellik</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="border border-slate-300 dark:border-slate-800 p-4 text-center italic text-slate-400">Yükleniyor...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-slate-300 dark:border-slate-800 p-4 text-center italic text-slate-400">Kayıtlı kalem bulunamadı.</td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-slate-300 dark:border-slate-800 p-2 font-bold">{item.kalem_adi}</td>
                    <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-mono font-bold">{item.miktar}</td>
                    <td className="border border-slate-300 dark:border-slate-800 p-2 text-center">{item.birim}</td>
                    <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-mono">%{item.kdv_orani}</td>
                    <td className="border border-slate-300 dark:border-slate-800 p-2 text-slate-500">{item.aciklama || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pt-12 flex justify-between">
            <div className="text-center w-40">
              <span className="block font-bold">Hazırlayan</span>
              <span className="block text-[10px] text-slate-400 mt-8">(İmza)</span>
            </div>
            <div className="text-center w-40">
              <span className="block font-bold">Birim Müdürü</span>
              <span className="block text-[10px] text-slate-400 mt-8">(İmza / Mühür)</span>
            </div>
          </div>
        </div>
      </div>
    </SubScreen>
  )
}

// 3. İSTEKLİ FİRMALAR SCREEN
export function IstekliFirmalar(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const [associatedFirms, setAssociatedFirms] = useState<any[]>([])
  const [allFirms, setAllFirms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFirmaForQuery, setActiveFirmaForQuery] = useState<any | null>(null)

  const loadFirms = async (): Promise<void> => {
    if (!activeDosyaId) return
    setLoading(true)
    try {
      const resAssoc = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT df.id as temin_firma_id, f.*, df.teklif_durumu, df.yasaklilik_durumu, df.yasaklilik_belgesi 
         FROM DATA_TeminFirma df 
         JOIN TANIM_Firma f ON df.firma_id = f.id 
         WHERE df.temin_dosya_id = ?`,
        [activeDosyaId]
      )
      const resAll = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Firma WHERE aktif_mi = 1 ORDER BY unvan ASC'
      )
      if (resAssoc.success) setAssociatedFirms(resAssoc.data)
      if (resAll.success) setAllFirms(resAll.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFirms()
  }, [activeDosyaId])

  const handleAddFirm = async (firmaId: number): Promise<void> => {
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'INSERT INTO DATA_TeminFirma (temin_dosya_id, firma_id, teklif_durumu) VALUES (?, ?, \'Davet Edildi\')',
        [activeDosyaId, firmaId]
      )
      if (res.success) {
        loadFirms()
      } else {
        alert('Firma eklenirken hata: ' + res.error)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleRemoveFirm = async (teminFirmaId: number): Promise<void> => {
    if (!confirm('Bu tedarikçiyi dosyadan çıkarmak istediğinize emin misiniz?')) return
    try {
      // Delete associated bids as well to maintain integrity
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminKalemTeklif WHERE temin_firma_id = ?',
        [teminFirmaId]
      )
      // Delete relation
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminFirma WHERE id = ?',
        [teminFirmaId]
      )
      if (res.success) {
        loadFirms()
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const unassociatedFirms = allFirms.filter(
    (f) => !associatedFirms.some((af) => af.id === f.id) &&
    f.unvan.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SubScreen
      title="İstekli Tedarikçi Firmalar"
      icon={Compass}
      description="Piyasa araştırması kapsamında davet mektubu gönderilecek veya teklif verecek firmaları ekleyin."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* INVITE NEW FIRM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            Tedarikçi Davet Et
          </h3>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Firma ünvanı ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
            />
          </div>

          <div className="max-h-64 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800/50 pr-1">
            {unassociatedFirms.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 italic">Eklenecek yeni firma bulunamadı.</div>
            ) : (
              unassociatedFirms.map((firma) => (
                <div key={firma.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-250 truncate" title={firma.unvan}>
                      {firma.unvan}
                    </span>
                    <span className="block text-[9px] text-slate-400">Vergi No: {firma.vergi_no || 'Belirtilmemiş'}</span>
                  </div>
                  <button
                    onClick={() => handleAddFirm(firma.id)}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black cursor-pointer transition-colors"
                  >
                    Ekle
                  </button>
                </div>
              ))
            )}
          </div>
          <p className="text-[10px] text-slate-400">
            Eksik firmaları sol menüdeki <strong>İstekli Firma Yönetimi</strong> panelinden sisteme kaydedebilirsiniz.
          </p>
        </div>

        {/* ASSOCIATED FIRMS */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
            Dosyaya Davet Edilen İstekli Listesi ({associatedFirms.length})
          </h3>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">Yükleniyor...</div>
          ) : associatedFirms.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs">Henüz bu ihale dosyası için herhangi bir istekli firma eklenmemiş.</p>
              <p className="text-[10px] text-slate-500 mt-1">Sol taraftaki firmalardan seçip ekleyerek teklif alma sürecini başlatın.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[450px] custom-scrollbar pr-1">
              {associatedFirms.map((f) => (
                <div
                  key={f.id}
                  className="p-4 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all bg-slate-50/20 dark:bg-slate-950/20"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex-1" title={f.unvan}>
                        {f.unvan}
                      </h4>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold">
                          {f.teklif_durumu}
                        </span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider",
                          f.yasaklilik_durumu === 'Yasaklı' && 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30',
                          f.yasaklilik_durumu === 'Temiz' && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30',
                          (f.yasaklilik_durumu === 'Sorgulanmadı' || !f.yasaklilik_durumu) && 'bg-slate-50 text-slate-500 dark:bg-slate-900/30 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
                        )}>
                          {f.yasaklilik_durumu === 'Yasaklı' && '🔴 Yasaklı'}
                          {f.yasaklilik_durumu === 'Temiz' && '🟢 Temiz'}
                          {(f.yasaklilik_durumu === 'Sorgulanmadı' || !f.yasaklilik_durumu) && '⚪ Sorgulanmadı'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                      {f.telefon && <p>📞 Telefon: {f.telefon}</p>}
                      {f.email && <p>✉️ E-posta: {f.email}</p>}
                      {f.adres && <p className="truncate" title={f.adres}>📍 Adres: {f.adres}</p>}
                      <p>🏦 Vergi: {f.vergi_dairesi || '-'} / {f.vergi_no || '-'}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">
                    <div>
                      {f.yasaklilik_belgesi && (
                        <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                          📄 Belge Yüklendi
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setActiveFirmaForQuery(f)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Sorgula / Belge
                      </button>
                      <button
                        onClick={() => handleRemoveFirm(f.temin_firma_id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/15 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Çıkar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* YASAKLI SORGULAMA DETAY MODAL */}
      {activeFirmaForQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                Yasaklılık Sorgulama & Belge Yükleme
              </h3>
              <button
                onClick={() => {
                  setActiveFirmaForQuery(null)
                  loadFirms()
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Firma Bilgileri */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                1. Sorgulanacak İstekli Bilgileri
              </span>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-3">
                <div>
                  <label className="block text-[9px] text-slate-400 font-semibold mb-0.5">Yasaklanan Adı / Ünvan</label>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 break-all">{activeFirmaForQuery.unvan}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeFirmaForQuery.unvan)
                        alert('Ünvan kopyalandı.')
                      }}
                      className="px-2 py-1 text-[9px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-400 rounded-lg font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      Kopyala
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] text-slate-400 font-semibold mb-0.5">Vergi / Kimlik No</label>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{activeFirmaForQuery.vergi_no || '-'}</span>
                      {activeFirmaForQuery.vergi_no && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(activeFirmaForQuery.vergi_no)
                            alert('Vergi numarası kopyalandı.')
                          }}
                          className="px-2 py-1 text-[9px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-400 rounded-lg font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          Kopyala
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 font-semibold mb-0.5">Vergi Dairesi</label>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{activeFirmaForQuery.vergi_dairesi || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Sorgulama Kanalları */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                2. Sorgulama Kanalları (Yeni Pencerede Aç)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* EKAP */}
                <button
                  onClick={() => {
                    window.electron?.ipcRenderer.send('window:open-external', {
                      url: 'https://ekapv2.kik.gov.tr/sorgulamalar/yasak-sorgulama',
                      title: 'EKAP Kamu İhale Yasaklı Sorgulama'
                    })
                  }}
                  className="flex flex-col items-center text-center p-4 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-700 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-blue-50/10 dark:hover:bg-blue-900/5 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="h-10 flex items-center justify-center mb-2">
                    <img
                      src="https://ekapv2.kik.gov.tr/authzsvc/assets/ekap-logo-paths.svg"
                      alt="EKAP Logo"
                      className="h-7 object-contain brightness-95 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const el = e.currentTarget.parentElement?.querySelector('.fallback-text')
                        if (el) (el as HTMLElement).style.display = 'block'
                      }}
                    />
                    <span className="fallback-text hidden text-sm font-bold text-slate-700 dark:text-slate-350">EKAP Portal</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">EKAP Yasaklı Sorgula</span>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                    İhale Kayıt No, Vergi/TCKN, Unvan ile detaylı KİK sorgulaması yapın.
                  </p>
                </button>

                {/* e-Devlet */}
                <button
                  onClick={() => {
                    window.electron?.ipcRenderer.send('window:open-external', {
                      url: 'https://www.turkiye.gov.tr/kik-yasakli-sorgula',
                      title: 'e-Devlet KİK Yasaklılık Sorgulama'
                    })
                  }}
                  className="flex flex-col items-center text-center p-4 border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-700 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-red-50/10 dark:hover:bg-red-900/5 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="h-10 flex items-center justify-center mb-2">
                    <img
                      src="https://cdn.e-devlet.gov.tr/downloads/kurumsal-kimlik/logo/e-devlet-logo.png"
                      alt="e-Devlet Logo"
                      className="h-8 object-contain brightness-95 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const el = e.currentTarget.parentElement?.querySelector('.fallback-text')
                        if (el) (el as HTMLElement).style.display = 'block'
                      }}
                    />
                    <span className="fallback-text hidden text-sm font-bold text-slate-700 dark:text-slate-350">e-Devlet Kapısı</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">e-Devlet Yasaklı Sorgula</span>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                    Vergi No, Yasaklanan Adı ve TCKN/VKN ile e-Devlet kapısı üzerinden sorgulama yapın.
                  </p>
                </button>
              </div>
            </div>

            {/* Step 3: Belge Yükleme */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                3. Sorgu Sonuç Belgesi Yükleme (PDF / Görsel)
              </span>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-3">
                <p className="text-[10px] text-slate-500 leading-normal">
                  Sorgulama sonucunu içeren ekran çıktısını PDF veya Görsel olarak kaydedip dosyaya ekleyin. Belge doğrudan çalışma dosyanıza (.dtm) kaydedilecektir.
                </p>

                {activeFirmaForQuery.yasaklilik_belgesi ? (
                  <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={activeFirmaForQuery.yasaklilik_belgesi.split('/').pop()}>
                        {activeFirmaForQuery.yasaklilik_belgesi.split('/').pop()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            const res = await window.electron.ipcRenderer.invoke('workspace:open-file', activeFirmaForQuery.yasaklilik_belgesi)
                            if (!res.success) alert('Dosya açılamadı.')
                          } catch (err: any) {
                            alert('Hata: ' + err.message)
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                        title="Dosyayı Aç"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Bu belgeyi dosyadan kaldırmak istediğinize emin misiniz?')) return
                          try {
                            const res = await window.electron.ipcRenderer.invoke(
                              'db:run',
                              'UPDATE DATA_TeminFirma SET yasaklilik_belgesi = NULL WHERE id = ?',
                              [activeFirmaForQuery.temin_firma_id]
                            )
                            if (res.success) {
                              setActiveFirmaForQuery({ ...activeFirmaForQuery, yasaklilik_belgesi: null })
                            }
                          } catch (err: any) {
                            alert('Belge kaldırılırken hata: ' + err.message)
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                        title="Belgeyi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        const openRes = await window.electron.ipcRenderer.invoke('dialog:showOpenDialog')
                        if (openRes.success && openRes.filePaths && openRes.filePaths.length > 0) {
                          const uploadRes = await window.electron.ipcRenderer.invoke('workspace:upload-file', openRes.filePaths[0])
                          if (uploadRes.success) {
                            const dbRes = await window.electron.ipcRenderer.invoke(
                              'db:run',
                              'UPDATE DATA_TeminFirma SET yasaklilik_belgesi = ? WHERE id = ?',
                              [uploadRes.relativePath, activeFirmaForQuery.temin_firma_id]
                            )
                            if (dbRes.success) {
                              setActiveFirmaForQuery({ ...activeFirmaForQuery, yasaklilik_belgesi: uploadRes.relativePath })
                              alert('Sorgulama belgesi başarıyla dosyaya kaydedildi.')
                            } else {
                              alert('Veritabanına kaydedilirken hata: ' + dbRes.error)
                            }
                          } else {
                            alert('Dosya yüklenirken hata: ' + uploadRes.error)
                          }
                        }
                      } catch (err: any) {
                        alert('Hata: ' + err.message)
                      }
                    }}
                    className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:bg-blue-500/5 transition-all cursor-pointer text-slate-500 hover:text-blue-600"
                  >
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-[11px] font-bold">Sonuç Belgesi Seçin ve Yükleyin</span>
                    <span className="text-[9px] text-slate-400">PDF, JPG, PNG formatları desteklenir.</span>
                  </button>
                )}
              </div>
            </div>

            {/* Step 4: Sonuç Durumu */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                4. Yasaklılık Durumunu İşaretleyin
              </span>
              <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl">
                {['Sorgulanmadı', 'Temiz', 'Yasaklı'].map((status) => {
                  const isActive = activeFirmaForQuery.yasaklilik_durumu === status

                  return (
                    <button
                      key={status}
                      onClick={async () => {
                        try {
                          const res = await window.electron.ipcRenderer.invoke(
                            'db:run',
                            'UPDATE DATA_TeminFirma SET yasaklilik_durumu = ? WHERE id = ?',
                            [status, activeFirmaForQuery.temin_firma_id]
                          )
                          if (res.success) {
                            setActiveFirmaForQuery({ ...activeFirmaForQuery, yasaklilik_durumu: status })
                          }
                        } catch (err: any) {
                          alert('Durum güncellenirken hata: ' + err.message)
                        }
                      }}
                      className={cn(
                        'flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center',
                        isActive
                          ? status === 'Yasaklı'
                            ? 'bg-red-600 text-white shadow-md'
                            : status === 'Temiz'
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-slate-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      )}
                    >
                      {status === 'Sorgulanmadı' && '⚪ Sorgulanmadı'}
                      {status === 'Temiz' && '🟢 Temiz'}
                      {status === 'Yasaklı' && '🔴 Yasaklı'}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setActiveFirmaForQuery(null)
                  loadFirms()
                }}
                className="bg-slate-850 hover:bg-slate-900 text-white text-xs font-bold rounded-xl px-5 py-2 cursor-pointer"
              >
                Kapat ve Listeyi Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </SubScreen>
  )
}

// 4. YAKLAŞIK MALİYET CETVELİ & TEKLİF MATRIX
export function YaklasikMaliyetCetveli(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const [items, setItems] = useState<any[]>([])
  const [firms, setFirms] = useState<any[]>([])
  const [bids, setBids] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const loadMatrix = async (): Promise<void> => {
    if (!activeDosyaId) return
    setLoading(true)
    try {
      const resItems = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
        [activeDosyaId]
      )
      const resFirms = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT df.id as temin_firma_id, f.unvan, f.id as firma_id 
         FROM DATA_TeminFirma df 
         JOIN TANIM_Firma f ON df.firma_id = f.id 
         WHERE df.temin_dosya_id = ?`,
        [activeDosyaId]
      )
      const resBids = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?',
        [activeDosyaId]
      )

      if (resItems.success) setItems(resItems.data)
      if (resFirms.success) setFirms(resFirms.data)

      if (resBids.success) {
        const bidsMap: Record<string, number> = {}
        resBids.data.forEach((b: any) => {
          bidsMap[`${b.temin_kalem_id}_${b.temin_firma_id}`] = b.birim_fiyat
        })
        setBids(bidsMap)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatrix()
  }, [activeDosyaId])

  const handlePriceChange = (itemId: number, teminFirmaId: number, val: string): void => {
    const numVal = parseFloat(val) || 0
    setBids((prev) => ({
      ...prev,
      [`${itemId}_${teminFirmaId}`]: numVal
    }))
  }

  const handleSavePrice = async (itemId: number, teminFirmaId: number): Promise<void> => {
    const price = bids[`${itemId}_${teminFirmaId}`] || 0
    try {
      // Atomic DELETE and INSERT
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ? AND temin_kalem_id = ? AND temin_firma_id = ?',
        [activeDosyaId, itemId, teminFirmaId]
      )
      if (price > 0) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT INTO DATA_TeminKalemTeklif (temin_dosya_id, temin_kalem_id, temin_firma_id, birim_fiyat) VALUES (?, ?, ?, ?)',
          [activeDosyaId, itemId, teminFirmaId, price]
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Calculation helpers
  const getItemPrices = (itemId: number): number[] => {
    return firms
      .map((f) => bids[`${itemId}_${f.temin_firma_id}`] || 0)
      .filter((p) => p > 0)
  }

  const getItemMinPrice = (itemId: number): number => {
    const prices = getItemPrices(itemId)
    return prices.length > 0 ? Math.min(...prices) : 0
  }

  const getItemAvgPrice = (itemId: number): number => {
    const prices = getItemPrices(itemId)
    if (prices.length === 0) return 0
    const sum = prices.reduce((a, b) => a + b, 0)
    return sum / prices.length
  }

  const getFirmTotal = (teminFirmaId: number): number => {
    return items.reduce((sum, item) => {
      const price = bids[`${item.id}_${teminFirmaId}`] || 0
      return sum + item.miktar * price
    }, 0)
  }

  const getEstimatedCostTotal = (): number => {
    return items.reduce((sum, item) => {
      const avg = getItemAvgPrice(item.id)
      return sum + item.miktar * avg
    }, 0)
  }

  const handleSaveToDosya = async (): Promise<void> => {
    const total = getEstimatedCostTotal()
    if (total === 0) {
      alert('Yaklaşık maliyet ₺0.00 olamaz. Lütfen önce teklif fiyatları girin.')
      return
    }

    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminDosyasi SET yaklasik_maliyet = ? WHERE id = ?',
        [total, activeDosyaId]
      )
      if (res.success) {
        alert(`Yaklaşık maliyet başarıyla güncellendi: ₺ ${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`)
      } else {
        alert(res.error)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <SubScreen
      title="Yaklaşık Maliyet Hesap Cetveli"
      icon={FileSpreadsheet}
      description="İstekli tedarikçilerin fiyat tekliflerini girin ve piyasa ortalama yaklaşık maliyetini hesaplayın."
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-150">Teklif Girişleri & Maliyet Matrisi</h3>
            <p className="text-xs text-slate-500 mt-0.5">Fiyat girdikten sonra kaydetmek için alandan çıkın (onBlur).</p>
          </div>

          {items.length > 0 && firms.length > 0 && (
            <button
              onClick={handleSaveToDosya}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              Maliyeti Dosyaya Kaydet
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">Yükleniyor...</div>
        ) : items.length === 0 || firms.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-slate-350" />
            <p className="text-xs">Bu ekranda işlem yapabilmek için dosyada en az **1 adet malzeme kalemi** ve **1 adet istekli firma** bulunmalıdır.</p>
            <div className="flex gap-3 mt-3">
              <Link to="/dosya/malzemeler/liste" className="text-blue-600 underline font-bold text-xs">Kalem Ekle</Link>
              <Link to="/dosya/firmalar-maliyet/istekliler" className="text-blue-600 underline font-bold text-xs">Firma Ekle</Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 text-[11px]">
              <thead>
                <tr className="bg-slate-55 dark:bg-slate-950 font-bold">
                  <th className="border border-slate-200 dark:border-slate-800 p-2.5 min-w-[150px]">Malzeme Adı (Miktar)</th>
                  {firms.map((f) => (
                    <th key={f.temin_firma_id} className="border border-slate-200 dark:border-slate-800 p-2.5 text-center min-w-[120px]">
                      <span className="block truncate max-w-[110px]" title={f.unvan}>{f.unvan}</span>
                      <span className="text-[9px] text-slate-400 font-normal">Birim Teklifi (₺)</span>
                    </th>
                  ))}
                  <th className="border border-slate-200 dark:border-slate-800 p-2.5 text-center min-w-[90px] bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400">En Düşük (₺)</th>
                  <th className="border border-slate-200 dark:border-slate-800 p-2.5 text-center min-w-[90px] bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-450">Ortalama (₺)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-250 dark:divide-slate-800">
                {items.map((item) => {
                  const minPrice = getItemMinPrice(item.id)
                  const avgPrice = getItemAvgPrice(item.id)

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/10">
                      <td className="border border-slate-200 dark:border-slate-800 p-2.5 font-bold text-slate-800 dark:text-slate-200">
                        <div>{item.kalem_adi}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">{item.miktar} {item.birim}</div>
                      </td>

                      {firms.map((f) => {
                        const price = bids[`${item.id}_${f.temin_firma_id}`] || 0
                        const isMin = price > 0 && price === minPrice

                        return (
                          <td
                            key={f.temin_firma_id}
                            className={cn(
                              "border border-slate-200 dark:border-slate-800 p-2 text-center transition-colors",
                              isMin && "bg-green-50/40 dark:bg-green-950/15"
                            )}
                          >
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={bids[`${item.id}_${f.temin_firma_id}`] || ''}
                              onChange={(e) => handlePriceChange(item.id, f.temin_firma_id, e.target.value)}
                              onBlur={() => handleSavePrice(item.id, f.temin_firma_id)}
                              className="w-full p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded text-center text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {price > 0 && (
                              <span className="text-[9px] text-slate-400 block mt-1">
                                Toplam: ₺{(price * item.miktar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </td>
                        )
                      })}

                      {/* En Düşük Fiyat */}
                      <td className="border border-slate-200 dark:border-slate-800 p-2 text-center font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-900/5">
                        {minPrice > 0 ? `₺ ${minPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>

                      {/* Ortalama Fiyat */}
                      <td className="border border-slate-200 dark:border-slate-800 p-2 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/5">
                        {avgPrice > 0 ? `₺ ${avgPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                    </tr>
                  )
                })}

                {/* Toplam Satırı */}
                <tr className="bg-slate-50 dark:bg-slate-950 font-black">
                  <td className="border border-slate-200 dark:border-slate-800 p-3 text-right">TOPLAM TEKLİFLER:</td>
                  {firms.map((f) => {
                    const total = getFirmTotal(f.temin_firma_id)
                    return (
                      <td key={f.temin_firma_id} className="border border-slate-200 dark:border-slate-800 p-3 text-center font-mono text-slate-800 dark:text-slate-100">
                        ₺ {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                    )
                  })}
                  <td className="border border-slate-200 dark:border-slate-800 p-3 bg-blue-50/30 dark:bg-blue-900/10"></td>
                  <td className="border border-slate-200 dark:border-slate-800 p-3 text-center font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/15">
                    ₺ {getEstimatedCostTotal().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SubScreen>
  )
}

// 5. PİYASA FİYAT ARAŞTIRMA TUTANAĞI (PRINT VIEW)
export function PiyasaArastirmaTutanağı(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const [items, setItems] = useState<any[]>([])
  const [firms, setFirms] = useState<any[]>([])
  const [bids, setBids] = useState<Record<string, number>>({})
  const [komisyon, setKomisyon] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeDosyaId) return
    setLoading(true)

    const fetchAll = async () => {
      try {
        const resItems = await window.electron.ipcRenderer.invoke('db:query', 'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC', [activeDosyaId])
        const resFirms = await window.electron.ipcRenderer.invoke('db:query', `SELECT df.id as temin_firma_id, f.unvan, f.id as firma_id FROM DATA_TeminFirma df JOIN TANIM_Firma f ON df.firma_id = f.id WHERE df.temin_dosya_id = ?`, [activeDosyaId])
        const resBids = await window.electron.ipcRenderer.invoke('db:query', 'SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?', [activeDosyaId])
        const resKoms = await window.electron.ipcRenderer.invoke('db:query', 'SELECT tk.*, p.ad_soyad, p.unvan FROM DATA_TeminKomisyon tk JOIN TANIM_Personel p ON tk.personel_id = p.id WHERE tk.temin_dosya_id = ? AND tk.komisyon_turu = \'Fiyat Araştırma\'', [activeDosyaId])

        if (resItems.success) setItems(resItems.data)
        if (resFirms.success) setFirms(resFirms.data)
        if (resKoms.success) setKomisyon(resKoms.data)

        if (resBids.success) {
          const bidsMap: Record<string, number> = {}
          resBids.data.forEach((b: any) => {
            bidsMap[`${b.temin_kalem_id}_${b.temin_firma_id}`] = b.birim_fiyat
          })
          setBids(bidsMap)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [activeDosyaId])

  const getItemAvgPrice = (itemId: number): number => {
    const prices = firms
      .map((f) => bids[`${itemId}_${f.temin_firma_id}`] || 0)
      .filter((p) => p > 0)
    if (prices.length === 0) return 0
    const sum = prices.reduce((a, b) => a + b, 0)
    return sum / prices.length
  }

  return (
    <SubScreen
      title="Piyasa Fiyat Araştırma Tutanağı"
      icon={FileSpreadsheet}
      description="Resmi mevzuata uygun formatta hazırlanmış imzaya hazır Piyasa Fiyat Araştırma Tutanağı."
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Tutanak Yazdır
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-md max-w-5xl mx-auto font-sans text-slate-850 dark:text-slate-200 print:shadow-none print:border-none print:p-0">
        <div className="text-center font-bold uppercase space-y-1 pb-6 border-b-2 border-slate-350 dark:border-slate-850">
          <h2 className="text-sm">PİYASA FİYAT ARAŞTIRMA TUTANAĞI</h2>
          <p className="text-[10px] text-slate-400 normal-case font-normal mt-1">4734 Sayılı KİK Madde 22/d Kapsamında Yapılan Alımlara İlişkindir</p>
        </div>

        <div className="py-6 space-y-4 text-xs">
          <p className="leading-relaxed">
            İdaremizin ihtiyacı olan ve doğrudan temin usulüyle satın alınacak olan işbu listedeki kalemlere ait piyasada yapılan araştırmalar neticesinde firmaların teklif ettikleri birim fiyatlar ve ortalamaları aşağıdaki gibi tespit edilmiştir.
          </p>

          <table className="w-full border-collapse border border-slate-300 dark:border-slate-800 text-[10px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="border border-slate-300 dark:border-slate-800 p-2 text-center w-8">S.N</th>
                <th className="border border-slate-300 dark:border-slate-800 p-2">Malzeme Adı</th>
                <th className="border border-slate-300 dark:border-slate-800 p-2 text-center w-12">Miktar</th>
                <th className="border border-slate-300 dark:border-slate-800 p-2 text-center w-12">Birim</th>
                {firms.map(f => (
                  <th key={f.temin_firma_id} className="border border-slate-300 dark:border-slate-800 p-2 text-center max-w-[90px] truncate" title={f.unvan}>
                    {f.unvan}
                  </th>
                ))}
                <th className="border border-slate-300 dark:border-slate-800 p-2 text-center w-20">Ortalama (₺)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5 + firms.length} className="border border-slate-300 dark:border-slate-800 p-4 text-center italic text-slate-400">Yükleniyor...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5 + firms.length} className="border border-slate-300 dark:border-slate-800 p-4 text-center italic text-slate-400">Kayıtlı kalem veya istekli bulunamadı.</td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const avg = getItemAvgPrice(item.id)
                  return (
                    <tr key={item.id}>
                      <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-300 dark:border-slate-800 p-2 font-bold">{item.kalem_adi}</td>
                      <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-mono">{item.miktar}</td>
                      <td className="border border-slate-300 dark:border-slate-800 p-2 text-center">{item.birim}</td>
                      {firms.map(f => {
                        const price = bids[`${item.id}_${f.temin_firma_id}`] || 0
                        return (
                          <td key={f.temin_firma_id} className="border border-slate-300 dark:border-slate-800 p-2 text-center font-mono">
                            {price > 0 ? price.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '-'}
                          </td>
                        )
                      })}
                      <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-mono font-bold bg-slate-50 dark:bg-slate-900">
                        {avg > 0 ? avg.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* SIGNATURE SECTION */}
          <div className="pt-16">
            <h4 className="text-center font-bold mb-8 uppercase text-[10px]">FİYAT ARAŞTIRMA KOMİSYON ÜYELERİ İMZALARI</h4>
            <div className="flex flex-wrap justify-center gap-12">
              {komisyon.length === 0 ? (
                <div className="text-slate-450 italic text-[10px]">
                  Fiyat Araştırma Komisyonu atanmamış. İmzalar için lütfen önce Fiyat Araştırma Komisyonu ekranından personel görevlendirin.
                </div>
              ) : (
                komisyon.map(m => (
                  <div key={m.id} className="text-center min-w-[150px] space-y-1">
                    <span className="block font-black">{m.ad_soyad}</span>
                    <span className="block text-[10px] text-slate-500 uppercase">{m.unvan || 'Personel'}</span>
                    <span className="block text-[10px] text-blue-600 font-bold">Komisyon {m.gorevi}</span>
                    <span className="block text-[9px] text-slate-400 pt-6">(İmza)</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </SubScreen>
  )
}

// 6. FİYAT ARAŞTIRMA KOMİSYONU ATAMA SCREEN
export function FiyatArastirmaKomisyonu(): React.JSX.Element {
  return <KomisyonAtamaForm tur="Fiyat Araştırma" title="Fiyat Araştırma Komisyonu Atama" />
}

// 7. MUAYENE KABUL KOMİSYONU ATAMA SCREEN
export function MuayeneKabulKomisyonu(): React.JSX.Element {
  return <KomisyonAtamaForm tur="Muayene Kabul" title="Muayene Kabul Komisyonu Atama" />
}

// Reusable Komisyon Atama Form Component
interface KomisyonAtamaProps {
  tur: 'Fiyat Araştırma' | 'Muayene Kabul'
  title: string
}

function KomisyonAtamaForm({ tur, title }: KomisyonAtamaProps): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const [members, setMembers] = useState<any[]>([])
  const [personnel, setPersonnel] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [selectedPersId, setSelectedPersId] = useState<number | null>(null)
  const [gorevi, setGorevi] = useState('Üye')

  const loadKomisyon = async (): Promise<void> => {
    if (!activeDosyaId) return
    setLoading(true)
    try {
      const resMembers = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT tk.id as member_id, p.*, tk.gorevi 
         FROM DATA_TeminKomisyon tk 
         JOIN TANIM_Personel p ON tk.personel_id = p.id 
         WHERE tk.temin_dosya_id = ? AND tk.komisyon_turu = ?`,
        [activeDosyaId, tur]
      )
      const resPers = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC'
      )
      if (resMembers.success) setMembers(resMembers.data)
      if (resPers.success) setPersonnel(resPers.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKomisyon()
  }, [activeDosyaId, tur])

  const handleAddMember = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedPersId) return

    // Prevent duplicates in same commission
    if (members.some((m) => m.id === selectedPersId)) {
      alert('Bu personel zaten komisyonda görevli.')
      return
    }

    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'INSERT INTO DATA_TeminKomisyon (temin_dosya_id, personel_id, komisyon_turu, gorevi) VALUES (?, ?, ?, ?)',
        [activeDosyaId, selectedPersId, tur, gorevi]
      )
      if (res.success) {
        setSelectedPersId(null)
        setGorevi('Üye')
        loadKomisyon()
      } else {
        alert(res.error)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleRemoveMember = async (memberId: number): Promise<void> => {
    if (!confirm('Komisyon üyesini görevden almak istediğinize emin misiniz?')) return
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminKomisyon WHERE id = ?',
        [memberId]
      )
      if (res.success) {
        loadKomisyon()
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
      {/* ASSIGN FORM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-purple-600" />
          Komisyon Üyesi Görevlendir
        </h3>

        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Personel Seçimi
            </label>
            <select
              value={selectedPersId || ''}
              onChange={(e) => setSelectedPersId(parseInt(e.target.value, 10) || null)}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200"
            >
              <option value="">Personel Seçiniz...</option>
              {personnel.map((p) => (
                <option key={p.id} value={p.id}>{p.ad_soyad} - {p.unvan || 'Unvansız'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Komisyon Görevi / Rolü
            </label>
            <select
              value={gorevi}
              onChange={(e) => setGorevi(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200"
            >
              <option value="Başkan">Komisyon Başkanı</option>
              <option value="Üye">Komisyon Üyesi</option>
              <option value="Yedek Üye">Yedek Üye</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Üyeyi Komisyona Ekle
          </button>
        </form>
      </div>

      {/* MEMBERS LIST */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm min-h-[350px] flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
          {title} ({members.length})
        </h3>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">Yükleniyor...</div>
        ) : members.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Users className="w-10 h-10 text-slate-350 dark:text-slate-700 mb-2 animate-pulse" />
            <p className="text-xs">Bu komisyonda henüz görevli personel atanmamış.</p>
            <p className="text-[10px] text-slate-500 mt-1">Sol taraftaki paneli kullanarak üyeleri atayabilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[400px] custom-scrollbar pr-1">
            {members.map((m) => (
              <div
                key={m.member_id}
                className="p-4 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all bg-slate-50/20 dark:bg-slate-950/20"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 truncate">
                      {m.ad_soyad}
                    </h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                      m.gorevi === 'Başkan' && 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400',
                      m.gorevi === 'Üye' && 'bg-blue-100 text-blue-750 dark:bg-blue-900/30 dark:text-blue-400',
                      m.gorevi === 'Yedek Üye' && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    )}>
                      {m.gorevi}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-[10px] text-slate-550 dark:text-slate-400 font-medium">
                    <p>💼 Unvan: {m.unvan || 'Belirtilmemiş'}</p>
                    <p>🏢 Kurum Birim: {m.birim || '-'}</p>
                    {m.sicil_no && <p>🆔 Sicil No: {m.sicil_no}</p>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                  <button
                    onClick={() => handleRemoveMember(m.member_id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/15 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Görevi Sonlandır
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// REST OF THE PLACEHOLDER SCREENS FOR DOCUMENTS
export function FiyatArastirmaMuayeneKomisyonu(): React.JSX.Element {
  return (
    <SubScreen
      title="Fiyat Araştırma ve Muayene Komisyonu"
      icon={Users}
      description="Ortak komisyon görev tanımları ve kurul atama detayları."
    >
      <KomisyonAtamaForm tur="Fiyat Araştırma" title="Komisyon Bilgileri" />
    </SubScreen>
  )
}

export function KomisyonAtamaOnayEki(): React.JSX.Element {
  return (
    <SubScreen
      title="Komisyon Atama Onay Eki"
      icon={Users}
      description="Komisyon atamalarına ait üst onay yazıları ve ek belgeleri."
    />
  )
}

export function LuzumMuzekkeresiBelgesi(): React.JSX.Element {
  return (
    <SubScreen
      title="Lüzum Müzekkeresi Belgesi"
      icon={Layers}
      description="Lüzum onay belgesi ve talep müzekkeresi evrağı."
    />
  )
}

export function LuzumOnayEki(): React.JSX.Element {
  return (
    <SubScreen
      title="Lüzum Onay Eki"
      icon={Layers}
      description="Lüzum onay belgesine ait resmi ekler ve tablolar."
    />
  )
}

export function LuzumTeslimTesellum(): React.JSX.Element {
  return (
    <SubScreen
      title="Teslim Tesellüm Belgesi"
      icon={Layers}
      description="Mal ve hizmetlerin teslim edildiğine dair teslim tesellüm tutanağı."
    />
  )
}

export function DogrudanTeminOnayBelgesi(): React.JSX.Element {
  return (
    <SubScreen
      title="Doğrudan Temin Onay Belgesi"
      icon={FileCheck}
      description="Harcama yetkilisi onayına sunulacak Doğrudan Temin Onay Belgesi."
    />
  )
}

export function IhaleOnayBelgesi(): React.JSX.Element {
  return (
    <SubScreen
      title="İhale Onay Belgesi"
      icon={FileCheck}
      description="İhale onay formu ve resmi karar şablonu."
    />
  )
}

export function ButceSorgusu(): React.JSX.Element {
  return (
    <SubScreen
      title="Bütçe Sorgusu"
      icon={FileCheck}
      description="Kullanılabilir bütçe ödenek limitlerinin ve harcama sorgularının detayları."
    />
  )
}

export function HarcamaTalimati(): React.JSX.Element {
  return (
    <SubScreen
      title="Harcama Talimatı"
      icon={CreditCard}
      description="Harcama yetkilisinden alınan resmi harcama talimatı evrağı."
    />
  )
}

export function HarcamaPusulasi(): React.JSX.Element {
  return (
    <SubScreen
      title="Harcama Pusulası"
      icon={CreditCard}
      description="Yapılan giderler için düzenlenen harcama pusulası belgesi."
    />
  )
}
export * from './CiktiMerkezi.screen'

import React, { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Star, FileText, Plus, Trash2, FolderOpen, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useSablonlar } from '../sablonlar/sablonlar.hooks'
import { subPagesMapping } from '../../constants/surecler'

// DB'den gelen route_path'e fallback: şablon adı bilinmiyorsa çıktı merkezine git
const FALLBACK_ROUTE = '/dosya/cikti-merkezi'

export default function TaslakYoneticisi(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'kisayollar' | 'taslaklar'>('kisayollar')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const {
    activeDosyaId,
    setActiveDosyaId,
    setActiveStarredDocs
  } = useWorkspaceStore()

  // Şablonları çek — route_path DB'den geliyor
  const { data: sablonlar = [] } = useSablonlar()

  // Şablon adı → route_path eşleşmesi (tümü DB ve süreç tanımları)
  const routeMap = useMemo(() => {
    const map: Record<string, string> = {}

    // Statik süreç sayfaları
    subPagesMapping.forEach((p) => {
      map[p.name] = p.path
    })

    // Dinamik şablonlar
    sablonlar.forEach((s) => {
      if (s.route_path) map[s.ad] = s.route_path
    })
    return map
  }, [sablonlar])

  // Tüm aktif temin dosyalarını çekelim
  const { data: dosyalar = [], isLoading: dosyalarLoading, refetch: refetchDosyalar } = useQuery({
    queryKey: ['dosyalar_all_active_shortcuts'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, temin_no, konu, starred_docs FROM DATA_TeminDosyasi WHERE is_deleted = 0 ORDER BY id DESC'
      )
      if (!res.success) return []
      return res.data.map((d: any) => {
        try {
          return {
            ...d,
            starred: JSON.parse(d.starred_docs || '[]')
          }
        } catch {
          return { ...d, starred: [] }
        }
      })
    }
  })

  // Süreç Taslaklarını bulalım
  const { data: taslaklar = [], isLoading: taslaklarLoading } = useQuery({
    queryKey: ['surec_taslaklar'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_SurecTaslak WHERE aktif_mi = 1'
      )
      if (!res.success) return []
      return res.data
    }
  })

  const activeDosya = useMemo(() => {
    return dosyalar.find((d) => d.id === activeDosyaId)
  }, [dosyalar, activeDosyaId])

  // Kısayol Yıldızla / Kaldır
  const toggleStar = async (dosyaId: number, currentStarred: string[], docName: string) => {
    let updated = [...currentStarred]
    if (updated.includes(docName)) {
      updated = updated.filter((d) => d !== docName)
    } else {
      updated.push(docName)
    }

    await window.electron.ipcRenderer.invoke(
      'db:execute',
      'UPDATE DATA_TeminDosyasi SET starred_docs = ? WHERE id = ?',
      JSON.stringify(updated),
      dosyaId
    )

    if (dosyaId === activeDosyaId) {
      setActiveStarredDocs(updated)
    }

    refetchDosyalar()
  }

  // Kısayol sırasını değiştir
  const moveShortcut = async (
    dosyaId: number,
    currentStarred: string[],
    index: number,
    direction: 'up' | 'down'
  ) => {
    const updated = [...currentStarred]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= updated.length) return

    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    await window.electron.ipcRenderer.invoke(
      'db:execute',
      'UPDATE DATA_TeminDosyasi SET starred_docs = ? WHERE id = ?',
      JSON.stringify(updated),
      dosyaId
    )

    if (dosyaId === activeDosyaId) {
      setActiveStarredDocs(updated)
    }

    refetchDosyalar()
  }

  // Şablonları kategorilerine göre grupla
  const groupedSablonlar = useMemo(() => {
    const groups: Record<string, typeof sablonlar> = {
      '1. İhtiyaç Tespiti & Başlangıç': [],
      '2. Piyasa Fiyat Araştırması': [],
      '3. Sipariş & Sözleşme': [],
      '4. Kabul & Ödeme İşlemleri': [],
      '5. Klasör & Kapaklar': []
    }

    sablonlar.forEach((s) => {
      const cat = (s.kategori || '').toLowerCase()
      if (cat.includes('1') || cat.includes('ihtiyac') || cat.includes('başlangıç') || cat.includes('baslangic')) {
        groups['1. İhtiyaç Tespiti & Başlangıç'].push(s)
      } else if (cat.includes('2') || cat.includes('fiyat') || cat.includes('araştırma') || cat.includes('arastirma') || cat.includes('maliyet') || cat.includes('piyasa')) {
        groups['2. Piyasa Fiyat Araştırması'].push(s)
      } else if (cat.includes('3') || cat.includes('sipariş') || cat.includes('siparis') || cat.includes('sözleşme') || cat.includes('sozlesme') || cat.includes('ihale') || cat.includes('onay')) {
        groups['3. Sipariş & Sözleşme'].push(s)
      } else if (cat.includes('4') || cat.includes('kabul') || cat.includes('ödeme') || cat.includes('odeme') || cat.includes('teslim')) {
        groups['4. Kabul & Ödeme İşlemleri'].push(s)
      } else if (cat.includes('5') || cat.includes('klasör') || cat.includes('klasor') || cat.includes('kapak')) {
        groups['5. Klasör & Kapaklar'].push(s)
      } else {
        groups['1. İhtiyaç Tespiti & Başlangıç'].push(s)
      }
    })

    return groups
  }, [sablonlar])

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            Kısayol & Taslak Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-2xl">
            Aktif dosyalarınızda yıldızladığınız evrakları hızlı erişimde görün ve sık kullandığınız
            belge üretim sıralarını &apos;Taslak&apos; olarak kaydedin.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('kisayollar')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'kisayollar'
              ? 'border-amber-500 text-amber-600 dark:text-amber-500'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Aktif Dosya Kısayolları
        </button>
        <button
          onClick={() => setActiveTab('taslaklar')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'taslaklar'
              ? 'border-blue-500 text-blue-600 dark:text-blue-500'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Kayıtlı İşlem Taslakları
        </button>
      </div>

      {activeTab === 'kisayollar' && (
        <div className="space-y-6">
          {activeDosya ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol Taraf: Aktif Dosya Bilgisi ve Mevcut Kısayollar (Sıralama ile) */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 opacity-10">
                      <Star className="w-40 h-40 fill-white text-white" />
                    </div>
                    <div className="relative z-10">
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded border border-amber-500/30 uppercase tracking-wider">
                        Aktif Çalışma Dosyası
                      </span>
                      <h3 className="font-bold text-sm text-slate-100 mt-2 truncate">
                        {activeDosya.konu}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        Kayıt No: {activeDosya.temin_no}
                      </p>

                      <div className="mt-5 border-t border-slate-700/50 pt-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                          Kısayol Belgeler (Hızlı Erişim Sırası)
                        </span>
                        {activeDosya.starred.length === 0 ? (
                          <p className="text-xs italic text-slate-400">
                            Henüz kısayol eklenmemiş. Aşağıdaki butondan yeni kısayollar ekleyin.
                          </p>
                        ) : (
                          <div className="space-y-2 mb-4">
                            {activeDosya.starred.map((docName: string, idx: number) => {
                              const route = routeMap[docName] || FALLBACK_ROUTE
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 p-2 rounded-xl"
                                >
                                  <Link
                                    to={route}
                                    onClick={() => {
                                      window.electron.ipcRenderer.invoke(
                                        'store:set',
                                        'activeDosyaId',
                                        activeDosya.id
                                      )
                                      setActiveDosyaId(activeDosya.id)
                                    }}
                                    className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 truncate"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                    <span className="truncate">{docName}</span>
                                  </Link>
                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <button
                                      onClick={() =>
                                        moveShortcut(activeDosya.id, activeDosya.starred, idx, 'up')
                                      }
                                      disabled={idx === 0}
                                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                      title="Yukarı Taşı"
                                    >
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        moveShortcut(activeDosya.id, activeDosya.starred, idx, 'down')
                                      }
                                      disabled={idx === activeDosya.starred.length - 1}
                                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                      title="Aşağı Taşı"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        toggleStar(activeDosya.id, activeDosya.starred, docName)
                                      }
                                      className="p-1 hover:bg-red-950/50 rounded text-slate-400 hover:text-red-400 cursor-pointer"
                                      title="Kısayoldan Kaldır"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Kısayol Belgelerini Düzenle
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveDosyaId(null)}
                    className="w-full text-center py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    Başka Bir Dosya Seç
                  </button>
                </div>

                {/* Sağ Taraf: Önizleme ve Hızlı Erişim Rehberi */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-full justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
                        Kısayol Önizleme
                      </h2>
                      <p className="text-xs text-slate-500 mb-6">
                        Seçtiğiniz belgeler, temin dosyalarında çalışırken üst menüde şu şekilde listelenir:
                      </p>

                      {/* Mock Toolbar */}
                      <div className="border border-slate-150 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/40 flex items-center gap-2 flex-wrap">
                        <div className="px-3 py-1.5 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-md text-xs font-semibold flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          Hızlı Erişim
                          <ChevronDown className="w-3 h-3 animate-bounce" />
                        </div>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        {activeDosya.starred.length === 0 ? (
                          <span className="text-xs italic text-slate-400">Henüz eklenmiş kısayol yok.</span>
                        ) : (
                          activeDosya.starred.map((docName: string, idx: number) => (
                            <div
                              key={idx}
                              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-semibold flex items-center gap-1"
                            >
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-1 shrink-0" />
                              {docName}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                      <div className="flex gap-3 items-start text-xs text-slate-500 dark:text-slate-400">
                        <span className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
                          <Plus className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Pratik Belge Üretimi
                          </span>
                          Sol paneldeki &apos;Kısayol Belgelerini Düzenle&apos; butonuna tıklayarak yeni belgeler ekleyebilir, ok işaretleriyle çıktı alma sıranızı belirleyebilirsiniz. Kısayollar her dosyaya özel olarak kaydedilir.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kısayol Ekleme/Düzenleme Modalı */}
              {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-150 dark:border-slate-800 shrink-0">
                      <div>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                          Kısayol Belgelerini Düzenle
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Aktif temin dosyasında hızlı erişim (kısayol) olarak göstermek istediğiniz belgeleri seçin.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAddModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                      >
                        Kapat
                      </button>
                    </div>

                    {/* Modal Body - Scrollable */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(groupedSablonlar).map(([stageName, list]) => (
                          <div
                            key={stageName}
                            className="border border-slate-150 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-805/20"
                          >
                            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                              {stageName}
                            </h4>
                            <div className="space-y-1.5">
                              {list.map((sablon) => {
                                const isStarred = activeDosya.starred.includes(sablon.ad)
                                return (
                                  <button
                                    key={sablon.id}
                                    onClick={() =>
                                      toggleStar(activeDosya.id, activeDosya.starred, sablon.ad)
                                    }
                                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer ${
                                      isStarred
                                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850'
                                    }`}
                                  >
                                    <span className="truncate pr-2">{sablon.ad}</span>
                                    <Star
                                      className={`w-3.5 h-3.5 shrink-0 ${
                                        isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
                                      }`}
                                    />
                                  </button>
                                )
                              })}
                              {list.length === 0 && (
                                <span className="text-xs italic text-slate-400 block py-1">
                                  Bu aşamada bağlı şablon bulunamadı.
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 border-t border-slate-150 dark:border-slate-800 flex justify-end shrink-0">
                      <button
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                      >
                        Tamam
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Aktif Dosya Yoksa: Dosya Seçim Listesi Göster
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <Star className="w-12 h-12 text-amber-500 fill-amber-500/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Aktif Temin Dosyası Bulunamadı
                </h3>
                <p className="text-slate-500 text-xs">
                  Kısayolları ve hızlı erişim evraklarını yönetebilmek için lütfen aşağıdaki listeden çalışmak istediğiniz dosyayı seçiniz.
                </p>
              </div>

              {dosyalarLoading ? (
                <div className="text-center py-4 text-slate-500 text-xs">Yükleniyor...</div>
              ) : dosyalar.length === 0 ? (
                <div className="text-center py-4 text-slate-400 italic text-xs">
                  Henüz oluşturulmuş temin dosyası bulunmuyor.
                </div>
              ) : (
                <div className="space-y-2 mt-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {dosyalar.map((dosya: any) => (
                    <button
                      key={dosya.id}
                      onClick={async () => {
                        await window.electron.ipcRenderer.invoke(
                          'store:set',
                          'activeDosyaId',
                          dosya.id
                        )
                        setActiveDosyaId(dosya.id)
                        setActiveStarredDocs(dosya.starred)
                      }}
                      className="w-full flex items-center justify-between bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-5 h-5 text-blue-500 shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {dosya.konu}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{dosya.temin_no}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'taslaklar' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Yeni Taslak
            </button>
          </div>
          {taslaklarLoading ? (
            <div className="text-center py-8 text-slate-500">Yükleniyor...</div>
          ) : taslaklar.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                Taslak Bulunmuyor
              </h3>
              <p className="text-slate-500 text-sm">
                Sık kullandığınız üretim listelerini buraya taslak olarak kaydedebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taslaklar.map((taslak: any) => {
                const orderedDocs: string[] = JSON.parse(taslak.ordered_docs || '[]')
                return (
                  <div
                    key={taslak.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {taslak.taslak_adi}
                          </div>
                          <div className="text-[10px] text-slate-500">{taslak.tur}</div>
                        </div>
                      </div>
                      <button
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                        title="Taslağı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                      {orderedDocs.map((doc, idx) => {
                        const route = routeMap[doc] || FALLBACK_ROUTE
                        return (
                          <Link
                            key={idx}
                            to={route}
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer dark:bg-blue-900/10 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-500 p-2 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-900/30"
                          >
                            <span className="w-4 text-center font-black opacity-50">
                              {idx + 1}.
                            </span>
                            {doc}
                          </Link>
                        )
                      })}
                      {orderedDocs.length === 0 && (
                        <div className="text-xs text-slate-400 italic">
                          Bu taslakta henüz belge yok.
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

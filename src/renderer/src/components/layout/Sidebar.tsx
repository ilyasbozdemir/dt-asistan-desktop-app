import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Home,
  Settings,
  FileText,
  Users,
  Building2,
  ClipboardList,
  BarChart3,
  Scale,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  LayoutGrid,
  Database,
  PackageSearch,
  FolderTree,
  Megaphone,
  Tag,
  Ruler,
  Compass,
  FileCheck,
  CreditCard,
  HelpCircle
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useSettingsStore } from '../../store/settingsStore'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useDosyalarHooks } from '../../screens/dosyalar/dosyalar.hooks'

interface SubItem {
  name: string
  path: string
  icon: React.ElementType
}

interface MenuItem {
  name: string
  path?: string
  icon: React.ElementType
  children?: SubItem[]
  onClick?: () => void
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Ana Menü',
    items: [{ name: 'Gösterge Paneli', path: '/', icon: Home }]
  },
  {
    title: 'Süreç Yönetimi',
    items: [
      { name: 'Doğrudan Temin Dosyaları', path: '/dosyalar', icon: FileText },
    ]
  },
  {
    title: 'Kayıtlar & Tanımlar',
    items: [
      {
        name: 'Kurum Yönetimi',
        icon: Building2,
        children: [
          { name: 'Kurum Bilgileri', path: '/kurum', icon: Building2 },
          { name: 'Birim Yönetimi', path: '/birimler', icon: LayoutGrid },
          { name: 'Personel Yönetimi', path: '/personel', icon: Users },
          { name: 'Ambar Tanımları', path: '/ambar', icon: Database },
          { name: 'Komisyon Yönetimi', path: '/komisyonlar', icon: Users },
          { name: 'Görev Tanımları', path: '/komisyon-gorevleri', icon: Settings }
        ]
      },
      { name: 'İstekli Firma Yönetimi', path: '/firmalar', icon: Building2 },
      {
        name: 'Malzeme & Kodlar',
        icon: PackageSearch,
        children: [
          { name: 'Mal/Hizmet/Yapım İşleri Listesi', path: '/malzemeler', icon: PackageSearch },
          { name: 'Taşınır Kodları', path: '/tasinirkod', icon: FolderTree },
          { name: 'OKAS Kodları', path: '/okaskod', icon: Tag },
          { name: 'Ölçü Birimleri', path: '/olcubirimleri', icon: Ruler }
        ]
      }
    ]
  },
  {
    title: 'Sistem',
    items: [
      { name: 'Raporlar', path: '/raporlar', icon: BarChart3 },
      { name: 'Sürüm Notları', path: '/changelog', icon: Megaphone },
      { name: 'Yardım & Kılavuzlar', path: '/yardim', icon: HelpCircle },
      {
        name: 'Ayarlar',
        icon: Settings,
        children: [
          { name: 'Genel Ayarlar', path: '/ayarlar', icon: Settings },
          { name: 'Mevzuat ve Parametreler', path: '/mevzuat', icon: Scale },
          { name: 'Toplu İçe Aktarma', path: '/import', icon: Database },
          { name: 'Şablon Yönetimi', path: '/sablonlar', icon: FileText }
        ]
      }
    ]
  }
]

export function Sidebar(): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['/malzemeler', 'Malzeme & Kodlar']))
  const { institutionName, institutionLogo, adminUsername, eButceKodu, loadSettings } =
    useSettingsStore()
  const { closeWorkspace, fileName, activeDosyaId, setActiveDosyaId } = useWorkspaceStore()
  const queryClient = useQueryClient()

  const handleCloseWorkspace = async (): Promise<void> => {
    await closeWorkspace()
    queryClient.clear()
  }

  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const isDosyaWindowMode = searchParams.get('mode') === 'dosya_window' || hashParams.get('mode') === 'dosya_window'



  React.useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const getInitials = (name: string): string => {
    if (!name) return 'SY'
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  // Get active file and its type
  const { dosyalar } = useDosyalarHooks()
  const activeDosya = dosyalar.find((d) => d.id === activeDosyaId)

  // Fetch Alım Türü configs from DB
  interface DbAlimTuru {
    id: string
    ad: string
    ikon: string
    belgeler: (string | { ad: string; sablonId?: string })[]
    sablonId: string
  }

  const { data: dbAlimTurleri = [] } = useQuery<DbAlimTuru[]>({
    queryKey: ['alim_turleri_list'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke('db:query', 'SELECT * FROM TANIM_AlimTuru WHERE aktif_mi = 1')
      if (!res.success) return []
      return res.data.map((d: { id: number; tur_adi: string; ikon: string; belgeler: string; sablon_id: string }) => {
        let parsedBelgeler = []
        try {
          parsedBelgeler = typeof d.belgeler === 'string' ? JSON.parse(d.belgeler) : (d.belgeler || [])
        } catch (e) {
          console.error(e)
        }
        return {
          id: d.id.toString(),
          ad: d.tur_adi,
          ikon: d.ikon,
          belgeler: parsedBelgeler,
          sablonId: d.sablon_id || ''
        }
      })
    }
  })

  const activeAlimTuru = activeDosya
    ? dbAlimTurleri.find((t) => {
      const fileTur = activeDosya.tur?.toLowerCase()
      const dbTur = t.ad?.toLowerCase() || ''
      if (fileTur === 'mal' && dbTur.includes('mal')) return true
      if (fileTur === 'hizmet' && dbTur.includes('hizmet')) return true
      if (fileTur === 'yapim_isi' && (dbTur.includes('yapım') || dbTur.includes('yapim'))) return true
      if (fileTur === 'danismanlik' && (dbTur.includes('danışmanlık') || dbTur.includes('danismanlik'))) return true
      return dbTur === fileTur
    })
    : null

  // Map sidebar item paths to required document keywords
  const documentPathMapping: Record<string, string[]> = {
    '/dosya/komisyon/fiyat-arastirma': ['Piyasa Fiyat Araştırması Tutanağı'],
    '/dosya/komisyon/muayene-kabul': ['Muayene Kabul ve Tespit Komisyonu Tutanağı', 'Hizmet İşleri Kabul Tutanağı', 'Yapım İşleri Kabul Tutanağı'],
    '/dosya/komisyon/fiyat-muayene': ['Piyasa Fiyat Araştırması Tutanağı', 'Muayene Kabul ve Tespit Komisyonu Tutanağı'],
    '/dosya/komisyon/onay-eki': ['Onay Belgesi'],
    '/dosya/malzemeler/talep-formu': ['Onay Belgesi'],
    '/dosya/luzum/belge': ['Onay Belgesi'],
    '/dosya/luzum/onay-eki': ['Onay Belgesi'],
    '/dosya/luzum/teslim-tesellum': ['Muayene Kabul ve Tespit Komisyonu Tutanağı', 'Hizmet İşleri Kabul Tutanağı', 'Yapım İşleri Kabul Tutanağı'],
    '/dosya/firmalar-maliyet/istekliler': ['Piyasa Fiyat Araştırması Tutanağı'],
    '/dosya/firmalar-maliyet/yaklasik': ['Yaklaşık Maliyet Hesap Cetveli', 'Piyasa Fiyat Araştırması Tutanağı'],
    '/dosya/firmalar-maliyet/tutanak': ['Piyasa Fiyat Araştırması Tutanağı'],
    '/dosya/onay/dt-onay': ['Onay Belgesi'],
    '/dosya/onay/ihale-onay': ['Onay Belgesi'],
    '/dosya/onay/butce-sorgu': ['Onay Belgesi'],
    '/dosya/harcama/talimat': ['Onay Belgesi', 'Fatura / e-Arşiv Fatura'],
    '/dosya/harcama/pusula': ['Fatura / e-Arşiv Fatura']
  }

  // Fetch stages dynamically from db
  const { data: dbAsamalar = [] } = useQuery<any[]>({
    queryKey: ['sidebar_asamalar'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke('db:query', 'SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC')
      if (!res.success) return []
      return res.data
    }
  })

  const subPagesMapping = [
    { name: 'Malzeme Listesi', path: '/dosya/malzemeler/liste', icon: PackageSearch, stage: 1 },
    { name: 'İhtiyaç Listesi & Talep', path: '/dosya/malzemeler/talep-formu', icon: PackageSearch, stage: 1 },
    { name: 'Lüzum Müzekkeresi Belgesi', path: '/dosya/luzum/belge', icon: FileText, stage: 1 },
    { name: 'Onay Eki', path: '/dosya/luzum/onay-eki', icon: FileText, stage: 1 },
    { name: 'Bütçe Sorgusu', path: '/dosya/onay/butce-sorgu', icon: FileCheck, stage: 1 },

    { name: 'Fiyat Araştırma Komisyonu', path: '/dosya/komisyon/fiyat-arastirma', icon: Users, stage: 2 },
    { name: 'Fiyat Araştırma & Muayene', path: '/dosya/komisyon/fiyat-muayene', icon: Users, stage: 2 },
    { name: 'İstekli Firmalar', path: '/dosya/firmalar-maliyet/istekliler', icon: Compass, stage: 2 },
    { name: 'Yaklaşık Maliyet', path: '/dosya/firmalar-maliyet/yaklasik', icon: Compass, stage: 2 },
    { name: 'Piyasa Araştırma Tutanağı', path: '/dosya/firmalar-maliyet/tutanak', icon: Compass, stage: 2 },

    { name: 'Komisyon Atama Onay Eki', path: '/dosya/komisyon/onay-eki', icon: Users, stage: 3 },
    { name: 'Doğrudan Temin Onay Belgesi', path: '/dosya/onay/dt-onay', icon: FileCheck, stage: 3 },
    { name: 'İhale Onay Belgesi', path: '/dosya/onay/ihale-onay', icon: FileCheck, stage: 3 },

    { name: 'Muayene Kabul ve Tespit', path: '/dosya/komisyon/muayene-kabul', icon: Users, stage: 4 },
    { name: 'Teslim Tesellüm', path: '/dosya/luzum/teslim-tesellum', icon: FileText, stage: 4 },
    { name: 'Harcama Talimatı', path: '/dosya/harcama/talimat', icon: CreditCard, stage: 4 },
    { name: 'Harcama Pusulası', path: '/dosya/harcama/pusula', icon: CreditCard, stage: 4 }
  ]

  const stagesToUse = dbAsamalar.length > 0 ? dbAsamalar : [
    { asama_sira: 1, asama_adi: 'İhtiyaç Tespiti & Başlangıç' },
    { asama_sira: 2, asama_adi: 'Piyasa Fiyat Araştırması' },
    { asama_sira: 3, asama_adi: 'Sipariş & Sözleşme' },
    { asama_sira: 4, asama_adi: 'Kabul & Ödeme İşlemleri' }
  ]

  const dynamicActiveItems: MenuItem[] = stagesToUse.map((asama) => {
    // Filter subpages that correspond to this stage index
    const stagePages = subPagesMapping.filter((p) => p.stage === asama.asama_sira)

    // Filter based on activeAlimTuru's documents requirement (dynamic document list)
    const filteredChildren = stagePages.filter((child) => {
      if (!activeAlimTuru) return true
      const reqDocs = documentPathMapping[child.path]
      if (!reqDocs) return true
      return reqDocs.some((docName) =>
        activeAlimTuru.belgeler.some((b) => {
          const documentName = typeof b === 'string' ? b : (b?.ad || '')
          return documentName.toLowerCase().includes(docName.toLowerCase()) || docName.toLowerCase().includes(documentName.toLowerCase())
        })
      )
    })

    // Assign appropriate Lucide icon based on stage sequence
    let IconComponent = FolderTree
    if (asama.asama_sira === 1) IconComponent = FolderTree
    else if (asama.asama_sira === 2) IconComponent = PackageSearch
    else if (asama.asama_sira === 3) IconComponent = FileCheck
    else if (asama.asama_sira === 4) IconComponent = CreditCard

    return {
      name: `${asama.asama_sira}. ${asama.asama_adi}`,
      icon: IconComponent,
      children: filteredChildren
    }
  }).filter((group) => group.children && group.children.length > 0)

  const activeGroup = activeDosyaId ? {
    title: 'Aktif Dosya İşlemleri',
    items: dynamicActiveItems
  } : null

  const finalMenuGroups = activeGroup
    ? [
      {
        title: 'Dosya Navigasyonu',
        items: [
          ...(!isDosyaWindowMode ? [{ name: '⬅ Tüm Teminlere Dön', path: '/dosyalar', icon: ChevronLeft, onClick: () => setActiveDosyaId(null) }] : []),
          { name: 'Süreç Takip & Durum', path: '/takip', icon: ClipboardList }
        ]
      },
      activeGroup
    ]
    : menuGroups

  return (
    <div
      className={cn(
        'h-screen bg-sidebar-bg text-sidebar-text flex flex-col shadow-xl shrink-0 transition-all duration-300 relative z-50 border-r border-sidebar-border',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <button
        type="button"
        className={cn(
          "absolute -right-3.5 top-1/2 -translate-y-1/2 z-50",
          "flex items-center justify-center",
          "w-7 h-7 rounded-full cursor-pointer group",
          "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white",
          "border-2 border-slate-50 dark:border-slate-950",
          "shadow-md hover:shadow-lg hover:scale-110 active:scale-95",
          "transition-all duration-300 ease-out"
        )}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onClick={(e) => {
          e.stopPropagation()
          setIsCollapsed(!isCollapsed)
        }}
        title={isCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
      >
        {isCollapsed ? (
          <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        ) : (
          <ChevronLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
        )}
      </button>

      <div
        className={cn(
          'flex flex-col items-center border-b border-sidebar-border transition-all duration-300',
          isCollapsed ? 'py-4 px-0' : 'py-6 px-4'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center transition-all duration-300 shrink-0',
            isCollapsed ? 'w-10 h-10' : 'w-16 h-16'
          )}
        >
          {institutionLogo ? (
            <img src={institutionLogo} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <Building2 className={cn('text-sidebar-active-text', isCollapsed ? 'w-6 h-6' : 'w-10 h-10')} />
          )}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col items-center mt-3 text-center w-full px-1">
            <span className="text-sidebar-text/70 text-[10px] font-semibold tracking-wider uppercase mt-1 w-full px-2 wrap-break-word leading-normal">
              {institutionName}
            </span>

            <span className="text-sidebar-hover-text font-bold text-base tracking-wide whitespace-nowrap truncate leading-tight mt-1">
              DT Asistan
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {finalMenuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold text-sidebar-text/50 uppercase tracking-widest">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const itemKey = item.path || item.name
                const isExpanded = expandedItems.has(itemKey)
                const hasChildren = item.children && item.children.length > 0

                return (
                  <li key={item.name}>
                    <div
                      className="flex items-center gap-1"
                      onClick={() => {
                        if (hasChildren && !item.path) {
                          toggleExpanded(itemKey)
                        }
                      }}
                    >
                      {item.path ? (
                        <Link
                          to={item.path}
                          onClick={() => {
                            if (item.onClick) {
                              item.onClick()
                            }
                          }}
                          className={cn(
                            'flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-transparent cursor-pointer',
                            'hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text',
                            'active:scale-[0.98]'
                          )}
                          activeProps={{
                            className:
                              'bg-sidebar-active-bg text-sidebar-active-text border-sidebar-active-border shadow-sm shadow-blue-500/5 font-bold'
                          }}
                        >
                          <item.icon size={18} className="shrink-0" />
                          {!isCollapsed && (
                            <span className="text-sm font-medium whitespace-nowrap flex-1">{item.name}</span>
                          )}
                        </Link>
                      ) : (
                        <div
                          className={cn(
                            'flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-transparent cursor-pointer text-sidebar-text/80',
                            'hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text',
                            'active:scale-[0.98]'
                          )}
                        >
                          <item.icon size={18} className="shrink-0" />
                          {!isCollapsed && (
                            <span className="text-sm font-medium whitespace-nowrap flex-1">{item.name}</span>
                          )}
                        </div>
                      )}

                      {hasChildren && !isCollapsed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpanded(itemKey)
                          }}
                          className="p-1 rounded-md hover:bg-sidebar-hover-bg text-sidebar-text/50 hover:text-sidebar-hover-text transition-all cursor-pointer"
                          title={isExpanded ? 'Kapat' : 'Genişlet'}
                        >
                          <ChevronDown
                            size={13}
                            className={cn(
                              'transition-transform duration-200',
                              isExpanded ? 'rotate-0' : '-rotate-90'
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {hasChildren && !isCollapsed && isExpanded && (
                      <ul className="mt-0.5 ml-4 pl-3 border-l border-sidebar-border/40 space-y-0.5">
                        {item.children!.map((child) => (
                          <li key={child.name}>
                            <Link
                              to={child.path}
                              className={cn(
                                'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-transparent cursor-pointer',
                                'hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text',
                                'active:scale-[0.98] text-sidebar-text/80'
                              )}
                              activeProps={{
                                className:
                                  'bg-sidebar-active-bg text-sidebar-active-text border-sidebar-active-border shadow-sm font-bold'
                              }}
                            >
                              <child.icon size={14} className="shrink-0 opacity-70" />
                              <span className="whitespace-nowrap">{child.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}

                    {hasChildren && isCollapsed && (
                      <ul className="mt-0.5 space-y-0.5">
                        {item.children!.map((child) => (
                          <li key={child.name}>
                            <Link
                              to={child.path}
                              title={child.name}
                              className={cn(
                                'flex items-center justify-center px-3 py-1.5 rounded-lg transition-all duration-200 border border-transparent cursor-pointer',
                                'hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text'
                              )}
                              activeProps={{
                                className:
                                  'bg-sidebar-active-bg text-sidebar-active-text border-sidebar-active-border shadow-sm'
                              }}
                            >
                              <child.icon size={15} className="shrink-0 opacity-70" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        <Link
          to="/profil"
          className={cn(
            'flex items-center rounded-md bg-sidebar-hover-bg/50 hover:bg-sidebar-hover-bg transition-all border border-transparent hover:border-sidebar-border cursor-pointer',
            isCollapsed ? 'justify-center p-2' : 'px-2 py-2'
          )}
          title="Kullanıcı Profili ve Güvenlik Ayarlarına Git"
        >
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            {institutionLogo ? (
              <img src={institutionLogo} alt="Profil" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full rounded-full bg-sidebar-hover-bg flex items-center justify-center border border-sidebar-border/30">
                <span className="text-sidebar-hover-text text-xs font-bold">
                  {getInitials(adminUsername || 'SY')}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden flex-1">
              <p className="text-sm font-medium text-sidebar-hover-text truncate" title={adminUsername}>
                {adminUsername}
              </p>
              <p className="text-[10px] text-sidebar-text/75 truncate" title={eButceKodu || ''}>
                Kurum Kodu: {eButceKodu || '-'}
              </p>
            </div>
          )}
        </Link>

        <button
          onClick={handleCloseWorkspace}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-sidebar-text/80 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-sidebar-border hover:border-red-500/20',
            isCollapsed ? 'py-2 px-0' : 'py-2'
          )}
          title="Kurum Dosyasını Kapat (.dtm)"
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Kurum Dosyasını Kapat</span>}
        </button>

        {!isCollapsed && (
          <Link
            to="/dosya"
            className="text-[10px] text-center text-sidebar-text/50 font-medium px-2 py-1 truncate bg-sidebar-hover-bg/30 rounded border border-sidebar-border/40 hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text transition-all block cursor-pointer active:scale-95"
            title="Veri Dosyası Detaylarını Göster"
          >
            Dosya: {fileName}
          </Link>
        )}
      </div>
    </div>
  )
}

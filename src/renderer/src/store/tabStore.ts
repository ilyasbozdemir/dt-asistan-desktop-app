import { create } from 'zustand'

export interface TabItem {
  path: string
  label: string
}

interface TabState {
  tabs: TabItem[]
  activeTabPath: string
  addTab: (path: string) => void
  closeTab: (path: string) => string | null // Returns the next path to navigate to, if any
  setActiveTab: (path: string) => void
  updateTabLabel: (path: string, label: string) => void
  clearTabs: () => void
}

export function getTabLabel(fullPath: string): string {
  const path = fullPath.split('?')[0]
  if (path === '/') return 'Gösterge Paneli'
  if (path.startsWith('/dosyalar')) return 'Doğrudan Temin'
  if (path.startsWith('/firmalar')) return 'Firmalar'
  if (path.startsWith('/personel')) return 'Personel Yönetimi'
  if (path.startsWith('/mevzuat')) return 'Mevzuat & Limitler'
  if (path.startsWith('/ayarlar')) return 'Ayarlar'
  if (path.startsWith('/birimler')) return 'Birim Yönetimi'
  if (path.startsWith('/ambar')) return 'Ambar Tanımları'
  if (path.startsWith('/malzemeler/yeni')) return 'Yeni Kayıt (Mal/Hizmet/Yapım İşi)'
  if (path.startsWith('/malzemeler')) return 'Kayıtlı Mal / Hizmet / Yapım İşleri Listesi'
  if (path.startsWith('/kurum')) return 'Kurum Bilgileri'
  if (path.startsWith('/olcubirimleri')) return 'Ölçü Birimleri'
  if (path.startsWith('/profil')) return 'Kullanıcı Profili'
  if (path.startsWith('/dosya')) return 'Dosya Detayları'
  if (path.startsWith('/takip')) return 'Takip & Durum'
  if (path.startsWith('/raporlar')) return 'Raporlar'
  if (path.startsWith('/tema')) return 'Tema Ayarları'
  if (path.startsWith('/tasinirkod')) return 'Taşınır Kodları'
  if (path.startsWith('/okaskod')) return 'OKAS Kodları'
  if (path.startsWith('/sablonlar')) return 'Şablon Yönetimi'
  if (path.startsWith('/komisyonlar/detay')) return 'Komisyon Detayı'
  if (path.startsWith('/komisyonlar')) return 'Komisyon Yönetimi'
  if (path.startsWith('/komisyon-gorevleri')) return 'Komisyon Görevleri'
  if (path.startsWith('/changelog')) return 'Sürüm Notları'
  if (path.startsWith('/import')) return 'Toplu Veri İçe Aktarma'
  return 'Yeni Sekme'
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [{ path: '/', label: 'Gösterge Paneli' }],
  activeTabPath: '/',

  addTab: (path) => {
    if (!path || path.startsWith('/launcher') || path.startsWith('/lockscreen')) return

    const { tabs } = get()
    const exists = tabs.some((t) => t.path === path)

    if (!exists) {
      const label = getTabLabel(path)
      const newTabs = [...tabs, { path, label }]
      set({ tabs: newTabs, activeTabPath: path })
    } else {
      set({ activeTabPath: path })
    }
  },

  closeTab: (path) => {
    if (path === '/') return null

    const { tabs, activeTabPath } = get()
    const newTabs = tabs.filter((t) => t.path !== path)
    
    let nextPath: string | null = null

    if (activeTabPath === path) {
      if (newTabs.length > 0) {
        const index = tabs.findIndex((t) => t.path === path)
        const nextIndex = Math.max(0, index - 1)
        nextPath = newTabs[nextIndex].path
      } else {
        nextPath = '/'
        newTabs.push({ path: '/', label: 'Gösterge Paneli' })
      }
    }

    set({ tabs: newTabs, activeTabPath: nextPath || activeTabPath })
    return nextPath
  },

  setActiveTab: (path) => {
    set({ activeTabPath: path })
  },

  updateTabLabel: (path, label) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.path === path ? { ...t, label } : t))
    }))
  },

  clearTabs: () => {
    set({ tabs: [{ path: '/', label: 'Gösterge Paneli' }], activeTabPath: '/' })
  }
}))

import { create } from 'zustand'

interface SettingsState {
  institutionName: string
  institutionLogo: string | null
  logoLeft: string | null
  logoRight: string | null
  adminName: string
  adminTitle: string
  adminUsername: string
  institutionCode: string
  themeLightVars: string
  themeDarkVars: string
  limitType: string
  finansmanKodu: string
  institutionType: string
  setInstitutionName: (name: string) => void
  setInstitutionLogo: (logo: string | null) => void
  setAdminName: (name: string) => void
  setAdminTitle: (title: string) => void
  setAdminUsername: (username: string) => void
  setInstitutionCode: (code: string) => void
  setThemeLightVars: (vars: string) => void
  setThemeDarkVars: (vars: string) => void
  setLimitType: (limitType: string) => void
  setFinansmanKodu: (finansmanKodu: string) => void
  setInstitutionType: (type: string) => void
  loadSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  institutionName: 'Kurum Bilgisi Bekleniyor...',
  institutionLogo: null,
  logoLeft: null,
  logoRight: null,
  adminName: 'Sistem Yöneticisi',
  adminTitle: 'Destek Sorumlusu',
  adminUsername: 'admin',
  institutionCode: '',
  themeLightVars: '',
  themeDarkVars: '',
  limitType: 'diger',
  finansmanKodu: '5',
  institutionType: 'belediye',
  setInstitutionName: (name) => set({ institutionName: name }),
  setInstitutionLogo: (logo) => set({ institutionLogo: logo }),
  setAdminName: (name) => set({ adminName: name }),
  setAdminTitle: (title) => set({ adminTitle: title }),
  setAdminUsername: (username) => set({ adminUsername: username }),
  setInstitutionCode: (code) => set({ institutionCode: code }),
  setThemeLightVars: (vars) => set({ themeLightVars: vars }),
  setThemeDarkVars: (vars) => set({ themeDarkVars: vars }),
  setLimitType: (limitType) => set({ limitType }),
  setFinansmanKodu: (finansmanKodu) => set({ finansmanKodu }),
  setInstitutionType: (type) => set({ institutionType: type }),
  loadSettings: async () => {
    try {
      const settings = await window.electron.ipcRenderer.invoke('db:get-settings')
      set({
        institutionName: settings.institutionName || 'Kurum Adı Bulunamadı',
        institutionLogo: settings.institutionLogo || null,
        logoLeft: settings.logoLeft || null,
        logoRight: settings.logoRight || null,
        adminName: settings.adminName || 'Sistem Yöneticisi',
        adminTitle: settings.adminTitle || 'Destek Sorumlusu',
        adminUsername: settings.adminUsername || 'admin',
        institutionCode: settings.institutionCode || '',
        themeLightVars: settings.themeLightVars || '',
        themeDarkVars: settings.themeDarkVars || '',
        limitType: settings.limitType || 'diger',
        finansmanKodu: settings.finansmanKodu || '5',
        institutionType: settings.institutionType || 'belediye'
      })
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error)
      set({
        institutionName: 'Kurum Adı Bulunamadı',
        institutionLogo: null,
        logoLeft: null,
        logoRight: null,
        adminName: 'Sistem Yöneticisi',
        adminTitle: 'Destek Sorumlusu',
        adminUsername: 'admin',
        institutionCode: '',
        themeLightVars: '',
        themeDarkVars: '',
        limitType: 'diger',
        finansmanKodu: '5',
        institutionType: 'belediye'
      })
    }
  }
}))

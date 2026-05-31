import { create } from 'zustand'

export interface WorkspaceMeta {

  dtm_version: string
  app_version: string
  created_at: string
  institution: string
  schema_version: number
  updated_at?: string
  warnings?: string[]
}


interface WorkspaceState {
  activeFilePath: string | null
  fileName: string
  isAuthenticated: boolean
  activeDosyaId: number | null
  isCreatingDosya: boolean
  activeMeta: WorkspaceMeta | null
  setIsCreatingDosya: (flag: boolean) => void
  setActiveFile: (path: string | null) => void
  setIsAuthenticated: (auth: boolean) => void
  setActiveDosyaId: (id: number | null) => void
  openWorkspace: (filePath: string) => Promise<{ success: boolean; error?: string }>
  createWorkspace: (
    filePath: string,
    institutionName: string,
    institutionCode?: string,
    adminUsername?: string,
    adminPassword?: string
  ) => Promise<{ success: boolean; error?: string }>

  closeWorkspace: () => Promise<void>
  loadActiveMeta: () => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeFilePath: sessionStorage.getItem('workspace_path') || null,
  fileName: sessionStorage.getItem('workspace_path')
    ? sessionStorage.getItem('workspace_path')!.split('\\').pop()?.split('/').pop() || 'Bilinmeyen Dosya'
    : 'Veri Dosyası Seçilmedi',
  isAuthenticated: sessionStorage.getItem('workspace_auth') === 'true',
  activeDosyaId: sessionStorage.getItem('workspace_dosya_id')
    ? parseInt(sessionStorage.getItem('workspace_dosya_id')!, 10)
    : null,
  isCreatingDosya: false,
  activeMeta: null,
  setIsCreatingDosya: (flag) => set({ isCreatingDosya: flag }),
  setActiveFile: (path) => {
    if (path) {
      sessionStorage.setItem('workspace_path', path)
    } else {
      sessionStorage.removeItem('workspace_path')
    }
    set({
      activeFilePath: path,
      fileName: path
        ? path.split('\\').pop()?.split('/').pop() || 'Bilinmeyen Dosya'
        : 'Veri Dosyası Seçilmedi'
    })
  },
  setIsAuthenticated: (auth) => {
    sessionStorage.setItem('workspace_auth', auth ? 'true' : 'false')
    set({ isAuthenticated: auth })
  },
  setActiveDosyaId: (id) => {
    if (id !== null) {
      sessionStorage.setItem('workspace_dosya_id', id.toString())
    } else {
      sessionStorage.removeItem('workspace_dosya_id')
    }
    set({ activeDosyaId: id })
  },
  openWorkspace: async (filePath: string) => {
    try {
      const result = await window.electron.ipcRenderer.invoke('workspace:open', filePath)
      if (result.success) {
        const isSameFile = sessionStorage.getItem('workspace_path') === filePath
        const wasAuth = sessionStorage.getItem('workspace_auth') === 'true'
        const keepAuth = isSameFile && wasAuth

        sessionStorage.setItem('workspace_path', filePath)
        sessionStorage.setItem('workspace_auth', keepAuth ? 'true' : 'false')
        
        if (!keepAuth) {
          sessionStorage.removeItem('workspace_dosya_id')
        }

        set({
          activeFilePath: filePath,
          fileName: filePath.split('\\').pop()?.split('/').pop() || 'Bilinmeyen Dosya',
          isAuthenticated: keepAuth,
          activeMeta: result.meta || null,
          activeDosyaId: keepAuth
            ? sessionStorage.getItem('workspace_dosya_id')
              ? parseInt(sessionStorage.getItem('workspace_dosya_id')!, 10)
              : null
            : null
        })
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (e: any) {
      console.error(e)
      return { success: false, error: e.message }
    }
  },
  createWorkspace: async (
    filePath: string,
    institutionName: string,
    institutionCode?: string,
    adminUsername?: string,
    adminPassword?: string
  ) => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        'workspace:create',
        filePath,
        institutionName,
        institutionCode || '',
        adminUsername || '',
        adminPassword || ''
      )
      if (result.success) {
        sessionStorage.setItem('workspace_path', filePath)
        sessionStorage.setItem('workspace_auth', 'true')
        sessionStorage.removeItem('workspace_dosya_id')
        set({
          activeFilePath: filePath,
          fileName: filePath.split('\\').pop()?.split('/').pop() || 'Bilinmeyen Dosya',
          isAuthenticated: true, // Auto-logged in on create
          activeMeta: result.meta || null,
          activeDosyaId: null
        })
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (e: any) {
      console.error(e)
      return { success: false, error: e.message }
    }
  },

  closeWorkspace: async () => {
    await window.electron.ipcRenderer.invoke('workspace:close')
    sessionStorage.removeItem('workspace_path')
    sessionStorage.removeItem('workspace_auth')
    sessionStorage.removeItem('workspace_dosya_id')
    set({
      activeFilePath: null,
      fileName: 'Veri Dosyası Seçilmedi',
      isAuthenticated: false,
      activeMeta: null,
      activeDosyaId: null
    })
  },
  loadActiveMeta: async () => {
    if (!get().activeFilePath) return
    try {
      const result = await window.electron.ipcRenderer.invoke('workspace:get-meta')
      if (result.success) {
        set({ activeMeta: result.meta || null })
      }
    } catch (e) {
      console.error(e)
    }
  }
}))

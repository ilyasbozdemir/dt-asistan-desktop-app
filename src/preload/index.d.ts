import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI & {
      shell: {
        openExternal: (url: string) => Promise<void>
      }
    }
    api: {
      aiGenerate: (options: {
        prompt: string
        systemInstruction?: string
        enableDatabaseAccess?: boolean
      }) => Promise<{ success: boolean; data?: string; error?: string }>
      aiTest: (
        provider: string,
        apiKey: string
      ) => Promise<{ success: boolean; data?: string; error?: string }>
    }
  }
}

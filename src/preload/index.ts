import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  aiGenerate: (options: {
    prompt: string
    systemInstruction?: string
    enableDatabaseAccess?: boolean
  }) => ipcRenderer.invoke('ai:generate', options),
  aiTest: (provider: string, apiKey: string) => ipcRenderer.invoke('ai:test', provider, apiKey),
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  setDevVersion: (mode: boolean, version: string) =>
    ipcRenderer.invoke('updater:set-dev-version', mode, version)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

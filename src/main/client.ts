import { io, Socket } from 'socket.io-client'
import { BrowserWindow } from 'electron'

let socket: Socket | null = null

export function connectToServer(url: string): { success: boolean; error?: string } {
  try {
    if (socket && socket.connected) {
      return { success: true }
    }

    if (socket) {
      socket.disconnect()
    }

    socket = io(url, {
      reconnectionDelayMax: 10000
    })

    socket.on('connect', () => {
      console.log('Ana sunucuya bağlanıldı:', socket?.id)
      // Electron arayüzüne bağlantı durumunu bildir
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send('sync:connection-status', { status: 'connected', id: socket?.id })
        }
      })
    })

    socket.on('disconnect', () => {
      console.log('Ana sunucudan kopuldu.')
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send('sync:connection-status', { status: 'disconnected' })
        }
      })
    })

    socket.on('document:updated', (data) => {
      // Sunucudan gelen güncellemeyi Electron Renderer'a gönder
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send('sync:document-updated', data)
        }
      })
    })

    return { success: true }
  } catch (error: any) {
    console.error('Sunucuya bağlanılamadı:', error)
    return { success: false, error: error.message }
  }
}

export function disconnectFromServer() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function emitEvent(eventName: string, data: any) {
  if (socket && socket.connected) {
    socket.emit(eventName, data)
  }
}

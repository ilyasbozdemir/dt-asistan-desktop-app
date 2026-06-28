import { Server as SocketIOServer } from 'socket.io'
import http from 'http'
import { BrowserWindow } from 'electron'

let io: SocketIOServer | null = null
let httpServer: http.Server | null = null

export function startServer(port: number = 3000): { success: boolean; error?: string } {
  try {
    if (httpServer) {
      return { success: true } // Zaten çalışıyor
    }

    httpServer = http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('DT Asistan EBYS Server Running')
    })

    io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // Tüm istemcilere açık (gerekiyorsa kısıtlanabilir)
        methods: ['GET', 'POST']
      }
    })

    io.on('connection', (socket) => {
      console.log('Yeni istemci bağlandı:', socket.id)

      // Evrak güncellendiğinde tüm client'lara duyur
      socket.on('document:updated', (data) => {
        console.log('Evrak güncellendi:', data)
        // Olayı diğer tüm istemcilere yayınla
        socket.broadcast.emit('document:updated', data)

        // Host ekranına da (Eğer Ana Sunucu aynı zamanda client ise) IPC ile bildir
        BrowserWindow.getAllWindows().forEach((win) => {
          if (!win.isDestroyed()) {
            win.webContents.send('sync:document-updated', data)
          }
        })
      })

      socket.on('disconnect', () => {
        console.log('İstemci ayrıldı:', socket.id)
      })
    })

    httpServer.listen(port, () => {
      console.log(`EBYS WebSocket Sunucusu ${port} portunda başlatıldı.`)
    })

    return { success: true }
  } catch (error: any) {
    console.error('WebSocket sunucusu başlatılamadı:', error)
    return { success: false, error: error.message }
  }
}

export function stopServer() {
  if (io) {
    io.close()
    io = null
  }
  if (httpServer) {
    httpServer.close()
    httpServer = null
  }
}

export function getSocketServer() {
  return io
}

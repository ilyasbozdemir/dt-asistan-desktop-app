import express from 'express'
import cors from 'cors'
import http from 'http'
import fs from 'fs'
import os from 'os'
import { BrowserWindow } from 'electron'
import { workspaceManager } from '../database/workspace'

let server: http.Server | null = null

export function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const devName in interfaces) {
    const iface = interfaces[devName]
    if (!iface) continue
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i]
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address
    }
  }
  return '0.0.0.0'
}

let activePort: number = 4000

export function startExpressServer(port: number = 4000) {
  return new Promise((resolve) => {
    if (server) {
      resolve({ success: true, port: activePort, ip: getLocalIP() })
      return
    }

    const expressApp = express()
    expressApp.use(cors())
    expressApp.use(express.json())

    expressApp.get('/api/network/info', (_req, res) => {
      try {
        const meta = workspaceManager.getMeta()
        const currentFile = workspaceManager.getCurrentFilePath()
        if (!meta || !currentFile) {
          res.status(404).json({ error: 'Açık bir dosya yok.' })
          return
        }
        res.json({
          success: true,
          meta,
          fileSize: fs.existsSync(currentFile) ? fs.statSync(currentFile).size : 0
        })
      } catch (err: any) {
        res.status(500).json({ error: err.message })
      }
    })

    expressApp.get('/api/network/pull', (_req, res) => {
      try {
        const currentFile = workspaceManager.getCurrentFilePath()
        if (!currentFile || !fs.existsSync(currentFile)) {
          res.status(404).json({ error: 'Açık bir dosya yok.' })
          return
        }

        // Before downloading, make sure it's saved.
        workspaceManager.save()

        res.download(currentFile, 'paylasim.dtal')
      } catch (err: any) {
        res.status(500).json({ error: err.message })
      }
    })

    expressApp.post(
      '/api/network/push',
      express.raw({ type: 'application/octet-stream', limit: '100mb' }),
      (req, res) => {
        try {
          const currentFile = workspaceManager.getCurrentFilePath()

          if (!currentFile) {
            // Hedef makinede açık dosya yoksa push yapılamaz
            res.status(400).json({ error: 'Karşı tarafta açık bir dosya yok.' })
            return
          }

          const buffer = req.body
          if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
            res.status(400).json({ error: 'Dosya verisi alınamadı veya boş.' })
            return
          }

          // Close the DB before overwriting
          workspaceManager.close()

          // Backup the old file for Undo
          const backupPath = currentFile + '.syncbak'
          fs.copyFileSync(currentFile, backupPath)

          try {
            // Overwrite
            fs.writeFileSync(currentFile, buffer)

            // Reopen DB via manager
            workspaceManager.open(currentFile, false)

            // Broadcast change to renderer to reload data
            BrowserWindow.getAllWindows().forEach((win) => {
              if (!win.isDestroyed()) {
                win.webContents.send('network:db-pushed')
              }
            })

            res.json({ success: true, message: 'Dosya başarıyla yüklendi ve güncellendi.' })
          } catch (err: any) {
            // Restore from backup
            if (fs.existsSync(backupPath)) {
              fs.copyFileSync(backupPath, currentFile)
              fs.unlinkSync(backupPath)

              try {
                workspaceManager.open(currentFile, false)
              } catch (e) {}
            }
            res.status(500).json({ error: 'Yükleme sırasında hata: ' + err.message })
          }
        } catch (err: any) {
          res.status(500).json({ error: err.message })
        }
      }
    )

    const tryListen = (currentPort: number) => {
      const tempServer = http.createServer(expressApp)

      tempServer.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${currentPort} is in use, trying next port...`)
          tryListen(currentPort + 1)
        } else {
          resolve({ success: false, port: currentPort, ip: getLocalIP(), error: err.message })
        }
      })

      tempServer.listen(currentPort, '0.0.0.0', () => {
        server = tempServer
        activePort = currentPort
        console.log(`Express server started on port ${currentPort} IP ${getLocalIP()}`)
        resolve({ success: true, port: currentPort, ip: getLocalIP() })
      })
    }

    tryListen(port)
  })
}

export function stopExpressServer() {
  if (server) {
    server.close()
    server = null
  }
}

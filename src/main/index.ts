import { app, shell, BrowserWindow, ipcMain, dialog, Tray, Menu, session, protocol } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import fs from 'fs'

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'dta-res',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
])

import icon from '../../resources/icon.png?asset'
import { workspaceManager } from './database/workspace'
import { CURRENT_SCHEMA_VERSION } from './database/migrate'
import { manifests } from './database/schema-manifest/index'
import nodemailer from 'nodemailer'
import {
  isSupportedFile,
  defaultFormat,
  perFormatFilters,
  allFormatsFilter
} from './config/fileFormats'
import { recentFilesStore } from './store/recentFiles'
import { startServer, stopServer, getSocketServer } from './server'
import { connectToServer, disconnectFromServer, emitEvent } from './client'
import { generateContent, testConnection, AIGenerateOptions } from './ai/index'
import { renderPdfBuffer } from './pdfService'
import { renderDocxBuffer } from './docxService'
import { startExpressServer, stopExpressServer } from './network/expressServer'
import { registerArchiveHandlers } from './archive'
import { TANIM_Placeholder } from './database/tables/TANIM_Placeholder'

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error)
})

let tray: Tray | null = null
const secondaryWindows = new Set<BrowserWindow>()
const dosyaWindows = new Map<number, BrowserWindow>()

function closeAllSecondaryWindows(): void {
  const copy = Array.from(secondaryWindows)
  for (const win of copy) {
    if (!win.isDestroyed()) win.close()
  }
  secondaryWindows.clear()

  const dCopy = Array.from(dosyaWindows.values())
  for (const win of dCopy) {
    if (!win.isDestroyed()) win.close()
  }
  dosyaWindows.clear()
}

// Uygulama tamamen kapanırken (Quit) aktif dosyayı/lock'u temizle
app.on('will-quit', () => {
  try {
    closeAllSecondaryWindows()
    workspaceManager.close()
  } catch (e) {}
})

// Süreç herhangi bir sebeple çökerse veya kapanırsa son bir temizlik şansı
process.on('exit', () => {
  try {
    closeAllSecondaryWindows()
    workspaceManager.close()
  } catch (e) {}
})

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      plugins: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (process.argv.includes('--new-dosya')) {
      mainWindow.webContents.send('app:navigate', '/dosyalar/yeni')
    }
  })

  // Uygulama kapatıldığında direkt kapansın (arka planda çalışmasın)
  // mainWindow.on('close', (event) => {
  //   if (!isQuitting) {
  //     event.preventDefault()
  //     mainWindow.hide()
  //   }
  // })

  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.minimize()
  })

  ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.close()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Navigation kilidi: Dış web sitelerine Electron içinden gidilmesini engelle
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!is.dev) {
      const parsedUrl = new URL(url)
      if (parsedUrl.origin !== 'file://') {
        event.preventDefault()
      }
    }
  })

  // Debug: Capture renderer console logs in the main process
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[RENDERER CONSOLE] (${level}) ${message} (at ${sourceId}:${line})`)
  })
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('Renderer process gone:', details)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    closeAllSecondaryWindows()
  })
}

// Single Instance Lock
const isMultiInstance = process.argv.includes('--multi-instance')
const gotTheLock = isMultiInstance ? true : app.requestSingleInstanceLock()

if (!gotTheLock && !isMultiInstance) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
      const mainWindow = windows[0]

      // Eğer desteklenen bir dosya çift tıklandıysa, yeni bir süreç (pencere) olarak başlat
      const filePath = commandLine.find((arg) => isSupportedFile(arg))
      if (filePath) {
        const { spawn } = require('child_process')
        const args = app.isPackaged
          ? [filePath, '--multi-instance']
          : [app.getAppPath(), filePath, '--multi-instance']

        spawn(process.execPath, args, {
          detached: true,
          stdio: 'ignore'
        }).unref()
      } else {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()

        if (commandLine.includes('--new-dosya')) {
          mainWindow.webContents.send('app:navigate', '/dosyalar/yeni')
        }
      }
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    // Custom Protocol: dta-res:// -> local resource mapping
    protocol.handle('dta-res', (request) => {
      const urlPath = decodeURIComponent(new URL(request.url).pathname)
      // In development, resolve relative to project root
      // In production, resolve relative to app.getPath('userData') or process.resourcesPath
      const resourcesDir = app.isPackaged
        ? process.resourcesPath
        : join(__dirname, '../../resources')

      const targetFilePath = join(resourcesDir, urlPath)
      const fileUrl = `file://${targetFilePath}`
      const { net } = require('electron')
      return net.fetch(fileUrl)
    })

    if (process.platform === 'win32') {
      app.setUserTasks([
        {
          program: process.execPath,
          arguments: '--new-dosya',
          iconPath: process.execPath,
          iconIndex: 0,
          title: 'Yeni Doğrudan Temin Dosyası',
          description: 'Hızlıca yeni bir doğrudan temin dosyası oluşturun'
        }
      ])
    }

    tray = new Tray(icon)
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Gösterge Paneli',
        click: () => {
          const windows = BrowserWindow.getAllWindows()
          if (windows.length > 0) {
            windows[0].show()
            windows[0].webContents.send('app:navigate', '/')
          }
        }
      },
      {
        label: 'Yeni Doğrudan Temin Dosyası',
        click: () => {
          const windows = BrowserWindow.getAllWindows()
          if (windows.length > 0) {
            windows[0].show()
            windows[0].webContents.send('app:navigate', '/dosyalar/yeni')
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Çıkış',
        click: () => {
          app.quit()
        }
      }
    ])
    tray.setToolTip('DT Asistan')
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
      const windows = BrowserWindow.getAllWindows()
      if (windows.length > 0) {
        if (windows[0].isVisible()) {
          windows[0].hide()
        } else {
          windows[0].show()
        }
      }
    })

    // İlk açılışta desteklenen bir dosyanın çift tıklanarak açılıp açılmadığını kontrol et
    const initialFilePath = process.argv.find((arg) => isSupportedFile(arg)) ?? null
    // Use handle (not handleOnce) so renderer HMR reloads don't cause "No handler" errors.
    // The handler removes itself after the first real call to stay clean.
    const initialFileHandler = (): string | null => {
      ipcMain.removeHandler('get-initial-file')
      ipcMain.handle('get-initial-file', () => null) // subsequent calls always return null
      return initialFilePath
    }
    ipcMain.handle('get-initial-file', initialFileHandler)
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // Güvenlik: Tüm donanım (kamera, mikrofon) izinlerini varsayılan olarak reddet
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
      callback(false)
    })

    // Güvenlik: Production'da DevTools açılmasını tamamen engelle
    app.on('browser-window-created', (_, window) => {
      if (!is.dev) {
        window.webContents.on('devtools-opened', () => {
          window.webContents.closeDevTools()
        })
      }
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))

    registerArchiveHandlers()

    ipcMain.on('install-update', () => {
      autoUpdater.quitAndInstall(false, true)
    })

    // --- EBYS Network (Socket) Handlers ---

    ipcMain.handle('network:start-server', (_, port: number) => {
      return startServer(port)
    })

    ipcMain.handle('network:stop-server', () => {
      stopServer()
      return { success: true }
    })

    ipcMain.handle('network:connect-client', (_, url: string) => {
      return connectToServer(url)
    })

    ipcMain.handle('network:disconnect-client', () => {
      disconnectFromServer()
      return { success: true }
    })

    ipcMain.on('network:emit', (_, eventName: string, data: any) => {
      // Eğer istemciysek sunucuya gönder
      emitEvent(eventName, data)

      // Eğer aynı zamanda sunucuysak, kendi istemcilerimize de dağıt
      const io = getSocketServer()
      if (io) {
        io.emit(eventName, data)
      }
    })

    // --- EBYS Express Network Handlers ---

    ipcMain.handle('network:start-express', (_, port: number) => {
      return startExpressServer(port)
    })

    ipcMain.handle('network:stop-express', () => {
      stopExpressServer()
      return { success: true }
    })

    ipcMain.handle('network:pull-db', async (_, url: string) => {
      try {
        const response = await fetch(`${url}/api/network/pull`)
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Sunucu Hatası: ${response.status} - ${errorText}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        let currentFile = workspaceManager.getCurrentFilePath()
        let backupPath: string | null = null

        if (!currentFile) {
          const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Ağdan Gelen Veritabanını Kaydet',
            defaultPath: 'paylasim.dtal',
            filters: [{ name: 'DTAL Dosyaları', extensions: ['dtal'] }]
          })
          if (canceled || !filePath) throw new Error('İşlem iptal edildi.')
          currentFile = filePath
        } else {
          workspaceManager.close()
          backupPath = currentFile + '.syncbak'
          fs.copyFileSync(currentFile, backupPath)
        }

        try {
          fs.writeFileSync(currentFile, buffer)
          workspaceManager.open(currentFile, false)

          BrowserWindow.getAllWindows().forEach((win) => {
            if (!win.isDestroyed()) win.webContents.send('network:db-pulled')
          })

          return { success: true }
        } catch (e: any) {
          if (backupPath && fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, currentFile)
            try {
              workspaceManager.open(currentFile, false)
            } catch {}
          }
          throw e
        }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

    ipcMain.handle('network:push-db', async (_, url: string) => {
      try {
        const currentFile = workspaceManager.getCurrentFilePath()
        if (!currentFile || !fs.existsSync(currentFile))
          throw new Error('Gönderilecek açık bir dosya yok.')

        // Ensure latest data is written
        workspaceManager.save()

        const fileData = fs.readFileSync(currentFile)

        const response = await fetch(`${url}/api/network/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream'
          },
          body: fileData
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: 'Bilinmeyen Hata' }))
          throw new Error(`Hata: ${errData.error || response.statusText}`)
        }

        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

    ipcMain.handle('network:can-undo-sync', async () => {
      try {
        const currentFile = workspaceManager.getCurrentFilePath()
        if (!currentFile) return { canUndo: false }
        const backupPath = currentFile + '.syncbak'
        if (fs.existsSync(backupPath)) {
          const stats = fs.statSync(backupPath)
          return { canUndo: true, mtime: stats.mtime.toISOString() }
        }
        return { canUndo: false }
      } catch {
        return { canUndo: false }
      }
    })

    ipcMain.handle('network:undo-sync', async () => {
      try {
        const currentFile = workspaceManager.getCurrentFilePath()
        if (!currentFile) throw new Error('Açık bir çalışma dosyası yok.')
        const backupPath = currentFile + '.syncbak'
        if (!fs.existsSync(backupPath))
          throw new Error('Geri alınacak senkronizasyon yedeği bulunamadı.')

        workspaceManager.close()

        // Restore backup
        fs.copyFileSync(backupPath, currentFile)
        fs.unlinkSync(backupPath)

        workspaceManager.open(currentFile, false)

        BrowserWindow.getAllWindows().forEach((win) => {
          if (!win.isDestroyed()) {
            win.webContents.send('db:invalidated')
          }
        })

        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

    // --- Workspace & SQLite Handlers ---
    const broadcastDbChange = () => {
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send('db:invalidated')
        }
      })
    }

    ipcMain.on('window:close-secondary-windows', () => {
      closeAllSecondaryWindows()
    })

    ipcMain.on('window:open-external', (_, data: { url: string; title?: string }) => {
      const newWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        show: false,
        autoHideMenuBar: false,
        title: data.title || 'Sorgulama Ekranı',
        icon: icon,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })
      secondaryWindows.add(newWindow)
      newWindow.on('closed', () => secondaryWindows.delete(newWindow))
      newWindow.once('ready-to-show', () => {
        newWindow.show()
        newWindow.focus()
      })
      newWindow.loadURL(data.url)
    })

    ipcMain.on(
      'window:open-secondary',
      (_, data: { path: string; search: string; title?: string }) => {
        const newWindow = new BrowserWindow({
          width: 1000,
          height: 750,
          minWidth: 800,
          minHeight: 600,
          show: false,
          autoHideMenuBar: true,
          title: data.title || 'DT Asistan — Detay',
          icon: icon,
          webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
          }
        })

        secondaryWindows.add(newWindow)
        newWindow.on('closed', () => secondaryWindows.delete(newWindow))
        newWindow.once('ready-to-show', () => {
          newWindow.show()
          newWindow.focus()
        })

        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
          newWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + data.path + data.search)
        } else {
          const indexHtml = join(__dirname, '../renderer/index.html')
          newWindow.loadFile(indexHtml, {
            search: data.search.replace(/^\?/, ''),
            hash: data.path
          })
        }
      }
    )

    // --- Dosya ↔ Window IPC Handlers ---
    const dosyaWindows = new Map<number, BrowserWindow>()

    ipcMain.on(
      'window:open-dosya',
      (_, data: { dosyaId: number; path: string; workspacePath: string; title?: string }) => {
        const existingWin = dosyaWindows.get(data.dosyaId)
        if (existingWin && !existingWin.isDestroyed()) {
          if (existingWin.isMinimized()) existingWin.restore()
          existingWin.focus()
          return
        }

        const newWindow = new BrowserWindow({
          width: 1100,
          height: 800,
          minWidth: 800,
          minHeight: 600,
          show: false,
          autoHideMenuBar: true,
          frame: false,
          titleBarStyle: 'hidden',
          titleBarOverlay: false,
          title: data.title || `Dosya #${data.dosyaId}`,
          icon: icon,
          webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
          }
        })

        dosyaWindows.set(data.dosyaId, newWindow)
        newWindow.on('closed', () => {
          dosyaWindows.delete(data.dosyaId)
        })
        newWindow.once('ready-to-show', () => {
          newWindow.show()
          newWindow.focus()
        })

        const wpParam = data.workspacePath ? '&wp=' + encodeURIComponent(data.workspacePath) : ''
        const searchParams = `?mode=dosya_window&dosyaId=${data.dosyaId}${wpParam}`

        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
          newWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + data.path + searchParams)
        } else {
          const indexHtml = join(__dirname, '../renderer/index.html')
          newWindow.loadFile(indexHtml, {
            hash: data.path,
            search: searchParams.replace(/^\?/, '')
          })
        }
      }
    )

    // --- Tab ↔ Window IPC Handlers ---
    // Opens a tab's content in a separate detached window
    ipcMain.on(
      'tab:open-in-window',
      (_, data: { path: string; title: string; workspacePath?: string }) => {
        const newWindow = new BrowserWindow({
          width: 1000,
          height: 750,
          minWidth: 800,
          minHeight: 600,
          show: false,
          autoHideMenuBar: true,
          frame: false,
          titleBarStyle: 'hidden',
          titleBarOverlay: false,
          title: data.title || 'DT Asistan',
          icon: icon,
          webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
          }
        })

        secondaryWindows.add(newWindow)
        newWindow.on('closed', () => secondaryWindows.delete(newWindow))
        newWindow.once('ready-to-show', () => {
          newWindow.show()
          newWindow.focus()
        })

        const wpParam = data.workspacePath ? '&wp=' + encodeURIComponent(data.workspacePath) : ''
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
          // Dev: path goes into URL pathname, params into query string
          newWindow.loadURL(
            process.env['ELECTRON_RENDERER_URL'] + data.path + '?mode=window' + wpParam
          )
        } else {
          // Production: path goes into hash, params into search
          const indexHtml = join(__dirname, '../renderer/index.html')
          newWindow.loadFile(indexHtml, {
            hash: data.path,
            search: 'mode=window' + wpParam
          })
        }
      }
    )

    // Returns a detached window's content back to the main window as a tab
    ipcMain.on('tab:return-to-parent', (event, data: { path: string }) => {
      // Find the main window (the first window that is NOT the sender)
      const senderWindow = BrowserWindow.fromWebContents(event.sender)
      const allWindows = BrowserWindow.getAllWindows()
      const mainWindow = allWindows.find((w) => w !== senderWindow) || allWindows[0]

      if (mainWindow && !mainWindow.isDestroyed()) {
        // Tell the main window to re-add this path as a tab
        mainWindow.webContents.send('tab:returned-from-window', { path: data.path })
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }

      // Close the child window
      if (senderWindow && !senderWindow.isDestroyed()) {
        senderWindow.close()
      }
    })
    ipcMain.handle('workspace:create', async (_, filePath: string, institutionName: string) => {
      try {
        const meta = workspaceManager.create(filePath, institutionName)
        return { success: true, meta, newFilePath: workspaceManager.getCurrentFilePath() }
      } catch (error: any) {
        console.error('Create workspace error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-changelog', async () => {
      const allChanges: { version: string; notes: string; schema_max: number }[] = []

      // Gerçek uygulama güncellemelerini manuel ekliyoruz
      const appUpdates = [
        {
          version: '1.0.0-alpha.29',
          notes:
            '- İçe Aktarma (Import) ekranındaki buton stilleri (variant) ile ilgili TypeScript hataları düzeltildi.',
          schema_max: 20
        },
        {
          version: '1.0.0-alpha.28',
          notes:
            '- Yeni Özellik: Firmalar, Personel, Malzeme gibi kayıtların sisteme JSON dosyası olarak Toplu İçe Aktarılabilmesi sağlandı.',
          schema_max: 20
        },
        {
          version: '1.0.0-alpha.27',
          notes:
            '- Sistem tepsisi (Tray) entegrasyonu sağlandı. Uygulama X tuşuyla kapatıldığında arka planda çalışmaya devam eder.\n- Görev çubuğunda (Jump List) kısayollar aktif edildi.\n- Çeşitli hata düzeltmeleri yapıldı.',
          schema_max: 20
        },
        {
          version: '1.0.0-alpha.26',
          notes:
            '- Yeni dosya oluşturma ekranına Yapay Zeka destekli "İşin Kapsamı ve Tanımı" oluşturma özelliği eklendi.',
          schema_max: 20
        },
        {
          version: '1.0.0-alpha.25',
          notes: '- Profil ve Ayarlar ekranlarındaki arayüz sorunları giderildi.',
          schema_max: 20
        }
      ]

      for (const v of manifests) {
        if (v.changes && v.changes.length > 0) {
          const notes = v.changes
            .map((c: any) => `- Schema ${c.schema}: ${c.description}`)
            .join('\n')
          allChanges.push({ version: v.app, notes, schema_max: v.schema_max })
        } else {
          allChanges.push({
            version: v.app,
            notes: 'Yapısal bir veritabanı değişikliği yok.',
            schema_max: v.schema_max
          })
        }
      }

      // App güncellemelerini ekle
      appUpdates.forEach((update) => {
        // Eğer manifest'te aynı versiyon varsa onu ez
        const index = allChanges.findIndex((c) => c.version === update.version)
        if (index !== -1) {
          allChanges[index] = update
        } else {
          allChanges.push(update)
        }
      })

      // Versionlara göre SemVer formatında sırala (descending)
      return allChanges.sort((a, b) => {
        const regex = /^v?(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z]+)\.(\d+))?$/
        const parseVer = (v: string) => {
          const m = v.match(regex)
          if (!m) return { major: 0, minor: 0, patch: 0, preType: '', preNum: 0 }
          return {
            major: parseInt(m[1]),
            minor: parseInt(m[2]),
            patch: parseInt(m[3]),
            preType: m[4] || 'z', // no pre-release (z) is greater than alpha/beta
            preNum: parseInt(m[5] || '0')
          }
        }

        const va = parseVer(a.version)
        const vb = parseVer(b.version)

        if (va.major !== vb.major) return vb.major - va.major
        if (va.minor !== vb.minor) return vb.minor - va.minor
        if (va.patch !== vb.patch) return vb.patch - va.patch
        if (va.preType !== vb.preType) return vb.preType.localeCompare(va.preType)
        return vb.preNum - va.preNum
      })
    })

    ipcMain.handle(
      'workspace:open',
      async (_, filePath: string, allowMigration: boolean = false) => {
        try {
          closeAllSecondaryWindows()
          const meta = workspaceManager.open(filePath, allowMigration)
          return { success: true, meta, newFilePath: workspaceManager.getCurrentFilePath() }
        } catch (error: any) {
          if (error.message && error.message.startsWith('MIGRATION_REQUIRED|')) {
            const payloadStr = error.message.split('|')[1]
            const payload = JSON.parse(payloadStr)
            return { success: false, ...payload } // { requiresMigration: true, pendingUpdates: [] }
          }
          console.error('Open workspace error:', error)
          return { success: false, error: error.message }
        }
      }
    )

    ipcMain.handle('workspace:close', async () => {
      try {
        closeAllSecondaryWindows()
        workspaceManager.close()
        return { success: true }
      } catch (error: any) {
        console.error('Close workspace error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('workspace:get-meta', async () => {
      try {
        const meta = workspaceManager.getMeta()
        return { success: true, meta }
      } catch (error: any) {
        console.error('Get meta error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('workspace:upload-file', async (_, sourcePath: string) => {
      try {
        const result = workspaceManager.uploadAttachment(sourcePath)
        return { success: true, ...result }
      } catch (error: any) {
        console.error('Upload attachment error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('workspace:open-file', async (_, relativePath: string) => {
      try {
        const success = await workspaceManager.openAttachment(relativePath)
        return { success }
      } catch (error: any) {
        console.error('Open attachment error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('db:bulk-import', async (_, { target, mappings, data }) => {
      try {
        const db = workspaceManager.getDb()
        if (!db) throw new Error('Açık bir çalışma alanı yok.')

        // Güvenlik: Sadece belirli tablolara izin ver (SQL Injection önlemi)
        const allowedTargets = [
          'TANIM_Firma',
          'TANIM_Personel',
          'TANIM_Birim',
          'TANIM_Kalem',
          'TANIM_Ambar',
          'DATA_TeminDosyasi',
          'settings'
        ]
        if (!allowedTargets.includes(target)) {
          throw new Error(`Geçersiz hedef tablo: ${target}`)
        }

        // Aynı hedefe eşlenen JSON alanlarını grupla (Örn: adi -> ad_soyad, soyadi -> ad_soyad)
        const columnMap = new Map<string, string[]>()
        for (const [jsonKey, dbCol] of Object.entries(mappings)) {
          const colName = dbCol as string
          if (!columnMap.has(colName)) columnMap.set(colName, [])
          columnMap.get(colName)!.push(jsonKey)
        }

        const uniqueColumns = Array.from(columnMap.keys())
        if (uniqueColumns.length === 0) throw new Error('Eşleştirilmiş alan bulunamadı.')

        if (target === 'settings') {
          let successCount = 0
          const insertSettings = db.transaction((rows: any[]) => {
            const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
            for (const row of rows) {
              const mappedRow: any = {}
              for (const col of uniqueColumns) {
                const keys = columnMap.get(col)!
                const parts = keys
                  .map((k) => row[k])
                  .filter((v) => v !== undefined && v !== null && v !== '')
                if (parts.length > 0) {
                  mappedRow[col] = String(parts.join(' '))
                }
              }
              for (const [k, v] of Object.entries(mappedRow)) {
                stmt.run(k, v)
              }
              successCount++
            }
          })
          insertSettings(data)
          return { success: true, count: successCount, total: data.length }
        }

        // Hedef tabloya özel zorunlu alan enjeksiyonları
        const insertColumns = [...uniqueColumns]
        let autoBarkodId = false
        if (target === 'TANIM_Kalem' && !insertColumns.includes('barkod_id')) {
          insertColumns.push('barkod_id')
          autoBarkodId = true
        }

        // Çakışan kayıtları atla (INSERT OR IGNORE)
        const placeholders = insertColumns.map(() => '?').join(', ')
        const stmt = db.prepare(
          `INSERT OR IGNORE INTO ${target} (${insertColumns.join(', ')}) VALUES (${placeholders})`
        )

        let successCount = 0
        const insertMany = db.transaction((rows: any[]) => {
          for (const row of rows) {
            const values = insertColumns.map((col) => {
              if (col === 'barkod_id' && autoBarkodId) {
                return Math.floor(1000000000000 + Math.random() * 9000000000000).toString()
              }
              const keys = columnMap.get(col)!
              const parts = keys
                .map((k) => row[k])
                .filter((v) => v !== undefined && v !== null && v !== '')
              if (parts.length === 0) {
                if (col === 'barkod_id')
                  return Math.floor(1000000000000 + Math.random() * 9000000000000).toString()
                if (col === 'tipi') return 'Mal'
                if (col === 'birim') return 'Adet'
                if (col === 'aktif_mi') return 1
                if (col === 'kdv_orani') return 20
                if (
                  col === 'is_personel' ||
                  col === 'ihale_yetkilisi_mi' ||
                  col === 'harcama_yetkilisi_mi'
                )
                  return 0
                return null
              }
              // Birden fazla alan aynı sütuna eşleştiyse aralarında boşluk bırakarak birleştir
              let combined = parts.join(' ')

              // İsim/Soyisim alanları için özel formatlama (Son kelime BÜYÜK, diğerleri İlk Harf Büyük)
              if (['ad_soyad', 'ilgili_adi'].includes(col) && typeof combined === 'string') {
                const words = combined.trim().split(/\s+/)
                if (words.length > 1) {
                  const lastWord = words.pop()!.toLocaleUpperCase('tr-TR')
                  const firstWords = words.map(
                    (w) =>
                      w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR')
                  )
                  combined = [...firstWords, lastWord].join(' ')
                } else if (words.length === 1 && words[0]) {
                  const w = words[0]
                  combined =
                    w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR')
                }
              }

              return combined
            })
            const result = stmt.run(...values)
            if (result.changes > 0) successCount++
          }
        })

        insertMany(data)

        return { success: true, count: successCount, total: data.length }
      } catch (error: any) {
        console.error('Bulk import error:', error)
        return { success: false, error: error.message }
      }
    })

    // --- NATIVE DIALOG HANDLERS ---
    ipcMain.handle('dialog:showSaveDialog', async () => {
      const mainWindow = BrowserWindow.getAllWindows()[0]
      const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Yeni Veri Dosyası Oluştur',
        defaultPath: `Yeni Dosya.${defaultFormat.ext}`,
        filters: [...perFormatFilters]
      })
      return { canceled, filePath }
    })

    ipcMain.handle('dialog:showOpenDialog', async () => {
      const mainWindow = BrowserWindow.getAllWindows()[0]
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Veri Dosyası Seç',
        filters: [allFormatsFilter, ...perFormatFilters],
        properties: ['openFile']
      })
      return { canceled, filePath: filePaths && filePaths.length > 0 ? filePaths[0] : null }
    })

    ipcMain.handle('open-excel', async () => {
      const mainWindow = BrowserWindow.getAllWindows()[0]
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Excel Dosyası Seç',
        filters: [{ name: 'Excel Dosyaları', extensions: ['xlsx', 'xls', 'csv'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths.length) return null
      const buffer = fs.readFileSync(filePaths[0])
      return { name: filePaths[0].split(/[\\/]/).pop(), buffer }
    })

    // --- RECENT FILES HANDLERS ---
    ipcMain.handle('app:get-recent-files', () => {
      return recentFilesStore.getRecentFiles()
    })

    ipcMain.handle('app:add-recent-file', (_, filePath: string, name: string) => {
      recentFilesStore.addRecentFile(filePath, name)
      return { success: true }
    })

    ipcMain.handle('app:remove-recent-file', (_, filePath: string) => {
      recentFilesStore.removeRecentFile(filePath)
      return { success: true }
    })

    ipcMain.handle(
      'export-pdf',
      async (_, htmlContent: string, _printOptions?: any, fileName?: string) => {
        try {
          const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'PDF Olarak Kaydet',
            defaultPath: fileName ? `${fileName}.pdf` : 'Cikti.pdf',
            filters: [{ name: 'PDF Dosyası', extensions: ['pdf'] }]
          })
          if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

          const pdfBuffer = await renderPdfBuffer(htmlContent)
          fs.writeFileSync(filePath, pdfBuffer)

          return { success: true, filePath }
        } catch (err: any) {
          return { success: false, error: err.message }
        }
      }
    )

    ipcMain.handle('export-docx', async (_, htmlContent: string, fileName?: string) => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Word (DOCX) Olarak Kaydet',
          defaultPath: fileName ? `${fileName}.docx` : 'Cikti.docx',
          filters: [{ name: 'Word Dosyası', extensions: ['docx'] }]
        })
        if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

        const buffer = await renderDocxBuffer(htmlContent)
        fs.writeFileSync(filePath, buffer)

        return { success: true, filePath }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

    ipcMain.handle('export-udf', async (_, htmlContent: string, fileName?: string) => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'UDF Olarak Kaydet',
          defaultPath: fileName ? `${fileName}.udf` : 'Cikti.udf',
          filters: [{ name: 'UYAP Dokümanı', extensions: ['udf'] }]
        })
        if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

        const stripHtml = htmlContent.replace(/<[^>]+>/g, ' ')
        const udfContent = `<?xml version="1.0" encoding="utf-8"?>\n<Document>\n<content>\n<![CDATA[\n${stripHtml}\n]]>\n</content>\n</Document>`
        fs.writeFileSync(filePath, udfContent, 'utf-8')

        return { success: true, filePath }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

    ipcMain.handle('print-html', async (_, htmlContent: string, printOptions?: any) => {
      try {
        const win = new BrowserWindow({ show: false })
        await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

        await new Promise((resolve) => setTimeout(resolve, 500))

        return await new Promise((resolve) => {
          win.webContents.print(
            { printBackground: true, ...printOptions },
            (success, failureReason) => {
              if (!win.isDestroyed()) {
                win.destroy()
              }
              if (success) {
                resolve({ success: true })
              } else {
                resolve({
                  success: false,
                  error: failureReason || 'Yazdırma işlemi iptal edildi veya başarısız oldu'
                })
              }
            }
          )
        })
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

    ipcMain.handle('preview-pdf', async (_, htmlContent: string, _printOptions?: any) => {
      try {
        const pdfBuffer = await renderPdfBuffer(htmlContent)
        return { success: true, data: pdfBuffer.toString('base64') }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

    ipcMain.handle(
      'export-html',
      async (_, htmlContent: string, options?: { paperSize?: string }, fileName?: string) => {
        try {
          const paperSize = options?.paperSize || 'A4'
          const isA4 = paperSize === 'A4'
          const width = isA4 ? '210mm' : 'auto'

          const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'HTML Olarak Kaydet',
            defaultPath: fileName ? `${fileName}.html` : 'Cikti.html',
            filters: [{ name: 'HTML Dosyası', extensions: ['html'] }]
          })
          if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

          const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Belge</title>
  <style>
    @page { size: ${paperSize}; margin: 20mm; }
    body { 
      width: ${width}; 
      margin: 0 auto; 
      font-family: 'Times New Roman', Times, serif; 
      font-size: 12pt;
      line-height: 1.5;
      background: white;
      padding: 0;
      box-sizing: border-box;
    }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; table-layout: fixed; }
    td, th { border: 1px solid #000; padding: 6px; }
    th { font-weight: bold; background-color: #f1f5f9; text-align: left; }
    p { margin-bottom: 1em; margin-top: 0; }
    ul { list-style-type: disc; padding-left: 20px; margin-bottom: 1em; }
    ol { list-style-type: decimal; padding-left: 20px; margin-bottom: 1em; }
    h1 { font-size: 16pt; font-weight: bold; margin-bottom: 0.5em; }
    h2 { font-size: 14pt; font-weight: bold; margin-bottom: 0.5em; }
    h3 { font-size: 12pt; font-weight: bold; margin-bottom: 0.5em; }
    @media print {
      body { margin: 0; width: 100%; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`

          fs.writeFileSync(filePath, fullHtml, 'utf8')

          return { success: true, filePath }
        } catch (err: any) {
          return { success: false, error: err.message }
        }
      }
    )

    ipcMain.handle('export-xlsx', async (_, bufferData: Uint8Array | ArrayBuffer) => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'XLSX Olarak Kaydet',
          defaultPath: 'Tablo.xlsx',
          filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
        })
        if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

        fs.writeFileSync(filePath, Buffer.from(bufferData as ArrayBuffer))

        return { success: true, filePath }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

    ipcMain.handle('import-docx', async () => {
      try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
          title: 'DOCX Seç',
          filters: [{ name: 'Word Document', extensions: ['docx'] }],
          properties: ['openFile']
        })
        if (canceled || !filePaths || filePaths.length === 0)
          return { success: false, error: 'İptal edildi' }

        const mammoth = require('mammoth')
        const result = await mammoth.convertToHtml({ path: filePaths[0] })
        return { success: true, html: result.value, messages: result.messages }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

    ipcMain.handle('import-xlsx', async () => {
      try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
          title: 'XLSX Seç',
          filters: [{ name: 'Excel Dosyası', extensions: ['xlsx', 'xls'] }],
          properties: ['openFile']
        })
        if (canceled || !filePaths || filePaths.length === 0)
          return { success: false, error: 'İptal edildi' }

        const buffer = fs.readFileSync(filePaths[0])
        return { success: true, data: buffer }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

    ipcMain.handle('template:export', async (_, payloadStr: string) => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Şablonu Dışa Aktar',
          defaultPath: 'Yeni_Sablon.dtal.template',
          filters: [{ name: 'DTAL Template', extensions: ['dtal.template'] }]
        })
        if (canceled || !filePath) return { success: false, error: 'İptal edildi' }
        fs.writeFileSync(filePath, payloadStr, 'utf-8')
        return { success: true, filePath }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

    ipcMain.handle('template:import', async () => {
      try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
          title: 'Şablonu İçe Aktar',
          filters: [{ name: 'DTAL Template', extensions: ['dtal.template'] }],
          properties: ['openFile']
        })
        if (canceled || !filePaths || filePaths.length === 0)
          return { success: false, error: 'İptal edildi' }
        const content = fs.readFileSync(filePaths[0], 'utf-8')
        return { success: true, data: content, filePath: filePaths[0] }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

    ipcMain.handle('template:read-system', async (_, fileName: string) => {
      const templatesDirDev = join(app.getAppPath(), 'resources', 'templates')
      const templatesDirProd = join(process.resourcesPath, 'templates')
      const targetDir = fs.existsSync(templatesDirProd) ? templatesDirProd : templatesDirDev

      const findFile = (dir: string): string | null => {
        try {
          const list = fs.readdirSync(dir)
          for (const file of list) {
            const filePath = join(dir, file)
            const stat = fs.statSync(filePath)
            if (stat.isDirectory()) {
              const found = findFile(filePath)
              if (found) return found
            } else if (file === fileName) {
              return filePath
            } else if (file === 'index.html' && fileName === `${dir.split(/[\\/]/).pop()}.html`) {
              return filePath
            } else if (
              file === 'index.html.json' &&
              fileName === `${dir.split(/[\\/]/).pop()}.html.json`
            ) {
              return filePath
            } else if (
              file === 'index.json' &&
              fileName === `${dir.split(/[\\/]/).pop()}.html.json`
            ) {
              return filePath
            }
          }
        } catch (e) {
          // ignore
        }
        return null
      }

      const filePath = findFile(targetDir)
      if (filePath) {
        return fs.readFileSync(filePath, 'utf-8')
      }
      return null
    })

    ipcMain.handle('template:write-system', async (_, fileName: string, content: string) => {
      const templatesDirDev = join(app.getAppPath(), 'resources', 'templates')
      const templatesDirProd = join(process.resourcesPath, 'templates')
      const targetDir = fs.existsSync(templatesDirProd) ? templatesDirProd : templatesDirDev

      const findFile = (dir: string): string | null => {
        try {
          const list = fs.readdirSync(dir)
          for (const file of list) {
            const filePath = join(dir, file)
            const stat = fs.statSync(filePath)
            if (stat.isDirectory()) {
              const found = findFile(filePath)
              if (found) return found
            } else if (file === fileName) {
              return filePath
            } else if (file === 'index.html' && fileName === `${dir.split(/[\\/]/).pop()}.html`) {
              return filePath
            } else if (
              file === 'index.html.json' &&
              fileName === `${dir.split(/[\\/]/).pop()}.html.json`
            ) {
              return filePath
            } else if (
              file === 'index.json' &&
              fileName === `${dir.split(/[\\/]/).pop()}.html.json`
            ) {
              return filePath
            }
          }
        } catch (e) {
          // ignore
        }
        return null
      }

      const targetPath = findFile(targetDir)

      if (targetPath) {
        try {
          fs.writeFileSync(targetPath, content, 'utf-8')
          return { success: true, filePath: targetPath }
        } catch (e: any) {
          return { success: false, error: e.message }
        }
      } else {
        return { success: false, error: 'Dosya bulunamadı' }
      }
    })

    ipcMain.handle('db:get-settings', async () => {
      try {
        const db = workspaceManager.getDb()
        const rows = db.prepare('SELECT key, value FROM settings').all() as {
          key: string
          value: string
        }[]
        const settingsObj: Record<string, string> = {}
        for (const row of rows) {
          settingsObj[row.key] = row.value
        }

        // Set defaults if keys are missing
        return {
          institutionName: settingsObj.institutionName || 'Bilinmeyen Kurum',
          institutionLogo: settingsObj.institutionLogo || null,
          logoLeft: settingsObj.logoLeft || null,
          logoRight: settingsObj.logoRight || null,
          adminName: settingsObj.adminName || 'Sistem Yöneticisi',
          adminTitle: settingsObj.adminTitle || 'Destek Sorumlusu',
          adminUsername: settingsObj.adminUsername || 'admin',
          eButceKodu: settingsObj.eButceKodu || '',
          say2000iKodu: settingsObj.say2000iKodu || '',
          themeLightVars: settingsObj.themeLightVars || '',
          themeDarkVars: settingsObj.themeDarkVars || '',
          ...settingsObj
        }
      } catch {
        // DB henüz açık değil — beklenen durum, sessizce varsayılanları döndür
        return {
          institutionName: null,
          institutionLogo: null,
          logoLeft: null,
          logoRight: null,
          adminName: 'Sistem Yöneticisi',
          adminTitle: 'Destek Sorumlusu',
          adminUsername: 'admin',
          eButceKodu: '',
          say2000iKodu: '',
          themeLightVars: '',
          themeDarkVars: ''
        }
      }
    })

    ipcMain.handle('db:check-auth-setup', async () => {
      try {
        const db = workspaceManager.getDb()

        const userRow = db
          .prepare("SELECT value FROM settings WHERE key = 'adminUsername'")
          .get() as { value: string } | undefined
        const passRow = db
          .prepare("SELECT value FROM settings WHERE key = 'adminPassword'")
          .get() as { value: string } | undefined

        const hasUser = !!userRow?.value
        const hasPass = !!passRow?.value

        return { hasCredentials: hasUser && hasPass }
      } catch (error: any) {
        console.error('Check auth setup error:', error)
        return { hasCredentials: false, error: error.message }
      }
    })

    ipcMain.handle('db:setup-auth', async (_, code: string, user: string, pass: string) => {
      try {
        const db = workspaceManager.getDb()
        db.exec(`
          INSERT OR REPLACE INTO settings (key, value) VALUES ('eButceKodu', '${code.replace(/'/g, "''")}');
          INSERT OR REPLACE INTO settings (key, value) VALUES ('adminUsername', '${user.replace(/'/g, "''")}');
          INSERT OR REPLACE INTO settings (key, value) VALUES ('adminPassword', '${pass.replace(/'/g, "''")}');
        `)
        workspaceManager.save()
        broadcastDbChange()
        return { success: true }
      } catch (error: any) {
        console.error('Setup auth error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('db:login', async (_, _code: string, user: string, pass: string) => {
      try {
        const db = workspaceManager.getDb()

        const userRow = db
          .prepare("SELECT value FROM settings WHERE key = 'adminUsername'")
          .get() as { value: string } | undefined
        const passRow = db
          .prepare("SELECT value FROM settings WHERE key = 'adminPassword'")
          .get() as { value: string } | undefined

        const expectedUser = userRow?.value || ''
        const expectedPass = passRow?.value || ''

        if (user === expectedUser && pass === expectedPass) {
          return { success: true }
        }
        return { success: false, error: 'Kullanıcı adı veya şifre hatalı!' }
      } catch (error: any) {
        console.error('Login error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('db:save-settings', async (_, settingsMap: Record<string, string>) => {
      try {
        const db = workspaceManager.getDb()
        const insertStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
        const transaction = db.transaction((settings: Record<string, string>) => {
          for (const [key, value] of Object.entries(settings)) {
            insertStmt.run(key, value)
          }
        })
        transaction(settingsMap)
        workspaceManager.save()
        broadcastDbChange()
        return { success: true }
      } catch (error: unknown) {
        console.error('Save settings error:', error)
        return { success: false, error: error instanceof Error ? error.message : String(error) }
      }
    })

    let activeRecoveryState: { code: string; expiresAt: number } | null = null

    ipcMain.handle('db:send-recovery-email', async () => {
      try {
        const db = workspaceManager.getDb()
        const hostRow = db.prepare("SELECT value FROM settings WHERE key = 'smtp_host'").get() as
          | { value: string }
          | undefined
        const portRow = db.prepare("SELECT value FROM settings WHERE key = 'smtp_port'").get() as
          | { value: string }
          | undefined
        const userRow = db.prepare("SELECT value FROM settings WHERE key = 'smtp_user'").get() as
          | { value: string }
          | undefined
        const passRow = db.prepare("SELECT value FROM settings WHERE key = 'smtp_pass'").get() as
          | { value: string }
          | undefined
        const secureRow = db
          .prepare("SELECT value FROM settings WHERE key = 'smtp_secure'")
          .get() as { value: string } | undefined
        const emailRow = db
          .prepare("SELECT value FROM settings WHERE key = 'institutionEmail'")
          .get() as { value: string } | undefined

        if (
          !hostRow?.value ||
          !portRow?.value ||
          !userRow?.value ||
          !passRow?.value ||
          !emailRow?.value
        ) {
          return {
            success: false,
            error:
              'SMTP Ayarları veya Kurum E-posta adresi eksik! Lütfen önce ayarlardan yapılandırın.'
          }
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString()
        activeRecoveryState = {
          code,
          expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
        }

        const port = parseInt(portRow.value) || 587
        const userSecure = secureRow?.value === 'true'
        const actualSecure = port === 465 ? true : port === 587 ? false : userSecure

        const transporter = nodemailer.createTransport({
          host: hostRow.value,
          port: port,
          secure: actualSecure,
          auth: {
            user: userRow.value,
            pass: passRow.value
          },
          tls: {
            rejectUnauthorized: false
          }
        })

        await transporter.sendMail({
          from: `"DT Asistan" <${userRow.value}>`,
          to: emailRow.value,
          subject: 'DT Asistan Şifre Sıfırlama Kodu',
          text: `Kurum dosyası şifre sıfırlama kodunuz: ${code}\nBu kod 10 dakika boyunca geçerlidir.`,
          html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #2563eb;">DT Asistan Şifre Sıfırlama</h2>
            <p>Kurum dosyası şifre sıfırlama kodunuz aşağıdadır:</p>
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 20px 0; color: #0f172a;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #64748b;">Bu kod 10 dakika boyunca geçerlidir. Eğer bu talebi siz yapmadıysanız lütfen bu e-postayı dikkate almayın.</p>
          </div>`
        })

        return { success: true, email: emailRow.value }
      } catch (error: any) {
        console.error('Send recovery email error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('db:verify-recovery-code', async (_, enteredCode: string) => {
      try {
        if (!activeRecoveryState) {
          return { success: false, error: 'Sıfırlama talebi bulunamadı!' }
        }
        if (Date.now() > activeRecoveryState.expiresAt) {
          activeRecoveryState = null
          return { success: false, error: 'Sıfırlama kodunun süresi dolmuş!' }
        }
        if (enteredCode.trim() === activeRecoveryState.code) {
          return { success: true }
        }
        return { success: false, error: 'Sıfırlama kodu hatalı!' }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('db:export-smtp', async () => {
      try {
        const db = workspaceManager.getDb()
        const keys = [
          'smtp_host',
          'smtp_port',
          'smtp_user',
          'smtp_pass',
          'smtp_secure',
          'institutionEmail'
        ]
        const config: Record<string, string> = {}

        for (const key of keys) {
          const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
            | { value: string }
            | undefined
          config[key] = row?.value || ''
        }

        const { filePath, canceled } = await dialog.showSaveDialog({
          title: 'SMTP Ayarlarını Dışa Aktar',
          defaultPath: 'smtp_ayarlari.json',
          filters: [{ name: 'JSON Files', extensions: ['json'] }]
        })

        if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

        fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8')
        return { success: true }
      } catch (error: any) {
        console.error('Export SMTP error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('db:import-smtp', async () => {
      try {
        const { filePaths, canceled } = await dialog.showOpenDialog({
          title: 'SMTP Ayarlarını İçe Aktar',
          filters: [{ name: 'JSON Files', extensions: ['json'] }],
          properties: ['openFile']
        })

        if (canceled || !filePaths || filePaths.length === 0)
          return { success: false, error: 'İptal edildi' }

        const content = fs.readFileSync(filePaths[0], 'utf-8')
        const config = JSON.parse(content)

        const keys = [
          'smtp_host',
          'smtp_port',
          'smtp_user',
          'smtp_pass',
          'smtp_secure',
          'institutionEmail'
        ]
        const db = workspaceManager.getDb()

        db.transaction(() => {
          for (const key of keys) {
            if (config[key] !== undefined) {
              db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
                key,
                String(config[key])
              )
            }
          }
        })()

        workspaceManager.save()
        broadcastDbChange()
        return { success: true }
      } catch (error: any) {
        console.error('Import SMTP error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('db:export-dte', async (_, contentType: string) => {
      try {
        const db = workspaceManager.getDb()
        const activeMeta = workspaceManager.getMeta()

        const data: Record<string, any[]> = {}
        let recordCount = 0

        const exportTable = (tableName: string) => {
          const row = db
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
            .get(tableName)
          if (row) {
            const rows = db.prepare(`SELECT * FROM ${tableName}`).all()
            data[tableName] = rows
            recordCount += rows.length
          }
        }

        if (contentType === 'firms' || contentType === 'all') exportTable('TANIM_Firma')
        if (contentType === 'items' || contentType === 'all') exportTable('TANIM_Kalem')
        if (contentType === 'birimler' || contentType === 'all') exportTable('TANIM_Birim')
        if (contentType === 'personel' || contentType === 'all') exportTable('TANIM_Personel')
        if (contentType === 'mevzuat' || contentType === 'all') exportTable('TANIM_Mevzuat')
        if (contentType === 'ambar' || contentType === 'all') exportTable('TANIM_Ambar')
        if (contentType === 'tasinir' || contentType === 'all') exportTable('TANIM_TasinirKod')
        if (contentType === 'olcubirimleri' || contentType === 'all')
          exportTable('TANIM_OlcuBirimleri')

        // Note: DATA_TeminDosyasi is deliberately skipped unless explicitly requested, as it contains transactional data.
        if (contentType === 'full_backup') {
          exportTable('TANIM_Firma')
          exportTable('TANIM_Kalem')
          exportTable('TANIM_Birim')
          exportTable('TANIM_Personel')
          exportTable('TANIM_Mevzuat')
          exportTable('TANIM_Ambar')
          exportTable('TANIM_TasinirKod')
          exportTable('TANIM_OlcuBirimleri')
          exportTable('DATA_TeminDosyasi')
          exportTable('settings')
        }

        // Fetch active institution name from settings
        let institutionName = activeMeta?.institution || 'Bilinmeyen Kurum'
        try {
          const row = db
            .prepare("SELECT value FROM settings WHERE key = 'institutionName'")
            .get() as { value: string } | undefined
          if (row && row.value) {
            institutionName = row.value
          }
        } catch (e) {
          // ignore
        }

        // Get active schema version
        let activeSchemaVersion = CURRENT_SCHEMA_VERSION
        try {
          const row = db
            .prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'")
            .get() as { value: string } | undefined
          if (row && row.value) {
            activeSchemaVersion = parseInt(row.value, 10) || CURRENT_SCHEMA_VERSION
          }
        } catch (e) {
          // ignore
        }

        const payload = {
          dte_version: '1.0',
          exported_from_app: app.getVersion(),
          exported_from_schema: activeSchemaVersion,
          exported_at: new Date().toISOString().split('T')[0],
          institution: institutionName,
          content_type: contentType,
          record_count: recordCount,
          data
        }

        const { filePath, canceled } = await dialog.showSaveDialog({
          title: 'Doğrudan Temin Verilerini Dışa Aktar (.dte)',
          defaultPath: `dt_veri_aktarimi_${contentType}_${new Date().toISOString().split('T')[0]}.dte`,
          filters: [{ name: 'DTE Files', extensions: ['dte', 'json'] }]
        })

        if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

        fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8')
        return { success: true, filePath, recordCount }
      } catch (error: any) {
        console.error('Export DTE error:', error)
        return { success: false, error: error.message }
      }
    })

    // --- AI Handlers ---
    ipcMain.handle('ai:generate', async (_, options: AIGenerateOptions) => {
      return await generateContent(options)
    })

    ipcMain.handle('ai:test', async (_, provider: string, apiKey: string) => {
      return await testConnection({ provider, apiKey })
    })

    ipcMain.handle('db:import-dte', async (_, customFilePath?: string) => {
      try {
        let filePath = customFilePath
        if (!filePath) {
          const { filePaths, canceled } = await dialog.showOpenDialog({
            title: 'Doğrudan Temin Verilerini İçe Aktar (.dte)',
            filters: [{ name: 'DTE Files', extensions: ['dte', 'json'] }],
            properties: ['openFile']
          })

          if (canceled || !filePaths || filePaths.length === 0) {
            return { success: false, error: 'İptal edildi' }
          }
          filePath = filePaths[0]
        }

        const content = fs.readFileSync(filePath, 'utf-8')

        const payload = JSON.parse(content)

        // Metadata validations
        if (!payload.dte_version) {
          return { success: false, error: 'Geçersiz DTE dosyası: dte_version bulunamadı.' }
        }

        const exportedSchema = parseInt(payload.exported_from_schema, 10) || 1
        if (exportedSchema > CURRENT_SCHEMA_VERSION) {
          return {
            success: false,
            error: `Bu dosya daha yeni bir uygulama sürümü gerektirir. (Gereken Şema Sürümü: v${exportedSchema}, Mevcut Şema Sürümü: v${CURRENT_SCHEMA_VERSION})`
          }
        }

        const contentType = payload.content_type || 'all'
        const dataToImport = payload.data || {}

        const db = workspaceManager.getDb()

        // Helpers to check tables & columns dynamically
        const checkTableExists = (tableName: string): boolean => {
          const row = db
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
            .get(tableName)
          return !!row
        }

        const getTableColumns = (tableName: string): string[] => {
          const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
            name: string
          }>
          return rows.map((r) => r.name)
        }

        let totalImportedCount = 0
        const warnings: string[] = []

        db.transaction(() => {
          for (const [tableName, rows] of Object.entries(dataToImport)) {
            const tableRows = rows as any[]
            if (Array.isArray(tableRows) && tableRows.length > 0) {
              if (checkTableExists(tableName)) {
                const existingCols = getTableColumns(tableName)
                let tableImportCount = 0

                for (const row of tableRows) {
                  const filteredRow: Record<string, any> = {}
                  for (const col of existingCols) {
                    if (row[col] !== undefined) {
                      filteredRow[col] = row[col]
                    }
                  }

                  if (Object.keys(filteredRow).length > 0) {
                    const colsStr = Object.keys(filteredRow)
                      .map((c) => `"${c}"`)
                      .join(', ')
                    const placeholders = Object.keys(filteredRow)
                      .map(() => '?')
                      .join(', ')
                    const values = Object.values(filteredRow)

                    db.prepare(
                      `INSERT OR REPLACE INTO ${tableName} (${colsStr}) VALUES (${placeholders})`
                    ).run(...values)
                    tableImportCount++
                    totalImportedCount++
                  }
                }
              } else {
                warnings.push(
                  `${tableName} tablosu hedef veritabanında bulunamadı. Aktarımı atlandı.`
                )
              }
            }
          }
        })()

        workspaceManager.save()
        broadcastDbChange()

        return {
          success: true,
          totalImportedCount,
          importedFirmsCount: dataToImport['TANIM_Firma']?.length || 0, // Kept for backwards compatibility in UI
          importedItemsCount: dataToImport['TANIM_Kalem']?.length || 0, // Kept for backwards compatibility in UI
          contentType,
          warnings
        }
      } catch (error: any) {
        console.error('Import DTE error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('db:import-tasinir-excel', async () => {
      try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
          title: 'Taşınır Kodları Excel Dosyasını Seçin',
          filters: [{ name: 'Excel Dosyaları', extensions: ['xls', 'xlsx'] }],
          properties: ['openFile']
        })

        if (canceled || !filePaths || filePaths.length === 0)
          return { success: false, error: 'İptal edildi' }

        const filePath = filePaths[0]
        const xlsx = require('xlsx')
        const workbook = xlsx.readFile(filePath)
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

        const db = workspaceManager.getDb()

        const insertStmt = db.prepare(`
          INSERT INTO TANIM_TasinirKod (tam_kod, hesap_kodu, duzey_1, duzey_2, duzey_3, duzey_4, duzey_5, aciklama)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(tam_kod) DO UPDATE SET aciklama = excluded.aciklama
        `)

        let count = 0
        const importTransaction = db.transaction((rows: any[][]) => {
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i]
            // Verify if row has at least an explanation at index 6 and a hesap_kodu at index 0
            if (row && row.length >= 7 && row[0] && row[6]) {
              const hesap = String(row[0]).trim()
              const d1 = row[1] ? String(row[1]).trim() : null
              const d2 = row[2] ? String(row[2]).trim() : null
              const d3 = row[3] ? String(row[3]).trim() : null
              const d4 = row[4] ? String(row[4]).trim() : null
              const d5 = row[5] ? String(row[5]).trim() : null
              const aciklama = String(row[6]).trim()

              let tam_kod = hesap
              if (d1) tam_kod += '.' + d1
              if (d1 && d2) tam_kod += '.' + d2
              if (d1 && d2 && d3) tam_kod += '.' + d3
              if (d1 && d2 && d3 && d4) tam_kod += '.' + d4
              if (d1 && d2 && d3 && d4 && d5) tam_kod += '.' + d5

              insertStmt.run(tam_kod, hesap, d1, d2, d3, d4, d5, aciklama)
              count++
            }
          }
        })

        importTransaction(data)
        workspaceManager.save()
        broadcastDbChange()

        return { success: true, count }
      } catch (error: any) {
        console.error('Excel Import Error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('db:import-okas-excel', async () => {
      try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
          title: 'OKAS Kodları Excel Dosyasını Seçin',
          filters: [{ name: 'Excel Dosyaları', extensions: ['xls', 'xlsx'] }],
          properties: ['openFile']
        })

        if (canceled || !filePaths || filePaths.length === 0)
          return { success: false, error: 'İptal edildi' }

        const xlsx = require('xlsx')
        const workbook = xlsx.readFile(filePaths[0])
        const sheetName = workbook.SheetNames[0]
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 }) as any[][]

        const db = workspaceManager.getDb()

        const insertStmt = db.prepare(`
          INSERT INTO TANIM_OkasKod (kod, bolum, grup, sinif, aciklama)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(kod) DO UPDATE SET aciklama = excluded.aciklama
        `)

        let count = 0
        const tx = db.transaction((rows: any[][]) => {
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i]
            if (row && row.length >= 2 && row[0] && row[1]) {
              const rawKod = String(row[0]).replace(/\D/g, '').slice(0, 8)
              if (rawKod.length < 2) continue
              const aciklama = String(row[1]).trim()
              const bolum = rawKod.slice(0, 2)
              const grup = rawKod.length >= 3 ? rawKod.slice(0, 3) : null
              const sinif = rawKod.length >= 4 ? rawKod.slice(0, 4) : null
              insertStmt.run(rawKod, bolum, grup, sinif, aciklama)
              count++
            }
          }
        })

        tx(data)
        workspaceManager.save()
        broadcastDbChange()

        return { success: true, count }
      } catch (error: any) {
        console.error('OKAS Excel Import Error:', error)
        return { success: false, error: error.message }
      }
    })

    // -----------------------------------------------------------------------------------------------------
    // MALZEME (KALEM) EXCEL IMPORT & TEMPLATE
    // -----------------------------------------------------------------------------------------------------
    ipcMain.handle('db:export-kalem-template', async () => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Malzeme (Kalem) Excel Şablonunu Kaydet',
          defaultPath: 'malzeme_sablon.xlsx',
          filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
        })
        if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

        const xlsx = require('xlsx')
        const headers = [
          'Barkod/ID',
          'Taşınır Kodu',
          'OKAS Kodu',
          'Malzeme/Hizmet Adı',
          'Türü',
          'Birim',
          'Kategori',
          'Özelliği',
          'KDV Oranı (%)',
          'Menşei',
          'Personel Hizmeti Mi?',
          'Asgari Ücret Fark Oranı (%)'
        ]
        const exampleRows = [
          [
            'MLZ-0001',
            '150.01.01',
            '30192700',
            'A4 Fotokopi Kağıdı',
            'Mal',
            'Paket',
            'Kırtasiye',
            '80 gr/m2 beyaz renk',
            20,
            'Yerli',
            'Hayır',
            0
          ],
          [
            'MLZ-0002',
            '',
            '',
            'Özel Yazılım Geliştirme',
            'Hizmet, Diğer',
            'Saat',
            'Bilişim',
            '',
            20,
            'Yerli',
            'Hayır',
            0
          ],
          [
            'MLZ-0003',
            '',
            '',
            'Güvenlik Personeli',
            'Hizmet, Personel',
            'Kişi',
            'Güvenlik',
            'Silahlı güvenlik görevlisi',
            20,
            'Yerli',
            'Evet',
            15
          ]
        ]

        const ws = xlsx.utils.aoa_to_sheet([headers, ...exampleRows])
        ws['!cols'] = [
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 40 },
          { wch: 15 },
          { wch: 10 },
          { wch: 15 },
          { wch: 30 },
          { wch: 15 },
          { wch: 10 },
          { wch: 20 },
          { wch: 25 }
        ]
        const wb = xlsx.utils.book_new()
        xlsx.utils.book_append_sheet(wb, ws, 'Malzemeler')

        // Add beni_oku sheet
        const db = workspaceManager.getDb()
        const birimler = db
          .prepare('SELECT ad FROM TANIM_OlcuBirimi WHERE aktif_mi = 1 ORDER BY ad ASC')
          .all() as { ad: string }[]
        const beniOkuRows = [
          ['DİKKAT EDİLECEK HUSUSLAR'],
          ['1. Barkod/ID boş bırakılırsa sistem otomatik rastgele ID atar.'],
          [
            '2. Türü alanı şu değerlerden biri olmalıdır: Mal, Hizmet, Personel, Hizmet, Diğer, Yapım'
          ],
          ['3. Menşei alanı şu değerlerden biri olmalıdır: Yerli, Yabancı'],
          ['4. Personel Hizmeti Mi? alanı: Evet veya Hayır olmalıdır.'],
          [''],
          ['SİSTEMDEKİ GEÇERLİ BİRİMLER (Ölçü Birimi sütununda bunlardan birini kullanın)']
        ]
        birimler.forEach((b) => beniOkuRows.push([b.ad]))

        const wsBeniOku = xlsx.utils.aoa_to_sheet(beniOkuRows)
        wsBeniOku['!cols'] = [{ wch: 80 }]
        xlsx.utils.book_append_sheet(wb, wsBeniOku, 'beni_oku')

        xlsx.writeFile(wb, filePath)

        return { success: true }
      } catch (error: any) {
        console.error('Kalem Excel Template Error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('db:import-kalem-excel', async () => {
      try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
          title: 'Malzeme (Kalem) Excel Dosyasını Seçin',
          filters: [{ name: 'Excel Dosyaları', extensions: ['xls', 'xlsx'] }],
          properties: ['openFile']
        })

        if (canceled || !filePaths || filePaths.length === 0)
          return { success: false, error: 'İptal edildi' }

        const xlsx = require('xlsx')
        const workbook = xlsx.readFile(filePaths[0])
        const sheetName = workbook.SheetNames[0]
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 }) as any[][]

        const db = workspaceManager.getDb()
        const crypto = require('crypto')

        const insertStmt = db.prepare(`
          INSERT INTO TANIM_Kalem (barkod_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, kategori, ozelligi, kdv_orani, mensei, is_personel, personel_asgari_fark_oran)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(barkod_id) DO UPDATE SET 
            tasinir_kodu = excluded.tasinir_kodu,
            okas_kodu = excluded.okas_kodu,
            kalem_adi = excluded.kalem_adi,
            tipi = excluded.tipi,
            birim = excluded.birim,
            kategori = excluded.kategori,
            ozelligi = excluded.ozelligi,
            kdv_orani = excluded.kdv_orani,
            mensei = excluded.mensei,
            is_personel = excluded.is_personel,
            personel_asgari_fark_oran = excluded.personel_asgari_fark_oran
        `)

        let count = 0
        const tx = db.transaction((rows: any[][]) => {
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i]
            if (row && row.length >= 4 && row[3]) {
              const barkodId = row[0] ? String(row[0]).trim() : crypto.randomUUID()
              const tasinirKodu = row[1] ? String(row[1]).trim() : null
              const okasKodu = row[2] ? String(row[2]).trim() : null
              const kalemAdi = String(row[3]).trim()
              const tipi = row[4] ? String(row[4]).trim() : 'Mal'
              const birim = row[5] ? String(row[5]).trim() : 'Adet'
              const kategori = row[6] ? String(row[6]).trim() : null
              const ozelligi = row[7] ? String(row[7]).trim() : null
              const kdv = row[8] !== undefined ? Number(row[8]) : 20
              const mensei = row[9] ? String(row[9]).trim() : null
              const isPersonelStr = row[10] ? String(row[10]).trim().toLowerCase() : 'hayır'
              const isPersonel =
                isPersonelStr === 'evet' || isPersonelStr === '1' || isPersonelStr === 'true'
                  ? 1
                  : 0
              const asgariOran = row[11] !== undefined ? Number(row[11]) : 0

              insertStmt.run(
                barkodId,
                tasinirKodu,
                okasKodu,
                kalemAdi,
                tipi,
                birim,
                kategori,
                ozelligi,
                kdv,
                mensei,
                isPersonel,
                asgariOran
              )
              count++
            }
          }
        })

        tx(data)
        workspaceManager.save()
        broadcastDbChange()

        return { success: true, count }
      } catch (error: any) {
        console.error('Kalem Excel Import Error:', error)
        return { success: false, error: error.message }
      }
    })

    // ─── Taşınır Kodu Şablon İndir ────────────────────────────────────────────
    ipcMain.handle('db:export-tasinir-template', async () => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Taşınır Kodları Excel Şablonunu Kaydet',
          defaultPath: 'tasinir_kodu_sablon.xlsx',
          filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
        })
        if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

        const xlsx = require('xlsx')
        const headers = [
          'Hesap Kodu',
          'I. Düzey',
          'II. Düzey',
          'III. Düzey',
          'IV. Düzey',
          'V. Düzey',
          'Açıklama'
        ]
        const exampleRows = [
          ['150', '01', '', '', '', '', 'Tüketim Malzemeleri'],
          ['150', '01', '01', '', '', '', 'Kırtasiye Malzemeleri'],
          ['150', '01', '01', '01', '', '', 'Kalemler ve Yazı Araçları'],
          ['150', '01', '01', '01', '01', '', 'Roller Kalemler'],
          ['150', '01', '01', '01', '01', '01', 'Roller Kalem (Siyah)']
        ]
        const ws = xlsx.utils.aoa_to_sheet([headers, ...exampleRows])
        ws['!cols'] = headers.map(() => ({ wch: 20 }))
        const wb = xlsx.utils.book_new()
        xlsx.utils.book_append_sheet(wb, ws, 'Taşınır Kodları')
        xlsx.writeFile(wb, filePath)

        return { success: true, filePath }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    // ─── OKAS Kodu Şablon İndir ───────────────────────────────────────────────
    ipcMain.handle('db:export-okas-template', async () => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'OKAS Kodları Excel Şablonunu Kaydet',
          defaultPath: 'okas_kodu_sablon.xlsx',
          filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
        })
        if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

        const xlsx = require('xlsx')
        const headers = ['OKAS Kodu (8 hane)', 'Açıklama']
        const exampleRows = [
          ['30192700', 'Yazıcılar'],
          ['30197630', 'Zımba makineleri'],
          ['30197000', 'Küçük büro malzemeleri'],
          ['48820000', 'İşletim sistemleri'],
          ['79820000', 'Baskı hizmetleri']
        ]
        const ws = xlsx.utils.aoa_to_sheet([headers, ...exampleRows])
        ws['!cols'] = [{ wch: 22 }, { wch: 40 }]
        const wb = xlsx.utils.book_new()
        xlsx.utils.book_append_sheet(wb, ws, 'OKAS Kodları')
        xlsx.writeFile(wb, filePath)

        return { success: true, filePath }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    // Reset Placeholders to defaults
    ipcMain.handle('db:resetPlaceholders', async () => {
      try {
        const db = workspaceManager.getDb()
        db.exec('DELETE FROM TANIM_Placeholder;')
        if (TANIM_Placeholder.initialData && TANIM_Placeholder.initialData.length > 0) {
          TANIM_Placeholder.initialData.forEach((row: any) => {
            const keys = Object.keys(row)
            const values = Object.values(row).map((v) =>
              typeof v === 'string' ? "'" + (v as string).replace(/'/g, "''") + "'" : v
            )
            db.exec(
              `INSERT INTO TANIM_Placeholder (${keys.join(', ')}) VALUES (${values.join(', ')});`
            )
          })
        }
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    // Genel okuma işlemi (SELECT)
    ipcMain.handle('db:query', async (_, sql: string, params: any[] = []) => {
      try {
        const db = workspaceManager.getDb()
        const stmt = db.prepare(sql)
        const rows = stmt.all(...params)
        return { success: true, data: rows }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    // Genel yazma işlemi (INSERT, UPDATE, DELETE)
    ipcMain.handle('db:run', async (_, sql: string, params: any[] = []) => {
      try {
        const db = workspaceManager.getDb()
        const stmt = db.prepare(sql)
        const info = stmt.run(...params)
        broadcastDbChange()
        workspaceManager.save()
        return { success: true, lastInsertRowid: info.lastInsertRowid, changes: info.changes }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    // Transaction işlemi (Çoklu INSERT, UPDATE, DELETE)
    ipcMain.handle('db:transaction', async (_, queries: { sql: string; params: any[] }[]) => {
      try {
        const db = workspaceManager.getDb()

        let lastInsertRowid: number | bigint = 0
        let totalChanges = 0

        const transaction = db.transaction((stmts: { sql: string; params: any[] }[]) => {
          for (const q of stmts) {
            const stmt = db.prepare(q.sql)
            const info = stmt.run(...q.params)
            lastInsertRowid = info.lastInsertRowid
            totalChanges += info.changes
          }
        })

        transaction(queries)

        broadcastDbChange()
        workspaceManager.save()

        return { success: true, lastInsertRowid, changes: totalChanges }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    createWindow()

    // Helper to send status to all open windows
    const sendUpdaterStatus = (status: string, data: any = {}) => {
      const windows = BrowserWindow.getAllWindows()
      windows.forEach((w) => {
        if (!w.isDestroyed()) {
          w.webContents.send('updater:status', { status, ...data })
        }
      })
    }

    // --- Auto Updater Logic ---
    if (!app.isPackaged) {
      autoUpdater.forceDevUpdateConfig = true
    }

    // Uygulama açıldıktan saniyeler sonra güncellemeleri kontrol et
    if (app.isPackaged || autoUpdater.forceDevUpdateConfig) {
      setTimeout(() => {
        autoUpdater.checkForUpdates().catch((e) => {
          console.error('Update check error:', e.message)
        })
      }, 5000)
    }

    let devUpdateVersionOverride = ''

    ipcMain.handle('updater:set-dev-version', (_, mode: boolean, version: string) => {
      devUpdateVersionOverride = mode && version ? version : ''
      if (devUpdateVersionOverride && !app.isPackaged) {
        try {
          const semver = require('semver')
          Object.defineProperty(autoUpdater, 'currentVersion', {
            get: () => semver.parse(devUpdateVersionOverride) || semver.parse('0.0.0'),
            configurable: true
          })
        } catch (e) {
          console.error('Mock currentVersion hatası:', e)
        }
      }
      return { success: true }
    })

    ipcMain.handle('app:get-version', () => {
      return devUpdateVersionOverride || app.getVersion()
    })

    autoUpdater.on('checking-for-update', () => {
      console.log('Güncellemeler kontrol ediliyor...')
      sendUpdaterStatus('checking')
    })

    autoUpdater.on('update-available', (info) => {
      console.log(`Yeni sürüm bulundu! Sürüm: ${info.version}`)

      try {
        const versionsPath = join(__dirname, '../../versions.json')
        if (fs.existsSync(versionsPath)) {
          const versionsList: string[] = JSON.parse(fs.readFileSync(versionsPath, 'utf8'))
          const currentV =
            devUpdateVersionOverride ||
            (autoUpdater.currentVersion as any)?.version ||
            app.getVersion()
          const incomingVersion = info.version.replace(/^v/, '')
          const cleanCurrentV = currentV.replace(/^v/, '')

          const currentIndex = versionsList.indexOf(cleanCurrentV)
          const incomingIndex = versionsList.indexOf(incomingVersion)

          // Eğer ikisi de listedeyse ve gelen sürüm mevcut sürümden eski/aynı ise
          if (currentIndex !== -1 && incomingIndex !== -1 && incomingIndex <= currentIndex) {
            console.log(
              `Bulunan sürüm (${incomingVersion}) mevcut sürümden (${cleanCurrentV}) daha eski veya aynı. Güncelleme reddedildi!`
            )
            sendUpdaterStatus('not-available', { version: cleanCurrentV, info: null })
            return
          }
        }
      } catch (err) {
        console.error('versions.json kontrol hatası:', err)
      }

      sendUpdaterStatus('available', { version: info.version, info })
    })

    autoUpdater.on('update-not-available', (info) => {
      console.log('Güncelleme yok, en güncel sürümdesiniz.')
      sendUpdaterStatus('not-available', { version: info?.version, info })
    })

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Güncelleme başarıyla indirildi. Kurulum için hazır.', info.version)
      sendUpdaterStatus('downloaded', { version: info.version, info })
    })

    autoUpdater.on('error', (err: any) => {
      if (err.message && err.message.includes('No published versions on GitHub')) {
        console.log('Güncelleme yok, en güncel sürümdesiniz.')
        sendUpdaterStatus('not-available', { version: app.getVersion(), info: null })
      } else {
        console.error('Güncelleme sırasında hata oluştu:', err)
        sendUpdaterStatus('error', { error: err.message })
      }
    })

    ipcMain.handle('updater:check', async () => {
      try {
        if (!app.isPackaged && !autoUpdater.forceDevUpdateConfig) {
          return {
            success: false,
            error: 'Geliştirme modunda (Dev) otomatik güncelleme denetlenemez.'
          }
        }
        const result = await autoUpdater.checkForUpdates()
        if (result === null) {
          return {
            success: false,
            error: 'Güncelleme kontrolü bu ortamda atlandı veya desteklenmiyor.'
          }
        }
        // Cannot clone CancellationToken, downloadPromise etc over IPC
        return { success: true, version: result.updateInfo.version }
      } catch (error: any) {
        if (error.message && error.message.includes('No published versions on GitHub')) {
          console.log('Manuel kontrol: Sistem güncel.')
          sendUpdaterStatus('not-available', { version: app.getVersion(), info: null })
          return { success: true }
        }

        console.error('Manual update check error:', error)

        // GİZLİ REPO (PRIVATE) HAZIRLIĞI:
        // Eğer repo private ise ve token verilmemişse genelde 404 Not Found veya 401/403 döner.
        // İleride kullanıcı ayarlarından token alıp autoUpdater.requestHeaders'a ekleyip tekrar deneyebiliriz:
        /*
        if (error.statusCode === 404 || error.statusCode === 401 || error.statusCode === 403) {
           console.log('Gizli repo erişimi reddedildi, token ile tekrar deneniyor...')
           // autoUpdater.requestHeaders = { ...autoUpdater.requestHeaders, Authorization: `Bearer ${userToken}` }
           // const retryResult = await autoUpdater.checkForUpdates()
           // return { success: true, version: retryResult.updateInfo.version }
        }
        */

        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('updater:quit-and-install', () => {
      try {
        autoUpdater.quitAndInstall()
        return { success: true }
      } catch (error: any) {
        console.error('Quit and install error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('app:isPackaged', () => {
      return app.isPackaged
    })

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

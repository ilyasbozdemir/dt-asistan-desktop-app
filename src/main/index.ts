import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import isDev from 'electron-is-dev'
import fs from 'fs'
import yaml from 'js-yaml'
import icon from '../../resources/icon.png?asset'
import { workspaceManager } from './db/workspace'
import { CURRENT_SCHEMA_VERSION } from './db/migrate'
import nodemailer from 'nodemailer'
import {
  isSupportedFile,
  allFormatsFilter,
  perFormatFilters,
  defaultFormat
} from './config/fileFormats'

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
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

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

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
      const mainWindow = windows[0]
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()

      // Eğer desteklenen bir dosya çift tıklandıysa
      const filePath = commandLine.find((arg) => isSupportedFile(arg))
      if (filePath) {
        mainWindow.webContents.send('open-external-file', filePath)
      }
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
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

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))

    ipcMain.on('install-update', () => {
      autoUpdater.quitAndInstall(false, true)
    })

    // --- Workspace & SQLite Handlers ---
    const broadcastDbChange = () => {
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send('db:invalidated')
        }
      })
    }

    ipcMain.on('window:open-secondary', (_, data: { path: string; search: string; title?: string }) => {
      const parent = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
      const newWindow = new BrowserWindow({
        width: 1000,
        height: 750,
        minWidth: 800,
        minHeight: 600,
        parent: parent || undefined,
        modal: false,
        autoHideMenuBar: true,
        title: data.title || 'DT Asistan — Detay',
        icon: icon,
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false
        }
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
    })

    // --- Tab ↔ Window IPC Handlers ---
    // Opens a tab's content in a separate detached window
    ipcMain.on('tab:open-in-window', (_, data: { path: string; title: string; workspacePath?: string }) => {
      const newWindow = new BrowserWindow({
        width: 1000,
        height: 750,
        minWidth: 800,
        minHeight: 600,
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
    })

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
        return { success: true, meta }
      } catch (error: any) {
        console.error('Create workspace error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('workspace:open', async (_, filePath: string) => {
      try {
        const meta = workspaceManager.open(filePath)
        return { success: true, meta }
      } catch (error: any) {
        console.error('Open workspace error:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('workspace:close', async () => {
      try {
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

    ipcMain.handle('export-docx', async (_, htmlContent: string) => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'DOCX Olarak Kaydet',
          defaultPath: 'Cikti.docx',
          filters: [{ name: 'Word Document', extensions: ['docx'] }]
        })
        if (canceled || !filePath) return { success: false, error: 'İptal edildi' }
        
        // html-docx-js dynamically required to avoid breaking main if not fully installed yet
        const htmlDocx = require('html-docx-js')
        const docx = htmlDocx.asBlob(htmlContent)
        
        // If it returns a Buffer or Blob
        const buffer = docx.arrayBuffer ? Buffer.from(await docx.arrayBuffer()) : Buffer.from(docx)
        fs.writeFileSync(filePath, buffer)
        
        return { success: true, filePath }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    })

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
        if (canceled || !filePaths || filePaths.length === 0) return { success: false, error: 'İptal edildi' }
        
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
        if (canceled || !filePaths || filePaths.length === 0) return { success: false, error: 'İptal edildi' }
        
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
          defaultPath: 'Yeni_Sablon.dtm.template',
          filters: [{ name: 'DTM Template', extensions: ['dtm.template'] }]
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
          filters: [{ name: 'DTM Template', extensions: ['dtm.template'] }],
          properties: ['openFile']
        })
        if (canceled || !filePaths || filePaths.length === 0) return { success: false, error: 'İptal edildi' }
        const content = fs.readFileSync(filePaths[0], 'utf-8')
        return { success: true, data: content, filePath: filePaths[0] }
      } catch (err: any) {
        return { success: false, error: err.message }
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
          institutionCode: settingsObj.institutionCode || '',
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
          institutionCode: '',
          themeLightVars: '',
          themeDarkVars: ''
        }
      }
    })

    ipcMain.handle('db:check-auth-setup', async () => {
      try {
        const db = workspaceManager.getDb()
        const codeRow = db
          .prepare("SELECT value FROM settings WHERE key = 'institutionCode'")
          .get() as { value: string } | undefined
        const userRow = db
          .prepare("SELECT value FROM settings WHERE key = 'adminUsername'")
          .get() as { value: string } | undefined
        const passRow = db
          .prepare("SELECT value FROM settings WHERE key = 'adminPassword'")
          .get() as { value: string } | undefined

        const hasCode = !!codeRow?.value
        const hasUser = !!userRow?.value
        const hasPass = !!passRow?.value

        return { hasCredentials: hasCode && hasUser && hasPass }
      } catch (error: any) {
        console.error('Check auth setup error:', error)
        return { hasCredentials: false, error: error.message }
      }
    })

    ipcMain.handle('db:setup-auth', async (_, code: string, user: string, pass: string) => {
      try {
        const db = workspaceManager.getDb()
        db.exec(`
          INSERT OR REPLACE INTO settings (key, value) VALUES ('institutionCode', '${code.replace(/'/g, "''")}');
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

    ipcMain.handle('db:login', async (_, code: string, user: string, pass: string) => {
      try {
        const db = workspaceManager.getDb()
        const codeRow = db
          .prepare("SELECT value FROM settings WHERE key = 'institutionCode'")
          .get() as { value: string } | undefined
        const userRow = db
          .prepare("SELECT value FROM settings WHERE key = 'adminUsername'")
          .get() as { value: string } | undefined
        const passRow = db
          .prepare("SELECT value FROM settings WHERE key = 'adminPassword'")
          .get() as { value: string } | undefined

        const expectedCode = codeRow?.value || ''
        const expectedUser = userRow?.value || ''
        const expectedPass = passRow?.value || ''

        if (code === expectedCode && user === expectedUser && pass === expectedPass) {
          return { success: true }
        }
        return { success: false, error: 'Kurum kodu, kullanıcı adı veya şifre hatalı!' }
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

        const transporter = nodemailer.createTransport({
          host: hostRow.value,
          port: parseInt(portRow.value) || 587,
          secure: secureRow?.value === 'true',
          auth: {
            user: userRow.value,
            pass: passRow.value
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

    ipcMain.handle('db:export-dte', async (_, contentType: 'firms' | 'items' | 'all') => {
      try {
        const db = workspaceManager.getDb()
        const activeMeta = workspaceManager.getMeta()
        
        let firms: any[] = []
        let items: any[] = []
        
        // Check table existences dynamically before querying
        const checkTableExists = (tableName: string): boolean => {
          const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableName)
          return !!row
        }
        
        const hasFirms = checkTableExists('TANIM_Firma')
        const hasItems = checkTableExists('TANIM_Kalem')
        
        if ((contentType === 'firms' || contentType === 'all') && hasFirms) {
          firms = db.prepare('SELECT * FROM TANIM_Firma').all()
        }
        
        if ((contentType === 'items' || contentType === 'all') && hasItems) {
          items = db.prepare('SELECT * FROM TANIM_Kalem').all()
        }
        
        // Fetch active institution name from settings
        let institutionName = activeMeta?.institution || 'Bilinmeyen Kurum'
        try {
          const row = db.prepare("SELECT value FROM settings WHERE key = 'institutionName'").get() as { value: string } | undefined
          if (row && row.value) {
            institutionName = row.value
          }
        } catch (e) {
          // ignore
        }
        
        // Get active schema version
        let activeSchemaVersion = CURRENT_SCHEMA_VERSION
        try {
          const row = db.prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'").get() as { value: string } | undefined
          if (row && row.value) {
            activeSchemaVersion = parseInt(row.value, 10) || CURRENT_SCHEMA_VERSION
          }
        } catch (e) {
          // ignore
        }
        
        const recordCount = firms.length + items.length
        
        const payload = {
          dte_version: '1.0',
          exported_from_app: app.getVersion(),
          exported_from_schema: activeSchemaVersion,
          exported_at: new Date().toISOString().split('T')[0],
          institution: institutionName,
          content_type: contentType,
          record_count: recordCount,
          data: {
            firms,
            items
          }
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
        const firmsToImport = payload.data?.firms || []
        const itemsToImport = payload.data?.items || []
        
        const db = workspaceManager.getDb()
        
        // Helpers to check tables & columns dynamically
        const checkTableExists = (tableName: string): boolean => {
          const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableName)
          return !!row
        }
        
        const getTableColumns = (tableName: string): string[] => {
          const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>
          return rows.map((r) => r.name)
        }
        
        let importedFirmsCount = 0
        let importedItemsCount = 0
        const warnings: string[] = []
        
        db.transaction(() => {
          // Import Firms
          if ((contentType === 'firms' || contentType === 'all') && firmsToImport.length > 0) {
            if (checkTableExists('TANIM_Firma')) {
              const existingCols = getTableColumns('TANIM_Firma')
              
              for (const firm of firmsToImport) {
                // Keep only keys that exist in the target database table schema
                const filteredFirm: Record<string, any> = {}
                for (const col of existingCols) {
                  if (firm[col] !== undefined) {
                    filteredFirm[col] = firm[col]
                  }
                }
                
                if (Object.keys(filteredFirm).length > 0) {
                  const colsStr = Object.keys(filteredFirm).map((c) => `"${c}"`).join(', ')
                  const placeholders = Object.keys(filteredFirm).map(() => '?').join(', ')
                  const values = Object.values(filteredFirm)
                  
                  db.prepare(`INSERT OR REPLACE INTO TANIM_Firma (${colsStr}) VALUES (${placeholders})`).run(...values)
                  importedFirmsCount++
                }
              }
            } else {
              warnings.push('Firma tablosu (TANIM_Firma) hedef veritabanında bulunamadı. Firma aktarımı atlandı.')
            }
          }
          
          // Import Items
          if ((contentType === 'items' || contentType === 'all') && itemsToImport.length > 0) {
            if (checkTableExists('TANIM_Kalem')) {
              const existingCols = getTableColumns('TANIM_Kalem')
              
              for (const item of itemsToImport) {
                const filteredItem: Record<string, any> = {}
                for (const col of existingCols) {
                  if (item[col] !== undefined) {
                    filteredItem[col] = item[col]
                  }
                }
                
                if (Object.keys(filteredItem).length > 0) {
                  const colsStr = Object.keys(filteredItem).map((c) => `"${c}"`).join(', ')
                  const placeholders = Object.keys(filteredItem).map(() => '?').join(', ')
                  const values = Object.values(filteredItem)
                  
                  db.prepare(`INSERT OR REPLACE INTO TANIM_Kalem (${colsStr}) VALUES (${placeholders})`).run(...values)
                  importedItemsCount++
                }
              }
            } else {
              warnings.push('Malzeme/Hizmet Kalemleri tablosu (TANIM_Kalem) hedef veritabanında bulunamadı. Kalem aktarımı atlandı.')
            }
          }
        })()
        
        workspaceManager.save()
        broadcastDbChange()
        
        return {
          success: true,
          importedFirmsCount,
          importedItemsCount,
          contentType,
          warnings
        }
      } catch (error: any) {
        console.error('Import DTE error:', error)
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
        return { success: true, lastInsertRowid: info.lastInsertRowid, changes: info.changes }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    })

    createWindow()

    // Helper to send status to all open windows
    const sendUpdaterStatus = (status: string, data: any = {}) => {
      const windows = BrowserWindow.getAllWindows()
      if (windows.length > 0) {
        windows[0].webContents.send('updater:status', { status, ...data })
      }
    }

    // --- Auto Updater Logic ---
    // Uygulama açıldıktan saniyeler sonra güncellemeleri kontrol et
    if (isDev) {
      const checkInterval = setInterval(async () => {
        try {
          // If getDb() throws an error, the catch block will suppress it and we'll try again in 5s
          const db = workspaceManager.getDb()
          
          // Database is ready, stop checking
          clearInterval(checkInterval)

          const testModeRow = db.prepare("SELECT value FROM settings WHERE key = 'devUpdateTestMode'").get() as { value: string } | undefined
          const devVersionRow = db.prepare("SELECT value FROM settings WHERE key = 'devUpdateVersion'").get() as { value: string } | undefined
          
          if (testModeRow?.value === 'true') {
            autoUpdater.forceDevUpdateConfig = true

            if (devVersionRow?.value) {
              Object.defineProperty(autoUpdater, 'currentVersion', { value: devVersionRow.value })
            } else {
              // Read dev-app-update.yml to get owner and repo
              const ymlPath = join(__dirname, '../../dev-app-update.yml')
              if (fs.existsSync(ymlPath)) {
                const config = yaml.load(fs.readFileSync(ymlPath, 'utf8')) as any
                if (config && config.owner && config.repo) {
                  const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/releases`)
                  const releases = await res.json()
                  if (Array.isArray(releases)) {
                    console.log('GitHub Releases List:')
                    releases.forEach((r, i) => console.log(`[${i}] ${r.tag_name}`))
                    if (releases.length > 0) {
                      const targetVersion = releases[releases.length - 1].tag_name.replace('v', '')
                      Object.defineProperty(autoUpdater, 'currentVersion', { value: targetVersion })
                    }
                  }
                }
              }
            }
            
            autoUpdater.checkForUpdatesAndNotify().catch(e => {
              console.error('Update check error:', e.message)
            })
          }
        } catch (e) {
          // Keep waiting for DB to be initialized by the user
        }
      }, 5000)
    } else {
      autoUpdater.checkForUpdatesAndNotify().catch(e => {
        console.error('Update check error:', e.message)
      })
    }

    autoUpdater.on('checking-for-update', () => {
      console.log('Güncellemeler kontrol ediliyor...')
      sendUpdaterStatus('checking')
    })

    autoUpdater.on('update-available', (info) => {
      console.log(`Yeni sürüm bulundu! Sürüm: ${info.version}`)
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

    autoUpdater.on('error', (err) => {
      console.error('Güncelleme sırasında hata oluştu:', err)
      sendUpdaterStatus('error', { error: err.message })
    })

    ipcMain.handle('updater:check', async () => {
      try {
        const result = await autoUpdater.checkForUpdatesAndNotify()
        return { success: true, result }
      } catch (error: any) {
        console.error('Manual update check error:', error)
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

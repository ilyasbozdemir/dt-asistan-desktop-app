import AdmZip from 'adm-zip'
import Database from 'better-sqlite3'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { initializeDatabase, schema } from './index'
import { runMigrations, CURRENT_SCHEMA_VERSION, getPendingMigrations } from './migrate'
import tasinirKodlariSeed from './seed/tasinir_kodlari.json'

export interface WorkspaceMeta {
  dtm_version: string
  app_version: string
  created_at: string
  institution: string
  schema_version: number
  platform: string
  file_version: number
  updated_at?: string
  integrity_hash?: string
  warnings?: string[]
}

function calculateIntegrityHash(meta: Partial<WorkspaceMeta>): string {
  const payload = {
    dtm_version: meta.dtm_version,
    app_version: meta.app_version,
    schema_version: meta.schema_version,
    created_at: meta.created_at,
    institution: meta.institution,
    platform: meta.platform
  }
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

function normalizeMeta(raw: any): WorkspaceMeta {
  return {
    dtm_version: raw.dtm_version || '1.0',
    app_version: raw.app_version || raw.version || '1.0.0',
    created_at: raw.created_at || (raw.createdAt ? raw.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
    institution: raw.institution || raw.institutionName || 'Bilinmeyen Kurum',
    schema_version: parseInt(raw.schema_version || raw.schemaVersion || '1', 10) || 1,
    platform: raw.platform || process.platform,
    file_version: raw.file_version || parseInt(raw.fileVersion || '1', 10) || 1,
    updated_at: raw.updated_at || raw.updatedAt || new Date().toISOString(),
    integrity_hash: raw.integrity_hash,
    warnings: []
  }
}

function ensureSchemaIntegrity(db: Database.Database): void {
  for (const table of schema.tables as any[]) {
    try {
      const tableInfo = db.prepare(`PRAGMA table_info(${table.name})`).all() as any[]
      if (tableInfo.length === 0) {
        console.log(`[Schema Self-Healing] Creating missing table ${table.name}`)
        const columnsSql = table.columns
          .map((col: any) => {
            let colDef = '"' + col.name + '" ' + col.type
            if (col.primaryKey) colDef += ' PRIMARY KEY'
            if (col.autoIncrement) colDef += ' AUTOINCREMENT'
            if (col.unique) colDef += ' UNIQUE'
            if (col.notNull) colDef += ' NOT NULL'
            if (col.default !== undefined) {
              colDef += ' DEFAULT ' + (typeof col.default === 'string' ? col.default : col.default)
            }
            return colDef
          })
          .join(', ')
        const constraintsSql = table.constraints ? ', ' + table.constraints.join(', ') : ''
        db.exec('CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columnsSql + constraintsSql + ');')
      } else {
        const existingColumns = new Set(tableInfo.map((c) => c.name))
        for (const col of table.columns as any[]) {
          if (!existingColumns.has(col.name)) {
            // SQLite ALTER TABLE ADD COLUMN does NOT support UNIQUE or NOT NULL constraints.
            // These are only valid at CREATE TABLE time. We skip them here to avoid errors.
            let sqlDef = '"' + col.name + '" ' + col.type
            if (col.default !== undefined) {
              sqlDef += ' DEFAULT ' + (typeof col.default === 'string' ? col.default : col.default)
            }
            console.log(`[Schema Self-Healing] Adding missing column ${table.name}.${col.name}`)
            db.exec(`ALTER TABLE ${table.name} ADD COLUMN ${sqlDef};`)
          }
        }
      }
      // Self-heal missing initial data
      if (table.initialData && table.initialData.length > 0) {
        table.initialData.forEach((row: any) => {
          const keys = Object.keys(row)
          const values = Object.values(row).map((v) =>
            typeof v === 'string' ? "'" + (v as string).replace(/'/g, "''") + "'" : v
          )
          db.exec(
            `INSERT OR IGNORE INTO ${table.name} (${keys.join(', ')}) VALUES (${values.join(', ')});`
          )
        })
      }
    } catch (err: any) {
      console.error(`Error self-healing table ${table.name}:`, err.message)
    }
  }
}

function seedTemplates(db: Database.Database): void {
  try {
    const templatesDirDev = path.join(app.getAppPath(), 'resources', 'templates')
    const templatesDirProd = path.join(process.resourcesPath, 'templates')
    const targetDir = fs.existsSync(templatesDirProd) ? templatesDirProd : templatesDirDev

    if (fs.existsSync(targetDir)) {
      const files = fs.readdirSync(targetDir)
      for (const file of files) {
        if (file.endsWith('.html')) {
          const content = fs.readFileSync(path.join(targetDir, file), 'utf-8')
          const exists = db.prepare('SELECT 1 FROM TANIM_Sablon WHERE dosya_adi = ?').get(file)
          if (!exists) {
            let ad = file.replace('.html', '').replace(/-/g, ' ').toUpperCase()
            if (file === 'ihtiyac-listesi.html') ad = 'İHTİYAÇ LİSTESİ' 
            
            db.prepare(`
              INSERT INTO TANIM_Sablon (ad, dosya_adi, dosya_turu, icerik, aciklama, aktif_mi)
              VALUES (?, ?, 'html', ?, ?, 1)
            `).run(ad, file, content, 'Sistem varsayılan şablonu')
            console.log(`[Seed] Seeded default template: ${file}`)
          }
        }
      }
    }
  } catch (err: any) {
    console.error('Error seeding templates:', err)
  }
}

export class DtmWorkspace {
  private tempDir: string
  private db: Database.Database | null = null
  private currentFilePath: string | null = null
  private meta: WorkspaceMeta | null = null

  constructor() {
    this.tempDir = path.join(app.getPath('userData'), 'dtm_temp', Date.now().toString())
  }

  public openWorkspace(filePath: string, allowMigration: boolean = false): WorkspaceMeta {
    const lockPath = filePath + '.lock'
    if (fs.existsSync(lockPath)) {
      try {
        const pidStr = fs.readFileSync(lockPath, 'utf-8')
        const pid = parseInt(pidStr, 10)
        if (!isNaN(pid) && pid !== process.pid) {
          let isRunning = false
          try {
            process.kill(pid, 0)
            isRunning = true
          } catch (e) {
            isRunning = false
          }
          if (!isRunning) {
            // Ölü kilit dosyası tespit edildi, sil ve devam et
            fs.unlinkSync(lockPath)
          } else {
            throw new Error('LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız.')
          }
        } else if (isNaN(pid)) {
          throw new Error('LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız.')
        }
      } catch (err: any) {
        if (err.message.startsWith('LOCKED|')) throw err
        throw new Error('LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız.')
      }
    }
    
    try {
      fs.writeFileSync(lockPath, process.pid.toString(), { encoding: 'utf-8' })
    } catch (err: any) {
      throw new Error(`Kilit dosyası oluşturulamadı: ${err.message}`)
    }

    this.currentFilePath = filePath
    this.ensureTempDir()

    const zip = new AdmZip(filePath)
    zip.extractAllTo(this.tempDir, true)

    const metaPath = path.join(this.tempDir, 'meta.json')
    let rawMeta: any = {}
    if (fs.existsSync(metaPath)) {
      const rawMetaContent = fs.readFileSync(metaPath, 'utf-8')
      rawMeta = JSON.parse(rawMetaContent)
    } else {
      throw new Error('Geçersiz dosya: meta.json bulunamadı.')
    }

    const meta = normalizeMeta(rawMeta)
    
    // Hash Validation
    if (meta.integrity_hash) {
      const expectedHash = calculateIntegrityHash(meta)
      if (meta.integrity_hash !== expectedHash) {
        meta.warnings?.push("UYARI: meta.json değerleri bozulmuş veya dışarıdan değiştirilmiş olabilir (Hash uyuşmazlığı).")
      }
    }

    const SUPPORTED_DTM_VERSION = 1.0
    if (parseFloat(meta.dtm_version) > SUPPORTED_DTM_VERSION) {
      throw new Error(`Bu dosya daha yeni bir dtm formatı gerektirir.`)
    }

    if (meta.schema_version > CURRENT_SCHEMA_VERSION) {
      meta.warnings?.push(`UYARI: Bu dosya (v${meta.schema_version}) daha yeni bir uygulama sürümü gerektiriyor olabilir. Uyumsuzluk yaşamamak için lütfen uygulamanızı güncelleyin.`)
    }

    const fromVersion = meta.schema_version || 1

    if (fromVersion < CURRENT_SCHEMA_VERSION) {
      if (!allowMigration) {
        const pendingUpdates = getPendingMigrations(fromVersion)
        if (pendingUpdates.length > 0) {
           const payload = JSON.stringify({ requiresMigration: true, pendingUpdates })
           throw new Error(`MIGRATION_REQUIRED|${payload}`)
        }
      }

      const backupPath = filePath + '.bak'
      try {
        fs.copyFileSync(filePath, backupPath)
      } catch (err: any) {
        throw new Error(`Dosya yedeklenirken hata oluştu: ${err.message}`)
      }

      try {
        const dbPath = path.join(this.tempDir, 'database.sqlite')
        this.db = new Database(dbPath)

        runMigrations(this.db, fromVersion)
        ensureSchemaIntegrity(this.db)
        
        meta.schema_version = CURRENT_SCHEMA_VERSION
        meta.app_version = app.getVersion()
        meta.platform = process.platform
        meta.file_version = (meta.file_version || 0) + 1
        meta.updated_at = new Date().toISOString()
        meta.integrity_hash = calculateIntegrityHash(meta)
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
        
        this.saveWorkspace()

        if (fs.existsSync(backupPath)) {
          fs.unlinkSync(backupPath)
        }
      } catch (migrationError: any) {
        console.error('Veritabanı güncellemesi başarısız oldu, değişiklikler geri alınıyor:', migrationError)
        
        if (this.db) {
          try { this.db.close() } catch (e) {}
          this.db = null
        }

        try {
          if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, filePath)
            fs.unlinkSync(backupPath)
          }
        } catch (rollbackErr: any) {
          console.error('Yedek dosya geri yüklenirken hata oluştu:', rollbackErr)
        }

        this.ensureTempDir()
        throw new Error(`Dosya güncellenirken kritik bir hata oluştu ve işlem iptal edildi. Veri kaybı olmaması için dosya eski haline döndürüldü.\nHata Detayı: ${migrationError.message}`)
      }
    } else {
      const dbPath = path.join(this.tempDir, 'database.sqlite')
      this.db = new Database(dbPath)
    }

    if (this.db) {
      ensureSchemaIntegrity(this.db)
      seedTemplates(this.db)
    }

    // Cross Validation
    if (this.db) {
      try {
        const row = this.db.prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'").get() as {value: string} | undefined
        const dbSchemaVer = row && row.value ? parseInt(row.value, 10) : 1
        if (dbSchemaVer !== meta.schema_version) {
          meta.warnings?.push(`UYARI: meta.json içindeki sürüm (${meta.schema_version}) ile veritabanı sürümü (${dbSchemaVer}) uyuşmuyor. Dosya elle değiştirilmiş olabilir.`)
        }
      } catch(e) {
         // Silently ignore
      }
    }

    this.meta = meta
    return meta
  }

  public createWorkspace(filePath: string, institutionName: string): WorkspaceMeta {
    const lockPath = filePath + '.lock'
    if (fs.existsSync(lockPath)) {
      throw new Error('LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda.')
    }
    
    try {
      fs.writeFileSync(lockPath, process.pid.toString(), { encoding: 'utf-8' })
    } catch (err: any) {
      throw new Error(`Kilit dosyası oluşturulamadı: ${err.message}`)
    }

    this.currentFilePath = filePath
    this.ensureTempDir()

    const dbPath = path.join(this.tempDir, 'database.sqlite')
    this.db = new Database(dbPath)

    initializeDatabase(this.db, institutionName)

    try {
      const insertStmt = this.db.prepare(`
        INSERT OR IGNORE INTO TANIM_TasinirKod (tam_kod, hesap_kodu, duzey_1, duzey_2, duzey_3, duzey_4, duzey_5, aciklama)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      const seedTx = this.db.transaction((rows: any[]) => {
        for (const row of rows) {
          insertStmt.run(row.tam_kod, row.hesap_kodu, row.duzey_1, row.duzey_2, row.duzey_3, row.duzey_4, row.duzey_5, row.aciklama)
        }
      })
      seedTx(tasinirKodlariSeed)
    } catch (err) {
      console.error('Tasinir Kodlari tohumlama sirasinda hata:', err)
    }

    const meta: WorkspaceMeta = {
      dtm_version: '1.0',
      app_version: app.getVersion(),
      created_at: new Date().toISOString().split('T')[0],
      institution: institutionName,
      schema_version: CURRENT_SCHEMA_VERSION,
      platform: process.platform,
      file_version: 1,
      updated_at: new Date().toISOString(),
      warnings: []
    }
    meta.integrity_hash = calculateIntegrityHash(meta)
    
    const metaPath = path.join(this.tempDir, 'meta.json')
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))

    fs.mkdirSync(path.join(this.tempDir, 'attachments'))

    this.saveWorkspace()

    this.meta = meta
    return meta
  }

  public saveWorkspace(): void {
    if (!this.currentFilePath || !this.db) {
      throw new Error('Hiçbir veri dosyası açık değil.')
    }

    this.db.pragma('wal_checkpoint(TRUNCATE)')

    const metaPath = path.join(this.tempDir, 'meta.json')
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as WorkspaceMeta
      meta.updated_at = new Date().toISOString()
      meta.app_version = app.getVersion()
      meta.platform = process.platform

      try {
        const row = this.db.prepare("SELECT value FROM settings WHERE key = 'institutionName'").get() as { value: string } | undefined
        if (row && row.value) {
          meta.institution = row.value
        }
      } catch (e) {
        console.error('Failed to sync institution name from DB to meta.json:', e)
      }

      try {
        const row = this.db.prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'").get() as { value: string } | undefined
        if (row && row.value) {
          meta.schema_version = parseInt(row.value, 10) || CURRENT_SCHEMA_VERSION
        }
      } catch (e) {
        console.error('Failed to sync dbSchemaVersion from DB to meta.json:', e)
      }

      meta.integrity_hash = calculateIntegrityHash(meta)
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
      this.meta = meta
    }

    const zip = new AdmZip()
    zip.addLocalFolder(this.tempDir)
    zip.writeZip(this.currentFilePath)
  }

  public closeWorkspace(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }

    if (this.currentFilePath) {
      const lockPath = this.currentFilePath + '.lock'
      if (fs.existsSync(lockPath)) {
        try { fs.unlinkSync(lockPath) } catch (e) {}
      }
    }

    this.currentFilePath = null
    this.meta = null

    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true })
    }
  }

  public getDb(): Database.Database {
    if (!this.db) throw new Error('Veritabanı bağlı değil.')
    return this.db
  }

  public getMeta(): WorkspaceMeta | null {
    return this.meta
  }

  private ensureTempDir() {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true })
    }
    fs.mkdirSync(this.tempDir, { recursive: true })
  }
}

let activeWorkspace: DtmWorkspace | null = null

export const workspaceManager = {
  create: (filePath: string, institutionName: string) => {
    if (activeWorkspace) activeWorkspace.closeWorkspace()
    activeWorkspace = new DtmWorkspace()
    return activeWorkspace.createWorkspace(filePath, institutionName)
  },
  open: (filePath: string, allowMigration: boolean = false) => {
    if (activeWorkspace) activeWorkspace.closeWorkspace()
    activeWorkspace = new DtmWorkspace()
    return activeWorkspace.openWorkspace(filePath, allowMigration)
  },
  save: () => {
    if (activeWorkspace) activeWorkspace.saveWorkspace()
  },
  close: () => {
    if (activeWorkspace) {
      activeWorkspace.closeWorkspace()
      activeWorkspace = null
    }
  },
  getDb: () => {
    if (!activeWorkspace) throw new Error('Açık bir veri dosyası yok.')
    return activeWorkspace.getDb()
  },
  getMeta: () => {
    if (!activeWorkspace) return null
    return activeWorkspace.getMeta()
  },
  getDatabaseSchema: () => {
    if (!activeWorkspace) return null
    try {
      const db = activeWorkspace.getDb()
      const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as {name: string, sql: string}[]
      return tables.map(t => t.sql).join('\n\n')
    } catch (e) {
      console.error('Failed to get schema for AI:', e)
      return null
    }
  }
}

// Ensure lock is cleared if the process exits
process.on('exit', () => {
  if (activeWorkspace) {
    try { activeWorkspace.closeWorkspace() } catch (e) {}
  }
})

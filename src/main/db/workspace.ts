import AdmZip from 'adm-zip'
import Database from 'better-sqlite3'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { initializeDatabase } from '../database/index'
import { runMigrations, CURRENT_SCHEMA_VERSION } from './migrate'

export interface WorkspaceMeta {
  dtm_version: string      // format versiyonu (örn: "1.0")
  app_version: string      // oluşturan/güncelleyen uygulama versiyonu (örn: "1.0.0-alpha.2")
  created_at: string       // oluşturulma tarihi (YYYY-MM-DD)
  institution: string      // kurum adı
  schema_version: number   // veritabanı şema versiyonu (örn: 3)
  updated_at?: string      // son düzenlenme zamanı (ISO string)
  integrity_hash?: string  // meta.json'un SHA-256 imzası
  warnings?: string[]      // Frontend'e iletilecek uyarı mesajları
}

const VERSION_COMPATIBILITY: Record<string, { minSchema: number; maxSchema: number }> = {
  "1.0.0-alpha.1": { minSchema: 1, maxSchema: 1 },
  "1.0.0-alpha.2": { minSchema: 1, maxSchema: 2 },
  "1.0.0-alpha.3": { minSchema: 1, maxSchema: 6 },
  "1.0.0-alpha.4": { minSchema: 1, maxSchema: 6 },
}

function calculateIntegrityHash(meta: Partial<WorkspaceMeta>): string {
  const payload = {
    dtm_version: meta.dtm_version,
    app_version: meta.app_version,
    schema_version: meta.schema_version,
    created_at: meta.created_at,
    institution: meta.institution
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
    updated_at: raw.updated_at || raw.updatedAt || new Date().toISOString(),
    integrity_hash: raw.integrity_hash,
    warnings: []
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

  public openWorkspace(filePath: string): WorkspaceMeta {
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

    // Version Matrix Enforcement
    const currentAppVersion = app.getVersion()
    const appMatrix = VERSION_COMPATIBILITY[currentAppVersion] || { minSchema: 1, maxSchema: CURRENT_SCHEMA_VERSION }
    
    if (meta.schema_version > CURRENT_SCHEMA_VERSION || meta.schema_version > appMatrix.maxSchema) {
      throw new Error(`Bu dosya (v${meta.schema_version}) daha yeni bir uygulama sürümü gerektirir. Lütfen uygulamayı güncelleyin.`)
    }

    const fromVersion = meta.schema_version || 1

    if (fromVersion < CURRENT_SCHEMA_VERSION) {
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
        
        meta.schema_version = CURRENT_SCHEMA_VERSION
        meta.app_version = app.getVersion()
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

    // Cross Validation
    if (this.db) {
      try {
        const row = this.db.prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'").get() as {value: string} | undefined
        const dbSchemaVer = row && row.value ? parseInt(row.value, 10) : 1
        if (dbSchemaVer !== meta.schema_version) {
          meta.warnings?.push(`UYARI: meta.json içindeki sürüm (${meta.schema_version}) ile veritabanı sürümü (${dbSchemaVer}) uyuşmuyor. Dosya elle değiştirilmiş olabilir.`)
        }
      } catch(e) {
         // Silently ignore if settings table is missing in very old corrupted files
      }
    }

    this.meta = meta
    return meta
  }

  public createWorkspace(filePath: string, institutionName: string): WorkspaceMeta {
    this.currentFilePath = filePath
    this.ensureTempDir()

    const dbPath = path.join(this.tempDir, 'database.sqlite')
    this.db = new Database(dbPath)

    initializeDatabase(this.db, institutionName)

    const meta: WorkspaceMeta = {
      dtm_version: '1.0',
      app_version: app.getVersion(),
      created_at: new Date().toISOString().split('T')[0],
      institution: institutionName,
      schema_version: CURRENT_SCHEMA_VERSION,
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
  open: (filePath: string) => {
    if (activeWorkspace) activeWorkspace.closeWorkspace()
    activeWorkspace = new DtmWorkspace()
    return activeWorkspace.openWorkspace(filePath)
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
  }
}

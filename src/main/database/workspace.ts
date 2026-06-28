import AdmZip from 'adm-zip'
import Database from 'better-sqlite3'
import { app, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { initializeDatabase, schema } from './index'
import { runMigrations, CURRENT_SCHEMA_VERSION, getPendingMigrations } from './migrate'
import tasinirKodlariSeed from './seed/tasinir_kodlari.json'

export interface WorkspaceMeta {
  dtal_version: string
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
    dtal_version: meta.dtal_version,
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
    dtal_version: raw.dtal_version || raw.dtm_version || '1.0',
    app_version: raw.app_version || raw.version || '1.0.0',
    created_at:
      raw.created_at ||
      (raw.createdAt ? raw.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
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
        db.exec(
          'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columnsSql + constraintsSql + ');'
        )
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

const TEMPLATE_NAMES: Record<string, string> = {
  'harcama-talimati': 'HARCAMA TALİMATI',
  'ihtiyac-listesi': 'İHTİYAÇ LİSTESİ',
  'ihtiyac-talep-formu': 'İHTİYAÇ TALEP FORMU',
  'komisyon-gorevlendirme-onayi': 'KOMİSYON GÖREVLENDİRME ONAYI',
  'komisyon-gorevlendirme-onayi-eki': 'KOMİSYON GÖREVLENDİRME ONAYI EKİ',
  'luzum-muzekkeresi': 'LÜZUM MÜZEKKERESİ',
  'luzum-muzekkeresi-onay-eki': 'LÜZUM MÜZEKKERESİ ONAY EKİ',
  'luzum-muzekkeresi-teslim-tesellum': 'LÜZUM MÜZEKKERESİ TESLİM TESELLÜM',
  'son-alim-fiyat-cetveli': 'SON ALIM FİYAT CETVELİ',
  'arastirma-mektubu': 'ARAŞTIRMA MEKTUBU',
  'birim-fiyat-teklif-cetveli': 'BİRİM FİYAT TEKLİF CETVELİ',
  'birim-fiyat-teklif-mektubu': 'BİRİM FİYAT TEKLİF MEKTUBU',
  'dagitim-cizelgesi': 'DAĞITIM ÇİZELGESİ',
  'dagitim-cizelgesi-karma': 'DAĞITIM ÇİZELGESİ (KARMA)',
  'fiyat-arastirma-mektubu': 'FİYAT ARAŞTIRMA MEKTUBU',
  'fiyat-arastirmasi': 'FİYAT ARAŞTIRMASI',
  'gorevlendirme-yazisi': 'GÖREVLENDİRME YAZISI',
  'piyasa-fiyat-arastirma-gorevlendirmesi': 'PİYASA FİYAT ARAŞTIRMA GÖREVLENDİRMESİ',
  'piyasa-fiyat-arastirma-tutanagi': 'PİYASA FİYAT ARAŞTIRMA TUTANAĞI',
  'teklif-mektubu-dagitim-cizelgesi': 'TEKLİF MEKTUBU DAĞITIM ÇİZELGESİ',
  'yaklasik-maliyet-cetveli': 'YAKLAŞIK MALİYET CETVELİ',
  'butce-sorgusu': 'BÜTÇE SORGUSU',
  'dogrudan-temin-onay-belgesi': 'DOĞRUDAN TEMİN ONAY BELGESİ',
  'dogrudan-temin-sonuc-onay-belgesi': 'DOĞRUDAN TEMİN SONUÇ ONAY BELGESİ',
  'dogrudan-temin-sozlesmesi': 'DOĞRUDAN TEMİN SÖZLEŞMESİ',
  'dogrudan-temin-sozlesmesi-alternatif': 'DOĞRUDAN TEMİN SÖZLEŞMESİ (ALTERNATİF)',
  'dogrudan-temin-sozlesmesi-uzun': 'DOĞRUDAN TEMİN SÖZLEŞMESİ (UZUN)',
  'idare-onay-belgesi': 'İDARE ONAY BELGESİ',
  'ihale-komisyon-karari': 'İHALE KOMİSYON KARARI',
  'kabul-edilen-teklif': 'KABUL EDİLEN TEKLİF',
  'sozlesmeye-davet': 'SÖZLEŞMEYE DAVET',
  'teklif-mektubu': 'TEKLİF MEKTUBU',
  'hakedis-raporu': 'HAKEDİŞ RAPORU',
  'harcama-pusulasi': 'HARCAMA PUSULASI',
  'hizmet-isleri-kabul-teklif-belgesi': 'HİZMET İŞLERİ KABUL TEKLİF BELGESİ',
  'hizmet-isleri-kabul-tutanagi': 'HİZMET İŞLERİ KABUL TUTANAĞI',
  'kabul-edilen-teklif-odeme': 'KABUL EDİLEN TEKLİF (ÖDEME AŞAMASI)',
  'muayene-kabul-komisyonu': 'MUAYENE VE KABUL KOMİSYONU',
  'muayene-kabul-tutanagi': 'MUAYENE VE KABUL TUTANAĞI',
  'odeme-emri-belgesi': 'ÖDEME EMRİ BELGESİ',
  'odeme-yazisi': 'ÖDEME YAZISI',
  'tasinir-islem-fisi': 'TAŞINIR İŞLEM FİŞİ',
  'ihale-kapagi': 'İHALE KAPAĞI',
  'kapak-ici-indeks-sablonu': 'KAPAK İÇİ İNDEKS ŞABLONU',
  'klasor-sirtligi-3cm': 'KLASÖR SIRTLIĞI (3 CM)',
  'klasor-sirtligi-5cm': 'KLASÖR SIRTLIĞI (5 CM)',
  'klasor-sirtligi-7-5cm': 'KLASÖR SIRTLIĞI (7.5 CM)'
}

const TEMPLATE_CATEGORIES: Record<string, string> = {
  '1-ihtiyac-tespiti-ve-baslangic': '1. İhtiyaç Tespiti ve Başlangıç',
  '2-fiyat-arastirma-ve-yaklasik-maliyet': '2. Fiyat Araştırma ve Yaklaşık Maliyet',
  '3-ihale-ve-onay-sureci': '3. İhale ve Onay Süreci',
  '4-sozlesme-ve-teslimat': '4. Sözleşme ve Teslimat',
  '5-klasor-ve-kapaklar': '5. Klasör Sırtlıkları & Kapaklar'
}

function seedTemplates(db: Database.Database): void {
  try {
    const templatesDirDev = path.join(app.getAppPath(), 'resources', 'templates')
    const templatesDirProd = path.join(process.resourcesPath, 'templates')
    const targetDir = fs.existsSync(templatesDirProd) ? templatesDirProd : templatesDirDev

    if (!fs.existsSync(targetDir)) return

    // Her şablonun navigasyon route'u — dosya_adi (uzantsız) → app route
    const ROUTE_BY_DOSYA_ADI: Record<string, string> = {
      // Komisyon
      'fiyat-arastirma-komisyonu-atama': '/dosya/komisyon/fiyat-arastirma',
      'komisyon-gorevlendirme-onayi': '/dosya/komisyon/fiyat-arastirma',
      'muayene-kabul-komisyonu-atama': '/dosya/komisyon/muayene-kabul',
      'muayene-kabul-komisyonu': '/dosya/komisyon/muayene-kabul',
      'fiyat-arastirma-ve-muayene-komisyonu': '/dosya/komisyon/fiyat-muayene',
      'komisyon-atama-onay-eki': '/dosya/komisyon/onay-eki',
      'komisyon-gorevlendirme-onayi-eki': '/dosya/komisyon/onay-eki',
      // Malzemeler
      'ihtiyac-listesi': '/dosya/malzemeler/liste',
      'ihtiyac-talep-formu': '/dosya/luzum/talep-formu',
      'malzeme-hizmet-kalem-listesi': '/dosya/malzemeler/liste',
      // Lüzum
      'luzum-muzekkeresi-belgesi': '/dosya/luzum/belge',
      'luzum-muzekkeresi': '/dosya/luzum/belge',
      'luzum-onay-eki': '/dosya/luzum/onay-eki',
      'luzum-muzekkeresi-onay-eki': '/dosya/luzum/onay-eki',
      'teslim-tesellum-belgesi': '/dosya/luzum/teslim-tesellum',
      'luzum-muzekkeresi-teslim-tesellum': '/dosya/luzum/teslim-tesellum',
      // Firmalar / Maliyet
      'istekli-tedarikci-firmalar': '/dosya/firmalar-maliyet/istekliler',
      'yaklasik-maliyet-hesap-cetveli': '/dosya/firmalar-maliyet/yaklasik',
      'yaklasik-maliyet-cetveli': '/dosya/firmalar-maliyet/yaklasik',
      'piyasa-fiyat-arastirma-tutanagi': '/dosya/firmalar-maliyet/tutanak',
      // Onay
      'dogrudan-temin-onay-belgesi': '/dosya/onay/dt-onay',
      'ihale-onay-belgesi': '/dosya/onay/ihale-onay',
      'idare-onay-belgesi': '/dosya/onay/ihale-onay',
      'butce-sorgusu': '/dosya/onay/butce-sorgu',
      // Harcama
      'harcama-talimati': '/dosya/harcama/talimat',
      'harcama-pusulasi': '/dosya/harcama/pusula',
      // Klasör ve Kapaklar
      'ihale-kapagi': '/dosya/cikti-merkezi'
    }

    const findHtmlFiles = (dir: string): string[] => {
      let results: string[] = []
      const list = fs.readdirSync(dir)
      for (const file of list) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        if (stat && stat.isDirectory()) {
          results = results.concat(findHtmlFiles(filePath))
        } else if (file.endsWith('.html')) {
          results.push(filePath)
        }
      }
      return results
    }

    const htmlFiles = findHtmlFiles(targetDir)
    for (const filePath of htmlFiles) {
      const file = path.basename(filePath)
      const content = fs.readFileSync(filePath, 'utf-8')

      let dosya_adi = file
      let ad = file.replace('.html', '').replace(/-/g, ' ').toUpperCase()

      let kategori = 'Genel Şablonlar'
      const parentDir = path.basename(path.dirname(filePath))

      if (file === 'index.html' && parentDir && parentDir !== 'templates') {
        dosya_adi = `${parentDir}.html`
        ad = TEMPLATE_NAMES[parentDir] || parentDir.replace(/-/g, ' ').toUpperCase()
      }

      if (parentDir !== 'templates') {
        const relPath = path.relative(targetDir, filePath)
        const pathParts = relPath.split(path.sep)
        if (pathParts.length > 1) {
          const topLevelFolder = pathParts[0]
          kategori =
            TEMPLATE_CATEGORIES[topLevelFolder] ||
            topLevelFolder.charAt(0).toUpperCase() + topLevelFolder.slice(1).replace(/-/g, ' ')
        }
      }

      const jsonFilePath = filePath + '.json'
      let testJsonContent: string | null = null
      if (fs.existsSync(jsonFilePath)) {
        testJsonContent = fs.readFileSync(jsonFilePath, 'utf-8')
      }

      const relativeHtmlPath = path.relative(targetDir, filePath)
      const relativeJsonPath = fs.existsSync(jsonFilePath)
        ? path.relative(targetDir, jsonFilePath)
        : null

      const dosya_adi_no_ext = dosya_adi.replace(/\.html$/, '')
      const route_path = ROUTE_BY_DOSYA_ADI[dosya_adi_no_ext] || null

      const existing = db
        .prepare('SELECT * FROM TANIM_Sablon WHERE dosya_adi = ?')
        .get(dosya_adi) as any
      if (!existing) {
        db.prepare(
          `
          INSERT INTO TANIM_Sablon (ad, dosya_adi, dosya_turu, icerik, aciklama, aktif_mi, kategori, test_verisi, html_yolu, json_yolu, route_path)
          VALUES (?, ?, 'html', ?, ?, 1, ?, ?, ?, ?, ?)
        `
        ).run(
          ad,
          dosya_adi,
          content,
          'Sistem varsayılan şablonu',
          kategori,
          testJsonContent,
          relativeHtmlPath,
          relativeJsonPath,
          route_path
        )
        console.log(`[Seed] Seeded default template: ${dosya_adi} in category: ${kategori}`)
      } else {
        if (existing.versiyon === 1) {
          db.prepare(
            `
            UPDATE TANIM_Sablon 
            SET ad = ?, kategori = ?, icerik = ?, test_verisi = ?, html_yolu = ?, json_yolu = ?, route_path = COALESCE(route_path, ?)
            WHERE id = ?
          `
          ).run(
            ad,
            kategori,
            content,
            testJsonContent,
            relativeHtmlPath,
            relativeJsonPath,
            route_path,
            existing.id
          )
          console.log(`[Seed] Updated default template: ${dosya_adi}`)
        } else {
          db.prepare(
            `
            UPDATE TANIM_Sablon 
            SET html_yolu = COALESCE(html_yolu, ?), json_yolu = COALESCE(json_yolu, ?), route_path = COALESCE(route_path, ?)
            WHERE id = ?
          `
          ).run(relativeHtmlPath, relativeJsonPath, route_path, existing.id)
        }
      }

      // Ayrıca bu şablonun bir sürece (route_path) bağlı olduğu belirtilmişse, bunu varsayılan ayar olarak settings tablosuna ekle.
      if (route_path) {
        let sablonId = existing ? existing.id : null
        if (!sablonId) {
          const newRow = db
            .prepare('SELECT id FROM TANIM_Sablon WHERE dosya_adi = ?')
            .get(dosya_adi) as any
          if (newRow) sablonId = newRow.id
        }
        if (sablonId) {
          const mappingKey = `MAPPING_${route_path}_SABLON_ID`
          // Sadece daha önce ayarlanmamışsa ekle (kullanıcı değiştirdiyse ezme)
          db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`).run(
            mappingKey,
            sablonId.toString()
          )
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
            throw new Error(
              'LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız.'
            )
          }
        } else if (isNaN(pid)) {
          throw new Error(
            'LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız.'
          )
        }
      } catch (err: any) {
        if (err.message.startsWith('LOCKED|')) throw err
        throw new Error(
          'LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız.'
        )
      }
    }

    try {
      fs.writeFileSync(lockPath, process.pid.toString(), { encoding: 'utf-8' })
    } catch (err: any) {
      throw new Error(`Kilit dosyası oluşturulamadı: ${err.message}`)
    }

    this.currentFilePath = filePath
    this.ensureTempDir()

    const zipBuffer = fs.readFileSync(filePath)

    // Sağ Tık -> Yeni ile oluşturulmuş 0 baytlık bir dosya ise,
    // yeni bir çalışma alanı olarak başlat (boş zip hatası almamak için)
    if (zipBuffer.length === 0) {
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath)
      }
      return this.createWorkspace(filePath, 'Yeni Kurum')
    }

    const zip = new AdmZip(zipBuffer)
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
        meta.warnings?.push(
          'UYARI: meta.json değerleri bozulmuş veya dışarıdan değiştirilmiş olabilir (Hash uyuşmazlığı).'
        )
      }
    }

    const SUPPORTED_DTAL_VERSION = 1.0
    if (parseFloat(meta.dtal_version) > SUPPORTED_DTAL_VERSION) {
      throw new Error(`Bu dosya daha yeni bir dtal formatı gerektirir.`)
    }

    if (meta.schema_version > CURRENT_SCHEMA_VERSION) {
      meta.warnings?.push(
        `UYARI: Bu dosya (v${meta.schema_version}) daha yeni bir uygulama sürümü gerektiriyor olabilir. Uyumsuzluk yaşamamak için lütfen uygulamanızı güncelleyin.`
      )
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
        console.error(
          'Veritabanı güncellemesi başarısız oldu, değişiklikler geri alınıyor:',
          migrationError
        )

        if (this.db) {
          try {
            this.db.close()
          } catch (e) {}
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
        throw new Error(
          `Dosya güncellenirken kritik bir hata oluştu ve işlem iptal edildi. Veri kaybı olmaması için dosya eski haline döndürüldü.\nHata Detayı: ${migrationError.message}`
        )
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
        const row = this.db
          .prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'")
          .get() as { value: string } | undefined
        const dbSchemaVer = row && row.value ? parseInt(row.value, 10) : 1
        if (dbSchemaVer !== meta.schema_version) {
          meta.warnings?.push(
            `UYARI: meta.json içindeki sürüm (${meta.schema_version}) ile veritabanı sürümü (${dbSchemaVer}) uyuşmuyor. Dosya elle değiştirilmiş olabilir.`
          )
        }
      } catch (e) {
        // Silently ignore
      }
    }

    // Otomatik uzantıyı .dtal yapma mantığı (Kullanıcı onaylı)
    if (!filePath.toLowerCase().endsWith('.dtal')) {
      const response = dialog.showMessageBoxSync({
        type: 'question',
        buttons: ['Evet, Güncelle', 'Hayır, Eski Uzantıda Bırak'],
        defaultId: 0,
        title: 'Eski Uzantı Tespit Edildi',
        message:
          'Açtığınız dosyanın uzantısı eski formattadır (.dta veya .dtm). Uygulama verimliliği ve uyumluluğu için uzantının yeni .dtal formatına dönüştürülmesi önerilir.\n\nDosya uzantısı güncellensin mi?'
      })

      if (response === 0) {
        const ext = path.extname(filePath)
        const newFilePath = filePath.substring(0, filePath.length - ext.length) + '.dtal'

        const newLockPath = newFilePath + '.lock'
        try {
          fs.writeFileSync(newLockPath, process.pid.toString(), { encoding: 'utf-8' })

          // Asıl dosyayı da yeniden adlandır ki kullanıcı eski dosyayı tekrar açmasın
          if (fs.existsSync(filePath)) {
            fs.renameSync(filePath, newFilePath)
          }

          if (fs.existsSync(lockPath)) {
            fs.unlinkSync(lockPath)
          }
          this.currentFilePath = newFilePath
        } catch (err: any) {
          console.error('Uzantı değiştirilirken hata oluştu:', err)
          // Eğer adlandırma başarısız olursa (ör. izin hatası), en azından orijinal yolda kal
          this.currentFilePath = filePath
        }
      }
    }

    this.meta = meta
    return meta
  }

  public createWorkspace(filePath: string, institutionName: string): WorkspaceMeta {
    if (!filePath.toLowerCase().endsWith('.dtal')) {
      const ext = path.extname(filePath)
      filePath = filePath.substring(0, filePath.length - ext.length) + '.dtal'
    }
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
          insertStmt.run(
            row.tam_kod,
            row.hesap_kodu,
            row.duzey_1,
            row.duzey_2,
            row.duzey_3,
            row.duzey_4,
            row.duzey_5,
            row.aciklama
          )
        }
      })
      seedTx(tasinirKodlariSeed)
    } catch (err) {
      console.error('Tasinir Kodlari tohumlama sirasinda hata:', err)
    }

    const meta: WorkspaceMeta = {
      dtal_version: '1.0',
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

    seedTemplates(this.db)

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
        const row = this.db
          .prepare("SELECT value FROM settings WHERE key = 'institutionName'")
          .get() as { value: string } | undefined
        if (row && row.value) {
          meta.institution = row.value
        }
      } catch (e) {
        console.error('Failed to sync institution name from DB to meta.json:', e)
      }

      try {
        const row = this.db
          .prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'")
          .get() as { value: string } | undefined
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
        try {
          fs.unlinkSync(lockPath)
        } catch (e) {}
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

  public getCurrentFilePath(): string | null {
    return this.currentFilePath
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
  getCurrentFilePath: () => {
    if (!activeWorkspace) return null
    return activeWorkspace.getCurrentFilePath()
  },
  getDatabaseSchema: () => {
    if (!activeWorkspace) return null
    try {
      const db = activeWorkspace.getDb()
      const tables = db
        .prepare(
          "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
        .all() as { name: string; sql: string }[]
      return tables.map((t) => t.sql).join('\n\n')
    } catch (e) {
      console.error('Failed to get schema for AI:', e)
      return null
    }
  },
  uploadAttachment: (sourcePath: string) => {
    if (!activeWorkspace) throw new Error('Açık bir çalışma dosyası yok.')
    const tempDir = (activeWorkspace as any).tempDir
    if (!tempDir) throw new Error('Geçici çalışma dizini bulunamadı.')

    const attachmentsDir = path.join(tempDir, 'attachments')
    if (!fs.existsSync(attachmentsDir)) {
      fs.mkdirSync(attachmentsDir, { recursive: true })
    }

    const fileExt = path.extname(sourcePath)
    const baseName = path.basename(sourcePath, fileExt)
    const safeName = `${baseName}_${Date.now()}${fileExt}`.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const destPath = path.join(attachmentsDir, safeName)

    fs.copyFileSync(sourcePath, destPath)
    activeWorkspace.saveWorkspace()
    return { fileName: safeName, relativePath: `attachments/${safeName}` }
  },
  openAttachment: async (relativePath: string) => {
    if (!activeWorkspace) throw new Error('Açık bir çalışma dosyası yok.')
    const tempDir = (activeWorkspace as any).tempDir
    if (!tempDir) throw new Error('Geçici çalışma dizini bulunamadı.')

    const fullPath = path.join(tempDir, relativePath)
    if (fs.existsSync(fullPath)) {
      const { shell } = require('electron')
      await shell.openPath(fullPath)
      return true
    }
    return false
  }
}

// Ensure lock is cleared if the process exits
process.on('exit', () => {
  if (activeWorkspace) {
    try {
      activeWorkspace.closeWorkspace()
    } catch (e) {}
  }
})

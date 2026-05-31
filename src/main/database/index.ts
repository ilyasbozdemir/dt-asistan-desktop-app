import Database from 'better-sqlite3'
import { app } from 'electron'
import { TANIM_Mevzuat } from './tables/TANIM_Mevzuat'
import { TANIM_Personel } from './tables/TANIM_Personel'
import { TANIM_Birim } from './tables/TANIM_Birim'
import { TANIM_Asama } from './tables/TANIM_Asama'
import { DATA_TeminDosyasi } from './tables/DATA_TeminDosyasi'
import { TANIM_Firma } from './tables/TANIM_Firma'
import { TANIM_Ambar } from './tables/TANIM_Ambar'
import { TANIM_AlimTuru } from './tables/TANIM_AlimTuru'
import { TANIM_Sablon } from './tables/TANIM_Sablon'
import { TANIM_Placeholder } from './tables/TANIM_Placeholder'
import { TANIM_AlimTuru_Sablon } from './tables/TANIM_AlimTuru_Sablon'
import { SABLON_Placeholder } from './tables/SABLON_Placeholder'
import { TANIM_Kalem } from './tables/TANIM_Kalem'
import { TANIM_TasinirKod } from './tables/TANIM_TasinirKod'
import { TANIM_OkasKod } from './tables/TANIM_OkasKod'
import { TANIM_KodSozlugu } from './tables/TANIM_KodSozlugu'
import { CURRENT_SCHEMA_VERSION } from './migrate'

export const TablePrefixLogic = {
  DATA: 'OPERASYONEL SÜREÇLER VE DOSYALAR (Temin Dosyaları, Teklifler, Siparişler)',
  TANIM: 'SİSTEM AYARLARI VE KONFİGÜRASYON (Mevzuat, Limitler, Firmalar, Personel)',
  LOG: 'SİSTEM LOGLARI VE KULLANICI HAREKETLERİ'
}

export const schema = {
  database: 'DOGRUDAN_TEMIN_DB',
  app_title: 'DT Asistan',
  developer: {
    name: 'İlyas BOZDEMİR',
    web: 'https://ilyasbozdemir.dev',
    github: 'https://github.com/ilyasbozdemir'
  },
  version: '1.0.0-alpha.7',
  /**
   * Tablo tanımları — sıra önemlidir (FK bağımlılıkları).
   * Tüm tanım (TANIM_*) tabloları DATA_* tablolarından önce oluşturulmalı.
   */
  tables: [
    // --- Sistem Tanımları ---
    TANIM_Mevzuat, // Yıllara göre limitler ve vergi oranları
    TANIM_Birim, // Kurum birimleri (Müdürlükler)
    TANIM_Personel, // Personel havuzu
    TANIM_Asama, // İşlem aşamaları (Status)
    TANIM_Firma, // Kayıtlı firmalar havuzu
    TANIM_Ambar, // Ambar depoları
    TANIM_TasinirKod, // Taşınır Kod Ağacı
    TANIM_OkasKod,    // OKAS Kod Listesi
    TANIM_Kalem, // Malzeme ve Hizmet Kalemleri
    TANIM_AlimTuru, // Alım Türleri
    TANIM_Sablon, // Şablonlar
    TANIM_Placeholder, // Dinamik alanlar
    TANIM_AlimTuru_Sablon, // Alım türü ve şablon eşleşmeleri
    SABLON_Placeholder, // Şablon içi alan eşleşmeleri
    TANIM_KodSozlugu, // Kurumsal ve Mali Kod Sözlüğü
    // --- Operasyonel Veriler ---
    DATA_TeminDosyasi // Her bir temin kaydı
  ]
}


export function initializeDatabase(db: Database.Database, institutionName: string): void {
  const currentAppVersion = app.getVersion()
  // Temel ayarlar tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
    INSERT OR REPLACE INTO settings (key, value) VALUES ('institutionName', '${institutionName.replace(/'/g, "''")}');
    INSERT OR REPLACE INTO settings (key, value) VALUES ('dbVersion', '${currentAppVersion}');
    INSERT OR REPLACE INTO settings (key, value) VALUES ('dbSchemaVersion', '${CURRENT_SCHEMA_VERSION}');
    INSERT OR REPLACE INTO settings (key, value) VALUES ('appTitle', '${schema.app_title}');
    INSERT OR REPLACE INTO settings (key, value) VALUES ('adminName', 'İlyas BOZDEMİR');
    INSERT OR REPLACE INTO settings (key, value) VALUES ('adminTitle', 'Sistem Yöneticisi');
  `)


  // Tüm tabloları sırayla oluştur
  schema.tables.forEach((table: any) => {
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

    // Başlangıç verileri
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
  })
}

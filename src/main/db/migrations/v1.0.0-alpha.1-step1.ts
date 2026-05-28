import Database from 'better-sqlite3'
import { Migration } from './index'

export const migration: Migration = {
  from: 1,
  to: 2,
  up: (db: Database.Database): void => {
    console.log('TANIM_Firma tablosuna vergi_dairesi kolonu ekleniyor...')
    // TANIM_Firma tablosunu oluştur (varsa es geç)
    db.exec(`
      CREATE TABLE IF NOT EXISTS TANIM_Firma (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unvan TEXT
      );
    `)
    // vergi_dairesi kolonunu ekle
    try {
      db.exec('ALTER TABLE TANIM_Firma ADD COLUMN vergi_dairesi TEXT;')
    } catch (e) {
      // Column already exists, ignore
    }
  }
}

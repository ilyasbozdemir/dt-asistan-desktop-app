import Database from 'better-sqlite3'
import { Migration } from './index'

export const migration: Migration = {
  from: 2,
  to: 3,
  description: 'v1.0.0-alpha.1-step2 geçiş adımı',
  up: (db: Database.Database): void => {
    console.log('TANIM_Kalem tablosu oluşturuluyor...')
    db.exec(`
      CREATE TABLE IF NOT EXISTS TANIM_Kalem (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kod TEXT,
        aciklama TEXT
      );
    `)
  }
}

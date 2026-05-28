import Database from 'better-sqlite3'
import { Migration } from './index'

export const migration: Migration = {
  from: 3,
  to: 4,
  up: (db: Database.Database): void => {
    console.log('DATA_TeminDosyasi tablosuna bent ve ekap_bildiri kolonları ekleniyor...')
    try {
      db.exec('ALTER TABLE DATA_TeminDosyasi ADD COLUMN bent TEXT;')
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      db.exec('ALTER TABLE DATA_TeminDosyasi ADD COLUMN ekap_bildiri TEXT;')
    } catch (e) {
      // Column already exists, ignore
    }
  }
}

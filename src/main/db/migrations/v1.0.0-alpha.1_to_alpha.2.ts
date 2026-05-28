import Database from 'better-sqlite3'
import { Migration } from './index'

export const migration: Migration = {
  from: 4,
  to: 5,
  up: (db: Database.Database): void => {
    console.log('v4→v5: TANIM_Firma genişletme, TANIM_Birim genişletme, TANIM_Ambar oluşturma...')

    // --- TANIM_Firma: Yeni kolonlar ---
    const firmaColumns = [
      'firma_kodu TEXT',
      'ilgili_adi TEXT',
      'uyrugu TEXT',
      'istigal_konusu TEXT',
      'adres TEXT',
      'ilce TEXT',
      'posta_kodu TEXT',
      'il TEXT',
      'telefon TEXT',
      'faks TEXT',
      'email TEXT',
      'web_adresi TEXT',
      'banka_adi TEXT',
      'sube_kodu_adi TEXT',
      'hesap_no TEXT',
      'tc_kimlik_no TEXT',
      'dogum_tarihi TEXT',
      'vergi_no TEXT',
      'aktif_mi INTEGER NOT NULL DEFAULT 1',
      'created_at DATETIME DEFAULT CURRENT_TIMESTAMP'
    ]
    for (const col of firmaColumns) {
      try {
        db.exec(`ALTER TABLE TANIM_Firma ADD COLUMN ${col};`)
      } catch (_) {
        // Column already exists, ignore
      }
    }

    // --- TANIM_Birim: Yeni kolonlar ---
    const birimColumns = [
      'antet_ek_satir TEXT',
      'ihtiyac_yeri_eki TEXT',
      'sunum_makami TEXT',
      'kurumsal_kod TEXT',
      'dtvt_kodu TEXT',
      'ayrintili_bilgi_personel TEXT'
    ]
    for (const col of birimColumns) {
      try {
        db.exec(`ALTER TABLE TANIM_Birim ADD COLUMN ${col};`)
      } catch (_) {
        // Column already exists, ignore
      }
    }

    // --- TANIM_Ambar: Yeni tablo ---
    db.exec(`
      CREATE TABLE IF NOT EXISTS TANIM_Ambar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ambar_adi TEXT NOT NULL UNIQUE,
        aciklama TEXT,
        adres TEXT,
        semt TEXT,
        posta_kodu TEXT,
        sehir TEXT,
        telefon TEXT,
        faks TEXT,
        web_adresi TEXT,
        email TEXT,
        tasinir_kodu TEXT,
        tasinir_adi TEXT,
        aktif_mi INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)
  }
}

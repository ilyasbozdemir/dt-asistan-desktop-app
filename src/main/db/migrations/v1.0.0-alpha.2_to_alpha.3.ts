import Database from 'better-sqlite3'

export const migration = {
  from: 5,
  to: 6,
  up: (db: Database.Database): void => {
    console.log('Running migration v5 -> v6')
    // 1. Önce tabloların var olduğundan emin olalım (Eski sürümlerde oluşturulmamış olabilir)
    db.exec(`
      CREATE TABLE IF NOT EXISTS TANIM_Personel (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ad_soyad TEXT NOT NULL,
        unvan TEXT,
        birim TEXT,
        sicil_no TEXT,
        telefon TEXT,
        eposta TEXT,
        ihale_yetkilisi_mi INTEGER NOT NULL DEFAULT 0,
        harcama_yetkilisi_mi INTEGER NOT NULL DEFAULT 0,
        aktif_mi INTEGER NOT NULL DEFAULT 1,
        notlar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS TANIM_Birim (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        birim_adi TEXT NOT NULL UNIQUE,
        antet_ek_satir TEXT,
        ihtiyac_yeri_eki TEXT,
        sunum_makami TEXT,
        kurumsal_kod TEXT,
        dtvt_kodu TEXT,
        ayrintili_bilgi_personel TEXT,
        aktif_mi INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 2. Ardından yeni kolonu eklemeyi deneyelim
    try {
      db.exec(`
        ALTER TABLE TANIM_Birim ADD COLUMN ilgili_personel_id INTEGER;
      `)
      console.log('Added ilgili_personel_id column to TANIM_Birim successfully.')
    } catch (error: any) {
      if (!error.message.includes('duplicate column name')) {
        throw error
      }
      console.log('ilgili_personel_id column already exists in TANIM_Birim, skipping...')
    }
  }
}

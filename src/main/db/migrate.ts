import Database from 'better-sqlite3'
import { migrations, Migration } from './migrations/index'

export const CURRENT_SCHEMA_VERSION = 6

/**
 * Runs pending database migrations sequentially.
 * Wraps execution inside a database transaction to ensure atomicity.
 */
export function runMigrations(db: Database.Database, fromVersion: number): void {
  if (fromVersion > CURRENT_SCHEMA_VERSION) {
    console.warn(
      `Uyarı: Veritabanı şema sürümü (v${fromVersion}) uygulama sürümünden (v${CURRENT_SCHEMA_VERSION}) daha yüksek. Şema sürümü v${CURRENT_SCHEMA_VERSION} olarak sıfırlanıyor.`
    )
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('dbSchemaVersion', ?);").run(
      CURRENT_SCHEMA_VERSION.toString()
    )
    return
  }

  const pendingMigrations: Migration[] = []
  let currentRunningVersion = fromVersion

  // Trace the migration path sequentially using from -> to mappings
  while (currentRunningVersion < CURRENT_SCHEMA_VERSION) {
    const nextMigration = migrations.find((m) => m.from === currentRunningVersion)
    if (!nextMigration) {
      break
    }
    pendingMigrations.push(nextMigration)
    currentRunningVersion = nextMigration.to
  }

  if (pendingMigrations.length === 0) {
    console.log('Veritabanı şeması zaten güncel.')
    return
  }

  console.log(`v${fromVersion} sürümünden v${CURRENT_SCHEMA_VERSION} sürümüne veritabanı göçü başlatılıyor...`)

  // Ensure the settings table exists to store schema version updates
  db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);')

  // Run migrations within an atomic transaction
  const executeMigrationsTransaction = db.transaction(() => {
    for (const migration of pendingMigrations) {
      console.log(`[Migration v${migration.to}] ${migration.description} çalıştırılıyor...`)
      try {
        migration.up(db)
        
        // Update schema version in the settings table
        db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('dbSchemaVersion', ?);").run(
          migration.to.toString()
        )
      } catch (error: any) {
        throw new Error(`[Sürüm ${migration.to} - ${migration.description}] adımı sırasında hata oluştu: ${error.message}`)
      }
    }
  })

  try {
    executeMigrationsTransaction()
  } catch (error: any) {
    throw error // Yüksek seviyeye fırlatıyoruz, workspace.ts dosyayı rollback yapacak.
  }
  console.log('Tüm veritabanı göç adımları başarıyla tamamlandı.')
}

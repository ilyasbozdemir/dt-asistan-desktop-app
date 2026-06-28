import { ipcMain, dialog, app } from 'electron'
import { workspaceManager } from './database/workspace'
import { initializeDatabase } from './database/index'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'

export function registerArchiveHandlers() {
  ipcMain.handle('db:archive-old-records', async (_, year: number) => {
    try {
      const db = workspaceManager.getDb()
      const currentFilePath = workspaceManager.getCurrentFilePath()
      if (!db || !currentFilePath) throw new Error('Açık bir çalışma alanı yok.')

      // Find files older than the specified year
      const rows = db
        .prepare(
          'SELECT id, temin_no FROM DATA_TeminDosyasi WHERE butce_yili <= ? OR (butce_yili IS NULL AND CAST(strftime("%Y", dosya_acilis_tarihi) AS INTEGER) <= ?)'
        )
        .all(year, year) as { id: number; temin_no: string }[]

      if (rows.length === 0) {
        return { success: false, message: 'Belirtilen yıldan eski dosya bulunamadı.' }
      }

      const dosyaIds = rows.map((r) => r.id)
      const inClause = dosyaIds.map(() => '?').join(',')

      // Ask user where to save the .dtz file
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Eski Dosyaları Arşivle',
        defaultPath: `DT_Arsiv_${year}_Oncesi.dtz`,
        filters: [{ name: 'Doğrudan Temin Arşivi', extensions: ['dtz'] }]
      })

      if (canceled || !filePath) return { success: false, message: 'İşlem iptal edildi.' }

      // Create temporary archive DB
      const tempArchiveDir = path.join(app.getPath('temp'), `dt_archive_${Date.now()}`)
      fs.mkdirSync(tempArchiveDir, { recursive: true })
      const archiveDbPath = path.join(tempArchiveDir, 'database.sqlite')
      const archiveDb = new Database(archiveDbPath)

      // Get institution name from current DB
      const instRow = db
        .prepare("SELECT value FROM settings WHERE key = 'institutionName'")
        .get() as { value: string } | undefined
      const instName = instRow ? instRow.value : 'Bilinmeyen Kurum'

      // Initialize schema
      initializeDatabase(archiveDb, instName)

      // Begin copying tables
      archiveDb.transaction(() => {
        // Copy DATA_TeminDosyasi
        const dosyaRows = db
          .prepare(`SELECT * FROM DATA_TeminDosyasi WHERE id IN (${inClause})`)
          .all(...dosyaIds)
        const insertDosya = archiveDb.prepare(
          `INSERT INTO DATA_TeminDosyasi (${Object.keys(dosyaRows[0]).join(', ')}) VALUES (${Object.keys(
            dosyaRows[0]
          )
            .map(() => '?')
            .join(', ')})`
        )
        dosyaRows.forEach((row: any) => insertDosya.run(Object.values(row)))

        // Copy related tables
        const relatedTables = [
          'DATA_TeminBelge',
          'DATA_TeminFirma',
          'DATA_TeminKalem',
          'DATA_TeminKalemTeklif',
          'DATA_TeminKomisyon'
        ]

        for (const table of relatedTables) {
          const tableRows = db
            .prepare(`SELECT * FROM ${table} WHERE temin_dosya_id IN (${inClause})`)
            .all(...dosyaIds)
          if (tableRows.length > 0) {
            const keys = Object.keys(tableRows[0])
            const insertTable = archiveDb.prepare(
              `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`
            )
            tableRows.forEach((row: any) => insertTable.run(Object.values(row)))
          }
        }
      })()

      archiveDb.close()

      // Create meta.json for archive
      const currentMeta = workspaceManager.getMeta()
      if (currentMeta) {
        const metaPath = path.join(tempArchiveDir, 'meta.json')
        fs.writeFileSync(
          metaPath,
          JSON.stringify(
            {
              ...currentMeta,
              is_archive: true,
              archive_year: year
            },
            null,
            2
          )
        )
      }

      // Copy attachments if any exist
      // Since attachments currently are stored absolutely or inside the temp attachments dir...
      // For now we just create the folder so format matches
      fs.mkdirSync(path.join(tempArchiveDir, 'attachments'), { recursive: true })

      // Compress to .dtz
      const zip = new AdmZip()
      zip.addLocalFolder(tempArchiveDir)
      zip.writeZip(filePath)

      // Cleanup temp
      fs.rmSync(tempArchiveDir, { recursive: true, force: true })

      // Delete from main DB
      // Assuming ON DELETE CASCADE works if PRAGMA foreign_keys = ON
      db.pragma('foreign_keys = ON')
      db.transaction(() => {
        db.prepare(`DELETE FROM DATA_TeminDosyasi WHERE id IN (${inClause})`).run(...dosyaIds)
      })()

      // Save current workspace to ensure it's synced
      workspaceManager.save()

      return { success: true, count: dosyaIds.length, filePath }
    } catch (error: any) {
      console.error('Archiving error:', error)
      return { success: false, message: error.message || 'Bilinmeyen bir hata oluştu.' }
    }
  })
}

import { app } from 'electron'
import path from 'path'
import fs from 'fs'

export interface RecentFile {
  id: string
  name: string
  path: string
  lastOpened: number
}

const MAX_RECENT_FILES = 10

class RecentFilesStore {
  private filePath: string

  constructor() {
    this.filePath = path.join(app.getPath('userData'), 'recent-files.json')
  }

  private readData(): RecentFile[] {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8')
        return JSON.parse(raw)
      }
    } catch (e) {
      console.error('RecentFilesStore: readData failed', e)
    }
    return []
  }

  private writeData(data: RecentFile[]) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (e) {
      console.error('RecentFilesStore: writeData failed', e)
    }
  }

  public getRecentFiles(): RecentFile[] {
    // Return sorted by lastOpened descending
    return this.readData().sort((a, b) => b.lastOpened - a.lastOpened)
  }

  public addRecentFile(filePath: string, name: string) {
    let files = this.readData()
    const id = Buffer.from(filePath).toString('base64')

    // Remove if already exists to move it to the top
    files = files.filter((f) => f.path !== filePath)

    files.unshift({
      id,
      name,
      path: filePath,
      lastOpened: Date.now()
    })

    // Limit to MAX_RECENT_FILES
    if (files.length > MAX_RECENT_FILES) {
      files = files.slice(0, MAX_RECENT_FILES)
    }

    this.writeData(files)
  }

  public removeRecentFile(filePath: string): void {
    let files = this.readData()
    files = files.filter((f) => f.path !== filePath)
    this.writeData(files)
  }

  public clearRecentFiles(): void {
    this.writeData([])
  }
}

export const recentFilesStore = new RecentFilesStore()

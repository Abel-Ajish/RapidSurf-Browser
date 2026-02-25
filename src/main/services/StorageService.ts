import { ipcMain, app } from 'electron'
import { join } from 'path'
import fs from 'fs'

export interface Bookmark {
  id: string
  title: string
  url: string
  folder?: string
}

export interface HistoryItem {
  id: string
  title: string
  url: string
  timestamp: number
}

export class StorageService {
  private bookmarksPath: string
  private historyPath: string

  constructor() {
    const userDataPath = app.getPath('userData')
    this.bookmarksPath = join(userDataPath, 'bookmarks.json')
    this.historyPath = join(userDataPath, 'history.json')
    this.setupIpc()
  }

  private setupIpc() {
    ipcMain.handle('storage:get-bookmarks', () => this.readJson(this.bookmarksPath, []))
    ipcMain.handle('storage:save-bookmarks', (_, bookmarks) => this.writeJson(this.bookmarksPath, bookmarks))
    
    ipcMain.handle('storage:get-history', () => this.readJson(this.historyPath, []))
    ipcMain.handle('storage:add-history', async (_, item: HistoryItem) => {
      const history = await this.readJson(this.historyPath, [])
      history.unshift(item)
      // Keep only last 1000 items
      if (history.length > 1000) history.pop()
      await this.writeJson(this.historyPath, history)
    })
  }

  private async readJson(path: string, defaultValue: any) {
    try {
      if (fs.existsSync(path)) {
        const data = fs.readFileSync(path, 'utf8')
        return JSON.parse(data)
      }
    } catch (err) {
      console.error(`Error reading ${path}:`, err)
    }
    return defaultValue
  }

  private async writeJson(path: string, data: any) {
    try {
      fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
      return true
    } catch (err) {
      console.error(`Error writing ${path}:`, err)
      return false
    }
  }
}
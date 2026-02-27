/*
 * RapidSurf Browser
 * Copyright (C) 2026 Abel Ajish
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { app, ipcMain, dialog } from 'electron'
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
  private sessionPath: string
  private settingsPath: string
  private mainWindow: any // Add reference to notify renderer

  constructor(mainWindow?: any) {
    this.mainWindow = mainWindow
    const userDataPath = app.getPath('userData')
    this.bookmarksPath = join(userDataPath, 'bookmarks.json')
    this.historyPath = join(userDataPath, 'history.json')
    this.sessionPath = join(userDataPath, 'session.json')
    this.settingsPath = join(userDataPath, 'settings.json')
    this.setupIpc()
  }

  private setupIpc() {
    ipcMain.handle('storage:get-bookmarks', () => this.readJson(this.bookmarksPath, []))
    ipcMain.handle('storage:save-bookmarks', async (_, bookmarks) => {
      const result = await this.writeJson(this.bookmarksPath, bookmarks)
      if (result && this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('storage:bookmarks-updated', bookmarks)
      }
      return result
    })
    
    ipcMain.handle('storage:get-history', () => this.readJson(this.historyPath, []))
    ipcMain.handle('storage:add-history', async (_, item: HistoryItem) => {
      const history = await this.readJson(this.historyPath, [])
      history.unshift(item)
      // Keep only last 1000 items
      if (history.length > 1000) history.pop()
      await this.writeJson(this.historyPath, history)
    })

    ipcMain.handle('storage:get-session', () => this.readJson(this.sessionPath, null))
    ipcMain.handle('storage:save-session', (_, session) => this.writeJson(this.sessionPath, session))

    ipcMain.handle('storage:get-settings', () => this.readJson(this.settingsPath, {}))
    ipcMain.handle('storage:save-settings', (_, settings) => this.writeJson(this.settingsPath, settings))

    ipcMain.handle('dialog:show-confirm', async (_, { message, title }) => {
      const { dialog } = require('electron')
      const result = await dialog.showMessageBox(this.mainWindow, {
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 0,
        cancelId: 1,
        title: title || 'RapidSurf Browser',
        message: message
      })
      return result.response === 0 // 0 is 'Yes'
    })

    ipcMain.handle('storage:clear-history', () => this.writeJson(this.historyPath, []))
    ipcMain.handle('storage:clear-browsing-data', async (_, options) => {
      const { session } = require('electron')
      const defaultSession = session.defaultSession
      
      const tasks: Promise<any>[] = []
      if (options.cache) tasks.push(defaultSession.clearCache())
      if (options.history) tasks.push(this.writeJson(this.historyPath, []))
      if (options.cookies) tasks.push(defaultSession.clearStorageData({ storages: ['cookies'] }))
      
      await Promise.all(tasks)
      return true
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

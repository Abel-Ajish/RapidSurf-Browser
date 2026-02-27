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

import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { TabService } from './services/TabService'
import { SecurityService } from './services/SecurityService'
import { DownloadService } from './services/DownloadService'
import { StorageService } from './services/StorageService'
import { AIService } from './services/AIService'

/**
 * Main Window Manager
 * Handles the creation and management of the main browser window.
 */
class WindowManager {
  private mainWindow: BrowserWindow | null = null
  private tabService: TabService | null = null

  constructor() {
    this.initApp()
  }

  private initApp() {
    app.name = 'RapidSurf Browser'

    // Global Error Handling for Main Process
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception in Main Process:', error)
    })

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    })

    app.whenReady().then(() => {
      electronApp.setAppUserModelId('com.rapidsurf.browser')

      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })

      this.createWindow()

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) this.createWindow()
      })
    })

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      autoHideMenuBar: true,
      backgroundColor: '#ffffff',
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true
      }
    })

    // Initialize Services
    this.tabService = new TabService(this.mainWindow)
    new SecurityService()
    new DownloadService(this.mainWindow)
    new StorageService(this.mainWindow)
    new AIService()

      this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    this.mainWindow.on('resize', () => {
      this.tabService?.updateBounds()
    })
  }
}

new WindowManager()
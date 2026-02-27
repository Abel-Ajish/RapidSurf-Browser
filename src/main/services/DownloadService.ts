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

import { BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'

export interface Download {
  id: string
  fileName: string
  progress: number
  state: 'progressing' | 'completed' | 'cancelled' | 'interrupted'
  path?: string
  totalBytes: number
  receivedBytes: number
}

export class DownloadService {
  private mainWindow: BrowserWindow
  private downloads: Map<string, Download> = new Map()

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.setupDownloadHandler()
    this.setupIpc()
  }

  private setupIpc() {
    ipcMain.handle('downloads:get-all', () => Array.from(this.downloads.values()))
    ipcMain.handle('downloads:open-folder', () => {
      const storagePath = this.mainWindow.webContents.session.getStoragePath()
      if (storagePath) {
        shell.openPath(join(storagePath, 'downloads'))
      }
    })
  }

  private setupDownloadHandler() {
    this.mainWindow.webContents.session.on('will-download', (_event, item, _webContents) => {
      const id = item.getETag() || Math.random().toString(36).substr(2, 9)
      const fileName = item.getFilename()
      
      const download: Download = {
        id,
        fileName,
        progress: 0,
        state: 'progressing',
        totalBytes: item.getTotalBytes(),
        receivedBytes: 0
      }
      
      this.downloads.set(id, download)
      this.mainWindow.webContents.send('downloads:updated', Array.from(this.downloads.values()))

      item.on('updated', (_event, state) => {
        const d = this.downloads.get(id)
        if (!d) return

        d.state = state as any
        d.receivedBytes = item.getReceivedBytes()
        d.progress = (d.receivedBytes / d.totalBytes) * 100

        this.mainWindow.webContents.send('downloads:updated', Array.from(this.downloads.values()))
      })

      item.once('done', (_event, state) => {
        const d = this.downloads.get(id)
        if (!d) return

        d.state = state as any
        if (state === 'completed') {
          const savePath = item.getSavePath()
          if (savePath) d.path = savePath
        }

        this.mainWindow.webContents.send('downloads:updated', Array.from(this.downloads.values()))
      })
    })
  }
}
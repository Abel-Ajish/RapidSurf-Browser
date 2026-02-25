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
      shell.openPath(join(this.mainWindow.webContents.session.getStoragePath(), 'downloads'))
    })
  }

  private setupDownloadHandler() {
    this.mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
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

      item.on('updated', (event, state) => {
        const d = this.downloads.get(id)
        if (!d) return

        d.state = state as any
        d.receivedBytes = item.getReceivedBytes()
        d.progress = (d.receivedBytes / d.totalBytes) * 100

        this.mainWindow.webContents.send('downloads:updated', Array.from(this.downloads.values()))
      })

      item.once('done', (event, state) => {
        const d = this.downloads.get(id)
        if (!d) return

        d.state = state as any
        if (state === 'completed') {
          d.path = item.getSavePath()
        }

        this.mainWindow.webContents.send('downloads:updated', Array.from(this.downloads.values()))
      })
    })
  }
}
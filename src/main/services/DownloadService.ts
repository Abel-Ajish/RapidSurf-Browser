import { BrowserWindow, downloadItem, ipcMain, shell } from 'electron'
import { join } from 'path'

export class DownloadService {
  private mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.setupDownloadHandler()
  }

  private setupDownloadHandler() {
    this.mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
      // Set the save path
      const fileName = item.getFilename()
      const savePath = join(this.mainWindow.webContents.session.getStoragePath(), 'downloads', fileName)
      
      // item.setSavePath(savePath)

      item.on('updated', (event, state) => {
        if (state === 'interrupted') {
          console.log('Download is interrupted but can be resumed')
        } else if (state === 'progressing') {
          if (item.isPaused()) {
            console.log('Download is paused')
          } else {
            const progress = (item.getReceivedBytes() / item.getTotalBytes()) * 100
            this.mainWindow.webContents.send('download:progress', {
              id: item.getETag(),
              progress,
              fileName
            })
          }
        }
      })

      item.once('done', (event, state) => {
        if (state === 'completed') {
          console.log('Download successfully')
          this.mainWindow.webContents.send('download:completed', {
            fileName,
            path: item.getSavePath()
          })
        } else {
          console.log(`Download failed: ${state}`)
        }
      })
    })

    ipcMain.handle('download:open-folder', () => {
      shell.openPath(join(this.mainWindow.webContents.session.getStoragePath(), 'downloads'))
    })
  }
}
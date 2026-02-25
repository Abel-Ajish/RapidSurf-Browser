import { BrowserView, BrowserWindow, ipcMain } from 'electron'

export class TabService {
  private views: Map<string, BrowserView> = new Map()
  private activeViewId: string | null = null
  private mainWindow: BrowserWindow
  private sidePanelWidth: number = 0
  private isAIActive: boolean = false

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.setupIpc()
  }

  private setupIpc() {
    ipcMain.handle('tabs:create', (_, { id, url }) => this.createTab(id, url))
    ipcMain.handle('tabs:switch', (_, { id }) => this.switchTab(id))
    ipcMain.handle('tabs:close', (_, { id }) => this.closeTab(id))
    ipcMain.handle('navigation:go', (_, { url }) => this.navigateActiveTab(url))
    ipcMain.handle('navigation:back', () => this.getActiveView()?.webContents.goBack())
    ipcMain.handle('navigation:forward', () => this.getActiveView()?.webContents.goForward())
    ipcMain.handle('navigation:reload', () => this.getActiveView()?.webContents.reload())
    ipcMain.handle('tabs:get-text', () => this.getActiveTabText())
    ipcMain.handle('tabs:set-theme', (_, { theme }) => this.setTheme(theme))
    ipcMain.handle('tabs:set-panel-width', (_, { width }) => {
      this.sidePanelWidth = width
      this.updateBounds()
    })
    ipcMain.handle('tabs:set-ai-active', (_, { active }) => {
      this.isAIActive = active
      this.updateBounds()
    })
  }

  public setTheme(theme: 'light' | 'dark') {
    const nativeTheme = theme === 'dark' ? 'dark' : 'light'
    this.views.forEach(view => {
      view.webContents.executeJavaScript(`
        if (window.matchMedia) {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          // This is a bit of a hack as we can't easily force prefers-color-scheme in BrowserView
          // without using nativeTheme.themeSource which affects the whole app.
        }
      `)
    })
    
    // Electron's way to handle prefers-color-scheme for web content
    const { nativeTheme: electronNativeTheme } = require('electron')
    electronNativeTheme.themeSource = theme
    
    // Refresh active view bounds
    this.updateBounds()
  }

  public async getActiveTabText(): Promise<string> {
    const view = this.getActiveView()
    if (!view) return ''
    
    try {
      return await view.webContents.executeJavaScript(`
        (function() {
          // Try to get main content text
          const main = document.querySelector('main') || document.querySelector('article') || document.body;
          return main.innerText || '';
        })()
      `)
    } catch (error) {
      console.error('Failed to get tab text:', error)
      return ''
    }
  }

  public createTab(id: string, url: string) {
    const view = new BrowserView({
      webPreferences: {
        sandbox: true,
        contextIsolation: true
      }
    })

    this.views.set(id, view)
    
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`
    view.webContents.loadURL(formattedUrl)
    
    view.webContents.on('did-start-loading', () => {
      this.mainWindow.webContents.send('tabs:updated', { id, loading: true })
    })

    view.webContents.on('did-stop-loading', () => {
      this.mainWindow.webContents.send('tabs:updated', { id, loading: false })
    })

    view.webContents.on('page-title-updated', (_, title) => {
      this.mainWindow.webContents.send('tabs:updated', { id, title })
    })

    view.webContents.on('did-finish-load', () => {
      const currentUrl = view.webContents.getURL()
      const title = view.webContents.getTitle()
      this.mainWindow.webContents.send('tabs:updated', { id, url: currentUrl, title })
      
      // Record history
      if (currentUrl && !currentUrl.startsWith('devtools://')) {
        this.mainWindow.webContents.send('history:add', {
          id: Math.random().toString(36).substr(2, 9),
          title: title || currentUrl,
          url: currentUrl,
          timestamp: Date.now()
        })
      }
    })

    this.switchTab(id)
  }

  public switchTab(id: string) {
    const view = this.views.get(id)
    if (!view) return

    // Remove ALL current views to be absolutely sure there's no double-rendering
    const currentViews = this.mainWindow.getBrowserViews()
    currentViews.forEach(v => this.mainWindow.removeBrowserView(v))

    this.mainWindow.addBrowserView(view)
    this.activeViewId = id
    this.updateBounds()
    view.webContents.focus()
  }

  public closeTab(id: string) {
    const view = this.views.get(id)
    if (!view) return

    this.mainWindow.removeBrowserView(view)
    // @ts-ignore
    view.webContents.destroy()
    this.views.delete(id)

    if (this.activeViewId === id) {
      this.activeViewId = null
    }
  }

  public updateBounds() {
    if (!this.activeViewId) return
    const view = this.views.get(this.activeViewId)
    if (!view) return

    if (this.isAIActive) {
      // Hide the native layer completely so DOM overlays can show
      view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
      return
    }

    const bounds = this.mainWindow.getContentBounds()
    // Side panel is on the right, so x remains 0, width is reduced.
    view.setBounds({
      x: 0,
      y: 80, // Navbar + TabBar height
      width: bounds.width - this.sidePanelWidth,
      height: bounds.height - 80
    })
  }

  private navigateActiveTab(url: string) {
    const view = this.getActiveView()
    if (view) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`
      view.webContents.loadURL(formattedUrl)
    }
  }

  private getActiveView() {
    return this.activeViewId ? this.views.get(this.activeViewId) : null
  }
}
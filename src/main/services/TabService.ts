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
    ipcMain.handle('tabs:find-in-page', (_, { text, options }) => {
      this.getActiveView()?.webContents.findInPage(text, options)
    })
    ipcMain.handle('tabs:stop-find-in-page', (_, { action }) => {
      this.getActiveView()?.webContents.stopFindInPage(action)
    })
    ipcMain.handle('tabs:capture-page', async () => {
      const view = this.getActiveView()
      if (!view) return null
      const image = await view.webContents.capturePage()
      return image.toDataURL()
    })
    
    ipcMain.on('tabs:scroll', (_, { id, progress }) => {
      if (id === this.activeViewId) {
        this.mainWindow.webContents.send('tabs:scroll-progress', { progress })
      }
    })

    ipcMain.on('tabs:hover-link', (_, { url }) => {
      this.mainWindow.webContents.send('tabs:hover-link-update', { url })
    })

    ipcMain.handle('tabs:set-user-agent', (_, { userAgent }) => {
      this.views.forEach(view => {
        view.webContents.setUserAgent(userAgent)
      })
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
    if (electronNativeTheme) {
      electronNativeTheme.themeSource = theme
    }
    
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
    
    if (url === 'rapidsurf://newtab' || url === 'about:blank') {
      view.webContents.loadURL('about:blank')
      // Immediately hide special tabs so they don't occlude the New Tab Page DOM
      view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    } else {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`
      view.webContents.loadURL(formattedUrl)
    }
    
    view.webContents.on('did-start-loading', () => {
      this.mainWindow.webContents.send('tabs:updated', { id, loading: true })
    })

    view.webContents.on('did-stop-loading', () => {
      this.mainWindow.webContents.send('tabs:updated', { id, loading: false })
      // When a load stops, re-check bounds in case we need to hide/show
      this.updateBounds()
    })

    view.webContents.on('page-title-updated', (_, title) => {
      this.mainWindow.webContents.send('tabs:updated', { id, title })
    })

    view.webContents.on('did-finish-load', () => {
      const currentUrl = view.webContents.getURL()
      const title = view.webContents.getTitle()
      this.mainWindow.webContents.send('tabs:updated', { id, url: currentUrl, title, loading: false })
      
      // Inject scroll listener for reading progress and hover listener for status bar
      view.webContents.executeJavaScript(`
        window.addEventListener('scroll', () => {
          const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
          const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrolled = (winScroll / height) * 100;
          window.electron.ipcRenderer.send('tabs:scroll', { id: '${id}', progress: scrolled });
        });

        document.addEventListener('mouseover', (e) => {
          const anchor = e.target.closest('a');
          if (anchor && anchor.href) {
            window.electron.ipcRenderer.send('tabs:hover-link', { url: anchor.href });
          } else {
            window.electron.ipcRenderer.send('tabs:hover-link', { url: null });
          }
        });
      `)
      
      // Record history
      if (currentUrl && currentUrl !== 'about:blank' && !currentUrl.startsWith('devtools://') && !currentUrl.startsWith('rapidsurf://')) {
        this.mainWindow.webContents.send('history:add', {
          id: Math.random().toString(36).substr(2, 9),
          title: title || currentUrl,
          url: currentUrl,
          timestamp: Date.now()
        })
      }
    })

    view.webContents.on('found-in-page', (event, result) => {
      this.mainWindow.webContents.send('tabs:find-result', result)
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
    if (!this.activeViewId) {
      console.log('No active view to update bounds')
      return
    }
    const view = this.views.get(this.activeViewId)
    if (!view) {
      console.log(`View ${this.activeViewId} not found in views map`)
      return
    }

    const url = view.webContents.getURL()
    console.log(`Updating bounds for view ${this.activeViewId}. URL: ${url}. AI Active: ${this.isAIActive}`)
    
    // More robust check: empty URL, about:blank, or rapidsurf:// should all hide the native view
    if (this.isAIActive || !url || url === 'about:blank' || url.startsWith('rapidsurf://')) {
      console.log('Hiding BrowserView layer (bounds set to 0,0,0,0)')
      view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
      return
    }

    try {
      const bounds = this.mainWindow.getContentBounds()
      // Dynamic Y based on Bookmarks Bar visibility would be better, but for now we'll use a fixed value 
      // based on the new CSS heights: 44 (TabBar) + 48 (Navbar) + 32 (BookmarksBar) = 124
      const chromeHeight = 124
      
      console.log(`Showing BrowserView at bounds: x=0, y=${chromeHeight}, w=${bounds.width - this.sidePanelWidth}, h=${bounds.height - chromeHeight}`)
      view.setBounds({
        x: 0,
        y: chromeHeight,
        width: Math.max(0, bounds.width - this.sidePanelWidth),
        height: Math.max(0, bounds.height - chromeHeight)
      })
    } catch (err) {
      console.error('Failed to get content bounds or set view bounds:', err)
    }
  }

  public navigateActiveTab(url: string) {
    const view = this.getActiveView()
    if (!view) return

    if (url === 'rapidsurf://newtab' || url === 'about:blank') {
      view.webContents.loadURL('about:blank')
      // Immediately hide special tabs
      view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    } else {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`
      view.webContents.loadURL(formattedUrl)
      this.updateBounds()
    }
  }

  private getActiveView() {
    return this.activeViewId ? this.views.get(this.activeViewId) : null
  }
}
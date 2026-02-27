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

import { BrowserView, BrowserWindow, ipcMain, Menu, MenuItem } from 'electron'
import { join } from 'path'

export class TabService {
  private views: Map<string, BrowserView> = new Map()
  private activeViewId: string | null = null
  private mainWindow: BrowserWindow
  private sidePanelWidth: number = 0
  private chromeHeight: number = 112 // Default with TabBar (38) + Navbar (42) + BookmarksBar (32)
  private isAIActive: boolean = false

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.setupIpc()
  }

  private setupIpc() {
    ipcMain.handle('tabs:create', async (_, { id, url }) => {
      try {
        return await this.createTab(id, url)
      } catch (err) {
        console.error('Failed to create tab:', err)
        throw err
      }
    })
    ipcMain.handle('tabs:switch', async (_, { id }) => {
      try {
        return await this.switchTab(id)
      } catch (err) {
        console.error('Failed to switch tab:', err)
        throw err
      }
    })
    ipcMain.handle('tabs:close', async (_, { id }) => {
      try {
        return await this.closeTab(id)
      } catch (err) {
        console.error('Failed to close tab:', err)
        throw err
      }
    })
    ipcMain.handle('navigation:go', async (_, { url }) => {
      try {
        return await this.navigateActiveTab(url)
      } catch (err) {
        console.error('Failed to navigate:', err)
        throw err
      }
    })
    ipcMain.handle('navigation:back', () => {
      try {
        return this.getActiveView()?.webContents.goBack()
      } catch (err) {
        console.error('Failed to go back:', err)
      }
    })
    ipcMain.handle('navigation:forward', () => {
      try {
        return this.getActiveView()?.webContents.goForward()
      } catch (err) {
        console.error('Failed to go forward:', err)
      }
    })
    ipcMain.handle('navigation:reload', () => {
      try {
        return this.getActiveView()?.webContents.reload()
      } catch (err) {
        console.error('Failed to reload:', err)
      }
    })
    ipcMain.handle('tabs:get-text', async () => {
      try {
        return await this.getActiveTabText()
      } catch (err) {
        console.error('Failed to get tab text:', err)
        return ''
      }
    })
    ipcMain.handle('tabs:set-theme', (_, { theme }) => {
      try {
        return this.setTheme(theme)
      } catch (err) {
        console.error('Failed to set theme:', err)
      }
    })
    ipcMain.handle('tabs:set-panel-width', (_, { width }) => {
      try {
        this.sidePanelWidth = width
        this.updateBounds()
      } catch (err) {
        console.error('Failed to set panel width:', err)
      }
    })
    ipcMain.handle('tabs:set-chrome-height', (_, { height }) => {
      try {
        this.chromeHeight = height
        this.updateBounds()
      } catch (err) {
        console.error('Failed to set chrome height:', err)
      }
    })
    ipcMain.handle('tabs:set-ai-active', (_, { active }) => {
      try {
        this.isAIActive = active
        this.updateBounds()
      } catch (err) {
        console.error('Failed to set AI active:', err)
      }
    })
    ipcMain.handle('tabs:find-in-page', (_, { text, options }) => {
      try {
        this.getActiveView()?.webContents.findInPage(text, options)
      } catch (err) {
        console.error('Failed to find in page:', err)
      }
    })
    ipcMain.handle('tabs:stop-find-in-page', (_, { action }) => {
      try {
        this.getActiveView()?.webContents.stopFindInPage(action)
      } catch (err) {
        console.error('Failed to stop find in page:', err)
      }
    })
    ipcMain.handle('tabs:capture-page', async () => {
      try {
        const view = this.getActiveView()
        if (!view) return null
        const image = await view.webContents.capturePage()
        return image.toDataURL()
      } catch (err) {
        console.error('Failed to capture page:', err)
        return null
      }
    })
    
    ipcMain.on('tabs:scroll-guest', (event, { progress }) => {
      try {
        const id = Array.from(this.views.entries()).find(([_, v]) => v.webContents === event.sender)?.[0]
        if (id === this.activeViewId) {
          this.mainWindow.webContents.send('tabs:scroll-progress', { progress })
        }
      } catch (err) {
        console.error('Failed to handle scroll guest:', err)
      }
    })

    ipcMain.on('tabs:hover-link-guest', (event, { url }) => {
      try {
        if (Array.from(this.views.values()).some(v => v.webContents === event.sender)) {
          this.mainWindow.webContents.send('tabs:hover-link-update', { url })
        }
      } catch (err) {
        console.error('Failed to handle hover link guest:', err)
      }
    })

    ipcMain.handle('tabs:set-user-agent', (_, { userAgent }) => {
      try {
        this.views.forEach(view => {
          view.webContents.setUserAgent(userAgent)
        })
      } catch (err) {
        console.error('Failed to set user agent:', err)
      }
    })
  }

  private showContextMenu(webContents: any, params: any) {
    const menu = new Menu()

    menu.append(new MenuItem({
      label: 'Back',
      enabled: webContents.canGoBack(),
      click: () => webContents.goBack()
    }))
    menu.append(new MenuItem({
      label: 'Forward',
      enabled: webContents.canGoForward(),
      click: () => webContents.goForward()
    }))
    menu.append(new MenuItem({
      label: 'Reload',
      click: () => webContents.reload()
    }))
    menu.append(new MenuItem({ type: 'separator' }))

    if (params.linkURL) {
      menu.append(new MenuItem({
        label: 'Open Link in New Tab',
        click: () => {
          const id = Math.random().toString(36).substr(2, 9)
          this.createTab(id, params.linkURL)
        }
      }))
      menu.append(new MenuItem({
        label: 'Copy Link Address',
        click: () => {
          const { clipboard } = require('electron')
          clipboard.writeText(params.linkURL)
        }
      }))
      menu.append(new MenuItem({ type: 'separator' }))
    }

    if (params.selectionText) {
      menu.append(new MenuItem({
        label: `Search Google for "${params.selectionText.length > 20 ? params.selectionText.substring(0, 20) + '...' : params.selectionText}"`,
        click: () => {
          const id = Math.random().toString(36).substr(2, 9)
          this.createTab(id, `https://www.google.com/search?q=${encodeURIComponent(params.selectionText)}`)
        }
      }))
      menu.append(new MenuItem({
        label: 'Copy',
        role: 'copy'
      }))
      menu.append(new MenuItem({ type: 'separator' }))
    }

    menu.append(new MenuItem({
      label: 'Inspect Element',
      click: () => webContents.inspectElement(params.x, params.y)
    }))

    menu.popup()
  }

  public setTheme(theme: 'light' | 'dark') {
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
        sandbox: false, // Set to false to allow preload script
        contextIsolation: true,
        preload: join(__dirname, '../preload/guest.js')
      }
    })

    this.views.set(id, view)

    view.setAutoResize({ width: true, height: true, horizontal: true, vertical: true })

    view.webContents.on('context-menu', (_, params) => {
      this.showContextMenu(view.webContents, params)
    })
    
    if (url === 'rapidsurf://newtab' || url === 'about:blank') {
      view.webContents.loadURL('about:blank')
      // Immediately hide special tabs so they don't occlude the New Tab Page DOM
      view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    } else {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`
      view.webContents.loadURL(formattedUrl)
    }
    
    view.webContents.on('did-start-loading', () => {
      if (!this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('tabs:updated', { id, loading: true })
      }
    })

    view.webContents.on('did-stop-loading', () => {
      if (!this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('tabs:updated', { id, loading: false })
      }
      // When a load stops, re-check bounds in case we need to hide/show
      this.updateBounds()
    })

    view.webContents.on('page-title-updated', (_, title) => {
      if (!this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('tabs:updated', { id, title })
      }
    })

    view.webContents.on('did-finish-load', () => {
      if (view.webContents.isDestroyed() || this.mainWindow.isDestroyed()) return
      const currentUrl = view.webContents.getURL()
      const title = view.webContents.getTitle()
      this.mainWindow.webContents.send('tabs:updated', { id, url: currentUrl, title, loading: false })
      
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

    view.webContents.on('found-in-page', (_, result) => {
      if (!this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('tabs:find-result', result)
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
      console.log(`Showing BrowserView at bounds: x=0, y=${this.chromeHeight}, w=${bounds.width - this.sidePanelWidth}, h=${bounds.height - this.chromeHeight}`)
      
      // Calculate adjusted width and height to remove blank gaps
      const adjustedWidth = Math.max(0, bounds.width - this.sidePanelWidth)
      const adjustedHeight = Math.max(0, bounds.height - this.chromeHeight)

      view.setBounds({
        x: 0,
        y: this.chromeHeight,
        width: adjustedWidth,
        height: adjustedHeight
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
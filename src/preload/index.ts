import { contextBridge, ipcRenderer } from 'electron'
import { exposeElectronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const browserAPI = {
  createTab: (id: string, url: string) => ipcRenderer.invoke('tabs:create', { id, url }),
  switchTab: (id: string) => ipcRenderer.invoke('tabs:switch', { id }),
  closeTab: (id: string) => ipcRenderer.invoke('tabs:close', { id }),
  go: (url: string) => ipcRenderer.invoke('navigation:go', { url }),
  back: () => ipcRenderer.invoke('navigation:back'),
  forward: () => ipcRenderer.invoke('navigation:forward'),
  reload: () => ipcRenderer.invoke('navigation:reload'),
  getBookmarks: () => ipcRenderer.invoke('storage:get-bookmarks'),
  saveBookmarks: (bookmarks: any) => ipcRenderer.invoke('storage:save-bookmarks', bookmarks),
  getHistory: () => ipcRenderer.invoke('storage:get-history'),
  addHistory: (item: any) => ipcRenderer.invoke('storage:add-history', item),
  getSession: () => ipcRenderer.invoke('storage:get-session'),
  saveSession: (session: any) => ipcRenderer.invoke('storage:save-session', session),
  getTabText: () => ipcRenderer.invoke('tabs:get-text'),
  setTheme: (theme: 'light' | 'dark') => ipcRenderer.invoke('tabs:set-theme', { theme }),
  setPanelWidth: (width: number) => ipcRenderer.invoke('tabs:set-panel-width', { width }),
  setChromeHeight: (height: number) => ipcRenderer.invoke('tabs:set-chrome-height', { height }),
  setAIActive: (active: boolean) => ipcRenderer.invoke('tabs:set-ai-active', { active }),
  summarize: (text: string) => ipcRenderer.invoke('ai:summarize', { text }),
  analyzeQuery: (query: string) => ipcRenderer.invoke('ai:analyze-query', { query }),
  findInPage: (text: string, options?: any) => ipcRenderer.invoke('tabs:find-in-page', { text, options }),
  stopFindInPage: (action: 'clearSelection' | 'keepSelection' | 'activateSelection') => 
    ipcRenderer.invoke('tabs:stop-find-in-page', { action }),
  capturePage: () => ipcRenderer.invoke('tabs:capture-page'),
  setUserAgent: (userAgent: string) => ipcRenderer.invoke('tabs:set-user-agent', { userAgent }),
  getDownloads: () => ipcRenderer.invoke('downloads:get-all'),
  openDownloadFolder: () => ipcRenderer.invoke('downloads:open-folder'),
  clearBrowsingData: (options: { cache?: boolean, history?: boolean, cookies?: boolean }) => 
    ipcRenderer.invoke('storage:clear-browsing-data', options),
  onTabUpdated: (callback: (data: any) => void) => {
    const listener = (_: any, data: any) => callback(data)
    ipcRenderer.on('tabs:updated', listener)
    return () => ipcRenderer.removeListener('tabs:updated', listener)
  },
  onFindResult: (callback: (result: any) => void) => {
    const listener = (_: any, result: any) => callback(result)
    ipcRenderer.on('tabs:find-result', listener)
    return () => ipcRenderer.removeListener('tabs:find-result', listener)
  },
  onDownloadsUpdated: (callback: (downloads: any[]) => void) => {
    const listener = (_: any, downloads: any[]) => callback(downloads)
    ipcRenderer.on('downloads:updated', listener)
    return () => ipcRenderer.removeListener('downloads:updated', listener)
  },
  onHistoryAdded: (callback: (item: any) => void) => {
    const listener = (_: any, item: any) => callback(item)
    ipcRenderer.on('history:add', listener)
    return () => ipcRenderer.removeListener('history:add', listener)
  },
  onScrollProgress: (callback: (progress: number) => void) => {
    const listener = (_: any, { progress }: any) => callback(progress)
    ipcRenderer.on('tabs:scroll-progress', listener)
    return () => ipcRenderer.removeListener('tabs:scroll-progress', listener)
  },
  onHoverLink: (callback: (url: string | null) => void) => {
    const listener = (_: any, { url }: any) => callback(url)
    ipcRenderer.on('tabs:hover-link-update', listener)
    return () => ipcRenderer.removeListener('tabs:hover-link-update', listener)
  },
  onBookmarksUpdated: (callback: (bookmarks: any[]) => void) => {
    const listener = (_: any, bookmarks: any[]) => callback(bookmarks)
    ipcRenderer.on('storage:bookmarks-updated', listener)
    return () => ipcRenderer.removeListener('storage:bookmarks-updated', listener)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    exposeElectronAPI()
    contextBridge.exposeInMainWorld('browser', browserAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in d.ts)
  window.electron = electronAPI
  // @ts-ignore (define in d.ts)
  window.browser = browserAPI
}
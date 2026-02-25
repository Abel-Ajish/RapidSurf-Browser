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
  getTabText: () => ipcRenderer.invoke('tabs:get-text'),
  setTheme: (theme: 'light' | 'dark') => ipcRenderer.invoke('tabs:set-theme', { theme }),
  setPanelWidth: (width: number) => ipcRenderer.invoke('tabs:set-panel-width', { width }),
  setAIActive: (active: boolean) => ipcRenderer.invoke('tabs:set-ai-active', { active }),
  summarize: (text: string) => ipcRenderer.invoke('ai:summarize', { text }),
  analyzeQuery: (query: string) => ipcRenderer.invoke('ai:analyze-query', { query }),
  onTabUpdated: (callback: (data: any) => void) => {
    ipcRenderer.on('tabs:updated', (_, data) => callback(data))
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
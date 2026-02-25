import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    browser: {
      createTab: (id: string, url: string) => Promise<void>
      switchTab: (id: string) => Promise<void>
      closeTab: (id: string) => Promise<void>
      go: (url: string) => Promise<void>
      back: () => Promise<void>
      forward: () => Promise<void>
      reload: () => Promise<void>
      getBookmarks: () => Promise<any[]>
      saveBookmarks: (bookmarks: any[]) => Promise<boolean>
      getHistory: () => Promise<any[]>
      addHistory: (item: any) => Promise<void>
      getTabText: () => Promise<string>
      setTheme: (theme: 'light' | 'dark') => Promise<void>
      setPanelWidth: (width: number) => Promise<void>
      setAIActive: (active: boolean) => Promise<void>
      summarize: (text: string) => Promise<string>
      analyzeQuery: (query: string) => Promise<any>
      onTabUpdated: (callback: (data: { id: string, title?: string, url?: string }) => void) => void
    }
  }
}
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
      getSession: () => Promise<any>
      saveSession: (session: any) => Promise<boolean>
      getSettings: () => Promise<any>
      saveSettings: (settings: any) => Promise<boolean>
      showConfirm: (message: string, title?: string) => Promise<boolean>
      getTabText: () => Promise<string>
      setTheme: (theme: 'light' | 'dark') => Promise<void>
      setPanelWidth: (width: number) => Promise<void>
      setChromeHeight: (height: number) => Promise<void>
      setAIActive: (active: boolean) => Promise<void>
      summarize: (text: string) => Promise<string>
      analyzeQuery: (query: string) => Promise<any>
      findInPage: (text: string, options?: any) => Promise<void>
      stopFindInPage: (action: 'clearSelection' | 'keepSelection' | 'activateSelection') => Promise<void>
      capturePage: () => Promise<string | null>
      setUserAgent: (userAgent: string) => Promise<void>
      getDownloads: () => Promise<any[]>
      openDownloadFolder: () => Promise<void>
      clearBrowsingData: (options: { cache?: boolean, history?: boolean, cookies?: boolean }) => Promise<boolean>
      onTabUpdated: (callback: (data: { id: string, title?: string, url?: string, loading?: boolean }) => void) => () => void
      onFindResult: (callback: (result: { matches: number, activeMatchOrdinal: number }) => void) => () => void
      onDownloadsUpdated: (callback: (downloads: any[]) => void) => () => void
      onHistoryAdded: (callback: (item: any) => void) => () => void
      onScrollProgress: (callback: (progress: number) => void) => () => void
      onHoverLink: (callback: (url: string | null) => void) => () => void
      onBookmarksUpdated: (callback: (bookmarks: any[]) => void) => () => void
    }
  }
}

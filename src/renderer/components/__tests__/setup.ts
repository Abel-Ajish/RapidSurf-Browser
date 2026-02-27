import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock global window properties if needed
Object.defineProperty(window, 'browser', {
  value: {
    getBookmarks: vi.fn().mockResolvedValue([]),
    saveBookmarks: vi.fn(),
    getHistory: vi.fn().mockResolvedValue([]),
    addHistory: vi.fn(),
    getSession: vi.fn().mockResolvedValue(null),
    saveSession: vi.fn(),
    getTabText: vi.fn().mockResolvedValue(''),
    setTheme: vi.fn(),
    setPanelWidth: vi.fn(),
    setChromeHeight: vi.fn(),
    setAIActive: vi.fn(),
    summarize: vi.fn(),
    analyzeQuery: vi.fn(),
    findInPage: vi.fn(),
    stopFindInPage: vi.fn(),
    capturePage: vi.fn(),
    setUserAgent: vi.fn(),
    getDownloads: vi.fn().mockResolvedValue([]),
    openDownloadFolder: vi.fn(),
    clearBrowsingData: vi.fn(),
    onTabUpdated: vi.fn(() => () => {}),
    onFindResult: vi.fn(() => () => {}),
    onDownloadsUpdated: vi.fn(() => () => {}),
    onHistoryAdded: vi.fn(() => () => {}),
    onScrollProgress: vi.fn(() => () => {}),
    onHoverLink: vi.fn(() => () => {}),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    reload: vi.fn(),
  },
  writable: true
})

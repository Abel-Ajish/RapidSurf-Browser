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

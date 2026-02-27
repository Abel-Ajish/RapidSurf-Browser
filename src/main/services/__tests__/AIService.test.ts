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

import { describe, it, expect, vi } from 'vitest'
import { AIService } from '../AIService'
import { BrowserWindow } from 'electron'

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn()
  },
  BrowserWindow: vi.fn()
}))

describe('AIService', () => {
  const aiService = new AIService()

  it('should initialize with IPC handlers', () => {
    const { ipcMain } = require('electron')
    expect(ipcMain.handle).toHaveBeenCalledWith('ai:summarize', expect.any(Function))
    expect(ipcMain.handle).toHaveBeenCalledWith('ai:analyze-query', expect.any(Function))
  })

  it('should summarize text correctly', async () => {
    const text = 'This is a long sentence that should be summarized. Here is another sentence in the middle. And a final sentence at the end.'
    // @ts-ignore - accessing private method for testing
    const summary = aiService.summarize(text)
    expect(summary).toContain('Summarized by AI')
    expect(summary.length).toBeLessThan(text.length + 30) // +30 for the tag
  })

  it('should handle short text gracefully', async () => {
    const text = 'Short text.'
    // @ts-ignore
    const summary = aiService.summarize(text)
    expect(summary).toBe('Not enough content to summarize. Please try on a page with more text.')
  })

  it('should analyze query correctly', async () => {
    const query = 'Who is Albert Einstein?'
    // @ts-ignore
    const analysis = aiService.analyzeQuery(query)
    expect(analysis.isQuestion).toBe(true)
    expect(analysis.entities.people[0].toLowerCase()).toContain('albert einstein')
  })
})

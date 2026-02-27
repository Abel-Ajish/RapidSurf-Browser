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
  const mockWindow = {} as BrowserWindow
  const aiService = new AIService(mockWindow)

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

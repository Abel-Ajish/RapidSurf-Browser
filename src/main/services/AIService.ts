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

import { ipcMain, BrowserWindow } from 'electron'
import nlp from 'compromise'

/**
 * AI Service
 * Handles NLP tasks such as page summarization and smart search.
 */
export class AIService {
  constructor() {
    this.setupIpc()
  }

  private setupIpc() {
    /**
     * Summarize provided text
     */
    ipcMain.handle('ai:summarize', async (_, { text }) => {
      return this.summarize(text)
    })

    /**
     * Analyze search query for intent
     */
    ipcMain.handle('ai:analyze-query', async (_, { query }) => {
      return this.analyzeQuery(query)
    })
  }

  /**
   * Basic extractive summarization using compromise.
   * In a real production app, this would call a remote LLM API.
   */
  private summarize(text: string): string {
    if (!text || text.trim().length < 50) return 'Not enough content to summarize. Please try on a page with more text.'

    try {
      const cleanText = text.replace(/\s+/g, ' ').trim()
      const doc = nlp(cleanText)
      
      // Get sentences and filter out very short ones
      const sentences = doc.sentences().out('array').filter(s => s.trim().length > 20)
      
      // Basic heuristic: take the first sentence, and a few middle ones
      let summary = ''
      if (sentences.length <= 3) {
        summary = sentences.join(' ')
      } else {
        summary = [
          sentences[0],
          sentences[Math.floor(sentences.length / 2)],
          sentences[sentences.length - 1]
        ].join(' ')
      }

      return summary + ' (Summarized by AI)'
    } catch (error) {
      console.error('Summarization error:', error)
      return 'Failed to summarize content.'
    }
  }

  /**
   * Analyze a search query to provide "smart" suggestions
   */
  private analyzeQuery(query: string) {
    const doc = nlp(query)
    
    const isQuestion = doc.questions().length > 0
    const people = doc.people().out('array')
    const places = doc.places().out('array')
    // Use a safer way to get dates if the plugin isn't loaded
    const dates = (doc as any).dates ? (doc as any).dates().out('array') : []

    return {
      isQuestion,
      entities: {
        people,
        places,
        dates
      }
    }
  }
}

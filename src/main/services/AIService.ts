import { ipcMain, BrowserWindow } from 'electron'
import nlp from 'compromise'

/**
 * AI Service
 * Handles NLP tasks such as page summarization and smart search.
 */
export class AIService {
  private mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
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
      
      if (sentences.length === 0) return 'Could not identify clear sentences to summarize.'
      if (sentences.length <= 3) return sentences.join(' ')

      // Basic heuristic: take the first sentence, and a few middle ones
      const summary = [
        sentences[0],
        sentences[Math.floor(sentences.length / 2)],
        sentences[sentences.length - 1]
      ].join(' ')

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
    const dates = doc.dates().out('array')

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

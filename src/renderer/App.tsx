import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import TabBar from './components/TabBar'
import SidePanel from './components/SidePanel'
import FindBar from './components/FindBar'
import SettingsPage from './components/SettingsPage'
import NewTabPage from './components/NewTabPage'
import HistoryManager from './components/HistoryManager'
import BookmarksManager from './components/BookmarksManager'
import BookmarksBar from './components/BookmarksBar'

export interface Tab {
  id: string
  title: string
  url: string
  active: boolean
  loading: boolean
}

const App: React.FC = () => {
  console.log('App component rendering...')
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: 'rapidsurf://newtab', active: true, loading: false }
  ])
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [showFind, setShowFind] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showBookmarksBar, setShowBookmarksBar] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [readingContent, setReadingContent] = useState<string | null>(null)
  const [pinnedIcons, setPinnedIcons] = useState<string[]>(['bookmarks', 'history', 'find', 'screenshot', 'reading', 'summarize', 'panel', 'theme', 'settings'])
  const [readingProgress, setReadingProgress] = useState(0)
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null)

  const activeTab = tabs.find(t => t.active)
  const isNewTab = !activeTab || activeTab?.url === 'rapidsurf://newtab' || activeTab?.url === 'about:blank'

  useEffect(() => {
    window.browser.setChromeHeight(38 + 42 + (showBookmarksBar ? 32 : 0))
  }, [showBookmarksBar])

  useEffect(() => {
    try {
      console.log('Visibility state:', { isSummarizing, summary: !!summary, screenshot: !!screenshot, readingContent: !!readingContent, showSettings, showHistory, showBookmarks, isNewTab })
      window.browser.setAIActive(isSummarizing || !!summary || !!screenshot || !!readingContent || showSettings || showHistory || showBookmarks || isNewTab)
    } catch (err) {
      console.error('Failed to set AI active:', err)
    }
  }, [isSummarizing, summary, screenshot, readingContent, showSettings, showHistory, showBookmarks, isNewTab])

  useEffect(() => {
    try {
      document.body.setAttribute('data-theme', theme)
      window.browser.setTheme(theme)
    } catch (err) {
      console.error('Failed to set theme:', err)
    }
  }, [theme])

  useEffect(() => {
    try {
      window.browser.setPanelWidth(showPanel ? 300 : 0)
    } catch (err) {
      console.error('Failed to set panel width:', err)
    }
  }, [showPanel])

  useEffect(() => {
    // Restore session on startup
    const restoreSession = async () => {
      try {
        const savedSession = await window.browser.getSession()
        if (savedSession && savedSession.tabs && savedSession.tabs.length > 0) {
          setTabs(savedSession.tabs)
          // Recreate tabs in main process
          for (const tab of savedSession.tabs) {
            await window.browser.createTab(tab.id, tab.url)
            if (tab.active) await window.browser.switchTab(tab.id)
          }
        } else {
          // Initial tab creation if no session
          await window.browser.createTab('1', 'rapidsurf://newtab')
        }
      } catch (err) {
        console.error('Failed to restore session:', err)
        // Fallback to initial tab
        window.browser.createTab('1', 'rapidsurf://newtab')
      }
    }
    
    restoreSession()

    // Listen for scroll progress
    const unsubscribeScroll = window.browser.onScrollProgress((progress) => {
      setReadingProgress(progress)
    })

    // Listen for hover link events
    const unsubscribeHover = window.browser.onHoverLink((url) => {
      setHoveredUrl(url)
    })

    // Listen for updates from main process (title/url changes)
    const unsubscribeTabs = window.browser.onTabUpdated((data) => {
      setTabs(prev => prev.map(tab => {
        if (tab.id === data.id) {
          return { ...tab, ...data }
        }
        return tab
      }))
    })

    // Listen for history additions from main process
    const unsubscribeHistory = window.browser.onHistoryAdded((item) => {
      window.browser.addHistory(item)
    })

    return () => {
      unsubscribeScroll()
      unsubscribeHover()
      unsubscribeTabs()
      unsubscribeHistory()
    }
  }, [])

  const handleCreateTab = async () => {
    try {
      const newId = Math.random().toString(36).substr(2, 9)
      const newTab = { id: newId, title: 'New Tab', url: 'https://www.google.com', active: true, loading: false }
      
      setTabs(prev => prev.map(t => ({ ...t, active: false })).concat(newTab))
      await window.browser.createTab(newId, newTab.url)
    } catch (err) {
      console.error('Failed to create tab:', err)
    }
  }

  const handleSwitchTab = async (id: string) => {
    try {
      setTabs(prev => prev.map(t => ({ ...t, active: t.id === id })))
      await window.browser.switchTab(id)
    } catch (err) {
      console.error('Failed to switch tab:', err)
    }
  }

  const handleCloseTab = async (id: string) => {
    try {
      if (tabs.length === 1) return // Keep at least one tab
      
      const index = tabs.findIndex(t => t.id === id)
      const newTabs = tabs.filter(t => t.id !== id)
      
      if (tabs[index].active) {
        const nextTab = newTabs[Math.max(0, index - 1)]
        nextTab.active = true
        await window.browser.switchTab(nextTab.id)
      }
      
      setTabs(newTabs)
      await window.browser.closeTab(id)
    } catch (err) {
      console.error('Failed to close tab:', err)
    }
  }

  const handleSummarize = async () => {
    setIsSummarizing(true)
    setSummary(null)
    setScreenshot(null)
    try {
      const text = await window.browser.getTabText()
      const result = await window.browser.summarize(text)
      
      console.log('AI Summary Result:', result)
      setSummary(result)
      
      setShowPanel(false)
      await window.browser.setPanelWidth(0)
    } catch (error) {
      console.error('Summarization failed:', error)
      setSummary('Failed to summarize page content.')
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleScreenshot = async () => {
    try {
      const dataUrl = await window.browser.capturePage()
      if (dataUrl) {
        setScreenshot(dataUrl)
        setSummary(null)
        setReadingContent(null)
      }
    } catch (err) {
      console.error('Failed to capture screenshot:', err)
    }
  }

  const handleReadingMode = async () => {
    try {
      const text = await window.browser.getTabText()
      if (text) {
        setReadingContent(text)
        setSummary(null)
        setScreenshot(null)
      }
    } catch (err) {
      console.error('Failed to enter reading mode:', err)
    }
  }

  useEffect(() => {
    window.browser.saveSession({ tabs })
  }, [tabs])

  return (
    <div className="app-container">
      <div className="chrome-area">
        <TabBar 
          tabs={tabs} 
          onSwitch={handleSwitchTab} 
          onClose={handleCloseTab} 
          onCreate={handleCreateTab} 
        />
        <Navbar 
          url={activeTab?.url || ''} 
          theme={theme}
          loading={activeTab?.loading || false}
          onNavigate={(url) => window.browser.go(url)}
          onBack={() => window.browser.back()}
          onForward={() => window.browser.forward()}
          onReload={() => window.browser.reload()}
          onSummarize={handleSummarize}
          onTogglePanel={() => setShowPanel(!showPanel)}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          onToggleFind={() => setShowFind(!showFind)}
          onScreenshot={handleScreenshot}
          onReadingMode={handleReadingMode}
          onOpenSettings={() => setShowSettings(true)}
          onOpenHistory={() => setShowHistory(true)}
          onOpenBookmarks={() => setShowBookmarks(true)}
          pinnedIcons={pinnedIcons}
        />
        {showBookmarksBar && (
          <BookmarksBar onNavigate={(url) => window.browser.go(url)} />
        )}
      </div>
      
      {showFind && (
        <FindBar 
          onClose={() => setShowFind(false)} 
          rightOffset={showPanel ? 320 : 20}
        />
      )}

      {activeTab?.url !== 'rapidsurf://newtab' && activeTab?.url !== 'about:blank' && readingProgress > 0 && (
        <div className="reading-progress-container">
          <div className="reading-progress-bar" style={{ width: `${readingProgress}%` }} />
        </div>
      )}
      
      <div className="content-area">
        {/* BrowserViews are rendered here by the main process */}
        {(!activeTab || activeTab?.url === 'rapidsurf://newtab' || activeTab?.url === 'about:blank') && (
          <NewTabPage 
            onNavigate={(url) => window.browser.go(url)}
            theme={theme}
          />
        )}
      </div>

      {showHistory && (
        <HistoryManager 
          onClose={() => setShowHistory(false)}
          onNavigate={(url) => window.browser.go(url)}
        />
      )}

      {showBookmarks && (
        <BookmarksManager 
          onClose={() => setShowBookmarks(false)}
          onNavigate={(url) => window.browser.go(url)}
        />
      )}

      {hoveredUrl && (
        <div className="status-bar">
          <span>{hoveredUrl}</span>
        </div>
      )}

      {/* Overlays and Side Panels moved to top level */}
      {showPanel && (
        <SidePanel 
          onClose={() => {
            setShowPanel(false)
            window.browser.setPanelWidth(0)
          }} 
          onNavigate={(url) => {
            window.browser.go(url)
            setShowPanel(false)
            window.browser.setPanelWidth(0)
          }}
          currentUrl={activeTab?.url}
        />
      )}

      {(isSummarizing || summary) && (
        <div className="ai-overlay">
          <div className="ai-modal">
            <div className="ai-modal-header">
              <h3>AI Page Summary</h3>
              <button onClick={() => {
                setSummary(null)
                window.browser.setAIActive(false)
              }}>×</button>
            </div>
            <div className="ai-modal-body">
              {isSummarizing ? (
                <div className="loading-spinner">Analyzing page content...</div>
              ) : (
                <p>{summary}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {screenshot && (
        <div className="ai-overlay">
          <div className="ai-modal">
            <div className="ai-modal-header">
              <h3>Page Screenshot</h3>
              <button onClick={() => {
                setScreenshot(null)
                window.browser.setAIActive(false)
              }}>×</button>
            </div>
            <div className="ai-modal-body" style={{ padding: 0 }}>
              <img src={screenshot} style={{ width: '100%', height: 'auto', display: 'block' }} />
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                <button 
                  className="ai-btn" 
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = screenshot
                    link.download = `screenshot-${Date.now()}.png`
                    link.click()
                  }}
                >
                  Download Screenshot
                </button>
              </div>
            </div>
           </div>
         </div>
       )}

       {readingContent && (
          <div className="ai-overlay">
            <div className="ai-modal" style={{ maxWidth: '800px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div className="ai-modal-header">
                <h3>Reading Mode</h3>
                <button onClick={() => {
                  setReadingContent(null)
                  window.browser.setAIActive(false)
                }}>×</button>
              </div>
              <div className="ai-modal-body" style={{ overflowY: 'auto', padding: '40px', lineHeight: '1.6', fontSize: '18px', textAlign: 'left' }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {readingContent}
                </div>
              </div>
            </div>
          </div>
        )}

        {showSettings && (
           <SettingsPage 
             theme={theme}
             onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
             onClose={() => setShowSettings(false)}
             pinnedIcons={pinnedIcons}
             onTogglePin={(id) => {
               setPinnedIcons(prev => 
                 prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
               )
             }}
             onNavigate={(url) => {
               window.browser.go(url)
               setShowSettings(false)
             }}
             showBookmarksBar={showBookmarksBar}
             onToggleBookmarksBar={() => {
               const newValue = !showBookmarksBar
               setShowBookmarksBar(newValue)
               window.browser.setChromeHeight(38 + 42 + (newValue ? 32 : 0))
             }}
           />
         )}
      </div>
   )
 }

export default App
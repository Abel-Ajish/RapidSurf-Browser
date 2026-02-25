import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import TabBar from './components/TabBar'
import SidePanel from './components/SidePanel'

export interface Tab {
  id: string
  title: string
  url: string
  active: boolean
  loading: boolean
}

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: 'https://www.google.com', active: true, loading: false }
  ])
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    window.browser.setAIActive(isSummarizing || !!summary)
  }, [isSummarizing, summary])

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    window.browser.setTheme(theme)
  }, [theme])

  useEffect(() => {
    window.browser.setPanelWidth(showPanel ? 300 : 0)
  }, [showPanel])

  useEffect(() => {
    // Initial tab creation in main process
    window.browser.createTab('1', 'https://www.google.com')

    // Listen for updates from main process (title/url changes)
    window.browser.onTabUpdated((data) => {
      setTabs(prev => prev.map(tab => {
        if (tab.id === data.id) {
          return { ...tab, ...data }
        }
        return tab
      }))
    })

    // Listen for history additions from main process
    // @ts-ignore
    window.electron.ipcRenderer.on('history:add', (_, item) => {
      window.browser.addHistory(item)
    })
  }, [])

  const handleCreateTab = () => {
    const newId = Math.random().toString(36).substr(2, 9)
    const newTab = { id: newId, title: 'New Tab', url: 'https://www.google.com', active: true, loading: false }
    
    setTabs(prev => prev.map(t => ({ ...t, active: false })).concat(newTab))
    window.browser.createTab(newId, newTab.url)
  }

  const handleSwitchTab = (id: string) => {
    setTabs(prev => prev.map(t => ({ ...t, active: t.id === id })))
    window.browser.switchTab(id)
  }

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) return // Keep at least one tab
    
    const index = tabs.findIndex(t => t.id === id)
    const newTabs = tabs.filter(t => t.id !== id)
    
    if (tabs[index].active) {
      const nextTab = newTabs[Math.max(0, index - 1)]
      nextTab.active = true
      window.browser.switchTab(nextTab.id)
    }
    
    setTabs(newTabs)
    window.browser.closeTab(id)
  }

  const handleSummarize = async () => {
    setIsSummarizing(true)
    setSummary(null)
    try {
      const text = await window.browser.getTabText()
      const result = await window.browser.summarize(text)
      
      // If the summary is still not visible, we'll log it to confirm IPC works
      console.log('AI Summary Result:', result)
      
      setSummary(result)
      
      // FORCE VISIBILITY: Ensure the panel is closed so summary has full focus
      setShowPanel(false)
      window.browser.setPanelWidth(0)
      
    } catch (error) {
      console.error('Summarization failed:', error)
      setSummary('Failed to summarize page content.')
    } finally {
      setIsSummarizing(false)
    }
  }

  const activeTab = tabs.find(t => t.active)

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
        />
      </div>
      
      <div className="content-area">
        {/* BrowserViews are rendered here by the main process */}
      </div>

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
    </div>
  )
}

export default App
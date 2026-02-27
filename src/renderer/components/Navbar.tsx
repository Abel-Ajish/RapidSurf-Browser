import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, RotateCw, Home, Sparkles, Menu, Moon, Sun, Search, Camera, BookOpen, Settings, Clock, Shield, Globe, Star } from 'lucide-react'

interface NavbarProps {
  url: string
  theme: 'light' | 'dark'
  loading: boolean
  onNavigate: (url: string) => void
  onBack: () => void
  onForward: () => void
  onReload: () => void
  onSummarize: () => void
  onTogglePanel: () => void
  onToggleTheme: () => void
  onToggleFind: () => void
  onScreenshot: () => void
  onReadingMode: () => void
  onOpenSettings: () => void
  onOpenHistory: () => void
  onOpenBookmarks: () => void
  pinnedIcons: string[]
}

const Navbar: React.FC<NavbarProps> = ({ 
  url, 
  theme,
  loading,
  onNavigate, 
  onBack, 
  onForward, 
  onReload, 
  onSummarize, 
  onTogglePanel,
  onToggleTheme,
  onToggleFind,
  onScreenshot,
  onReadingMode,
  onOpenSettings,
  onOpenHistory,
  onOpenBookmarks,
  pinnedIcons
}) => {
  const [inputUrl, setInputUrl] = useState(url === 'rapidsurf://newtab' ? '' : url)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    setInputUrl(url === 'rapidsurf://newtab' ? '' : url)
    checkBookmark()
  }, [url])

  const checkBookmark = async () => {
    try {
      const bms = await window.browser.getBookmarks()
      setIsBookmarked(Array.isArray(bms) && bms.some((bm: any) => bm.url === url))
    } catch (err) {
      console.error('Failed to check bookmark:', err)
    }
  }

  const handleToggleBookmark = async () => {
    try {
      const bms = await window.browser.getBookmarks()
      const currentBms = Array.isArray(bms) ? bms : []
      if (isBookmarked) {
        const newBms = currentBms.filter((bm: any) => bm.url !== url)
        await window.browser.saveBookmarks(newBms)
      } else {
        const title = await window.browser.getTabText().then(text => text.split('\n')[0].substring(0, 50) || url)
        const newBm = { id: Math.random().toString(36).substr(2, 9), title, url }
        await window.browser.saveBookmarks([...currentBms, newBm])
      }
      setIsBookmarked(!isBookmarked)
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNavigate(inputUrl)
  }

  return (
    <div className="navbar">
      <div className="loading-progress-container">
        {loading && <div className="loading-progress-bar"></div>}
      </div>
      <div className="nav-buttons" role="toolbar" aria-label="Navigation">
        <button className="nav-btn" onClick={onBack} title="Back" aria-label="Go back"><ArrowLeft size={16} /></button>
        <button className="nav-btn" onClick={onForward} title="Forward" aria-label="Go forward"><ArrowRight size={16} /></button>
        <button className="nav-btn" onClick={onReload} title="Reload" aria-label="Reload page"><RotateCw size={16} /></button>
        <button className="nav-btn" onClick={() => onNavigate('rapidsurf://newtab')} title="Home" aria-label="Go home"><Home size={16} /></button>
      </div>
      <form className="url-bar" onSubmit={handleSubmit} role="search">
        <div className="url-bar-icon" aria-hidden="true">
          {url.startsWith('https') ? <Shield size={14} color="#10b981" /> : <Globe size={14} opacity={0.5} />}
        </div>
        <input 
          className="url-input" 
          value={inputUrl} 
          placeholder="Search or enter URL"
          aria-label="Address bar"
          onChange={(e) => setInputUrl(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
        {url !== 'rapidsurf://newtab' && url !== 'about:blank' && (
          <button 
            className="nav-btn" 
            onClick={handleToggleBookmark} 
            style={{ color: isBookmarked ? '#f59e0b' : 'inherit' }}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Star size={16} fill={isBookmarked ? '#f59e0b' : 'none'} />
          </button>
        )}
      </form>
      <div className="nav-actions" role="toolbar" aria-label="Tools">
        {pinnedIcons.includes('bookmarks') && (
          <button className="nav-btn" onClick={onOpenBookmarks} title="Bookmarks" aria-label="View bookmarks">
            <Star size={16} />
          </button>
        )}
        {pinnedIcons.includes('history') && (
          <button className="nav-btn" onClick={onOpenHistory} title="History" aria-label="View history">
            <Clock size={16} />
          </button>
        )}
        {pinnedIcons.includes('find') && (
          <button className="nav-btn" onClick={onToggleFind} title="Find in Page" aria-label="Find in page">
            <Search size={16} />
          </button>
        )}
        {pinnedIcons.includes('screenshot') && (
          <button className="nav-btn" onClick={onScreenshot} title="Capture Screenshot" aria-label="Capture screenshot">
            <Camera size={16} />
          </button>
        )}
        {pinnedIcons.includes('reading') && (
          <button className="nav-btn" onClick={onReadingMode} title="Reading Mode" aria-label="Reading mode">
            <BookOpen size={16} />
          </button>
        )}
        {pinnedIcons.includes('summarize') && (
          <button className="nav-btn ai-btn" onClick={onSummarize} title="Summarize Page" aria-label="Summarize page with AI">
            <Sparkles size={16} />
          </button>
        )}
        {pinnedIcons.includes('panel') && (
          <button className="nav-btn" onClick={onTogglePanel} title="History & Bookmarks" aria-label="Open side panel">
            <Menu size={16} />
          </button>
        )}
        {pinnedIcons.includes('theme') && (
          <button className="nav-btn" onClick={onToggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        )}
        {pinnedIcons.includes('settings') && (
          <button className="nav-btn" onClick={onOpenSettings} title="Settings" aria-label="Open settings">
            <Settings size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar
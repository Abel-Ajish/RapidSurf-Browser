import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, RotateCw, Home, Sparkles, Menu, Moon, Sun, Search, Camera, BookOpen, Settings, Clock, Shield, Globe } from 'lucide-react'

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
    const bms = await window.browser.getBookmarks()
    setIsBookmarked(bms.some((bm: any) => bm.url === url))
  }

  const handleToggleBookmark = async () => {
    const bms = await window.browser.getBookmarks()
    if (isBookmarked) {
      const newBms = bms.filter((bm: any) => bm.url !== url)
      await window.browser.saveBookmarks(newBms)
    } else {
      const title = await window.browser.getTabText().then(text => text.split('\n')[0].substring(0, 50) || url)
      const newBm = { id: Math.random().toString(36).substr(2, 9), title, url }
      await window.browser.saveBookmarks([...bms, newBm])
    }
    setIsBookmarked(!isBookmarked)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNavigate(inputUrl)
  }

  return (
    <div className="navbar">
      {loading && <div className="loading-progress"></div>}
      <div className="nav-buttons">
        <div className="nav-btn" onClick={onBack} title="Back"><ArrowLeft size={16} /></div>
        <div className="nav-btn" onClick={onForward} title="Forward"><ArrowRight size={16} /></div>
        <div className="nav-btn" onClick={onReload} title="Reload"><RotateCw size={16} /></div>
        <div className="nav-btn" onClick={() => onNavigate('rapidsurf://newtab')} title="Home"><Home size={16} /></div>
      </div>
      <form className="url-bar" onSubmit={handleSubmit}>
        <div className="url-bar-icon">
          {url.startsWith('https') ? <Shield size={14} color="#10b981" /> : <Globe size={14} opacity={0.5} />}
        </div>
        <input 
          className="url-input" 
          value={inputUrl} 
          placeholder="Search or enter URL"
          onChange={(e) => setInputUrl(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
        {url !== 'rapidsurf://newtab' && url !== 'about:blank' && (
          <div className="nav-btn" onClick={handleToggleBookmark} style={{ color: isBookmarked ? '#f59e0b' : 'inherit' }}>
            <Star size={16} fill={isBookmarked ? '#f59e0b' : 'none'} />
          </div>
        )}
      </form>
      <div className="nav-actions">
        {pinnedIcons.includes('bookmarks') && (
          <div className="nav-btn" onClick={onOpenBookmarks} title="Bookmarks">
            <Star size={16} />
          </div>
        )}
        {pinnedIcons.includes('history') && (
          <div className="nav-btn" onClick={onOpenHistory} title="History">
            <Clock size={16} />
          </div>
        )}
        {pinnedIcons.includes('find') && (
          <div className="nav-btn" onClick={onToggleFind} title="Find in Page">
            <Search size={16} />
          </div>
        )}
        {pinnedIcons.includes('screenshot') && (
          <div className="nav-btn" onClick={onScreenshot} title="Capture Screenshot">
            <Camera size={16} />
          </div>
        )}
        {pinnedIcons.includes('reading') && (
          <div className="nav-btn" onClick={onReadingMode} title="Reading Mode">
            <BookOpen size={16} />
          </div>
        )}
        {pinnedIcons.includes('summarize') && (
          <div className="nav-btn ai-btn" onClick={onSummarize} title="Summarize Page">
            <Sparkles size={16} />
          </div>
        )}
        {pinnedIcons.includes('panel') && (
          <div className="nav-btn" onClick={onTogglePanel} title="History & Bookmarks">
            <Menu size={16} />
          </div>
        )}
        {pinnedIcons.includes('theme') && (
          <div className="nav-btn" onClick={onToggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </div>
        )}
        {pinnedIcons.includes('settings') && (
          <div className="nav-btn" onClick={onOpenSettings} title="Settings">
            <Settings size={16} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
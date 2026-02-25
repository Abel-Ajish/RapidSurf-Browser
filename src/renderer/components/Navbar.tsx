import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, RotateCw, Home, Sparkles, Menu, Moon, Sun } from 'lucide-react'

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
  onToggleTheme
}) => {
  const [inputUrl, setInputUrl] = useState(url)

  useEffect(() => {
    setInputUrl(url)
  }, [url])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNavigate(inputUrl)
  }

  return (
    <div className="navbar">
      {loading && <div className="loading-progress"></div>}
      <div className="nav-buttons">
        <div className="nav-btn" onClick={onBack}><ArrowLeft size={16} /></div>
        <div className="nav-btn" onClick={onForward}><ArrowRight size={16} /></div>
        <div className="nav-btn" onClick={onReload}><RotateCw size={16} /></div>
        <div className="nav-btn" onClick={() => onNavigate('https://www.google.com')}><Home size={16} /></div>
      </div>
      <form className="url-bar" onSubmit={handleSubmit}>
        <input 
          className="url-input" 
          value={inputUrl} 
          onChange={(e) => setInputUrl(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
      </form>
      <div className="nav-actions">
        <div className="nav-btn ai-btn" onClick={onSummarize} title="Summarize Page">
          <Sparkles size={16} />
        </div>
        <div className="nav-btn" onClick={onTogglePanel} title="History & Bookmarks">
          <Menu size={16} />
        </div>
        <div className="nav-btn" onClick={onToggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </div>
      </div>
    </div>
  )
}

export default Navbar
import React, { useState, useEffect } from 'react'
import { Search, Globe, Clock, Star, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react'

interface QuickLink {
  id: string
  title: string
  url: string
  icon?: string
}

interface NewTabPageProps {
  onNavigate: (url: string) => void
  theme: 'light' | 'dark'
}

const NewTabPage: React.FC<NewTabPageProps> = ({ onNavigate, theme }) => {
  const [query, setQuery] = useState('')
  const [recentHistory, setRecentHistory] = useState<any[]>([])
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [greeting, setGreeting] = useState('')

  const quickLinks: QuickLink[] = [
    { id: '1', title: 'Google', url: 'https://www.google.com' },
    { id: '2', title: 'YouTube', url: 'https://www.youtube.com' },
    { id: '3', title: 'GitHub', url: 'https://www.github.com' },
    { id: '4', title: 'Reddit', url: 'https://www.reddit.com' },
    { id: '5', title: 'Twitter', url: 'https://www.twitter.com' },
    { id: '6', title: 'Wikipedia', url: 'https://www.wikipedia.org' },
  ]

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    loadData()
  }, [])

  const loadData = async () => {
    const history = await window.browser.getHistory()
    setRecentHistory(history.slice(0, 6))
    const bms = await window.browser.getBookmarks()
    setBookmarks(bms.slice(0, 6))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    if (query.includes('.') && !query.includes(' ')) {
      onNavigate(query.startsWith('http') ? query : `https://${query}`)
    } else {
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="new-tab-page">
      <div className="ntp-content">
        <div className="ntp-header">
          <div className="ntp-logo">
            <Zap size={48} className="ntp-logo-icon" />
            <h1>RapidSurf</h1>
          </div>
          <h2 className="ntp-greeting">{greeting}</h2>
        </div>

        <form className="ntp-search-container" onSubmit={handleSearch}>
          <Search className="ntp-search-icon" size={20} />
          <input
            type="text"
            placeholder="Search the web or enter URL"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit">
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="ntp-grid">
          <section className="ntp-section">
            <h3><Globe size={18} /> Quick Links</h3>
            <div className="ntp-links-grid">
              {quickLinks.map(link => (
                <button key={link.id} className="ntp-link-card" onClick={() => onNavigate(link.url)}>
                  <div className="ntp-link-icon">
                    {link.title[0].toUpperCase()}
                  </div>
                  <span>{link.title}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="ntp-row">
            <section className="ntp-section half">
              <h3><Clock size={18} /> Recent History</h3>
              <div className="ntp-list">
                {recentHistory.length > 0 ? recentHistory.map((item, i) => (
                  <button key={i} className="ntp-list-item" onClick={() => onNavigate(item.url)}>
                    <Clock size={14} />
                    <span className="ntp-item-title">{item.title || item.url}</span>
                  </button>
                )) : (
                  <p className="ntp-empty">No history yet</p>
                )}
              </div>
            </section>

            <section className="ntp-section half">
              <h3><Star size={18} /> Bookmarks</h3>
              <div className="ntp-list">
                {bookmarks.length > 0 ? bookmarks.map((item, i) => (
                  <button key={i} className="ntp-list-item" onClick={() => onNavigate(item.url)}>
                    <Star size={14} />
                    <span className="ntp-item-title">{item.title}</span>
                  </button>
                )) : (
                  <p className="ntp-empty">No bookmarks yet</p>
                )}
              </div>
            </section>
          </div>

          <section className="ntp-section promo">
            <div className="ntp-promo-card">
              <div className="ntp-promo-icon">
                <Sparkles size={24} />
              </div>
              <div className="ntp-promo-text">
                <h4>AI-Powered Browsing</h4>
                <p>Use the summarize feature to quickly understand long articles.</p>
              </div>
            </div>
            <div className="ntp-promo-card">
              <div className="ntp-promo-icon">
                <Shield size={24} />
              </div>
              <div className="ntp-promo-text">
                <h4>Privacy First</h4>
                <p>RapidSurf keeps your data local and provides advanced privacy controls.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <div className="ntp-footer">
        <p>© 2026 RapidSurf Browser • Built for speed and privacy</p>
      </div>
    </div>
  )
}

export default NewTabPage

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
}

const NewTabPage: React.FC<NewTabPageProps> = ({ onNavigate }) => {
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
    try {
      const history = await window.browser.getHistory()
      setRecentHistory(Array.isArray(history) ? history.slice(0, 6) : [])
      const bms = await window.browser.getBookmarks()
      setBookmarks(Array.isArray(bms) ? bms.slice(0, 6) : [])
    } catch (err) {
      console.error('Failed to load NTP data:', err)
      setRecentHistory([])
      setBookmarks([])
    }
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
      <div className="ntp-background-gradient"></div>
      <div className="ntp-content">
        <div className="ntp-header">
          <div className="ntp-logo">
            <div className="ntp-logo-wrapper">
              <Zap size={40} className="ntp-logo-icon" />
            </div>
            <h1>RapidSurf</h1>
          </div>
          <div className="ntp-greeting-container">
            <h2 className="ntp-greeting">{greeting}</h2>
            <p className="ntp-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="ntp-search-wrapper">
          <form className="ntp-search-container" onSubmit={handleSearch}>
            <Search className="ntp-search-icon" size={22} />
            <input
              type="text"
              placeholder="Search the web or enter URL"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="ntp-search-submit">
              <ArrowRight size={22} />
            </button>
          </form>
        </div>

        <div className="ntp-main-grid">
          <section className="ntp-section quick-links-section">
            <div className="ntp-section-header">
              <h3><Globe size={16} /> Quick Links</h3>
            </div>
            <div className="ntp-links-grid">
              {quickLinks.map(link => (
                <button key={link.id} className="ntp-link-card" onClick={() => onNavigate(link.url)}>
                  <div className="ntp-link-icon-wrapper">
                    <div className="ntp-link-icon">
                      {link.title[0].toUpperCase()}
                    </div>
                  </div>
                  <span className="ntp-link-title">{link.title}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="ntp-side-grid">
            <section className="ntp-section glass-card">
              <div className="ntp-section-header">
                <h3><Clock size={16} /> Recent Activity</h3>
              </div>
              <div className="ntp-list">
                {recentHistory.length > 0 ? recentHistory.map((item, i) => (
                  <button key={i} className="ntp-list-item" onClick={() => onNavigate(item.url)}>
                    <div className="ntp-item-icon"><Clock size={12} /></div>
                    <span className="ntp-item-title">{item.title || item.url}</span>
                  </button>
                )) : (
                  <div className="ntp-empty">
                    <Clock size={32} />
                    <p>Your history will appear here</p>
                  </div>
                )}
              </div>
            </section>

            <section className="ntp-section glass-card">
              <div className="ntp-section-header">
                <h3><Star size={16} /> Favorites</h3>
              </div>
              <div className="ntp-list">
                {bookmarks.length > 0 ? bookmarks.map((item, i) => (
                  <button key={i} className="ntp-list-item" onClick={() => onNavigate(item.url)}>
                    <div className="ntp-item-icon favorite"><Star size={12} /></div>
                    <span className="ntp-item-title">{item.title}</span>
                  </button>
                )) : (
                  <div className="ntp-empty">
                    <Star size={32} />
                    <p>No bookmarks yet</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="ntp-features">
          <div className="ntp-feature-card">
            <Sparkles size={20} />
            <div className="ntp-feature-info">
              <h4>Smart Summary</h4>
              <p>AI-powered page analysis</p>
            </div>
          </div>
          <div className="ntp-feature-card">
            <Shield size={20} />
            <div className="ntp-feature-info">
              <h4>Private Mode</h4>
              <p>Your data stays on your device</p>
            </div>
          </div>
          <div className="ntp-feature-card">
            <Zap size={20} />
            <div className="ntp-feature-info">
              <h4>Turbo Speed</h4>
              <p>Optimized for performance</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="ntp-footer">
        <div className="ntp-footer-content">
          <span>RapidSurf v1.3.0</span>
          <span className="ntp-footer-dot">•</span>
          <span>Built for Speed & Privacy</span>
        </div>
      </div>
    </div>
  )
}

export default NewTabPage

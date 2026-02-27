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
import { Star, Trash2, Search, ExternalLink, X } from 'lucide-react'

interface Bookmark {
  id: string
  title: string
  url: string
  folder?: string
}

interface BookmarksManagerProps {
  onClose: () => void
  onNavigate: (url: string) => void
}

const BookmarksManager: React.FC<BookmarksManagerProps> = ({ onClose, onNavigate }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = async () => {
    setLoading(true)
    try {
      const data = await window.browser.getBookmarks()
      setBookmarks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load bookmarks:', err)
      setBookmarks([])
    }
    setLoading(false)
  }

  const handleDeleteBookmark = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const newBookmarks = bookmarks.filter(bm => bm.id !== id)
    setBookmarks(newBookmarks)
    await window.browser.saveBookmarks(newBookmarks)
  }

  const filteredBookmarks = bookmarks.filter(bm => 
    bm.title?.toLowerCase().includes(search.toLowerCase()) || 
    bm.url.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="history-overlay">
      <div className="history-header">
        <div className="history-title">
          <Star size={28} color="#f59e0b" fill="#f59e0b" />
          <h2>Bookmarks</h2>
        </div>
        
        <div className="history-actions">
          <div className="find-bar-input-container">
            <Search size={16} className="find-icon" />
            <input 
              type="text" 
              placeholder="Search bookmarks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="history-action-btn close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="history-content">
        {loading ? (
          <div className="ntp-empty">Loading bookmarks...</div>
        ) : filteredBookmarks.length > 0 ? (
          filteredBookmarks.map((bm, i) => (
            <div key={i} className="history-item" onClick={() => {
              onNavigate(bm.url)
              onClose()
            }}>
              <div className="ntp-link-icon" style={{ width: '32px', height: '32px', fontSize: '14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                {bm.title ? bm.title[0].toUpperCase() : 'B'}
              </div>
              <div className="history-item-info">
                <span className="history-item-title">{bm.title || 'Untitled'}</span>
                <span className="history-item-url">{bm.url}</span>
              </div>
              <button className="history-item-delete" onClick={(e) => handleDeleteBookmark(e, bm.id)}>
                <Trash2 size={14} />
              </button>
              <ExternalLink size={14} style={{ opacity: 0.3 }} />
            </div>
          ))
        ) : (
          <div className="ntp-empty">
            {search ? 'No matches found' : 'Your bookmarks will appear here'}
            <div style={{ marginTop: '20px' }}>
              <button className="ai-btn" onClick={() => onNavigate('https://www.google.com')}>
                Browse the web to add bookmarks
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookmarksManager

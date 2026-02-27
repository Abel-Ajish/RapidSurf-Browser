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
import { Globe, MoreHorizontal } from 'lucide-react'

interface Bookmark {
  id: string
  title: string
  url: string
  folder?: string
}

interface BookmarksBarProps {
  onNavigate: (url: string) => void
}

const BookmarksBar: React.FC<BookmarksBarProps> = ({ onNavigate }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    loadBookmarks()
    
    // Listen for real-time updates from main process
    const unsubscribe = window.browser.onBookmarksUpdated((updatedBookmarks) => {
      setBookmarks(Array.isArray(updatedBookmarks) ? updatedBookmarks.slice(0, 12) : [])
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const loadBookmarks = async () => {
    try {
      const data = await window.browser.getBookmarks()
      setBookmarks(Array.isArray(data) ? data.slice(0, 12) : [])
    } catch (err) {
      console.error('Failed to load bookmarks bar:', err)
    }
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="bookmarks-bar">
        <div className="bookmarks-list-horizontal">
          <div className="ntp-empty" style={{ padding: '0 8px', fontSize: '11px', opacity: 0.6 }}>No bookmarks yet. Click the star in the address bar to add one!</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bookmarks-bar">
      <div className="bookmarks-list-horizontal">
        {bookmarks.map((bm) => (
          <button key={bm.id} className="bookmark-item-mini" onClick={() => onNavigate(bm.url)}>
            <Globe size={12} className="bm-icon" />
            <span className="bm-title">{bm.title}</span>
          </button>
        ))}
      </div>
      <button className="bm-more-btn">
        <MoreHorizontal size={14} />
      </button>
    </div>
  )
}

export default BookmarksBar

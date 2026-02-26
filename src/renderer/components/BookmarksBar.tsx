import React, { useState, useEffect } from 'react'
import { Star, Folder, Globe, MoreHorizontal } from 'lucide-react'

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
    // Listen for storage changes if needed, but for now we'll just reload on mount
  }, [])

  const loadBookmarks = async () => {
    try {
      const data = await window.browser.getBookmarks()
      setBookmarks(Array.isArray(data) ? data.slice(0, 12) : [])
    } catch (err) {
      console.error('Failed to load bookmarks bar:', err)
    }
  }

  if (bookmarks.length === 0) return null

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

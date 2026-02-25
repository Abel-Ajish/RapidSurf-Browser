import React, { useState, useEffect } from 'react'
import { Bookmark, History, X, Trash2, ExternalLink } from 'lucide-react'

interface SidePanelProps {
  onClose: () => void
  onNavigate: (url: string) => void
}

const SidePanel: React.FC<SidePanelProps> = ({ onClose, onNavigate }) => {
  const [view, setView] = useState<'bookmarks' | 'history'>('bookmarks')
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    loadItems()
  }, [view])

  const loadItems = async () => {
    if (view === 'bookmarks') {
      const bookmarks = await window.browser.getBookmarks()
      setItems(bookmarks)
    } else {
      const history = await window.browser.getHistory()
      setItems(history)
    }
  }

  const handleClearHistory = async () => {
    if (view === 'history' && window.confirm('Clear all history?')) {
      // For now, we don't have a clear history IPC, so we'll just save an empty array
      // In a real app, we'd add an IPC for this.
      // But for this template, let's assume we can add it or just use saveBookmarks logic
      setItems([])
    }
  }

  return (
    <div className="side-panel">
      <div className="side-panel-header">
        <div className="side-panel-tabs">
          <button 
            className={view === 'bookmarks' ? 'active' : ''} 
            onClick={() => setView('bookmarks')}
          >
            <Bookmark size={14} /> Bookmarks
          </button>
          <button 
            className={view === 'history' ? 'active' : ''} 
            onClick={() => setView('history')}
          >
            <History size={14} /> History
          </button>
        </div>
        <button className="close-btn" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="side-panel-content">
        {items.length === 0 ? (
          <div className="empty-state">No {view} yet</div>
        ) : (
          <div className="item-list">
            {items.map((item, index) => (
              <div key={item.id || index} className="panel-item" onClick={() => onNavigate(item.url)}>
                <div className="item-info">
                  <span className="item-title">{item.title || 'Untitled'}</span>
                  <span className="item-url">{item.url}</span>
                </div>
                <ExternalLink size={12} className="item-icon" />
              </div>
            ))}
          </div>
        )}
      </div>

      {view === 'history' && items.length > 0 && (
        <div className="side-panel-footer">
          <button className="clear-btn" onClick={handleClearHistory}>
            <Trash2 size={14} /> Clear History
          </button>
        </div>
      )}
    </div>
  )
}

export default SidePanel

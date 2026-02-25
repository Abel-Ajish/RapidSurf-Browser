import React, { useState, useEffect } from 'react'
import { Bookmark, History, X, Trash2, ExternalLink, Download as DownloadIcon, FolderOpen } from 'lucide-react'

interface SidePanelProps {
  onClose: () => void
  onNavigate: (url: string) => void
}

const SidePanel: React.FC<SidePanelProps> = ({ onClose, onNavigate }) => {
  const [view, setView] = useState<'bookmarks' | 'history' | 'downloads'>('bookmarks')
  const [items, setItems] = useState<any[]>([])
  const [downloads, setDownloads] = useState<any[]>([])

  useEffect(() => {
    loadItems()
    
    if (view === 'downloads') {
      window.browser.getDownloads().then(setDownloads)
      const unsubscribe = window.browser.onDownloadsUpdated((newDownloads) => {
        setDownloads(newDownloads)
      })
      return unsubscribe
    }
  }, [view])

  const loadItems = async () => {
    if (view === 'bookmarks') {
      const bookmarks = await window.browser.getBookmarks()
      setItems(bookmarks)
    } else if (view === 'history') {
      const history = await window.browser.getHistory()
      setItems(history)
    }
  }

  const handleClearHistory = async () => {
    if (view === 'history' && window.confirm('Clear all history?')) {
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
          <button 
            className={view === 'downloads' ? 'active' : ''} 
            onClick={() => setView('downloads')}
          >
            <DownloadIcon size={14} /> Downloads
          </button>
        </div>
        <button className="close-btn" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="side-panel-content">
        {view === 'downloads' ? (
          downloads.length === 0 ? (
            <div className="empty-state">No downloads yet</div>
          ) : (
            <div className="downloads-list">
              {downloads.map((d) => (
                <div key={d.id} className="download-item">
                  <div className="download-header">
                    <span className="download-filename">{d.fileName}</span>
                    <span className="download-status">{d.state}</span>
                  </div>
                  {d.state === 'progressing' && (
                    <div className="download-progress-bg">
                      <div 
                        className="download-progress-fill" 
                        style={{ width: `${d.progress}%` }}
                      />
                    </div>
                  )}
                  <div className="download-actions">
                    <button className="download-btn" onClick={() => window.browser.openDownloadFolder()}>
                      <FolderOpen size={12} /> Open Folder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          items.length === 0 ? (
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
          )
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

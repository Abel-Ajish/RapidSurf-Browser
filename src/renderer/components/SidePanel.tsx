import React, { useState, useEffect } from 'react'
import { Bookmark, History, X, Trash2, ExternalLink, Download as DownloadIcon, FolderOpen, FileText, Plus, Save } from 'lucide-react'

interface SidePanelProps {
  onClose: () => void
  onNavigate: (url: string) => void
  currentUrl?: string
}

const SidePanel: React.FC<SidePanelProps> = ({ onClose, onNavigate, currentUrl }) => {
  const [view, setView] = useState<'bookmarks' | 'history' | 'downloads' | 'notes'>('bookmarks')
  const [items, setItems] = useState<any[]>([])
  const [downloads, setDownloads] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [currentNote, setCurrentNote] = useState('')

  useEffect(() => {
    loadItems()
    
    if (view === 'downloads') {
      window.browser.getDownloads().then(setDownloads)
      const unsubscribe = window.browser.onDownloadsUpdated((newDownloads) => {
        setDownloads(newDownloads)
      })
      return unsubscribe
    }

    if (view === 'notes') {
      loadNotes()
    }
  }, [view])

  const loadItems = async () => {
    try {
      if (view === 'bookmarks') {
        const bookmarks = await window.browser.getBookmarks()
        setItems(Array.isArray(bookmarks) ? bookmarks : [])
      } else if (view === 'history') {
        const history = await window.browser.getHistory()
        setItems(Array.isArray(history) ? history : [])
      }
    } catch (err) {
      console.error(`Failed to load ${view}:`, err)
      setItems([])
    }
  }

  const loadNotes = async () => {
    try {
      const storedNotes = localStorage.getItem('rapidsurf-notes')
      if (storedNotes) setNotes(JSON.parse(storedNotes))
    } catch (err) {
      console.error('Failed to load notes:', err)
      setNotes([])
    }
  }

  const handleSaveNote = () => {
    if (!currentNote.trim()) return
    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      content: currentNote,
      url: currentUrl,
      timestamp: Date.now()
    }
    const newNotes = [newNote, ...notes]
    setNotes(newNotes)
    localStorage.setItem('rapidsurf-notes', JSON.stringify(newNotes))
    setCurrentNote('')
  }

  const handleDeleteNote = (id: string) => {
    const newNotes = notes.filter(n => n.id !== id)
    setNotes(newNotes)
    localStorage.setItem('rapidsurf-notes', JSON.stringify(newNotes))
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
          <button 
            className={view === 'notes' ? 'active' : ''} 
            onClick={() => setView('notes')}
          >
            <FileText size={14} /> Notes
          </button>
        </div>
        <button className="close-btn" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="side-panel-content">
        {view === 'notes' ? (
          <div className="notes-container">
            <div className="note-input-area">
              <textarea 
                placeholder="Take a note for this page..." 
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
              />
              <button className="ai-btn" onClick={handleSaveNote} disabled={!currentNote.trim()}>
                <Plus size={14} /> Add Note
              </button>
            </div>
            <div className="notes-list">
              {notes.length === 0 ? (
                <div className="empty-state">No notes saved yet</div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="note-item">
                    <div className="note-header">
                      <span className="note-date">{new Date(note.timestamp).toLocaleDateString()}</span>
                      <button className="delete-btn" onClick={() => handleDeleteNote(note.id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="note-content">{note.content}</p>
                    {note.url && (
                      <button className="note-url" onClick={() => onNavigate(note.url)}>
                        <ExternalLink size={10} /> {new URL(note.url).hostname}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : view === 'downloads' ? (
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

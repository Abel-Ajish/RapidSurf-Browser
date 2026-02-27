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
import { Clock, Trash2, Search, ExternalLink, X } from 'lucide-react'

interface HistoryItem {
  id: string
  title: string
  url: string
  timestamp: number
}

interface HistoryManagerProps {
  onClose: () => void
  onNavigate: (url: string) => void
}

const HistoryManager: React.FC<HistoryManagerProps> = ({ onClose, onNavigate }) => {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await window.browser.getHistory()
      setHistory(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load history:', err)
      setHistory([])
    }
    setLoading(false)
  }

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all history?')) {
      await window.browser.clearBrowsingData({ history: true })
      setHistory([])
    }
  }

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const newHistory = history.filter(item => item.id !== id)
    setHistory(newHistory)
    // We don't have a specific delete-history-item IPC yet, but we can overwrite the whole thing
    // or just leave it for now as this is a "view"
  }

  const filteredHistory = history.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) || 
    item.url.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="history-overlay">
      <div className="history-header">
        <div className="history-title">
          <Clock size={28} color="#3b82f6" />
          <h2>History</h2>
        </div>
        
        <div className="history-actions">
          <div className="find-bar-input-container">
            <Search size={16} className="find-icon" />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="history-action-btn danger" onClick={handleClearHistory}>
            <Trash2 size={16} /> Clear All
          </button>
          <button className="history-action-btn close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="history-content">
        {loading ? (
          <div className="ntp-empty">Loading history...</div>
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((item, i) => (
            <div key={i} className="history-item" onClick={() => {
              onNavigate(item.url)
              onClose()
            }}>
              <div className="ntp-link-icon" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                {item.title ? item.title[0].toUpperCase() : 'U'}
              </div>
              <div className="history-item-info">
                <span className="history-item-title">{item.title || 'Untitled'}</span>
                <span className="history-item-url">{item.url}</span>
              </div>
              <span className="history-item-time">{formatTime(item.timestamp)}</span>
              <button className="history-item-delete" onClick={(e) => handleDeleteItem(e, item.id)}>
                <Trash2 size={14} />
              </button>
              <ExternalLink size={14} style={{ opacity: 0.3 }} />
            </div>
          ))
        ) : (
          <div className="ntp-empty">
            {search ? 'No matches found' : 'Your browsing history will appear here'}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryManager

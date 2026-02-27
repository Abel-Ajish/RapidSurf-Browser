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

import React, { useState, useEffect, useRef } from 'react'
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react'

interface FindBarProps {
  onClose: () => void
  rightOffset?: number
}

const FindBar: React.FC<FindBarProps> = ({ onClose, rightOffset = 20 }) => {
  const [text, setText] = useState('')
  const [result, setResult] = useState({ matches: 0, activeMatchOrdinal: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    
    const unsubscribe = window.browser.onFindResult((res) => {
      setResult(res)
    })

    return () => {
      unsubscribe()
      window.browser.stopFindInPage('clearSelection')
    }
  }, [])

  const handleFind = (next: boolean = true) => {
    if (!text) return
    window.browser.findInPage(text, { forward: next, findNext: true })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFind(!e.shiftKey)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    if (text) {
      window.browser.findInPage(text, { forward: true, findNext: false })
    } else {
      window.browser.stopFindInPage('clearSelection')
      setResult({ matches: 0, activeMatchOrdinal: 0 })
    }
  }, [text])

  return (
    <div className="find-bar" style={{ right: `${rightOffset}px` }}>
      <div className="find-bar-input-container">
        <Search size={16} className="find-icon" />
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Find in page..."
        />
        {text && (
          <span className="find-results-count">
            {result.matches > 0 ? `${result.activeMatchOrdinal}/${result.matches}` : 'No results'}
          </span>
        )}
      </div>
      <div className="find-bar-actions">
        <button onClick={() => handleFind(false)} title="Previous">
          <ChevronUp size={18} />
        </button>
        <button onClick={() => handleFind(true)} title="Next">
          <ChevronDown size={18} />
        </button>
        <button onClick={onClose} title="Close">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export default FindBar

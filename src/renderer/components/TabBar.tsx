import React from 'react'
import { Loader2 } from 'lucide-react'
import { Tab } from '../App'

interface TabBarProps {
  tabs: Tab[]
  onSwitch: (id: string) => void
  onClose: (id: string) => void
  onCreate: () => void
}

const TabBar: React.FC<TabBarProps> = ({ tabs, onSwitch, onClose, onCreate }) => {
  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <div 
          key={tab.id} 
          className={`tab ${tab.active ? 'active' : ''}`}
          onClick={() => onSwitch(tab.id)}
        >
          {tab.loading && <Loader2 size={12} className="tab-loading-spinner" />}
          <span className="tab-title">{tab.title}</span>
          <span 
            className="tab-close" 
            onClick={(e) => {
              e.stopPropagation()
              onClose(tab.id)
            }}
          >
            ✕
          </span>
        </div>
      ))}
      <div className="new-tab-btn" onClick={onCreate}>+</div>
    </div>
  )
}

export default TabBar
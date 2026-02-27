import React from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import { Tab } from '../App'

interface TabBarProps {
  tabs: Tab[]
  onSwitch: (id: string) => void
  onClose: (id: string) => void
  onCreate: () => void
}

const TabBar: React.FC<TabBarProps> = ({ tabs, onSwitch, onClose, onCreate }) => {
  return (
    <div className="tab-bar" role="tablist">
      {tabs.map(tab => (
        <div 
          key={tab.id} 
          className={`tab ${tab.active ? 'active' : ''}`}
          onClick={() => onSwitch(tab.id)}
          role="tab"
          aria-selected={tab.active}
          title={tab.title}
        >
          {tab.loading && <Loader2 size={12} className="tab-loading-spinner" />}
          <span className="tab-title">{tab.title}</span>
          <button 
            className="tab-close" 
            onClick={(e) => {
              e.stopPropagation()
              onClose(tab.id)
            }}
            aria-label="Close tab"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      <button 
        className="new-tab-btn" 
        onClick={onCreate}
        aria-label="New tab"
        title="New tab"
      >
        <Plus size={18} />
      </button>
    </div>
  )
}

export default TabBar
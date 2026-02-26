import React, { useState } from 'react'
import { X, Globe, Palette, Shield, Info, Moon, Sun, Zap, Lock, EyeOff, Trash2, Cpu, Pin, PinOff } from 'lucide-react'

interface SettingsPageProps {
  onClose: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  pinnedIcons: string[]
  onTogglePin: (id: string) => void
  onNavigate: (url: string) => void
}

type Section = 'general' | 'appearance' | 'privacy' | 'advanced' | 'about'

const SettingsPage: React.FC<SettingsPageProps> = ({ onClose, theme, onToggleTheme, pinnedIcons, onTogglePin, onNavigate }) => {
  const [activeSection, setActiveSection] = useState<Section>('general')
  const [isClearing, setIsClearing] = useState(false)

  const toolbarFeatures = [
    { id: 'bookmarks', label: 'Bookmarks' },
    { id: 'history', label: 'History' },
    { id: 'find', label: 'Find in Page' },
    { id: 'screenshot', label: 'Capture Screenshot' },
    { id: 'reading', label: 'Reading Mode' },
    { id: 'summarize', label: 'AI Summarize' },
    { id: 'panel', label: 'Side Panel' },
    { id: 'theme', label: 'Theme Toggle' },
    { id: 'settings', label: 'Settings Icon' }
  ]

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <section className="settings-section-content">
            <h3>General</h3>
            <div className="settings-group">
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Home page</h4>
                  <p>The page that opens when you click the Home button</p>
                </div>
                <input type="text" defaultValue="rapidsurf://newtab" className="settings-input" />
              </div>
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Search engine</h4>
                  <p>Choose which engine to use when searching from the address bar</p>
                </div>
                <select className="settings-select">
                  <option>Google (Recommended)</option>
                  <option>Bing</option>
                  <option>DuckDuckGo (Privacy)</option>
                  <option>Ecosia (Eco-friendly)</option>
                </select>
              </div>
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Startup behavior</h4>
                  <p>Choose what RapidSurf does when it starts up</p>
                </div>
                <select className="settings-select">
                  <option value="restore">Continue where you left off</option>
                  <option value="newtab">Open the New Tab page</option>
                  <option value="google">Open Google</option>
                </select>
              </div>
            </div>
          </section>
        )
      case 'appearance':
        return (
          <section className="settings-section-content">
            <h3>Appearance</h3>
            <div className="settings-group">
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Theme Mode</h4>
                  <p>Switch between light and dark visual styles</p>
                </div>
                <div className="theme-toggle-group">
                  <button 
                    className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => theme === 'dark' && onToggleTheme()}
                  >
                    <Sun size={16} /> Light
                  </button>
                  <button 
                    className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => theme === 'light' && onToggleTheme()}
                  >
                    <Moon size={16} /> Dark
                  </button>
                </div>
              </div>
            </div>

            <h3>Toolbar Pinned Icons</h3>
            <p className="settings-description">Choose which features appear in the top-right corner next to the search bar.</p>
            <div className="settings-group">
              <div className="toolbar-grid">
                {toolbarFeatures.map(feature => (
                  <div key={feature.id} className="settings-item compact">
                    <div className="settings-info">
                      <h4>{feature.label}</h4>
                    </div>
                    <button 
                      className={`pin-btn ${pinnedIcons.includes(feature.id) ? 'active' : ''}`}
                      onClick={() => onTogglePin(feature.id)}
                      title={pinnedIcons.includes(feature.id) ? 'Unpin from toolbar' : 'Pin to toolbar'}
                    >
                      {pinnedIcons.includes(feature.id) ? <Pin size={16} /> : <PinOff size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      case 'privacy':
        return (
          <section className="settings-section-content">
            <h3>Privacy & Security</h3>
            <div className="settings-group">
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Ad & Tracker Blocking</h4>
                  <p>Block intrusive ads and hidden trackers automatically</p>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-info">
                  <h4>HTTPS-Only Mode</h4>
                  <p>Always try to upgrade connections to secure HTTPS</p>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Clear browsing data</h4>
                  <p>Delete history, cookies, and cache</p>
                </div>
                <button 
                  className="settings-btn-danger" 
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to clear all browsing data?')) {
                      setIsClearing(true)
                      await window.browser.clearBrowsingData({ cache: true, history: true, cookies: true })
                      setIsClearing(false)
                      alert('Browsing data cleared successfully')
                    }
                  }}
                  disabled={isClearing}
                >
                  <Trash2 size={14} /> {isClearing ? 'Clearing...' : 'Clear now'}
                </button>
              </div>
            </div>
          </section>
        )
      case 'advanced':
        return (
          <section className="settings-section-content">
            <h3>Advanced</h3>
            <div className="settings-group">
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Hardware Acceleration</h4>
                  <p>Use GPU to speed up graphics rendering</p>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Developer Tools</h4>
                  <p>Enable right-click 'Inspect Element' and F12</p>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-info">
                  <h4>User Agent</h4>
                  <p>How the browser identifies itself to websites</p>
                </div>
                <select 
                  className="settings-select" 
                  onChange={(e) => window.browser.setUserAgent(e.target.value)}
                >
                  <option value="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36">Default (Chrome)</option>
                  <option value="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0">Firefox</option>
                  <option value="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15">Safari</option>
                  <option value="Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1">Mobile (iPhone)</option>
                </select>
              </div>
            </div>
          </section>
        )
      case 'about':
        return (
          <section className="settings-section-content">
            <h3>About RapidSurf</h3>
            <div className="settings-group">
              <div className="about-brand">
                <div className="about-logo">RS</div>
                <div className="about-text">
                  <h4>RapidSurf Browser</h4>
                  <p>Version 1.2.0 (Stable Build)</p>
                  <p className="about-copyright">© 2024 RapidSurf Team. All rights reserved.</p>
                </div>
              </div>
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Check for updates</h4>
                  <p>RapidSurf is currently up to date</p>
                </div>
                <button className="settings-btn-secondary">Check now</button>
              </div>
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Open Source Licenses</h4>
                  <p>View the third-party software used in RapidSurf</p>
                </div>
                <button className="settings-btn-secondary">View licenses</button>
              </div>
            </div>
          </section>
        )
      default:
        return null
    }
  }

  return (
    <div className="settings-page" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="settings-container">
        <aside className="settings-sidebar">
          <h2>Settings</h2>
          <nav>
            <button 
              className={activeSection === 'general' ? 'active' : ''} 
              onClick={() => setActiveSection('general')}
            >
              <Globe size={20} /> General
            </button>
            <button 
              className={activeSection === 'appearance' ? 'active' : ''} 
              onClick={() => setActiveSection('appearance')}
            >
              <Palette size={20} /> Appearance
            </button>
            <button 
              className={activeSection === 'privacy' ? 'active' : ''} 
              onClick={() => setActiveSection('privacy')}
            >
              <Lock size={20} /> Privacy & Security
            </button>
            <button 
              className={activeSection === 'advanced' ? 'active' : ''} 
              onClick={() => setActiveSection('advanced')}
            >
              <Cpu size={20} /> Advanced
            </button>
            <button 
              className={activeSection === 'about' ? 'active' : ''} 
              onClick={() => setActiveSection('about')}
            >
              <Info size={20} /> About
            </button>
          </nav>
        </aside>

        <main className="settings-content">
          <button className="settings-close" onClick={onClose} title="Close Settings">
            <X size={20} />
          </button>
          <div className="settings-view-wrapper">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default SettingsPage

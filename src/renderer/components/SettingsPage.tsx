import React, { useState } from 'react'
import { X, Globe, Palette, Shield, Info, Moon, Sun, Zap, Lock, EyeOff, Trash2, Cpu } from 'lucide-react'

interface SettingsPageProps {
  onClose: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

type Section = 'general' | 'appearance' | 'privacy' | 'advanced' | 'about'

const SettingsPage: React.FC<SettingsPageProps> = ({ onClose, theme, onToggleTheme }) => {
  const [activeSection, setActiveSection] = useState<Section>('general')

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
                <input type="text" defaultValue="https://www.google.com" className="settings-input" />
              </div>
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Search engine</h4>
                  <p>Choose which engine to use when searching from the address bar</p>
                </div>
                <select className="settings-select">
                  <option>Google</option>
                  <option>Bing</option>
                  <option>DuckDuckGo</option>
                  <option>Ecosia</option>
                </select>
              </div>
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Startup behavior</h4>
                  <p>What should RapidSurf do when it starts up?</p>
                </div>
                <select className="settings-select">
                  <option>Open a new tab</option>
                  <option>Continue where you left off</option>
                  <option>Open specific pages</option>
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
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Tab bar position</h4>
                  <p>Show the tab bar at the top or bottom (coming soon)</p>
                </div>
                <select className="settings-select" disabled>
                  <option>Top</option>
                  <option>Bottom</option>
                </select>
              </div>
              <div className="settings-item">
                <div className="settings-info">
                  <h4>Toolbar icons</h4>
                  <p>Show text labels next to icons</p>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
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
                <button className="settings-btn-danger">
                  <Trash2 size={14} /> Clear now
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
                <select className="settings-select">
                  <option>Default (Chrome)</option>
                  <option>Firefox</option>
                  <option>Safari</option>
                  <option>Mobile (iPhone)</option>
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
    <div className="settings-page">
      <div className="settings-container">
        <aside className="settings-sidebar">
          <h2>Settings</h2>
          <nav>
            <button 
              className={activeSection === 'general' ? 'active' : ''} 
              onClick={() => setActiveSection('general')}
            >
              <Globe size={18} /> General
            </button>
            <button 
              className={activeSection === 'appearance' ? 'active' : ''} 
              onClick={() => setActiveSection('appearance')}
            >
              <Palette size={18} /> Appearance
            </button>
            <button 
              className={activeSection === 'privacy' ? 'active' : ''} 
              onClick={() => setActiveSection('privacy')}
            >
              <Lock size={18} /> Privacy & Security
            </button>
            <button 
              className={activeSection === 'advanced' ? 'active' : ''} 
              onClick={() => setActiveSection('advanced')}
            >
              <Cpu size={18} /> Advanced
            </button>
            <button 
              className={activeSection === 'about' ? 'active' : ''} 
              onClick={() => setActiveSection('about')}
            >
              <Info size={18} /> About
            </button>
          </nav>
        </aside>

        <main className="settings-content">
          <button className="settings-close" onClick={onClose} title="Close Settings"><X size={20} /></button>
          <div className="settings-view-wrapper">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default SettingsPage

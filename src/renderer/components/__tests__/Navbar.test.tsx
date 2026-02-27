import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '../Navbar'
import React from 'react'

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left" />,
  ArrowRight: () => <div data-testid="arrow-right" />,
  RotateCw: () => <div data-testid="rotate-cw" />,
  Home: () => <div data-testid="home" />,
  Sparkles: () => <div data-testid="sparkles" />,
  Menu: () => <div data-testid="menu" />,
  Moon: () => <div data-testid="moon" />,
  Sun: () => <div data-testid="sun" />,
  Search: () => <div data-testid="search" />,
  Camera: () => <div data-testid="camera" />,
  BookOpen: () => <div data-testid="book-open" />,
  Settings: () => <div data-testid="settings" />,
  Clock: () => <div data-testid="clock" />,
  Shield: () => <div data-testid="shield" />,
  Globe: () => <div data-testid="globe" />,
  Star: () => <div data-testid="star" />
}))

// Mock window.browser
const mockBrowser = {
  getBookmarks: vi.fn().mockResolvedValue([]),
  saveBookmarks: vi.fn(),
  getTabText: vi.fn().mockResolvedValue('Test Title\nTest Content')
}
// @ts-ignore
window.browser = mockBrowser

describe('Navbar', () => {
  const defaultProps = {
    url: 'https://example.com',
    theme: 'light' as const,
    loading: false,
    onNavigate: vi.fn(),
    onBack: vi.fn(),
    onForward: vi.fn(),
    onReload: vi.fn(),
    onSummarize: vi.fn(),
    onTogglePanel: vi.fn(),
    onToggleTheme: vi.fn(),
    onToggleFind: vi.fn(),
    onScreenshot: vi.fn(),
    onReadingMode: vi.fn(),
    onOpenSettings: vi.fn(),
    onOpenHistory: vi.fn(),
    onOpenBookmarks: vi.fn(),
    pinnedIcons: ['bookmarks', 'history', 'find', 'screenshot', 'reading', 'summarize', 'panel', 'theme', 'settings']
  }

  it('renders correctly', () => {
    render(<Navbar {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search or enter URL')).toBeDefined()
    expect(screen.getByDisplayValue('https://example.com')).toBeDefined()
  })

  it('calls onNavigate when form is submitted', () => {
    render(<Navbar {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search or enter URL')
    fireEvent.change(input, { target: { value: 'https://google.com' } })
    fireEvent.submit(input.closest('form')!)
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('https://google.com')
  })

  it('calls onBack when back button is clicked', () => {
    render(<Navbar {...defaultProps} />)
    const backBtn = screen.getByTitle('Back')
    fireEvent.click(backBtn)
    expect(defaultProps.onBack).toHaveBeenCalled()
  })

  it('toggles theme when theme button is clicked', () => {
    render(<Navbar {...defaultProps} />)
    const themeBtn = screen.getByTitle('Switch to dark mode')
    fireEvent.click(themeBtn)
    expect(defaultProps.onToggleTheme).toHaveBeenCalled()
  })
})

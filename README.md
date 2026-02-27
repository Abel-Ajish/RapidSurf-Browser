# RapidSurf Browser 🚀
RapidSurf is a modern, high-performance desktop browser built on Electron and Chromium, featuring integrated AI tools and privacy-first controls.

== Description ==

RapidSurf is not just another browser; it's a productivity-focused web navigator designed for the modern era. Built from the ground up using **React 18**, **TypeScript**, and **Electron**, RapidSurf provides a lightning-fast browsing experience combined with native AI capabilities that transform how you consume information on the web.

Our philosophy is built on three pillars:
1. **Speed**: Optimized process management and a lightweight UI ensure minimal resource usage and instant response times.
2. **Privacy**: All your personal data—history, bookmarks, and sessions—never leaves your machine.
3. **Intelligence**: Native tools like Smart Summary and Reading Mode help you navigate the information-dense web with ease.

== Features ==

- **🚀 Performance-First Architecture**: Leveraging `electron-vite` for optimized builds and a snappy React-based renderer.
- **🤖 Integrated AI Engine**:
    - **Smart Summary**: Get instant, concise summaries of long articles and complex documentation.
    - **Intelligent Navigation**: Address bar that understands search intent and switches providers seamlessly.
- **🎨 Sophisticated UI/UX**:
    - **Glassmorphism Design**: A beautiful, modern interface with fluid animations and spring physics.
    - **View Transitions**: Seamless, native-feeling transitions between Light and Dark themes.
    - **Dynamic New Tab**: A centralized dashboard featuring recent activity, favorites, and real-time greetings.
- **🛡️ Privacy & Security**:
    - **Local Data Isolation**: Secure local storage for all user-sensitive information.
    - **User Agent Masking**: Easily switch how your browser identifies itself to prevent fingerprinting.
    - **Native Dialogs**: Secure, OS-level confirmation for sensitive setting changes.
- **⚙️ Customization**:
    - **Toolbar Management**: Pin or unpin tools like Screenshots, History, and AI features to suit your workflow.
    - **Sync Logic**: Intelligent synchronization between your search engine and homepage preferences.

== Tech Stack ==

- **Runtime**: Electron & Chromium
- **Frontend**: React 18 (Functional Components & Hooks)
- **State Management**: Local React State with Persistent Storage Bridge
- **Styling**: Modern CSS with Variables, Flexbox, and Grid
- **Build Tools**: TypeScript, Vite, electron-vite
- **Icons**: Lucide React

== Screenshots ==

1. **The Dashboard**: A high-resolution view of the redesigned New Tab Page with glassmorphism cards.
2. **AI in Action**: Showing the Smart Summary modal providing a concise breakdown of a web article.
3. **Advanced Settings**: A look at the General and Advanced settings panels where privacy and behavior are configured.

== Installation ==

### For Users
1. Download the latest release for your OS (Windows, macOS, or Linux).
2. Run the installer and follow the on-screen instructions.

### For Developers
1. **Clone the repo**:
   ```bash
   git clone https://github.com/Abel-Ajish/RapidSurf-Browser.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run in Development**:
   ```bash
   npm run dev
   ```
4. **Build Production Binaries**:
   ```bash
   npm run build
   npm run package
   ```

== Frequently Asked Questions ==

= How is RapidSurf different from Chrome or Firefox? =
RapidSurf is built for minimalists and power users who want AI tools integrated directly into the browser without the bloat of traditional "big tech" browsers. We focus on local privacy and snappy performance.

= Where is my data stored? =
All data is stored in the `userData` directory of your local system. RapidSurf does not use any cloud syncing by default to ensure your history and bookmarks remain yours alone.

= Does the AI feature cost money? =
The current integration uses built-in analysis tools and is free to use for all RapidSurf users.

= Can I customize the search engines? =
Yes! You can choose between Google, Bing, DuckDuckGo (for privacy), and Ecosia (for eco-friendly browsing) in the Settings menu.

== Architecture ==

- **Main Process** (`src/main`): Manages window lifecycle, IPC handlers, and system services like `TabService` and `StorageService`.
- **Preload Script** (`src/preload`): A secure bridge between the renderer and main process, exposing only necessary APIs via `contextBridge`.
- **Renderer Process** (`src/renderer`): The React application that handles the UI, user interactions, and styling.

== Changelog ==

= 1.3.0 =
* **Feature**: Implemented native OS-level Yes/No confirmation dialogs.
* **UI**: Added seamless theme switching using the View Transitions API.
* **Logic**: Synchronized Search Engine and Home Page settings with user prompts.
* **Fix**: Resolved startup behavior issues where the home page wasn't respecting settings.
* **Dev**: Optimized TypeScript definitions and resolved linter diagnostics.

= 1.2.0 =
* **UI**: Major redesign of the New Tab Page with a responsive grid layout.
* **Feature**: Added User Agent switching in Advanced settings.
* **Performance**: Enabled native auto-resize for BrowserViews to eliminate resize lag.

= 1.1.0 =
* **Feature**: Initial implementation of AI Smart Summary.
* **UI**: Added customizable toolbar pinning system.

== License ==

RapidSurf Browser is licensed under the **GNU General Public License v3.0**. You are free to use, modify, and distribute the software under the terms of this license.

**Copyright (C) 2026 Abel Ajish**

---
Created with passion by the **Spaceapp Team**. Built for speed, designed for you.

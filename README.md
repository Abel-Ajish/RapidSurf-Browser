# RapidSurf Browser

A production-ready Electron-based Chromium desktop browser built with TypeScript, React, and Vite.

## Features

- **Modular Architecture**: Clean separation of main and renderer processes.
- **Tab Management**: Support for multiple tabs with title and URL updates.
- **Navigation**: Back, forward, reload, and home functionality.
- **Security**: Context isolation and sandboxing enabled.
- **Modern UI**: Built with React and Lucide icons.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Package

```bash
npm run package
```

## Architecture

- `src/main`: Electron main process code (Window management, IPC, services).
- `src/preload`: Preload script for safe IPC communication.
- `src/renderer`: React-based UI for the browser chrome.
- `src/shared`: Shared types and utilities.

## Scalability

The project is structured to support:
- **Plugins**: Add new features by extending the `WindowManager` or creating new main process services.
- **Themes**: CSS variable-based theming.
- **Testing**: Ready for Vitest unit and integration tests.

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

import { session, WebContents } from 'electron'

export class SecurityService {
  constructor() {
    this.setupSecurityHandlers()
  }

  private setupSecurityHandlers() {
    // Content Security Policy (CSP)
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' * data: blob:;"]
        }
      })
    })

    // Ad-blocking and Tracker-blocking (Basic implementation)
    const blockList = [
      '*://*.doubleclick.net/*',
      '*://*.google-analytics.com/*',
      '*://*.analytics.google.com/*',
      '*://*.googletagmanager.com/*',
      '*://*.carbonads.net/*',
      '*://*.adnxs.com/*'
    ]

    session.defaultSession.webRequest.onBeforeRequest(
      { urls: blockList },
      (details, callback) => {
        console.log(`Blocked: ${details.url}`)
        callback({ cancel: true })
      }
    )

    // HTTPS Enforcement (Exclude localhost for development)
    session.defaultSession.webRequest.onBeforeRequest(
      { urls: ['http://*/*'] },
      (details, callback) => {
        const url = new URL(details.url)
        if (url.protocol === 'http:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
          const httpsUrl = details.url.replace('http://', 'https://')
          callback({ redirectURL: httpsUrl })
        } else {
          callback({})
        }
      }
    )

    // Permissions management
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      const url = webContents.getURL()
      console.log(`Permission requested: ${permission} for ${url}`)
      
      // For production, you'd show a dialog to the user
      // For now, we allow standard permissions
      const allowedPermissions = ['notifications', 'fullscreen', 'geolocation']
      if (allowedPermissions.includes(permission)) {
        callback(true)
      } else {
        callback(false)
      }
    })
  }

  public static async clearData() {
    await session.defaultSession.clearStorageData()
  }

  public applyToWebContents(webContents: WebContents) {
    // Disable some features for security
    webContents.on('will-navigate', (event, url) => {
      const parsedUrl = new URL(url)
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        event.preventDefault()
      }
    })
  }
}
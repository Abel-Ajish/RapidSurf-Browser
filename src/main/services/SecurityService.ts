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
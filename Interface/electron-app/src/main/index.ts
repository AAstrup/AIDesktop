import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import icon from '../../resources/icon.png?asset' // Adjust the path if necessary

// Import handler registration functions
import { registerFetchAppsRegistryHandler } from './handlers/fetchAppsRegistry'
import { registerDownloadAppHandler } from './handlers/downloadApp'
import { registerAddJobHandler } from './handlers/addJob'
import { registerAddStepHandler } from './handlers/addStep'
import { registerConnectStepHandler } from './handlers/connectStep'
import { registerDeleteJobHandler } from './handlers/deleteJob' // Add this line
import { registerDeleteStepHandler } from './handlers/deleteStep' // Add this line
import { registerGetJobsAndStepsHandler } from './handlers/getJobsAndSteps' // Add this line

// Shared variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const __desktopdir = join(__dirname, '..', '..', '..', '..')

// Map to keep track of running app processes
const runningApps = new Map<string, any>()

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Register IPC handlers
  registerFetchAppsRegistryHandler(ipcMain)
  registerDownloadAppHandler(ipcMain, __desktopdir, runningApps)
  registerAddJobHandler(ipcMain, __desktopdir)
  registerAddStepHandler(ipcMain, __desktopdir, runningApps)
  registerConnectStepHandler(ipcMain, __desktopdir)
  registerDeleteJobHandler(ipcMain, __desktopdir) // Register the deleteJob handler
  registerDeleteStepHandler(ipcMain, __desktopdir) // Register the deleteStep handler
  registerGetJobsAndStepsHandler(ipcMain, __desktopdir) // Register the getJobsAndSteps handler

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

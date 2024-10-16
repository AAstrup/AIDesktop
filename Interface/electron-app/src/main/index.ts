import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import axios from 'axios'
import AdmZip from 'adm-zip'
import icon from '../../resources/icon.png?asset' // Adjust the path if necessary

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

  // IPC handler for downloading, extracting, and creating folders
  ipcMain.handle('add-step', async (event, stepData) => {
    try {
      const response = await axios.get(stepData.zipDownload, {
        responseType: 'arraybuffer'
      })
      const zipData = response.data

      const basePath = join(__dirname, '..', '..') // Adjust as necessary
      const appsFolderPath = join(basePath, 'Apps')
      const appFolderPath = join(appsFolderPath, stepData.name)

      if (!fs.existsSync(appFolderPath)) {
        fs.mkdirSync(appFolderPath, { recursive: true })
      }

      const subfolders = ['app', 'context', 'errors', 'formats', 'requests', 'responses']
      subfolders.forEach((folder) => {
        const folderPath = join(appFolderPath, folder)
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath)
        }
      })

      // Extract the zip content into the 'app' subfolder
      const appSubFolderPath = join(appFolderPath, 'app')
      const zip = new AdmZip(zipData)
      zip.extractAllTo(appSubFolderPath, true)

      console.log(`App ${stepData.name} downloaded and extracted successfully.`)
      return { success: true }
    } catch (error: any) {
      console.error('Error downloading or extracting zip file:', error)
      return { success: false, error: error.message }
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

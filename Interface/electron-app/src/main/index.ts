import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import axios from 'axios'
import AdmZip from 'adm-zip'
import icon from '../../resources/icon.png?asset' // Adjust the path if necessary
import { spawn } from 'child_process' // Import child_process module

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const __desktopdir = join(__dirname, '..', '..', '..', '..')

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

  // Map to keep track of running app processes
  const runningApps = new Map<string, any>()

  // Reusable function to start an app
  function startApp(appName: string) {
    const appPath = join(__desktopdir, 'Apps', appName)

    // Check if app is already running
    if (runningApps.has(appName)) {
      console.log(`App ${appName} is already running.`)
      return
    }

    const appExecutableFolder = join(appPath, 'app')

    // Find the .exe file in the 'app' subfolder
    let exeFile: string | undefined
    try {
      const appFiles = fs.readdirSync(appExecutableFolder)
      exeFile = appFiles.find((file) => file.toLowerCase().endsWith('.exe'))
    } catch (err) {
      console.error(`Error reading app folder for ${appName}:`, err)
      return
    }

    if (!exeFile) {
      console.error(`No .exe file found for app ${appName}.`)
      return
    }

    const exePath = join(appExecutableFolder, exeFile)

    // Set environment variables
    const env = {
      ...process.env,
      APP_FORMATS_PATH: join(appPath, 'formats'),
      APP_ERRORS_PATH: join(appPath, 'errors'),
      APP_RESPONSES_PATH: join(appPath, 'responses'),
      APP_REQUESTS_PATH: join(appPath, 'requests')
    }

    // Start the executable
    const appProcess = spawn(exePath, [], { env })

    // Add to running apps
    runningApps.set(appName, appProcess)

    console.log(`Started app ${appName}.`)

    // Handle app process exit
    appProcess.on('exit', (code, signal) => {
      console.log(`App ${appName} exited with code ${code}, signal ${signal}.`)
      runningApps.delete(appName)
    })

    appProcess.on('error', (error) => {
      console.error(`Error running app ${appName}:`, error)
      runningApps.delete(appName)
    })
  }

  // Function to check and start apps
  function checkAndStartApps() {
    const appsFolderPath = join(__desktopdir, 'Apps')

    fs.readdir(appsFolderPath, (err, files) => {
      if (err) {
        console.error('Error reading Apps directory:', err)
        return
      }

      files.forEach((appName) => {
        const appPath = join(appsFolderPath, appName)
        fs.stat(appPath, (err, stats) => {
          if (err || !stats.isDirectory()) {
            // Skip if not a directory
            return
          }

          const requestsFolderPath = join(appPath, 'requests')
          fs.readdir(requestsFolderPath, (err, requestFiles) => {
            if (err) {
              // Skip if requests folder doesn't exist
              return
            }

            if (requestFiles.length > 0) {
              // Use the startApp function
              startApp(appName)
            }
          })
        })
      })
    })
  }

  // Run the check every 5 seconds
  setInterval(checkAndStartApps, 5000)

  // IPC handler for downloading, extracting, and creating folders
  ipcMain.handle('add-step', async (event, stepData) => {
    try {
      const response = await axios.get(stepData.zipDownload, {
        responseType: 'arraybuffer'
      })
      const zipData = response.data

      const appsFolderPath = join(__desktopdir, 'Apps')
      const appFolderPath = join(appsFolderPath, stepData.name)
      console.log(`App ${stepData.name} downloaded start extract to ${appFolderPath}.`)

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

      // Start the app after adding
      startApp(stepData.name)

      return { success: true }
    } catch (error: any) {
      console.error('Error downloading or extracting zip file:', error)
      return { success: false, error: error.message }
    }
  })

  // IPC handler for fetching apps registry
  ipcMain.handle('fetch-apps-registry', async () => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/AAstrup/AIDesktop-Apps/main/appsRegistry.json'
      )
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      return { success: true, data }
    } catch (error: any) {
      console.error('Error fetching apps registry:', error)
      return { success: false, error: error.message }
    }
  })

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

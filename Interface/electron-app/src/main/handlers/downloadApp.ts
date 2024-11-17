import { IpcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'
import axios from 'axios'
import AdmZip from 'adm-zip'
import { spawn } from 'child_process'

export function registerDownloadAppHandler(
  ipcMain: IpcMain,
  __desktopdir: string,
  runningApps: Map<string, any>
) {
  ipcMain.handle('download-app', async (event, appData) => {
    try {
      const response = await axios.get(appData.zipDownload, {
        responseType: 'arraybuffer'
      })
      const zipData = response.data

      const appsFolderPath = join(__desktopdir, 'Apps')
      const appFolderPath = join(appsFolderPath, appData.name)
      console.log(`App ${appData.name} downloaded, start extract to ${appFolderPath}.`)

      if (!fs.existsSync(appFolderPath)) {
        fs.mkdirSync(appFolderPath, { recursive: true })
      }

      const subfolders = ['app', 'formats']
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

      console.log(`App ${appData.name} downloaded and extracted successfully.`)

      // Start the app after downloading to fill the 'formats' folder
      startApp(appData.name, __desktopdir, runningApps)

      return { success: true }
    } catch (error: any) {
      console.error('Error downloading or extracting zip file:', error)
      return { success: false, error: error.message }
    }
  })
}

// Reusable function to start an app
function startApp(appName: string, __desktopdir: string, runningApps: Map<string, any>) {
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

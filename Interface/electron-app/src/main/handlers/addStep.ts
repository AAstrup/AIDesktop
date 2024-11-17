import { IpcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import axios from 'axios'
import AdmZip from 'adm-zip'

export function registerAddStepHandler(
  ipcMain: IpcMain,
  __desktopdir: string,
  runningApps: Map<string, any>
) {
  ipcMain.handle('add-step', async (event, { jobName, appName }) => {
    try {
      const jobsFolderPath = join(__desktopdir, 'Jobs')
      const jobFolderPath = join(jobsFolderPath, jobName)

      if (!fs.existsSync(jobFolderPath)) {
        return { success: false, error: `Job ${jobName} does not exist.` }
      }

      // Check if the app exists; if not, download it
      const appFolderPath = join(__desktopdir, 'Apps', appName)
      if (!fs.existsSync(appFolderPath)) {
        // App doesn't exist, need to download it
        const appRegistry = await fetchAppRegistry()
        const appData = appRegistry.find((app: any) => app.name === appName)

        if (!appData) {
          return { success: false, error: `App ${appName} not found in registry.` }
        }

        const downloadResult = await downloadApp(appData, __desktopdir, runningApps)
        if (!downloadResult.success) {
          return { success: false, error: downloadResult.error }
        }
      }

      // Determine the next step number by counting existing steps
      const existingSteps = fs.readdirSync(jobFolderPath).filter((file) => {
        return fs.statSync(join(jobFolderPath, file)).isDirectory()
      })

      const stepNumber = existingSteps.length + 1
      const stepFolderName = `${stepNumber}_${appName}`
      const stepFolderPath = join(jobFolderPath, stepFolderName)

      fs.mkdirSync(stepFolderPath)

      const subfolders = ['context', 'errors', 'requests', 'responses']
      subfolders.forEach((folder) => {
        const folderPath = join(stepFolderPath, folder)
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath)
        }
      })

      // Start the app with the step's environment variables
      startAppForStep(appName, __desktopdir, runningApps, stepFolderPath, jobName, stepNumber)

      return { success: true }
    } catch (error: any) {
      console.error('Error adding step:', error)
      return { success: false, error: error.message }
    }
  })
}

// Helper function to download app
async function downloadApp(
  appData: any,
  __desktopdir: string,
  runningApps: Map<string, any>
): Promise<{ success: boolean; error?: string }> {
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
}

// Function to fetch app registry
async function fetchAppRegistry(): Promise<any[]> {
  try {
    const response = await axios.get(
      'https://raw.githubusercontent.com/AAstrup/AIDesktop-Apps/main/appsRegistry.json'
    )
    return response.data
  } catch (error) {
    console.error('Error fetching apps registry:', error)
    return []
  }
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

// Function to start app for a specific step
function startAppForStep(
  appName: string,
  __desktopdir: string,
  runningApps: Map<string, any>,
  stepFolderPath: string,
  jobName: string,
  stepNumber: number
) {
  const appPath = join(__desktopdir, 'Apps', appName)

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

  // Set environment variables for the step's folders
  const env = {
    ...process.env,
    APP_FORMATS_PATH: join(appPath, 'formats'),
    APP_ERRORS_PATH: join(stepFolderPath, 'errors'),
    APP_RESPONSES_PATH: join(stepFolderPath, 'responses'),
    APP_REQUESTS_PATH: join(stepFolderPath, 'requests'),
    APP_CONTEXTS_PATH: join(stepFolderPath, 'context')
  }

  // Start the executable
  const appProcess = spawn(exePath, [], { env })

  // Add to running apps, use a unique key for the step
  const appKey = `${jobName}_${stepNumber}_${appName}`
  runningApps.set(appKey, appProcess)

  console.log(`Started app ${appName} for job ${jobName}, step ${stepNumber}.`)

  // Handle app process exit
  appProcess.on('exit', (code, signal) => {
    console.log(
      `App ${appName} for job ${jobName}, step ${stepNumber} exited with code ${code}, signal ${signal}.`
    )
    runningApps.delete(appKey)
  })

  appProcess.on('error', (error) => {
    console.error(`Error running app ${appName} for job ${jobName}, step ${stepNumber}:`, error)
    runningApps.delete(appKey)
  })
}

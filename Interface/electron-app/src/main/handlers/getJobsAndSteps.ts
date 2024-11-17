import { IpcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'

export function registerGetJobsAndStepsHandler(ipcMain: IpcMain, __desktopdir: string) {
  ipcMain.handle('get-jobs-and-steps', async () => {
    try {
      const jobsFolderPath = join(__desktopdir, 'Jobs')
      if (!fs.existsSync(jobsFolderPath)) {
        return { success: true, jobs: [] }
      }

      const jobs = fs
        .readdirSync(jobsFolderPath)
        .filter((file) => {
          return fs.statSync(join(jobsFolderPath, file)).isDirectory()
        })
        .map((jobName) => {
          const jobFolderPath = join(jobsFolderPath, jobName)
          const steps = fs
            .readdirSync(jobFolderPath)
            .filter((file) => {
              return fs.statSync(join(jobFolderPath, file)).isDirectory()
            })
            .map((stepFolderName) => {
              const [stepNumberStr, appName] = stepFolderName.split('_')
              const stepNumber = parseInt(stepNumberStr)
              
              // Check if mapping file exists
              const mappingFilePath = join(jobFolderPath, `mapping_${stepNumber}_to_${stepNumber + 1}.js`)
              const connected = fs.existsSync(mappingFilePath)
              
              return {
                stepNumber,
                appName,
                connected
              }
            })

          return {
            jobName,
            steps
          }
        })

      return { success: true, jobs }
    } catch (error: any) {
      console.error('Error retrieving jobs and steps:', error)
      return { success: false, error: error.message }
    }
  })
}

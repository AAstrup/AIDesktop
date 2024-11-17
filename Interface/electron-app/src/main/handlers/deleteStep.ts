import { IpcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'

export function registerDeleteStepHandler(ipcMain: IpcMain, __desktopdir: string) {
  ipcMain.handle('delete-step', async (event, { jobName, stepNumber }) => {
    try {
      const jobsFolderPath = join(__desktopdir, 'Jobs')
      const jobFolderPath = join(jobsFolderPath, jobName)

      if (!fs.existsSync(jobFolderPath)) {
        return { success: false, error: `Job ${jobName} does not exist.` }
      }

      // Find the step folder
      const stepFolderNamePrefix = `${stepNumber}_`
      const stepFolderName = fs.readdirSync(jobFolderPath).find((folderName) =>
        folderName.startsWith(stepFolderNamePrefix)
      )

      if (!stepFolderName) {
        return { success: false, error: `Step ${stepNumber} does not exist in job ${jobName}.` }
      }

      const stepFolderPath = join(jobFolderPath, stepFolderName)

      // Delete the step folder recursively
      fs.rmSync(stepFolderPath, { recursive: true, force: true })

      console.log(`Step ${stepNumber} deleted successfully from job ${jobName}.`)

      return { success: true }
    } catch (error: any) {
      console.error('Error deleting step:', error)
      return { success: false, error: error.message }
    }
  })
}

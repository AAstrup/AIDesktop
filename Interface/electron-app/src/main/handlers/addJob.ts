import { IpcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'

export function registerAddJobHandler(ipcMain: IpcMain, __desktopdir: string) {
  ipcMain.handle('add-job', async (event, jobName) => {
    try {
      const jobsFolderPath = join(__desktopdir, 'Jobs')
      if (!fs.existsSync(jobsFolderPath)) {
        fs.mkdirSync(jobsFolderPath, { recursive: true })
      }

      const jobFolderPath = join(jobsFolderPath, jobName)
      if (fs.existsSync(jobFolderPath)) {
        return { success: false, error: `Job ${jobName} already exists.` }
      }

      fs.mkdirSync(jobFolderPath)
      console.log(`Job ${jobName} created successfully.`)

      return { success: true }
    } catch (error: any) {
      console.error('Error creating job:', error)
      return { success: false, error: error.message }
    }
  })
}

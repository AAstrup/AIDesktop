import { IpcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'

export function registerDeleteJobHandler(ipcMain: IpcMain, __desktopdir: string) {
  ipcMain.handle('delete-job', async (event, jobName: string) => {
    try {
      const jobsFolderPath = join(__desktopdir, 'Jobs')
      const jobFolderPath = join(jobsFolderPath, jobName)

      if (!fs.existsSync(jobFolderPath)) {
        return { success: false, error: `Job ${jobName} does not exist.` }
      }

      // Delete the job folder recursively
      fs.rmSync(jobFolderPath, { recursive: true, force: true })

      console.log(`Job ${jobName} deleted successfully.`)

      return { success: true }
    } catch (error: any) {
      console.error('Error deleting job:', error)
      return { success: false, error: error.message }
    }
  })
}

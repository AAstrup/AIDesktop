import { IpcMain } from 'electron'
import fetch from 'node-fetch' // Ensure you have node-fetch installed

export function registerFetchAppsRegistryHandler(ipcMain: IpcMain) {
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
}

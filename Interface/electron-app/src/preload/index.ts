import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import axios from 'axios'

interface AvailableStep {
  name: string
  version: string
  github: string
  zipDownload: string
}

// Custom APIs for renderer
export const api = {
  addStep: (stepData) => ipcRenderer.invoke('add-step', stepData),
  fetchAppsRegistry: async (): Promise<AvailableStep[]> => {
    const result = await ipcRenderer.invoke('fetch-apps-registry')
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

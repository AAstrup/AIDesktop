import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface AvailableStep {
  name: string
  version: string
  github: string
  zipDownload: string
}

interface AppData {
  name: string
  version: string
  github: string
  zipDownload: string
}

interface AddStepData {
  jobName: string
  appName: string
}

interface ConnectStepParams {
  jobName: string
  stepIndex: number
}

export const api = {
  fetchAppsRegistry: async (): Promise<AvailableStep[]> => {
    const result = await ipcRenderer.invoke('fetch-apps-registry')
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  },

  downloadApp: async (appData: AppData): Promise<void> => {
    const result = await ipcRenderer.invoke('download-app', appData)
    if (result.success) {
      return
    } else {
      throw new Error(result.error)
    }
  },

  addJob: async (jobName: string): Promise<void> => {
    const result = await ipcRenderer.invoke('add-job', jobName)
    if (result.success) {
      return
    } else {
      throw new Error(result.error)
    }
  },

  deleteJob: async (jobName: string): Promise<void> => {
    const result = await ipcRenderer.invoke('delete-job', jobName)
    if (result.success) {
      return
    } else {
      throw new Error(result.error)
    }
  },

  addStep: async (stepData: AddStepData): Promise<void> => {
    const result = await ipcRenderer.invoke('add-step', stepData)
    if (result.success) {
      return
    } else {
      throw new Error(result.error)
    }
  },

  deleteStep: async (jobName: string, stepNumber: number): Promise<void> => {
    const result = await ipcRenderer.invoke('delete-step', { jobName, stepNumber })
    if (result.success) {
      return
    } else {
      throw new Error(result.error)
    }
  },

  connectStep: async (params: ConnectStepParams): Promise<string> => {
    const result = await ipcRenderer.invoke('connect-step', params)
    if (result.success) {
      return result.mappingCode
    } else {
      throw new Error(result.error)
    }
  },

  getJobsAndSteps: async (): Promise<any[]> => {
    const result = await ipcRenderer.invoke('get-jobs-and-steps')
    if (result.success) {
      return result.jobs
    } else {
      throw new Error(result.error)
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}

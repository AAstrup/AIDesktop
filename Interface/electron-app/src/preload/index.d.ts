export {}

declare global {
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

  interface Api {
    fetchAppsRegistry: () => Promise<AvailableStep[]>
    downloadApp: (appData: AppData) => Promise<void>
    addJob: (jobName: string) => Promise<void>
    deleteJob: (jobName: string) => Promise<void>
    addStep: (stepData: AddStepData) => Promise<void>
    deleteStep: (jobName: string, stepNumber: number) => Promise<void>
    connectStep: (params: ConnectStepParams) => Promise<string>
    getJobsAndSteps: () => Promise<any[]>
  }

  interface Window {
    electron: typeof electronAPI
    api: Api
  }
}

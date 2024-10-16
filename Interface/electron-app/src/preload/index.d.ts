export {}

declare global {
  interface AvailableStep {
    name: string
    version: string
    github: string
    zipDownload: string
  }

  interface Api {
    addStep: (stepData: AvailableStep) => Promise<{ success: boolean; error?: string }>
  }

  interface Window {
    electron: unknown // Replace 'unknown' with the correct type if available.
    api: Api
  }
}

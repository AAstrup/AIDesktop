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
    fetchAppsRegistry: () => Promise<AvailableStep[]> // Adjust the return type if you have a specific structure
  }

  interface Window {
    electron: unknown // Replace 'unknown' with the correct type if available.
    api: Api
  }
}

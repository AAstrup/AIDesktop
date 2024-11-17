import { IpcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'

export function registerConnectStepHandler(ipcMain: IpcMain, __desktopdir: string) {
  ipcMain.handle('connect-step', async (event, { jobName, stepIndex }) => {
    try {
      const jobsFolderPath = join(__desktopdir, 'Jobs')
      const jobFolderPath = join(jobsFolderPath, jobName)

      if (!fs.existsSync(jobFolderPath)) {
        return { success: false, error: `Job ${jobName} does not exist.` }
      }

      // Get the from step folder
      const fromStepFolderNamePrefix = `${stepIndex}_`
      const fromStepFolders = fs.readdirSync(jobFolderPath).filter((file) => {
        return (
          fs.statSync(join(jobFolderPath, file)).isDirectory() &&
          file.startsWith(fromStepFolderNamePrefix)
        )
      })

      if (fromStepFolders.length === 0) {
        return { success: false, error: `Step ${stepIndex} does not exist in job ${jobName}.` }
      }

      const fromStepFolder = fromStepFolders[0]
      const { appName: fromAppName } = parseStepFolderName(fromStepFolder)

      // Get the to step folder
      const toStepIndex = stepIndex + 1
      const toStepFolderNamePrefix = `${toStepIndex}_`
      const toStepFolders = fs.readdirSync(jobFolderPath).filter((file) => {
        return (
          fs.statSync(join(jobFolderPath, file)).isDirectory() &&
          file.startsWith(toStepFolderNamePrefix)
        )
      })

      if (toStepFolders.length === 0) {
        return { success: false, error: `Next step ${toStepIndex} does not exist in job ${jobName}.` }
      }

      const toStepFolder = toStepFolders[0]
      const { appName: toAppName } = parseStepFolderName(toStepFolder)

      // Get the response formats of the from app
      const fromAppFormatsPath = join(__desktopdir, 'Apps', fromAppName, 'formats')
      const fromResponseFormats = fs.readdirSync(fromAppFormatsPath).filter((file) => {
        return file.startsWith('response_') && file.endsWith('.json')
      })

      if (fromResponseFormats.length === 0) {
        return { success: false, error: `No response formats found for app ${fromAppName}.` }
      }

      const fromResponseFormatFile = join(fromAppFormatsPath, fromResponseFormats[0])
      const fromResponseFormat = JSON.parse(fs.readFileSync(fromResponseFormatFile, 'utf-8'))

      // Get the request formats of the to app
      const toAppFormatsPath = join(__desktopdir, 'Apps', toAppName, 'formats')
      const toRequestFormats = fs.readdirSync(toAppFormatsPath).filter((file) => {
        return file.startsWith('request_') && file.endsWith('.json')
      })

      if (toRequestFormats.length === 0) {
        return { success: false, error: `No request formats found for app ${toAppName}.` }
      }

      const toRequestFormatFile = join(toAppFormatsPath, toRequestFormats[0])
      const toRequestFormat = JSON.parse(fs.readFileSync(toRequestFormatFile, 'utf-8'))

      // Generate JavaScript code to map fromResponseFormat to toRequestFormat
      let mappingCode = 'function mapResponseToRequest(response) {\n'
      mappingCode += '  return {\n'

      for (const key in toRequestFormat) {
        if (fromResponseFormat.hasOwnProperty(key)) {
          mappingCode += `    "${key}": response["${key}"],\n`
        } else {
          // Provide a default value or leave undefined
          mappingCode += `    "${key}": undefined, // TODO: Provide value\n`
        }
      }

      mappingCode += '  };\n'
      mappingCode += '}\n'
      mappingCode += 'module.exports = mapResponseToRequest;\n'

      // Save the mapping code to a file in the job folder
      const mappingFilePath = join(jobFolderPath, `mapping_${stepIndex}_to_${toStepIndex}.js`)
      fs.writeFileSync(mappingFilePath, mappingCode, 'utf-8')

      console.log(`Mapping code generated and saved to ${mappingFilePath}.`)

      return { success: true, mappingCode }
    } catch (error: any) {
      console.error('Error connecting steps:', error)
      return { success: false, error: error.message }
    }
  })
}

// Function to parse step folder name
function parseStepFolderName(folderName: string) {
  const firstUnderscoreIndex = folderName.indexOf('_')
  const stepNumberStr = folderName.substring(0, firstUnderscoreIndex)
  const appName = folderName.substring(firstUnderscoreIndex + 1)
  const stepNumber = parseInt(stepNumberStr)
  return { stepNumber, appName }
}

import React from 'react'
import { useJobs } from './JobsContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const StepDetails: React.FC = () => {
  const { steps, selectedStepNumber, selectedJobName } = useJobs()

  const selectedStep = steps.find(
    (step) => step.stepNumber === selectedStepNumber
  )

  const handleConnectStep = async () => {
    if (!selectedJobName || selectedStepNumber === null) {
        console.error('No job or step selected.')
      return
    }

    try {
      const mappingCode = await window.api.connectStep({
        jobName: selectedJobName,
        stepIndex: selectedStepNumber
      })
      console.log('Mapping code:', mappingCode)
    } catch (error) {
      console.error('Error connecting steps:', error)
    }
  }

  if (!selectedStep) {
    return null
  }

  return (
    <div className="flex flex-grow">
      <div className="flex flex-col gap-4">
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">Step Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">App Name</label>
              <div>{selectedStep.appName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium">Step Number</label>
              <div>{selectedStep.stepNumber}</div>
            </div>
          </div>
        </Card>
        <div className="flex flex-col p-4 gap-2">
          <Button onClick={handleConnectStep}>Connect Step</Button>
        </div>
      </div>
    </div>
  )
}

export default StepDetails

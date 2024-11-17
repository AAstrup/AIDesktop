import React from 'react'
import { useJobs } from './JobsContext'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { TrashIcon } from '@radix-ui/react-icons'
import StepComboBox from './StepComboBox'

const Steps: React.FC = () => {
  const { steps, deleteStep, selectedJobName, selectStep, selectedStepNumber } = useJobs()

  const handleDeleteStep = async (stepNumber: number) => {
    await deleteStep(stepNumber)
  }

  return (
    <div className="flex flex-col">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Step Number</TableHead>
            <TableHead>App Name</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {steps.map((step) => (
            <TableRow
              key={step.stepNumber}
              onClick={() => selectStep(step.stepNumber)}
              className={`cursor-pointer ${
                selectedStepNumber === step.stepNumber ? 'bg-gray-100' : ''
              }`}
            >
              <TableCell>{step.stepNumber}</TableCell>
              <TableCell>{step.appName}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteStep(step.stepNumber)
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-center mt-2">
        <StepComboBox />
      </div>
    </div>
  )
}

export default Steps

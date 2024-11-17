import React, { useState } from 'react'
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
import { TrashIcon, PlusIcon } from '@radix-ui/react-icons'
import Steps from './Steps'
import StepDetails from './StepDetails'

const JobTable: React.FC = () => {
  const { jobs, addJob, deleteJob, selectedJobName, selectJob } = useJobs()
  const [newJobName, setNewJobName] = useState('')

  const handleAddJob = async () => {
    if (newJobName.trim() === '') return
    await addJob(newJobName)
    setNewJobName('')
  }

  const handleDeleteJob = async (jobName: string) => {
    await deleteJob(jobName)
  }

  return (
    <div className="flex space-x-4">
      <div className={selectedJobName ? 'flex flex-col' : 'flex-grow flex-col'}>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow
                key={job.name}
                onClick={() => selectJob(job.name)}
                className={`cursor-pointer ${
                  selectedJobName === job.name ? 'bg-gray-100' : ''
                }`}
              >
                <TableCell>{job.name}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteJob(job.name)
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
          <input
            type="text"
            value={newJobName}
            onChange={(e) => setNewJobName(e.target.value)}
            placeholder="New Job Name"
            className="px-2 py-1 border border-gray-300 rounded mr-2"
          />
          <Button onClick={handleAddJob} variant="outline">
            <PlusIcon />
          </Button>
        </div>
      </div>
      {selectedJobName && (
        <>
          <Steps />
          <StepDetails />
        </>
      )}
    </div>
  )
}

export default JobTable

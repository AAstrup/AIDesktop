import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Job {
  name: string
}

export interface Step {
  jobName: string
  stepNumber: number
  appName: string
}

export interface AvailableStep {
  name: string
  version: string
  github: string
  zipDownload: string
}

interface JobsContextType {
  jobs: Job[]
  steps: Step[]
  selectedJobName: string | null
  selectedStepNumber: number | null
  addJob: (jobName: string) => Promise<void>
  deleteJob: (jobName: string) => Promise<void>
  selectJob: (jobName: string | null) => void
  addStep: (appName: string) => Promise<void>
  deleteStep: (stepNumber: number) => Promise<void>
  selectStep: (stepNumber: number | null) => void
}

const JobsContext = createContext<JobsContextType>({} as JobsContextType)

export const useJobs = () => useContext(JobsContext)

type Props = {
  children?: React.ReactNode
}

export const JobsProvider: React.FC<Props> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [selectedJobName, setSelectedJobName] = useState<string | null>(null)
  const [selectedStepNumber, setSelectedStepNumber] = useState<number | null>(null)

  useEffect(() => {
    const fetchJobsAndSteps = async () => {
      try {
        const jobsData = await window.api.getJobsAndSteps()
        setJobs(jobsData.map((job) => ({ name: job.jobName })))
        setSteps(
          jobsData.flatMap((job) =>
            job.steps.map((step) => ({
              jobName: job.jobName,
              stepNumber: step.stepNumber,
              appName: step.appName
            }))
          )
        )
      } catch (error) {
        console.error('Error fetching jobs and steps:', error)
      }
    }

    fetchJobsAndSteps()
  }, [])

  const addJob = async (jobName: string) => {
    try {
      await window.api.addJob(jobName)
      setJobs([...jobs, { name: jobName }])
    } catch (error) {
      console.error('Error adding job:', error)
    }
  }

  const deleteJob = async (jobName: string) => {
    try {
      await window.api.deleteJob(jobName)
      setJobs(jobs.filter((job) => job.name !== jobName))
      setSteps(steps.filter((step) => step.jobName !== jobName))
      if (selectedJobName === jobName) {
        setSelectedJobName(null)
      }
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  const selectJob = (jobName: string | null) => {
    setSelectedJobName(jobName)
    setSelectedStepNumber(null)
  }

  const addStep = async (appName: string) => {
    if (!selectedJobName) return

    try {
      await window.api.addStep({ jobName: selectedJobName, appName })
      const jobsData = await window.api.getJobsAndSteps()
      const jobData = jobsData.find((job) => job.jobName === selectedJobName)
      if (jobData) {
        setSteps((prevSteps) => [
          ...prevSteps.filter((step) => step.jobName !== selectedJobName),
          ...jobData.steps.map((step) => ({
            jobName: selectedJobName,
            stepNumber: step.stepNumber,
            appName: step.appName
          }))
        ])
      }
    } catch (error) {
      console.error('Error adding step:', error)
    }
  }

  const deleteStep = async (stepNumber: number) => {
    if (!selectedJobName) return

    try {
      await window.api.deleteStep(selectedJobName, stepNumber)
      setSteps(
        steps.filter(
          (step) => !(step.jobName === selectedJobName && step.stepNumber === stepNumber)
        )
      )
      if (selectedStepNumber === stepNumber) {
        setSelectedStepNumber(null)
      }
    } catch (error) {
      console.error('Error deleting step:', error)
    }
  }

  const selectStep = (stepNumber: number | null) => {
    setSelectedStepNumber(stepNumber)
  }

  return (
    <JobsContext.Provider
      value={{
        jobs,
        steps: steps.filter((step) => step.jobName === selectedJobName),
        selectedJobName,
        selectedStepNumber,
        addJob,
        deleteJob,
        selectJob,
        addStep,
        deleteStep,
        selectStep
      }}
    >
      {children}
    </JobsContext.Provider>
  )
}

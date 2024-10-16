// JobsContext.tsx
import React, { createContext, useContext, useState } from 'react';

export interface Job {
    id: number;
    title: string;
    enabled: boolean;
}

export interface Step {
    id: number;
    jobId: number;
    name: string;
    version: string;
    github: string;
    zipDownload: string;
    enabled: boolean;
}

// New type for available steps from GitHub
export interface AvailableStep {
    name: string;
    version: string;
    github: string;
    zipDownload: string;
}

interface JobsContextType {
    jobs: Job[];
    steps: Step[];
    selectedJobId: number | null;
    selectedStepId: number | null;
    // Job functions
    addJob: () => void;
    deleteJob: (id: number) => void;
    toggleJobEnabled: (id: number) => void;
    updateJobTitle: (id: number, title: string) => void;
    selectJob: (id: number | null) => void;
    // Step functions
    addStep: (stepData: AvailableStep) => Promise<void>;
    deleteStep: (id: number) => void;
    toggleStepEnabled: (id: number) => void;
    updateStepDetail: (id: number, field: keyof Step, value: any) => void;
    selectStep: (id: number | null) => void;
    updateStepTitle: (id: number, title: string) => void;
}

const JobsContext = createContext<JobsContextType>({} as JobsContextType);

export const useJobs = () => useContext(JobsContext);

type Props = {
    children?: React.ReactNode;
};

export const JobsProvider: React.FC<Props> = ({ children }) => {
    const [jobs, setJobs] = useState<Job[]>([
        { id: 1, title: 'Job 1', enabled: true },
        { id: 2, title: 'Job 2', enabled: false },
    ]);

    const [steps, setSteps] = useState<Step[]>([]);

    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [selectedStepId, setSelectedStepId] = useState<number | null>(null);

    // Job management functions
    const addJob = () => {
        const newId = jobs.length > 0 ? jobs[jobs.length - 1].id + 1 : 1;
        const newJob: Job = {
            id: newId,
            title: `Job ${newId}`,
            enabled: true,
        };
        setJobs([...jobs, newJob]);
    };

    const deleteJob = (id: number) => {
        setJobs(jobs.filter((job) => job.id !== id));
        setSteps(steps.filter((step) => step.jobId !== id));
        if (selectedJobId === id) {
            setSelectedJobId(null);
        }
    };

    const toggleJobEnabled = (id: number) => {
        setJobs(
            jobs.map((job) =>
                job.id === id ? { ...job, enabled: !job.enabled } : job
            )
        );
    };

    const updateJobTitle = (id: number, title: string) => {
        setJobs(
            jobs.map((job) => (job.id === id ? { ...job, title } : job))
        );
    };

    const selectJob = (id: number | null) => {
        setSelectedJobId(id);
        setSelectedStepId(null);
    };

    // Step management functions
    const addStep = async (stepData: AvailableStep) => {
        if (selectedJobId === null) return;

        const result = await window.api.addStep(stepData);

        if (result.success) {
            const newId = steps.length > 0 ? steps[steps.length - 1].id + 1 : 1;
            const newStep: Step = {
                id: newId,
                jobId: selectedJobId,
                enabled: true,
                ...stepData,
            };
            setSteps([...steps, newStep]);
            console.log(`App ${stepData.name} added successfully.`);
        } else {
            console.error('Error adding step:', result.error);
        }
    };

    const deleteStep = (id: number) => {
        setSteps(steps.filter((step) => step.id !== id));
        if (selectedStepId === id) {
            setSelectedStepId(null);
        }
    };

    const toggleStepEnabled = (id: number) => {
        setSteps(
            steps.map((step) =>
                step.id === id ? { ...step, enabled: !step.enabled } : step
            )
        );
    };

    const updateStepTitle = (id: number, title: string) => {
        setSteps(
            steps.map((step) => (step.id === id ? { ...step, title } : step))
        );
    };

    const selectStep = (id: number | null) => {
        setSelectedStepId(id);
    };

    const updateStepDetail = (
        id: number,
        field: keyof Step,
        value: any
    ) => {
        setSteps(
            steps.map((step) =>
                step.id === id ? { ...step, [field]: value } : step
            )
        );
    };

    return (
        <JobsContext.Provider
            value={{
                jobs,
                steps,
                selectedJobId,
                selectedStepId,
                addJob,
                deleteJob,
                toggleJobEnabled,
                updateJobTitle,
                selectJob,
                addStep,
                deleteStep,
                toggleStepEnabled,
                updateStepTitle,
                selectStep,
                updateStepDetail,
            }}
        >
            {children}
        </JobsContext.Provider>
    );
};

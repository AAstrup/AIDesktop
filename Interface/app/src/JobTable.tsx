// JobTable.tsx
import React, { useState } from 'react';
import { Job } from './types';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';

const JobTable: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([
        { id: 1, title: 'Job 1', enabled: true },
        { id: 2, title: 'Job 2', enabled: false },
    ]);

    // Function to add a new job
    const addJob = () => {
        const newJob: Job = {
            id: Date.now(),
            title: `Job ${jobs.length + 1}`,
            enabled: false,
        };
        setJobs([...jobs, newJob]);
    };

    // Function to delete a job
    const deleteJob = (id: number) => {
        setJobs(jobs.filter((job) => job.id !== id));
    };

    // Function to toggle the 'enabled' status
    const toggleJobEnabled = (id: number) => {
        setJobs(
            jobs.map((job) =>
                job.id === id ? { ...job, enabled: !job.enabled } : job
            )
        );
    };

    // Function to update the job title
    const updateJobTitle = (id: number, newTitle: string) => {
        setJobs(
            jobs.map((job) =>
                job.id === id ? { ...job, title: newTitle } : job
            )
        );
    };

    return (
        <div className="space-y-4">
            <div className="w-full overflow-x-auto">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-20">Enabled</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={job.enabled}
                                        onCheckedChange={() => toggleJobEnabled(job.id)}
                                        className="border border-gray-400 bg-white checked:bg-black checked:border-black"
                                    />
                                </TableCell>
                                <TableCell>
                                    <input
                                        type="text"
                                        value={job.title}
                                        onChange={(e) => updateJobTitle(job.id, e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded"
                                    />
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                ...
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onSelect={() => deleteJob(job.id)}>
                                                <TrashIcon className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className='flex items-center justify-center'>
                <Button onClick={addJob} variant="outline">
                    <PlusIcon />
                </Button>
            </div>
        </div>
    );
};

export default JobTable;

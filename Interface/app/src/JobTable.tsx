// JobTable.tsx
import React from 'react';
import { useJobs } from './JobsContext';
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
import Steps from './Steps';
import StepDetails from './StepDetails';

const JobTable: React.FC = () => {
    const {
        jobs,
        addJob,
        deleteJob,
        toggleJobEnabled,
        updateJobTitle,
        selectedJobId,
        selectJob,
    } = useJobs();

    const handleRowClick = (id: number) => {
        if (selectedJobId === id) {
            selectJob(null);
        } else {
            selectJob(id);
        }
    };

    return (
        <div className="flex space-x-4">
            <div className={selectedJobId ? 'flex flex-col' : 'flex-grow flex-col'}>
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            {!selectedJobId && (
                                <>
                                    <TableHead className="w-20">Enabled</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.map((job) => (
                            <TableRow
                                key={job.id}
                                onClick={() => handleRowClick(job.id)}
                                className={`cursor-pointer ${selectedJobId === job.id ? 'bg-gray-100' : ''
                                    }`}
                            >
                                <TableCell>
                                    <input
                                        type="text"
                                        value={job.title}
                                        onChange={(e) => updateJobTitle(job.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full px-2 py-1 border border-gray-300 rounded"
                                    />
                                </TableCell>
                                {!selectedJobId && (
                                    <>
                                        <TableCell>
                                            <Checkbox
                                                checked={job.enabled}
                                                onCheckedChange={() => toggleJobEnabled(job.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
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
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-center mt-2">
                    <Button onClick={addJob} variant="outline">
                        <PlusIcon />
                    </Button>
                </div>
            </div>
            {selectedJobId && (
                <>
                    <Steps />
                    <StepDetails />
                </>
            )}
        </div>
    );
};

export default JobTable;

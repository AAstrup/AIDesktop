// Steps.tsx
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
import { TrashIcon } from '@radix-ui/react-icons';
import StepComboBox from './StepComboBox';

const Steps: React.FC = () => {
    const {
        steps,
        deleteStep,
        toggleStepEnabled,
        selectedJobId,
        selectStep,
        selectedStepId,
    } = useJobs();

    // Filter steps for the selected job
    const jobSteps = steps.filter((step) => step.jobId === selectedJobId);

    return (
        <div className="flex flex-col">
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead className="w-20">Enabled</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobSteps.map((step) => (
                        <TableRow
                            key={step.id}
                            onClick={() => handleRowClick(step.id)}
                            className={`cursor-pointer ${selectedStepId === step.id ? 'bg-gray-100' : ''
                                }`}
                        >
                            <TableCell>
                                {step.name}
                            </TableCell>
                            <TableCell>
                                {step.version}
                            </TableCell>
                            <TableCell>
                                <Checkbox
                                    checked={step.enabled}
                                    onCheckedChange={() => toggleStepEnabled(step.id)}
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
                                        <DropdownMenuItem onSelect={() => deleteStep(step.id)}>
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
            <div className="flex items-center justify-center mt-2">
                <StepComboBox />
            </div>
        </div>
    );

    function handleRowClick(id: number) {
        if (selectedStepId === id) {
            selectStep(null);
        } else {
            selectStep(id);
        }
    }
};

export default Steps;
